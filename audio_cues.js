// audio_cues.js — Headless Space Sim
//
// The discrete, one-shot "moment" layer: explosions, chimes, clicks,
// warnings — anything gameplay fires and forgets. This is the layer Brian
// asked for specifically: "almost all of the audio cues now will be
// replaced by engineered stuff." Gameplay code names a cue and calls
// SIM.cues.play(id, opts); it never builds a Web Audio graph itself. That
// means swapping a synthesized placeholder for a recorded/engineered sound
// later is a one-line edit HERE — change a cue's recipe to reference a
// decoded asset instead of a tone/noise recipe — with zero changes at any
// call site.
//
// This deliberately does NOT cover continuous, simulation-driven audio:
// engine loops, the laser beam's live pitch tracking, the lock tick, the
// missile's flight hum, thrusters. Those track a number that changes every
// frame, not a fixed envelope you fire once — no registry entry helps
// there, and they stay in index.html next to the state they're reading.
//
// Modeled on golf_audio_bank.js (c:\nbs\ag): cues grouped into categories,
// each entry carrying a `source` for provenance (here, 'v11-extraction' —
// ported verbatim out of index.html during this refactor, not authored
// fresh or pulled from a numbered tester button) and either a declarative
// {recipe, args} pair or a composite `fn` for anything with more than one
// moving part. One difference from golf's shape: golf's own primitives
// take positional arguments, so its `args` are an array; this project's
// SIM.audio primitives already take a single options OBJECT
// ({type,f1,f2,dur,vol,at,pan,out}), so `args` here is that same object
// shape — it merges directly with a call's `opts` with no positional
// mapping table needed.
//
// New recorded assets Brian is auditioning (audio/Explosions, audio/
// missiles, audio/warp, ...) do NOT appear here yet — on purpose. They
// aren't part of the game's audio_assets.js bank, so nothing here can even
// reference them. Auditioning those lives entirely in soundlab.html,
// played back with plain <audio> elements, outside this registry and
// outside the game — exactly "not connected yet."

window.SIM = window.SIM || {};

