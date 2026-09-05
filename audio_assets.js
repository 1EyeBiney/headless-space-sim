// audio_assets.js — Headless Space Sim
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

  // Laser slot-switch clips (SPEC 1.14). Originals are WAV; served as the
  // same converted MP3 siblings as the mining assets above.
  laser_switch1: 'audio/weapons/lasers/laser_switch1.mp3',
  laser_switch2: 'audio/weapons/lasers/laser_switch2.mp3',
  laser_switch3: 'audio/weapons/lasers/laser_switch3.mp3',
  laser_switch4: 'audio/weapons/lasers/laser_switch4.mp3',
  laser_switch5: 'audio/weapons/lasers/laser_switch5.mp3',
  laser_switch6: 'audio/weapons/lasers/laser_switch6.mp3',

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
  vortex8: 'audio/quadrant/vortex/space_vortex8.mp3'
};

// Preloaded in the background from audioStart() (SPEC 2.19) — everything
// the demo can reach without a special unlock, so the common path never
// waits on a first-use fetch. Curated, not "all of AUDIO_MANIFEST": the
// vortex set is the sound lab's, and the station interior (1.8 MB) is
// fetched when a sector run starts instead, since only docking plays it.
window.AUDIO_PRELOAD = Object.keys(window.AUDIO_MANIFEST).filter(function (k) {
  return !/^(vortex\d|station_interior)/.test(k);
});
