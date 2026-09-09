// audio_engine.js — The Silence (working name: Headless Space Sim)
//
// The generic Web Audio layer: context/bus setup, the recorded-asset bank,
// and the small set of generative primitives (tone, noise, chord, arpeggio,
// echo, sweep) everything else builds sounds from. Same vocabulary as the
// Bunker Audio Laboratory testers (.soundtester v2.0.html here, ag's
// .golf_soundbank_tester, afish's afish_synth_tester.html) and as ag's and
// kc's own audio engines — this file is that palette, pulled out into its
// own module and namespaced as SIM.audio (the KC.audio / BASE.audio
// convention from Brian's other projects) now that the game is outgrowing
// one file.
//
// This module knows NOTHING about gameplay. It has no idea what a laser or
// a shield is — it only knows how to make a tone, a noise burst, a chord,
// an echo, a sweep, or play back a decoded recording, optionally through a
// caller-supplied `out` node (an HRTF panner for a 3D world event, or the
// stereo instrument bus for a cockpit sound). SECTION 5 of index.html still
// owns everything that's actually shaped by live simulation state — ship/
// rock/beacon voices, the laser beam, the lock tick, thrusters — because
// those aren't "cues" in the play-once sense, they're continuous audio that
// tracks a running number every frame. audio_cues.js is the layer above
// this one that gives discrete one-shot sounds a stable name.
//
// Internal calls all go through the full SIM.audio.xxx path rather than
// bare local names, on purpose: several of these functions get handed to
// setTimeout as callbacks, and the explicit path sidesteps any question of
// what `this` is bound to (same reason KC.audio / BASE.audio do it).

window.SIM = window.SIM || {};