SIM.cues = (function () {
    var CATEGORIES = [
        {
            id: 'combat',
            label: 'Combat',
            cues: [
                { id: 'explosion_kill', name: 'Target Destroyed', source: 'v11-extraction',
                  // Filtered noise body + a low sine thump, positioned at the
                  // dying target so the blast itself is a 3D event.
                  fn: function (opts) {
                      var A = SIM.audio, pos = opts.pos;
                      var out = A.worldOut(pos, 900);
                      if (!out) return;
                      A.sfxNoise({ dur: 0.6, vol: 0.8, filter: 'lowpass', freq: 2500, out: out });
                      A.sfxTone({ type: 'sine', f1: 90, f2: 45, dur: 0.55, vol: 0.5, out: out });
                      A.sfxNoise({ dur: 0.35, vol: 0.25, filter: 'bandpass', freq: 700, q: 2, at: 0.05, out: out });
                  } },
                { id: 'chaff_burst', name: 'Chaff Burst', source: 'spec-1.8',
                  // A bright crackling burst at the ship (UI bus): a hiss of
                  // bright noise and a scatter of short clicks fanning out.
                  fn: function () {
                      var A = SIM.audio;
                      A.sfxNoise({ dur: 0.35, vol: 0.35, filter: 'highpass', freq: 3000 });
                      var ats = [0.02, 0.05, 0.09, 0.12, 0.17, 0.21, 0.28];
                      for (var i = 0; i < ats.length; i++) {
                          A.sfxNoise({ dur: 0.03, vol: 0.25, filter: 'bandpass', freq: 2200 + i * 500, q: 6,
                                       at: ats[i], pan: (i % 2 ? 1 : -1) * (0.2 + i * 0.1) });
                      }
                  } },
                { id: 'hull_hit', name: 'Hull Hit', source: 'v11-extraction',
                  fn: function () {
                      var A = SIM.audio;
                      A.sfxNoise({ dur: 0.25, vol: 0.5, filter: 'lowpass', freq: 600 });
                      A.sfxTone({ type: 'sine', f1: 80, f2: 40, dur: 0.3, vol: 0.4 });
                  } },
                { id: 'ship_destroyed', name: 'Own Ship Destroyed', source: 'v11-extraction',
                  fn: function () {
                      var A = SIM.audio;
                      A.sfxNoise({ dur: 1.3, vol: 0.9, filter: 'lowpass', freq: 1500 });
                      A.sfxTone({ type: 'sine', f1: 120, f2: 30, dur: 1.3, vol: 0.6 });
                  } },
                { id: 'lock_acquired', name: 'Target Lock Acquired', source: 'v11-extraction',
                  fn: function () {
                      SIM.audio.blip(660, 100, 0.15);
                      SIM.audio.sfxTone({ type: 'sine', f1: 880, dur: 0.12, vol: 0.15, at: 0.11 });
                  } },
                { id: 'lock_lost', name: 'Target Lock Lost', source: 'v11-extraction',
                  recipe: 'tone', args: { type: 'sine', f1: 330, dur: 0.12, vol: 0.12 } },
                { id: 'laser_overheat', name: 'Laser Overheats', source: 'v11-extraction',
                  // A venting hiss plus hot-metal pings that slow as the
                  // laser cools — args.dur lets a tier that changes the
                  // overheat window (none do yet) drive this without a
                  // registry edit.
                  fn: function (opts) {
                      var A = SIM.audio, secs = (opts && opts.dur) || CFG.laserOverheatMs / 1000;
                      A.sfxNoise({ dur: secs, vol: 0.14, filter: 'highpass', freq: 3200 });
                      [0.25, 0.6, 1.05, 1.6, 2.25, 3.0, 3.85].forEach(function (at, i) {
                          A.sfxTone({ type: 'triangle', f1: 2000 - i * 140, dur: 0.12, vol: 0.09, at: at });
                      });
                  } }
            ]
        },
        {
            id: 'shields',
            label: 'Shields',
            cues: [
                { id: 'shield_raise', name: 'Shields Raising', source: 'v11-extraction',
                  // dur depends on CFG.shieldRaiseMs (tier-varied by Ace) —
                  // always pass {dur: secs} from the call site.
                  fn: function (opts) {
                      var A = SIM.audio, secs = (opts && opts.dur) || CFG.shieldRaiseMs / 1000;
                      A.sfxTone({ type: 'triangle', f1: 180, f2: 720, dur: secs, vol: 0.14 });
                      A.sfxNoise({ dur: secs, vol: 0.08, filter: 'bandpass', freq: 900, q: 2 });
                  } },
                { id: 'shield_clunk', name: 'Shields Online Clunk', source: 'v11-extraction',
                  recipe: 'noise', args: { dur: 0.12, vol: 0.3, filter: 'lowpass', freq: 400 } },
                { id: 'shield_splash', name: 'Shield Absorbs a Hit', source: 'v11-extraction',
                  fn: function () {
                      var A = SIM.audio;
                      A.sfxNoise({ dur: 0.3, vol: 0.25, filter: 'highpass', freq: 2500 });
                      A.sfxTone({ type: 'triangle', f1: 1400, f2: 900, dur: 0.25, vol: 0.15 });
                  } },
                { id: 'shield_failing_warn', name: 'Shields Failing Warning', source: 'v11-extraction',
                  fn: function () {
                      SIM.audio.blip(520, 70, 0.1);
                      SIM.audio.sfxTone({ type: 'sine', f1: 520, dur: 0.07, vol: 0.1, at: 0.14 });
                  } },
                { id: 'shield_drop_manual', name: 'Shields Dropped (manual)', source: 'v11-extraction',
                  recipe: 'tone', args: { type: 'triangle', f1: 600, f2: 200, dur: 0.3, vol: 0.12 } },
                { id: 'shield_drop_depleted', name: 'Shields Dropped (depleted)', source: 'v11-extraction',
                  recipe: 'tone', args: { type: 'sawtooth', f1: 600, f2: 90, dur: 0.7, vol: 0.18 } },
                { id: 'shield_repair_tick', name: 'Disrepair Crew Ratchet', source: 'v11-extraction',
                  fn: function () {
                      var A = SIM.audio;
                      A.sfxNoise({ dur: 0.06, vol: 0.1, filter: 'bandpass', freq: 500, q: 4 });
                      A.sfxTone({ type: 'square', f1: 300, dur: 0.05, vol: 0.05 });
                  } }
            ]
        },
        {
            id: 'sector',
            label: 'Sector And Warp',
            cues: [
                { id: 'warp_charge', name: 'Hyperwarp Charging', source: 'v11-extraction',
                  // dur depends on CFG.warpChargeMs — pass {dur: seconds}.
                  recipe: 'tone', args: { type: 'sawtooth', f1: 120, f2: 1400, dur: 2, vol: 0.15 } },
                { id: 'dock_clunk', name: 'Docking Clunk', source: 'v12-docking',
                  recipe: 'noise', args: { dur: 0.18, vol: 0.35, filter: 'lowpass', freq: 300 } },
                { id: 'warp_dry', name: 'Warp Tank Runs Dry', source: 'v12-warp',
                  // The drive gives out short of the target: a sagging sweep
                  // under the usual arrival noise. Placeholder until Brian hears it.
                  fn: function () {
                      var A = SIM.audio;
                      A.sfxNoise({ dur: 0.8, vol: 0.4, filter: 'lowpass', freq: 900 });
                      A.sfxSweep({ f1: 700, f2: 300, f3: 60, dur: 1.1, vol: 0.16, type: 'sawtooth' });
                  } },
                { id: 'warp_arrive', name: 'Hyperwarp Arrival', source: 'v11-extraction',
                  fn: function () {
                      var A = SIM.audio;
                      A.sfxNoise({ dur: 0.8, vol: 0.4, filter: 'lowpass', freq: 900 });
                      A.sfxTone({ type: 'sine', f1: 1400, f2: 90, dur: 0.9, vol: 0.2 });
                  } }
            ]
        },
        {
            id: 'mining',
            label: 'Mining',
            cues: [
                { id: 'explosion_rock', name: 'Asteroid Stage Blast', source: 'v11-extraction',
                  // One of the three recorded rock explosions, positioned
                  // at the rock; falls back to the synthesized explosion_kill
                  // cue if the recordings haven't decoded yet.
                  fn: function (opts) {
                      var A = SIM.audio, pos = opts.pos;
                      var names = ['asteroid_explosion1', 'asteroid_explosion2', 'asteroid_explosion3'];
                      var buf = A.assetBufs[names[Math.floor(Math.random() * names.length)]];
                      if (!A.ctx || !buf) { SIM.cues.play('explosion_kill', opts); return; }
                      var out = A.worldOut(pos, Math.ceil(buf.duration * 1000));
                      var g = A.ctx.createGain(); g.gain.value = 0.9;
                      var src = A.ctx.createBufferSource(); src.buffer = buf;
                      src.connect(g); g.connect(out);
                      src.start();
                  } }
            ]
        },
        {
            id: 'ui',
            label: 'UI And Menu',
            cues: [
                { id: 'menu_click', name: 'Menu Move', source: 'v11-extraction',
                  recipe: 'tone', args: { type: 'sine', f1: 800, f2: 1200, dur: 0.05, vol: 0.3 } },
                { id: 'menu_select', name: 'Menu Select', source: 'v11-extraction',
                  fn: function () {
                      var A = SIM.audio;
                      A.sfxTone({ type: 'square', f1: 200, dur: 0.1, vol: 0.05 });
                      A.sfxTone({ type: 'square', f1: 300, dur: 0.1, vol: 0.05, at: 0.1 });
                  } },
                { id: 'ready_chime', name: 'Ready Chime', source: 'v11-extraction',
                  // Shared by "laser ready" and "shields ready" — identical
                  // sound, previously duplicated at both call sites.
                  fn: function () {
                      SIM.audio.blip(660, 80, 0.12);
                      SIM.audio.sfxTone({ type: 'sine', f1: 990, dur: 0.11, vol: 0.12, at: 0.09 });
                  } },
                { id: 'refusal_dud', name: 'Refusal (short)', source: 'v11-extraction',
                  recipe: 'tone', args: { type: 'sine', f1: 200, dur: 0.06, vol: 0.08 } },
                { id: 'slot_select', name: 'Laser Slot Select', source: 'v12-lasers',
                  recipe: 'tone', args: { type: 'triangle', f1: 500, f2: 750, dur: 0.06, vol: 0.12 } },
                { id: 'refusal_wait', name: 'Refusal (recharging/blocked)', source: 'v11-extraction',
                  recipe: 'tone', args: { type: 'sine', f1: 200, dur: 0.12, vol: 0.1 } },
                { id: 'win_fanfare', name: 'Victory Fanfare', source: 'v11-extraction',
                  fn: function () {
                      var A = SIM.audio;
                      A.sfxArpeggio([523, 659, 784, 1047], 0.16, 0.18, { type: 'triangle' });
                      A.sfxChord([523, 659, 784], 0.9, 0.45, { type: 'sine', at: 0.65 });
                  } }
            ]
        }
    ];

    var byId = {};
    var level = 1;   // the "Effects" sound level (SPEC 1.12), 0..1
    CATEGORIES.forEach(function (cat) {
        cat.cues.forEach(function (cue) {
            cue.category = cat.id;
            byId[cue.id] = cue;
        });
    });

    // Turn a declarative {recipe, args} entry into a SIM.audio primitive
    // call. opts override args by name — e.g. {dur: secs} for a cue whose
    // length tracks a live CFG value rather than a fixed number.
    function playRecipe(entry, opts) {
        var A = SIM.audio;
        var o = Object.assign({}, entry.args, opts);
        switch (entry.recipe) {
            case 'tone':  A.sfxTone(o); break;
            case 'noise': A.sfxNoise(o); break;
            case 'echo':  A.sfxEcho(o); break;
            case 'sweep': A.sfxSweep(o); break;
            default:
                if (window.console) console.warn('SIM.cues: unknown recipe "' + entry.recipe + '" on ' + entry.id);
        }
    }

    return {
        // Play a cue by id. opts is forwarded to the recipe (as arg
        // overrides) or to the composite fn (as its whole argument) —
        // e.g. SIM.cues.play('explosion_kill', {pos: t.pos}),
        // SIM.cues.play('shield_raise', {dur: CFG.shieldRaiseMs / 1000}).
        play: function (id, opts) {
            var entry = byId[id];
            if (!entry) {
                if (window.console) console.warn('SIM.cues.play: unknown cue "' + id + '"');
                return;
            }
            // Every primitive a cue reaches multiplies its vol by volScale;
            // set it for the (synchronous) dispatch and put it back. Cues
            // schedule later parts with `at`, never setTimeout, so the
            // whole cue scales.
            var A = SIM.audio, prev = A.volScale;
            A.volScale = level;
            try {
                if (entry.fn) entry.fn(opts || {});
                else playRecipe(entry, opts || {});
            } finally { A.volScale = prev; }
        },
        setLevel: function (v) { level = Math.max(0, Math.min(1, +v || 0)); },
        level: function () { return level; },
        // For a future sound-lab tool: every cue, or just one category.
        list: function (categoryId) {
            var out = [];
            CATEGORIES.forEach(function (cat) {
                if (categoryId && cat.id !== categoryId) return;
                cat.cues.forEach(function (cue) { out.push(cue); });
            });
            return out;
        },
        categories: function () { return CATEGORIES.map(function (c) { return { id: c.id, label: c.label }; }); }
    };
})();
