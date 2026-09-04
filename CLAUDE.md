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
  below. Runs by double-click from file://. Needs `audio_assets.js`,
  `audio_engine.js`, `audio_cues.js` loaded before it, in that order.
- `audio_assets.js` — base64 mono-96k-MP3 sound bank (12 assets), loaded by a
  plain script tag (fetch is blocked on file://, script tags are not).
- `audio_engine.js` / `audio_cues.js` — see "Audio architecture" below.
- (There is no longer a single-file `space_sim_demo.html`: Brian dropped it
  on 2026-09-04 now that the Pages URL is the share link. Do not regenerate
  or restore it.)
- `README.md` — player-facing intro for the GitHub share (keys, delivery run).
- `audio/` — Brian's source recordings (never read at runtime, organized by
  category as of Round 12's housekeeping pass — `audio_assets.js` embeds by
  ASSET KEY, not by path, so none of these moves touch runtime code):
  `audio/mining/` = 3 asteroid loops + 3 asteroid explosions (all 6 already
  embedded in `audio_assets.js`); `audio/ships/` = 18 ship loops
  (interceptor ×6, corvette ×7, cruiser ×5; only 5 embedded so far) plus
  `audio/ships/warp/` = 18 warp recordings for SPEC 1.17 (`warp_start1-6`,
  `warp_finish1-6` at 4.0 s each, `warp_engaged1r-6r` loops at 1.5 s,
  all stereo 48 kHz; engine 1's three clips embedded, the other five
  stay on disk until a second drive exists — see "Sector" above);
  `audio/weapons/
  missiles/` = the one embedded missile-firing mp3, `audio/weapons/lasers/`
  = 16 laser candidates (Mining ×8, Rapid-pulse ×8; `mining1`/`mining2`
  embedded) plus 6 `laser_switch1-6.wav` switch clips (2.02–2.67 s, all
  six embedded as `laser_switch1-6` for SPEC 1.14 — the per-slot switch
  delay is timed off their lengths); `audio/Explosions/` = 8 new
  unintegrated hull-breach/explosion candidates. Everything under
  `audio/mining/` and `audio/weapons/missiles/` (the embedded ones) is
  already wired in by key name; everything else Brian is auditioning is
  NOT yet decoded into `audio_assets.js` or referenced anywhere (the six
  `laser_switch` clips, embedded for SPEC 1.14, and engine 1's three
  `warp_start1`/`warp_engaged1r`/`warp_finish1`, embedded for SPEC 1.17,
  are the exceptions) — leave the rest
  unconnected until told otherwise; see "Audio architecture" for how it
  eventually gets wired in. `audio/z.old/` (Backups/Media/peaks, REAPER
  scratch) is gitignored.
- `.claude/launch.json` — a static-file server config (`npx serve`, port
  8934) for `preview_start`, same convention as `ag`'s and `kc`'s own
  `.claude/launch.json`. Needed now that the game is split across four
  script files: a `file://` page (and this session's browser-preview tool,
  which renders local files as an opaque `data:` snapshot) can't resolve
  relative `<script src>` tags or read `localStorage`, so multi-file
  testing needs a real origin. Test at `http://localhost:8934` during
  development; `index.html` still works by double-click for a final
  check, and the Pages URL is the release reference (see Working
  agreements).
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
  asset-bank state, `audioStart`/`decodeAssets`/`assetsReady`, `ramp`,
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
- New recorded assets Brian is auditioning do NOT get manifest entries yet
  — they aren't decoded into `audio_assets.js`, so nothing here could even
  reference them. A future sound-lab tester auditions them via plain
  `<audio>`/`new Audio(path).play()`, completely outside this registry and
  outside the game, which is what "not connected yet" means in practice.

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
  Losing the ship fails the run; Enter restarts it from scratch.
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
  (11 − 4), the full-tank leg measures 11 s. Only engine 1's three clips are embedded
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
  0 = `lost` (Enter retries with a repaired hull). A missile survivor is
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
- **Weapons — lasers (Round 12, SPEC 1.9)**: six slots (`profile.slots`,
  `LASERS` data table), keys `1`-`6` select (`selectSlot` — as of SPEC 1.14 a switch to
  ANOTHER slot takes `SLOT_SWITCH[i].s` seconds, 1.4–3.2 by slot, Brian's
  per-slot clip mapping 3/4/5/1/2/6; the slot's `laser_switch` recording
  plays on the UI bus time-stretched via `playbackRate = clip length / s`
  to fill exactly that window, Space is refused meanwhile, `laserSwitch`
  holds the state and `stopLaserSwitch()` runs in `clearMission`;
  re-selecting the current slot just restates it, an empty slot refuses
  with no delay and cancels any switch in progress, a burst in progress
  refuses the switch), Space fires the
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
selected laser (fire-and-forget, cannot be stopped) · F missile · D chaff (spoofs the incoming missile, SPEC 1.8) · G shields
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
  The double-click `index.html` must still work standalone, but the URL
  is the reference.
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
dropped first if it slips. Nothing from ideas5 is built yet.

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
