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
  `audio/ships/warp/` = a warp-drama candidate recording; `audio/weapons/
  missiles/` = the one embedded missile-firing mp3, `audio/weapons/lasers/`
  = 16 new unintegrated laser candidates; `audio/Explosions/` = 8 new
  unintegrated hull-breach/explosion candidates. Everything under
  `audio/mining/` and `audio/weapons/missiles/` (the embedded ones) is
  already wired in by key name; everything else Brian is auditioning is
  NOT yet decoded into `audio_assets.js` or referenced anywhere — leave it
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
Difficulty / Run log.

**Profile persistence (Round 11, `hss_profile` in localStorage)**:
`loadProfile()` runs once at boot (before the menu ever shows), reading
`{ tier, credits, upgrades, chaff, runs }` — `credits`/`upgrades`/`chaff`
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
  the sim is live, warp included; pauses/help/map stop it). Order enforced:
  Field Kappa refuses mining rights until the Contested Zone is cleared;
  Station Meridian takes the delivery once ore ≥ `CFG.demoOreGoal` (15,000)
  and speaks the run time. Station always repairs hull + rearms missiles.
  Losing the ship fails the run; Enter restarts it from scratch.
- **Sector**: real flyable space, 4 POI audio beacons (Contested Zone war-drum
  throb / Asteroid Field Kappa rumble / Station Meridian blinking 660 tone /
  Planet Auren 45 Hz drone). Long-range beacon panners (ref 800, rolloff 1.2,
  gain ×2) + distance-haze lowpass in `updateTargeting`. `Q` map overlay,
  `H` hyperwarp (2 s charge, drops 600 out; interact range 500; refuses
  within `warpInhibitDist` 1500 of ANY point of interest via `nearbyPoi()`,
  not just the nav target — Brian: fly clear of a station before jumping
  anywhere, not just before jumping back to it), `C` call
  within 500 → combat/mining encounters (`sectorHome` snapshot; `X` returns
  to open space at the POI) or station (repair/rearm/delivery) / planet
  placeholder hail. Weapons/tools cold in open space. Ore, hull, and missile
  count persist across a sector run (menu starts reset them).
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
  pitch-up, direction spoken) and it attacks within 2.5 s.
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
- **Weapons**: laser range 600, damage ×1.6 at point-blank tapering to ×1 at
  range (`laserRangeMult`); two zero-damage bursts inside 8 s = overheat 5 s
  (hiss + slowing hot-metal pings + ready chime). Missiles: magazine 8
  (`missiles`), count spoken on launch, speed 130 / life 11 s (~1400 reach);
  SEMI-ACTIVE: target must stay inside the missile zone for the whole flight
  (0.5 s grace) or it goes ballistic.
- **Mining**: 3 rock types (Ice soft/splitty, Iron hard/chippy, Stone middle)
  × 4 sizes, HIDDEN per-stage hp rolls. Core ore 3000/6750/4500 (×1.5 as of
  Round 10); all dust ×0.75 via `CFG.debrisScale` in `addDebris`. Laser ticks
  shed dust; stage events split/chip/collapse-to-core; `E` extracts cores
  (range 300), `V` vacuums dust fields, cloud radius 800.
- `Q` from encounters: mining any time; combat only when zone cleared
  ("jammed by hostile fire"); drills never. Enter on the encounter map =
  depart (silent return + auto-warp).

## Key map (left-hand doctrine — right hand stays on arrows)

Arrows yaw/pitch · W thrust / S brake · Space laser beam · F missile · G shields
· Tab cycle targets · T report selected target (lock onset also speaks distance) · R radar · E extractor · V vacuum · Z
zone size · Q map · H warp · C call · I status (adds hull, missiles, shields,
laser heat, demo clock + objective) · X leave · F1 help · F12 explore · Escape
pause. Menu: arrows + Enter (first letters D/S/C/M/H jump); Left/Right on
the Difficulty line cycles Rookie/Veteran/Ace in place.

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
dust ×0.75, difficulty tiers, no-warp zone, saved profile. Still awaiting his
ears from Round 9 too: stabilizers, W/S swap, dust shimmer, beacon balance,
warp drama. SPEC.md 1.6 (docking corridor) and 1.7 (station economy)
are the two large pieces deliberately deferred — good next round once Round
10–11 has been heard.

Round 12 (this one) is the audio pull-out: `audio_engine.js` + `audio_cues.js`
split out of index.html as `SIM.audio`/`SIM.cues`, 22 discrete cues migrated
into the registry, `sfxEcho`/`sfxSweep` added, `.claude/launch.json` added
for local multi-file testing, Station Meridian's beacon halved in volume.
Machine-tested thoroughly (every migrated cue exercised under real gameplay
conditions at a local server), not yet heard by Brian. See "Audio
architecture" above for the shape of it and what's deliberately NOT
migrated. Next audio step, per Brian: a sound-lab tester (this project's own
`.soundtester`-style page) for auditioning new synth ideas AND the new
unintegrated recordings side by side — not built yet.

Tuning questions still open for play-test: provoked-retaliation fuse (4 s),
enemy damage pacing (30 per beam, 25 per missile — with the shield pool at
45 that's roughly 1.5 full beams absorbed before disrepair), attack gap
7–12 s, shield spool 1.5 s (2.5 s Ace) / repair 12 s, laser overheat window
8 s, and whether the "Shields, G" coaching (first two warnings only) is
enough for newcomers.
