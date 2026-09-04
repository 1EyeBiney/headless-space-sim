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

- `index.html` — the entire game (one IIFE, section banners CONFIG→STATE→MATH→
  SPEECH→AUDIO→TARGETING→WEAPONS (laser, missiles, enemy evasion, enemy fire,
  shields, debris, rocks)→RADAR→SECTOR (map, warp, call, delivery run)→INPUT→
  LOOP→SHELL). Runs by double-click from file://. Needs `audio_assets.js`.
- `audio_assets.js` — base64 mono-96k-MP3 sound bank (12 assets), loaded by a
  plain script tag (fetch is blocked on file://, script tags are not).
- `space_sim_demo.html` — single-file shareable snapshot (bank inlined).
  REGENERATE after changes: node one-liner that replaces the audio_assets.js
  script tag with the file's contents inline (see git history / README).
- `README.md` — player-facing intro for the GitHub share (keys, delivery run).
- `audio/` — Brian's source recordings (never read at runtime): 3 asteroid
  loops, 3 asteroid explosions, missile-firing mp3, `audio/ships/` = 18 ship
  loops (interceptor ×6, corvette ×7, cruiser ×5; only 5 embedded so far).
  `audio/Backups`, `audio/Media`, `audio/peaks` are REAPER scratch: gitignored.
- Git repo, public on GitHub: https://github.com/1EyeBiney/headless-space-sim
  Served live via GitHub Pages at
  https://1eyebiney.github.io/headless-space-sim/ — this URL is the
  reference build; `?run=delivery` skips the menu into the timed run.
- Plan from the original build: `~\.claude\plans\you-said-do-not-functional-hammock.md`.

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
  The double-click `index.html` / `space_sim_demo.html` files must still
  work standalone, but the URL is the reference.
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
- Regenerate `space_sim_demo.html` and commit/push after every round.

## Where we left off (2026-09-03)

Round 10 built and machine-tested, NOT yet heard by Brian: KC-style arrow
menu, passive-until-hit enemies (Brian: the always-on attacks were far too
hard for a starting player; keep that pacing for a later-game tier), delivery run,
missile magazine + rearm, semi-active missile cone, laser range/close bonus/
overheat, enemy fire (laser + missile) with telegraphs, shields, evade +
counterattack, ore ×1.5 / dust ×0.75, README, git + GitHub. Still awaiting
his ears from Round 9 too: stabilizers, W/S swap, dust shimmer, beacon
balance, warp drama.

Tuning questions for play-test: provoked-retaliation fuse (4 s), enemy damage pacing (30 per beam, 25 per
missile vs hull 100 — four unshielded attacks kill), attack gap 7–12 s,
shield spool 1.5 s / hold 10 s, overheat window 8 s, and whether the "Shields,
G" coaching (first two warnings only) is enough for newcomers.

Likely next: shield upgrades (faster spool, longer hold) bought with ore at
the station (economy start), more ship assets, distress calls, POI variety.