SIM.audio = {
    // ---- state ----------------------------------------------------------
    ctx: null,
    masterGain: null,
    uiBus: null,     // stereo, not HRTF — cockpit instruments (tick, tools, thrusters)
    worldBus: null,  // every HRTF panner lands here — the "World" sound level (SPEC 1.12)
    volScale: 1,     // multiplies every primitive's vol; SIM.cues.play sets it around a cue
    noiseBuf: null,  // shared 1 s white-noise buffer for explosions/thuds/hiss
    assetBufs: {},   // decoded AudioBuffers, keyed by AUDIO_MANIFEST name
    pending: {},     // in-flight load() promises, keyed by name
    warned: {},      // names already console.warn'd once, so a missing/404
                      // asset doesn't spam every time something asks for it
    musicBus: null,  // ambient tracks (SPEC 2.19); no track plays yet

    // ---- boot -------------------------------------------------------------
    audioStart: function () {
        var A = SIM.audio;
        try {
            var Ctx = window.AudioContext || window.webkitAudioContext;
            if (Ctx) A.ctx = new Ctx();
        } catch (e) { A.ctx = null; }
        if (!A.ctx) return;

        A.masterGain = A.ctx.createGain();
        A.masterGain.gain.value = CFG.masterGain;
        A.masterGain.connect(A.ctx.destination);

        A.uiBus = A.ctx.createGain();
        A.uiBus.gain.value = 1;
        A.uiBus.connect(A.masterGain);

        A.worldBus = A.ctx.createGain();
        A.worldBus.gain.value = 1;
        A.worldBus.connect(A.masterGain);

        A.musicBus = A.ctx.createGain();
        A.musicBus.gain.value = 1;
        A.musicBus.connect(A.masterGain);

        // A short quiet tone so the first real sound does not stutter.
        var g = A.ctx.createGain(); g.gain.value = 0.0001; g.connect(A.ctx.destination);
        var o = A.ctx.createOscillator(); o.frequency.value = 440;
        o.connect(g); o.start(); o.stop(A.ctx.currentTime + 0.03);

        A.noiseBuf = A.ctx.createBuffer(1, A.ctx.sampleRate, A.ctx.sampleRate);
        var d = A.noiseBuf.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

        // SPEC 2.19: fetch every recording the demo can reach, in the
        // background — the page is interactive immediately, sounds arrive
        // as their fetches land rather than all at once before boot.
        A.preload(window.AUDIO_PRELOAD || []);
    },

    // Fetch + decode one manifest entry. Returns a Promise resolving to the
    // AudioBuffer. Cached once decoded (repeat calls resolve immediately);
    // coalesced while in flight (two callers mid-fetch share one request).
    // A missing key or a failed fetch/decode rejects, warns ONCE per name,
    // and leaves assetBufs[name] unset — every existing "no buffer ->
    // synthesized fallback" call site keeps working exactly as it does
    // today, just with a chance the real recording lands moments later.
    load: function (name) {
        var A = SIM.audio;
        if (A.assetBufs[name]) return Promise.resolve(A.assetBufs[name]);
        if (A.pending[name]) return A.pending[name];
        var path = window.AUDIO_MANIFEST && window.AUDIO_MANIFEST[name];
        if (!A.ctx || !path) return Promise.reject(new Error('no such asset: ' + name));
        var p = fetch(encodeURI(path))
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.arrayBuffer();
            })
            .then(function (data) { return A.ctx.decodeAudioData(data); })
            .then(function (buf) {
                A.assetBufs[name] = buf;
                delete A.pending[name];
                return buf;
            })
            .catch(function (err) {
                delete A.pending[name];
                if (!A.warned[name]) {
                    A.warned[name] = true;
                    if (window.console) console.warn('SIM.audio.load: ' + name + ' failed (' + err.message + ')');
                }
                throw err;
            });
        A.pending[name] = p;
        return p;
    },

    // Fire-and-forget a batch of loads (a mission's own asset list, the
    // boot preload set); never rejects, so one missing/404 file can't
    // stop the rest from loading.
    preload: function (names) {
        return Promise.all((names || []).map(function (n) {
            return SIM.audio.load(n).catch(function () {});
        }));
    },

    // Synchronous readiness check: every named key already has a decoded
    // buffer. Used to gate a mission start on assets it can't do without.
    ready: function (names) {
        var b = SIM.audio.assetBufs;
        return (names || []).every(function (n) { return !!b[n]; });
    },

    // Readiness gate for the mining asteroid loops + explosions specifically
    // (the only assets a mission start currently blocks on).
    assetsReady: function () {
        return SIM.audio.ready(['asteroid1', 'asteroid2', 'asteroid3',
            'asteroid_explosion1', 'asteroid_explosion2', 'asteroid_explosion3']);
    },

    // Ambient music (SPEC 2.19): loads (or reuses) a manifest key, loops it
    // on the music bus, and crossfades out whatever was already playing.
    // No track plays anywhere yet — this is the hook for when one does.
    musicNode: null,
    playMusic: function (name, opts) {
        var A = SIM.audio;
        opts = opts || {};
        var vol = opts.vol !== undefined ? opts.vol : 0.3;
        var fadeS = opts.fadeS !== undefined ? opts.fadeS : 1.5;
        var prev = A.musicNode;
        A.load(name).then(function (buf) {
            if (!A.ctx) return;
            var src = A.ctx.createBufferSource();
            src.buffer = buf; src.loop = true;
            var g = A.ctx.createGain(); g.gain.value = 0.0001;
            src.connect(g); g.connect(A.musicBus);
            src.start();
            A.ramp(g.gain, vol, fadeS);
            A.musicNode = { src: src, g: g };
            if (prev) {
                A.ramp(prev.g.gain, 0.0001, fadeS);
                setTimeout(function () { try { prev.src.stop(); prev.g.disconnect(); } catch (e) {} }, fadeS * 1000 + 200);
            }
        });
    },
    stopMusic: function (fadeS) {
        var A = SIM.audio, n = A.musicNode;
        if (!n) return;
        A.musicNode = null;
        fadeS = fadeS !== undefined ? fadeS : 1.5;
        A.ramp(n.g.gain, 0.0001, fadeS);
        setTimeout(function () { try { n.src.stop(); n.g.disconnect(); } catch (e) {} }, fadeS * 1000 + 200);
    },

    // Sound-options levels (SPEC 1.12): 'world' is the HRTF bus, 'cockpit'
    // the UI bus. Effects are a per-cue multiplier owned by SIM.cues.
    // setTargetAtTime rather than ramp(): a level can change again while the
    // previous change is still in flight (Left, Left, Right), and the
    // cancel + setValueAtTime(param.value) idiom can leave the param holding
    // an intermediate value in that case. setTargetAtTime starts from
    // wherever the param actually is and always converges on the target.
    setBusLevel: function (name, value) {
        var A = SIM.audio;
        var bus = name === 'world' ? A.worldBus : name === 'cockpit' ? A.uiBus :
                  name === 'music' ? A.musicBus : null;
        if (bus && A.ctx) bus.gain.setTargetAtTime(value, A.ctx.currentTime, 0.06);
    },

    // ---- param + panner helpers -------------------------------------------
    // Smoothly move an AudioParam. cancel + set + linear ramp is the
    // standard idiom; assigning .value every frame produces zipper clicks.
    ramp: function (param, value, seconds) {
        var A = SIM.audio;
        if (!A.ctx) return;
        var t = A.ctx.currentTime;
        param.cancelScheduledValues(t);
        param.setValueAtTime(param.value, t);
        param.linearRampToValueAtTime(value, t + (seconds || 0.06));
    },

    makePanner: function (pos) {
        var A = SIM.audio;
        var p = A.ctx.createPanner();
        p.panningModel = 'HRTF';
        p.distanceModel = 'inverse';
        p.refDistance = CFG.refDistance;
        p.maxDistance = CFG.maxDistance;
        p.rolloffFactor = CFG.rolloff;
        if (p.positionX) {
            p.positionX.value = pos.x; p.positionY.value = pos.y; p.positionZ.value = pos.z;
        } else if (p.setPosition) {
            p.setPosition(pos.x, pos.y, pos.z);
        }
        return p;
    },

    movePanner: function (p, pos) {
        var A = SIM.audio;
        if (p.positionX) {
            A.ramp(p.positionX, pos.x); A.ramp(p.positionY, pos.y); A.ramp(p.positionZ, pos.z);
        } else if (p.setPosition) {
            p.setPosition(pos.x, pos.y, pos.z);
        }
    },

    // A panner's facing direction, set directly (no ramp — every caller
    // already drives this every frame, and a ramp would just lag it).
    // Shared by the gate's own sweep (Phase 3L, L.9) and the enemy facing
    // cone (SPEC 3.58).
    setOrientation: function (p, ox, oy, oz) {
        if (p.orientationX) {
            p.orientationX.value = ox; p.orientationY.value = oy; p.orientationZ.value = oz;
        } else if (p.setOrientation) {
            p.setOrientation(ox, oy, oz);
        }
    },

    // A throwaway HRTF panner at a world position that cleans itself up.
    worldOut: function (pos, ms) {
        var A = SIM.audio;
        if (!A.ctx) return null;
        var p = A.makePanner(pos);
        p.connect(A.worldBus);
        setTimeout(function () { try { p.disconnect(); } catch (e) {} }, ms + 400);
        return p;
    },

    // ---- SFX primitives ---------------------------------------------------
    // Same fire-and-forget generator palette as the Bunker Audio Laboratory
    // and the ag / kc audio engines. Every primitive takes an optional
    // `out` node, so the identical vocabulary plays either on the stereo
    // instrument bus (cockpit sounds) or through an HRTF panner at a world
    // position (3D events) — the one upgrade this project made on the
    // shared palette.

    // A gain of exactly 0 breaks exponential ramps, so an Off level still
    // schedules a (silent) 0.0001.
    scaledVol: function (v) { return Math.max(0.0001, v * SIM.audio.volScale); },

    // Resolve the destination: explicit node > stereo pan on the UI bus > UI bus.
    sfxOut: function (o) {
        var A = SIM.audio;
        if (o && o.out) return o.out;
        if (o && o.pan && A.ctx.createStereoPanner) {
            var sp = A.ctx.createStereoPanner();
            sp.pan.value = clamp(o.pan, -1, 1);
            sp.connect(A.uiBus);
            return sp;
        }
        return A.uiBus;
    },

    // Tone with optional frequency glide: sfxTone({type,f1,f2,dur,vol,at,pan,out})
    sfxTone: function (o) {
        var A = SIM.audio;
        if (!A.ctx) return;
        var t0 = A.ctx.currentTime + (o.at || 0);
        var g = A.ctx.createGain();
        g.gain.setValueAtTime(A.scaledVol(o.vol || 0.15), t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + o.dur);
        g.connect(A.sfxOut(o));
        var osc = A.ctx.createOscillator();
        osc.type = o.type || 'sine';
        osc.frequency.setValueAtTime(o.f1, t0);
        if (o.f2) {
            try { osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.dur); }
            catch (e) { osc.frequency.setValueAtTime(o.f2, t0 + o.dur); }
        }
        osc.connect(g);
        osc.start(t0); osc.stop(t0 + o.dur + 0.02);
    },

    // Filtered noise burst: sfxNoise({dur,vol,filter,freq,q,at,pan,out})
    sfxNoise: function (o) {
        var A = SIM.audio;
        if (!A.ctx) return;
        var t0 = A.ctx.currentTime + (o.at || 0);
        var src = A.ctx.createBufferSource(); src.buffer = A.noiseBuf;
        var g = A.ctx.createGain();
        g.gain.setValueAtTime(A.scaledVol(o.vol || 0.2), t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + o.dur);
        var tail = src;
        if (o.freq) {
            var f = A.ctx.createBiquadFilter();
            f.type = o.filter || 'lowpass';
            f.frequency.value = o.freq;
            if (o.q) f.Q.value = o.q;
            src.connect(f); tail = f;
        }
        tail.connect(g); g.connect(A.sfxOut(o));
        src.start(t0); src.stop(t0 + o.dur + 0.05);
    },

    // Tone with a delayed, decaying echo tail (a real DelayNode + feedback
    // loop, not just a second offset tone) — ported from
    // .soundtester v2.0.html's playEcho, the same shape ag's golf_audio_bank
    // 'echo' recipe expects: sfxEcho({type,f1,f2,dur,vol,delay,at,pan,out})
    sfxEcho: function (o) {
        var A = SIM.audio;
        if (!A.ctx) return;
        var t0 = A.ctx.currentTime + (o.at || 0);
        var osc = A.ctx.createOscillator(), gain = A.ctx.createGain();
        var delayNode = A.ctx.createDelay(), feedback = A.ctx.createGain();
        osc.type = o.type || 'sine';
        osc.frequency.setValueAtTime(o.f1, t0);
        if (o.f2) {
            try { osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.dur); }
            catch (e) { osc.frequency.setValueAtTime(o.f2, t0 + o.dur); }
        }
        gain.gain.setValueAtTime(A.scaledVol(o.vol || 0.15), t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + o.dur);
        delayNode.delayTime.value = o.delay || 0.12;
        feedback.gain.value = 0.4;
        var out = A.sfxOut(o);
        osc.connect(gain); gain.connect(out);
        gain.connect(delayNode); delayNode.connect(feedback);
        feedback.connect(delayNode); delayNode.connect(out);
        osc.start(t0); osc.stop(t0 + o.dur + 0.02);
    },

    // Three-point frequency sweep, f1 -> f2 at the midpoint -> f3 at the
    // end — ported from .soundtester v2.0.html's playSweep, extended (as
    // ag's golf_audio_bank 'sweep' recipe already assumes) to take vol/type:
    // sfxSweep({f1,f2,f3,dur,vol,type,at,pan,out})
    sfxSweep: function (o) {
        var A = SIM.audio;
        if (!A.ctx) return;
        var t0 = A.ctx.currentTime + (o.at || 0);
        var osc = A.ctx.createOscillator(), gain = A.ctx.createGain();
        osc.type = o.type || 'sawtooth';
        osc.frequency.setValueAtTime(o.f1, t0);
        osc.frequency.linearRampToValueAtTime(o.f2, t0 + o.dur / 2);
        osc.frequency.linearRampToValueAtTime(o.f3, t0 + o.dur);
        gain.gain.setValueAtTime(A.scaledVol(o.vol || 0.1), t0);
        gain.gain.linearRampToValueAtTime(0.001, t0 + o.dur);
        osc.connect(gain); gain.connect(A.sfxOut(o));
        osc.start(t0); osc.stop(t0 + o.dur + 0.02);
    },

    // Chord and arpeggio, straight from the Bunker Lab vocabulary.
    sfxChord: function (freqs, dur, vol, o) {
        var A = SIM.audio;
        freqs.forEach(function (f) {
            A.sfxTone(Object.assign({ f1: f, dur: dur, vol: vol / freqs.length }, o || {}));
        });
    },
    sfxArpeggio: function (freqs, noteDur, vol, o) {
        var A = SIM.audio;
        freqs.forEach(function (f, i) {
            A.sfxTone(Object.assign({ f1: f, dur: noteDur * 1.5, vol: vol,
                                       at: i * noteDur }, o || {}));
        });
    },

    // Compatibility wrapper used by the tick scheduler and small cues.
    blip: function (freq, ms, gainVal, pan, type) {
        SIM.audio.sfxTone({ type: type || 'sine', f1: freq, dur: ms / 1000, vol: gainVal, pan: pan || 0 });
    },

    // One-shot playback of a decoded recording. Returns false if the asset
    // isn't ready so callers can fall back to a generated cue — and kicks
    // off a load for next time (SPEC 2.19), same as every other direct
    // assetBufs reader in index.html.
    playAsset: function (name, vol, out) {
        var A = SIM.audio;
        if (!A.ctx) return false;
        if (!A.assetBufs[name]) { A.load(name); return false; }
        var src = A.ctx.createBufferSource(); src.buffer = A.assetBufs[name];
        var g = A.ctx.createGain(); g.gain.value = A.scaledVol(vol || 0.3);
        src.connect(g); g.connect(out || A.uiBus);
        src.start();
        return true;
    },

    // Generic thud / pop at a world position (missile self-destruct, laser splash).
    noiseBurst: function (pos, ms, gainVal, cutoff) {
        var A = SIM.audio;
        var out = A.worldOut(pos, ms);
        if (!out) return;
        A.sfxNoise({ dur: ms / 1000, vol: gainVal, filter: 'lowpass', freq: cutoff, out: out });
    }
};

