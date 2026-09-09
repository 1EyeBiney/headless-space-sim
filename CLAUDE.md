# CLAUDE.md — The Silence (working name: Headless Space Sim)

## What this is

**Named "The Silence" on 2026-09-08** (Brian; the page title, heading,
begin line, aria-label, README, and the sound lab all say so — the repo,
the Pages URL, and `hss_profile` keep the working name). Brian's
audio-only ("headless" = no visuals) space sim, played entirely through
3D positional audio (Web Audio `PannerNode`, HRTF — the browser's OpenAL) and
NVDA speech. Started 2026-09-01 as an HRTF tech demo; grew into a game with
three connected states plus a timed delivery run. Brian is blind; every design
decision serves ear-first play. Long-range vision: sectors with POI, combat +
mining + economy (trade at stations), quadrant/system/universe maps as it
expands.

## Files

- `index.html` — the game itself (one IIFE, section banners CONFIG→STATE→MATH→
  SPEECH→AUDIO→TARGETING→WEAPONS (laser, missiles, enemy evasion, enemy fire,
  shields, debris, rocks)→RADAR→SECTOR (map, warp, call, delivery run)→INPUT→
  LOOP→SHELL). AUDIO now holds only simulation-driven sound (ship/rock/beacon
  voices, the beam, the lock tick, thrusters) — the generic engine and the
  discrete-cue registry moved out as of Round 12; see "Audio architecture"
  below. Runs from GitHub Pages or the local static server — NOT from a
  double-clicked `file://` page any more (Brian dropped that on 2026-09-04,
  SPEC 2.19; recorded audio is fetched, and `file://` can't fetch). Needs
  `audio_assets.js`, `audio_engine.js`, `audio_cues.js` loaded before it,
  in that order.
- `audio_assets.js` — as of SPEC 2.19, a ~3 KB MANIFEST (was a 3.8 MB
  base64 sound bank before): `window.AUDIO_MANIFEST = { key:
  'audio/path.mp3' }`, one line per recording, plus `window.AUDIO_PRELOAD`
  (today the same 37 keys the old bank embedded) — fetched on demand by
  `SIM.audio.load(key)`; the recordings under `audio/` are now the served
  assets and must be committed for Pages to have them.
- `audio_engine.js` / `audio_cues.js` — see "Audio architecture" below.
- (There is no longer a single-file `space_sim_demo.html`: Brian dropped it
  on 2026-09-04 now that the Pages URL is the share link. Do not regenerate
  or restore it.)
- `soundlab.html` (SPEC 2.11) — a standalone auditioning page, NOT part of
  the game or linked from it: loads `audio_assets.js`/`audio_engine.js`/
  `audio_cues.js` unmodified behind a small inline `CFG`/`clamp` shim
  (index.html's closure normally supplies these to the other two files;
  here a minimal object stands in), then lists every `SIM.cues` entry
  (generated from `categories()`/`list()`), a handful of raw-primitive
  presets, every recording IN `AUDIO_MANIFEST` (a button per key, loads
  on click if the background preload hasn't landed it yet), and every
  recording under `audio/` that has NO manifest key yet, as plain
  `<audio controls>` (paths with spaces `encodeURI`'d). Native HTML
  buttons/audio elements, not the game's custom key-trap shell — Tab and
  Enter/Space already work. Test at the local server (`soundlab.html`,
  not `index.html`). As of ideas6 (Round 16) it also hosts the **vortex
  orbit demo**: eight looping HRTF panners orbiting the listener
  (`VORTEX_ORBITS`, `vortexStart/Stop/Frame`), arrow keys in a focused
  `role=application` box for shared height (Up/Down) and a shared speed
  multiplier (Left/Right), Escape stops — Brian's testbed for what the
  HRTF layer can do with moving sources, the seed of a future 3D space.
  **As of Round 21 (Phase 3L) it's the HRTF laboratory** — the vortex
  demo gained per-vortex sway/height/offset (see the "Phase 3L" bullet
  below), and four new demos joined it: the Position Explorer (L.1,
  fixed-step polar navigation with compass-word readback), the flyby
  (L.4, Brian's propeller-plane clips on routes and stunts), the
  spatial room (L.8, a solo-then-turn-then-multiple-choice localization
  test), and the lighthouse gate (L.9, a directional cone). **Round 26
  (ideas11) added L.10, "Be the Way"**: four of Brian's new voice/song
  clips, each on its own independent (not shared/grouped, unlike L.5's
  vortex) HRTF orbit, firing in a staggered sequence rather than all at
  once — see the "Be the Way" bullet further down. **Round 36 turned
  L.1's own sibling, the grid cursor (L.1b, Round 25), into L.1c** —
  the actual decided galactic-map cube (A.13), not a free-roaming grid
  any more; see the "Round 36" bullet further down for the full shape.
  Shared
  helpers (`labPolarToPos`, `labNormAz`, `labDescribeAz`/`labDescribeEl`,
  `LAB_NAMES8`, `labShuffle`, `labResetListener`) sit above all of them;
  `window.__lab` (`tick(ms)`/`state()`) is this page's test hook, the
  same role `__sim.step()`/`__sim.state()` play for the game — needed
  because this pane's own `requestAnimationFrame` proved unreliable in
  isolation for one-shot timed demos, so every timed demo here runs on
  an explicit millisecond accumulator rather than diffing
  `performance.now()` directly. **Round 28 (SPEC 3.40, ideas10.txt)
  linked it back to the game** — Brian had no way back except the
  browser's own Back button. Three plain `<a href="index.html">Back to
  the game</a>` links: on the start gate (before the Start audio button
  in DOM/tab order, so a screen-reader user can leave without ever
  starting audio), first in Quick Navigation, and once more at the very
  bottom of the page. No custom key handling needed. Confirmed via
  `read_page` that the start-gate link precedes the Start button in tab
  order, and that clicking it lands on the mission menu.
- (F2, the ship status screen, SPEC 2.13 — same browsable shell as the run
  log, listing hull/shields/warp/cargo/missiles/chaff, one line per laser
  slot with its family matchup in words, fitted modules, and total mass;
  works from any live mission or the mission menu. **Grown into the full
  component reference by SPEC 3.29 (Round 21)** — one heading per system,
  H/Shift+H and a cycling first-letter jump, every number read live; see
  the "Round 21 also built SPEC 3.29" bullet near the end of this file
  for the full shape.)
- `README.md` — player-facing intro for the GitHub share (keys, delivery run).
- `audio/` — Brian's recordings, organized by category as of Round 12's
  housekeeping pass. As of SPEC 2.19 these ARE the runtime assets
  (`AUDIO_MANIFEST` points at them by path), fetched over the wire, so
  every served file has to be committed and a move means a manifest edit
  — 2.19's own commit staged `audio/` explicitly (never `git add -A`,
  since two subfolders were untracked and `audio/missiles/` had pending
  deletions from Brian's reorganization). ~25 MB on disk:
  `audio/mining/` = 3 asteroid loops + 3 asteroid explosions, WAV masters
  with served MP3 siblings (all 6 in the manifest), plus (Round 34,
  Brian's own new batch) 6 `asteroid_core1-6` (2 per rock type — 1/2
  Ice, 3/4 Iron marked `_iron`, 5/6 Stone, matching ROCK_TYPES' order)
  swapped in when a rock collapses to its core (`swapRockCoreVoice`),
  and 6 `asteroid_large_crumble1-6` for a 'large' rock's own stage
  blast (`explosion_rock`'s `opts.size === 'large'` branch) — all 12
  in the manifest; `audio/ships/` = 18
  ship loops (interceptor ×6, corvette ×7, cruiser ×5; only 5 in the
  manifest so far — one per roster class) plus 6 more `spaceship_drone_
  1r-6r` (Round 34, Brian's own batch — Drone previously borrowed
  `ship_corvette_1`; now `ship_drone_1` is its own dedicated manifest
  key, wired into both roster sites) plus `repair_crew.wav` (Round
  20, SPEC 3.27's damage-control voice, WAV master with a served MP3
  sibling, manifest key `repair_crew`) plus `audio/ships/warp/` = 18
  warp recordings for SPEC 1.17 (`warp_start1-6`, `warp_finish1-6` at
  4.0 s each, `warp_engaged1r-6r` loops at 1.5 s, all stereo 48 kHz;
  engine 1's three clips in the manifest, the other five stay on disk
  until a second drive exists — see "Sector" above) plus
  `audio/ships/thrusters/` = 9 `ship_thruster_N_{10s,7s,4s}` (Brian,
  2026-09-09, for SPEC 3.73's shadow — set one, files 1–3, are the
  ones to wire as `shadow_thruster_10/7/4`; sets two and three stay on
  disk; NOTE the name suffixes don't match the real lengths, see 3.73);
  `audio/weapons/
  missiles/` = the one manifest missile-firing mp3, `audio/weapons/lasers/`
  = 48 lasers (Mining ×8, Rapid-pulse ×8, all 48 in the manifest — the
  four newest families, Rugged mining/Fast fighter/Rotary cannon/Burst
  plasma ×8 each, wired in as of SPEC 3.46, real lengths 7.0s/5.0s/7.0s/
  5.0s per ffprobe, refitting each family's tick count/spacing to match),
  `audio/weapons/tractor_beams/` = 8 hums (Round 34, Brian's own batch,
  numbered 2-9, no 1) — `tractor_beam2` is the one wired in (manifest
  key `tractor_beam`, replacing `tractorStartHum`'s old synthesized
  90Hz tone for every tier), the other 7 stay on disk, auditionable in
  `soundlab.html`
  plus 6 `laser_switch1-6` switch clips (2.02–2.67 s, WAV
  masters with served MP3 siblings, all 6 in the manifest — the per-slot
  switch delay is timed off their original lengths); `audio/demo/`
  = `propeller_plane1–8.mp3` (Brian, 2026-09-05, for the lab's flyby
  L.4 — 1–3 are 5 s, 4 is 8 s,
  5–8 are 12 s, all stereo 48k; in the manifest as of Round 21, lab-only,
  excluded from `AUDIO_PRELOAD`) plus, as of Round 26 (ideas11),
  `be_the_way1.mp3`/`be_the_truth1.mp3`/`be_the_light.mp3` (short voice/
  song clips, a few seconds each) and three `outro_*` clips (13s/18s/
  full-song — only the full-song ending is in the manifest so far, as
  `way_outro`, a placeholder pick) for L.10's "Be the Way" demo; all four
  wired-in keys share a `way_` prefix (`way_the_way`/`way_the_truth`/
  `way_the_light`/`way_outro`), lab-only, excluded from `AUDIO_PRELOAD`
  same as the flyby set (`audio/demo/"be the way vortex demo1.txt"` is
  Brian's own note describing what to build — kept untracked like every
  other ideas file, not duplicated into this file); and `audio/stations/` =
  `space_station1–10.mp3` (same day, for 3.31's recorded station
  beacons and L.9's gate — number 6 is the gate by Brian's pick; all
  ten in the manifest as of Round 21 and DO preload, real station voices
  now, not lab-only) plus (Round 34, Brian's own batch, deliberately left
  UNWIRED) 7 pulsar1-8 (no 4) and 7 space_loop1-8 (no 2), staged ahead
  of a nebula/pulsar environmental feature that doesn't exist yet —
  audio/stations/"sound description for nebulae.txt" is Brian's own
  ElevenLabs prompt set (10 nebula-type descriptions, #1 "normal," #3/5/
  8/10 as danger variants) for whenever that gets designed; his own
  call (asked directly) was to leave these alone until then;
  `audio/Explosions/`
  = 8 `system_explosion1-8` (still unintegrated hull-breach candidates,
  no manifest key yet — unrelated to the batch below) plus (Round 35,
  Brian's own new batch) 25 `ship_<size>_explode<N>` across four size
  tiers — capital ×6, large ×8, medium ×5 (no 5), small
  ×6 — all 25 wired into the manifest and into `explosion_kill`
  (`audio_cues.js`), which now picks from the tier matching the
  destroyed ship's own name (`shipExplosionSize()`, index.html) instead
  of the old pure-synthesis noise-and-thump, which survives only as the
  fallback for an undecoded tier. `soundlab.html` is the up-to-date
  "what's connected" checker — trust it over this paragraph for the
  current count. `audio/z.old/` (Backups/Media/peaks, REAPER scratch)
  is gitignored.
- `.claude/launch.json` — a static-file server config (`npx serve`, port
  8934) for `preview_start`, same convention as `ag`'s and `kc`'s own
  `.claude/launch.json`. Needed now that the game is split across four
  script files: a `file://` page (and this session's browser-preview tool,
  which renders local files as an opaque `data:` snapshot) can't resolve
  relative `<script src>` tags, read `localStorage`, or fetch audio, so
  testing needs a real origin. Test at `http://localhost:8934` during
  development; the Pages URL is the release reference (see Working
  agreements). There is no double-click build any more (SPEC 2.19).
- Git repo, public on GitHub: https://github.com/1EyeBiney/headless-space-sim
  Served live via GitHub Pages at
  https://1eyebiney.github.io/headless-space-sim/ — this URL is the
  reference build; `?run=delivery` skips the menu into the timed run.
  The plan: `SPEC.md` (Part A direction, Part B build order, Part C
  decisions) — superseded PHASE_PLAN.md and Brian's ideas2 notes on 2026-09-04.
  (The original build's plan: `~\.claude\plans\you-said-do-not-functional-hammock.md`.)

## Audio architecture (Round 12)

Brian's direction: pull the audio code out of the single file before it grows
further, following the multi-file namespace convention from his other
projects (`KC.audio`/`KC.bgm`, `BASE.audio`) — a shared `window.SIM` object,
one namespace per concern. Researched `ag` (`golf_audio_bank.js`'s
categorized `{id, name, source, recipe, args}` registry + `playGolfSound()`
dispatcher — the direct model for this), `kc` (a cautionary tale: two
parallel switch/case registries with numeric IDs assigned reactively per
feature, no plan behind the numbers — avoided on purpose), `afish` (full
event-bus decoupling — architecturally the purest, but too big a structural
change for this project's current size), `baseball`/`abible` (function-per-
cue over shared primitives, no registry). All three of Brian's testers
(`.soundtester v2.0.html` here, `ag`'s `.golf_soundbank_tester`, `afish`'s
`afish_synth_tester.html`) confirmed the same workflow: audition candidate
sounds in a standalone page, port winners into the game by name later.

**The load-bearing design call**: Brian said almost every cue now playing
will be replaced by "engineered stuff" UNLESS it's coupled to gameplay
mechanics still in flux. That's the actual split point:
- `audio_engine.js` (`SIM.audio`) — the generic Web Audio layer: ctx/bus/
  asset-bank state, `audioStart`/`assetsReady`, plus (SPEC 2.19)
  `load`/`preload`/`ready`/`playMusic`/`stopMusic` over `fetch` — the old
  `decodeAssets`, which read base64 out of `audio_assets.js`, is gone,
  plus (SPEC 3.80) `SIM.music`, a sibling namespace in the same file for
  the background music player — see the "The background music player"
  bullet under Sector for its own shape,
  `ramp`,
  `makePanner`/`movePanner`/`worldOut`, and the primitives `sfxTone`/
  `sfxNoise`/`sfxChord`/`sfxArpeggio`/`blip`/`playAsset`/`noiseBurst` — plus
  two additions this round, `sfxEcho` and `sfxSweep`, ported faithfully from
  `.soundtester v2.0.html`'s `playEcho`/`playSweep` since the cue registry
  needed that vocabulary and this project didn't have it yet. Knows nothing
  about gameplay.
- `audio_cues.js` (`SIM.cues`) — the discrete, one-shot "moment" registry:
  explosions, chimes, clicks, warnings. Categorized entries, each either
  `{recipe, args}` (dispatched through a small `playRecipe()` switch —
  `args` is an OBJECT matching the primitive's own param names, not a
  positional array like `ag`'s, since this project's primitives are already
  object-shaped) or `{fn}` for composite/multi-step sounds (explosions,
  the victory fanfare, the disrepair ratchet). `SIM.cues.play(id, opts)` is
  the one dispatcher gameplay calls; `opts` overrides `args` by name (e.g.
  `{dur: secs}` for shield_raise/warp_charge/laser_overheat, whose duration
  tracks a live, tier-varied CFG value rather than a fixed number). 22 cues
  migrated this round — every discrete moment that existed in index.html
  before Round 12 (see git log for the full list). A `source` field per
  entry (`'v11-extraction'` for all of these) mirrors `ag`'s provenance
  tracking; new entries ported from a future sound-lab tester should use a
  `source` naming where they came from, same idea.
- Deliberately NOT migrated: anything simulation-driven — engine/rock/
  beacon voices (`buildVoice`/`buildRockVoice`/`buildPoiVoice`), the laser
  beam's live pitch tracking, the lock tick, missile/enemy flight hum,
  thrusters/stabilizers, the shield hum. These track a number that changes
  every frame; no registry entry helps there, and they stay in index.html
  next to the state they read. Swapping their underlying waveform for a
  recorded loop later (the way ship engines already pitch a recorded MP3
  via `shipAsset.rate`) is a different, smaller change than what the cue
  registry solves.
- New recorded assets Brian is auditioning do NOT get cue-registry entries
  until they're wired to a moment in the game. Before 2.19 they also
  weren't in `audio_assets.js` at all; after 2.19, connecting a recording
  is one manifest line (`key: 'audio/path.mp3'`) plus whatever plays it —
  the sound lab (`soundlab.html`) lists every manifest key and, separately,
  the on-disk files that don't have one yet, so it doubles as the "what's
  connected" checker.

**The multi-file gotcha that bit this refactor once already**: `index.html`'s
main script is one IIFE (`(function(){'use strict'; ...})();`), so
everything it declares — `CFG`, `clamp`, all of `TARGETING`/`WEAPONS`/etc —
is PRIVATE to that closure. The instant code moved into a separate top-level
script file, `audio_engine.js`/`audio_cues.js` referencing bare `CFG` or
`clamp` threw `ReferenceError` (only caught by testing at a real origin,
since the closure itself still parses fine standalone). Fixed by exposing
`window.CFG = CFG;` and `window.clamp = clamp;` right after their
declarations in the main script — `CFG` is mutated in place by `applyTier()`,
never reassigned, so the external reference stays live. Any FUTURE code
pulled out of the main IIFE into its own file needs the same check: grep the
new file for bare identifiers and confirm each one is either self-contained,
a real JS/DOM global, or explicitly exposed via `window.X = X` from the
closure that owns it.

## Game states

Mission menu (Keyboard Commander style list: Up/Down wrap, click per move,
Enter/Left/Right select with a two-note sound + "X selected" + 600 ms beat,
first-letter jump, Tab repeats, cursor remembered; `MENU_ITEMS` in SHELL) →
Delivery run / Sector (the hub) / Combat training / Mining / Help /
Difficulty / Sound / Run log.

**Profile persistence (Round 11, `hss_profile` in localStorage)**:
`loadProfile()` runs once at boot (before the menu ever shows), reading
`{ tier, credits, upgrades, chaff, runs, slots, laserSlot, sound, beacons }` — `credits`/`upgrades`/`chaff`
are schema only so far, no consumer until 1.7/1.8 land. `saveProfile()`
writes back on every tier change and every recorded run. Every read and
write is try/catch-guarded (`window.localStorage &&` + try/catch on the
call itself) so a `data:`-origin preview or any blocked-storage browser
still boots and plays, just without persistence that session — confirmed
in this environment, where the browser preview pane serves this file as a
`data:` URL (opaque origin, `localStorage` throws SecurityError on touch).
`recordRun(seconds)` pushes `{seconds, tier, upgrades, date}` into
`profile.runs`, sorts ascending, caps at 10, and returns whether it beat
the prior best (spoken on delivery as "New personal best!" or "Best is
N."). The Run log menu item (`openRunLog`/`runLogKey`, gated in
`onKeyDown` at the same priority tier as `help.open`/`map.open`) is a
read-only browse-and-Escape overlay modeled on the quadrant map, not yet
the shared `listMenu` the plan describes for 1.7 — that refactor is where
mission menu / station menu / run log converge on one implementation.

**Profile version (Round 15, SPEC 2.18)**: `PROFILE_VERSION = 2` (the
number bumps whenever a field is added or reshaped — 1 was the original
Round 10-11 shape, 2 is everything since: modules, sound, beacons, laser
slots, resources). `defaultProfile()` stamps `version: PROFILE_VERSION`.
`loadProfile()` captures `loadedVersion = profile.version || 1` right
after merging the saved JSON in, then runs the same per-field defensive
normalization that was already there before 2.18 gave it a version
number (runs/upgrades/stations/slots/sound/beacons/resources each get
backfilled if missing or malformed — this IS the v1→v2 migration, it
just isn't new code), and finishes with `profile.version =
Math.max(loadedVersion, PROFILE_VERSION)` so a save is never written
back with a lower version than it already had — an unrecognized newer
field survives untouched too, since the initial `Object.assign(profile,
saved)` copies everything and nothing downstream deletes a key it
doesn't recognize. `__sim.state().economy.version` exposes it for
testing. Confirmed at a local server: a fresh profile boots to version
2; a seeded v1-shaped save (no `version`, no `resources`/`sound`/
`beacons`/`slots`) loads with its data intact and gets backfilled to
version 2; a seeded "future" save (`version: 3` plus an unknown field)
keeps version 3 and the unknown field on load. Nothing to hear here —
pure persistence plumbing.

**Difficulty tiers (Round 11)**: `TIERS` in CONFIG (Rookie/Veteran/Ace).
`CFG_DEFAULTS` is the frozen numeric baseline; `CFG` is a live copy
`applyTier(idx)` rebuilds from `CFG_DEFAULTS` + `TIERS[idx].cfg` — every
`CFG.xxx` read elsewhere sees the same mutated object, so nothing else in
the file needs to know tiers exist. The Difficulty menu item is `adjust`-
typed (Left/Right cycle it in place, Enter just re-states it) rather than
`run`-typed. Rookie = enemies **passive until hit** (`t.hostile` set by
`provoke()` in `damageTarget`, fuse `enemyProvokedS` 4 s) + the Cruiser's
`rookie` overlay in `makeRoster` (hp 150→120, orbit 8→3 deg/s, missile
attacks only via `t.missileOnly`, no evade burst via `t.noEvadeBurst` — it
was unbeatable otherwise, since it orbits AND shoots back). Veteran/Ace =
every ship spawns `hostile: true` (the original harder Round 10 pacing);
Ace also tightens `shieldRaiseMs`, `laserMissWindowMs`, `missileMax`, and
defaults the zone to Standard. **Gotcha**: any help/description string that
interpolates a tier-varying `CFG` value must be a function re-evaluated at
speak time (`HELP_SECTIONS` items, `KEY_DESCRIPTIONS.f`, both wrapped
already), not a plain string baked in at parse time — `CFG` is no longer
static once tiers exist.

- **Delivery run (the demo)**: sector with a clock (`demo` state; counts while
  the sim is live, warp included; help/map/the mission menu stop it). Order enforced:
  Field Kappa refuses mining rights until the Contested Zone is cleared;
  Station Meridian takes the delivery once ore ≥ `CFG.demoOreGoal` (15,000)
  and speaks the run time. Station always repairs hull + rearms missiles.
  Losing the ship no longer restarts the run from scratch (SPEC 2.16,
  supersedes this): a tug is dispatched instead, on the clock, which
  keeps running through the wait — see "Death by tug" in the Combat
  section above.
- **Sector (the delivery run's own fixed layout, SPEC 3.10 note)**: `SECTOR_POIS`
  — real flyable space, 4 POI audio beacons (Contested Zone war-drum
  throb / Asteroid Field Kappa rumble / Station Meridian blinking 660 tone /
  Planet Auren 45 Hz drone). Untouched by 3.10 below — `demo` truthy is the
  one fork that still routes here; everything else in this bullet (warp,
  docking, the map, beacon behavior) is written against these four points
  and stays exactly as tested. Long-range beacon panners (ref 800, rolloff 1.2,
  gain ×2) + distance-haze lowpass in `updateTargeting`. `Q` map overlay,
  `H` hyperwarp (drops 600 out; interact range 500; refuses
  within `warpInhibitDist` 1500 of ANY point of interest via `nearbyPoi()`,
  not just the nav target — Brian: fly clear of a station before jumping
  anywhere, not just before jumping back to it). **Warp takes time (Round
  13, SPEC 1.17, supersedes the instant 2 s-spool-then-teleport model)**:
  a jump flies continuously and takes `warpJumpMinS` 9.5 – `warpJumpMaxS`
  12 seconds, scored by three recorded phases played at their own rate,
  never trimmed — `warp_startN` (4 s, doubles as the old spool: the ship
  sits still through it), `warp_engagedNr` (a 1.5 s loop, native
  `AudioBufferSourceNode.loop`, seamless), `warp_finishN` (4 s, ends
  exactly at arrival). `startWarp()` snapshots `dir`/`travel`/`dry`/
  `totalTime` into a `warpFlight` object once (POIs don't move, so this is
  safe); `updateWarpFlight(dt)` runs every frame from `simTick` while
  `warping`, moving `ship.pos` linearly from `fromPos` over
  `[warpEdgeClipS, totalTime]` and flipping `warpFlight.phase` at the two
  audio boundaries. `totalTime` is `warpJumpMinS` at `travel =
  warpMinDist − warpDropout` (600), rising linearly to `warpJumpMaxS` at
  `CFG.warpJumpLongDist` (10606 — measured from `placeAtStationStart`'s
  actual entry point to the Contested Zone on a full tank, so the
  delivery run's first leg is exactly `warpJumpMaxS`) and clamped flat
  past that. A dry jump (charge-capped `travel < need`) gets a
  proportionally shorter `totalTime`, confirmed in testing (10.13 s for a
  3125-unit travel, back when the max was 12; see below for the current
  numbers). No jump under `warpMinChargePct` 25 % ("Warp core below 25 %.
  Let it cool, or fly it."). **SPEC 2.10 (Round 14)**: the engaged loop —
  and the ship's own departure — now starts `warpEngagedLeadS` 0.5 s
  before the start clip's nominal end (`moveStart = warpEdgeClipS −
  warpEngagedLeadS` = 3.5), crossfading with its tail; `warpJumpMinS`/
  `warpJumpMaxS` dropped to 8.5/11 to compensate (`warpFinishLeadS` 0.5 s
  is the same idea on the finish transition, entirely absorbed into that
  shortened range rather than a second term in the finish-clip timing,
  which stays `totalTime − warpEdgeClipS`); `playWarpFinish` now fades in
  over 0.15 s instead of starting at full volume, crossfading against
  `stopWarpEngagedLoop`'s existing 0.15 s fade-out. Confirmed by polling
  `warpFlight.phase`/`elapsed`: engaged starts at 3.5, finish at 7.0
  (11 − 4), the full-tank leg measures 11 s. **SPEC 2.11**: the lock tone itself
  now depends on mode — `lockToneUsesPulse()` true for sector/mining
  (a soft double-blip, `playLockPulse`/`startLockPulse`/`stopLockPulse`,
  candidate A from the new `soundlab.html`, Brian's pick pending),
  false for combat (today's solid 880 Hz tone, unchanged). Every call
  site that used to touch `startSolidTone()`/`stopSolidTone()` directly
  now goes through `startLockTone()`/`stopLockTone()` so clearing a lock
  always cancels whichever tone is live; `__sim.state().lockToneMode`
  exposes which one for testing. Only engine 1's three clips are in the manifest
  (`CFG.warpEngine` default 1); an un-decoded engine falls back to the old
  synthesized `warp_charge` cue for the start phase and silence for
  engaged/finish, while the arrival stings (`warp_arrive`/`warp_dry`)
  always play regardless. **Real bug found and fixed**: `onKeyDown`
  checked `if (warping)` before `if (menuOpen)`, so once SPEC 1.18's
  mid-warp Escape opened the mission menu, every subsequent key (besides
  Escape itself) still hit the warping guard first and got swallowed as
  "Hyperwarp in progress." instead of reaching `menuKey()` — the menu
  opened but couldn't be navigated. Fixed by checking `menuOpen` first;
  confirmed after the fix that menu navigation, abandoning the warp via a
  different mission item (which now also stops the engaged loop and clears
  `warpFlight` — added to `clearMission()`), and Resume returning to a
  still-flying ship (its `elapsed` continuing to advance afterward) all
  work. `refillWarp()` on
  `returnToSector` (leaving any encounter) and at the station; slow regen
  in open flight (`warpRegenPerS` 40; as of SPEC 1.13 the regen is
  SILENT — Brian dropped the old core-cooling hiss — and `updateWarpCore`
  speaks "Warp core N percent" as the charge crosses each
  `CFG.warpAlertPcts` [50, 75] threshold, stateless: it compares the
  percentage before and after that frame's regen, so a jump that drops
  the charge re-arms the alert with no flag to reset; chime + "Warp core
  cooled. Tank full." when full); zero charge refuses. New pilots start `sectorStartDist` 1800 from
  the station toward the Contested Zone (`placeAtStationStart`), just
  outside the no-warp zone, and the delivery run preselects the zone.
  `SECTOR_POIS` moved (combat 5200,400,-5600; mining -9500,-800,-2800) so
  the run's three legs fit Brian's design: station→combat one tank,
  combat→Kappa and Kappa→station each run dry ~850 out AFTER flying 1500
  clear toward the next target — exit direction changes the leg by up to
  3000, so the tank is sized against the best exit. Map lines read "in warp
  range" / "beyond warp range by N" (`warpReachText`). `C` call
  within 500 → combat/mining encounters (`sectorHome` snapshot; `X` returns
  to open space at the POI) or the station, which as of SPEC 1.19 hails or
  docks by range, no corridor to fly (see below) / planet placeholder
  hail. Weapons/tools cold in open space. Ore, hull, and missile
  count persist across a sector run (menu starts reset them).
  **The quadrant (Round 17, SPEC 3.10) replaces this for the OPEN
  campaign** — the Sector menu item builds from `QUADRANT` (six fixed
  rows: the star at ring 0, Station Meridian ring 3500, Planet A ring
  6000, Station Two ring 9500, Planet B ring 11000, the Jump Gate ring
  14000, all placeholder names) instead of `SECTOR_POIS`, forked with
  one line in `makeSectorRoster()` (`if (demo) ... else
  makeQuadrantRoster()`). Positions are never stored: `ringPos(entry)`
  computes `polar(ring, phaseDeg + degPerHour × profile.clock/3600)`
  fresh on every call, so the save is just rates and phases. The combat
  zone and 1-2 asteroid fields (`CFG.quadrantFieldCount`) are the
  MOVING parts, spawned by `findSpawnPos` (near the pilot first, near
  ANY point in the quadrant if that fails 50 times) and saved in
  `profile.quadrants.home` (`{ zone, fields, fieldSeq }`, no separate
  save function — `saveProfile()`'s existing wholesale
  `JSON.stringify(profile)` already covers it, called from
  `returnToSector()` and a new 30 s quiet timer in open flight).
  `returnToSector()` gained the actual respawn logic: a cleared zone or
  a field whose `budget` (drained by `depleteCurrentField`, hooked into
  both `vacTick` and `dustTick`) hit zero is replaced BEFORE the sector
  roster rebuilds, so the fresh roster never shows the stale one, and
  the exit `say()` folds the sighting into the same call (the SPEC 2.15
  double-say lesson, applied again). Fields are typed (`ice`/`iron`/
  `mixed`, `FIELD_TYPE_WEIGHTS`), biasing `makeMiningRoster`'s rock draw
  via a new optional `fieldType` argument — called with none (Kappa, the
  standalone drill) it's byte-for-byte unchanged. The map groups by kind
  in sector mode (`mapBuildItems`: Stations/Planets/Asteroid fields/
  Contested zone/Gate/Star headings, first-letter jump to one) — applies
  to the delivery run's map too, harmless with four points. Beacon "on"
  mode gained a `CFG.beaconAudibleDist` 8000 cutoff, but ONLY for the
  quadrant (`if (demo) return true;` keeps the tested delivery-run
  beacon behavior untouched). **Two real multi-station bugs fixed in
  passing**: `startTug()` scanned `SECTOR_POIS` for "the" station
  (would have crashed with two stations and no `SECTOR_POIS` backing
  the open campaign) — now `nearestStationTo(pilotPos)`; and
  `placeAtStationStart()` picked "whichever station iterates last"
  (would silently start new pilots at Station Two) — now matches
  Station Meridian by name. SPEC 2.17's mission labels also stopped
  hardcoding "Planet Auren"/"Field Kappa" — `missionDestinationPlanet`/
  `missionDestinationField` name the nearest real quadrant point
  instead. `PROFILE_VERSION` → 3 (`clock`, `missionCooldownUntil`,
  `quadrants`, `quadrantId`); SPEC 2.17's session-only `simClock` is now
  `profile.clock`, no session mirror left anywhere. **A real bug found
  while testing**: `ensureQuadrantHome()` assigned
  `profile.quadrants.home` before populating its `zone` field, and
  `spawnField`'s own avoid-list lookup read `q.zone.pos` in that exact
  window on the very first Sector visit — crashed every fresh profile;
  fixed with a null guard in `existingQuadrantPositions()`. Caught (and
  double-checked) only because a stale console error persisted across a
  same-tab reload and had to be told apart from the real one via a
  genuinely fresh tab — the same testing gotcha this project has hit
  before. Machine-tested thoroughly (spawn placement, drift, typed
  mining, depletion + respawn with a real bearing, zone clear + respawn,
  the beacon cutoff, a v2→v3 migration, the two-station tug and mission
  fixes, the delivery run and both standalone drills confirmed
  unaffected), zero console errors; not yet heard or flown by Brian. Not
  built here: `serves`/`wants` on `QUADRANT` rows, unions, favor/
  control, threat — all later Phase 3 items layer onto this.
- **Escape / mission menu (Round 13, SPEC 1.18)**: Escape no longer
  toggles a separate `paused` flag (removed entirely — grepped clean).
  From any live mission it calls `openMissionMenuOverlay()`: sets
  `menuOpen = true` (which ALREADY froze `simTick` and the delivery
  clock before this round, since both guard lists already included
  `menuOpen` alongside the old `paused`), `menuResumable = true`, cursor
  to the appended **Resume** item, and ducks `masterGain` — UNLESS
  `warping`, in which case the duck is skipped so the warp sound keeps
  playing (the warp-completion `setTimeout` in `startWarp` is a real
  timer independent of `menuOpen`, so the flight and its arrival speech
  run through to completion regardless of the open menu; confirmed in a
  single continuous test — splitting the wait across separate tool
  calls in earlier attempts let real time outrun the spool between
  calls and produced misleading results, not a real bug). `onKeyDown`'s
  `if (warping) {...}` guard special-cases `lname === 'escape'` to reach
  `openMissionMenuOverlay()` instead of the usual "Hyperwarp in
  progress" refusal — every other key still blocked mid-warp as before.
  **`RESUME_ITEM` is APPENDED after `MENU_ITEMS`, never prepended** —
  prepending would shift every other item's index by one the instant
  Resume is showing, and `menuIdx` would then point at the WRONG item
  once the overlay closed and a bare `X` re-displayed the un-augmented
  boot list; appending means indices 0–7 mean the same thing in both
  lists, and `resumeFromMenu()` only needs to clamp `menuIdx` down by
  one in the single case where the cursor was sitting on the Resume slot
  itself. `activeMenuItems()` returns `MENU_ITEMS` or `MENU_ITEMS.concat
  ([RESUME_ITEM])` depending on `menuResumable`; `menuItemText`/
  `menuKey`'s arrow/Enter/first-letter branches all read through it now.
  Selecting any OTHER item runs its own existing `run()` (`startMission`/
  `startDemo`/etc.), which abandons the live mission exactly as it
  always has — 1.18 changes nothing about what those do. Escape pressed
  again while the overlay is open resumes immediately (checked before
  the rest of `menuKey()`, only when `menuResumable`); at the plain boot
  list (`menuResumable` false) it falls through to the same generic
  "up and down arrows..." hint every other unbound key gets there,
  unchanged from before. `X` (leave/return-to-sector) is completely
  untouched — it only ever fires from the raw sim, since `menuOpen`
  already intercepts every key before the switch reaches `case 'x'`.
  Every `!paused` audio-duck double-guard in `openHelp`/`closeHelp`/
  `openRunLog`/`closeRunLog`/`openMap`/`closeMap` became `!menuOpen`
  (opening a sub-overlay from the raw sim always finds `menuOpen` false;
  opening one from INSIDE the Resume-capable overlay finds it already
  true and already ducked, so the guard's job — don't double-ramp — is
  identical either way); `closeHelp()`'s old "Still paused." line is now
  "Mission menu still open." `beamTick`'s own freeze guard changed from
  `paused` to `menuOpen` (a burst now stops silently under the menu the
  same way it used to stop silently while paused). Every `!paused &&`
  guard inside the raw-sim key switch was deleted outright rather than
  swapped, since `menuOpen` already intercepts the WHOLE switch before
  any of those cases can run — they were dead code under the new model.
- **Reaction mass, collisions, the hail menu (Round 14, SPEC 2.14)**: `rcs`
  (max `CFG.rcsMax` 100) is spent by W (`rcsThrustPerS` 1/s), S
  (`rcsBrakePerS` 1.5/s), and the passive stabilizer damping itself
  (`rcsPerSpeedShed` 0.02 per unit of speed it sheds, so it still costs
  something even when the pilot isn't touching the keys — Brian: the
  player has no control over the auto-stabilizer beyond not thrusting in
  the first place). `spendRcs(amount)` is a no-op once `rcsBattery` is
  true; otherwise it drains `rcs`, speaks "Reaction mass N percent." on
  each descending crossing of `CFG.rcsAlertPcts` [50, 25] (the mirror of
  1.13's warp-core alerts, but counting down instead of up), and flips
  `rcsBattery` true with "Reaction mass empty. Battery power." the
  instant it hits 0. `rcsFactor()` returns `CFG.rcsBatteryFactor` 0.4 on
  battery, 1 otherwise; `simTick` multiplies BOTH thrust and the
  stabilizer's own effective damping strength by it
  (`effectiveDampKeep = 1 - (1 - CFG.dampKeep) * rf`), so a dry tank means
  weaker thrust AND a ship that coasts/drifts longer before settling —
  never a hard stop. **S is now a real reverse thruster** (`CFG.brakeThrust`
  35, half of `CFG.thrust` 70) added onto velocity like W in reverse,
  replacing the old multiplicative `brakeKeep` cliff — confirmed ~3 s and
  ~140 units to stop from top speed. `addRcs()`/`refillRcs()` clear
  `rcsBattery`; docking and `startMission`/`startDemo` fully refill,
  mining ice cores and kills give small top-ups (2.15), a hail can buy it
  at `CFG.rcsCreditPerUnit` 1.
  **Collisions**: `updateCollisions(spd)` runs every `simTick` frame in
  sector mode when speed exceeds `CFG.collisionSafeSpeed` 25; within
  `CFG.stationHullRadius` 60 of any station or planet it deals
  `Math.ceil((spd - 25) * CFG.collisionDmgPerSpeed 2)` damage via the
  existing `hullHit()`, stops the ship, and repositions it to exactly the
  hull radius along the line it hit from — confirmed pushed back to
  precisely 60 units out in testing. That damage is tracked separately in
  `collisionDamage` (persists across a sector run, like `ore`) and is the
  ONLY hull damage that costs anything to repair: `dockAtStation` bills
  `Math.ceil(collisionDamage * CFG.repairCreditPerPoint 5)` credits first,
  repairing as many points as the pilot can afford and leaving the rest
  owed (confirmed a partial-afford case: 69 billable points at 300 credits
  on hand repaired exactly 60 of them, `collisionDamage` reduced to 9, not
  zeroed) — ordinary combat/mining damage stays free exactly as before.
  **Salvage and alloy (Round 14, SPEC 2.15)**: `profile.resources`
  `{ salvage, alloy }`, persistent like `profile.credits` (unlike `ore`,
  which stays the temporary cargo hold — Brian's own design split, since
  losing salvage/alloy on a lost ship would undercut them as the
  achievement resource combat forces even a miner to earn a little of).
  `SALVAGE` `{ interceptor: 2, corvette: 3, cruiser: 5 }` keyed by
  `SHIP_CLASS` (2.12's own ship-class map), awarded in `damageTarget` via
  `addSalvage(shipName)` on every ship kill. Mining an Ice core's depleted
  branch (`vacTick`) calls `addRcs(CFG.rcsPerIceCore)`; an Iron core adds
  `CFG.alloyPerIronCore` to `profile.resources.alloy`; Stone cores give
  nothing extra, matching 2.12's own "middle" rock in the laser matchup
  table. Both sell at the landing menu (`Sell salvage`/`Sell alloy`,
  `CFG.salvageCredit` 30 / `CFG.alloyCredit` 20 per unit, via a shared
  `sellResource(key, price, poi)` — `sellOre()` is now a one-line wrapper
  around the equivalent `sellOreAt(poi)`, needed because the NEW hail menu
  also needs to sell ore without being `docked`). **F3** (same shell as
  F2): ore, salvage, alloy, reaction mass, warp charge, hydrogen (0 until
  2.8), credits, missiles, chaff, each with a line on what it's for.
  **A real speech bug found here, general to this codebase**: `say()`
  only sets `liveEl.textContent`, no queue — two `say()` calls in the same
  synchronous tick collapse into ONE DOM mutation, so a screen reader only
  ever hears the LAST one. `addSalvage()` originally spoke its own
  "Salvage plus N." right before `damageTarget`'s kill line and the
  salvage announcement was silently swallowed every time (confirmed: the
  profile updated correctly but the line never appeared in an
  announcement log). Fixed by making `addSalvage` silent (returns the
  amount) and folding it into ONE `say()` call — `destroyTarget` gained
  an optional `extra` param it prepends to its own already-`setTimeout`-
  delayed victory line (safe, since a real timer is a genuine task
  boundary), and `damageTarget` builds one combined string for the
  ordinary case. **Any future code that wants to speak two things on one
  event must combine them into one `say()` call or separate them with a
  real `setTimeout`** — never call `say()` twice back to back.
  **The hail menu** (`HAIL_ITEMS`/`hailMenuKey`/`openHailMenu`) replaces
  1.19's plain `hailText()` status line with a real browsable menu, same
  shell as the station/landing menu: Rearm (missiles + chaff, free),
  Sell ore (`sellOreAt(poi)`, the landing menu's `sellOre()` is now a thin
  wrapper calling it with `docked.poi`), Buy reaction mass (fills toward
  `rcsMax` at `rcsCreditPerUnit`, capped by what's affordable), Close.
  Freezes the sim the same way `docked` does (added to `simTick`'s early
  return list) and ducks audio unless already ducked by the mission menu,
  matching every other overlay's `!menuOpen` guard. Missions and Prices
  from the original sketch aren't on the list yet — they wait on 2.17 and
  3.11, which don't exist. `__sim.state()` gained `rcs`, `collisionDamage`,
  `hailMenu`; `poke()` gained `rcs`/`rcsBattery`/`pos`/`vel`/
  `collisionDamage` for testing (poking `rcs` directly does NOT clear
  `rcsBattery` — a raw override, not a real refill; use `addRcs`/
  `refillRcs` semantics by poking both fields together if a test needs
  battery cleared).
  **Death by tug (Round 15, SPEC 2.16)**: `tugCandidate()` (`sectorHome ||
  mode === 'sector'`) is the one branch point in `shipDestroyed()` — true
  for anything reached via the sector (an encounter entered from it, OR
  dying in open sector flight itself, e.g. a collision, with no encounter
  at all) and for the delivery run (always inside one of those two);
  false only for a standalone training drill started directly from the
  mission menu, which keeps the old instant Enter-retry untouched.
  `startTug()` reads `profile.stations['Station Meridian'].influence`
  BEFORE this death (same ordering rule as `influenceGreeting`) and sets
  `tug = { total, remaining, poiData, paid }`, `total` = `CFG.tugBaseS`
  90 halved by `CFG.tugInfluenceFactor` 0.5 past `CFG.influenceThreshold`.
  `updateTug(dt)` runs from `simTick` on the same help/map/menu gate as
  the delivery clock but NOT gated on `!over()` (being lost is what
  starts it), speaking "Tug in N seconds" on every whole-10-second
  boundary crossed — the same before/after bucket comparison the
  warp-core alert already used. At zero, `tugArrives()` clears `tug`/
  `sectorHome`, rebuilds the sector roster, places the ship just outside
  Station Meridian, and calls `dockAtStation(poi, 'Tug arrives. ')` — the
  SAME repair/rearm/refuel/restock/delivery-handover path a normal
  docking always runs, `dockAtStation` having grown an `extra` param
  (prepended to its own single `say()`) for exactly this, so the arrival
  line and the docking line stay one combined announcement rather than
  repeating the SPEC 2.15 double-`say()` bug on purpose. `payTugFee()`
  (Enter, while `tug` is set) spends `CFG.tugFeeCredits` 50 once
  (`tug.paid` guards a second press) halving whatever's left AT THAT
  MOMENT — stacks multiplicatively with an influence halving, not
  additively. X and the Shift+W/T/R chord both refuse during the wait
  ("A tug is already on the way...") instead of their usual
  return-to-sector/restart, since the tug is now the only way back for a
  sector-campaign loss; `clearMission()` clears `tug` too so abandoning
  the wait via the mission menu doesn't leak stale state into whatever
  mission comes next (that abandonment itself is unchanged SPEC 1.18
  behavior — selecting anything else already tore down a live mission
  before this). `__sim.poke()` gained `kill` (calls `shipDestroyed`
  directly, skipping the need to actually land a killing hit in a test)
  and `credits` (sets `profile.credits`), both test-only. Machine-tested:
  a drill death still says "Enter tries again" with no `tug`; a
  sector-encounter death and an open-sector-flight death both start a
  90 s tug; a seeded influence of 5 halves it to 45 s; paying with 50+
  credits halves whatever remains and a second Enter says "Already
  paid"; paying with 0 credits refuses and charges nothing; X and the
  Shift-chord both refuse mid-wait; the countdown was confirmed firing
  at each 10-second boundary via `__sim.step()`; arrival repairs hull to
  100, refills reaction mass, leaves cargo untouched, opens the station
  menu, and includes the influence greeting when earned; the delivery
  run's own death was confirmed routed to the same tug (not the old
  full-restart) with its clock confirmed STILL ADVANCING through the
  wait (elapsed 3 at death, 13 ten seconds into the wait, 53 at
  arrival) and the `demo` object surviving intact. Zero console errors.
  Not yet heard by Brian.
  **100 starting credits, a repeatable rush, and a wait that teaches
  (Round 28, SPEC 3.35, ideas10.txt)**: `CFG.startCredits` (100)
  replaces `defaultProfile()`'s old 0 — an existing save's own credits
  still overwrite it via `loadProfile`'s `Object.assign`, so only a
  genuinely fresh profile gets the bump. `tug.paid` is now a count, not
  a boolean, and `payTugFee()` dropped its old one-time refusal entirely
  — every payment halves whatever's left, offering "Enter pays another
  50." while credits allow; only running out of credits ever refuses
  now. `updateTug`'s own countdown gained a reminder clause (" F2 reads
  your ship, F3 your hold."), spoken once at the FIRST boundary crossed
  after death and once more at whichever crossing first lands at or
  under `CFG.tugReminderMarkS` (30s) — two independent flags, so neither
  fires twice. Machine-tested via a real Contested Zone kill (not a
  drill, since `tugCandidate()` needs `sectorHome`): a fresh profile read
  100 credits on F3; death at 90s, Enter → 45s with "another 50" offered
  → Enter → 22.5s with no offer (broke) → Enter → refused; a second,
  unpaid death confirmed both reminder marks firing exactly once each.
  One cosmetic wrinkle found, not a bug: `shipDestroyed`'s own delayed
  900ms "Hull breached..." line can transiently overwrite whatever the
  tug's own countdown just said in the shared `announce` div — the
  underlying state is correct regardless of which text a screen reader
  happens to catch mid-collision, and this race predates this round.
  Zero console errors. Not yet heard or flown by Brian.
- **ideas6 (Round 16, SPEC 2.20 — Brian's first notes from flying the
  Phase 2 build)**: (1) "chaff" is "decoy(s)" everywhere the player hears
  it; code names unchanged. (2) `lockToneKind()` picks the lock tone by
  the selected target's kind, not by mode — 'solid' (ship), 'pulse' (rock/
  dust, `lockPulseVol`), 'poi' (solid at `lockTonePoiVol` PLUS the guidance
  ticks continuing at `tickLockedMs` in `tickBeat`); `startSolidTone(vol)`
  takes its level. `tickBeat` also idles while `docked`/`hailMenu.open`.
  (3) `undock()` places the ship `CFG.undockDist` 1000 out, resets
  `keysDown`/`autoThrust`, sets the station's `rangeBand` to 0 silently,
  stops the music, and says the no-warp zone still has to be thrust clear
  of. Brian's "couldn't move after undocking" was a real bug, found on
  the Pages check: `undock()`'s yaw had the sign flipped since SPEC 1.19
  (`atan2(-dir.x, dir.z)`; `shipForward()` is `(sin yaw, ., -cos yaw)`,
  so facing along `dir` is `atan2(dir.x, -dir.z)`, what `faceSelected`
  uses) — the ship faced the station, W flew it into the hull, and
  `updateCollisions` stopped and pushed it back on every press. Fixed.
  Lesson for any test of "did the ship move": check the distance to the
  thing it should be leaving, not just that `pos` changed. The held-key
  branch in `onKeyDown` also now answers with `overHeldText()` whenever
  `over()` is holding the ship, so a frozen ship is never silent.
  (4) `updateStationRanges()` (called from `simTick` next to
  `updateCollisions` in sector mode) tracks `t.rangeBand` per station —
  0 outside / 1 comm / 2 dock — and on each crossing plays `comm_range`,
  `dock_range`, or `range_lost` (new entries in `audio_cues.js`'s sector
  category) with a one-line say(); the first frame after a roster build
  just records the band. (5) Docked: `beaconAudible()` returns false while
  `docked`, applied at dock time by the new `applyBeaconMutes()` (simTick
  is frozen while docked, so updateTargeting can't); lock tone/tick stop;
  `SIM.audio.playMusic('station_interior1', {vol: CFG.stationAmbientVol})`
  — the 2.19 music hook's first real track, Brian's
  `audio/quadrant/space_station_interior1.wav` converted to a stereo 48k
  128k MP3 sibling (the WAV is not committed, his call); loaded when
  `makeSectorRoster()` runs (cached), stopped by `undock()` and
  `clearMission()`. (6) `AUDIO_PRELOAD` is now a curated filter that
  excludes `vortex\d` and `station_interior`. The vortex demo itself is
  in `soundlab.html` (see Files). `__sim.state()` gained `music` and
  `stationBand`. All machine-tested (range bands 0-1-2-1-0 at 600/450/
  120/300/700, dock/undock/music/held-key/warp-refusal, the three lock
  kinds in sector/mining/combat, the lab demo's load/keys/stop), zero
  console errors; nothing heard by Brian yet.
- **Docking (Round 13, SPEC 1.19, supersedes Round 12's SPEC 1.6)**: the
  flown corridor is GONE — Brian: use ranges instead. `callPoi()` computes
  `range = t.poiType === 'station' ? CFG.stationCommRange : CFG.poiInteract`
  (500 either way today, but tunable separately) for the "too far" gate;
  inside that but outside `CFG.stationDockRange` (150) is a **hail**
  (`hailText(poi)` — a status line naming what's on offer and the range to
  dock, `influenceGreeting` folded in without duplicating "Station
  Meridian control:"); inside `stationDockRange` is `dockAtStation(poi)`,
  instant, no speed check, no flight instrument — the lock tick, "Locked.
  Distance N", and R's range-with-closing (1.15) are what a pilot flies
  the approach by now. `dockAtStation` carries over every bit of the old
  `finishDocking`'s repair/rearm/refuel/restock + delivery-handover logic
  unchanged, plus one new field: `docked.approachDir`, the ship's own
  position relative to the station at the MOMENT it docked
  (`norm(sub(ship.pos, poi.pos))`, `norm`'s own zero-length fallback
  covers docking exactly on top of the beacon). `undock()` places the ship
  `stationDockRange + 100` out along that stored vector instead of a
  fixed `poi.dockAxis` — confirmed landing at exactly 250 out from two
  different approach angles in testing. Removed entirely: `docking` state,
  `corridorFrame`/`startDocking`/`stopDocking`/`dockOffsets`/`dockToneOn`/
  `scheduleDockTick`/`updateDocking`/`abortToEntry`, the `dock*` corridor
  CFG block, `dockAxis` (on `SECTOR_POIS` and in `makeSectorRoster`), the
  `dock_abort` cue, `X`'s corridor-cancel branch, and the corridor help/
  README text. `dock_clunk` and the station menu shell (`STATION_ITEMS`,
  `stationMenuKey`, gated in `onKeyDown` at the same priority as
  `help.open`/`map.open`) are unchanged — still not the shared `listMenu`
  the plan describes, same deliberate deferral as the run log.
- **Station economy (Round 12, SPEC 1.7)**: fleshes out `STATION_ITEMS` to
  `[Sell ore, Modules, Undock]`, reusing `profile.credits` and
  `profile.upgrades` (repurposed in place as "owned module ids" — same
  field the run log already displays, not a new one) rather than adding
  new schema. **Sell ore** (`sellOre()`): `ore / CFG.oreCreditRate` (10)
  credits, ore zeroed, `bumpInfluence(docked.poi, 1)`. This is a SEPARATE
  path from the delivery-run handover (`finishDocking`'s demo branch, which
  converts ore straight to run completion and does not award credits) —
  docking with a full hold in plain Sector mode (no active undelivered
  demo) correctly falls through to the manual sell option instead.
  **Modules** (`openModules`/`moduleKey`, same captured-input shell as the
  station menu itself): `MODULES` table, 5 entries — shield spool (raise
  1.5→1.0 s), shield pool (+50%), missile rack (8→12), warp tank (+50%),
  core cooling (×2) — each `{id, name, desc, cost, mass, cfg}`. Buying one
  pushes its `id` onto `profile.upgrades`; `moduleCfgOverlay()` merges every
  owned module's `cfg` into the live `CFG` object on every `applyTier()`
  rebuild (`Object.assign(CFG, CFG_DEFAULTS, TIERS[idx].cfg,
  moduleCfgOverlay())`), so a purchase takes effect immediately with no
  special-case code path elsewhere — confirmed in testing: `CFG.shieldRaiseMs`
  measured 1500 before buying shield spool, 1000 after, same session, no
  reload. `shipMass()` = `1 + (sum of owned modules' mass)/100`, feeds
  `simTick` by dividing both `CFG.thrust` and `CFG.turnRate` (no friction in
  space, so mass is purely a maneuvering tax) — verified by code inspection
  rather than a flight measurement, since testing had already fitted 3
  modules before a clean mass=1 baseline could be flown. `moduleText(i)`
  speaks price/mass/affordability three ways depending on state: "Already
  fitted" (owned), "Need N more credits" (unaffordable, buy refused, no
  credits deducted — confirmed), "You can afford it" (buyable). **Influence**
  (retired by Round 23, SPEC 3.23 — replaced by per-port favor; described
  here for history only) (`profile.stations[name].influence`,
  `bumpInfluence(poi, amt)`): +2 on
  the delivery handover (`finishDocking`), +1 on `sellOre`, +1 on a
  sector-entered combat-zone clear (`destroyTarget`, gated on `sectorHome`
  so the standalone Combat-training mission — no `sectorHome` snapshot —
  doesn't feed it). `influenceGreeting(poi)` prepends "Station Meridian
  control: good to see you again, pilot." to the arrival line once influence
  is `>= CFG.influenceThreshold` (3) — **read BEFORE that visit's own bump**,
  so the docking that pushes influence from 1 to 3 (via its delivery bump)
  does NOT get the greeting itself; the NEXT dock does. Confirmed both
  halves of that ordering in testing (first dock at the threshold: no
  greeting; a following dock: greeting present). Deliberately NOT built this
  round despite being in the original 1.7 sketch: Repair/Rearm/Restock
  Chaff/Refuel as paid actions (all four stay free on every dock, unchanged
  from before), hydrogen as a second sellable resource, a docking-computer
  module, and the shared `listMenu()` extraction — `STATION_ITEMS`/
  `stationMenuKey` still duplicates the mission-menu shell's shape, same
  deliberate deferral already precedented for the run log.
- **Sound options (Round 12, SPEC 1.12, from ideas3)**: two separate
  things. (1) **`B` cycles the POI beacons** On / Off / Target only
  (`BEACON_MODES`, live `beaconMode`, saved as `profile.beacons`). The
  mute is a dedicated gain node in `buildPoiVoice` between the lowpass
  and the panner — NOT `gain.gain`, because the beacon tremolo LFO is
  summed INTO `gain.gain`, so zeroing it would still swing the level by
  the LFO depth. `updateTargeting` drives every beacon's `nodes.mute`
  toward `beaconAudible(t)` with `setTargetAtTime` every frame, so a
  selection change from any source (Tab, the map, a mission start,
  `selectNearest`) is followed without any call site knowing beacons
  exist. The lock tick, T, Q, and "Locked. Distance N." all work with
  beacons silent — Brian's design: steer the nose onto the tick the way
  you would onto a ship. `B` also works at the mission menu and inside
  the Sound list; outside the sector it appends "Applies in open sector
  space." `sectorIntro`/`demoIntro` append `beaconNote()` when the mode
  isn't On. (2) **The `Sound` menu item** (`openSoundMenu`/`soundKey`,
  `soundMenu.open` gated in `onKeyDown` with the run log) — one line per
  `SOUND_CATS` entry (world / cockpit / effects), Left/Right cycle
  `SOUND_LEVELS` off 0 / quiet 0.35 / full 1, a short demo sound in that
  category after each change, saved as `profile.sound` (level INDEXES),
  `applySoundLevels()` at boot right after `audioStart()` and on every
  change. Engine side: a new `SIM.audio.worldBus` between every HRTF
  panner and `masterGain` (all seven `panner.connect(masterGain)` sites
  in index.html plus `worldOut` now land there) = World; `uiBus` =
  Cockpit; Effects = `SIM.cues.setLevel(v)`, applied by `play()` setting
  `SIM.audio.volScale` around the (synchronous) dispatch — every
  primitive's `vol` goes through `A.scaledVol()`, floor 0.0001 so an Off
  level doesn't break exponential ramps. Three cues used `setTimeout` for
  a second note (outside that window) — converted to `at:` offsets.
  **Gotcha found here**: `setBusLevel` first used `ramp()` and three
  quick level changes left the world bus stuck at 0.297; the
  cancelScheduledValues + setValueAtTime(`param.value`) idiom misreads a
  param that's mid-ramp. `setBusLevel` uses `setTargetAtTime` instead —
  any future param that can be re-targeted while in flight should too.
  Speech is never touched by any of this.
- **Combat**: 5 ships with Brian's recorded engine loops (`shipAsset` on the
  roster, oscillator fallback), hull values, orbiting Cruiser. **Enemies are
  passive until hit**: `provoke(t)` in `damageTarget` sets `t.hostile` (fuse
  `enemyProvokedS` 4 s); only hostile ships join the attack pool, so a ship
  killed in one burst never fires. Hostile ships shoot back (one attack at a
  time, `threat`): within `enemyLaserRange` 600
  they telegraph (3 rising chirps at THEIR position + "X locking on!") for
  1.2 s then a 5 s beam, 6 dmg/s; farther out they launch a missile with its
  own HRTF voice (25 dmg). Grace 8 s at start, gap 7–12 s. Player hull 100;
  0 = `lost` (Enter retries with a repaired hull in a standalone training
  drill; in the sector campaign or the delivery run, SPEC 2.16's tug
  instead — see "Death by tug" below). A missile survivor is
  "alerted": evade burst across the line of sight (burner whoosh, engine
  pitch-up, direction spoken) and it attacks within 2.5 s. **Chaff (`D`,
  SPEC 1.8)**: `chaff` magazine (`CFG.chaffMax` 4, refilled wherever
  `missiles` is — mission start, retry, `finishDocking`); `fireChaff()`
  spends one every press (Brian: a reflex, not a menu), and if `threat` is
  a guided missile flips it ballistic exactly the way a raised shield does
  (`guided = false; coast = 0`) — no shield needed, weapons stay live. A
  beam or nothing inbound still costs the round, with the line saying so.
  Veteran/Ace: the spoofed threat gets `followUp`, and `endThreat` then
  sets `threatIn = CFG.enemyChaffFollowUpS` (2 s) instead of the 7–12 s
  gap — the "second missile while the first coasts" from SPEC, built as a
  fast follow-up because `threat` is a singleton everywhere. `D` in open
  sector space refuses; at the mission menu D still jumps to Delivery run.
  Cue `chaff_burst` (UI bus). The `profile.chaff` field from the 1.4
  schema is still unused — chaff is per-sortie state like missiles.
  **Confirmed instant/any-time (SPEC 1.16, Round 13)**: no code change —
  `fireChaff()` never gated on a burst or on raised shields; a D press
  mid-burst spends chaff and answers in the same frame while the burst
  keeps running untouched, and a D press with shields fully up does the
  same. This is now the documented rule, not an accident.
  **Decoys confirmed working, and heard working (Round 28, SPEC 3.37,
  ideas10.txt)**: Brian wasn't sure decoys were doing anything. They
  were — `th.guided = false; th.coast = 0;` already sent a spoofed
  missile properly ballistic and the existing `stepThreat` coast-timeout
  branch already popped it clear with no hull contact — but nothing ever
  told the player it worked. A new `th.spoofed` flag (set only by
  `fireChaff`, never by the shield-drop branch that does the identical
  guided/coast reset) lets the pop distinguish the two: a spoofed
  missile's pop now plays a new `decoy_took` cue (two ascending notes at
  the missile's own position, world bus — deliberately not
  `chaff_burst`'s crackle, which stays the launch sound) and says "Decoy
  took it.", timed naturally by the real coast delay (no extra timer
  needed — launch and pop are already seconds apart). The launch line
  itself dropped its premature "Missile spoofed" for "Decoy away.
  Missile going ballistic." — the actual confirmation now comes from the
  pop. The rare case where a spoofed missile's ballistic path still
  clips the hull got its own line too: `hullHit()` gained an optional
  `prefix` param, folded into its one `say()`, used for "Spoofed missile
  clipped you." **Proving it needed a real live guided missile**, the
  fiddly part: the standalone Combat drill's ships hold fire until hit,
  and this project's own lasers plus Rookie's ×2-vs-ships multiplier
  one-shot most of the roster on a full-aim burst (confirmed the hard
  way — killed a Raider, then a Cruiser, before finding the trick) — and
  aiming AWAY doesn't help either, since `beamTick` only calls
  `damageTarget` (hence `provoke`) when `dmg > 0`, so a dud shot never
  even provokes. What worked: fire a full-aim burst at the Cruiser
  (guaranteed real damage → a real provoke) while repeatedly
  `poke({enemyHp: 999})`-ing it back up between ticks so it survives —
  Rookie's Cruiser is `missileOnly`, so once hostile its first attack is
  guaranteed to be a missile. Confirmed live: `state().threat.guided ===
  true`; D flipped it false and said "Decoy away. Missile going
  ballistic. 3 left."; stepping past `missileCoastS` produced "Decoy
  took it." with the hull untouched; forcing a fresh spoofed missile's
  position onto the ship before its coast timer expired produced
  "Spoofed missile clipped you. Your hull 75." with the expected 25-
  point hit. Zero console errors. Not yet heard by Brian — the
  confirmation sound is new.
- **Shields (`G`)** (damage pool as of Round 11): 1.5 s spool (2.5 s at Ace,
  rising sweep) → clunk + hum on the UI bus. Weapons offline while up; own
  missile AND incoming missiles lose guidance (go ballistic, coast 1.5 s,
  pop — an unguided incoming missile still splashes on a raised shield or
  hurts if dropped early). No hold timer: `CFG.shieldPool` 45 (1.5× a full
  enemy beam) drains by the exact damage of every absorbed hit
  (`absorbShield()`), so a beam can partially drain the pool then spill the
  remaining ticks onto the hull mid-burst. "Shields failing" once, the
  first time the pool drops under 25%. Pool hits 0 → DISREPAIR
  (`shield.repairing`, `CFG.shieldRepairS` 12 s, audible ratchet-tick loop
  on the UI bus quickening as it nears done): shields can't be raised again
  until it finishes, then return at `shieldRepairReturn` 0.5 of the pool +
  chime. A manual drop (`G` while up, pool not empty) skips disrepair
  entirely — whatever charge is left just regenerates at `shieldRegenPerS`
  3/s like any other down-and-not-full shield.
  **Escort and defend missions (Round 15, SPEC 2.17)**: offered from a
  station's hail menu (`HAIL_ITEMS` gained "Missions", a nested submenu —
  `hailMenu.submenu`, `MISSIONS`, `missionsKey` — same shape as the
  station menu's Modules list). Accepting one snapshots `sectorHome`
  (same as any combat/mining entry) and calls `newGame('combat', spec)` —
  `mode` stays `'combat'` the whole time; a `mission` object layers the
  objective on top, the same relationship `demo` already has to
  `'combat'`/`'mining'`, rather than mission becoming its own `mode`
  value (which would need threading through `updateEnemies`/
  `statusReport`/`tugCandidate`/the map's win-gate, all of which key off
  the literal string `'combat'`). `makeMissionRoster(mission)` builds ONE
  `kind: 'friendly'` target (Freighter hull 200, reusing the training
  roster's own Freighter voice/engine loop; or Miner hull 150, oscillator
  only) — `buildVoice()` needed no changes, already generic enough.
  `selectNearest`/`cycleTarget` gained a `kind === 'friendly'` exclusion
  so it's never Tab-cycled. Raiders arrive in scripted waves
  (`spawnMissionWave`, `CFG.missionEscortWaveTimes` [15,45,75] / size 2,
  `CFG.missionDefendWaveTimes` [10,45] / size 3), always named plainly
  `'Raider'` (not numbered) so SHIP_CLASS/SALVAGE/laser-matchup — all
  keyed by exact ship name — resolve correctly; the trade-off is that Tab
  can't distinguish two at once by name, only bearing/distance.
  **The provoke/victim mechanic (the one deliberate simplification)**:
  spec wants raiders to "target the freighter unless the pilot hits them
  first." The full version would mean threading a victim parameter
  through `startEnemyLaser`/`startEnemyMissile`/`stepThreat` — the exact
  machinery every OTHER combat scenario (drills, the sector's Contested
  Zone, the delivery run) already depends on and is heavily tested;
  touching it risked regressing all of them for one feature that doesn't
  need it. Built instead as a side-channel: `provoke(t)` (runs on every
  `damageTarget` hit regardless of mode) now unconditionally sets
  `t.provoked = true` before its existing hostile-latch logic — inert
  outside a mission. `updateEnemies`'s candidate pool, which every
  mission raider is otherwise eligible for (they spawn `hostile: true`
  from the start, per spec), checks `mission ? t.provoked : t.hostile` —
  so only a raider the PLAYER has hit ever joins the real telegraph/beam/
  missile fight, using every one of those systems completely unchanged.
  Every still-unprovoked raider instead gets picked on a
  `missionStrikeGapMinS`–`MaxS` (6–10s) timer by `missionStrike(t)` in
  `updateMission(dt)`: a one-shot tone plus `CFG.missionStrikeDmg` (15)
  off the friendly's hp, one combined `say()` ("Raider hits the
  Freighter. Freighter hull N percent."). Confirmed in testing that both
  systems run correctly side by side: hitting one raider with a missile
  (survived) made it immediately start telegraphing/firing at the
  player through the untouched vanilla system, while its still-
  unprovoked wave-mates kept hitting the friendly on their own schedule.
  `destroyTarget`'s generic "all targets destroyed = victory" check is
  skipped entirely when `mission` is set (the friendly stays alive the
  whole mission, so it would never fire for escort and would fire too
  early — after any single wave — for defend); win/loss instead comes
  from `updateMission` (escort: the `CFG.missionEscortLegS` 90s leg
  timer with the friendly still alive; defend: both waves sent and every
  non-friendly target dead) and `missionStrike` (the friendly's hp
  reaching 0). `missionEnd(success)` sets `won = true` for BOTH outcomes
  (never `lost` — the player's own ship isn't destroyed by a mission
  failure, only the friendly is) and pays `CFG.missionCredits` 300 plus
  one influence point only on success. Enter is refused after either
  outcome (a mission doesn't replay in place — it's cooldown-gated from
  the hail menu, not farmable) with the generic retry path (which would
  have run `combatIntro()` and said something nonsensical) now gated to
  skip entirely whenever `mission` is set. **Cooldown** needed an actual
  game-time clock outside the delivery run (the only other one,
  `demo.elapsed`, only exists mid-delivery-run): added `simClock`, a
  plain session counter advanced in `simTick` on the same gate as
  everything else, NOT persisted across a reload (same as `demo.elapsed`
  isn't) — `missionCooldownUntil = {escort, defend}` are simClock
  timestamps, checked by `missionAvailable(kind)`. **Interaction with
  the SPEC 2.16 tug, left untouched on purpose**: a mission always sets
  `sectorHome` like any sector encounter, so the player's own ship dying
  mid-mission routes through the ordinary tug path with zero
  mission-specific code, confirmed in testing (`mission` cleanly cleared
  to null by the time the tug docked, via the same `clearMission()` the
  tug's own arrival already calls). Machine-tested end to end (hail →
  Missions → accept → wave spawns → provoke-and-redirect → a raider kill
  → the full leg → success/reward/Enter-refusal/X-cleanup, then Defend →
  a forced failure → the "no reward" message, then both kinds correctly
  refused on cooldown, then a mid-mission player death correctly routed
  to the 2.16 tug) plus a full regression pass on the untouched
  standalone Combat training drill (all five destroyed still says
  "Victory", Enter still restarts it byte-for-byte as before). Zero
  console errors throughout. Not yet heard by Brian — every sound this
  round touches (the strike tone, the wave-inbound line, the
  mission-complete fanfare) is new.
  **Second pass and kill buffs (Round 18, SPEC 3.25)**: Brian flew 2.17
  and found the escort too hard to feel good and too short to build to
  anything. `missionEscortLegS` 90→180, escort's waves 2→3 of 2→3 Drones
  each (`missionEscortWaveTimes` [15,45,75]→[20,70,120] — the third wave
  now lands with a minute left, so a pilot who cleared the first two
  still has the freighter under fire as it leaves); defend keeps its own
  two waves of three. `missionStrikeDmg` 15→8. `MISSION_WAVE_STATS`
  (escort→Drone hp40, defend→Raider hp80, both carrying their own
  voice/asset/salvage) replaces the single hardcoded Raider spawn so
  `spawnMissionWave` and `missionIntro` both read the right ship name/
  class per mission kind — the friendly still only ever calls its
  attackers "Raiders" for defend and "Drones" for escort, and
  `missionIntro`'s "clear any X that engages you" / "from the X waves"
  phrasing is generated from the same table (see the grammar bug below).
  **The friendly gets a shield**: `f.shieldPool`/`f.shield` (60,
  initialized in `makeMissionRoster`) absorb `missionStrike`'s damage
  before hull, regenerating `friendlyShieldRegenPerS` 1.5/s in
  `updateMission`. **A real bug found here**: a naive `hadShield =
  f.shield > 0` check re-announced "Freighter shields down." on every
  hit once the shield sat near zero and ticked back up a fraction
  between strikes (continuous regen vs. an instantaneous transition
  check — the same bug shape as SPEC 2.15's speech-collision lesson,
  but a different mechanism). Fixed with a sticky `f.shieldDown`
  boolean: the "just dropped" line fires only on the transition into
  `shield <= 0.5`, and only re-arms once shield genuinely recovers past
  10% of the pool. Confirmed via `Math.random`-seeded, `__sim.poke`-
  forced repeated strikes that the line now fires once, stays silent
  through consecutive low-shield hits, and correctly re-fires after a
  real recovery-then-second-drain. **Partial reward**:
  `missionEnd(success)` now pays `CFG.missionCredits × (friendly.hp /
  friendly.maxHp)`, rounded, spoken as "Mission complete. Freighter home
  at N percent. M credits." — a wounded-but-alive friendly still pays,
  just less. **Kill buffs**: `rollKillBuff()`, three independent
  sequential `Math.random()` rolls (missile resupply
  `killBuffMissileChance` 0.35 → +1 missile; laser boost
  `killBuffLaserChance` 0.35 → `laserBoostUntil` extends to a fresh
  `killBuffLaserS` 30s window, `beamTick`'s damage line multiplies by
  `1 + killBuffLaserPct` (0.25) while active, a second grant resets
  the timer rather than stacking, a `setTimeout` speaks "Laser boost
  over." at expiry (guarded by comparing the captured deadline to the
  live `laserBoostUntil`, so an extension doesn't produce two
  "over" lines); shield top-up `killBuffShieldChance` 0.3 → +15 to the
  pool or −4s off an in-progress disrepair) — called from
  `damageTarget` on every ship kill (`!t.kind` gate, same as salvage),
  folded into the SAME `say()` as the salvage/kill line (never its own
  — the SPEC 2.15 rule applied again on purpose), and confirmed firing
  in the standalone Combat drill too, not just inside a mission (a
  kill is a kill, per Brian). **The grammar bug**: `missionIntro()`
  originally built one pluralized `word` used both for "clear any X
  that engages you" and "from the X waves" — the latter needs the
  singular ("raider waves", not "raiders waves"). Split into
  `singular`/`plural` locals; re-verified live after the fix. Machine-
  tested at a local server end to end (both mission kinds accepted
  fresh with a properly-cleared profile — clearing `localStorage` has
  to happen in a script call BEFORE the page reload, not folded into
  the same script as the boot click, since `loadProfile()` already ran
  against the old profile by the time a same-script `removeItem` would
  fire — a repeat of an established gotcha), both intros' corrected
  wording confirmed, the shield-down sticky fix confirmed via forced
  repeated strikes, all three kill buffs confirmed via seeded
  `Math.random` sequences (kept mocked through an `await` spanning the
  actual kill resolution inside `beamTick`'s tick-by-tick `setTimeout`
  chain, not restored right after the keypress), the laser boost's
  1.25× damage and non-stacking extension confirmed, the partial-reward
  math confirmed at both full and damaged friendly hull, F2/F3/I all
  confirmed reading the friendly's shield/hull and the boost countdown.
  Zero console errors. Not yet heard or flown by Brian.
  **The quadrant's own timed contract (Round 22, SPEC 3.28)**: a third
  mission alongside escort/defend, but Station Meridian's alone —
  `CONTRACT_MISSION` is held out of the `MISSIONS` array and only
  appended by `activeMissions()` when `hailMenu.poi.name === 'Station
  Meridian'`. Accepting it (`startMissionRun('contract')`) never enters
  a combat encounter the way escort/defend do — no `sectorHome` snapshot,
  no `newGame('combat', spec)` — it just starts a module-level `contract`
  object (`{elapsed, combatCleared, delivered, quotaSaid}`, byte-for-byte
  `demo`'s own shape) and hands the pilot back to the quadrant they were
  already flying. `destroyTarget()`'s zone-clear check and
  `dockAtStation()`'s delivery check both gained a `contract` branch
  parallel to their existing `demo` one (the delivery branch additionally
  gated on `poi.name === 'Station Meridian'`, since only home completes
  it); a new `contractDockNote()` names whichever of the three steps
  (zone, ore, station) is still outstanding when a dock doesn't complete
  it. `oreSellBlocked()` now also checks `contract`, so Sell ore refuses
  anywhere while one is open, same rule the demo already had.
  **Deliberate simplification, flagged for Brian's call**: unlike the
  demo, mining is NOT hard-blocked before the zone is cleared — the open
  quadrant stays a free-flight sandbox, and only the final delivery is
  gated on `contract.combatCleared`; ore mined early still counts once
  the zone is cleared. **A real bug found and fixed**: `contract` is
  never reset to null on a successful delivery (`delivered: true`
  lingers on purpose, so F2's Contract heading still has something to
  report) — the first `missionAvailable('contract')` checked bare
  truthiness of `contract`, which meant a completed contract stayed
  permanently un-reofferable regardless of the cooldown timer counting
  to zero. Fixed by checking `contract && !contract.delivered` instead.
  Its own log, `recordContractRun()` writing to `profile.contractRuns`
  (byte-for-byte `recordRun`'s own bookkeeping) — the Run log (last
  mission-menu item) now lists delivery-run times first, then contract
  times after, one flat list, each line self-labeled so the two boards
  never merge or sort against each other. F2 gained a conditional
  "Contract" heading independent of the existing "Mission" heading (an
  escort/defend encounter and an open contract can be live at once,
  since accepting one never touches the other); `exitToMenu()` clears
  `contract` to null the same way it already cleared `demo`.
  `PROFILE_VERSION` → 5 (`contractRuns: []`,
  `missionCooldownUntil.contract: 0`), migrated the same way every prior
  bump was — `Object.assign` preserves an old save missing the fields,
  an `Array.isArray` guard backfills a malformed one defensively.
  Machine-tested at a local server end to end: the Meridian-only Missions
  list gating, accepting leaving `mode` and `sectorHome` untouched, the
  zone-clear branch (via both real fired shots and `poke({combatCleared:
  true})`), a full delivery paying exactly 1,700 credits (15,000 ore +
  the 200 bonus) and recording a "New personal best!", all three
  `contractDockNote()` refusal branches, the cooldown-reopening bug
  before and after its fix, F2's new heading, the run log's combined
  listing, and a full regression pass confirming the escort mission still
  accepts and enters combat unaffected by `activeMissions()`'s new
  station-aware filtering. Zero console errors. Every contract number is
  a placeholder for Brian's ear. Not yet heard or flown by Brian.
  **Favor and the three ranges (Round 23, SPEC 3.23, PARTIALLY DONE)**:
  replaces the flat `profile.stations[name].influence` count with a real
  per-port standing meter, `profile.quadrants[q].ports[name] = {favor,
  peakFavor, lastVisitHour}` — `bumpInfluence`/`influenceGreeting`
  retired outright. Tiers `favorKnown` 10 / `favorTrusted` 40 /
  `favorAllied` 70 gate three ranges instead of two: `stationCommRange`
  500→2000 (talk, any tier), new `stationTransporterRange` 600 (hand
  cargo over — Rearm/Sell ore-salvage-alloy/Buy reaction mass, needs
  Known; built as an ADDITIONAL access tier, not a relocation — every one
  of those actions stays reachable from the docked station menu too),
  `stationDockRange` unchanged at 150 (needs Trusted, or refuses by name
  with the favor numbers). `callPoi()`'s station branch picks the
  innermost range physically reached and gates it by
  `favorTierAtLeast(poi, tier)`, which returns `true` unconditionally
  during `demo` — the fixed delivery run's own Meridian stays completely
  unconditional, exactly as before. Favor gains: `favorMission` (8) on
  any completed mission (escort/defend, and this round's own reading of
  SPEC 3.28's contract as "a mission for Meridian" too) — `mission` spec
  objects now carry `poiName` (stamped at accept time), fixing a
  **pre-existing bug**: mission favor/influence was hardcoded to credit
  Station Meridian regardless of which station actually offered it.
  Selling ore/salvage/alloy adds `favorPerWantUnit` (200/4/4) — no
  per-station "wants" table exists yet (that's 3.11), so every sale
  counts, folded into the same `say()` as the credit total ("+1 favor.").
  `favorDeliveryHandover` (10) is the one favor change that fires even
  during `demo` — `writeFavor()` bypasses gainFavor/loseFavor's own demo
  guard on purpose here, the spec's own named exception. Losses:
  `favorFriendlyLost` (25) when a mission's own friendly dies
  (`missionEnd(false)`, which as built only ever fires that way);
  `favorFail` (10) for an ABANDONED-but-still-alive mission, caught in
  `clearMission()` itself (`if (mission && !mission.ended)`) since every
  abandonment path funnels through there before `mission` is wiped —
  deliberately not applied to an abandoned contract, which risks nothing
  the way a mission's friendly does. Decay (`favorDecayPerHour` 1/hour,
  floored at `favorFloorTiers` 1 tier below the best ever reached) is
  computed lazily in `reconcileFavor()` on every touch, not a ticker.
  Range-growth: three new MODULES (`comm_array`/`transporter_booster`
  +50%, `docking_computer` doubles) through the existing
  `moduleCfgOverlay()` with zero new plumbing; a new `stationRangeFor(kind,
  poiName)` layers an Allied station's own +25% (`alliedRangeBonus`) on
  top, per station. The tug (SPEC 2.16) reworked: `nearestTrustedStationTo()`
  replaces "nearest station" with "nearest station that trusts the
  pilot" at the base wait; none qualifying means the long way home to
  Meridian by name at `tugHomeFactor` (2×) — replaces the old
  influence-halving model entirely. F2 gained a "Station access" heading;
  I speaks the selected station's tier in comm range; the map's own
  per-station line does too. `PROFILE_VERSION` → 6, folding an old save's
  influence in at ×10 (only when there's real data to migrate — the
  bare-shell-with-no-real-data case is exactly what forced
  `ensureQuadrantHome()`'s "already initialized" guard to check `.zone`
  specifically rather than the quadrant record's mere existence, since
  the migration can now pre-create a hollow shell just to hold favor).
  **Deliberately NOT built**: Control (Invest, the tithe, unions,
  quadrant-wide comms) — every one of those needs 3.11's wants table to
  mean anything, so shipping the meter with no way to raise it would
  just be dead code; F4 pricing, also 3.11's own item. **Two real bugs
  found and fixed**: (1) the v5→v6 migration's first draft unconditionally
  pre-created a quadrant shell even for a profile with nothing to
  migrate, crashing `__sim.state()`'s own `q.zone.name` read on the very
  first fresh-boot test — fixed by only creating the shell when there's
  real `profile.stations` data, plus hardening the accessor's guard to
  check `.zone` too. (2) **The load-bearing one**: `reconcileFavor`'s
  floor logic applied `Math.max(floor, decayed)` unconditionally, which
  doesn't just stop decay from crossing the floor downward — it snaps
  ANY value already below the floor UP to it the instant the port is
  next touched, regardless of why it got there (a real
  `favorFriendlyLost` loss included). Confirmed via a direct repro (5
  favor + a +10 gain came out to +15, the floor silently adding 5 before
  the real delta was applied) and independently verified fixed via a
  standalone Node.js simulation of the corrected logic. Fixed by only
  invoking the floor when favor started at or above it. **A genuine
  testing-methodology snag, not a game bug**: the sandboxed browser pane
  kept surfacing old profile data on supposedly-fresh boots despite
  `localStorage.clear()` confirmed empty immediately beforehand, even
  across closed tabs and restarted local servers — every conclusion this
  round still holds because each check compared "before" against "after"
  within one continuous script rather than trusting a fresh reload for a
  clean baseline. Machine-tested at a local server: Station Two's
  Unknown-tier refusals (transporter and dock) by name; two escort
  missions there crossing Known (8+8=16, correctly attributed instead of
  going to Meridian); selling ore's spoken favor gain; Trusted unlocking
  docking; an Allied station's ranges measured exactly 1.25× base;
  `comm_array` measured `stationCommRange` at exactly 3000; the tug
  picking a nearby Trusted station at the base wait and doubling the
  wait home to Meridian when none qualifies; the v5→v6 migration
  confirmed against a seeded old-influence profile; the demo's own
  Meridian confirmed completely unconditional regardless of the open
  quadrant's favor; F2's new heading; a regression pass on the escort
  mission. Zero console errors throughout. Every favor/range number is a
  placeholder for Brian's ear. Also worth his ear: Station Meridian
  starts EXACTLY at `favorTrusted` (40), its own tier boundary with zero
  buffer, so any decay at all drops it into Known until touched again —
  observed directly in testing, a higher starting value would give it
  real headroom as home. Not yet heard or flown by Brian.
  **Favor, second pass (Round 25, SPEC 3.33, ideas9/ideas10)**: answers
  Brian's own review of the Round 23 build above. `reconcileFavor` is
  gone, split into `decayedFavor(port)` (a PURE calculation, never
  mutates — called from every read, including the per-frame range-band
  checks that were the whole bug) and `touchPort(port)` (commits accrued
  decay and resets the absence clock, called only from a real
  interaction — hail, dock, sale, donation, mission accept). Decay now
  only runs at all once favor reaches `favorAllied` (70) —
  `favorDecayStartsAt` — and `favorFloor(port)` (permanent `favorTrusted`
  once `peakFavor` ever reaches it) is applied by BOTH the decay clamp
  and `writeFavor`'s own gain/loss clamp, so the floor holds against a
  hard loss too, not just decay — Brian's literal "favor should not ever
  go below 40." `ensurePort` no longer special-cases Station Meridian at
  all — nobody starts favored. Five tiers (`favorHonored` 90,
  `CFG.favorRangeBonus` per-tier replacing the old Allied-only bonus,
  `honoredDiscountAt(poi)` threaded through module/laser/repair/reaction-
  mass pricing). `favorMission` 8→16, `favorPerWantUnit.ore` 200→500,
  a revived `favorZoneClear` (16, the old influence-era zone-clear bump
  SPEC 3.23 had retired, now back with its own rate) paid at
  `nearestStationTo(sectorHome.pos)` on a real `!demo && sectorHome`
  zone clear — the SAME event also sets
  `profile.quadrants[q].openComms` the first time it happens, letting
  `callPoi()` hail any station from anywhere in the quadrant (comms
  tier only) once true. A shared `DONATE_ORE_ITEM` (comms AND
  transporter menus) gives `floor(ore / donateOrePerFavor)` (2,000/pt)
  favor for the whole hold, no credits — the "20k skips the stranger
  gate" path Brian described, alongside the zone-clear's own one-fight
  path. Machine-tested: a port poked to 80 favor with its clock parked
  1,000 hours in the past read back stable across three repeated reads
  (the exact signature the OLD bug would have shown — further decay on
  every read); a real touch afterward correctly floored the commit at
  40 and reported "We trust you" with Trusted's own ranges; a real
  5-kill zone clear folded "Quadrant-wide comms open" into the victory
  line once, and a hail from 14,240 units out then succeeded. Zero
  console errors. Not yet heard or flown by Brian.
  **Correction (Round 26, ideas11): the home station IS the exception.**
  Brian played the build above and reversed "nobody starts at 40,
  Meridian included" — the home station should "never not have favor."
  `ensurePort` now seeds Station Meridian, in the home quadrant
  specifically (`profile.quadrantId === 'home'`), at `favor`/`peakFavor`
  both `favorTrusted` (40) on first creation — every other port, and
  Meridian in any future non-home quadrant, still starts a stranger at
  0. The existing `favorFloor` rule (`peakFavor >= favorTrusted` ⇒ floor
  there) makes this permanent for free, no new special-case needed
  anywhere else. This also quietly resolves a standing inconsistency:
  the game's own help text had said "Station Meridian starts Trusted —
  it's home" the whole time, unchanged since Round 23 — the "nobody
  starts favored" rewrite above never touched that line, so the shipped
  build briefly disagreed with its own help screen. They agree again
  now. Machine-tested: a fresh profile's first Sector entry shows
  Meridian at favor 40/peakFavor 40 and Station Two at 0/0 in the same
  read; hailing Meridian immediately says "We trust you" with Trusted's
  ranges; forcing its clock 100,000 hours stale and hailing again still
  reads exactly 40. Zero console errors. Not yet heard or flown by
  Brian.
  **A full stop to dock (Round 25, SPEC 3.34)**: `CFG.dockMaxSpeed` (2)
  checked in `callPoi()`'s dock branch before the favor check —
  `len(ship.vel) > dockMaxSpeed` refuses by name with the rounded speed.
  The tug's own arrival was already safe by construction (`tugArrives()`
  zeroes velocity via `clearMission()` before calling `dockAtStation`
  directly, bypassing this gate entirely) — confirmed by inspection.
  Machine-tested: speed 14 refused, speed 1 docked. Zero console errors.
  **Reaction mass matters (Round 25, SPEC 3.32)**: `RCS_PER_KILL`
  (interceptor 6/corvette 9/cruiser 15, next to `SALVAGE`) folds into
  `damageTarget`'s existing kill line via `addKillRcs`, never a second
  `say()`; `dustTick()` adds a SILENT per-tick trickle
  (`amount * CFG.rcsPerDustUnit`, checked on F3 rather than spoken —
  it's fractions of a unit at a time); `CFG.rcsMission` (25) added to
  both `missionEnd(true)` and the SPEC 3.28 contract's own completion
  (flagged as effectively masked there — completing the contract always
  means docking, which already refills reaction mass to full regardless).
  The old, never-actually-wired `CFG.rcsPerKill` (flat 5) is retired
  outright rather than kept alongside the new table. A new
  `window.__sim.runBudget(scenario)` is a ROUGH, clearly-labeled ESTIMATE
  from the CFG numbers (not a physics simulation — Brian's own text
  grants this can't be pinned down exactly), reporting `'clean'` at 58%
  of the tank remaining and `'sloppy'` at 0% (`onBattery: true`) — both
  land where the spec's own target says they should. Zero console
  errors. Every reaction-mass number is a placeholder Brian is meant to
  fly and judge himself. Not yet heard or flown by Brian.
  **The lab, second pass (Round 25, Phase 3L L.1b/L.4b/L.5b/L.8b,
  ideas9)**: a new "3D grid cursor" (`gridStart`/`gridArena`) sits
  ALONGSIDE L.1's polar explorer, not in place of it — raw world-unit
  position, `GRID_STEP` 100 (Shift 25), coordinates read back as
  grid-cell counts ROUNDED to the nearest coarse cell (a deliberate
  simplification, flagged: a fine Shift-step can leave the cursor off
  the coarse grid, and rounding was simpler than inventing a second,
  finer grid). The flyby's `FLYBY_ROUTES` now load `propeller_plane5–8`
  (1–4 dropped from the demo); the stunts no longer play any recording
  at all — `flybySynthPropellerStart/Update/Stop` build a sawtooth buzz
  plus `SIM.audio`'s own shared `noiseBuf` through a bandpass filter,
  pulsed by an LFO, both re-targeted every tick by the stunt's own
  computed speed (distance moved since the last tick, over real
  elapsed time). The vortex's per-node `height/sway/offset` are gone,
  replaced by one shared `vortexGroup` — Home/End is now a **tilt**
  (0–90°) rotating the orbital plane from flat (x-z) toward vertical
  (x-y, blending the `sin(angle)` term between z and y), `[`/`]` mute/
  un-mute down to N of 8 audible (ramped, not stopped, so un-muting
  mid-run doesn't restart anything). The room drops its five synthesized
  voices and its quiz entirely for four real manifest assets (asteroid,
  propeller plane, mining laser, vortex) playing at once from
  randomized positions, turning 90° the SAME direction every ~10s and
  reporting the listener's own cumulative facing relative to the start
  plus each asset's new bearing in natural phrasing ("The asteroid is
  now behind you," matching Brian's own example). **A real, pre-existing
  bug found in this round's own testing, unrelated to any of the four
  items above**: `stopAll()` cleared its own `activeStopFns` registry
  after every call, but `registerStop()` is only ever called ONCE per
  demo at page-parse time (a permanent registration) — so the very
  first `stopAll()` on a fresh page (fired automatically the instant
  ANY demo's own `xStart()` ran, since every demo silences the others
  first) permanently emptied the registry, silently breaking BOTH the
  STOP ALL button and "every demo stops every other" for the rest of
  that page's life. Confirmed via a direct repro (7 registered
  functions logged on the first call, 0 on every call after) and fixed
  by simply never clearing the registry — every stop function already
  checks its own state before doing real work, so there's nothing to
  re-arm. Re-confirmed working after the fix across two separate STOP
  ALL presses. Zero console errors throughout all four demos and the
  bug fix. Not yet heard by Brian.
- **Auto-target — the stabilizers aim the ship (Round 28, SPEC 3.38,
  ideas10.txt)**: Brian's own words: "i just did a combat mission where
  i just could not get the cruiser targetted." **Shift+T is rebound**
  from cycle-back to this (Shift+Tab keeps cycling back, untouched) —
  split out of the shared shift-chord block into its own
  `autoTargetKey()`. With a target selected, it spends one of
  `autoTargetCharges` (3 a sortie, refilled everywhere missiles are) and
  hands the stabilizers the ship: `updateAutoTarget(dt)`, called from
  `simTick` right after the manual arrow-key block (so a held arrow that
  same frame cancels it first — the pilot always wins, charge already
  spent), steers `ship.yaw`/`ship.pitch` toward the target's true
  bearing via a new `angleTowards`/`angleDiff` pair (shortest-path,
  correctly wrapping through ±180°), flips `holding` true the moment
  `aim(t.pos).err` is inside `CFG.autoTargetAimToleranceRad` (1°), and
  from there holds `CFG.autoTargetHoldS` (5s) while STILL steering every
  frame — tracking a moving target, since an orbiting Cruiser losing
  lock mid-hold was the whole problem — before releasing with
  "Auto-target released." The rate is derived, not tuned directly:
  `autoTargetRateRadPerS() = max(π, CFG.pitchLimit) /
  CFG.autoTargetWorstTiers[tier-1]` — π (180°) always wins since
  `pitchLimit` is 85° — matching Brian's own worst-case framing (dead
  behind, max pitch) exactly. `autoTargetTier()` reads ownership
  directly (`CFG.autoTargetTestFit`, then `auto_target_3/2/1` in
  `ownedModules()`) rather than through `moduleCfgOverlay()`, since
  which tier is owned decides WHICH worst-case time applies, not a flat
  value to overwrite — the tractor beam's own pattern (SPEC 3.30),
  reused; three new MODULES entries (`cfg: {}`, gating only) follow the
  same shape. A steady `autoTargetHum` (sine, UI bus, ramped) sounds for
  the duration. A fourth `rollKillBuff` roll can hand back a charge.
  F2 gained a conditional "Auto-target" heading (only once fitted, same
  "no placeholder before the feature exists" rule as the Tractor
  heading) and `I` gained a line. New test hooks: `poke({yawDeg,
  pitchDeg})` (forces the ship's own facing directly — needed to
  engineer the exact worst case without hand-flying there) and
  `state().autoTarget`. Machine-tested at a local server against a REAL
  selected target: facing it, then flipping yaw 180° and pitch to -85°
  (the engineered worst case) and pressing Shift+T measured `holding`
  flipping true at EXACTLY 2,000ms via repeated small `__sim.step()`
  calls — Brian's own "2 seconds" requirement, hit exactly; a fresh
  engage measured the mid-slew rate directly at 90°/s (45° covered in
  0.5s, exactly 180°/2s); the 5-second hold released on schedule; an
  ArrowLeft press mid-slew canceled it at once with the charge still
  spent and manual turning resuming the same frame; three charges spent
  in a row correctly refused a fourth ("No auto-target charges. The
  station refills them."); F2 read "Tier 3, 2 seconds worst case, holds
  5 seconds once aimed. Test fit." and the live charge count. Zero
  console errors throughout. Every number — the three tier times, the
  hold, the charges, the module prices — is a placeholder for Brian to
  fly and judge, per his own request that the fastest tier ship first.
  Not yet heard or flown by Brian.
- **Weapons — lasers (Round 12, SPEC 1.9)**: six slots (`profile.slots`,
  `LASERS` data table), keys `1`-`6`, Shift+1-6 select (`selectSlot(i, reverse)`
  — **Round 18, SPEC 3.24 fix**: Shift+digit never actually worked from a
  real keyboard before this round, since a real Shift+1 sends `e.key: '!'`
  on a US layout, never matching the plain digit switch; a
  `/^Digit([1-6])$/.exec(e.code)` check ahead of it now reads the digit
  from the physical key instead, independent of shift state or layout —
  as of SPEC 1.14 a switch to ANOTHER slot takes `SLOT_SWITCH[i].s` seconds, 1.4–3.2
  by slot, Brian's per-slot clip mapping 3/4/5/1/2/6; the slot's
  `laser_switch` recording plays on the UI bus time-stretched via
  `playbackRate = clip length / s` to fill exactly that window, Space is
  refused meanwhile, `laserSwitch` holds the state and `stopLaserSwitch()`
  runs in `clearMission`; an empty slot refuses with no delay and cancels
  any switch in progress, a burst in progress refuses the switch).
  **SPEC 2.12 (Round 14)**: slots 1 and 2 are now FAMILIES rather than
  individually-fitted lasers — `LASER_FAMILIES` (`mining`: 8 ticks/8 s
  burst, tickBase 15; `rapid`: 10 ticks/5 s burst, tickBase 6) generates
  all 16 `LASERS` entries (`mining1`-`8`, `rapid1`-`8`), each version's
  per-tick damage `tickBase × 1.1^(version-1)`, rounded. Re-selecting the
  CURRENT slot no longer just restates it — `cycleLaserVersion(i, dir)`
  advances (plain key) or retreats (Shift) to the next/previous version,
  wrapping 1–8, and rewrites `profile.slots[i]` to the new id; it runs
  through the exact same `startSlotSwitch(i, L)` (same clip, same delay)
  as changing slots, per Brian: "it takes the same amount of time and
  uses the same sound triggers." `hullMult`/`rockMult` are gone from the
  `LASERS` entries — `laserMatchupMult(L, t)` replaces them, reading each
  family's `strong`/`weak` arrays against the target (a rock's
  `t.type.name.toLowerCase()`, a ship's class via a new `SHIP_CLASS` map
  — Freighter/Cruiser = cruiser, Raider/Scout = interceptor, Drone =
  corvette) for `CFG.laserMatchupStrong` 1.3 / `CFG.laserMatchupWeak` 0.7
  / 1 in between; `CFG.laserShipMult` (Rookie, 1.20) still multiplies on
  top for ships only. `STARTING_SLOTS` is now `['mining1', 'rapid1']`.
  All 14 remaining laser recordings are in the manifest (mono 48k 96k
  like the rest, ~1.6 MB added when this was still base64 — SPEC 2.19
  later moved all of it to fetched files) — every laser slot in the game
  now has real recorded audio, no synthesized carrier fallback needed
  for these two families. Space fires the
  selected laser via `startBeam('laser')`. Ship starts with `mining1` (slot
  1, steady 20/20/20/20/20 damage profile) and `mining2` (slot 2, front-
  loaded 35/35/10/10/10); slots 3-6 empty until the station sells more.
  **Fire-and-forget, cannot be stopped**: a burst runs all 5 ticks
  (`L.ticks[beam.tick]`, 1 s apart) to completion; `G` is refused mid-burst
  ("Laser burst in progress... Shields after") — commit to the burst, then
  shield. Each tick still scales by aim quality and `laserRangeMult`
  (×1.6 point-blank tapering to ×1 at `laserRange` 600); `hullMult`/
  `rockMult` per laser (both 1 for now) are where "good in combat" vs "good
  at mining" will live. Then `cooldownS` (3 s) per SLOT before it fires
  again, tracked in `laserReadyAt[]`, cleared on mission reset. The
  recording (`laser_mining1`/`laser_mining2` in `audio_assets.js`) plays as
  the burst's voice with a small aim-quality playback-rate nudge; the old
  synthesized carrier is the fallback if the asset is missing. Damage
  numbers are placeholders (100/burst point-blank, matching the old single
  beam's total) until Brian sets each laser's real per-tick profile by ear.
  **Gotcha**: `laserMissWindowMs` had to move 8000→11000 (Ace 12000→16000)
  — a burst (5 s) + cooldown (3 s) puts the natural gap between two misses
  at ~8 s, so the old window made "two misses overheat it" unreachable
  under the new timing; two zero-damage bursts inside the window still
  = overheat 5 s (hiss + slowing hot-metal pings + ready chime). Missiles:
  magazine 8 (`missiles`), count spoken on launch, speed 130 / life 11 s
  (~1400 reach); SEMI-ACTIVE: target must stay inside the missile zone for
  the whole flight (0.5 s grace) or it goes ballistic.
  **Levels are earned, not cycled (Round 19, SPEC 3.26)**: replaces
  2.12's free version-cycling. `profile.laserLevels {mining, rapid}` is
  the OWNED (highest bought) level per family; `profile.laserHealth
  {mining, rapid}` is a single 0–100 wear tracker per family, not per
  level — firing ANY selected level (the owned one, or a deliberately
  lower one via `1`/Shift+1) drains the SAME tracker at the SAME rate
  (`wearLaser()`, `CFG.laserWearPerBurst` 1, hit or miss, called from
  `startBeam` the instant a burst is committed to firing). `laserLevelMult(n)`
  replaces 2.12's flat `1.1^(n-1)`: `1 + 0.2*(n-1)` through level 5,
  then that × `1.1^(n-5)` for 6–8. `cycleLaserVersion(i, dir)` now wraps
  1..owned (not 1..8) — cycling can never reach a level the station
  hasn't sold; `laserUnowned(L)` is a defensive guard (refuses "Mining
  laser level N is not fitted. The shipyard sells it.") for the case a
  slot ever points above its family's owned level, which shouldn't
  happen in normal play since a level-drop clamps every slot pointing
  at the dropped level back down. At zero health `wearLaser` drops the
  owned level by one (floor 1), resets health to 100, speaks "Mining
  laser worn down to level N.", and clamps affected slots; alerts at
  `CFG.laserWearAlertPcts` [50, 25] mirror the rcs/warp-core alert
  pattern (before/after crossing, spoken once). A new **Lasers** entry
  on the station menu (`LASER_SHOP`, `openLaserShop`/`laserShopKey`,
  same browsable shell as Modules) lists one Buy and one Repair line
  per family: buying the next level costs `laserLevelCredits` 200 × N
  credits and `laserLevelAlloy` 1 × N alloy and resets health to 100;
  repairing costs `laserRepairCreditsPerPoint` 2 × the OWNED level per
  point restored. **A deliberate simplification, flagged for Brian's
  call**: the spec text names a single `laserHealth` value per family
  while also saying a downshifted level "costs less to repair" — those
  two claims don't both fit a true per-level health model without
  either contradicting the given data shape or opening an exploit
  (wear the top level, downshift to repair cheap, upshift back to a
  free top tier). Built so repair price always keys off the OWNED
  level, matching the spec's own worked example exactly (level 5, 38
  points, 380 credits = 2×5×38) — there is no cheaper repair at a
  downshifted level in this build. F2 gained one line per family
  ("Mining laser level 5, health 62."). Migration: `PROFILE_VERSION` →
  4; a pre-4 save's `slots` (which held level ids like `mining3`
  directly, no separate owned-level concept) becomes the owned level
  via the highest id found per family, health starting full, so
  nobody loses a laser they had. **A real bug found in testing**:
  the migration initially never fired, because `defaultProfile()`
  already seeds `laserLevels`/`laserHealth` with valid numbers before
  a saved profile is merged in — a `typeof profile.laserLevels[fam]
  !== 'number'` check (the pattern every earlier migration in this
  file uses) can't tell "the save never had this field" from "the
  default already filled it in", so a seeded v3 save with `slots:
  ['mining5','rapid2']` loaded as level 1/1 instead of 5/2. Fixed by
  capturing the raw parsed `saved` JSON in a variable visible outside
  `loadProfile`'s try block and checking THAT for the field's presence
  instead of the already-defaulted `profile`. Machine-tested at a
  local server: wear decrementing by exactly 1 per burst hit or miss;
  both alert crossings; a forced level-drop (owned 3, health to 0)
  correctly dropping to level 2, resetting health, and clamping a
  flying slot from `mining3` to `mining2`; cycling wrapping strictly
  1..owned; the defensive `laserUnowned` refusal exercised directly;
  all four shipyard buy/repair paths (afford, need-credits,
  need-alloy, already-full/already-level-8) with correct prices and
  state changes; F2's new lines; the migration bug found, fixed, and
  re-confirmed against a pre-4 seed (recovering 5/2 correctly), an
  intact v4 seed (left untouched), and a v4 seed with a deliberate
  downshift below its owned level (surviving migration unclamped);
  and a plain empty-slot press plus an ordinary damage tick against a
  live target confirmed unaffected (regression). Zero console errors.
  Not yet heard or flown by Brian.
- **System damage and the repair crew (Round 20, SPEC 3.27)**: an enemy
  missile that actually lands on the hull — never a beam, never one a
  raised shield caught — can knock one subsystem offline,
  `CFG.knockoutChance` 0.4 per landed hit, drawn by weight from
  whichever systems aren't ALREADY broken: every FITTED laser slot
  (`laser0`, `laser1`, ... one per occupied slot, weight 3 each — a
  two-laser ship draws from 9 systems total) plus `shields`/`thrust`/
  `sensor`/`missiles`/`decoys`/`warp`/`cargo`. `shipSystems` (id → health
  0-100, absent/100 = fully OK) and `systemState(id)` ('ok'/'half'/'off'
  at the 50/100 boundaries) are the whole model; `hullHit()` gained an
  `isMissile` param (true ONLY at the one call site that's an enemy
  missile impact — a beam tick and `updateCollisions`' station/planet
  hit both stay false) and folds the knockout roll plus a broken cargo
  hold's ore spill into its own single `say()` call with the hull line
  (the SPEC 2.15 rule again). Each system's offline/half effect is
  wired at its own call site rather than a central dispatcher: a laser
  slot refuses in `startBeam` and halves damage in `beamTick`; missiles
  refuse in `fireMissile` and launch (and fly the WHOLE flight, since
  `steerToward` re-normalizes speed every guided frame) at half speed,
  stored on the missile object itself so a mid-flight repair can't
  retroactively speed it up; decoys refuse in `fireChaff` and have a
  `CFG.repairChaffFizzlePct` chance to do nothing at half; shields
  refuse in `shieldKey`, a raised shield drops the instant the system
  breaks (`applyKnockoutEffects`), and a new `shieldPoolMax()` helper
  (replacing every direct `CFG.shieldPool` read used as "the max")
  halves the pool ceiling at half health, with `updateShield` clamping
  the live pool down to it every tick in case a knockout shrinks the
  ceiling out from under a pool that was already fuller than the new
  max; the warp engine refuses in `startWarp`, its regen stops in
  `updateWarpCore`, and a new `warpEffectiveCharge()` halves the
  reachable jump distance (not the tank itself) at half health, read by
  `startWarp`'s own travel computation and by `warpReachText` so the
  map never lies about range; thrust zeroes out entirely in `simTick`'s
  W/S block when offline (the passive stabilizer damping is untouched —
  only the two keys themselves), half power at half; the targeting
  sensor can never acquire (and drops on the spot) a lock while
  offline in `updateTargeting`, Tab/T untouched since they don't read
  `locked`, `zoneRad()` halves the lock-on/lock-off angles at half
  (leaving the laser/missile cones alone — those belong to their own
  separately-breakable systems), and `tickBeat` silences the tick
  entirely offline and doubles every interval at half. The repair crew
  (`updateRepairCrew`, called from `simTick` on the same freeze gate as
  everything else) is priority-PREEMPTIVE, not FIFO: every tick it
  recomputes the single highest-priority broken system from
  `REPAIR_PRIORITY` (`shields, thrust, sensor, laser, missiles, decoys,
  warp, cargo` — laser slots share one tier, ties broken by slot index)
  and works THAT one, so a higher-priority system breaking mid-repair
  steals the crew away, leaving the interrupted system's progress
  frozen in place until the crew comes back to it. Health climbs at a
  constant `100 / (CFG.repairHalfS * 2)` percent per second (90 stock:
  90 s to 50%, 90 more to 100%), speaking "X at 50 percent, usable."
  once (with `repair_half`, a new chime cue) and "X repaired." at 100,
  and playing `repair_crew.wav` (Brian's new asset, converted to the
  usual mono 48k 96k MP3 sibling, manifest key `repair_crew`) each time
  the crew starts a DIFFERENT system. `repair_crew_1`/`_2` in `MODULES`
  (500cr+2 alloy → 45/45, then 400cr, requiring tier 1 → 30/30) are the
  table's first tiered, alloy-costing, prerequisite-gated entries —
  `moduleText`/`buyModule` both grew optional `alloy`/`requires`
  handling generalized for any future module to reuse, not just these
  two. `repairAllSystems()` (docking's instant fix, and every "fresh
  start" path — `startDemo`, `startMission`, the standalone drill's
  Enter-retry after a loss) just clears `shipSystems` outright;
  `clearMission()` (abandoning a live encounter back to the menu)
  deliberately does NOT touch it, matching hull/ore's own
  persists-across-a-sector-run behavior. F2 gained the crew's tier and
  a line per broken system (health, and whether the crew is on it
  right now); `statusReport()` (I) gained the same broken-systems
  readout. Machine-tested at a local server: every one of the eight
  systems' offline refusal and half-effect confirmed individually via
  `poke({knockout: id})`/`poke({systemHealth: {id: N}})` — a half laser
  slot's damage measured exactly half (28 vs. 14, same conditions), a
  half missile's flight speed exactly half (130 vs. 65 u/s, confirmed
  via the missile's own stored `speed`), a half decoy's fizzle chance
  confirmed via a seeded `Math.random` on both branches, a half
  shield's pool max computed and clamped correctly (45→22.5), a half
  warp's jump range measured capped to exactly half the charge on
  board (a jump that needed ~3711 travel capped to exactly 2000 on a
  4000 charge), half thrust measured at exactly half the full-thrust
  speed gain (58.5 vs. 29.3 units/s after 1 s), and a half sensor's
  lock zone measured exactly halved (8°/12° → 4°/6°) with the lock
  still successfully re-acquired inside it; a broken cargo hold's spill
  confirmed at exactly the configured percentage of the CURRENT hold
  on a real collision-triggered hull hit (20 of 1000 ore offline, 10 at
  half), folded into the same line as the hull number. The knockout
  draw's chance-gate-then-weighted-selection algorithm was verified
  with an isolated 200,000-trial Node simulation of the identical logic
  (matching every weight's expected pick rate closely, correctly
  excluding already-broken systems, and always returning nothing once
  everything is broken) rather than depending on forcing a real enemy
  missile's flight timing, which proved genuinely awkward to control
  deterministically through the live combat AI. The repair crew's
  preemption, the module tiers' CFG override (confirmed 45 then 30 via
  `__sim.state()`), the alloy/prerequisite refusals, F2 and I's new
  readouts, and docking's "Systems repaired." announcement were all
  confirmed; a full regression pass on the standalone Combat drill
  (kill all five, "Victory", SPEC 3.25's kill buffs still firing
  alongside this) confirmed unaffected. **A testing-methodology gotcha,
  not a game bug, found and resolved along the way**: partway through
  this round's testing the browser pane silently became visible
  (`document.hidden` flipped false), resuming `requestAnimationFrame`
  WHILE a test script was still also manually driving `__sim.step()` —
  together they advanced the sim at roughly double speed, making one
  repair-rate measurement look ~2x too fast. Resolved by reading
  `CFG.repairHalfS` directly off `__sim.state()` instead of trusting
  the polluted rate measurement (confirmed exactly 30 after both module
  tiers) — the formula itself was never in question, just that one
  measurement's real-time assumptions. Zero console errors throughout.
  Not yet heard or flown by Brian.
  **The crew also mends the hull, and every repair costs reaction mass
  (Round 28, SPEC 3.36, ideas10.txt)**: `REPAIR_PRIORITY` gained `'hull'`
  as its lowest rung — `updateRepairCrew` now falls through to the hull
  once every real system is whole, at HALF the system rate
  (`CFG.repairHullFactor` 0.5, so `25/repairHalfS` a point a second, ~6
  minutes to full at stock). Brian, after agreeing everything else this
  round: "hull repairs do not happen at the same rate... repairs use
  reaction mass... yes, all repairs use reaction mass" — so every point
  of work, hull or system, now costs `CFG.repairRcsPerPoint` (0.2) of
  reaction mass through `spendRcs()` (the same 50/25% alerts and battery
  flip fire as thrusting), and the crew freezes rather than ever drain
  the tank below `CFG.repairRcsFloor` (10), saying "Damage control
  paused: reaction mass low." once and resuming silently when mass comes
  back. F2's Hull heading gained whether the crew is on it and a running
  reaction-mass-spent-this-sortie total; the Repair crew heading gained
  a line naming the hull's own rate/cost/floor. Machine-tested at a
  local server via `__sim.step()`: hull climbed exactly 2.778 over 10s
  from 80 (`25/90 × 10`) while a LONGER window (80→100, the full climb)
  confirmed the mass cost at exactly 4.0 (20 points × 0.2 — a 10-second
  spot-check alone looked like double the rate, purely from `Math.round`
  on the display; the longer window settled it); a system knockout
  mid-repair froze the hull in place while the crew worked the system
  first; forcing mass down to the floor froze BOTH hull and mass and
  spoke the pause line, restoring mass resumed work with no further
  prompt. Zero console errors. Not yet heard or flown by Brian.
- **Mining**: 3 rock types (Ice soft/splitty, Iron hard/chippy, Stone middle)
  × 4 sizes, HIDDEN per-stage hp rolls. Core ore 3000/6750/4500 (×1.5 as of
  Round 10); all dust ×0.75 via `CFG.debrisScale` in `addDebris`. Laser ticks
  shed dust; stage events split/chip/collapse-to-core; `E` extracts cores
  (range 300), `V` vacuums dust fields, cloud radius 800.
- `Q` from encounters: mining any time; combat only when zone cleared
  ("jammed by hostile fire"); drills never. Enter on the encounter map =
  depart (silent return + auto-warp).
- **The flight course (Round 31, SPEC 3.41, ideas11.txt)**: a fourth
  mode, `'course'`, alongside sector/combat/mining — reached from the
  mission menu ("Flight course") through the same `startMission(m)`
  every other drill uses. `COURSES` (one entry, `gentle`) is a list of
  TURNS — how much the path's own heading changes before stepping
  `CFG.courseSpacing` (600) forward — not raw positions, so it stays
  easy to re-tune; `buildCourseGates()` walks it once into world
  positions and each gate's own forward vector. Every gate is a `kind:
  'poi'` target with `poiType: 'course'`, which is the whole trick —
  it reuses the ENTIRE existing targeting stack (lock tone, tick,
  distance haze, `bearingText`) for free, needing only its own tone in
  `buildPoiVoice` (one sine per gate, detuned by index — "slight
  variations between the tones") and its own volume rule
  (`courseGainFor`, a 4-deep ladder — `CFG.courseGains` [1, 0.6, 0.35,
  0.2] — that REPLACES `beaconAudible()`'s on/off for this `poiType`
  only, inside `updateTargeting`'s existing mute-setting line; course
  gates ignore the B key entirely). Clearing a gate (`updateCourse`,
  from `simTick`) is one geometric check: the dot of the ship's
  gate-relative position against the gate's own forward flipping from
  negative to positive means the ship crossed the gate's plane; the
  PERPENDICULAR distance from the gate's axis at that instant, against
  `CFG.courseGateRadius` (150), decides clean vs. a miss
  (`CFG.courseMissPenaltyS` 10, folded into the SAME `say()` that
  activates the next gate — the SPEC 2.15 rule, and it genuinely
  matters here: the miss line and the next gate's number would
  otherwise collide in one tick). The clock only counts once
  `courseState.started` flips true, set the exact frame real thrust (W
  or auto-thrust) is first applied. Weapons/shields/auto-target are all
  refused with the sector's own "cold" line via a new `weaponsCold()`
  helper (Space/F/D already shared that check with the sector; **G did
  not** — it gained the refusal only for course, since sector's own G
  has never refused and this wasn't the place to change that); course
  gates are excluded from Tab's cycling pool (the friendly-exclusion
  pattern, reused), since the active gate is chosen for the pilot, in
  order. Finishing sets `won = true` (every existing Enter-retry/X-to-
  menu path just works, unmodified) and calls a new `recordCourseRun` —
  a THIRD best-10 board, `profile.courseRuns`, `PROFILE_VERSION` → 7,
  alongside `runs`/`contractRuns` in the Run log. Two new test-only
  additions made this provable without hand-flying the actual winding
  path: `poke({yawDeg, pitchDeg})` (forces the ship's own facing
  directly) and `state().course` (activeIndex/elapsed/started/the live
  ladder gains/every gate's own pos+fwd+cleared). Machine-tested at a
  local server entirely via `__sim.step()` plus direct `poke({pos})`
  placement at each gate's own computed crossing point: a clean pass
  advanced cleanly with elapsed still 0; a deliberate 300-unit-off-axis
  miss produced "Gate 2 missed, plus 10. Gate 3." in one line and
  elapsed jumped to exactly 10; all eight gates cleared produced "Course
  complete. Time 10 seconds. New personal best!", `won: true`, and a
  real `localStorage` entry; Enter correctly restarted fresh; Space/G
  both refused with the cold line, Shift+T refused with its own course
  line, Tab said "No targets remain.", and `I` read "Gate 1 of 8. Clock
  0 seconds." The ladder was confirmed settling to exactly `[1, 0.6,
  0.35, 0.2, 0, 0, 0, 0]` after the mute node's own ramp landed (an
  early snapshot read partial values — `setTargetAtTime`'s asymptotic
  approach, not a bug). Zero console errors throughout. Every number —
  the turns, the spacing, the radius, the ladder, the miss penalty — is
  a placeholder for Brian to fly and judge. Built ahead of its own
  "after the playtest" note in the build order, at Brian's direct
  request. Not yet heard or flown by Brian.

## Key map (left-hand doctrine — right hand stays on arrows)

Arrows yaw/pitch · W thrust / S brake (Shift+W toggles
auto-thrust — `autoThrust` reads as a held W inside `simTick` via an
effective-keys object `k`; any W or S press, Shift+W, a warp jump,
docking, or `clearMission` ends it; the Shift chords are checked in
`onKeyDown` BEFORE the `HELD` branch, since Shift+W arrives as `lname`
'w') · 1-6 select laser slot (a switch takes 1.4–3.2 s by slot, SPEC 1.14) · Space fires
selected laser (fire-and-forget, cannot be stopped) · F missile · D decoy (spoofs the incoming missile, SPEC 1.8; "chaff" in the code, "decoy" to the player as of ideas6) · G shields
· Tab cycle targets (Shift+Tab cycles back; **SPEC 3.38 rebound Shift+T
away from cycle-back to auto-target — see the Combat section**) · T report selected
target (lock onset also speaks distance) · Shift+T auto-target (SPEC
3.38: the stabilizers aim the ship at the selected target for you,
never fires, limited pool, not standard gear) · R range to target with
closing/opening (Shift+R = the radar sweep) · E extractor · V vacuum · B
tractor beam (mining, SPEC 3.30; tiered and moved here from Z, SPEC 3.44
— "B for beam") · Shift+B steps the selected tier down, wrapping to the
top · Z unbound ("Z does nothing here") · Shift+Z zone size · Q map ·
H warp · C call · I
status (adds hull, missiles, laser slot, shields, laser heat, demo clock +
objective) · `[` music on/off · `]` next track, Shift+`]` previous (SPEC
3.80 — read via `e.code` BracketLeft/BracketRight, never `e.key`, since a
real Shift+`]` sends `}`; live everywhere onKeyDown reaches, checked right
after the describeMode branch and before every overlay's own capture) ·
X leave · F1 help · F12 explore · Escape opens the mission
menu (SPEC 1.18 — see below; no separate pause any more). Shift+S auto-reverse (SPEC 3.57 — `autoThrust` is now `false |
'fwd' | 'rev'`, 'rev' reads as a held S in `simTick`; either chord flips
the other's direction in one press). Menu: arrows +
Enter (first letters D/S/E/H jump, S cycles Sector, then Sound, then
Sound Lab; **as of SPEC 3.56 the five drills — Combat training, Mining,
Flight course, Escort drill, Defend drill — live under one
`Encounters` item (`ENCOUNTER_ITEMS`, opened with Right/Enter, closed
with Left/Escape, its own remembered cursor `encounterIdx`, `menuSub`
non-null while open, handled by `menuSubKey`); every new Phase 3E
encounter is appended to `ENCOUNTER_ITEMS`, never to `MENU_ITEMS`**);
Left/Right on the Difficulty line cycles Rookie/Veteran/Ace in place. Beacons (on/off/target only) live in the
Sound menu as of SPEC 3.45, not on a direct key any more.

## Accessibility architecture (non-negotiable)

- Shell ported from `C:\nbs\accessible_football`: role=application,
  Press-Enter-to-Begin gesture (AudioContext), focusin recapture, ONE
  capture-phase keydown, BROWSER_KEYS escape hatch (F5/F6/F11, Ctrl+R/F/W/T),
  lowercase single chars (Caps Lock = NVDA modifier), `keyName()` e.code
  fallback, "silence is a bug" (every key answers).
- **The Press-Enter screen itself speaks now (Round 28, SPEC 3.39,
  ideas10.txt)**: it used to be genuinely silent until Enter — `say()`
  works fine before the gesture (an aria-live div, no AudioContext
  needed), it just never got called. `init()` now speaks
  "Headless Space Sim. Press Enter to begin. Wear headphones." the
  instant `liveEl` is assigned, then repeats it once at
  `CFG.beginRemindFirstMs` (10s) and every `CFG.beginRemindEveryMs`
  (20s) after via a `setTimeout`+`setInterval` pair, both cleared at the
  top of `initBtn`'s own click handler. The repeat rides `say()`'s
  existing hair-space trick for free. Machine-tested: the line is
  spoken at load and unchanged (no hair space) through 2.8s; a genuine
  ~10.4s real wait showed the repeat had landed; clicking Enter and
  waiting 22 more real seconds confirmed both timers are fully dead.
  Zero console errors. **Brian heard NONE of it (2026-09-07) — a real
  bug, fixed Round 43 (Fable)**: `#announce` sat inside `<div id="game"
  hidden>`, and a `display:none` subtree is not in the accessibility
  tree, so every `say()` before Enter wrote text NVDA could never see.
  The live region now lives on the body beside the button. A second
  hole: `<body role="application">` puts NVDA in focus mode from the
  first frame, so a Down arrow before Enter reached `onKeyDown` and died
  on `if (!running) return;` — now any pre-Enter key other than Enter/
  Space/Tab re-speaks `BEGIN_LINE` (hoisted to module scope). **Testing
  rule from this**: a live region must be tested for EXPOSURE, not just
  for text — `read_page` (the accessibility tree) before the gesture,
  never `textContent` alone. Round 28's test passed because it checked
  the wrong thing.
- Speech = single aria-live assertive div (`say()`), hair-space trick for
  repeats. NOT speechSynthesis. All visuals aria-hidden. Ship's own hull is
  always "Your hull N" so it never collides with a target's "Hull N percent".
- Help (F1) and map (Q) are virtual pop-ups: arrows read line by line,
  H/Shift+H jump help headings, Escape closes, sim freezes + audio ducks.
- World audio = HRTF panners (enemy lock chirps, enemy beam, enemy missile,
  evade burner all positioned at the enemy); cockpit instruments (tick,
  tools, thrusters, shield hum/splash, hull thud, overheat hiss) = stereo UI
  bus, deliberately separate. Front/back cue = lowpass muffle. Elevation cue
  = tick pitch + spoken bearings.
- Thrusters sound from the jet doing the work (opposite the motion); W/S were
  SWAPPED at Brian's request — he may revisit after listening. Stabilizers:
  audible auto-braking puffs while coasting; silence = stopped.
- SFX layer = Bunker Audio Laboratory primitives upgraded with an `out` param
  for 3D routing; `playAsset()` for recorded one-shots.

## Working agreements

- Test at the GitHub Pages URL, not file://, as of Round 11: navigate the
  browser pane to https://1eyebiney.github.io/headless-space-sim/ , wait
  ~60-90 s after a push for the pages-build-deployment workflow (`gh run
  list`) before testing, and hard-reload if a test shows stale behavior.
  As of SPEC 2.19 there is no `file://` build to keep working — Brian
  dropped it (2026-09-04) so recorded audio can be fetched; the Pages URL
  and the local static server are the only two places the game runs.
- Multi-file gotcha (Round 12): the game is now split across four `<script>`
  tags. This session's browser-preview tool renders a local file as an
  opaque `data:` URL snapshot — relative `<script src>` tags don't resolve
  from it (`window.SIM` comes back `undefined`) and `localStorage` throws.
  For any local iteration that touches audio_engine.js/audio_cues.js (or any
  future split file), use `preview_start` with the `"static"` config in
  `.claude/launch.json` (`http://localhost:8934`, a real origin) instead of
  `navigate`-ing straight to the file path. `index.html` alone (single
  inline script, no splits) still works fine via the plain file preview.
- Test silently: boot via JS `.click()` (suspended context = no sound) and
  ALWAYS close every browser-pane tab + kill the local server when done —
  leftover audio fights Brian's screen reader.
- Beacons off while testing (Brian, ideas3, 2026-09-04): the `.click()`
  boot is NOT actually silent once synthetic key events resume the
  context — a POI left targeted keeps its beacon sounding through Brian's
  speakers for the whole test and interferes with his own listening. So:
  every test script sets beacons off first thing after boot, live and
  unsaved — `__sim.poke({ beacons: 'off' })` right after the `.click()`
  (the in-game `B` key cycles On / Off / Target only; `poke` never saves,
  so the pane's profile keeps whatever it had). And still never leave a
  tab open between steps.
- **Fully silent testing (SPEC 3.43, Round 30, ideas11.txt)**: Brian
  asked for a no-sound-at-all mode specifically so testing stops
  reaching his speakers at all — beacons-off alone still leaves lasers,
  explosions, the tug countdown, every UI chime audible. Every test
  script now navigates to the page with `?mute=1` in the URL (in
  addition to, not instead of, the beacons-off poke above) — this zeros
  `SIM.audio.masterGain` for the session, live and unsaved, same
  never-touches-the-profile guarantee as beacons. `poke({mute: true})`
  does the same mid-session without a reload. Speech is untouched
  either way — `say()` is an aria-live div, not a Web Audio node.
- Hidden-tab gotcha (confirmed Round 11, calibrated at 0 simulated seconds
  over 10 real seconds): a backgrounded/hidden browser pane (`document.hidden`
  true) fully suspends `requestAnimationFrame`, not just throttles it — the
  entire `frame()` loop (ship physics, shields, enemy fire, missiles) can
  stall completely regardless of how long a script `await`s real time. Fix:
  `frame(now)` now just computes `dt` and calls `simTick(dt)`, which is also
  exposed as `window.__sim.step(dtSeconds, chunkSeconds)` — steps the sim in
  small chunks (default 1/30 s) without rAF. Genuine `setTimeout`-driven
  choreography (menu select beat, speech staggering, sound sequencing) is
  UNRELATED to rAF and still needs real waits. So a test script needs BOTH
  clocks moving together: a `tick(ms)` helper that does
  `await wait(chunk); __sim.step(chunk/1000);` in a loop, not step() alone
  and not real waits alone. The pane also injects Space/Enter with empty
  e.key (dispatch KeyboardEvents instead). Run a whole scenario inside ONE
  script (MutationObserver on #announce = speech log). `window.__sim`:
  state / faceSelected / warpToSelected / step / poke ({threatIn, ore, hull,
  combatCleared, enemyHp}).
- All tuning numbers live in CFG and the data tables (ZONES, ROCK_TYPES,
  ROCK_SIZES, SECTOR_POIS, THRUSTER_DEFS) — tune there, not inline.
- Brian's ear is the tiebreaker on all sound decisions. Report every file
  change explicitly; keep help text, KEY_DESCRIPTIONS, and README in sync
  with mechanics; hidden mining thresholds must never leak into speech.
- Commit/push after every round; there is no demo file to regenerate any more.

## Where we left off (2026-09-04)

Rounds 10–11 (SPEC.md Phase 1 items 1.0–1.5) shipped and live on Pages, machine-
tested but largely NOT yet heard by Brian in play: KC-style arrow menu,
passive-until-hit enemies at Rookie (always-on pacing kept for Veteran/Ace),
delivery run with a saved run log, missile magazine + rearm, semi-active
missile cone, laser range/close bonus/overheat, enemy fire with telegraphs,
the shield damage-pool + disrepair rework, evade + counterattack, ore ×1.5 /
dust ×0.75, difficulty tiers, no-warp zone, saved profile. Rookie also
does double laser damage against ships (SPEC 1.20, `CFG.laserShipMult`,
`TIERS[0].cfg` — the ship branch of `beamTick` only, rocks untouched).
Still awaiting his
ears from Round 9 too: stabilizers, W/S swap, dust shimmer, beacon balance,
warp drama. SPEC.md 1.6 (docking corridor) and 1.7 (station economy)
were the two large pieces deferred out of Round 10–11 — both built this
round (see below), good next round once Round 10–11 has been heard.

Round 12 (this one) was the audio pull-out plus 1.6/1.7: `audio_engine.js` +
`audio_cues.js` split out of index.html as `SIM.audio`/`SIM.cues`, 22
discrete cues migrated into the registry, `sfxEcho`/`sfxSweep` added,
`.claude/launch.json` added for local multi-file testing, Station
Meridian's beacon halved in volume; then SPEC 1.6 (the docking corridor —
see "Docking (Round 12, SPEC 1.6)" above) and SPEC 1.7 (the station
economy hook — see "Station economy (Round 12, SPEC 1.7)" above). All of
it machine-tested thoroughly (every migrated cue exercised under real
gameplay conditions at a local server; docking flown both pre- and
post-bugfix; the full economy loop — sell, buy, gating both ways, the full
delivery-run handover path, and a repeat visit past the influence
threshold — exercised end to end with no console errors), not yet heard by
Brian. Next audio step, per Brian: a sound-lab tester (this project's own
`.soundtester`-style page) for auditioning new synth ideas AND the new
unintegrated recordings side by side — not built yet.

Brian's ideas3 notes (2026-09-04, `ideas3.txt`, untracked like ideas1/2)
are folded into SPEC.md as 1.12 sound options (beacons off + a level per
category), 1.13 warp-core spoken alerts replacing the regen hiss, 1.14
laser switching timed by the six switch recordings, and 1.15 R = range /
Shift+T cycles back / Shift+W auto-thrust. Brian answered the five open
questions the same day (Part C: `B` key for beacons with a Target-only
state, per-slot switch clips 3/4/5/1/2/6 stretched into 1.4–3.2 s,
time-stretch to fit, Shift+R for the sweep, build order 1.12 → 1.13 →
1.14 → 1.15 → 1.8). 1.12 (see "Sound options" above), 1.13 (the
warp-core alerts, in the Sector bullet), and 1.14 (the slot switch, in
the lasers bullet), and 1.15 (R range / Shift+R sweep / Shift+T back /
Shift+W auto-thrust, in the key map) are all built and machine-tested —
ideas3 is fully in — and 1.8 chaff after it (in the Combat bullet). Phase
1 is complete except 1.11, which Brian deferred past the demo. Nothing
from Rounds 10–12 has been heard yet.

Brian's ideas4 (2026-09-04 evening, `ideas4.txt`, untracked) is folded
into SPEC.md as a Phase 1 second pass, 1.16–1.20, DOCS ONLY — nothing
built: 1.16 chaff instant/any time (already true as built, now a rule),
1.17 warp takes time (the three recorded phases play untrimmed at their
own rates — the 18 clips measure 4 / 1.5 / 4 s — shortest jump 9.5 s,
longest 12 s, the timed run's first leg exactly 12 s, no warp under
25 %), 1.18 Escape opens the mission menu from the live sim (Resume
item; the separate pause state goes; mid-warp the flight continues
under the menu), 1.19 the docking corridor is REMOVED in favor of a
comm range and a dock range (supersedes 1.6 — the "Docking" bullet
above describes code that will go), 1.20 lasers ×2 against ships at
Rookie (confirmed as the tier Brian tests at). Nothing open in Part C.

Round 13 (Sonnet) built 1.19 — see the "Docking (Round 13, SPEC 1.19...)"
bullet above for what changed and what was removed; machine-tested (a
hail at 400, a refusal at 1200, an instant dock at 100, the delivery
handover through it, undock landing at exactly 250 out from two
different approach angles, F12, no console errors), not yet heard.

Round 13 also built 1.20: Rookie's `laserShipMult` 2 doubles ship
damage only (confirmed 54 vs Veteran's 27 on the identical tick; a rock
tick at 29 confirmed untouched), and the Difficulty/help text reflect it
only when the multiplier is above 1. Machine-tested, not yet heard.

Round 13 also confirmed 1.16 (chaff instant/any time) needed no code
change — see the chaff bullet above — and built 1.18 (Escape opens the
mission menu, see the "Escape / mission menu" bullet above) and 1.17
(warp takes time, see the "Sector" bullet's warp paragraph above). All
five ideas4 items (1.16–1.20) are now built and machine-tested;
Round 13's one real bug (the `warping`/`menuOpen` ordering in
`onKeyDown`, found while testing 1.17 against 1.18) is documented in the
warp paragraph. Nothing from Rounds 10–13 has been heard by Brian yet.

Brian's ideas5 (2026-09-04, `ideas5.txt`, untracked) plus a long design
conversation the same evening are written into SPEC.md (Fable, docs
only): Part A gained A.8–A.12 (the base endgame, the five resources
with price levers and salvage gates, the quadrant as a solar system
with drifting clouds and spawning combat zones, death by tug, the
F2/F3/F4 screens); Part B gained **Phase 2, the Sunday demo** (2.10–2.18:
warp overlap and 11 s, the sound lab and the open-space lock tone,
sixteen lasers cycling on 1/Shift+1, the F2 ship screen, reaction mass
with collisions and the hail/land split, salvage/alloy/ice and the F3
screen, death by tug, escort and defend missions, the profile version)
and **Phase 3, the moving world** (3.10–3.17). Target: a playable demo by
Sunday 2026-09-06, Sonnet building 2.10–2.18 in order, 2.16 and 2.17
dropped first if it slips.

Round 14 (Sonnet) built 2.10 through 2.14, all machine-tested at a local
server and confirmed live on Pages, none yet heard or flown by Brian:
2.10 (warp overlap, engaged loop 0.5 s early, jumps 8.5–11 s), 2.11 (the
sound lab at `soundlab.html`, plus the sector/mining lock tone switching
to a soft double-blip — see "Sound options" above for the shape of it,
though it's really its own bullet now), 2.12 (sixteen lasers in two
families with 1/Shift+1 cycling, all recordings in the manifest), 2.13
(F2 ship screen), 2.14 (reaction mass, S as a real reverse thruster,
battery mode, collisions billed at the next landing, the hail menu —
see the "Reaction mass, collisions, the hail menu" bullet above for the
full shape), and 2.15 (salvage from kills, alloy from iron cores, ice
into reaction mass, F3 — see the "Salvage and alloy" bullet above,
including a real speech bug found and fixed there: two `say()` calls in
one tick collapse into one DOM mutation, so a screen reader only hears
the last — worth knowing for any future code that wants to speak two
things on one event).

Round 15 (Sonnet) built **SPEC 2.19**: Brian, seeing `audio_assets.js` at
3.8 MB, decided to drop `file://` support and serve recorded audio as
fetched files instead of base64, because he is collecting more audio
(ambient music next). `audio_assets.js` is now a manifest
(`AUDIO_MANIFEST`/`AUDIO_PRELOAD`, ~3 KB); the old `decodeAssets` atob
path is gone, replaced by `load`/`preload`/`ready` over `fetch` (every
existing "no buffer → synthesized fallback" call site — ships, rocks,
lasers, the warp phases — now also kicks off a `load()` on a miss, so
the fetch starts the first time something's needed and the real
recording is there next time); a `musicBus` and `playMusic`/`stopMusic`
exist with a Music line in the Sound menu, no track playing yet. The
twelve WAV masters (6 asteroid, 6 laser-switch) got served MP3 siblings
via the same `ffmpeg -ac 1 -ar 48000 -b:a 96k` pipeline every embed
used. `soundlab.html` follows the manifest instead of the old embedded
bank (and dropped two laser groups from its on-disk list that had
actually been in the manifest since SPEC 2.12 — a staleness this file
never got updated for until now). See the `audio_assets.js`/
`audio_engine.js` bullets above and SPEC 2.19 itself for the full shape.

Round 15 also built **SPEC 2.18** (the profile version — see the
"Profile version" bullet above for the full shape): `PROFILE_VERSION`,
migration, and the never-downgrade rule, machine-tested against a
fresh profile, a seeded v1-shaped save, and a seeded future-version
save with an unknown field, all at a local server with zero console
errors. Built retroactively — the original brief wanted it landed
before 2.14/2.15, but those had already shipped earlier this session
with no tester save yet in existence to lose, so nothing was at risk.
Round 15 also built **SPEC 2.16** (death by tug — see the "Death by
tug" bullet in the Combat section above for the full shape): a lost
ship in the sector campaign or the delivery run now waits for a tug on
the clock instead of Enter-restarting in place, halved by influence or
by paying a credit fee once; a standalone training drill keeps the old
instant retry, untouched. Machine-tested at a local server across
every branch (drill vs. campaign, sector-encounter vs. open-flight
death, the influence halving, the fee halving and its once-only guard,
X and the Shift-chord refusals mid-wait, the 10-second countdown
cadence, the arrival service, and the delivery run's clock confirmed
still advancing through the wait with the `demo` object surviving
intact) with zero console errors; not yet heard by Brian.

Round 15 also built **SPEC 2.17** (escort and defend missions — see the
"Escort and defend missions" bullet in the Combat section above for the
full shape): offered from a station's hail menu, reusing the untouched
telegraph/beam/missile combat system for a raider once the player hits
it and a simpler side-channel strike timer for raiders still harassing
the friendly beforehand, wave spawning, a leg-timer win for escort and
an all-raiders-dead win for defend, a credit-and-influence reward on
success and nothing on failure, a session-scoped cooldown, and correct
hand-off to the SPEC 2.16 tug if the player's own ship dies mid-mission.
Machine-tested end to end (both mission kinds, both outcomes, the
provoke/redirect mechanic, the cooldown gate, the tug hand-off) plus a
full regression pass confirming the untouched standalone Combat
training drill's win/retry path still works exactly as before. Zero
console errors; not yet heard by Brian.

2.10 through 2.19 are all DONE now — **Phase 2 (the Sunday 2026-09-06
demo target) is complete**. Nothing from Rounds 10-15 has been heard or
flown by Brian yet; every item shipped this session is machine-tested
only. Round 16 (Fable) built Brian's **ideas6** as SPEC 2.20 — his first
notes from actually flying the Phase 2 build (decoys, lock tones by
target kind, undock at 1000, comm/dock range cues, the docked station
interior, and the sound lab's vortex orbit demo; see the "ideas6" bullet
in the Sector section). His "couldn't move after undocking" turned out to
be a flipped yaw sign in `undock()` since SPEC 1.19 — the ship faced the
station and W flew it into the hull — fixed; held keys also now answer
whenever the sim is holding the ship, so a frozen ship is never silent.

The **Phase 3 spec is written** (Fable, Round 16, three rounds of
questions with Brian the same night — answers in SPEC.md Part C):
SPEC.md's "Phase 3 — the moving world, the ports, the hauling" is now a
buildable list in order — 3.10 the hand-authored quadrant with spawning
zones and typed, drifting fields on a persistent game clock and a
transition-saved quadrant state → 3.18 containers and hydrogen (the old
2.8) → 3.11 ports and F4 → 3.19 planets as ports (land, market, fuel,
no shipyard) → 3.14 the cargo limit → 3.12 the price levers → 3.20
hauling (buy low, sell high; hydrogen sell-only) → 3.21 threat
escalation that decays with play → 3.13 salvage gates and the drone
swarm; then Phase 3b (3.16, 3.17). The same night Brian added the
**station game** (three more rounds; SPEC A.6 rewritten, A.13 new,
Part C): every station **serves** a POI and wants what it needs; two
meters per station — **favor** 0–100 with tiers gating comms /
transporter / docking / Allied, decaying slowly in absence, and
**control**, a share bought with wanted resources at Allied and eroded
by named NPC unions, giving free docking, a tithe, the union count, and
quadrant-wide comms at full control; **three ranges** (talk / hand over /
land) replacing 1.19's two, extended by shipyard modules and favor;
Meridian starts Trusted, everyone else Unknown; biomass exists now as
the planet-to-station favor good; the gate opens once one station
trusts you, for hydrogen, into a **Frontier** quadrant with no ports,
rich fields, and one anomaly (specced as a kind, not built); the
galactic map opens only at the gate *after* the Frontier. Those became
3.23 (favor/control/ranges, built right after 3.10 since it touches
docking) and 3.22 (the gate and the Frontier, last), with 3.11/3.19/3.20
reworked around wants and biomass. Stop for Brian's ears after 3.10,
3.23, and 3.20. The names are placeholders he will replace; "more
mechanics in quadrant 2" is his to define before 3.22. The vortex demo
stays lab-only until he has heard it.

Round 17 (Sonnet) built **SPEC 3.10** — the quadrant itself: positions,
spawning, drift, the persisted game clock, and the save (no `serves`/
`wants`, unions, favor/control, or threat yet — those are 3.23/3.21's).
See the "The quadrant" bullet in the Sector section above for the full
shape. Machine-tested at a local server across every piece (spawn
placement and drift, typed mining, depletion + respawn with a real
bearing, the combat zone's own clear + respawn, the beacon distance
cutoff versus the delivery run's unaffected beacons, a v2→v3 profile
migration, the tug and mission-label fixes the second station exposed,
and both the delivery run and the standalone training drills confirmed
byte-for-byte unaffected), zero console errors. One real bug was found
and fixed during testing (`ensureQuadrantHome`'s ordering crashed the
very first Sector visit — see the bullet for the fix). Commits are
LOCAL ONLY for this round — Brian asked to hold `git push` until he's
tested the current build himself; nothing from Round 17 is on Pages
yet. Pushed 2026-09-05 at Brian's go-ahead; he is flying it. His first notes
from it are **ideas7** (`ideas7.txt`, untracked like the others), written
into SPEC.md the same day (Fable, three rounds of questions, answers in
Part C) as five items that now build BEFORE 3.23: **3.24** two bugs
(Shift+digit arrives as `!`/`@` — read `e.code`; Sell ore blocked
everywhere while a delivery is pending), **3.25** the escort second pass
(180 s, three waves of three Drones, strikes halved, a freighter shield
pool, reward by the freighter's hull remaining) and kill buffs (missile
resupply, laser boost, shield top-up), **3.26** laser levels — earned
tiers bought at the station with credits and alloy, +20 %/level to 5
then +10 %, worn 1 point per burst, a level lost at zero, repaired at
the station only, replacing 2.12's free cycling (`PROFILE_VERSION` → 4),
**3.27** system damage and the repair crew — missiles on the hull knock
one of nine systems offline at 40 %, a standard crew repairs in fixed
priority with `repair_crew.wav` (a new untracked asset, needs an MP3
sibling and a manifest key) and a chime at half, the module is the
upgrade — and **3.28** a timed delivery contract inside the quadrant
with its own best-time log, the fixed Delivery run untouched.

Round 18 (Sonnet) built **SPEC 3.24** (the two bugs) — see the
"Shift+1/2 and Sell ore" fix in the onKeyDown/sellOreAt area: a new
Shift+digit check reads `e.code` (`/^Digit([1-6])$/`) ahead of the
plain digit switch, since a real Shift+1 sends the shifted SYMBOL via
`e.key` (`!`), never the digit — the original 2.12 tests only looked
tested because they dispatched synthetic events with both `key: '1'`
and `shiftKey: true` set together, which a real keyboard never does.
`oreSellBlocked()` (`demo && !demo.delivered`) now gates both "Sell
ore" entries (hail and landed — textually identical, one edit); the
"Sector" menu description's stale "four points" line was also fixed
in passing. Also added at Brian's request: a **Sound Lab** entry on
the mission menu (`location.href = 'soundlab.html'`, a real navigation)
since he has no other way to reach that page without `file://` support.
Machine-tested at a local server with a REALISTIC Shift+digit dispatch
(`e.key` set to the actual shifted symbol, not the digit — the mistake
the original tests made), confirming both the cycle-in-place and
switch-slot cases and the plain unshifted digits unaffected; the sell
block confirmed refusing at hail and landed, ore untouched, then
confirmed lifting once `demo.delivered` and confirmed never active in
the open quadrant; the Sound Lab link confirmed navigating cleanly.
Zero console errors. Not yet heard by Brian. Next: SPEC 3.25 (the
escort second pass and kill buffs).

Round 18 also built **SPEC 3.25** (the escort second pass and kill
buffs) — see the "Second pass and kill buffs (Round 18, SPEC 3.25)"
bullet above for the full shape: the 180 s/three-wave escort, halved
strikes, the friendly's own regenerating shield, the hull-fraction
partial reward, and the three independent kill buffs (missile
resupply, laser boost, shield top-up), all layered onto 2.17's
untouched core machinery. One real bug found and fixed (the friendly's
"shields down" line re-announcing itself on every hit near empty
charge, due to continuous regen racing an instantaneous transition
check — fixed with a sticky, hysteresis-gated flag) and one grammar
bug found and fixed (`missionIntro`'s "raiders waves" → "raider
waves", a pluralized noun used adjectivally). Machine-tested
end to end at a local server, including both mission intros' corrected
wording, the shields-down fix under forced repeated strikes, all three
kill buffs under a seeded `Math.random` sequence (kept mocked through
the actual async kill resolution), the laser boost's damage multiplier
and non-stacking extension, the partial-reward math at full and
damaged hull, and buffs confirmed firing in the standalone Combat
drill too. Zero console errors. Not yet heard or flown by Brian. Next:
SPEC 3.26 (laser levels, wear, and repair).

Round 19 (Sonnet) built **SPEC 3.26** (laser levels, wear, and repair)
— see the "Levels are earned, not cycled (Round 19, SPEC 3.26)" bullet
above for the full shape: owned levels replace 2.12's free cycling, a
single per-family wear tracker that drops the owned level at zero
health, a new station "Lasers" shop for buying levels and repairing
wear, F2 lines for each family, and a `PROFILE_VERSION` 4 migration.
One deliberate simplification flagged explicitly for Brian's own call
(a single health value per family rather than one per level, since the
spec's own data shape and its "cheaper repair at a lower level" line
don't both fit without an exploit — repair price always keys off the
owned level instead) and one real bug found and fixed (the v3→v4
migration never actually firing, because `defaultProfile()`'s own
seeded values made a "was this field present" check always true —
fixed by checking the raw saved JSON instead of the already-defaulted
profile). Machine-tested end to end at a local server: wear per burst,
both wear-alert crossings, a forced level-drop with its slot-clamp,
cycling's 1..owned wrap, the defensive unowned-level refusal, all four
shipyard buy/repair paths, F2's new lines, the migration bug found and
re-confirmed against three seeded profiles, and a regression pass on
an empty slot and ordinary damage output. Zero console errors. Not yet
heard or flown by Brian. Next: SPEC 3.27 (system damage and the repair
crew).

Round 20 (Sonnet) built **SPEC 3.27** (system damage and the repair
crew) — see the "System damage and the repair crew (Round 20, SPEC
3.27)" bullet above for the full shape: an enemy missile landing on
the hull can knock one of up to nine systems offline (every fitted
laser slot plus shields/thrust/sensor/missiles/decoys/warp/cargo),
drawn by weight, each with its own offline refusal and half-health
degraded effect wired at its own call site; a priority-preemptive
repair crew works the single worst broken system at a time; two new
tiered, alloy-costing, prerequisite-gated modules speed it up; F2 and I
both read what's broken. `repair_crew.wav` (Brian's new asset) got its
MP3 sibling and a manifest key. Machine-tested at a local server:
every system's offline and half effect confirmed individually (laser
damage, missile speed, decoy fizzle chance, shield pool max, warp
range, thrust, sensor lock zone and tick, cargo spill — several via
direct before/after A-B measurements), the repair crew's priority
preemption, the module tiers' CFG override, F2/I's readouts, and
docking's full-repair confirmed; the knockout draw's weighted-random
algorithm verified separately via an isolated 200,000-trial Node
simulation rather than fighting the live combat AI's timing; a full
regression pass on the standalone Combat drill (kill all five,
Victory, SPEC 3.25's kill buffs still firing) confirmed unaffected.
One testing-methodology gotcha found and resolved along the way (not a
game bug): the browser pane silently became visible mid-session,
resuming `requestAnimationFrame` alongside a test script's manual
`__sim.step()` calls and briefly doubling the effective tick rate for
one measurement — resolved by reading the CFG value directly instead
of trusting a polluted rate. Zero console errors throughout. Not yet
heard or flown by Brian.

**Phase 3L was spec'd docs-only by Fable** (2026-09-05): Brian's
`ideas_crazy_7.txt` (a ten-point review of the Sound Lab as an HRTF
demonstrator) and his answers in `ideas8.txt` written into SPEC.md as
only the five items he bracketed, plus three game items they brought
with them (3.31 station beacons, 3.29 the ship page, 3.30 the tractor
beam), in the order L.1 → L.5 → L.4 → L.8 → L.9 → 3.31 → 3.29 → 3.30
→ 3.28.

**Round 21 (Sonnet) built the whole lab round — L.1, L.4, L.5, L.8,
L.9 — all in `soundlab.html`.** See SPEC.md's Phase 3L for the full
per-demo shape; in brief: **L.1** the 3D Position Explorer (fixed-step
azimuth/elevation/distance, compass-word readback, Enter "selects" —
the prototype of the *galactic map's* own sound cursor, A.13, which
Brian confirmed is a genuinely new 3D map, NOT the flat quadrant map);
**L.5** the vortex reshaped to per-vortex sway/height/offset (Up/Down
select, Page Up/Down/Home/End/`[`/`]` shape the selected one, Left/
Right the shared speed, R resets, full readback); **L.4** the flyby
(his eight `propeller_plane` clips — 1–4 loop on four different set
routes, 5–8 are one-shot stunts built from polar keyframes fitted to
their measured 12 s, cycling 5→6→7→8→5); **L.8** the spatial room
(five sounds at randomised positions/distances every run, a solo pass
in a shuffled non-distance order, a spoken 90° turn that actually
rotates the `AudioListener`, three on-screen multiple-choice questions
judged against the post-turn bearing); **L.9** the lighthouse gate,
lab half (a directional `PannerNode` cone, `space_station6.mp3`,
10-second sweep) — the game half (the actual Jump Gate) is bundled
into 3.31 below since it touches the same `buildPoiVoice` code path.
Every demo now calls the shared `stopAll()` on start (satisfying
"every demo stops every other"), and `stopAll()` itself now calls a
new `labResetListener()` unconditionally, so the `AudioListener` —
global, and only ever turned by L.8 — can never be left facing the
wrong way for whatever demo runs next. New manifest keys:
`propeller_plane1–8` (lab-only, excluded from `AUDIO_PRELOAD`) and
`space_station1–10` (DO preload — real station voices as of 3.31, not
lab-only); both new audio folders staged explicitly, never `git add -A`.
**A real gotcha found and fixed, not a game bug**: this sandboxed
preview pane's `requestAnimationFrame` proved unreliable in isolation
for every one-shot timed demo (a 12 s stunt could sit frozen past 15
real seconds with `document.hidden` reading false the whole time) —
fixed by rebuilding every timed demo around an explicit millisecond
accumulator (the same shape as the main game's `dt`-based `simTick`)
instead of diffing `performance.now()` directly, and adding a new
**`window.__lab`** test hook (`tick(ms)`/`state()`) as this page's own
equivalent of `__sim.step()`/`__sim.state()` — once driven manually,
every stunt and the room's turn completed in exactly its configured
duration. Machine-tested thoroughly end to end (every key in every
demo, the offset/distance/elevation clamps, 15 consecutive room runs
confirmed never monotonic by distance, the room's full solo→turn→
question→score flow with a deliberately mixed right/wrong/right
answer set producing the correct "2 of 3", the listener confirmed
reset on every stop). Zero console errors throughout. Every number is
a placeholder for Brian's ear. Not yet heard by Brian. Next: the three
game items — 3.31 (recorded station beacons), 3.29 (the ship page),
3.30 (the tractor beam) — then back to 3.28.

**Round 21 also built SPEC 3.31** (recorded station beacons, plus L.9's
game half): `buildPoiVoice` now checks a new `beaconAsset` field on the
POI's `QUADRANT`/`SECTOR_POIS` row FIRST, before the old
`combat`/`mining`/`station`/`gate`/`star`/planet synthesis chain — a
recording REPLACES the synthesized voice for that entry entirely
(loads async, guarded against the target having already been torn
down by the time the fetch lands, the same `t.nodes !== nodes`
staleness pattern used elsewhere). Station Meridian (both the delivery
run's fixed sector and the quadrant — one row each, same name) got
`space_station1`, Station Two `space_station2`, the Jump Gate
`space_station6`; both roster builders (`makeSectorRoster`'s `demo`
branch, `makeQuadrantRoster` via `quadrantPoiList`) thread the field
onto the target object. The Jump Gate's beacon also gained L.9's cone
(`gateConeInner`/`Outer`/`OuterGain`, `updateTargeting`'s new per-frame
step advancing `t.gatePhase` by `360/CFG.gateSweepS` degrees a second
and writing it to the panner's orientation) — `updateTargeting` needed
a `dt` parameter for this, threaded through its two call sites.
Machine-tested: all ten station recordings confirmed preloading at
boot; the gate's sweep phase measured exactly 180° after 5 of its
10-second period via `__sim.step()`; the delivery run's untouched
`SECTOR_POIS` roster confirmed sharing the same working code path; B
still cycles correctly with the new asset-based voices; rebuilding the
roster on a return to sector produced no errors. Zero console errors.
Not yet heard by Brian. Next: SPEC 3.29 (the ship page).

**Round 21 also built SPEC 3.29** (the ship page — F2 grown into the
full component reference): `buildShipLines()` now returns
`{text, heading}` pairs, same shape as `help.lines`/`map.items`, with
one heading per system (Hull, a conditional Mission when one's active,
Shields, Lasers, Missiles, Decoys, Warp, Reaction mass, Thrusters,
Extractor, Vacuum, Sensor, Repair crew, Systems, Cargo, Modules — 15
normally, 16 mid-mission); `shipScreenKey` grew H/Shift+H heading
navigation (copied from `helpKey`) and a first-letter jump (copied
from `mapKey`) that **cycles forward on repeats** rather than picking
one arbitrarily, since several headings share an initial (`s` walks
Shields → Sensor → Systems and wraps; `m` walks Missiles → Modules;
`r` walks Reaction mass → Repair crew) — no new state needed, it just
searches from just past the current cursor and wraps. Every line reads
live off `CFG`/`LASERS`/`profile`/`shipSystems` (no cached copy), so a
module purchase or a system knockout shows up the instant F2 reopens —
confirmed by buying a shield-capacitor module and seeing both the new
Modules line AND the Shields heading's already-updated raise time (1 s,
not 1.5) in the same reopen, and by forcing the sensor to half health
and seeing the Sensor heading's lock angles already halved. Tractor
beam is deliberately NOT in the heading list yet — 3.30 hasn't been
built, so there's nothing real for it to read; it lands as part of
3.30's own work instead of a placeholder heading now. `updateTargeting`
picked up a `dt` parameter for the prior 3.31 gate-cone work in this
same round, which F2's Sensor heading also reads through (`systemState`,
`zoneRad`'s halving) — no new machinery of its own. Machine-tested at
a local server: every heading reachable by H (forward and Shift+H
back, correctly refusing past either end); all 56+ lines read via
repeated arrow-down with zero `undefined`/`NaN`; the three duplicate-
initial cycles (`s`/`m`/`r`) all confirmed wrapping correctly; the
live-update check above; F12 describing F2's new shape without
opening it; Escape restoring the audio duck. Zero console errors.
Not yet heard by Brian. Next: SPEC 3.30 (the tractor beam).

**Round 21 also built SPEC 3.30** (the tractor beam), **completing
Phase 3L and its three game items** — next up is SPEC 3.28. Z now
starts/stops a tractor on the selected rock or core (mining only,
within `tractorRange` 500), pulling it toward the ship at a clean,
constant `tractorPullCore`/`tractorPullMedium` units a second by size
(20 for a small rock or a core — they share `ROCK_SIZES.length - 1`,
same `t.size` — 4 "barely" for a medium, 0/refused for large or huge);
`updateTractor(dt)` runs from `simTick`'s existing mining rock-physics
block and separately damps whatever velocity the target already
carries (`tractorDamp`, stronger than ambient `rockFriction`) so a
laser-shoved rock's momentum dies out fast. **A deliberate
simplification, flagged for Brian's call**: rather than modeling the
pull as a force competing with the laser's `beamPush` frame by frame,
it's a clean kinematic close-the-distance-by-X-per-second, which is
what gives the spec's own exact worked example (500 → 300 in precisely
10 s) — a laser can still visibly jostle the rock's position before
the tractor's damping catches up next frame, but it can't out-*pull*
the tractor once engaged, only nudge it momentarily. Not standard gear:
`CFG.tractorTestFit` (true) fits it to every ship for free until Brian
has heard it; `tractor_1` in `MODULES` (600cr, 2 alloy) is the real
gate once he flips it off. **Z's old job — the target-zone cycle —
moves to Shift+Z** (`cycleZone()`, extracted from the old inline case
so both bindings share it); Shift+Z is handled in its own branch ahead
of the existing W/T/Tab/R shift-chord block since the zone cycle is a
harmless preference toggle, not a combat action gated on `tug`/
`mission`/`over()` the way those are. F2 gained a conditional "Tractor
beam" heading (only appears once `tractorFitted()` is true — no
placeholder heading before the feature exists), reading its numbers
live and naming "Test fit" only when the module isn't actually owned.
New test hooks `poke({targetPos, targetSize, tractorTestFit})` and
`state().tractor` place/resize the selected rock directly rather than
hunting for the right size and distance by hand. **A real bug found
and fixed**: the auto-stop check was a strict `dist <= CFG.vacRange`,
but the pull's own clamped `closeAmount` can leave `dist` a hair above
`vacRange` by floating-point rounding as the gap shrinks to nearly
zero, so the strict comparison never actually tripped and the tractor
ran forever once it got close — fixed with a 0.5-unit tolerance.
Machine-tested at a local server: a core forced to exactly 500 engaged
immediately and, ticked 10 s, closed to 300 and self-stopped with "In
extractor range."; a medium measured exactly 4/s closed; large and
huge both refused by name; a rock forced to 900 refused naming the
distance and the reach; Z toggled a running tractor off; Shift+Z
confirmed still cycling the zone exactly as before; Z in a combat
drill refused ("only works while mining"); with `tractorTestFit` false
and no module, Z refused by name; buying `tractor_1` at a real station
(credits and alloy confirmed deducted) let Z work immediately after
and dropped F2's "Test fit" qualifier. Zero console errors throughout.
Every tractor number is a placeholder for Brian's ear. Not yet heard
or flown by Brian.

**Round 22 (Sonnet) built SPEC 3.28**, the quadrant's own timed delivery
contract — see the "The quadrant's own timed contract (Round 22, SPEC
3.28)" bullet above for the full shape: a third mission, Station
Meridian's alone, that starts a `contract` clock (mirroring `demo`'s own
shape) without entering a combat encounter, completed by clearing the
current Contested Zone, mining 15,000 ore at any field, and docking
back at Meridian with it, for the ore's own price plus a 200-credit
bonus and its own best-time log. One deliberate simplification flagged
for Brian's own call (mining stays unblocked before the zone is cleared,
unlike the demo's hard gate — only the delivery itself is order-gated)
and one real bug found and fixed before it shipped (a completed
contract's lingering, non-null `delivered: true` object was read as
"still open" by the availability check, permanently blocking
re-acceptance regardless of the cooldown timer — fixed by checking
`!contract.delivered` instead of bare truthiness). Machine-tested at a
local server end to end: the Meridian-only Missions gating, the full
accept-clear-mine-deliver loop paying exactly 1,700 credits on a
15,000-ore/200-bonus run and recording a personal best, all three
docking-short-of-complete refusal messages, the cooldown bug confirmed
both before and after its fix, F2's new Contract heading, the run log's
combined delivery-run/contract listing, and a full regression pass on
the untouched escort mission. Zero console errors. Not yet heard or
flown by Brian. Next: SPEC 3.23 (favor, control, and the three ranges —
Brian's station game), which touches docking directly and so goes in
before the quadrant's ports multiply.

**Round 23 (Sonnet) built SPEC 3.23 partially** — favor and the three
ranges are DONE; Control (Invest, the tithe, unions, quadrant-wide
comms) is deliberately deferred to 3.11, whose wants table it actually
needs to mean anything — see the "Favor and the three ranges (Round 23,
SPEC 3.23, PARTIALLY DONE)" bullet above for the full shape. In brief: a
real per-port favor meter replaces the old flat influence count, gating
three station ranges (comms/transporter/docking) instead of two;
missions, selling, and the fixed delivery run's own handover all feed
it; a pre-existing bug (mission favor always credited Meridian
regardless of which station offered the mission) got fixed in passing;
three new range-growth modules and an Allied-station range bonus exist;
the tug now targets the nearest station that actually trusts the pilot,
doubling the wait home when none does. Two real bugs were found and
fixed during this round's own testing: a migration edge case that
crashed a fresh boot, and — the more serious one — `reconcileFavor`'s
decay-floor logic silently un-doing real favor losses by snapping any
below-floor value back up the next time the port was touched, caught by
a reproducible repro and confirmed fixed via an independent Node.js
simulation. Also worth Brian's ear: Station Meridian starts exactly at
the Trusted threshold with no buffer, so idle decay alone can knock it
back to Known. Machine-tested thoroughly (tier gating in both
directions, favor gain/loss math, the Allied bonus, the module bonuses,
the tug rework, the migration, the demo's continued total immunity to
favor, a regression pass on escort), zero console errors, not yet heard
or flown by Brian. Next: SPEC 3.11 (ports, prices, and F4 trading),
which is what would let Control actually be built afterward — favor and
the three ranges wait for feedback like everything else in this file.

**Round 24 (Fable, docs only)**: Brian reviewed Phase 3 as built and
answered in `ideas9.txt` (untracked like every ideas file). Written into
SPEC.md as: A.6/A.13 addenda (five favor tiers with Honored at 90, favor
never below 40, decay in absence only, control rethought as investment →
station levels → passive production, the galactic-map cursor as a grid);
four new build items — **3.33** favor second pass (the absence-decay fix
for the bug Fable found in review: `reconcileFavor` stamps the visit on
every read, so favor drained everywhere at 1/hour regardless of trade;
mission favor ×2; 500 ore per point; zone-clear favor; Donate ore;
quadrant-wide comms after the first zone clear), **3.34** a full stop to
dock, the **lab second pass** (L.1b grid cursor, L.4b clips 5–8 on the
routes and a synthesized propeller for stunts, L.5b group controls with
brackets for vortex count, L.8b four assets rotating every 10 s, no
quiz), **3.32** reaction mass from kills/dust/missions with a simulated
run budget; **3.23b** Control as investment (direction, after 3.20,
blocked on Part C's ideas9 questions — quadrant 2 vs the Frontier is
the big one); 3.11 gains "missions follow what a station serves" and
wanted-only favor. Build order: 3.33 → 3.34 → lab pass → 3.32, then
**Brian flies everything since 3.24** before 3.11. Eight numbered
questions for Brian sit in Part C under "DECIDE (open, from ideas9)".
**Brian answered in chat the same evening (ideas10, in Part C)**: nobody
starts Trusted, Meridian included (3.33 drops `ensurePort`'s Meridian
special case); Trusted is permanent and decay only runs at Allied or
above; a stranger buys Known with a full 20,000 hold (`donateOrePerFavor`
2,000) or one combat encounter (`favorZoneClear` 16); **three quadrants**
— 1 no trading, 2 the economy (3.11/3.19/3.12/3.20 are built THERE, so
3.18 → 3.14 → 3.22 go first), 3 control and rival unions (Phase 4); the
Honored discount covers repairs and reaction mass. Fable's one push-back,
written into 3.22 for Brian to confirm: the gate opens at Known, not
Trusted, or the fast path he wants doesn't exist.

Tuning questions still open for play-test: provoked-retaliation fuse (4 s),
enemy damage pacing (30 per beam, 25 per missile — with the shield pool at
45 that's roughly 1.5 full beams absorbed before disrepair), attack gap
7–12 s, shield spool 1.5 s (2.5 s Ace) / repair 12 s, laser overheat window
8 s, whether the "Shields, G" coaching (first two warnings only) is enough
for newcomers, the docking corridor's tightness (`dockRadius` 40,
`dockMaxSpeed` 25 — deliberately the hardest version, a docking-computer
module loosens it in Phase 2), and the 5 module prices/costs (placeholder
numbers, never priced against actual ore/credit earn rate over a real
session).

Round 25 (Sonnet) built the four items ideas9/ideas10 called for, in
order: **3.33** favor second pass (decay/floor split, five tiers, the
Honored discount, Donate ore, quadrant-wide comms — see the "Favor,
second pass" bullet above), **3.34** a full stop to dock, the **lab
second pass** (L.1b the grid cursor, L.4b synthesized stunts, L.5b group
vortex controls, L.8b the four-asset room with no quiz — see the
"System damage" era bullets above for L.1-L.9's own originals and the
"Favor, second pass"/"A full stop to dock"/"Reaction mass matters"
bullets for this round's own work), and **3.32** reaction mass sources
plus the `runBudget()` estimator. One real, pre-existing bug was found
and fixed along the way: `stopAll()` in `soundlab.html` had been
silently breaking STOP ALL and cross-demo stopping since whenever it was
first built, unrelated to any of this round's own four items. Everything
machine-tested at a local server and confirmed on Pages, zero console
errors, nothing yet heard or flown by Brian.

**Round 26 (Sonnet)**: Brian played the Round 25 build and sent two
things to fix before resuming the build order — see the "Correction
(Round 26, ideas11)" bullet above (Favor section) and the "Be the Way"
bullet (`soundlab.html`/`audio/demo/` above) for the full shape of each.
(1) He reversed one line of his own ideas10 answer: the home station
(Station Meridian, in the starting/home quadrant) should start favored
and "never not have favor," not join every other station as a stranger
— `ensurePort` now seeds it at Trusted on creation, permanent for free
via the existing floor rule, and every OTHER station is unaffected.
This also resolved a standing inconsistency this session's own Round 25
work introduced without noticing: the game's help text had said
"Station Meridian starts Trusted" the whole time, unchanged since Round
23, while the code briefly disagreed. (2) A new lab demo, **L.10 "Be the
Way"** (`soundlab.html`, `#sec-way`), built from Brian's own txt
(`audio/demo/"be the way vortex demo1.txt"`) and four new recordings:
four independently-orbiting HRTF sources (explicitly NOT sharing L.5's
group-control model — Brian's own "not linked" here asks for the
opposite of what he asked for there), firing in a staggered sequence
rather than all at once, each shaped by its own speed/height/tilt.
His second paragraph (concentric off-center orbits with near/far
distance modulation) is noted in SPEC.md as a further idea, not built —
no numbers or mechanism given yet. Both machine-tested at a local
server (the home-station fix via a fresh-profile Sector entry and a
100,000-hour stale-clock floor check; the new demo via real-time state
polling confirming the staggered entrance, per-node independence, reset,
stop, and correct interplay with the shared `stopAll()` registry), zero
console errors. Per the user's own instruction, these two fixes came
before resuming the SPEC.md build order — the next step per that order
is still **Brian flying everything since 3.24**, a human playtesting
checkpoint, not a build task.

**Round 27 (Fable, docs only)**: Brian's `ideas10.txt` — a FILE, not the
chat answers SPEC.md's Part C already labels "ideas10" (a label
collision, now explained there; the file is called **ideas10.txt**
everywhere) — is seven notes from flying the Round 25/26 build, written
into SPEC.md as **3.35–3.40**, to build next, in this order, before
quadrant 2: **3.39** the Press-Enter screen speaks at load and repeats at
10 s then every 20 s until Enter (aria-live works before audio); **3.40**
`soundlab.html` links back to `index.html` (start gate, nav, bottom);
**3.37** decoys — FIRST prove a spoofed missile actually goes ballistic
and pops clear (Brian isn't sure they work; that may be a bug), THEN a
distinct `decoy_took` cue and "Decoy took it." at the pop, a real timer
after the launch line; **3.35** the tug second pass — 100 starting
credits, the 50-credit rush repeatable (each halves what's left; a fresh
pilot buys two), and the countdown reminding a lost pilot of F2/F3 (F4
once 3.11 exists); **3.36** the repair crew works the hull when no
system is broken, at HALF the system rate (`25 / repairHalfS` a second,
`repairHullFactor` 0.5 — ~6 min to full at stock, the crew modules speed
it for free), no cap, docking still instant — Brian's own adjustment
after agreeing the rest — and **ALL crew repairs now spend reaction
mass** (`repairRcsPerPoint` 0.2 per hull point OR system percent point,
pausing at a `repairRcsFloor` of 10 so the ship can always still turn;
Brian: "yes, all repairs use reaction mass"), which reaches back into
3.27's `updateRepairCrew` as built — the one line that changes there is
noted under 3.27 in SPEC.md; **3.38** auto-target
on **Shift+T** (rebound from cycle-back — Shift+Tab keeps that; the key
map above is annotated): the stabilizers slew yaw+pitch onto the
selected target at a rate set so the worst case (180° behind at
`pitchLimit`) takes 2 s at the fastest tier, hold 5 s tracking it, then
release; 3 charges a sortie refilled with missiles, a kill-buff roll for
one more, three shipyard tiers (6/4/2 s) with `autoTargetTestFit` giving
everyone tier 3 until Brian has flown it (the tractor's pattern). Five
readings flagged in Part C's new "DECIDE (open, from ideas10.txt)" for
Brian to overrule: "2x" read as *twice*; the Shift+T rebind; the 5 s
hold; hull repair uncapped and tier-derived; decoy confirmation at the
pop. Nothing built this round.

Round 27 also carried a small follow-up: Brian confirmed "yes, all
repairs use reaction mass" (not just the hull), folded into 3.36 as
built and noted back under 3.27 (docs only).

**Round 28 (Sonnet) built all six ideas10.txt items, in the specced
order**: 3.39 (the Press-Enter screen speaks and repeats — see the
"Press-Enter screen itself speaks now" bullet, Accessibility
architecture), 3.40 (the lab links home — see the `soundlab.html`
bullet, Files), 3.37 (decoys confirmed and heard — see "Decoys
confirmed working, and heard working", Combat), 3.35 (the tug second
pass — see "100 starting credits, a repeatable rush, and a wait that
teaches", Combat/Death-by-tug), 3.36 (the crew works the hull and every
repair spends reaction mass — see "The crew also mends the hull...",
System damage), 3.38 (auto-target — its own bullet, right before
Weapons — lasers). All six machine-tested at a local server with zero
console errors; 3.37 and 3.38 in particular required real live combat
(a real guided missile, a real selected target at an engineered worst-
case facing) rather than mocks — see their own bullets for exactly how.
Two small test-only hooks were added along the way, worth knowing about
for future rounds: `poke({yawDeg, pitchDeg})` (forces the ship's own
facing directly, in degrees) and `state().autoTarget`. SPEC.md's build
order now reads ideas10.txt as fully DONE. Per that order, the next step
is **Brian flying everything since 3.24** — a human playtesting
checkpoint spanning this round and the two before it (ideas9/ideas10
chat, ideas11) — not a build task. Nothing in Phase 3's quadrant-2 items
(3.18/3.14/3.22/3.11/etc.) should be started without further word from
Brian.

**Round 29 (Fable, docs only)**: Brian's `ideas11.txt` (untracked, like
every ideas file) reviewed against the build — his own worry was that
his newer ideas might contradict what exists. Verdict, written into
SPEC.md Part C: nothing contradicts the *build*; two things contradicted
the *spec* and both resolve. **The lattice** (a 9×9×9 grid, quadrants on
a 3×3×3 lattice, travel only along its lines, gates as edges, waypoints
between, up to eight opposing factions at the corners) is reconciled
with ideas10's three quadrants by making them ONE lattice edge — cells
0/3/6 of the home route — so nothing specced for Q1/Q2/Q3 changes; it's
now A.13 direction. **Supply chains / cut-off quadrants / planet
investment** land on 3.11 + 3.23b, and the cut-off rule turns out to be
exactly the two CFG knobs 3.33 wrote unread
(`favorDecayQuadrantControlled`/`QuadrantsTouching`) — with one catch
flagged: 3.33 never decays favor below Allied, so isolation should erode
*control*, not favor. Three items written as proposals, none scheduled:
**3.43** a silent test mode (`?mute=1` + `poke({mute: true})`, UNSAVED
on purpose so it can't persist into Brian's own profile — Brian's ask
was aimed at Sonnet's testing; once built it becomes a standing Working
agreement here: every test boots muted AND beacons-off), **3.41** the
flight course (beacons to fly through against the clock, guidance ticks
on the active gate, a four-deep volume ladder, +10s a miss, its own
run-log board — with the one push-back that it belongs in the GAME as a
mission-menu item, not the lab, since the lab has no ship), and **3.42**
escort in formation (Shift+F toggles a frame on the moving freighter,
W/S along, arrows around, presets below/above/port/starboard, a real
freighter engine loop; the catch is aiming — nose outward by default,
3.38 on top — so it waits until Brian has flown auto-target). Fable's
proposed order: 3.43 now, then Brian's playtest, then 3.41 → 3.42, then
quadrant 2 as ordered; the lattice stays Phase 4. Six questions for
Brian sit in Part C under "DECIDE (open, from ideas11.txt)". Nothing
built this round.

**Round 29, continued (Fable, docs only)**: Brian answered the two
questions that mattered — **Q1 is a corner; cut-off erodes control, not
favor** — and then shrank the lattice to **"our cube"**: a 3×3×3 whose
**eight corners are the quadrants**, the twelve edges the routes (one
waypoint at each midpoint), the faces and centre travel space at most
(Fable: reserve the centre for A.8's base). His reasons: 27 is too many
to fill with control play, and "I do not want quadrants to ever feel
the same" — eight can be hand-authored and told apart blind, each with
more stations than today's two. Written into A.13 and 3.23b, with an
impact list in Part C: Q2/Q3 become two of Q1's three neighbouring
corners (not cells along one route); 3.22 needs one gate POI per
quadrant offering three edges, not three gates; `QUADRANT` becomes
`QUADRANTS[id]` with four-to-six stations a corner — a data change, not
a code one, since everything since 3.10 already iterates stations by
name; 3.23b gains "quadrant control" (a majority of a corner's stations)
as the thing cut-off erodes; the galactic cursor gets simpler (corners
and midpoints only). Still open: stations per quadrant, the majority
rule, the centre as the base, opponent count as a difficulty setting,
which neighbour is Q2. Nothing built.

**Round 29, third pass (Fable, docs only)**: Brian settled most of the
cube — stations per quadrant unique and part of each corner's
character; the centre for bases; faces/centre unreachable for now;
**control exists in every quadrant from the start but is offered only
from Q3** (`profile.controlUnlocked`; NPC unions work unseen before
that — ideas9's "does the computer start with unions" answered by
construction). And he set the **spoken coordinate vocabulary**: the
centre is the origin, cells are spoken vertical → lateral → depth
("1 below", "1 left", "1 behind"), zeros unspoken, home = "1 below, 1
left, 1 behind". His question — how do warp gates sit "semi-
realistically" in a quadrant where every other POI orbits — got the
answer written into A.13 and a 3.22 addendum: **three fixed gates per
corner, one per edge, placed on the outer ring in their edge's own
direction** (the gate to "1 above" is literally above the star's plane,
an elevated POI the ear already handles), arrival at the neighbour's
matching gate, one shared `CUBE_AXES` table for placement, cursor words,
and arrival; the one-gate-hub-with-a-menu idea is withdrawn (a menu
teaches nothing, a gate you climb to teaches the map). Two push-backs
open in Part C: the galactic cursor should open on the quadrant you're
in, not the unreachable centre; and one press should move one cell
(no Shift step). Still open: which neighbour is Q2 (Fable: "1 right"),
the majority rule, opponent count. Nothing built.

**Round 29, fourth pass (Fable, docs only)**: Brian confirmed the
galactic cursor's start as the **centre of the facing plane** ("1
behind" — every corner of the near face is two presses away; right-then-
down lands on Q2's corner, which is also the corner Fable proposed as
Q2), and then made that cell **the one reachable non-corner in the
cube, from Q2 only** — a protected place beside home with no route from
home, "and we can do special things in there." Fable's geometry check:
it works precisely because a face centre is two cells from every corner,
so the route is a spur off the lattice, not an edge — Q2 gets the cube's
only off-axis **fourth gate** (toward the face centre, "1 above, 1 left"
in Q2's frame), the place has one gate back. Written into A.13, the 3.22
addendum, and Part C, with three things open: what the place IS (Fable:
the pilot's mid-game harbour — storage beyond the hold, a free yard;
the cube's centre stays the endgame base), what opens the fourth gate
(favor at Q2's station, or a quest), and whether rivals can ever enter
(Fable: no). Nothing built.

**Round 30 (Sonnet) built SPEC 3.43** (silent test mode — see the
"Fully silent testing" bullet, Working agreements, for the full shape):
a module-scope `muted` flag and one `setMuted(m)` function are the
whole mechanism. `?mute=1` sets it at parse time and the boot handler
sets `masterGain`'s value DIRECTLY to 0 (no ramp — a ramp would let a
brief blip through before muting); `poke({mute: true/false})` calls the
same `setMuted` for a live, ramped toggle mid-session; `state().muted`
reports it. Neither path touches `profile` or `localStorage` — the
Sound menu's own four saved levels are untouched, and muting only ever
moves `masterGain`, underneath every category bus. `say()` is
unreachable by any of it (an aria-live div, no Web Audio node).
Machine-tested at a local server: `poke({mute:true})` measured
`masterGain.gain.value` dropping from 0.7 to exactly 0 and back on
`poke({mute:false})`; a live menu navigation confirmed speech
unaffected while muted; the saved profile was inspected directly and
carries no trace of mute. **A local-testing wrinkle, found and then resolved on Pages**: this
session's browser-preview tool strips query strings from every LOCAL
static-server URL no matter how it's reached (`navigate`,
`preview_start`, even `history.pushState`+reload all landed back on the
bare origin), so `?mute=1` couldn't be exercised against the local
server. Confirmed it wasn't a code problem by trying the identical URL
against the live Pages deploy instead: `?mute=1` survived the real
navigation there and booted with `state().muted === true` and
`masterGain.gain.value === 0` immediately, speech still working, zero
console errors — genuine end-to-end confirmation. Zero console errors
throughout. This is now a standing test convention — every future test
script adds `?mute=1` to its navigation, in addition to the beacons-off
poke. Not yet heard by Brian — nothing to hear, by design.

**Round 31 (Sonnet) built SPEC 3.41**, the flight course — see the
"The flight course" bullet above (right after Mining) for the full
shape. Built ahead of its own place in the build order (originally
slated for after Brian's playtest of everything since 3.24) at his
direct request, right after he asked whether it existed yet. Machine-
tested thoroughly via `__sim.step()` and precise `poke({pos})`
placement at each gate's own geometry (real flight through the winding
path would have been far slower to verify), zero console errors. Per
the build order, the next steps are **Brian flying everything since
3.24, now including the course**, then **3.42** (escort in formation,
an experiment still waiting on 3.38 having actually been flown), then
quadrant 2 as ordered.

**Round 32 (Fable, docs only)**: Brian's `ideas12.txt` (untracked, like
every ideas file) — nine notes from flying the Round 28–31 build —
written into SPEC.md as **3.44–3.51 plus L.5c**, all proposed, none
built: **3.50** an `refusal_offline` buzz distinct from the two clicks
(buzz = can't here / broken, click = can't yet); **3.51** Y speaks the
resource totals anywhere, credits first, with a `y` pass-through in
every captured-input menu; **3.45** five volume steps (a one-time index
remap of saved levels, `PROFILE_VERSION` → 8) plus the Beacons line
moving into the Sound menu; **3.49** the flight course second pass
(closer gates, bigger trigger, pass/miss chimes, a made/missed tally,
rank against best) — **with a geometry push-back**: 400 spacing + 250
radius lets a pilot who never turns clean most gates (25° over 400 =
~169 offset, inside 250), so Fable proposes 400/200 with 35–45° turns,
or two courses; **3.44** B becomes the tractor in three tiers (Shift+B
steps down with the `laser_switch5` clip, no wear), Z goes unbound,
beacons lose their one-key toggle — accepted and flagged; **3.48** F2
shows the equipped laser per slot and switches it there (clip, no
delay — F2 is frozen sim); **3.46** four new laser families for slots
3–6 — **verified**: `burst_plasma`/`fast_fighter`/`rotary_cannon`/
`rugged_mining` 1–8 are on disk, 32 untracked files — with the missing
piece Brian didn't mention, a "Fit [family] in slot N" shop line (no
way to fill an empty slot exists today), and four proposed profiles
with non-overlapping jobs; **3.47** the stats page — Brian said to
DISCUSS, not build: Fable's read is that the Sound Lab is the precedent,
`localStorage` the data, and the real work the counters that don't
exist yet; five questions in the item; **L.5c** the vortex as six named
presets replacing the group controls. Proposed order, cheapest first:
3.50 → 3.51 → 3.45 → 3.49 → 3.44 → 3.48 → 3.46 → L.5c, all before 3.42
and quadrant 2. Open in Part C: the course geometry, what Z becomes,
tractor tier numbers, the laser profiles and fit price, F2's no-delay
switch, the five stats questions. Nothing built.
**Brian answered two the same evening**: the stats page is read-only;
and on the course, "cut my requests in half except the radius" —
spacing 500, radius 250 — with the reason that reframes 3.41: he flies
the course on **manual thrust** ("for beginners, auto-thrusters probably
won't be used that much, it's very hard to keep things centered"), so
the bigger radius is forgiveness for hand-centering, not a shortcut.
Fable's check still holds at 500/250 (500·sin 25° ≈ 211 < 250, straight
flight cleans a 25° turn), so 3.49 raises the gentle course's turns to
35–45° — you must turn, you needn't be precise. Decided, written into
3.49 and Part C.

**Round 33 (Sonnet) built the first three ideas12.txt items — SPEC
3.50, 3.51, and 3.45**, in that order, per the "cheapest first" build
order Round 32 wrote. **3.50** (the offline buzz): a new `refusal_offline`
cue (a short low buzz through a lowpass, `audio_cues.js`'s `ui`
category) joins the existing `refusal_dud`/`refusal_wait` clicks, and
~20 refusal call sites across `index.html` were sorted against one
rule — buzz = can't here or it's broken, click = can't yet — several of
which (weapons-cold, auto-target's mode/fitness checks, the extractor/
vacuum's wrong-mode checks) had no cue at all before this round. See
SPEC.md 3.50's own DONE paragraph for the full site-by-site breakdown
and the handful of judgment calls flagged for Brian's ear (the
tractor's "too far" left as `dud`, "too massive" moved to `offline`,
"no missiles left" moved to `dud`, the tug fee's insufficient-credits
check moved to `dud` for consistency with the shops). **3.51** (Y
speaks the totals): a new `speakTotals()` gives one combined line —
credits, ore, salvage, alloy, reaction mass, warp charge, missiles,
decoys, plus auto-target charges when fitted — bound in the raw sim's
key switch and pass-through in ten menu handlers (station, Modules,
Lasers shop, hail/transporter, Missions, the map, F2, F3, the run log,
and the Sound menu — the last one added this round for consistency,
closing a gap the original 3.51 build order didn't call out). Two
handlers (`shipScreenKey`, `mapKey`) needed the `y` check placed BEFORE
their own generic first-letter-jump catch-all, or it would have been
silently swallowed. **3.45** (five volume steps): `SOUND_LEVELS` grew
from three entries to five (off/low/quiet/medium/full); the one real
gotcha, caught before it shipped rather than after, is that growing the
array silently changes what index 2 MEANS (was "full", now "quiet") —
this would have broken BOTH a brand-new profile's default (fixed:
`defaultProfile()`'s hardcoded `2` is now `SOUND_LEVELS.length - 1`)
AND every existing saved profile's own volume setting (fixed: a
`PROFILE_VERSION` → 8 migration remaps `{0:0, 1:2, 2:4}`, checked
against the raw saved JSON rather than the already-merged `profile`
object — the same SPEC 2.18/3.26 trap, applied again on purpose). The
Beacons line specced for this item moved into the Sound menu as one
extra row past the four real categories (not a real `SOUND_CATS` entry,
since it cycles `BEACON_MODES`, not `SOUND_LEVELS`) — the standalone
`B` key is untouched, still the only OTHER way to reach it until 3.44
removes it. All three items machine-tested at a local server (every
reclassified refusal cue confirmed at its call site; Y confirmed
speaking identically from ten different menu contexts without
disturbing their own cursor state; a fresh profile confirmed
defaulting to full, not quiet; all five volume steps and the Beacons
line browsed/cycled/saved correctly in both directions; a seeded
pre-3.45 profile — three-level indexes, no `music` key at all — loaded
migrated exactly as designed, confirmed both in-memory immediately and
in the persisted `localStorage` copy only after the next real save),
zero console errors throughout, none of it yet heard by Brian.

**Round 33 (Sonnet) also built SPEC 3.49**, the flight course second
pass, in the same session right after 3.45. `courseSpacing` 600 → 500,
`courseGateRadius` 150 → 250, and `COURSES.gentle`'s turns raised from
under-30° to 35–45° — all already decided in SPEC.md, nothing left open
going in. Two new cues (`course_pass`, `course_miss`) fold into
`clearCourseGate()` alongside a new `made`/`missed` tally on
`courseState`; `recordCourseRun()` now returns the previous best in
seconds (not a boolean) so the final line can speak the actual delta —
"Your first time." / "New personal best by N seconds." / "N seconds off
your best." — combined with the tally into one `say()`, per the SPEC
2.15 rule. **One real testing gotcha, not a game bug**: a first attempt
to prove "straight flight now misses gates" by walking positions along
a single fixed world-axis line hit a genuine edge case — a position
placed exactly ON a gate's plane registers as depth 0, which the game
correctly treats as "hasn't reached it yet" (real continuous flight
always arrives a hair past the plane, never exactly on it) — so that
test's per-gate attribution came out confused. Caught from the test's
own contradictory output rather than shipped as a false pass; fixed by
nudging every test position a couple of units past each gate's own
plane along its forward vector, and by computing genuine per-gate
perpendicular offsets (via each gate's own cross product with world-up)
for deliberate hit/miss cases rather than guessing a single world-axis
offset — a crude first attempt at a "deliberate miss" test on one gate
actually registered clean, because a raw world-axis nudge isn't
uniformly lateral across every gate's own differently-oriented forward
vector. With both fixes: straight, never-turning flight through the
gentle course was confirmed missing the large majority of its eight
gates (only the one gate that happens to sit exactly on the initial
heading passes clean) — direct confirmation the geometry push-back
worked; a controlled alternating clean/miss run confirmed both chimes
firing at the right gates and the tally reading "4 of 8 gates, 4
missed" with a correct "Your first time."; a following all-clean run
measured 0 seconds and said "New personal best by 40 seconds."; a third
run with one deliberate miss said "10 seconds off your best." against
that new best. Zero console errors throughout. Every number here is
still a placeholder for Brian to fly and judge. Not yet heard or flown
by Brian.

**Round 33 (Sonnet) also built SPEC 3.44** — B is now the tractor beam,
tiered like the lasers; Z is unbound; beacons stay purely in the Sound
menu (3.45 built where they moved to, this round removes the last way
to reach them from a live key). `TRACTOR_TIERS[0..2]` holds per-tier
medium/large/huge pull rates (core/small stays flat at
`CFG.tractorPullCore` on every tier); `tractorLevel()` is the OWNED
ceiling, read directly off module ownership (1 with the test fit,
rising with `tractor_2`/`tractor_3`) — the exact pattern
`autoTargetTier()` had already borrowed FROM this feature back in SPEC
3.38, now built for real. `tractorTier` is the SELECTED tier, live
session state reset to the owned ceiling on every fresh mission start,
so a pilot who never touches Shift+B always gets their best. Shift+B
steps it down, wrapping to the top, reusing `laser_switch5`
(`SLOT_SWITCH[2]`, 2.2s) at natural length with B refused meanwhile —
a direct mirror of the laser slot switch's own machinery
(`tractorSwitch`/`stopTractorSwitch()`/`tractorSwitchLeft()`). Two new
MODULES, `tractor_2`/`tractor_3`, each requiring the one below,
alloy-priced like the repair crew's. `beaconKey()` is deleted outright
— three call sites removed (the raw-sim switch, a mission-menu
B-passthrough, a Sound-menu B-passthrough), not just the obvious one.
**A documentation gap found while sweeping for stale text, not a code
bug**: fixing the raw-sim `B` binding alone would have left FOUR other
"the B key"/"B cycles beacons" references pointing at a key that no
longer does that — one of them live code (`beaconNote()`'s own spoken
hint at sector entry, which would have kept telling a player with
beacons off to press a B that had stopped working), the rest comments.
All four fixed alongside the main rebind, plus README/CLAUDE.md's own
key-map text and — noticed only because a test script's blind `s`,`s`
press landed on the WRONG menu item — a separate, pre-existing
staleness: CLAUDE.md's key map said "S cycles Sector then Sound," but a
third item, "Sound Lab" (added back in Round 18), also starts with S
and had never been mentioned; fixed to "Sector, then Sound, then Sound
Lab" while already touching that line. Machine-tested at a local
server against a profile seeded with `tractor_2` owned: Z answering "Z
does nothing here", Shift+Z unaffected, a fresh mining start defaulting
`tractorTier` to the owned ceiling, a medium rock's pull measured at
exactly 12/s at tier 2 and exactly 4/s after stepping down to tier 1, a
large rock refused at tier 1 and pulling at exactly 3/s back at tier 2,
B's mid-switch refusal and Shift+B's wrap-to-the-top (not the max
tier) all confirmed, F2's Tractor heading reading correctly, and the
mission menu's B press falling through cleanly to "No item starts with
B." Zero console errors throughout. Every tier number and price is a
placeholder for Brian to fly and judge. Not yet heard or flown by
Brian.

**Round 33 (Sonnet) also built SPEC 3.48** — F2's Lasers heading is now
one block per fitted slot (name/level/status, per-tick numbers,
matchup, health) instead of a per-family list to reconcile against a
separate per-slot list, and Left/Right on any of a slot's own lines
cycles that slot's level within what's owned, re-reading the block with
the new numbers. `buildShipLines()`'s `line()` helper grew an optional
`slot` tag so `shipScreenKey`'s new Left/Right branch can tell which
slot the cursor is on from any of that slot's four lines, refusing
cleanly ("This line isn't one.") anywhere else and with the offline
buzz on an empty slot. A new `playSlotSwitchClipNatural(i)` plays the
slot's own switch clip at its real length with no stretch and no
refusal window — F2 is a frozen sim, so nothing is actually delayed,
the clip is just there for the feel. Machine-tested at a local server
against a seeded profile (mining level 3 in slot 1, rapid level 1 in
slot 2): Left/Right cycled and wrapped correctly in both directions
with the per-tick numbers confirmed changing for real (15 at level 1
vs. 21 at level 3); Left/Right on the heading and the shared Range line
both correctly refused as not a slot line; the empty slot 3 refused
with the fit-at-the-station message; closing F2 and reading
`localStorage` directly confirmed the chosen level persisted to
`profile.slots`, with `laserHealth` untouched (wear is a firing-time
thing, not a browsing one). Zero console errors. Not yet heard or
flown by Brian.

**Round 33 (Sonnet) also built SPEC 3.46** — four new laser families
(rugged mining, fast fighter, rotary cannon, burst plasma) for slots
3–6, and a new "Fit [family] in slot N" mechanism in the Lasers shop to
put them there in the first place, since nothing before this round
could fill an empty slot at all. Brian's own 32 recordings were
re-measured with `ffprobe` rather than trusted against Fable's
proposed durations (written before the clips existed) — the real
lengths (5.0s/5.0s/7.0s/7.0s) meant every family's tick count and
spacing had to be refit to what the clips actually run, the same way
mining/rapid were originally fit to theirs. `buildLaserShop()` rebuilds
the shop's own line list (buy/repair for an owned family, "Fit" lines
for every empty-slot × unowned-family pairing) at open and after every
purchase, so a family fit once simply stops being offered as "fit"
anywhere else — the "no second fit" rule falls out of that rebuild for
free, no special-case check needed. **A real, pre-existing migration
bug found while testing, exposed by this round but not caused by it**:
`loadProfile()`'s SPEC 3.26 migration iterated the LIVE `LASER_FAMILIES`
array unconditionally on every load (never gated on version, reading
current data instead of a frozen historical shape) to backfill
`laserLevels` for anything missing from the raw save — harmless while
that array only ever held mining/rapid, but the moment this round grew
it to six entries, the same loop silently handed every profile —
fresh or old — a free level 1 in all four new families, confirmed by a
direct repro (a freshly-cleared profile showed all six families owned
in `laserLevels` while `profile.slots` correctly still showed slots 3–6
empty). Fixed by gating the block on `loadedVersion < 4` and hardcoding
its family list to `['mining', 'rapid']` instead of the live array — a
migration has to stay pinned to what it originally migrated, not grow
with whatever the live data model adds years later. Machine-tested at
a local server end to end, docked with seeded credits/alloy: the shop
showed exactly 16 fit lines (4 slots × 4 families) before any fitting;
fitting burst plasma into slot 3 deducted the right cost, set the
right profile fields, and correctly dropped to 9 remaining fit lines
with burst plasma's own buy/repair lines now in their place;
insufficient-credits and insufficient-alloy refusals both confirmed;
F2 read both newly-fit lasers (slots 3 and 4) with correct real
numbers. Firing wasn't exercised in live combat this round (weapons
are cold in the open sector, and it's a data-only addition riding on
completely unchanged firing code) — confidence comes from F2 already
confirming the exact values `beamTick`/`startBeam` would read. Zero
console errors. Not yet heard or flown by Brian.

**Round 33 (Sonnet) also built L.5c, completing every ideas12.txt
item.** `soundlab.html`'s vortex demo drops L.5b's one shared group of
live-adjustable knobs (height/sway/tilt/speed/audible-count via arrows,
Page Up/Down, Home/End, `[`/`]`) for six hand-authored
`VORTEX_PRESETS` — Ring, Counter, Tilt, Near and far, Storm, Solo —
picked with keys 1–6 or Up/Down (wrapping), R replays the current one,
Escape stops. The 8 audio nodes are created once and never recreated
by a preset switch — only each node's own orbit table and the shared
group fields retarget, which is what makes switching mid-run ramp
smoothly instead of popping or restarting, per Brian's own test
requirement. `__lab.state().vortex` gained `presetIdx`/`presetName`.
**One real snag, purely a testing artifact, not a bug**: this session's
own click on the lab's "Start audio" button used a stale coordinate-
based ref that landed nowhere, leaving `SIM.audio.ctx` null —
`vortexStart()`'s existing `if (!A.ctx) return;` guard then failed
completely silently (correct behavior for that guard, but no status
text or error either), which briefly looked like a real bug until the
actual cause (clicking the button by its real `id` instead) was found.
Machine-tested at a local server: all six presets confirmed selecting
correct names/descriptions and resolved parameters (Solo's
`audibleCount:1`, Storm's `sway:90`/`tiltDeg:45`, Tilt's `tiltDeg:90`);
Up/Down wrapping at both ends; the node count held constant at 8 across
every switch; R and Escape both confirmed; a full second start/stop
cycle confirmed nothing broke. Zero console errors. This closes
ideas12.txt entirely — the next step per the standing build order is
Brian actually flying/hearing everything shipped since SPEC 3.24,
before 3.42 or quadrant 2 begin.

**Round 34 (Sonnet): Brian dropped a new batch of recordings and asked
for them reviewed and wired in "where appropriate," asking to be asked
if anything wasn't obvious.** Five groups arrived; three wired in
cleanly, two didn't have an existing hook to wire into and were
confirmed, not guessed at, via two direct questions. **Wired**: (1)
mining core voices — a rock collapsing to its mineable core now swaps
to one of two real per-type recordings (`swapRockCoreVoice`, a genuine
crossfaded voice change through a second gain feeding the rock's
existing lowpass/panner) instead of just pitching the same pre-core
loop up, which is all it ever did before; falls back to the old pitch-
ramp if the asset isn't decoded yet. (2) a 'large' rock's own stage-
blast pool — `explosion_rock` (audio_cues.js) now branches on a new
`opts.size` param, picking from 6 dedicated `asteroid_large_crumble`
recordings instead of the generic 3-explosion pool specifically when
the rock breaking is large; every other size unchanged. (3) Drone's
own dedicated engine (`ship_drone_1`) replacing the borrowed
`ship_corvette_1` at both roster sites (`makeRoster`,
`MISSION_WAVE_STATS`). **Asked, then wired per the answer**: the 8
`tractor_beam` recordings (numbered 2-9, no tier labels) don't map
onto the 3 tractor tiers SPEC 3.44 just added — asked whether to pick
one for all tiers, map specific files to specific tiers, or leave them
unwired; Brian picked "one file for all tiers," so `tractorStartHum()`
now plays a real recording (`tractor_beam2`) instead of a synthesized
90Hz tone, with the existing proximity effect ported from oscillator
frequency to `playbackRate` (same ~2.9x ratio, 1x at `tractorRange` to
~2.89x at `vacRange`) — the synthesized tone is now only a same-session
fallback if the asset somehow isn't decoded yet. **Asked, left alone**:
the pulsar (7 files, no 4) and space_loop (7 files, no 2) recordings,
plus a nebula-description note (10 ElevenLabs prompts, Brian's own) —
none of it matches any existing feature (no "nebula" or "pulsar" POI
exists), so rather than invent a mechanic unilaterally, asked directly;
Brian confirmed it's a future feature, left unwired on purpose. All
three wired items machine-tested at a local server: a forced small-rock
collapse confirmed `resource: true` with zero console errors (direct
per-node-graph inspection isn't exposed via `__sim.state()`, so
correctness rests on the crossfade code path executing without
exception plus careful review — a real gameplay collapse is the
strongest test available short of adding a debug hook); the
`explosion_rock` cue confirmed accepting and branching on `size: 'large'`
/`'medium'`/no-size, all three call shapes error-free; a Drone selected
in a live Combat drill roster built its voice with zero console errors;
the tractor engaged, pulled, released, and re-engaged cleanly with the
real recording. Every new manifest key preloads and decodes (confirmed
via `AUDIO_PRELOAD`/`assetBufs` directly). Nothing in this round was
heard by Brian yet, and none of it touches SPEC.md's own numbered build
order — this was pure asset-integration housekeeping alongside it.

**Round 35 (Sonnet): Brian dropped 25 more recordings in
`audio/Explosions/` — four ship-explosion size tiers — and asked for
them found and wired in directly this time (no review-and-ask framing,
just "go ahead").** `explosion_kill` (audio_cues.js), the cue every
combat kill already played (100% synthesized until now — unlike
`explosion_rock`, it never had a recorded pool at all), gained a
`pools` lookup keyed by a new `opts.size` and picks a random member of
whichever tier matches; the original noise-plus-thump survives only as
the fallback for a tier with nothing decoded yet. A new
`SHIP_EXPLOSION_SIZE` table (index.html, next to `SHIP_CLASS`) maps
each roster ship NAME — not `SHIP_CLASS`, deliberately — onto one of
the four tiers: `Cruiser` (the roster's toughest hostile, 150 hp,
orbiting) gets `capital`, the biggest/longest pool; `Freighter` (same
`SHIP_CLASS` — cruiser — but a lesser non-combat hull, 120 hp) gets
`large`; `Drone` (corvette class) gets `medium`; `Raider`/`Scout`
(interceptor class) get `small`; anything unlisted (`Miner`, or any
future ship) falls back to `medium`. This was a genuine judgment call,
flagged here rather than silently made: the four tiers don't map 1:1
onto `SHIP_CLASS`'s three categories, so the cruiser class had to split
across two tiers by ship identity rather than reusing the class
wholesale — the real file lengths (`ffprobe`: capital ~8-9.5s, large
7.0s, medium 5.0s, small 3.0s, a clean deliberate progression) supported
reading `SHIP_CLASS` as an ordinal "how big" ranking (matching
`SALVAGE`'s own interceptor<corvette<cruiser ordering) rather than a
literal HP sort, which is why Drone (the single LOWEST-hp ship in the
roster at 40) still gets the middle tier, not the smallest. **A real
bug caught before it shipped, not after**: `explosion_rock`'s own
existing fallback (`SIM.cues.play('explosion_kill', opts)`, added last
round for its own size-aware crumble branch) passed its ROCK-size
`opts.size` (`'huge'/'large'/'medium'/'small'`, from `ROCK_SIZES`)
straight through — since three of those four words are ALSO valid keys
in `explosion_kill`'s new ship-size `pools`, a rock's fallback explosion
would have silently played a SHIP explosion sound (e.g. a large rock
→ the `ship_large_explode` pool) purely by vocabulary collision, never
exercised in this round's own testing since the rock explosion assets
are always decoded by the time a real fallback would trigger. Fixed by
having that one fallback call construct a fresh `{ pos: pos }` object
instead of forwarding `opts` wholesale, so a rock's own size can never
leak into the ship lookup. Machine-tested at a local server: all four
new manifest-key samples confirmed decoded; a full 5-ship Combat drill
kill sequence (`poke({enemyHp: 5})` plus real per-shot cooldown waits,
since the laser's `Date.now()`-based cooldown ignores `__sim.step()`'s
simulated time) killed Raider and Scout (small), Freighter (large),
Drone (medium), and Cruiser (capital) — every one of the four tiers
exercised through genuine gameplay, zero console errors throughout,
salvage amounts on each kill cross-checked against `SALVAGE`'s own
per-class values as an independent correctness signal; a direct call
sweep (`SIM.cues.play('explosion_kill', {size: ...})` for `capital`/
`large`/`small`/no-size/an unrecognized string) confirmed every branch,
including the medium-default fallback, resolves without throwing. Not
yet heard by Brian. Like Round 34, this doesn't touch SPEC.md's own
numbered build order.

**Round 36 (Sonnet): Brian, mid-playtest-checkpoint, asked for the
sound lab's galactic-map demo to actually be the cube design (A.13)
rather than the free-roaming grid it had been sitting as since Round
25.** `soundlab.html`'s L.1b ("3D grid cursor") is now L.1c: coordinates
are cube cells in `{-1,0,1}` per axis, not raw world units, and
`gridCellKind()` sorts every cell into one of the cube's three real
kinds by how many axes are nonzero — corner (a quadrant), edge midpoint
(a waypoint), or face centre (a view, not a destination) — the same
test the real galactic map will need. One press moves one cell along
an axis (Shift dropped entirely — A.13 had already withdrawn the
"Shift for a midpoint" idea once the cube shrank from the earlier
9×9×9 lattice); a press refuses instead of moving when it would land
back where it started (the cube's outer boundary) or on the cube's own
forbidden centre. `CUBE_NAMES` gives the 8 corners placeholder
identities, keyed by home + Fable's still-unconfirmed Q2/Q3 proposal
(home's lateral neighbour = Quadrant 2 "the economy," its vertical
neighbour = Quadrant 3 "control") — flagged in both SPEC.md and here as
NOT Brian's own confirmed answer, just the best current one so the demo
has real names to speak rather than raw coordinates. Enter is
context-sensitive by cell kind (jump+chime on a corner, a lesser blip
and "just the road" on a waypoint, a flat refusal on an ordinary face
centre) with one deliberate exception: the near face's centre — the
demo's own START position, exactly what Brian asked for ("starting at
the center of the closest face") — always succeeds as the one harbour
reachable from Quadrant 2, though this demo can't actually check
"which quadrant is the pilot in" the way the real map eventually will,
so that check is simply skipped here (flagged, not hidden). A corner
gets a real voice (L.1b's own engine loop, unchanged), a waypoint gets
the same loop heavily muffled and quiet, a face centre gets none at
all. Machine-tested at a local server by replaying Brian's own worked
example from A.13 verbatim — Right then Down from the start reaches
Quadrant 2 exactly as specced ("1 below, 1 right, 1 behind"), Left
then Down reaches home instead — plus the centre-crossing refusal, the
boundary refusal, all four Enter outcomes, and a full stop/restart
cycle, all confirmed with zero console errors. Not yet heard by Brian.
This is lab work, same as Round 33's L.5c — it doesn't touch SPEC.md's
numbered build order or unblock the standing "Brian flies everything
since 3.24" checkpoint.

**SPEC 3.52 written, explicitly NOT built (Brian, 2026-09-06)**: a
further tractor-beam pass — a fourth tier with its own distinct
recording (tiers 2/3/4 taking `tractor_beam7/8/9`, Sonnet's own read of
"the last 3 numbered as the last 3 tiers," flagged as unconfirmed),
reaction mass as a real per-second cost that falls as tier rises while
range climbs (with the explicit design goal that a skilled pull should
cost less RCS than flying the same distance manually), the pull's own
stop distance moving to 250 (a new `CFG.tractorStopDist`, decoupled
from the extractor's own 300 `vacRange`), and a laser/tractor exclusion
that runs two different ways — B refuses while a laser burst is firing
(the same lockout shields already use), but firing a laser while the
tractor is active just cuts the tractor off rather than refusing the
shot. Full detail in SPEC.md 3.52. Brian's own words: "don't do this
yet, but add it to do" — this is queued after the standing "Brian
flies everything since 3.24" checkpoint, not built.

**Round 37 (Fable, docs only, 2026-09-06)**: Brian switched to Fable
to evaluate 3.52 and `ideas13.txt`. **3.52's verdict**: direction
right, but the reaction-mass cost as drafted (a flat per-second draw)
inverts Brian's own goal — at the draft numbers a tier-1 core pull
costs ~19 rcs against ~3–6 to fly the same distance, and lower tiers
become strictly dominated, which would leave 3.44's Shift+B with no
reason to exist. Fable proposes charging for WORK (rock mass ×
distance × tier efficiency) with a checkable target (a core from 500
at tier 1 costs at most half of flying), and a gentle-pull rule to
give the step-down a job; plus: the lost-target threshold must scale
with per-tier range, 250 is a 50-unit drift margin over the
extractor's 300 (fine), and the laser exclusion should cover E/V too
(any beam start cuts the tractor). Build held until the cost-shape
question is answered. **ideas13.txt**: two notes are already built
in 3.49 (the pass chime; hit/missed + rank) and just not flown yet;
two are small new items — **3.53** (a course accuracy readout,
"average off centre," from the `lateral` the code already computes)
and **3.54** (Escort and Defend as mission-menu drills — no station, so
no favor and no cooldown, credits kept, Enter replays — slotted
BEFORE the playtest checkpoint since it exists to let Brian reach
those missions); two are cube direction written into A.13 — waypoints
as controllable outposts that decay without held corners at both
ends, and manhattan-distance jumps (one hydrogen unit per cell)
reconciled with the three-gates-per-corner model as "gate = which way
you leave, map = how far" (Brian's "5 warp corner to corner" matches
no pair — 2/4/6 — likely cells counted, not jumps; asked); the last
opens an encounters list (distress-call tow, derelict salvage, claim
dispute, convoy, the pre-Silence recorder, the gate waking), Fable's
pick the tow. `backstory.md` ("The Silence") arrived alongside — read,
not reviewed; offered as A.15. Nine questions in Part C. Nothing
built.

**Round 38 (Sonnet, docs only, 2026-09-06)**: Brian answered all nine
of Round 37's questions in one message and said to apply them and keep
going. **3.52 rewritten to DECIDED**: work-based reaction-mass cost
confirmed ("ok" — a tier-1 core pull over its full 250-unit stop
distance now costs ~1.0 rcs, well under half of flying it); the
gentle-pull rule and Shift+B both dropped entirely rather than kept —
Brian: "forget using Shift B to go down a tractor beam level, it will
be upgradeable but not switcheable," so 3.52 no longer carries a
selected-tier concept at all, only an owned ceiling (`tractorLevel()`)
used directly; the beam exclusion confirmed and generalized to any
`startBeam` call, not lasers alone; the four recordings confirmed by
ear. **3.53 and 3.54 flipped from proposed to DECIDED, ready to
build** — nothing changed in their shape, Brian just said "ok" and
"yes." **Waypoint control postponed** ("postpone" — folded into A.13
as open, not blocking); **manhattan-distance jumps confirmed** ("you
are right" — folded into A.13, superseding the one-fare-per-edge
model, not yet built since it lands with quadrant 2's own gate work).
The course's approach-cue question resolved to "the existing pass
chime is enough" and the stats question to "no second board" — both
already matched what 3.49/3.53 specced, so no spec change beyond
closing the question. **3.55 written up**: the distress-call tow,
Fable's pick, confirmed ("do your recommendation") — deliberately
reuses existing verbs (tractor to close distance, unchanged from 3.52;
E to "recover" the derelict, the same idea as extracting an ore core)
rather than inventing a new tow-follows-the-ship physics model, which
would have meant teaching the tractor to trail a moving puller — a
bigger change than one mission should force. Whether it carries any
threat at all is left open on purpose, flagged rather than decided,
with a lean toward none for v1. `backstory.md` stays unfolded per
Brian's own "ignore the backstory file for now." All nine of Round
37's Part C questions are now resolved (recorded as **ANSWERED** in
place of **DECIDE**) and the ideas13.txt review section's own bullets
carry the individual resolutions. Docs only — no code touched. Next:
build in order, per "apply these and continue on the spec" — **3.54**
(Escort/Defend drills on the mission menu) → **3.53** (course accuracy
readout) → **3.52** (the tractor beam second pass, as now finalized).

**Round 39 (Sonnet, 2026-09-06): built 3.54, 3.53, and 3.52, in that
order, per Round 38's own build order.** **3.54**: two new
`MENU_ITEMS`, Escort drill and Defend drill, each calling a new
`startMissionDrill(kind)` — the same mission-spec shape
`startMissionRun` builds for a station-offered mission, minus the
station-specific setup (no `hailMenu.poi`, no `sectorHome` snapshot,
`poiName: null`). `missionEnd`'s favor bump/loss and `clearMission`'s
abandon-penalty all gained an `if (mission.poiName)` guard — without
it, `gainFavor`/`loseFavor`'s existing truthy-object check would have
silently written favor to a bogus port keyed by the literal string
"null". The Enter-after-a-win handler now branches on `poiName`: a
drill replays (calls `startMissionDrill` again), a station-offered
mission still refuses exactly as before. **3.53**: `updateCourse`
already computed each crossing's own perpendicular distance from the
gate's axis (`lateral`) and threw it away — now pushed into
`courseState.offsets[]` every gate, clean or missed, and the final line
adds "average N off centre" (mean of all eight), stored as `avgOffset`
on the `courseRuns` entry and spoken by the Run log too. Skipped the
optional "best gate" line Brian's own spec flagged as "if wanted" — not
asked for directly, easy to add later. **3.52**: the biggest of the
three — `TRACTOR_TIERS` grew from three tiers to four, each with its
own core/medium/large/huge pull rate, range, reaction-mass cost
multiplier, and recording (`tractor_beam`/`_2`/`_3`/`_4`, three new
`audio_assets.js` manifest keys pointing at `tractor_beam7/8/9.mp3`,
confirmed already on disk); Shift+B, `tractorTier` (the old "selected"
concept), `tractorSwitch`, and every function built only to support
switching between tiers (`tractorTierDown`, `stopTractorSwitch`,
`tractorSwitchLeft`) are gone outright — owned tier IS the active tier
now, and Shift+B falls through harmlessly to plain B's own case (same
`lname`, lowercased, either way). Reaction-mass cost is now work-based
(`rockMass(t) × distance closed × 0.004 × tier.costMul`, spent via the
existing `spendRcs()`) rather than a flat per-second draw, fixing the
inverted economics Fable's Round 37 evaluation found. `CFG.tractorStopDist`
(250) replaces `vacRange` (300) as the pull's own stop distance;
`vacRange` itself is untouched everywhere else. The beam/tractor
exclusion is now mutual and covers every beam tool: `startBeam(tool)`
cuts an active tractor silently the instant it commits to firing
(laser, extractor, or vacuum, not lasers alone), and engaging B while
any of those is running refuses with "Beam in progress, N seconds.
Tractor after." A fourth `tractor_4` module joined `MODULES`. Every
call site referencing the retired flat `CFG.tractorRange`/
`CFG.tractorPullCore` or the selected-tier concept — the F12 explore
text, F1 help, the F2 ship-screen heading, the `poke`/`state` test
hooks, `clearMission` — was found via a full-file grep and updated;
README.md's own key-list entry for B was updated too. All three items
machine-tested at a local server via `__sim.step()`/`poke()` rather
than hand-flying (real, checkable numbers beat "it sounded right"):
the escort drill's win path measured credits 100→400 and confirmed the
drill-specific "Enter plays again" line, then confirmed replaying
fresh, then confirmed abandoning mid-run doesn't crash; the flight
course's average-off-centre measured exactly 81 (matching a hand
calculation from seven 50-unit offsets and one deliberate 300-unit
miss) and confirmed round-tripping through both the live announcement
and the saved Run log; the tractor's tier-1 core pull measured exactly
1 rcs spent over its full 500→250 pull (the ~1.0 target hit exactly,
not just asserted), the range refusal read the tier's own 500 by name,
firing a laser cut an active tractor silently, engaging the tractor
while a laser burst was running refused by name, and Shift+B was
confirmed falling through to plain B twice (once refusing correctly on
a non-rock selection, once engaging normally). Zero console errors
throughout any of the three items. Every tractor number is still a
placeholder for Brian's ear — this pass was about the mechanics (cost
shape, stop distance, per-tier range, the mutual exclusion, no
switching), not the tuning. Nothing from this round has been heard or
flown by Brian yet. Next per the build order: **3.55** (the
distress-call tow — not yet built, still just specced) is next in
line, but per the standing rule nothing past what Brian has explicitly
asked for should be started without further word from him — the
quadrant-2 items (3.18/3.14/3.22/3.11/etc.) stay off-limits until he's
flown everything since 3.24, including this round.

**Round 40 (Fable, 2026-09-07): Brian ear-tested Rounds 28–39 ("no
problems so far") — the standing playtest checkpoint is PASSED. Next
stage: encounters.** `ideas14.txt` (untracked) plus chat became SPEC.md's
new **Phase 3E — the encounters** block (right after 3.55): **3.56** the
Encounters submenu (DONE this round), **3.57** Shift+S auto-reverse
(DONE this round), then in order **3.58** enemy facing cone + cannon →
**3.59** turret defense (3 zones, then a numpad 3×3) → **3.60** the haul
(Brian's force-balanced tow — his tow picture was the OLD 2.1 tether,
not 3.55; both kept) → **3.55** the distress tow → **3.61** minefield →
**3.62** the shadow → **3.63** nebula transit (the staged pulsar/
space_loop audio's job) → **3.64** the gate run. Audio for each lands
later as lettered sub-items (3.60a etc.) as Brian records it — never a
blocker. Part C carries three open questions from ideas14 (is 3.39's
Press-Enter repeat actually silent for him on Pages?; the non-numpad
3×3 map; whether the 3-zone turret survives the 3×3). 3.56/3.57 were
machine-tested at a local server (sublist open/browse/wrap/letter-jump/
Tab/Left-and-Escape-close/remembered cursor/select-and-start, Escape
inside the sublist over a live mission closing the sublist first and a
second Escape resuming; Shift+S on/status/flip-to-forward/off and a
plain S cancelling reverse), zero console errors. **Testing gotcha
found here**: the boot handler's own `menuAnnounce()` fires on a delay
after the Start click and resets `menuSub` — a test that opens the
sublist within ~1 s of booting sees it silently closed. Wait longer
after boot. Brian paused here so Sonnet builds the rest, starting at
3.58.

**Round 41 (Sonnet, 2026-09-07): built SPEC 3.58** (the facing cone and
the cannon — see SPEC.md's own DONE paragraph for the full shape).
`t.facing`, `updateFacing()`, `facingConeAngle()`/`coneMulFor()`, the
cannon's own `startEnemyCannon`/`enemyCannonVoice`, and a new shared
`SIM.audio.setOrientation()` (replacing the gate's old inline
orientation branch too) are all in `index.html`/`audio_engine.js`.
Machine-tested at a local server (Veteran-difficulty facing convergence
measured over real geometry, a live cannon threat's damage matching
CFG exactly, the untouched laser/shield path re-confirmed alongside
it), zero console errors. Two permanent test hooks added:
`poke({enemyFacingDeg, enemyName})` and `poke({enemyPos})` — the latter
is a no-op against the Cruiser specifically, since its `orbit` field
overwrites `t.pos` every frame regardless (a testing wrinkle, not a
gameplay one). Next per SPEC.md's Phase 3E order: 3.59 (turret
defense, 3-zone then numpad 3×3), then 3.60/3.55/3.61-3.64.

**Round 42 (Sonnet, 2026-09-07): built SPEC 3.59, the 3-zone turret
defense** (see SPEC.md's own DONE paragraph for the full shape). A new
`mode: 'turret'` skips `simTick`'s flight/thrust/collision block
outright — the ship never moves; `turretState` (its own module-level
var, NOT `targets`) holds three zones each with a laser cooldown, a
shield, and at most one incoming; `turretKey()` is a single early
intercept in `onKeyDown` claiming Left/Right/Space/F/G/I and refusing
everything else, while F1/F2/F3/F12/Escape/X/Enter/Y fall through
untouched to the generic switch every other mode already shares.
Machine-tested at a local server (zone switching, every refusal, a
shielded vs. unshielded impact differing by exactly `CFG.turretHullDmg`,
a missile clearing a zone still on laser cooldown, a full drill run
lost to hull erosion with no player action routing to the standard
non-tug retry, Enter/X both confirmed), zero console errors. 3.59b (the
numpad 3×3) is deliberately NOT built — the spec frames it as a later
pass to compare against the 3-zone version by ear, not a prerequisite.
Next per SPEC.md's Phase 3E order: 3.60 (the haul, Brian's own
force-balanced tow — needs 3.57, already built), then 3.55/3.61-3.64.

**Round 43 (Fable, 2026-09-07): the landing page was silent — fixed —
and the turret's second pass specced.** Brian loaded Pages, pressed
Ctrl to silence NVDA, and never heard "Press Enter to begin" again; Down
arrow before Enter was silent too. Root cause and fix are in the 3.39
bullet under Accessibility architecture (the live region was inside the
hidden container; `onKeyDown` bailed on `!running`). Confirmed at a
local server via `read_page`: the live region is in the accessibility
tree with the begin line BEFORE Enter, and a synthetic Down and Ctrl
each re-speak it; Enter still boots to the menu; zero console errors.
Then Brian's turret notes from playing 3.59 ("got most of the objects,
hull hit maybe once" — too easy, and points aren't enough) became
**SPEC 3.65**, DECIDED, next to build, ahead of 3.60 and 3.59b: a
sweet-spot score (max at `turretSweetFrac` 0.45 of the approach,
falling either way), time-to-impact shrinking to `turretRampFloor` 0.6×
over the drill (the tone rise IS the speed — gentle for now, Brian's
words), a second incoming kind `'volley'` (a noise sweep, not a tone)
that only a raised zone shield answers, shields confirmed instant as
built, a streak shield (5 clears → all zones up 6 s), and a spoken then
browsable debrief — score, accuracy, timing early/late, best streak,
volleys caught, missiles used, weakest zone — with a `turretRuns` board
(`PROFILE_VERSION` → 9). The six debrief measures are Fable's proposal
for "more than points"; Brian has said he doesn't know how to measure
this, so they're his to cut. Docs only beyond the landing fix. Next:
Sonnet builds 3.65.

**Round 44 (Fable, 2026-09-08): the game is "The Silence", and the menu
has music.** Brian named it; the page title, the header comment, the
`#game` aria-label, the h1, `BEGIN_LINE`, README's title, the sound
lab's title/subtitle/"Back to The Silence" links, and every file's
header comment now say so — the repo name, the Pages URL, and the
`hss_profile` localStorage key deliberately keep the working name (a
rename there would orphan every tester's save). And his own track,
`audio/music/celestial/fingerprints_of_God.mp3` (stereo 48k, 219 s,
5.3 MB with embedded cover art, served as placed — NOT re-encoded), is
manifest key `menu_celestial`, excluded from `AUDIO_PRELOAD` (a
`menu_` prefix in the regex), looped on the music bus at
`CFG.menuMusicVol` 0.3 by `startMenuMusic()` from the begin gesture's
menu branch and from `exitToMenu()`; `clearMission()`'s existing
`stopMusic` already ends it on every mission start, and the docked
interior loop crossfades over it via `playMusic`'s own prev-node fade.
The Escape overlay over a live mission does NOT start it — the ship's
own sound stays. Confirmed at a local server: `musicNode.src.loop` true
and the buffer 219 s stereo, gone once Combat training starts, back
after X; zero console errors. `audio/music/` staged explicitly.

**Round 45 (Sonnet, 2026-09-08): built SPEC 3.65, the turret's second
pass** (see SPEC.md's own DONE paragraph for the full shape): a
sweet-spot score on every clear (`turretClearScore`), a pressure ramp
shrinking the approach time across the drill (`turretRampFactor`), a
second incoming kind (`'volley'`, a noise sweep only a shield can
catch), a streak that snaps every zone's shield up for 6 s at 5 in a
row, and a browsable debrief (`turretDebrief`/`openTurretDebrief`) with
score/accuracy/timing/streak/volleys/missiles/weakest-zone, backed by a
new `profile.turretRuns` board (`PROFILE_VERSION` → 9). One real bug
found and fixed in testing: the loss path's debrief-opening `setTimeout`
had no reference to which turret run it belonged to, so retrying or
leaving before it fired crashed on a null (or stale) `turretState` —
fixed by closing over the exact state object and checking it's still
current. Machine-tested at a local server (exact sweet-spot/floor
scores, volley refusal and shield-catch, the streak trigger and its
restore, both debrief paths, the run log's persisted fields), zero
console errors. Testing note worth keeping: the drill's background
spawn/impact loop runs in real time between tool round-trips with no
pause, so any test needing a clean sequence has to stay inside one
script execution — splitting it across calls lets unmanaged zones
accumulate real hits mid-test. Next per SPEC.md's Phase 3E order: 3.60
(the haul), then 3.55/3.61-3.64, then 3.59b.

**Round 46 (Sonnet, 2026-09-08): built SPEC 3.60, the haul** (see
SPEC.md's own DONE paragraph for the full shape and both bugs found):
`haul` (module-level, the `demo`/`contract`/`mission` pattern) layers
onto `mode: 'mining'`; `updateTractor()` gained one dispatch line to
`updateHaulTow()` when a `haulable` rock is latched, tow'd behind the
ship via a spring-damper toward an ideal trailing point, with strain as
three independent explicit gains (speed, turn rate, an outright rule
for reversing) rather than inferred from lag — the first design DID
infer it from lag using the tractor's own pull-rate numbers as an
accel budget, and snapped under ordinary gentle flight the first time
it was actually flown; rebuilt. **A second, more serious bug**: the
ordinary mining rock-drift code measures "has this rock drifted out of
the cloud" from the world ORIGIN and silently WINS the encounter once
a rock passes that radius — the haul's whole premise (towing a rock
far from spawn) triggered this within ~20 seconds of real flight,
producing a bogus instant win nowhere near home. Fixed with `!t.haulable`
on that check plus a `haul` guard in `checkMiningEnd()`. Both bugs were
found only by actually flying the mechanic end to end with a computed
real bearing to the (randomized) home beacon, not by inspecting the
code — worth remembering for 3.61-3.64, which will move things through
world-relative space the same way. Machine-tested at a local server,
entirely within single unbroken script executions (the turret round's
own testing lesson applies here too — this drill's physics run in real
time between tool round-trips): a full clean haul completed under par
with strain at 0 throughout; holding S snapped the line in exactly 1
second; a sharp turn alone also snapped it; Enter/X both correctly
rebuild/clear `haul`. Zero console errors. One flagged simplification:
the haul rock is 'medium', not 'huge' as Brian's own picture describes
— tier 1 (today's default fit) can't move large/huge at all. Next per
SPEC.md's Phase 3E order: 3.55 (the distress tow), then 3.61-3.64, then
3.59b.

**Round 47 (Fable, docs only, 2026-09-08)**: Brian's `ideas15.txt`
(untracked, like every ideas file; `todo.txt` beside it is just his
saved copy of Sonnet's Round 45/46 summaries) reviewed and written into
SPEC.md Phase 3E as **3.66–3.69**, to build in the order 3.67 → 3.66 →
3.68 → 3.69, ahead of the encounters already queued (3.55, 3.61–3.64,
3.59b): **3.67** the deep space ambient bed (`audio/quadrant/deep_space/
deep_space_10r.mp3`, untracked until Sonnet wires it — stage it
explicitly — manifest key `space_ambient`, preloaded, the music slot
under EVERY mode so docking's interior crossfades over it and undock
brings it back); **3.66** Z (idle since 3.44) cycles the ship's systems
one line a press, skipping WHOLE health categories but never counts and
never hull, with a "Hull 100. All systems whole." line when nothing
else would speak — plus field repairs that stop at an 80 cap, −10 per
repeat knockout, floor 50, cleared by docking (`shipSystems` grows a
`cap`); **3.68** blink on **Ctrl+arrows** (Left/Right sidestep, Up
forward, Down back), facing and velocity kept, 300 units, 4 rcs, 3 s
cooldown, stops at a station's hull radius, no auto-retarget (Shift+T
does that) — **Brian asked for Ctrl+W/S: Ctrl+W closes the browser tab,
unpreventable, and is already in `isBrowserKey`'s escape hatch, so
forward/back moved to Ctrl+Up/Down**; **3.69** the capital ship as an
encounter: turrets are ordinary hostile targets riding a moving parent
(a `parent` follow in `stepCombatShips`), a shield "door" per turret
that opens 4 s before it fires and closes 2 s after — the door IS the
telegraph — a new `lockToneKind` 'shielded' (solid + slow tremolo) as
the reticle, 3.35's `capital` explosion pool on the kill. Six questions
in Part C. Nothing built. Next: Sonnet builds 3.67.
**Round 47, continued**: Brian decided blink is **Ctrl+Shift + the
normal movement keys** (arrows ×4, W, S) with no distance known yet.
Written into 3.68: Ctrl+Shift+Left/Right sidestep, Ctrl+Shift+Up/Down
world-vertical, Ctrl+Shift+S back, and **forward on Ctrl+Shift+A**
because Ctrl+Shift+W closes the browser window (reserved everywhere,
unpreventable, already passed through by `isBrowserKey`) — flagged in
Part C for him to swap. `blinkDist` is a 300 placeholder, live via
`poke({blinkDist})`, and the blink line speaks it so he can try
numbers. Sonnet: the Ctrl+Shift chord check goes in `onKeyDown` BEFORE
the existing Shift-chord block, or Ctrl+Shift+S reads as auto-reverse.
Next: Sonnet builds 3.67 → 3.66 → 3.68 → 3.69.
**Round 47, third pass**: blink keys settled — **Shift+arrows**
(Left/Right sidestep, Up/Down world-vertical) and **Shift+Page Up/Page
Down** (forward/back). No Ctrl, no W/S, no reserved chords; Ctrl+Shift+A
is gone. Sonnet: the check goes BEFORE the HELD branch (a Shift+arrow is
otherwise a held turn) and ignores `e.repeat`. 3.68 and Part C updated.

**Round 48 (Sonnet, 2026-09-08): built SPEC 3.67 and 3.66.** 3.67 (the
deep space ambient bed): one manifest key (`space_ambient`, IN
`AUDIO_PRELOAD`), `startSpaceAmbient()` called at the tail of
`newGame()` (every mode reaches it there) and from `undock()`; docking's
existing `station_interior1` crossfade and `exitToMenu()`'s existing
menu music both needed zero changes, since `playMusic`'s own prev-node
fade already generalizes. Confirmed via real gameplay (a real dock at
Station Meridian, not a shortcut): menu track → combat/turret's 20s
loop → the 111s interior loop on docking → the 20s loop again on
undock. 3.66 (Z status cycle + field repair caps): `Z_STATUS_SLOTS`
(9-stop fixed order) + `zStatusSkip()`/`zStatusKey()`; a parallel
`systemCaps` map (not folded into `shipSystems`) with a shared
`registerKnockout()` used by both the real knockout path and the
`poke({knockout})` test hook, so tests exercise the real cap math.
`updateRepairCrew()` gained `fieldFixableSystemIds()` (broken AND below
its own cap) as its actual target pool — a capped system stays reported
as broken (F2/I/Z) but stops being repaired, and the per-tick `amount`
is now clamped to what the cap allows, fixing a real risk: the old code
would have kept billing reaction mass at the full rate for a system
that could no longer progress. One documentation note: the spec's own
earlier prose ("three knockouts... at 50") doesn't match the Test
section's precise sequence (80→70→60→50, four knockouts to reach the
floor) — built to the Test section's numbers, the more precise source.
Machine-tested at a local server in live gameplay (a real knockout, a
real second knockout, a real crew repair with shields raised to keep
the measurement clean of the drill's own ongoing combat, a real
mission restart clearing caps), zero console errors both rounds. Next
per SPEC.md's Phase 3E order: 3.68 (blink on Shift+arrows/Shift+Page
Up/Down), then 3.69 (the capital ship).

**Round 49 (Sonnet, 2026-09-08): built SPEC 3.68, blink.** Shift+arrows
(sidestep/world-vertical) and Shift+Page Up/Down (forward/back) — the
chord check sits in `onKeyDown` right before the existing Shift+W/S/T/
Tab/R block, mirroring its tug/mission/over() guards. `blinkKey()`/
`blinkOffset()` live near `updateCollisions()`, reusing its exact
clamp-to-the-hull-radius geometry for stations/planets. No explicit
docked/warping/menuOpen handling needed (the chord sits far enough down
onKeyDown that those states already returned earlier) and turret's own
Left/Right zone-switch claims a Shift+arrow before blink ever sees it
— confirmed live, not assumed. Only the course needed an explicit
refusal. `blinkDist` is genuinely live via `poke({blinkDist})` since
Brian has no real number yet. Machine-tested at a local server with
forced yaw/pitch/velocity so the trig was checkable exactly (a 40°
sidestep landed at the precise predicted point, velocity and facing
both completely unchanged); the hull-radius clamp needed a rebuilt test
after an early attempt blinked THROUGH a station rather than INTO its
radius (a real testing miss, not a code gap — a blink only checks
where it lands, matching the spec). Zero console errors. Next per
SPEC.md's Phase 3E order: 3.69, the capital ship — the biggest item on
the ideas15 list.

**Round 50 (Sonnet, 2026-09-09): built SPEC 3.69, the capital ship.**
A moving parent (`capital`, never a `target`) rides through `newGame()`'s
own 4th param (`startCapitalRun`) and carries four ordinary `!t.kind`
turrets at rotating offsets — `stepCombatShips` needed exactly one new
branch (sync a turret's `pos` from its parent's live `pos`/`facing`
before anything else runs) for the ENTIRE rest of the combat stack
(lock, Tab, the beam, missiles, SPEC 3.58's own facing-cone-and-cannon)
to apply completely unchanged. Each turret's shield door is a small
state machine (`capitalDoor`, checked in `updateEnemies` ahead of
`threat` itself) wrapping the EXISTING laser/cannon dispatch rather
than reimplementing it; `doorUp` is the one shared flag `damageTarget`'s
two call sites, `lockToneKind()` (new 'shielded' kind, a tremolo-LFO
variant of the solid tone), and `bearingText` all read. **Two real
bugs found and fixed**: a missing initial `.pos` on a fresh turret
crashed `state()`'s own facing-cone readout before the first
`stepCombatShips` frame ever ran (fixed by computing the initial
position at creation time); and `capitalOrbitRadius` 350 (copied from
the existing Cruiser's own orbit) put a turret's own offset (~280) on
top of it, routinely placing turrets past both weapon ranges (600) from
the ship's default spawn — dropped to 200. Machine-tested at a local
server in genuine gameplay: all four turrets at correct, spaced
positions; a real burst against a closed door left hp completely
untouched across a 5-tick burst; forcing a door open and firing landed
the laser's own real per-tick damage; **all four turrets killed in one
continuous run**, using a technique worth keeping for any future
moving-target encounter — since the beam's own tick lands on a real
`setTimeout` about a second apart, and a turret's parent re-aims at
15°/s (much faster than its 3°/s orbital drift), the test re-poked the
ship's own yaw/pitch toward the turret's LIVE position every 200ms
through the whole burst, the same continuous correction a real
player's tracking would provide; the fourth kill triggered the correct
"Last turret down. The capital ship breaks apart." with `won: true`;
Enter rebuilt a fresh encounter, X cleared it. A stale console error
persisting across `navigate()` reloads on a reused tab was confirmed
NOT real via a genuinely fresh tab (matches this project's own
previously-documented same-tab-reload gotcha). Missile fire against a
turret wasn't exercised this round (its own lock timing didn't
cooperate with the same aim-forcing technique) — flagged as a coverage
gap, not a known risk, since the missile-impact `doorUp` guard is
code-identical in shape to the laser path's. Zero console errors
throughout. Every number (orbit rate, turn rate, spacing, turret hp,
door timing) is a placeholder for Brian's ear; the metal-door recording
itself waits on 3.69a. This closes Phase 3E's ideas15.txt batch — next
per SPEC.md's build order is **3.55** (the distress-call tow), unless
Brian wants to fly/hear what's shipped since 3.24 first.

**Round 51 (Sonnet, 2026-09-09): built SPEC 3.55, the distress-call tow.**
The player is the tug this time — a disabled derelict, tractored in and
recovered with E (reused, the same idea as extracting an ore core), then
flown home for a flat credit reward. See SPEC.md's own DONE paragraph
for the full shape and both real findings from testing. Two deliberate
departures from the letter of the spec, both flagged there in detail:
(1) a new dedicated `distress` module-level var (the `demo`/`contract`/
`haul`/`capital` pattern) rather than folding into `mission` as the
spec's own wording suggested — `mission.friendly` is read unconditionally
in roughly a dozen places, none of which a friendly-less distress
mission could satisfy without a distress-shaped exception at every one;
`distress` reaches the same "poiName stamped, clearMission's generic
favorFail fires for free" outcome by modeling on `contract`'s own shape
instead (surviving `clearMission()` once recovered, the same way
`contract` survives leaving the open quadrant). (2) the spec's own text
said the derelict should be "excluded from Tab like every other
friendly" — but the mechanic needs it selectable to tractor and recover,
so `selectNearest()`/`cycleTarget()`'s 2.17-era friendly-exclusion now
carries one flagged exception (`tractorable`), narrow enough that every
OTHER friendly (escort/defend, the haul's home beacon) stays excluded
exactly as before. The derelict itself is deliberately rock-SHAPED (a
medium-size field on an otherwise `kind: 'friendly'` target) so the
existing `TRACTOR_TIERS`/`rockMass` math applies to it completely
unchanged — only two `t.kind !== 'rock'` guards (`tractorKey`,
`updateTractor`) needed a one-line exception. **One real bug found in
testing**: `updateTractor()` unconditionally reads `t.vel` for damping
— every rock gets one from `spawnRock`, but the derelict's first draft
had none, crashing the instant the tractor engaged; fixed with an
explicit `vel: v3(0,0,0)`. Machine-tested at a local server through the
complete real flow three times (no mocks): a full accept → tractor →
recover → leave → dock success (credits 100→300, Meridian favor 40→56,
the tractor's own medium pull rate measured exactly 4/s over stepped
simulated time); a full accept → abandon-without-recovering failure
(favor 56→46, matching `CFG.favorFail` exactly, `distress` correctly
nulled); and the "already open" refusal at a SECOND station's own
Missions list while a recovered-but-undocked call was still pending.
Zero console errors, reconfirmed on a genuinely fresh tab after the
vel-bug fix. Not exercised: dying (rather than leaving) before recovery
— reasoned through as routing to the same `clearMission()` favorFail
guard via the SPEC 2.16 tug with zero distress-specific code, matching
escort/defend's own already-confirmed tug interaction, but not
separately driven this round. This closes SPEC.md's Phase 3E build
order through 3.55 — next up is 3.61 (the minefield), unless Brian wants
to fly/hear what's shipped first.

**Round 52 (Sonnet, 2026-09-09): built SPEC 3.61, the minefield.**
Nothing to shoot — pure listening and throttle control. A new mode,
`'minefield'`, reached from the Encounters list (a menu drill, no
station, matching the flight course/turret drill precedent). Mines are
a new `kind: 'mine'`, voiced by the EXISTING `buildRockVoice()` (a real
rock asset — "reuses rock voices" taken literally, no new audio
machinery) but deliberately excluded from `selectNearest()`/
`cycleTarget()` (a one-line exception, same shape as 2.17's friendly-
exclusion and 3.55's tractorable one) — each mine's own passive
proximity tick carries its bearing, not a lock; the one real (`kind:
'poi'`) target is the exit beacon. `updateMinefield(dt)` does drift,
the distance-gated tick timer (a `mineTickFastMs`/`SlowMs`
interpolation, silent past `mineTickRange`), and the detonation check
in one pass per mine — the check itself is the same shape
`updateCollisions` already uses (a trigger radius plus a speed
ceiling), reused as a PATTERN rather than a shared function, since a
mine's consequence (one `hullHit`, no reposition) differs enough from
a station's stop-and-reposition. Reaching the exit beacon records the
run on a new fifth best-10 board (`profile.minefieldRuns`,
`PROFILE_VERSION` → 10, the usual unconditional-backfill migration
line). Weapons/shields/auto-target/blink are all refused here, same as
the flight course — letting the pilot gadget past a mine cluster would
skip the whole lesson. Machine-tested at a local server entirely
through real `__sim.step()` time and `poke({pos, vel})` placement (no
mocks): the roster, the Tab-exclusion, every refusal, a real detonation
at 40 u/s measured at exactly `CFG.mineHullDmg` (20) with the mine
marked dead, an identical approach at 10 u/s (under the safe-speed
ceiling) confirmed completely harmless at the SAME 50-unit distance,
fifty further stepped frames near live mines exercising the tick timer
with zero errors, a real finish writing a `profile.minefieldRuns`
entry, Enter rebuilding a fresh field, X returning to the menu, and
F1's help confirmed carrying a "Minefield" heading in the right order.
Zero console errors throughout, reconfirmed on a fresh tab. Every
number is a placeholder for Brian's ear. Not yet heard or flown by
Brian. This closes SPEC 3.61 — next per the build order is 3.62 (the
shadow), unless Brian wants to fly/hear what's shipped first.

**Round 53 (Sonnet, 2026-09-09): built SPEC 3.62, the shadow.** Trains
tracking — tail one ship (`kind: 'shadow'`, a new kind, deliberately
selectable unlike an escort/defend friendly) that flies the escort
friendly's own straight-line motion code and alternates lit/dark legs
at random, ramping its own engine gain to match. 3.27's "an offline
sensor can't hold a lock" rule now also fires whenever the SELECTED
target's own `t.dark` is true (`updateTargeting`/`tickBeat` each
gained one `|| t.dark`, scoped to that target rather than the real
`shipSystems.sensor`, which would wrongly show broken in F2/I). One
flagged design call: contact time accrues by RANGE ALONE, never gated
on lock — reading the spec's own Test bullet as gating accrual on lock
too would doubly punish a dark leg (losing the tick AND the score for
something unobservable), which cuts against "training tracking"
rewarding good dead reckoning. **A real, pre-existing bug found while
testing this item, affecting 3.61 too**: the generic Enter-retry
handler only had explicit branches for `course`/`turret` — `minefield`
(shipped last round) and this round's `shadow` both fell through to
the generic `else`, speaking `combatIntro()`'s "Five targets
detected..." after a win instead of their own intro, even though
`newGame()` itself already rebuilt the right roster. Missed in 3.61's
own testing because the very next lock announcement overwrote the
wrong line in the same aria-live div before it was checked — SPEC
2.15's own rule working against the TEST this time. Both modes now
have their own explicit branch; the fix was verified against BOTH.
Machine-tested at a local server entirely through real `__sim.step()`
time: the lit/dark cycle firing at configured random intervals with
`locked` dropping the instant dark and never auto-reacquiring once lit
(the target's own continued motion drifts the bearing — the intended
challenge, confirmed not a stuck flag); holding position via repeated
`warpToSelected` for 95 seconds accrued exactly the needed 90 and
finished correctly with a real `profile.shadowRuns` entry; Enter
rebuilt fresh and spoke the right intro (both modes); X returned to
the menu; F1 confirmed "The shadow" heading in order among 14 headings.
Zero console errors, reconfirmed on a fresh tab. Every number is a
placeholder for Brian's ear. Not yet heard or flown by Brian. This
closes SPEC 3.62 — next per the build order is 3.63 (nebula transit),
unless Brian wants to fly/hear what's shipped first.

**Round 54 (Sonnet, 2026-09-09): built SPEC 3.63, nebula transit.** The
staged pulsar/space_loop recordings finally get a job. A new mode,
`'nebula'`, reached from the Encounters list. Two `kind: 'poi'` targets,
both wired through the existing `beaconAsset` mechanism (SPEC 3.31): a
motionless Pulsar (`nebula_pulsar`, pulsar1.mp3 — a placeholder pick)
just past the cloud's far edge, and a separate Exit Gate that starts at
the same point but drifts away via a small random-walk velocity (the
same shape a mine's drift already uses) — Tab-ing the pulsar always
gives a reliable bearing while the real exit wanders nearby, matching
"pulsar stable, everything else drifts" literally as two targets, one
that never moves and one that does. `insideNebula()` is checked
alongside the EXISTING `systemState('sensor')` checks in `zoneRad()`/
`tickBeat()` — the same scoped-override pattern 3.62's `t.dark` check
established, reused a second time now that two independent things can
degrade tracking. Hull ablates directly (not via `hullHit()`, which
would have spammed a cue and a full line every frame) only while
inside, with 50/25% alert lines. New manifest keys `nebula_pulsar`/
`nebula_cloud`; the cloud bed crossfades over `startSpaceAmbient()`'s
own bed via `playMusic`'s existing prev-node fade, no new plumbing
needed. **A real interaction found in testing, left as designed rather
than fixed**: the existing repair crew (3.27/3.36) automatically fights
the ablation the instant hull drops below its own field cap, spending
reaction mass to claw some of it back and occasionally speaking its
own line — since that call and this drill's own alert both call
`say()` in the same `simTick`, whichever runs later can silently
overwrite the other in the shared aria-live div (SPEC 2.15's own rule,
this time between two systems never designed with each other in mind).
Not fixed — the underlying state stays correct regardless of which
line gets heard, the same reasoning Round 28 gave for an identical
still-unfixed collision elsewhere; flagged for Brian's ear as either a
fun tension or an unwanted subsidy, which only playing it will answer.
Machine-tested at a local server entirely through real `__sim.step()`
time (a genuine testing lesson: an early hull-drop reading came out
wildly inflated from the double-advance gotcha this project has hit
before — a tight sequence of real-time `await`s let the tab's own
visible `requestAnimationFrame` loop advance the sim on top of manual
steps; a tight, no-await re-run gave the exact correct per-second
rate): the halved lock angles confirmed exactly on crossing the cloud
boundary and restored on leaving, with the REAL sensor state staying
`'ok'` throughout; a forced hull-to-2 test confirmed `shipDestroyed`
firing correctly with a clean Enter-retry; reaching the drifting exit
confirmed a real finish and a genuine `profile.nebulaRuns` entry; F1
confirmed a "Nebula transit" heading in the right position among 15
headings. Zero console errors, reconfirmed on a fresh tab. Deliberately
not built: the danger variants (Brian's own nebula-description
prompts), explicitly specced as later lettered sub-items. Every number
is a placeholder for Brian's ear. Not yet heard or flown by Brian. This
closes SPEC 3.63 — next per the build order is 3.64 (the gate run),
unless Brian wants to fly/hear what's shipped first.

**Round 55 (Sonnet, 2026-09-09): built SPEC 3.64, the gate run —
completing Phase 3E in full.** A new mode, `'gaterun'`, reached from
the Encounters list. One `poiType: 'gate'` target, reusing the EXISTING
sweep (`updateTargeting`'s own `t.gatePhase` advance, built for SPEC
3.31's audio cone) with zero new sweep code — the only new code is the
RULE: H is intercepted (`gateRunKey()`) and computes the signed angle
between the beam's live phase and the ship's own bearing from the
gate, using the exact same sin/cos convention the sweep's own
orientation write already uses. Inside `CFG.gateRunBeamHalfAngle`
(15°, tighter than the audio cone's own 60° "loud" cone) passes;
outside it, refuses and names the wait until the beam swings back
around. **One real bug found and fixed**: the first draft's H-
intercept had no `over()` guard — every other action key in `onKeyDown`
wraps its handler in `if (!over())`, and this one was missed — so
pressing H again after already winning ran the check again and pushed
a duplicate entry onto `profile.gateRunRuns` every extra press. Fixed
to match the established convention. A genuine testing confusion along
the way: after the fix, a follow-up test kept seeing the SAME "Through
the gate..." text on every subsequent press and looked like the bug
persisting — it wasn't; a no-op key press leaves the aria-live div
showing whatever it last said. Confirmed the real fix by planting a
distinct marker string in the div before an H press and watching it
survive untouched, with the run count also unchanged — the decisive
test, not "the words look the same." Machine-tested at a local server
entirely through real `__sim.step()` time: the "too far" refusal by
name, a wrong-time H counting down cleanly second by second as the
beam swept toward the ship, a correctly-timed H finishing the run with
a real `profile.gateRunRuns` entry and personal-best comparison, Enter
rebuilding fresh and speaking the intro immediately, X returning to
the menu, F1 confirming a "The gate run" heading in the right position
among 16 headings. Zero console errors, reconfirmed on a fresh tab.
This closes Phase 3E's own build order in full (3.56 through 3.64, all
DONE) — deliberately not built alongside it: 3.59b (the numpad 3×3
turret variant, specced from the start as a later comparison pass,
never a prerequisite). Every number is a placeholder for Brian's ear.
Not yet heard or flown by Brian. Next per the build order: either 3.59b
or 3.42 (escort in formation — still waiting on Brian having actually
flown auto-target), then quadrant 2 as ordered — nothing past what
Brian has explicitly asked for should be started without further word
from him, per the standing rule.

**Round 56 (Fable, docs only, 2026-09-09)**: Brian's `ideas16.txt`
(untracked, like every ideas file) — five notes from playing Rounds
45–55 — reviewed and written into SPEC.md as **3.70–3.74**, verdicts
and eight questions in Part C ("DECIDE (open, from ideas16.txt)").
**3.70** the debrief everywhere: the turret's own browsable debrief
(3.65) becomes the shared shell for every encounter's end, win or
loss, each current one-line blurb split into lines; the "repeat the
exit/replay options at 10 s and 20 s" is 3.39's Press-Enter pattern
reused as an IDLE timer — reset by any key, or it would talk over the
pilot reading (the SPEC 2.15 collision from a real timer). **3.71**
scoring: the table Brian asked for is in the item — 16 rows, today's
board vs. Fable's proposed headline (time for most, ore for mining,
friendly hull for escort/defend, reaction mass for the haul, score
for the turret) vs. what's kept beside it; the shadow gets contact
efficiency / times lost / longest hold; one `BOARDS` table +
`profile.boards[kind]` replaces eight copies of the same bookkeeping
(with a migration folding the existing arrays in intact); the Run
log regrouped by encounter with headings and a letter jump (F2's
shape). Boards wait on Brian's column picks. **3.72** turret third
pass: no score spoken in play (cues and the streak line stay), the
incoming tone's hardcoded 0.22 becomes `turretIncomingVol` doubled,
the deep-space bed ducks under the drill, and Fable's reading of
"remove incoming missiles or projectiles" is the volley (3.65's own
shield-only noise) — question 1 if it's the player's F or the shots
instead. **3.73** the shadow: louder (`shadowGain`), and — the
push-back — it must actually THRUST for a thruster sound to mean
anything (today it flies one speed in a straight line): each lit leg
opens with a burst, each dark leg coasts; Brian's recording is 3.73a,
the ship's own thruster positioned and pitched down stands in.
**3.74** the star: Brian is right that "The Star" is a beacon and
nothing else; built as an encounter (C enters the corona — tools stay
cold in open space), an inverse-square pull the stabilizer already
damps, V as the hydrogen scoop (creating `profile.resources.hydrogen`
ahead of 3.18's containers), and capture-by-radius handing off to the
existing tug — his "battery just holds you, frozen, then a tow" falls
out of `rcsBatteryFactor` with no new state. Fable's recommendation:
3.74 opens the quadrant-2 track (before 3.18/3.22), because the gate
fare is hydrogen and a miner who won't fight has no other source in
quadrant 1. Order: 3.70 → 3.72 → 3.73 → 3.71 → 3.74. Nothing built.
**Round 56, continued (Fable, docs only)**: Brian answered all eight
ideas16 questions in one message — the volley goes (not the player's
F missiles); the scoring table stands with one change, **Mining gets
a 7-minute clock** (`miningDrillS` 420, ore at the clock is the
headline); **no reminder timer at all** — the Enter/X hint is the
LAST LINE of every debrief, reached by Down or End (3.70 rewritten:
"remove the nag message"); sector missions get no board, debrief
only; best-10 per board for now; **the corona hurts** (`starHeatDist`
400 / `starHeatPerS` 2, the nebula's own ablation, with the richest
scoop deliberately inside the heat radius — added to 3.74); the
corona's numbers as proposed; order confirmed 3.70 → 3.72 → 3.73 →
3.71 → 3.74, then 3.18 → 3.14 → 3.22. Part C's DECIDE block is now
ANSWERED. Nothing open from ideas16. Next: Sonnet builds 3.70.
**Round 56, third pass (Fable, docs only)**: Brian's thruster
recordings landed — `audio/ships/thrusters/`, nine files in three
sets of 10/7/4 s (untracked; Sonnet stages the folder explicitly) —
and 3.73 was rewritten around them: the thrust IS the lit leg
(`shadowThrustTiers` [10, 7, 4] s by Rookie/Veteran/Ace — Fable's
reading of "as the difficulty grows", flagged; a within-run ramp is
the alternative), the recording (set one: `shadow_thruster_10/7/4`,
preloaded) plays positioned for the leg and is FADED at the tier's
length, dead air is a coast on the old velocity with a random 45–135°
yaw turn so the next thrust heads somewhere new, `shadowGain` 1.5
("raised 50%"). 3.73a and the pilot's-own-jet stand-in are withdrawn.
**Measured, not assumed**: the file names lie — only `_9_4s` is 4 s;
the other "7s"/"4s" files are 10 s with ~1.5 s trailing silence,
the "10s" files 10.5–11.9 s — harmless under the fade rule, flagged
for Brian to re-export if he wants. Next: Sonnet builds 3.70.

**Round 57 (Sonnet, 2026-09-09): built SPEC 3.70, the shared debrief.**
See SPEC.md's own DONE paragraph for the full shape — in brief: one
module-level `debrief` object and a pair of shared functions
(`openDebrief`/`debriefKey`) replace SPEC 3.65's turret-only
`turretDebrief`/`openTurretDebrief`/`turretDebriefKey`, dispatched from
ONE check in `onKeyDown` (right before the existing turret-mode
intercept, which itself just returns `false` once the shared check has
already had first refusal) rather than one per mode — every existing
encounter finish became a debrief instead of a plain `say()`, its own
blurb split into one-fact lines with the Enter/X hint always the LAST
line (never a separate reminder, per Brian's own "remove the nag
message" from Round 56). **Loss debriefs are new, not just carried
over**: SPEC 3.65 only ever built the turret's; a generic
`openLossDebrief(source, deathMode, deathRef)` now covers every
standalone drill's own death the same way, guarded against a stale
timer the same way 3.65 guarded the turret's (by whichever per-mode
state object exists, or a plain `lost` check where none does) — a tug
death still never debriefs, SPEC 2.16's own countdown stays that
state's own voice. Machine-tested at a local server via real menu
navigation and key dispatch, never mocked: the flight course's full win
debrief and every shell mechanic (arrows, Home/End, Y, Escape, Enter-
retry, X-leave); the turret's own debrief confirmed byte-for-byte
unchanged through the new shared shell; the minefield's win and a real
detonation loss (found by coordinate-descending the ship's position
onto a live mine using only the scalar distances `state()` already
exposes — no mine positions are exposed, worth remembering for next
time); the plain Combat drill's win (salvage/rcs `extra` correctly
leading the headline) and loss via `poke({kill:true})`; the Escort
drill's success and the Defend drill's failure; nebula's own ablation
death. Zero console errors throughout. **Flagged as a real coverage
gap, not silently assumed**: the capital ship's win/loss (its turrets'
shield doors never opened within a practical test window against the
same aim-forcing technique that worked for ordinary combat) and the
win side of shadow, nebula, gate run, haul, and mining — all five call
the identical `openDebrief` shape already proven six times over, so
this rests on that shared code path plus direct review, not a further
live run of each. Also deliberately NOT built, flagged rather than
skipped: the distress call and the delivery run/timed contract's own
eventual completion — all three keep the ship flying afterward rather
than freezing on `over()`, which is the one thing this whole mechanism
assumes. Not yet heard by Brian. Next per the build order: 3.72
(turret third pass).

**Round 57, continued (Sonnet, 2026-09-09): built SPEC 3.72, the
turret's third pass.** `CFG.turretVolleyChance` 0.3 → 0 (the mechanism —
`turretVolleyPoints`/`volleyCaught`/`volleyLanded`, `turretImpact`'s own
shield-only branch — stays wired, just unreachable, "one number away");
`turretIntro()` and F1's own Turret defense section both dropped their
mention of the retired second incoming kind, since the old wording
would now describe something that can no longer happen. The per-clear
line lost its "plus N" (`turretKey`'s "Right cleared." / "Right cleared
by missile. 2 left.", matching the spec's own examples exactly);
`turretImpact`'s shield-catches-a-volley line lost its "plus N" too.
Score arithmetic itself is completely untouched — only what gets spoken
mid-drill changed; the clear/explosion cues and the streak line stay.
`turretDebriefLines()` dropped its own "Volleys: N caught, M landed."
line (would read zero on every run now). `buildIncomingVoice`'s
hardcoded `0.22` became `CFG.turretIncomingVol` (0.45); `startSpaceAmbient()`
— the one call site SPEC 3.67 already put at the tail of every
`newGame()` — now scales the deep-space bed by `CFG.turretAmbientDuck`
(0.5) whenever `mode` is already `'turret'` by the time it runs, so the
bed starts ducked rather than dropping a beat later; leaving turret for
anything else calls the same function again at the plain volume, which
is the restore — no separate un-duck step anywhere. `README.md`'s own
Turret defense section got the same two fixes. Machine-tested at a
local server via real menu navigation and key dispatch: the music
node's own gain measured exactly at the expected duck the instant the
drill started; a real cleared incoming spoke exactly "Right cleared."
with the running score confirmed climbing behind it, unspoken, and read
back correctly on `I`; a 300-sample sweep across two spawn cycles never
produced a `'volley'` kind; the resulting loss debrief (through 3.70's
shared shell) confirmed the Volleys line gone, everything else intact.
Zero console errors. Not yet heard by Brian. Next per the build order:
3.73 (the shadow thrusts).

**Round 57, continued (Sonnet, 2026-09-09): built SPEC 3.73, the
shadow thrusts.** See SPEC.md's own DONE paragraph for the full shape.
In brief: `shadowSpeed`/`shadowLitMinS`/`MaxS` are retired outright,
replaced by a real physics model — the shadow target gained `facing`
(yaw) and a genuine `vel` vector; a **thrust** leg (length =
`CFG.shadowThrustTiers[tierIdx]`, 10/7/4 by Rookie/Veteran/Ace)
accelerates velocity toward `shadowThrustSpeed` along the current
facing while the tier's own recording plays through the shadow's
EXISTING engine panner (so it's positioned with zero extra tracking
code); a **dark** leg decays speed toward `shadowCoastSpeed` with the
DIRECTION frozen, while facing alone rotates at a constant rate toward
a fresh random 45–135° turn, timed to land exactly at the leg's own
end — the coast follows the OLD direction, the surprise lands with the
NEXT thrust. The recording fades via a real `setTimeout` (Web Audio's
clock, not the simulated one) at the tier length minus
`shadowThrustFadeS`, then hard-stops; `stopVoice()` now cancels those
timers too, so a retry/leave never leaves one to fire later. `state()`
gained a `shadow` block — none of this was testable before. Machine-
tested at a local server mostly in REAL time (this encounter's audio
and physics genuinely interact, so real time was the more honest test
than `__sim.step()`): the engine gain measured exactly 0.375
(`shadowGain × targetGain`) at a fresh thrust; a thrust leg measured
`phaseLen: 10` at Rookie and handed off to a dark leg measured
`phaseLen: 7.3`; speed at two points in that dark leg matched
`110 − shadowCoastDecel × elapsed` exactly; facing advanced at a
constant rate across five samples; the ship's own movement direction
(from consecutive position deltas) measured IDENTICAL at both ends of
that dark leg even as facing rotated 13.5° in between — direct proof
the coast ignores the turning nose; the following thrust's own facing
differed from the one before it by 78.4°, inside the specified range.
All three manifest keys confirmed decoded, zero console errors. Not
yet heard by Brian. Next per the build order: 3.71 (scoring).

**Round 57, continued (Sonnet, 2026-09-09): built SPEC 3.71, scoring.**
See SPEC.md's own DONE paragraph for the full shape — in brief: one
`BOARDS` table (rank/dir/line-per-kind) plus a generic
`recordRun(kind, entry)` replace eight separate record functions;
`profile.boards[kind]` replaces eight top-level arrays via a v13→v14
migration; the real count is **fourteen boards**, not the spec's own
"twelve" (flagged, not silently fixed). New clocks/counters landed
alongside: Mining's own 7-minute drill clock with spoken marks
(`miningState`, gated so only the standalone drill ever sees it);
Combat training's own clock plus a real laser-accuracy counter (one
burst committed, one burst landed — never per-tick); the shadow's
three own metrics (contact efficiency, times lost, longest hold, off a
sticky in-range flag); the haul's time/parted; the capital ship's
time/shots-refused; escort/defend's shared kill counter
(`mission.cleared`), with defend's "time to last wave" needing no new
field at all. The Run log is rebuilt on F2's own heading/letter-jump
shape — every board gets a heading even empty ("No runs yet."), a
repeated letter cycles boards that share one. **A real, load-bearing
bug found in testing, caught before it could touch Brian's own
save**: the migration's first draft could never actually copy an old
board's data — `defaultProfile()` now pre-seeds all fourteen boards as
empty arrays, so a guard meant to protect an already-migrated board
from being overwritten was always true, permanently blocking the copy
instead. Caught by seeding a real v13 save with actual entries in three
boards and watching them vanish after boot; fixed by keying the copy
on the OLD array actually having entries, with the unconditional
`delete` of the old field doing the real idempotency work. Re-verified
against the same seeded save (all three boards intact, a fresh course
win correctly reading "New personal best by 42 seconds" against the
migrated time), the Run log's duplicate-letter cycling (Minefield →
Mining → Minefield) and Home/Shift+H/End, the mining drill's clock-out
finish, and the escort drill's board recording the exact run flown.
Zero console errors throughout. Not independently live-tested: the
spoken 60-/10-second mining marks specifically, and several boards'
own recording beyond direct code review (flagged, not assumed). Not
yet heard by Brian. Next per the build order: 3.74 (the star) —
closing Phase 3E's ideas16.txt batch in full.

**Round 57, continued (Sonnet, 2026-09-09): built SPEC 3.74, the
star — closing Phase 3E's ideas16.txt batch in full.** `callPoi`'s own
`'star'` branch (which only ever said "Nothing answers" before this)
now enters an encounter: `sectorHome` snapshot, `newGame('mining', ...,
true)` via a new `startCorona` sixth parameter (same shape haul/
capital/distress already use), so any loss correctly routes through
the ordinary sector-campaign tug with zero special-casing. Gravity
(`starPullAccel`, inverse-square, capped) pulls the ship toward the
origin; the pull is spoken as a percent of the pilot's OWN current
effective thrust (mass, battery, and a half-broken thrust system all
folded in, the same three factors `simTick`'s own W already reads).
`starGravityDist`/`starPull`/`starCaptureDist` are deliberately
constructed so the pull equals 100% of nominal full thrust exactly at
the capture radius — "the pull exceeds full thrust" there is literally
true by the numbers, not just descriptive. Heat reuses the nebula's
own direct hull-ablation shape (3.63); both ways of losing the ship —
capture or hull-to-zero — go through the ordinary `shipDestroyed()`,
which is already tug-routed since `sectorHome` is set. V gained a
`corona` branch in both `startDustVac` and `dustTick` (checked before
the ordinary debris-field logic, which would otherwise misfire
"cloud cleared"), scooping real hydrogen into `profile.resources.
hydrogen` — F3's own hydrogen line, hardcoded to "0. Not collectible
yet" since SPEC 2.15, finally reads something real. E refuses by
name. Machine-tested at a local server via real `__sim.step()`
sequences from a genuine Sector entry: a single step at the pull's own
reference distance measured the exact accel expected; a full inward
sweep logged the heat-entry line and both the 50% and 75% pull alerts
at their predicted crossing points, with hull loss matching the heat
rate almost exactly; capture triggered precisely at its own radius,
correctly dispatching the tug; V at the richest harvest point measured
the exact predicted per-tick gain, accumulating for real and reading
back correctly on F3; E and X both confirmed. One same-tick collision
flagged, not fixed (SPEC 2.15's own known shape): since capture and
the "Pull at 100 percent" alert are constructed to cross at the exact
same distance, the alert never actually gets heard — capture's own
line always wins the shared aria-live div first. Zero console errors.
Every number is a placeholder for Brian's ear. Not yet heard or flown
by him. This closes Phase 3E's ideas16.txt batch in full (3.70 through
3.74). Next per the build order: the quadrant-2 track (3.18 → 3.14 →
3.22), unless Brian wants to fly or hear what's shipped first — the
standing rule.

**Round 58 (Fable, docs only, 2026-09-09)**: Brian's `ideas17.txt` (five
notes from flying Rounds 52–57; fourteen new tracks in
`audio/music/celestial/` are the music note — the file has no music
line, which briefly confused the review) written into SPEC.md as
**3.75–3.80**: **3.75** the minefield second pass (beacons in any
order, 3/4/5 by tier; the 70 ms mine blip becomes a continuous voice —
the turret's incoming voice reused through the mine's own panner —
rising in gain, pitch, and pulse with proximity); **3.76** the shadow
third pass — **the finding: `shadowThrustSpeed` 110 exceeds the pilot's
`maxSpeed` 100**, so "could not get back to it" was arithmetic; thrust
80, gain 2.5, a random opening heading with a full first leg, and blink
forward already exists (3.68); **3.77** reaction mass as the economy
(shields 5, missiles 3, decoys 2, auto-target 6, all refused on
battery; `rcs_tank_1/2` to 150/200; a `runBudget('combat')` balance
target); **3.78** nebula transit **REMOVED** (Brian: it tested nothing —
"just thrusted right towards the beacon"; the star carries the sensor
idea, radioactive clouds are later direction); **3.79** the gate run
**REMOVED** with the sweep, gates now **locked** and opened by their
own rule (the first on Known favor + 30 hydrogen), a vortex loop as the
voice at a 3000 audible range; **3.80** music — KC's `kc_bgm.js`
reviewed (styles, grab-bag shuffle, 2 s crossfade, saved choice) and
copied in shape as `SIM.music`, streamed through `<audio>` into the
music bus rather than decoded, `[` play/stop, `]` next, Shift+`]`
previous, read from `e.code`. Build order 3.78 → 3.79 → 3.76 → 3.75 →
3.77 → 3.80, then quadrant 2. Seven defaults flagged in Part C for
Brian to overrule. Nothing built. Next: Sonnet builds 3.78.
**Round 58, continued**: Brian wants **music built first** (3.80 now
heads the ideas17 order), renamed the fifteen MP3s himself to lowercase
stems (`cryoVault_elegy`'s capital V and `echos_` are his — keep them)
and said not to rename further, and confirmed **every new track
announces its title**, key press or auto-advance alike — all written
into 3.80. ideas16.txt/ideas17.txt/todo.txt are no longer in the
working tree. Next: Sonnet builds 3.80, then 3.78 → 3.79 → 3.76 → 3.75
→ 3.77.

**Round 59 (Sonnet, 2026-09-09): built SPEC 3.80, the background music
player — completed first, per Brian's own request.** `SIM.music`, a
new namespace in `audio_engine.js` beside `SIM.audio`, is KC's own
`kc_bgm.js` shape (reviewed in full) copied deliberately: a
`MUSIC_STYLES` table of named playlists and a `MUSIC_TITLES` table of
spoken names (`audio_assets.js`, one style today — Celestial, fifteen
tracks, keyed by the files' own stems exactly as Brian placed and
named them, never renamed), a grab-bag shuffle so every track plays
once before any repeat, and a 2-second crossfade on every track
change. The one deliberate departure from KC: KC moves two `<audio>`
elements' own `.volume` property directly; this player routes each
element through a `MediaElementAudioSourceNode` into its own
`GainNode` and from there into the EXISTING `SIM.audio.musicBus` (the
same bus the deep-space bed and the docked interior already share),
so the Sound menu's Music level, the mute switch, and the turret's own
duck all apply for free — streamed, not decoded, since fifteen ~5 MB
tracks fully decoded would be hundreds of megabytes of RAM. **History
+ cursor, not a pure one-way bag**: `order` is every track actually
played this session, `cursor` points at the current one — advancing
past the end of `order` draws a new track from the shuffled `bag`;
advancing back into `order` (after a `previous()`) just replays what
was already drawn. This is what gives Shift+`]` real memory rather
than a shuffle with no way back — Sonnet's own design addition, since
the spec's own text asked for "next song, previous song" without
specifying how "previous" should behave against a shuffle. Keys `[`
(play/stop), `]` (next), Shift+`]` (previous) are read from `e.code`
(`BracketLeft`/`BracketRight` + `shiftKey`), never `e.key` — the same
trap SPEC 3.24 fixed for Shift+digits, since a real Shift+`]` sends
`}`. All three are checked in `onKeyDown` right after the `describeMode`
branch and before every overlay's own capture (help, map, run log, F2,
F3, the Sound menu, docked, hailing, the mission menu, warping,
debrief, turret) — the same reach Y has (SPEC 3.51) — so F12 explore
mode still describes them safely instead of acting on them.
`profile.music = { on, style, idx }` (`PROFILE_VERSION` → 15, a plain
backfill for a save with no such field at all — nothing before this
round ever exposed a way to set it); `idx` is which track in the
style's own list was last playing, so a reload resumes that exact
track rather than reshuffling. `profile.sound.music`'s own generic
backfill (SPEC 3.45's per-category default) is special-cased to
`medium` (index 3) instead of `full` for a field that's missing
entirely — "the field was never set" and "this pilot never touched it"
are the same thing here, since no UI ever exposed a way to change it
before now. Round 44's menu-only `startMenuMusic()` (and both its call
sites, `exitToMenu()` and the begin-gesture handler) is retired
outright — the player is just another place the pilot plays, wherever
they left it, menu included, over the bed and the docked interior, not
instead of them. The Sound menu's Music line no longer cycles a level
directly with left/right; Enter or Right opens a new **Music submenu**
(`musicMenu`, `openMusicMenu`/`musicMenuKey`) — Play/Stop, Next,
Previous, Style (one entry today, ready for more), and Volume, the
last using the same five `SOUND_LEVELS` steps — matching Brian's own
"volume controls via menu... could be in sounds." Volume lives only
there, never on a key. `onTrackStart` (set once by index.html) is the
single point that speaks a track's title and persists `profile.music`
— it fires on every real track change, key press or the last track
ending alike, exactly per spec; the one place that needed care was
`musicToggleKey`'s own "Music on. [title]." line, which needs the
SAME title folded into ONE `say()` rather than let `onTrackStart` speak
it a second time in the same tick (the SPEC 2.15 rule) — solved with a
one-shot `SIM.music._silent` flag the toggle sets just before calling
`start()`. Machine-tested at a local server end to end, entirely
through real gameplay (no mocks): a fresh profile booted with music on
at medium, resuming isn't random (`idx` defaults to 0, so a brand new
pilot always opens on the same first track — harmless, not spec'd
either way); `]`/Shift+`]` advancing and retreating with the bag
confirmed NOT drawing on a replayed `previous()` (14 remaining both
times) but drawing fresh on a genuinely new `next()`; the toggle's
combined "Music on. [title]." with no double-announce; a reload
resuming the exact saved track; the Sound menu's Music row and the new
submenu's all five rows browsing and the volume row scaling
`musicBus.gain` correctly (measured 0.65 at medium, 1.0 at full);
F12 explore mode describing `[`/`]`/Shift+`]` (arriving as `}`) without
touching playback; music surviving a live Combat training mission
start, a bracket press mid-combat, and leaving the mission via X; a
seeded pre-3.80 (v14) profile migrating cleanly — its `sound.world`/
`cockpit`/`effects` preserved exactly, `sound.music` correctly
backfilled to medium, `profile.music` created and started playing with
no crash. Zero console errors throughout. Every level and the
crossfade/track-volume numbers are placeholders for Brian's ear; the
default-on-at-medium call and the fifteen tracks' shuffle order are
not. Not yet heard by Brian. Next per the ideas17.txt build order:
3.78 (yank the nebula encounter) → 3.79 (lock the gates) → 3.76 (the
shadow third pass) → 3.75 (the minefield second pass) → 3.77 (reaction
mass as the economy), then quadrant 2.

**Round 60 (Sonnet, 2026-09-09): built SPEC 3.78, yanking the nebula
transit encounter outright** — Brian: "I just thrusted right towards
the beacon and it was over," and Fable's own review agreed it never
tested what it was built to. A pure removal, done by grep-sweeping
every `nebula`/`Nebula` reference in `index.html` rather than trusting
the spec's own "out" list alone, which turned out slightly incomplete:
a handful of mode-exclusion arrays (`updateTargeting`'s sensor-half
check, `statusReport`'s "which modes skip the standard missiles/
decoys line" guard, the auto-target-fitted announcement gate) each
still carried a dead `mode !== 'nebula'` term that the spec's own text
never called out individually. Gone: the `'nebula'` mode itself,
`insideNebula`/`makeNebulaRoster`/`nebulaIntro`/`finishNebula`/
`updateNebula`, the `nebulaState` var and every one of its five call
sites (Enter-retry, the roster dispatch in both `newGame()` and
`startMission()`, `clearMission`'s reset line, the per-frame
started-flag), the `shipDestroyed`/`openLossDebrief` death branch, the
Encounters item, the F1 help heading, README's own section, the CFG
block, and `audio_assets.js`'s two manifest keys (`nebula_pulsar`/
`nebula_cloud` — the recordings themselves stay on disk, unwired, for
whenever radioactive clouds come back per 3.78's own direction note).
The board comes out too: `nebula` dropped from `BOARD_ORDER`/`BOARDS`,
its old backfill line removed from the migration, and its entry
pulled from the `OLD_BOARD_FIELDS` map that used to fold a flat
`nebulaRuns` array into `boards.nebula` — replaced with two explicit
`delete` lines (`profile.nebulaRuns`, `profile.boards.nebula`) so
EITHER shape of old data (a genuinely old flat array, or an
already-migrated board with a real run recorded in it) gets dropped
outright on load rather than lingering forever as dead weight, per the
spec's own "nothing to keep." Machine-tested at a local server: a
fresh profile's Encounters list read exactly 11 with no nebula item
anywhere in a full forward browse; F1's help read 16 headings with
none named Nebula; `AUDIO_MANIFEST` confirmed missing both retired
keys; a seeded v14 save carrying a real `boards.nebula` entry (one
run, as if Brian's own session had been recorded) migrated to v15
clean with that key gone from `state().boards` and zero console
errors. Not yet heard by Brian — nothing to hear, by design; this was
pure removal. Next per the ideas17.txt build order: 3.79 (lock the
gates) → 3.76 (the shadow third pass) → 3.75 (the minefield second
pass) → 3.77 (reaction mass as the economy), then quadrant 2.

**Round 61 (Sonnet, 2026-09-09): built SPEC 3.79 — the gate run comes
out the way the nebula did, and locked gates go in its place.** Brian:
"I think we will do warp gates a little different. I think the gates
will be locked and when something is done to unlock them, the player
would approach and interact with the warp gate... we just need to make
them not be heard over a longer distance." Removal half:
`makeGateRunRoster`/`gateRunIntro`/`gateBearingDeg`/`gateBeamDiffDeg`/
`finishGateRun`/`gateRunKey`/`updateGateRun`, the `gateRunState` var and
every call site (Enter-retry, both roster dispatches, `clearMission`'s
reset line, the started-flag setter), the `'gaterun'` board (dropped
from `BOARD_ORDER`/`BOARDS`, its `OLD_BOARD_FIELDS` entry removed, and
an explicit `delete` added for either an old flat `gateRunRuns` or an
already-migrated `boards.gaterun` — 3.78's own "nothing to keep"
reasoning, reused), the Encounters item, the F1 heading, README's
section, and the CFG block. The sweep goes too: `t.gatePhase` (SPEC
3.31/L.9's own cone-driving phase, never written again), the panner
cone properties in `buildPoiVoice`, `gateSweepS`/`gateCone*` — the
lab's own L.9 lighthouse demo in `soundlab.html` is a completely
separate implementation and was never touched. **Locked gates, built
in its place**: the Jump Gate's `beaconAsset` becomes `vortex1`
instead of `space_station6` (one QUADRANT-row data edit — the spec's
own "gateVoice" field is, mechanically, exactly what `beaconAsset`
already does per-row for every other POI, so a parallel field name
would have been pure indirection with no functional gain, flagged as a
deliberate simplification); `vortex1` is carved out of the lab-only
`vortex[2-8]` `AUDIO_PRELOAD` exclusion, the same promotion SPEC 3.31
gave the station beacons; `beaconAudible()` gives `poiType: 'gate'` its
own tighter cutoff (`CFG.gateAudibleDist` 3000, against the shared
8000 every other beacon uses). `callPoi()`'s old "transit lane not
commissioned" placeholder is replaced by a real state machine:
`ensureGate(q, name)` (same lazy-create shape as `ensurePort`),
`GATE_RULES['Jump Gate']` (`anyStationKnownOrBetter()` plus
`CFG.gateHydrogenNeeded` 30 hydrogen aboard — only the first gate has a
rule written; "other gates' rules are written when their quadrants
are," per the spec's own text), and a new `gate_unlock` cue
(`audio_cues.js` — a falling chord into a rising sweep, Brian's own "a
long descending chord into the vortex's own rise") that fires exactly
once at the moment the rule is first met from within `CFG.gateCommRange`
(600). Two small test hooks: a new `poke({hydrogen})` alongside the
existing `poke({favor})`, and `state().gate` (pre-existing) swapped its
now-meaningless `phase` field for `unlocked` — found only by grepping
every remaining `gatePhase` reference, since a stale field that nothing
writes any more doesn't error, it just quietly stops meaning anything.
Machine-tested at a local server in real gameplay, not mocks: a real
Sector entry, Tab to the Jump Gate, `warpToSelected` to close the
distance, C reading the Locked line with its condition (a stray
double-period caught by actually reading the spoken text rather than
just checking for a crash, fixed at the source in `needsText()`);
`poke({favor, hydrogen})` then a real C unlocking it with "Jump Gate
unlocked." and the cue, and a second C reading "Jump Gate control:
open." with no repeat unlock; H at the gate refusing with the ordinary
warp-inhibit line, proving it's plain `startWarp()` again; a reload
confirming the unlock persisted in `profile.quadrants.home.gates`; the
Encounters list reading 10 and F1 reading 15 headings, both counts
computed off the live lists, not hardcoded. Zero console errors. Every
tunable number is a placeholder for Brian's ear; the vortex pick and
the rule itself are his own decisions, not placeholders. Not yet heard
by Brian. This closes both of ideas17.txt's removal items — next per
the build order: 3.76 (the shadow third pass) → 3.75 (the minefield
second pass) → 3.77 (reaction mass as the economy), then quadrant 2.

**Round 62 (Sonnet, 2026-09-09): built SPEC 3.76, the shadow's third
pass.** Brian: "the ship needs to be made louder... the amount of
thrust needs toned down as I lost the ship once and just could not get
back to it." **The finding**: `shadowThrustSpeed` was 110 against the
pilot's own `maxSpeed` of 100 — the target outran the pilot on every
single thrust leg, so losing it was arithmetic, not a flying mistake;
blink forward (3.68) already existed as the recovery and needed no
building, only surfacing. Four numbers: `shadowThrustSpeed` 110 → 80
(under the cap, so a straight chase always closes), `shadowGain` 1.5 →
2.5 (the engine loop only — Brian said the thrusters were already
right), and two new CFG constants — `shadowSpawnDist` (500, replacing
a hardcoded 400 literal in `makeShadowRoster()`) and
`shadowOpeningAvoidDeg` (30). **Gone from the start**: a new
`shadowOpeningFacingRad()` picks the shadow's opening facing from
whichever of two 120°-wide safe arcs remain once ±30° around BOTH
"straight toward the pilot" (0°, in `t.facing`'s own sin/cos
convention — the shadow spawns dead ahead of the pilot at
`-shadowSpawnDist`, so facing 0 flies directly at the pilot's own
position) and "straight away" (180°) are excluded — Brian's own
worry was a player who just holds W from the start; either axis would
have let that either meet the shadow head-on or never have to react
at all, so both needed excluding, not just one. **The first thrust
always runs the longest tier's length AND recording**: a new
`t.firstThrust` flag (set at roster build, cleared the instant the
first dark→thrust transition fires) makes that ONE transition use
tier index 0 instead of the live `tierIdx`; `shadowThrustKey()` and
`startShadowThrust()` both grew an optional tier-override parameter so
the PLAYED recording matches the forced 10-second duration — without
this half of the fix, an Ace-tier run would schedule a 10-second
thrust phase but play the 4-second recording, leaving several seconds
of dead air before the next transition. Machine-tested at a local
server in real gameplay (no mocks): opening facing sampled across six
fresh drills landed at 40°/63°/290°/304°/297°/252°, every one inside
a safe arc and none near 0° or 180°; speed measured ramping smoothly
to exactly 80 and holding, never higher; engine gain measured
converging to exactly 0.625 (`0.25 × 2.5`) and holding; spawn distance
measured at ~500; and, switched to Ace specifically, the first thrust
confirmed running the full 10 seconds before dropping to Ace's own 4
for the second. **A real testing-methodology snag along the way, not
a game bug**: a first attempt to verify the Ace-tier override split
the check across separate tool calls and looked like the override had
failed (the very first sample already read the Ace-tier 4-second
phase) — real wall-clock time between the separate calls had let the
run advance past the whole first 10-second leg and its following dark
leg before the check ever ran. Redone inside one unbroken script (this
project's own standing lesson, from the turret and haul rounds before
it — background sim state keeps advancing in real time between tool
round-trips), the override held for the full 10 seconds as designed.
Zero console errors. Every number is a placeholder for Brian's ear;
the two exclusion axes and the first-thrust rule are his own asks, not
placeholders. Not yet heard or flown by Brian. Next per the ideas17.txt
build order: 3.75 (the minefield second pass), then 3.77 (reaction
mass as the economy).

**Round 63 (Sonnet, 2026-09-09): built SPEC 3.75, the minefield's
second pass — mines that sing, and beacons to actually navigate to.**
Brian: "need to try a different mine sound to see if we can do better
with HRTF... make the player fly to some beacons within the minefield
such that they may not be able to fly directly to [them]." **The
voice**: `buildMineVoice(t)` replaces the old fixed 70ms `sfxTone`
blip (about the hardest thing there is to localize by ear) with a
continuous voice — the turret's own `buildIncomingVoice` shape (a
triangle tone through a pulsing gain LFO), built fresh through the
mine's own panner rather than reused wholesale, since a mine has no
`zone`/`height` to place it by the way an incoming projectile does.
`moveMineVoice(t, closeness)` drives gain, pitch, and pulse rate all
from one 0..1 fraction every frame (`setTargetAtTime`); `closeness
=== null` (past `mineTickRange`) ramps to true silence rather than
floor-and-hold, matching "silent beyond mineTickRange" literally. This
also let mines drop `buildRockVoice`/`ROCK_TYPES`/`ROCK_SIZES`
entirely — a mine was never actually a rock, that was just 3.61's own
convenient reuse, and the new voice has no use for a rock type.
**The beacons**: `mineBeaconCount` (`[3, 4, 5]` by TIERS index) real
`poiType: 'mineBeacon'` targets — Tab-able, unlike a mine — placed by
`placeMineBeacon()`, rejection sampling against `mineBeaconSpacing`
from the start AND from every beacon already placed (the same shape
`findSpawnPos` already uses elsewhere), each voiced by the flight
course's own detuned-tone branch in `buildPoiVoice` (`t.beaconIndex`
standing in for `t.gateIndex`). Reaching one kills it, stops its
voice, and speaks "Beacon N of M." (`course_pass`'s existing chime
reused for the pickup — a positive-pickup sound already in the
palette). The real exit beacon is unchanged in the roster, but
`updateTargeting`'s mute-scheduling line grew one more branch — mute
regardless of beacon mode until every beacon is taken — and
`updateMinefield`'s finish check carries the identical gate, so
reaching the exit early is now a genuine no-op, not just quiet about
it. The debrief and the `minefield` board both gained the beacon
count alongside detonations. Machine-tested at a local server in real
gameplay: a Rookie run built 7 mines, 3 beacons, and the exit with
zero errors; Tab-cycling to each beacon by name and `warpToSelected`
closing the gap produced "Beacon 1 of 3." through "3 of 3." in the
right order with each one confirmed dead afterward; reaching the exit
BEFORE any beacon was taken measured a real distance of 30 with `won`
staying false, proving the gate rather than just not crashing; all
three collected then finished the run with "3 beacons, 0 mines
detonated." and a matching board entry; the existing `poke
({selectByName})` test hook (from 3.69) let a specific mine be
targeted despite mines staying correctly excluded from Tab, confirming
a fast pass (speed 40, over `mineSafeSpeed` 25) cost exactly
`mineHullDmg` (20) hull while an identical slow pass (speed 10) left
both hull and the mine untouched; Ace tier confirmed exactly 5
beacons. Zero console errors throughout. Every number is a placeholder
for Brian's ear; the beacon-any-order rule and the continuous voice
are his own asks, not placeholders. Not yet heard or flown by Brian.
This closes every item in ideas17.txt except one — next: 3.77
(reaction mass as the economy), the last item before quadrant 2.
