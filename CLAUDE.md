# CLAUDE.md — Headless Space Sim

## What this is

Brian's audio-only ("headless" = no visuals) space sim, played entirely through
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
- (F2, the ship status screen, SPEC 2.13 — same browsable shell as the run
  log, listing hull/shields/warp/cargo/missiles/chaff, one line per laser
  slot with its family matchup in words, fitted modules, and total mass;
  works from any live mission or the mission menu.)
- `README.md` — player-facing intro for the GitHub share (keys, delivery run).
- `audio/` — Brian's recordings, organized by category as of Round 12's
  housekeeping pass. As of SPEC 2.19 these ARE the runtime assets
  (`AUDIO_MANIFEST` points at them by path), fetched over the wire, so
  every served file has to be committed and a move means a manifest edit
  — 2.19's own commit staged `audio/` explicitly (never `git add -A`,
  since two subfolders were untracked and `audio/missiles/` had pending
  deletions from Brian's reorganization). ~25 MB on disk:
  `audio/mining/` = 3 asteroid loops + 3 asteroid explosions, WAV masters
  with served MP3 siblings (all 6 in the manifest); `audio/ships/` = 18
  ship loops (interceptor ×6, corvette ×7, cruiser ×5; only 5 in the
  manifest so far — one per roster class) plus `audio/ships/warp/` = 18
  warp recordings for SPEC 1.17 (`warp_start1-6`, `warp_finish1-6` at
  4.0 s each, `warp_engaged1r-6r` loops at 1.5 s, all stereo 48 kHz;
  engine 1's three clips in the manifest, the other five stay on disk
  until a second drive exists — see "Sector" above); `audio/weapons/
  missiles/` = the one manifest missile-firing mp3, `audio/weapons/lasers/`
  = 16 lasers (Mining ×8, Rapid-pulse ×8, all 16 in the manifest as of
  SPEC 2.12) plus 6 `laser_switch1-6` switch clips (2.02–2.67 s, WAV
  masters with served MP3 siblings, all 6 in the manifest — the per-slot
  switch delay is timed off their original lengths); `audio/Explosions/`
  = 8 new unintegrated hull-breach/explosion candidates, no manifest key
  yet. `soundlab.html` is the up-to-date "what's connected" checker —
  trust it over this paragraph for the current count. `audio/z.old/`
  (Backups/Media/peaks, REAPER scratch) is gitignored.
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
- **Sector**: real flyable space, 4 POI audio beacons (Contested Zone war-drum
  throb / Asteroid Field Kappa rumble / Station Meridian blinking 660 tone /
  Planet Auren 45 Hz drone). Long-range beacon panners (ref 800, rolloff 1.2,
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
  (`profile.stations[name].influence`, `bumpInfluence(poi, amt)`): +2 on
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
- **Weapons — lasers (Round 12, SPEC 1.9)**: six slots (`profile.slots`,
  `LASERS` data table), keys `1`-`6`, Shift+1-6 select (`selectSlot(i, reverse)` — as of SPEC
  1.14 a switch to ANOTHER slot takes `SLOT_SWITCH[i].s` seconds, 1.4–3.2
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
- **Mining**: 3 rock types (Ice soft/splitty, Iron hard/chippy, Stone middle)
  × 4 sizes, HIDDEN per-stage hp rolls. Core ore 3000/6750/4500 (×1.5 as of
  Round 10); all dust ×0.75 via `CFG.debrisScale` in `addDebris`. Laser ticks
  shed dust; stage events split/chip/collapse-to-core; `E` extracts cores
  (range 300), `V` vacuums dust fields, cloud radius 800.
- `Q` from encounters: mining any time; combat only when zone cleared
  ("jammed by hostile fire"); drills never. Enter on the encounter map =
  depart (silent return + auto-warp).

## Key map (left-hand doctrine — right hand stays on arrows)

Arrows yaw/pitch · W thrust / S brake (Shift+W toggles
auto-thrust — `autoThrust` reads as a held W inside `simTick` via an
effective-keys object `k`; any W or S press, Shift+W, a warp jump,
docking, or `clearMission` ends it; the Shift chords are checked in
`onKeyDown` BEFORE the `HELD` branch, since Shift+W arrives as `lname`
'w') · 1-6 select laser slot (a switch takes 1.4–3.2 s by slot, SPEC 1.14) · Space fires
selected laser (fire-and-forget, cannot be stopped) · F missile · D decoy (spoofs the incoming missile, SPEC 1.8; "chaff" in the code, "decoy" to the player as of ideas6) · G shields
· Tab cycle targets (Shift+T / Shift+Tab cycle back) · T report selected
target (lock onset also speaks distance) · R range to target with
closing/opening (Shift+R = the radar sweep) · E extractor · V vacuum · Z
zone size · Q map · H warp · C call · B beacons on/off/target only · I
status (adds hull, missiles, laser slot, shields, laser heat, demo clock +
objective) · X leave · F1 help · F12 explore · Escape opens the mission
menu (SPEC 1.18 — see below; no separate pause any more). Menu: arrows +
Enter (first letters D/S/C/M/H jump, S cycles Sector then Sound; B
cycles beacons here too); Left/Right on the Difficulty line cycles
Rookie/Veteran/Ace in place.

## Accessibility architecture (non-negotiable)

- Shell ported from `C:\nbs\accessible_football`: role=application,
  Press-Enter-to-Begin gesture (AudioContext), focusin recapture, ONE
  capture-phase keydown, BROWSER_KEYS escape hatch (F5/F6/F11, Ctrl+R/F/W/T),
  lowercase single chars (Caps Lock = NVDA modifier), `keyName()` e.code
  fallback, "silence is a bug" (every key answers).
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

Next, per Brian (2026-09-04 evening): write the Phase 3 spec — the
moving world, SPEC.md's Part A.10 and 3.10–3.17 — in rounds of
questions to give the macro areas real definition before any of it is
built. Nothing in Phase 3 is scoped to per-round detail yet the way
Phase 2 was.

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
