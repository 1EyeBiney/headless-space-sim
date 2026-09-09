// audio_assets.js — The Silence (working name: Headless Space Sim)
//
// SPEC 2.19: a manifest, not an embedded sound bank. Every recording the
// game references by key, mapped to its file under audio/. Loaded by a
// plain script tag (same load order as always), but this file is now ~3 KB
// instead of several megabytes — SIM.audio.load() in audio_engine.js
// fetches and decodes each path the first time it's needed (or up front,
// for AUDIO_PRELOAD), instead of this file carrying the audio data itself.
//
// This is why file:// support is gone (Brian, 2026-09-04): a fetch()
// needs a real origin. The game runs from GitHub Pages or the local
// static server (`.claude/launch.json`) only.
//
// Adding a new recording is one line here: `key: 'audio/wherever/it/is.mp3'`.
// Convention for new files: lowercase, underscores, no spaces, filename
// equal to the key — existing files with spaces or mixed case (Brian's
// own recordings, already in the repo) work as they are, since the
// loader encodeURI's the path; that convention is only for what's added
// from here on, so a new sound never needs a manifest-vs-filename lookup.
window.AUDIO_MANIFEST = {
  // Mining (SPEC 1.9/2.15): asteroid loops + stage-collapse explosions.
  // Originals are WAV; these are the served MP3 siblings (SPEC 2.19,
  // same mono 48k 96k pipeline every embed used).
  asteroid1: 'audio/mining/asteroid1.mp3',
  asteroid2: 'audio/mining/asteroid2.mp3',
  asteroid3: 'audio/mining/asteroid3.mp3',
  asteroid_explosion1: 'audio/mining/asteroid_explosion1.mp3',
  asteroid_explosion2: 'audio/mining/asteroid_explosion2.mp3',
  asteroid_explosion3: 'audio/mining/asteroid_explosion3.mp3',
  // Core voices (this round): a rock collapsed to its mineable core swaps
  // to one of two per-type recordings instead of just pitching up its own
  // loop — asteroid_core1/2 = Ice, 3/4 (named _iron by Brian) = Iron,
  // 5/6 = Stone, matching ROCK_TYPES' own order.
  asteroid_core1: 'audio/mining/asteroid_core1.mp3',
  asteroid_core2: 'audio/mining/asteroid_core2.mp3',
  asteroid_core3_iron: 'audio/mining/asteroid_core3_iron.mp3',
  asteroid_core4_iron: 'audio/mining/asteroid_core4_iron.mp3',
  asteroid_core5: 'audio/mining/asteroid_core5.mp3',
  asteroid_core6: 'audio/mining/asteroid_core6.mp3',
  // A large rock's own stage-blast pool (this round): explosion_rock picks
  // from here instead of the generic asteroid_explosion1-3 set specifically
  // when the rock breaking is 'large' — a bigger sound for a bigger rock.
  asteroid_large_crumble1: 'audio/mining/asteroid_large_crumble1.mp3',
  asteroid_large_crumble2: 'audio/mining/asteroid_large_crumble2.mp3',
  asteroid_large_crumble3: 'audio/mining/asteroid_large_crumble3.mp3',
  asteroid_large_crumble4: 'audio/mining/asteroid_large_crumble4.mp3',
  asteroid_large_crumble5: 'audio/mining/asteroid_large_crumble5.mp3',
  asteroid_large_crumble6: 'audio/mining/asteroid_large_crumble6.mp3',

  // Weapons.
  missile_fire: 'audio/weapons/missiles/missile-firing-fl-106655.mp3',

  // Damage control (SPEC 3.27): the repair crew's own voice, plays each
  // time it starts work on a newly broken system.
  repair_crew: 'audio/ships/repair_crew.mp3',

  // Ship engine loops (SPEC 1.2-ish roster voices). Only one recording per
  // class is wired in today; the rest of audio/ships/ is on disk, not in
  // the manifest, until a future round assigns them to other classes.
  ship_cruiser_1: 'audio/ships/spaceship_cruiser_1r.mp3',
  ship_cruiser_3: 'audio/ships/spaceship_cruiser_3r.mp3',
  ship_interceptor_1: 'audio/ships/spaceship_interceptor_1r.mp3',
  ship_interceptor_3: 'audio/ships/spaceship_interceptor_3r.mp3',
  ship_corvette_1: 'audio/ships/spaceship_corvette_1r.mp3',
  // Drone gets its own dedicated engine (this round) — was borrowing
  // ship_corvette_1 (SHIP_CLASS maps Drone to 'corvette', but roster
  // entries assign shipAsset directly, not derived from that map).
  ship_drone_1: 'audio/ships/spaceship_drone_1r.mp3',

  // Ship destruction, four size tiers (this round, Brian's own batch):
  // explosion_kill picks from the tier matching the destroyed ship's own
  // name (shipExplosionSize) instead of the old pure-synthesis cue.
  // Real lengths run capital ~8-9.5s, large 7.0s, medium 5.0s, small
  // 3.0s per ffprobe — a deliberate size-to-length progression.
  ship_capital_explode1: 'audio/Explosions/ship_capital_explode1.mp3',
  ship_capital_explode2: 'audio/Explosions/ship_capital_explode2.mp3',
  ship_capital_explode3: 'audio/Explosions/ship_capital_explode3.mp3',
  ship_capital_explode4: 'audio/Explosions/ship_capital_explode4.mp3',
  ship_capital_explode5: 'audio/Explosions/ship_capital_explode5.mp3',
  ship_capital_explode6: 'audio/Explosions/ship_capital_explode6.mp3',
  ship_large_explode1: 'audio/Explosions/ship_large_explode1.mp3',
  ship_large_explode2: 'audio/Explosions/ship_large_explode2.mp3',
  ship_large_explode3: 'audio/Explosions/ship_large_explode3.mp3',
  ship_large_explode4: 'audio/Explosions/ship_large_explode4.mp3',
  ship_large_explode5: 'audio/Explosions/ship_large_explode5.mp3',
  ship_large_explode6: 'audio/Explosions/ship_large_explode6.mp3',
  ship_large_explode7: 'audio/Explosions/ship_large_explode7.mp3',
  ship_large_explode8: 'audio/Explosions/ship_large_explode8.mp3',
  ship_medium_explode1: 'audio/Explosions/ship_medium_explode1.mp3',
  ship_medium_explode2: 'audio/Explosions/ship_medium_explode2.mp3',
  ship_medium_explode3: 'audio/Explosions/ship_medium_explode3.mp3',
  ship_medium_explode4: 'audio/Explosions/ship_medium_explode4.mp3',
  ship_medium_explode6: 'audio/Explosions/ship_medium_explode6.mp3',
  ship_small_explode1: 'audio/Explosions/ship_small_explode1.mp3',
  ship_small_explode2: 'audio/Explosions/ship_small_explode2.mp3',
  ship_small_explode3: 'audio/Explosions/ship_small_explode3.mp3',
  ship_small_explode4: 'audio/Explosions/ship_small_explode4.mp3',
  ship_small_explode5: 'audio/Explosions/ship_small_explode5.mp3',
  ship_small_explode6: 'audio/Explosions/ship_small_explode6.mp3',

  // Lasers (SPEC 2.12): both families, all 16 versions.
  laser_mining1: 'audio/weapons/lasers/Mining_laser 1.mp3',
  laser_mining2: 'audio/weapons/lasers/Mining_laser 2.mp3',
  laser_mining3: 'audio/weapons/lasers/Mining_laser 3.mp3',
  laser_mining4: 'audio/weapons/lasers/Mining_laser 4.mp3',
  laser_mining5: 'audio/weapons/lasers/Mining_laser 5.mp3',
  laser_mining6: 'audio/weapons/lasers/Mining_laser 6.mp3',
  laser_mining7: 'audio/weapons/lasers/Mining_laser 7.mp3',
  laser_mining8: 'audio/weapons/lasers/Mining_laser 8.mp3',
  laser_rapid1: 'audio/weapons/lasers/Rapid_pulse_laser1.mp3',
  laser_rapid2: 'audio/weapons/lasers/Rapid_pulse_laser2.mp3',
  laser_rapid3: 'audio/weapons/lasers/Rapid_pulse_laser3.mp3',
  laser_rapid4: 'audio/weapons/lasers/Rapid_pulse_laser4.mp3',
  laser_rapid5: 'audio/weapons/lasers/Rapid_pulse_laser5.mp3',
  laser_rapid6: 'audio/weapons/lasers/Rapid_pulse_laser6.mp3',
  laser_rapid7: 'audio/weapons/lasers/Rapid_pulse_laser7.mp3',
  laser_rapid8: 'audio/weapons/lasers/Rapid_pulse_laser8.mp3',

  // Lasers, four more families (SPEC 3.46): slots 3-6, all 8 versions each.
  laser_rugged_mining1: 'audio/weapons/lasers/rugged_mining_laser1.mp3',
  laser_rugged_mining2: 'audio/weapons/lasers/rugged_mining_laser2.mp3',
  laser_rugged_mining3: 'audio/weapons/lasers/rugged_mining_laser3.mp3',
  laser_rugged_mining4: 'audio/weapons/lasers/rugged_mining_laser4.mp3',
  laser_rugged_mining5: 'audio/weapons/lasers/rugged_mining_laser5.mp3',
  laser_rugged_mining6: 'audio/weapons/lasers/rugged_mining_laser6.mp3',
  laser_rugged_mining7: 'audio/weapons/lasers/rugged_mining_laser7.mp3',
  laser_rugged_mining8: 'audio/weapons/lasers/rugged_mining_laser8.mp3',
  laser_fast_fighter1: 'audio/weapons/lasers/fast_fighter_laser1.mp3',
  laser_fast_fighter2: 'audio/weapons/lasers/fast_fighter_laser2.mp3',
  laser_fast_fighter3: 'audio/weapons/lasers/fast_fighter_laser3.mp3',
  laser_fast_fighter4: 'audio/weapons/lasers/fast_fighter_laser4.mp3',
  laser_fast_fighter5: 'audio/weapons/lasers/fast_fighter_laser5.mp3',
  laser_fast_fighter6: 'audio/weapons/lasers/fast_fighter_laser6.mp3',
  laser_fast_fighter7: 'audio/weapons/lasers/fast_fighter_laser7.mp3',
  laser_fast_fighter8: 'audio/weapons/lasers/fast_fighter_laser8.mp3',
  laser_rotary_cannon1: 'audio/weapons/lasers/rotary_cannon_laser1.mp3',
  laser_rotary_cannon2: 'audio/weapons/lasers/rotary_cannon_laser2.mp3',
  laser_rotary_cannon3: 'audio/weapons/lasers/rotary_cannon_laser3.mp3',
  laser_rotary_cannon4: 'audio/weapons/lasers/rotary_cannon_laser4.mp3',
  laser_rotary_cannon5: 'audio/weapons/lasers/rotary_cannon_laser5.mp3',
  laser_rotary_cannon6: 'audio/weapons/lasers/rotary_cannon_laser6.mp3',
  laser_rotary_cannon7: 'audio/weapons/lasers/rotary_cannon_laser7.mp3',
  laser_rotary_cannon8: 'audio/weapons/lasers/rotary_cannon_laser8.mp3',
  laser_burst_plasma1: 'audio/weapons/lasers/burst_plasma_laser1.mp3',
  laser_burst_plasma2: 'audio/weapons/lasers/burst_plasma_laser2.mp3',
  laser_burst_plasma3: 'audio/weapons/lasers/burst_plasma_laser3.mp3',
  laser_burst_plasma4: 'audio/weapons/lasers/burst_plasma_laser4.mp3',
  laser_burst_plasma5: 'audio/weapons/lasers/burst_plasma_laser5.mp3',
  laser_burst_plasma6: 'audio/weapons/lasers/burst_plasma_laser6.mp3',
  laser_burst_plasma7: 'audio/weapons/lasers/burst_plasma_laser7.mp3',
  laser_burst_plasma8: 'audio/weapons/lasers/burst_plasma_laser8.mp3',

  // Laser slot-switch clips (SPEC 1.14). Originals are WAV; served as the
  // same converted MP3 siblings as the mining assets above.
  laser_switch1: 'audio/weapons/lasers/laser_switch1.mp3',
  laser_switch2: 'audio/weapons/lasers/laser_switch2.mp3',
  laser_switch3: 'audio/weapons/lasers/laser_switch3.mp3',
  laser_switch4: 'audio/weapons/lasers/laser_switch4.mp3',
  laser_switch5: 'audio/weapons/lasers/laser_switch5.mp3',
  laser_switch6: 'audio/weapons/lasers/laser_switch6.mp3',

  // Tractor beam hum: replaces the synthesized 90Hz tone in
  // tractorStartHum() with a real recording, one per tier as of SPEC 3.52.
  // Brian's set ran tractor_beam2-9 (no 1, no tier labels); tier 1 keeps
  // tractor_beam2 (the first on offer), tiers 2/3/4 take the LAST three
  // (7/8/9) per Brian's own mapping — tractor_beam3-6 stay in reserve,
  // unwired, auditionable in soundlab.html.
  tractor_beam: 'audio/weapons/tractor_beams/tractor_beam2.mp3',
  tractor_beam_2: 'audio/weapons/tractor_beams/tractor_beam7.mp3',
  tractor_beam_3: 'audio/weapons/tractor_beams/tractor_beam8.mp3',
  tractor_beam_4: 'audio/weapons/tractor_beams/tractor_beam9.mp3',

  // Warp (SPEC 1.17/2.10). Engine 1's three phases only; engines 2-6 are
  // on disk under audio/ships/warp/ but not in the manifest yet — no
  // drive module exists to select another engine.
  warp_start1: 'audio/ships/warp/warp_start1.mp3',
  warp_engaged1r: 'audio/ships/warp/warp_engaged1r.mp3',
  warp_finish1: 'audio/ships/warp/warp_finish1.mp3',

  // Station interior ambience (ideas6): loops on the music bus while
  // docked. Stereo 48k 128k sibling of Brian's WAV master in the same
  // folder (the WAV is not served). Fetched when the sector is entered,
  // not at boot — see AUDIO_PRELOAD below.
  station_interior1: 'audio/quadrant/space_station_interior1.mp3',

  // Vortex set (ideas6): the sound lab's HRTF orbit demo. Not used by the
  // game itself yet.
  vortex1: 'audio/quadrant/vortex/space_vortex1.mp3',
  vortex2: 'audio/quadrant/vortex/space_vortex2.mp3',
  vortex3: 'audio/quadrant/vortex/space_vortex3.mp3',
  vortex4: 'audio/quadrant/vortex/space_vortex4.mp3',
  vortex5: 'audio/quadrant/vortex/space_vortex5.mp3',
  vortex6: 'audio/quadrant/vortex/space_vortex6.mp3',
  vortex7: 'audio/quadrant/vortex/space_vortex7.mp3',
  vortex8: 'audio/quadrant/vortex/space_vortex8.mp3',

  // Flyby set (Phase 3L, L.4): Brian's propeller plane recordings. 1-4
  // loop on set routes, 5-8 are one-shot stunts. Sound lab only.
  propeller_plane1: 'audio/demo/propeller_plane1.mp3',
  propeller_plane2: 'audio/demo/propeller_plane2.mp3',
  propeller_plane3: 'audio/demo/propeller_plane3.mp3',
  propeller_plane4: 'audio/demo/propeller_plane4.mp3',
  propeller_plane5: 'audio/demo/propeller_plane5.mp3',
  propeller_plane6: 'audio/demo/propeller_plane6.mp3',
  propeller_plane7: 'audio/demo/propeller_plane7.mp3',
  propeller_plane8: 'audio/demo/propeller_plane8.mp3',

  // Recorded station beacons (SPEC 3.31 / Phase 3L L.9): Brian's ten
  // space_station recordings, applied down the list to every station as
  // they're assigned. Number 6 is the Jump Gate's lighthouse beam (L.9).
  space_station1: 'audio/stations/space_station1.mp3',
  space_station2: 'audio/stations/space_station2.mp3',
  space_station3: 'audio/stations/space_station3.mp3',
  space_station4: 'audio/stations/space_station4.mp3',
  space_station5: 'audio/stations/space_station5.mp3',
  space_station6: 'audio/stations/space_station6.mp3',
  space_station7: 'audio/stations/space_station7.mp3',
  space_station8: 'audio/stations/space_station8.mp3',
  space_station9: 'audio/stations/space_station9.mp3',
  space_station10: 'audio/stations/space_station10.mp3',

  // "Be the Way" voices (ideas11, sound lab only): Brian's four new
  // recordings, orbited by their own independent (not linked) HRTF
  // panners. way_outro is a placeholder pick of the three outro clips on
  // disk (13s/18s/full-song) — the full-song ending.
  way_the_way: 'audio/demo/be_the_way1.mp3',
  way_the_truth: 'audio/demo/be_the_truth1.mp3',
  way_the_light: 'audio/demo/be_the_light.mp3',
  way_outro: 'audio/demo/outro_C_15s_full_song_ending.mp3',

  // Menu music (Round 44): Brian's own track, looped on the music bus
  // while the mission menu is up (from the begin gesture, and again on
  // every return to the menu); every mission start stops it through
  // clearMission(). Stereo 48k, ~3.6 min, served as placed — fetched at
  // the begin gesture, not preloaded, since it's 5 MB.
  menu_celestial: 'audio/music/celestial/fingerprints_of_God.mp3',

  // SPEC 3.67 (ideas15.txt): the deep space ambient bed — loops on the
  // music bus under every mode (sector, combat, mining, course, turret,
  // the haul, escort/defend), started by newGame() and restored by
  // undock(); docking's station interior crossfades over it, the menu
  // music replaces it. Brian's own 20s stereo loop (the "r" is his own
  // loop marker; "10" suggests siblings not dropped yet). DOES preload —
  // it plays in nearly every encounter, unlike the menu track.
  space_ambient: 'audio/quadrant/deep_space/deep_space_10r.mp3',

  // SPEC 3.63: nebula transit — the staged pulsar/space_loop batch
  // (audio/stations/) finally gets a job. nebula_pulsar is the one
  // stable bearing inside the cloud (a placeholder pick, pulsar1, of
  // the seven on disk — pulsar4 doesn't exist); nebula_cloud is the
  // cloud's own ambient bed (space_loop1, likewise a placeholder pick
  // of the seven — space_loop2 doesn't exist). Both DO preload, same
  // reasoning as the station beacons.
  nebula_pulsar: 'audio/stations/pulsar1.mp3',
  nebula_cloud: 'audio/stations/space_loop1.mp3'
};

// Preloaded in the background from audioStart() (SPEC 2.19) — everything
// the demo can reach without a special unlock, so the common path never
// waits on a first-use fetch. Curated, not "all of AUDIO_MANIFEST": the
// vortex and flyby sets are the sound lab's alone, and the station
// interior (1.8 MB) is fetched when a sector run starts instead, since
// only docking plays it. The space_station beacons DO preload — they're
// real station voices in the live game as of SPEC 3.31, same as the ship
// engine loops.
window.AUDIO_PRELOAD = Object.keys(window.AUDIO_MANIFEST).filter(function (k) {
  return !/^(vortex\d|propeller_plane\d|station_interior|way_|menu_)/.test(k);
});
