// audio_engine.js — Headless Space Sim
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
    noiseBuf: null,  // shared 1 s white-noise buffer for explosions/thuds/hiss
    assetBufs: {},   // decoded AudioBuffers from audio_assets.js, keyed by name

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

        // A short quiet tone so the first real sound does not stutter.
        var g = A.ctx.createGain(); g.gain.value = 0.0001; g.connect(A.ctx.destination);
        var o = A.ctx.createOscillator(); o.frequency.value = 440;
        o.connect(g); o.start(); o.stop(A.ctx.currentTime + 0.03);

        A.noiseBuf = A.ctx.createBuffer(1, A.ctx.sampleRate, A.ctx.sampleRate);
        var d = A.noiseBuf.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

        A.decodeAssets();
    },

    // Decode the base64 MP3s from audio_assets.js into AudioBuffers. No
    // fetch — fetch of anything is unreliable on a file:// page — just
    // atob into bytes. Once the game is served over https (GitHub Pages),
    // this can grow a fetch-based path alongside this one; see
    // SPEC.md 3.2.
    decodeAssets: function () {
        var A = SIM.audio;
        if (!A.ctx || !window.AUDIO_ASSETS) return;
        Object.keys(window.AUDIO_ASSETS).forEach(function (name) {
            try {
                var bin = atob(window.AUDIO_ASSETS[name].split(',')[1]);
                var bytes = new Uint8Array(bin.length);
                for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                A.ctx.decodeAudioData(bytes.buffer,
                    function (buf) { A.assetBufs[name] = buf; },
                    function () { /* decode failed; assetsReady() stays false */ });
            } catch (e) {}
        });
    },

    // Readiness gate for the mining asteroid loops + explosions specifically
    // (the only assets a mission start currently blocks on). As more named
    // assets get wired in this may want a `names` param instead of a fixed
    // list — left as-is for now to keep this move behavior-identical.
    assetsReady: function () {
        var b = SIM.audio.assetBufs;
        return !!(b.asteroid1 && b.asteroid2 && b.asteroid3 &&
                  b.asteroid_explosion1 && b.asteroid_explosion2 && b.asteroid_explosion3);
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

    // A throwaway HRTF panner at a world position that cleans itself up.
    worldOut: function (pos, ms) {
        var A = SIM.audio;
        if (!A.ctx) return null;
        var p = A.makePanner(pos);
        p.connect(A.masterGain);
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
        g.gain.setValueAtTime(o.vol || 0.15, t0);
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
        g.gain.setValueAtTime(o.vol || 0.2, t0);
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
        gain.gain.setValueAtTime(o.vol || 0.15, t0);
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
        gain.gain.setValueAtTime(o.vol || 0.1, t0);
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
    // isn't ready so callers can fall back to a generated cue.
    playAsset: function (name, vol, out) {
        var A = SIM.audio;
        if (!A.ctx || !A.assetBufs[name]) return false;
        var src = A.ctx.createBufferSource(); src.buffer = A.assetBufs[name];
        var g = A.ctx.createGain(); g.gain.value = vol || 0.3;
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