// ---- SIM.music (SPEC 3.80) -------------------------------------------------
// The background music player — KC's own kc_bgm.js shape (KC.bgm in that
// codebase's idiom), reviewed in full and copied deliberately: a
// MUSIC_STYLES table of named playlists (audio_assets.js), a grab-bag
// shuffle so every track plays once before any repeat, and a crossfade
// between two audio sources on every track change. One real departure from
// KC: KC streams through two plain <audio> elements and moves their own
// .volume property directly; fifteen ~5 MB tracks fully decoded (the way
// SIM.audio.playMusic's own bed/interior tracks are) would be hundreds of
// megabytes of RAM, so this player keeps KC's streaming shape but routes
// each <audio> element through a MediaElementAudioSourceNode into its own
// GainNode and from there into SIM.audio.musicBus — the same bus the bed
// and the docked interior already share — so the Sound menu's Music level,
// the mute switch, and the turret's own duck all apply to this for free,
// which a bare .volume property never could.
//
// History + cursor, not a pure one-way bag: `order` is the sequence of
// tracks actually played this session, `cursor` points at the current one.
// Advancing past the end of `order` draws a genuinely new track from the
// shuffled `bag`; advancing within `order` (after a `previous()`) just
// replays what was already drawn — this is what gives `previous()` real
// memory instead of a shuffle with no way back.
SIM.music = {
    a: null, b: null,           // the two streaming <audio> elements
    srcA: null, srcB: null,     // their MediaElementAudioSourceNodes
    gA: null, gB: null,         // per-track GainNode, into SIM.audio.musicBus
    active: null,               // 'a' | 'b' | null — which element is audible now
    style: 'celestial',
    bag: [],                    // shuffled, not-yet-played-this-cycle track keys
    order: [],                  // every track actually played, in play order
    cursor: -1,                 // index into order — the current track
    on: false,
    onTrackStart: null,         // set by index.html: function(name) {...}

    // Lazy, idempotent — needs SIM.audio.ctx to already exist (called after
    // audioStart(), inside the same user gesture or later).
    init: function () {
        var M = SIM.music, A = SIM.audio;
        if (M.a || !A.ctx) return;
        M.a = new Audio(); M.b = new Audio();
        M.a.preload = 'auto'; M.b.preload = 'auto';
        M.srcA = A.ctx.createMediaElementSource(M.a);
        M.srcB = A.ctx.createMediaElementSource(M.b);
        M.gA = A.ctx.createGain(); M.gA.gain.value = 0.0001;
        M.gB = A.ctx.createGain(); M.gB.gain.value = 0.0001;
        M.srcA.connect(M.gA); M.gA.connect(A.musicBus);
        M.srcB.connect(M.gB); M.gB.connect(A.musicBus);
        // Next-on-ended: KC's own shape. Guarded on M.on so a stop() that
        // hasn't finished pausing yet can't restart playback.
        M.a.addEventListener('ended', function () { if (M.on) M.next(); });
        M.b.addEventListener('ended', function () { if (M.on) M.next(); });
    },

    _shuffle: function (arr) {
        arr = arr.slice();
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
    },

    _refillBag: function () {
        var M = SIM.music;
        var list = (window.MUSIC_STYLES && window.MUSIC_STYLES[M.style]) || [];
        M.bag = M._shuffle(list);
    },

    // Pop one never-yet-played (this cycle) track; refills and reshuffles
    // once the bag runs dry, so every track plays once before any repeat.
    _nextNewTrack: function () {
        var M = SIM.music;
        if (!M.bag.length) M._refillBag();
        return M.bag.pop();
    },

    // Crossfade from whichever element is active onto `name` on the OTHER
    // element, over CFG.musicCrossfadeS (2 s, SPEC 3.80). Fires onTrackStart
    // once the new element has actually been told to play.
    _crossTo: function (name) {
        var M = SIM.music, A = SIM.audio;
        var path = window.AUDIO_MANIFEST && window.AUDIO_MANIFEST[name];
        if (!A.ctx || !path) return;
        var fadeS = (window.CFG && CFG.musicCrossfadeS !== undefined) ? CFG.musicCrossfadeS : 2;
        var vol = (window.CFG && CFG.musicTrackVol !== undefined) ? CFG.musicTrackVol : 0.35;
        var goingTo = M.active === 'a' ? 'b' : 'a';
        var el = goingTo === 'a' ? M.a : M.b;
        var g = goingTo === 'a' ? M.gA : M.gB;
        var fromEl = M.active === 'a' ? M.a : (M.active === 'b' ? M.b : null);
        var fromG = M.active === 'a' ? M.gA : (M.active === 'b' ? M.gB : null);
        el.src = encodeURI(path);
        el.currentTime = 0;
        var playP = el.play();
        if (playP && playP.catch) playP.catch(function () {});
        A.ramp(g.gain, vol, fadeS);
        if (fromG) A.ramp(fromG.gain, 0.0001, fadeS);
        if (fromEl) setTimeout(function () { try { fromEl.pause(); } catch (e) {} }, fadeS * 1000 + 200);
        M.active = goingTo;
        if (M.onTrackStart) M.onTrackStart(name);
    },

    // Starts playback. `trackOverride` (only meaningful on the very first
    // call, before anything has been drawn) resumes a specific track — the
    // saved profile.music.idx — instead of drawing a fresh random one, so a
    // reload picks back up near where it left off rather than reshuffling.
    start: function (styleOverride, trackOverride) {
        var M = SIM.music;
        M.init();
        if (!SIM.audio.ctx) return null;
        if (styleOverride) M.style = styleOverride;
        M.on = true;
        var name;
        if (M.cursor >= 0 && M.order[M.cursor]) {
            name = M.order[M.cursor];
        } else if (trackOverride && (window.MUSIC_STYLES[M.style] || []).indexOf(trackOverride) >= 0) {
            name = trackOverride;
            M.order.push(name);
            M.cursor = M.order.length - 1;
        } else {
            name = M._nextNewTrack();
            M.order.push(name);
            M.cursor = M.order.length - 1;
        }
        M._crossTo(name);
        return name;
    },

    stop: function () {
        var M = SIM.music, A = SIM.audio;
        M.on = false;
        var fadeS = (window.CFG && CFG.musicCrossfadeS !== undefined) ? CFG.musicCrossfadeS : 2;
        var g = M.active === 'a' ? M.gA : (M.active === 'b' ? M.gB : null);
        var el = M.active === 'a' ? M.a : (M.active === 'b' ? M.b : null);
        if (g) A.ramp(g.gain, 0.0001, fadeS);
        if (el) setTimeout(function () { try { el.pause(); } catch (e) {} }, fadeS * 1000 + 200);
    },

    // Advances forward. If `previous()` had rewound the cursor, this just
    // replays the already-drawn next track instead of drawing a new one —
    // the "real memory" half of the history+cursor design.
    next: function () {
        var M = SIM.music;
        if (!M.on) return null;
        var name;
        if (M.cursor + 1 < M.order.length) {
            M.cursor++;
            name = M.order[M.cursor];
        } else {
            name = M._nextNewTrack();
            M.order.push(name);
            M.cursor = M.order.length - 1;
        }
        M._crossTo(name);
        return name;
    },

    previous: function () {
        var M = SIM.music;
        if (!M.on || M.cursor <= 0) return null;
        M.cursor--;
        var name = M.order[M.cursor];
        M._crossTo(name);
        return name;
    },

    // Switches playlists. Resets the bag/history — a different style has no
    // relationship to the old one's shuffle order — and, if already
    // playing, starts a fresh track from the new style at once.
    setStyle: function (style) {
        var M = SIM.music;
        if (!window.MUSIC_STYLES || !window.MUSIC_STYLES[style]) return;
        M.style = style;
        M.bag = [];
        M.order = [];
        M.cursor = -1;
        if (M.on) M.start();
    },

    currentTrack: function () {
        var M = SIM.music;
        return M.cursor >= 0 ? M.order[M.cursor] : null;
    },

    currentTitle: function () {
        var name = SIM.music.currentTrack();
        return name ? ((window.MUSIC_TITLES && window.MUSIC_TITLES[name]) || name) : null;
    }
};
