# SPEC.md — Headless Space Sim

The one planning document. Merges the old PHASE_PLAN.md (near-term build
order, Rounds 11+) with Brian's ideas2 notes (the long-range game), because
the long-range shape decides things in the small playable parts now: what a
laser key does, what a warp costs, what the station sells, what "a module"
even is. Part A is direction — where the game is going, not build
instructions. Part B is the build plan for the playable demo, the thing
Brian wants to show people first. Part C is what's decided vs open.

Read `CLAUDE.md` first: every rule there (ear-first, CFG-only tuning, silent
testing, help + KEY_DESCRIPTIONS + README in sync, commit + push each
round, test at the Pages URL or a local server) applies to every item
below. Brian's ear decides all sound.

Items marked **DECIDE** are open — ask Brian before building them. Items
marked **(accepted by default)** were settled on Claude's recommendation
without an explicit note; build as written unless he says otherwise.

---

## Part A — Where the game is going (direction, shapes the micro)

### A.1 Four scales of movement

1. **Thruster flight** — inside an encounter (combat zone, asteroid cloud,
   a rescue). W/S, arrows, stabilizers. Exists.
2. **Local space** — flying the sector between points of interest by
   beacon. Exists.
3. **Warp jumps** — `H`, within a sector. Exists, but will cost warp
   charge (A.3).
4. **Quadrant jumps** — between sectors on a universe map, through a jump
   gate. Needs hydrogen (A.3). Not built; the gate exists sealed (B, 2.6).

The `Q` map is the sector map. A quadrant map and a universe map are the
same browsable-list widget one and two levels up.

### A.2 Lasers: slots 1–6, fire-and-forget

- Keys **1–6 select a laser slot**; Space fires the selected laser. Each
  laser is data (`LASERS` table): name, sound, burst length, cooldown,
  damage, mining effectiveness. Some are good in combat, some at mining,
  all usable for both, none best at everything — picking the right laser
  for the rock in front of you is part of mining.
- **Fire-and-forget**: one press runs the whole burst (~5 s, Brian's
  number); you do not hold Space, you cannot spam it. A cooldown and/or
  overheat penalty per laser makes each burst a choice.
- The ship starts with two fitted; more are modules bought at the station
  (A.5). The 16 laser recordings in `audio/weapons/lasers/` (Mining ×8,
  Rapid-pulse ×8) are candidates to audition, then assign per laser.
- This changes the demo's current laser (2 s, 4 ticks, 700 ms recharge,
  overheat after two misses in 8 s) — see B, 1.9.

### A.3 Fuel: warp charge and hydrogen

- **Warp charge**: the sector warp drive has a tank. Each jump costs charge
  by distance; the core has to cool and recharge. Early game the tank is
  small, so the pilot can't range far from the starting station. Refill:
  slowly in flight, fully at a station. Bigger tank / faster cooling are
  modules.
- **Hydrogen**: the resource for leaving a quadrant. Sources: the sun of
  the quadrant (later); mining any asteroid with a hydrogen-extractor laser
  enhancement (module); combat drops hydrogen containers to collect. Sink:
  quadrant jumps; until those exist, the station buys it.
- So the resource ladder is: ore (sell) → credits (buy modules) → hydrogen
  (move between quadrants) → influence (A.6).

### A.4 Loot and income

Combat drops containers (hydrogen, ore, credits) collected by flying to
them. Later: planetside resources, trade goods, hauling contracts between
stations. Every income source feeds credits or a resource.

### A.5 The ship is modules

- The player chooses modules as the ship grows: weapon (lasers, missile
  racks, chaff), shield, drive (warp tank, cooling, thrusters), cargo, tools
  (hydrogen extractor, scanner, docking computer). Groups are data.
- Looks don't matter; **mass does**. No friction in space, so every module
  adds mass, mass slows acceleration and turning, and thruster upgrades
  matter. The current CFG `thrust`/`turnRate` become base thrust over ship
  mass.
- A **ship window** (a browsable overlay like help/map/run log) shows hull,
  shields, fuel, cargo, fitted modules per slot.
- The "Upgrades" list in the old station plan is this: modules with mass and
  price, not flat CFG overrides.

### A.6 Stations, influence, control

- Activity in a sector matters. Each station has an **influence** score the
  pilot raises by combat missions for it, selling ore to it, trade runs,
  meeting its needs (rescues, hauling). Station speech and prices reflect
  it.
- Long game: influence enough stations to form a **union**; quadrants end
  up in unions; the player flips, holds, develops, or captures quadrants;
  an automated war runs; a small local AI model writes news stories on the
  fly. Planets and stations can be controlled and **auto-governed** so
  resources collect without micromanagement once the empire is big.
  Possibly a farm game on planets.
- None of this is built. What the demo needs from it now: an influence
  number per station that the existing actions already feed, so the
  economy has its hook from day one (B, 1.7).

### A.7 What stays true at every scale

Ear-first, one live region, left-hand keys, silence is a bug, hidden
mining thresholds never spoken, every attack telegraphed, every rule has an
audible tell. The strategic layer is menus, maps, and speech — the same
widgets the mission menu, quadrant map, and run log already are.

---

## Part B — Build plan (the playable demo first)

Work item by item, one commit per numbered item where practical, stop at the
end of each phase for Brian's play-test. Phase 1 is the demo he shows
people; nothing in Phase 2+ starts without his go.

### Phase 1 — the demo, finished

Done, live on Pages (Rounds 10–12): 1.0 hosting + `?run=delivery`, 1.1
difficulty tiers, 1.2 Rookie Cruiser, 1.3 shield damage pool + disrepair,
1.4 saved profile + run log, 1.5 no-warp zone, 1.9 laser slots, 1.10 warp
charge, 1.6 the docking corridor, and 1.7 the station economy hook (Sell
ore + Modules) (all machine-tested, not yet heard by Brian — see below),
and the audio split (`audio_engine.js` / `audio_cues.js`, see CLAUDE.md
"Audio architecture").

1.7's economy hook (Sell ore, Modules) is also DONE now (see below).
Brian's ideas3 notes (2026-09-04) are folded in as 1.12–1.15 below; 1.12
(sound options, the `B` beacon key), 1.13 (warp-core alerts), 1.14
(laser switching), 1.15 (R / Shift+R / Shift+T / Shift+W), and 1.8
(chaff) are all DONE — every Phase 1 item except 1.11 (the ship window,
deferred past the demo by Brian). Brian's ideas4 (2026-09-04, evening)
adds a second pass, 1.16–1.20 below — the next build, by Sonnet, before
Phase 2.

#### 1.9 Laser slots and fire-and-forget (from A.2) — DONE, needs Brian's ear

Built and machine-tested (slot select 1–6 including empty slots, fire-and-
forget with `G` refused mid-burst, both damage profiles firing in the right
shape, per-slot cooldown with spoken recharge, overheat still reachable,
mining and combat both exercised, `E`/`V` unaffected) — not yet heard.
Real per-tick numbers are still placeholders; Brian sets them by ear.

One gotcha found in testing, already fixed: `laserMissWindowMs` (the "two
misses overheat it" window) was still 8000 ms from the old 2 s beam. A 5 s
burst plus the 3 s cooldown puts the natural gap between two misses at
~8 s, so the old window made overheat unreachable. Moved to 11000 (Ace
16000, keeping the same proportional tightening) — first candidate to
retune once Brian has heard the new rhythm.

- `LASERS` data table; each entry `{ id, name, asset, ticks: [..],
  tickS, cooldownS, hullMult, rockMult }`. **Damage is a per-tick
  profile, not one number**: the laser hits harder on some ticks than
  others, and the profile matches the shape of that laser's sound (Brian:
  "a laser might hit 5, 5, 25, 20, 10, 5, 5"). Five ticks per burst. The
  ship starts with the first two mining-laser recordings: slot 1 =
  `Mining_laser 1`, steady damage every tick; slot 2 = `Mining_laser 2`,
  two heavy ticks then steady. Placeholder totals match today's burst (100
  at point-blank, perfect aim); Brian sets the real per-tick numbers by
  ear once he's heard each recording against its profile. Slots 3–6 empty:
  "Slot 3 is empty. Fit a laser at the station."

- `LASERS` data table; each entry `{ id, name, asset, ticks: [..],
  tickS, cooldownS, hullMult, rockMult }`. **Damage is a per-tick
  profile, not one number**: the laser hits harder on some ticks than
  others, and the profile matches the shape of that laser's sound (Brian:
  "a laser might hit 5, 5, 25, 20, 10, 5, 5"). Five ticks per burst. The
  ship starts with the first two mining-laser recordings: slot 1 =
  `Mining_laser 1`, steady damage every tick; slot 2 = `Mining_laser 2`,
  two heavy ticks then steady. Placeholder totals match today's burst (100
  at point-blank, perfect aim); Brian sets the real per-tick numbers by
  ear once he's heard each recording against its profile. Slots 3–6 empty:
  "Slot 3 is empty. Fit a laser at the station."
- Keys `1`–`6` select: "Slot 2, mining laser two." Space fires the
  selected slot. Selection persists in the profile.
- Fire-and-forget, **cannot be stopped** (Brian: decided): Space starts the
  burst and it runs every tick to the end. Each tick still scales by aim
  quality and the point-blank multiplier, and the spoken number is the
  aim feedback. The recording plays as the beam's voice (a subtle
  playback-rate rise with aim quality keeps a trace of today's pitch
  narration; the synthesized carrier is the fallback if the asset is
  missing). Consequence: `G` during a burst is refused ("Laser burst in
  progress, 3 seconds.") — you commit to the burst, then shield. That's
  the strategic cost **(accepted by default)**.
- Then `cooldownS` before that slot fires again ("Mining laser one
  recharging, 3 seconds."), spoken on a refused press, never silent.
  **Misses still matter** (Brian: decided): the two-empty-bursts overheat
  stays on top of the cooldown.
- Enemy beams are 5 s already; a 5 s player beam changes the duel's rhythm
  — flag for the play-test.
- Help, KEY_DESCRIPTIONS (1–6), README, and the `I` status ("Slot 2,
  mining laser two, ready") all updated. The two recordings get decoded
  into `audio_assets.js` (mono 96k like the rest) — the first new
  recordings connected to the game.

#### 1.10 Warp charge (from A.3) — DONE, needs Brian's ear

Built and machine-tested: the three-leg route flies as designed (leg 1
arrives with a quarter tank; legs 2 and 3 run dry ~850–870 out with the
map saying "beyond warp range by N" first), the tank refills on leaving
an encounter and at the station ("Warp tank filled"), `I` reads the
charge, a dry tank refuses with "Fly it, or let the core cool", and the
open-flight regen hiss starts and stops cleanly. Not yet heard.

One thing found in testing, already handled: the no-warp zone makes the
pilot fly 1500 clear of an encounter before jumping, and the DIRECTION
they leave changes the next leg by up to 3000. The tank is therefore
sized against the best exit (toward the next target): `warpTankMax`
12500, not the 14000 first pencilled in. Leave the wrong way and it's a
longer thrust in — the map's reach line says so before the jump. If that
feels punishing in play, widen the tank a little or shrink the no-warp
zone; both are one number.

- The tank is measured in distance: `warpCharge` up to `warpTankMax`.
  A jump spends charge by distance flown — and if the nav target is
  farther than the charge, the drive still jumps, drops the pilot out
  where the tank runs dry, and the rest is flown by ear ("Warp charge
  exhausted. Asteroid Field Kappa dead ahead, distance 500."). No refusal,
  no stranding: a dry tank just means thrusting the last stretch.
- Refill: full at the station, and full on completing or leaving an
  encounter (the core cools while you fight and mine — Brian: assume the
  tank fills in combat and in mining). Slow regen in open flight
  (`warpRegenPerS`, an audible core-cooling hiss that fades as it fills)
  so nobody is ever stuck, but slow enough that waiting isn't the plan.
- **The demo route** (Brian: decided): new players start right outside
  Station Meridian with a full tank. Leg 1, station → Contested Zone, is
  within one full tank. Leg 2, Contested Zone → Field Kappa, is a little
  MORE than one tank, so the pilot thrusts the last ~500. Leg 3, Field
  Kappa → station, is the same shape as leg 2: the tank runs dry ~500 out
  and the last stretch is flown in. `SECTOR_POIS` positions and
  `warpTankMax` get tuned together to produce exactly those three legs;
  the existing `warpDropout` (600 short of any target) still applies when
  the tank reaches.
- `I` reads charge; the map lines read each point's distance and whether
  the tank reaches it. Bigger tank and faster cooling are modules (1.7).

#### 1.6 Docking approach (the corridor) — DONE, needs Brian's ear

Built and machine-tested: calling the station starts the approach instead
of instant service; the centerline tone and coaching guide a real flight
in; too-fast aborts and resets cleanly to the corridor entry (confirmed
lateral/vertical exactly zero on reset, i.e. genuinely back on axis); a
slow, careful approach docks successfully, opens the station menu, holds
the ship, and repairs/rearms/refuels; `X` cancels an approach in progress
without exiting to the mission menu; C while already approaching restates
range instead of restarting. Deliberately the HARDEST version now — a
docking-computer module loosens it later (Phase 2). Not yet heard.

One real bug found and fixed: `makeSectorRoster()` rebuilds each POI as a
fresh target object every time the sector loads, and it wasn't copying
`dockAxis` onto that object — so the corridor was silently flying on the
default `(0,0,1)` heading instead of the one set on `SECTOR_POIS`. The
approach still worked end to end (confirmed by testing before the fix
too); the heading was just wrong. Caught by checking the reset position's
exact coordinates against hand-computed corridor geometry, not by
anything breaking outright — worth remembering for any future POI data
field: `makeSectorRoster`'s target literal only carries what it explicitly
lists, nothing is copied implicitly.

- Calling the station (C within `poiInteract`) answers "Meridian control:
  cleared to dock. Approach corridor active." and starts the approach.
- Corridor = a line from a point `dockCorridorLen` 800 out to the station
  door, on a fixed heading per station (`dockAxis` on `SECTOR_POIS`).
  Instruments on the UI bus, NOT HRTF (a cockpit instrument, like the
  tick): centerline tone panned by lateral offset (off to the right = tone
  on the left = turn left, the tick's convention; dead center = mono);
  glide slope as that tone's pitch (up = high); range as a click rate
  quickening toward the door; over `dockMaxSpeed` 25 inside the last 300 =
  "Too fast. Abort." and a reset to the corridor entry (no damage).
- Success inside `dockRadius` 40 at ≤ `dockMaxSpeed`: docking clunk,
  "Docked at Station Meridian.", the station menu opens. Ship held; thrust
  keys don't move it (the station menu captures all input, same shell as
  help/map).
- Coaching every ~3 s in the corridor: "40 right, 10 high, range 500"
  (round10), silent when centered. All numbers in CFG.
- The station menu itself, built this round as a shell (Undock only) —
  1.7 adds the economy items on top of the same `STATION_ITEMS`/
  `stationMenuKey`.

#### 1.7 Station menu (the economy hook) — DONE, needs Brian's ear

Built and machine-tested (full run: sell ore → correct credits and balance
speech; Modules browsed all 5, bought 3 in sequence with correct running
credits/mass, "Already fitted" gating on a re-buy attempt, "Need N more
credits" gating on an unaffordable buy with the attempt correctly refused
and no credits deducted; `shipMass()` confirmed wired into both thrust and
turn in `simTick` — code-verified rather than flight-measured, since by
this point in testing the profile already had 3 modules fitted with no
clean mass=1 baseline left to compare against; full Delivery-run docking
path confirmed the handover fires `bumpInfluence(poi, 2)` — separately from
the plain-sector dock, which does not bump influence on its own, only on a
sale — and a second dock once influence crossed `influenceThreshold` (3)
correctly spoke the "good to see you again, pilot" greeting, which the
FIRST dock at exactly influence=3 correctly withheld, since the greeting
is computed from the influence BEFORE that visit's own bump; no console
errors through any of it). Not yet heard.

This shipped a smaller slice than first sketched below: **Sell ore** and
**Modules** only, on top of the 1.6 station-menu shell. Repair / Rearm /
Restock / Refuel stayed FREE on every dock (unchanged from before 1.7) —
turning those into paid actions, hydrogen as a second resource, chaff
restock, and the docking-computer module are all deferred, most of them
waiting on chaff (1.8) or Phase 2's hydrogen anyway. `listMenu(items, opts)`
was NOT extracted this round either — `STATION_ITEMS`/`stationMenuKey`
still duplicates the mission-menu shell's shape, same deliberate deferral
already precedented for the run log (see CLAUDE.md).

- **Sell ore**: `CFG.oreCreditRate` 10 (1 credit per 10 ore). Speaks the
  sale and the new balance; "No ore to sell" if the hold is empty. The
  delivery-run handover is a separate path (`finishDocking`'s demo branch),
  not routed through this item — it converts ore to the run completion
  directly and does not award credits.
- **Modules ▸**: `MODULES` table, 5 entries shipped — shield spool (raise
  1.5 → 1.0 s, 400 cr, +8 mass), shield pool (+50 %, 500 cr, +12 mass),
  missile rack (8 → 12, 350 cr, +10 mass), warp tank (+50 %, 450 cr, +15
  mass), core cooling (×2, 400 cr, +6 mass). Each line speaks price, mass,
  and affordability ("You can afford it" / "Need N more credits" /
  "Already fitted"). `moduleCfgOverlay()` merges every owned module's `cfg`
  object into live `CFG` on every `applyTier()` rebuild, so a purchase
  takes effect immediately with no special-case code path. `shipMass()` =
  `1 + (sum of owned modules' mass)/100`, divides both `CFG.thrust` and
  `CFG.turnRate` in `simTick` — no friction in space, so mass is purely a
  maneuvering tax, same intent as sketched originally.
- **Influence**: `profile.stations[name].influence`, bumped by delivery
  handover (+2, `finishDocking`), selling ore (+1, `sellOre`), and a
  sector-entered combat-zone clear (+1, `destroyTarget`, gated on
  `sectorHome` so the standalone Combat-training mission doesn't feed it).
  Past `CFG.influenceThreshold` (3) the NEXT docking adds "Station Meridian
  control: good to see you again, pilot." before the rest of the arrival
  line — computed from influence as it stood before that visit's own bump,
  confirmed in testing. Rescues (from A.6) have no source yet — no rescue
  mechanic exists.
- **Undock**: Escape (or `X`) on the station menu top level. "Undocked.
  Clear of Station Meridian."

#### 1.11 Ship window (from A.5) — deferred past the demo

- Not needed for the demo (Brian). When it comes: a browsable overlay
  (same shell as the run log) — hull, shields, warp charge, hydrogen, ore,
  credits, missiles, chaff, one line per slot, total mass; Escape closes.
  Brian's direction: screens like this end up on **function keys** (F2
  and up), the way F1 is help — not on letter keys.

#### 1.8 Countermeasures (chaff) — DONE, needs Brian's ear

Built and machine-tested at Veteran: "Chaff away. Missile spoofed. 3
left." turns the incoming missile ballistic at once (`guided` false, it
coasts and pops, hull untouched) and the next attack is scheduled
`enemyChaffFollowUpS` 2 s out instead of the usual 7–12; against a beam
"Chaff away. Chaff does nothing against a laser. Shields. 2 left."; with
nothing inbound "Chaff away, nothing inbound. N left."; at zero "No chaff
left." (plus "Station Meridian restocks." inside a sector run); `I` reads
"N chaff"; in open sector space D answers "Nothing shoots at you in open
space. Chaff is for encounters."; docking refills to 4 ("Chaff restocked
to 4." in the service line — same one-liner as the missile rearm, code-
verified rather than heard in the test, whose dock started from a fresh
run). The burst is a new `chaff_burst` cue (bright noise plus a scatter
of panned clicks, UI bus). No console errors. Not yet heard.

One simplification vs the sketch below: "Veteran/Ace may launch a second
missile while the first coasts" is built as the fast follow-up above —
`threat` is a singleton throughout (shields, status, `endThreat`), so a
true second simultaneous missile is a larger change; the spoofed one
pops within 1.5 s and the next attack (missile or beam by range) comes
2 s later, which plays the same. Rookie keeps the normal gap.

- Key `D` ("decoy") **(accepted by default)**. Menu D still jumps to
  Delivery run; KEY_DESCRIPTIONS says both.
- `chaffMax` 4, restocked at the station. One press spoofs the CURRENT
  incoming missile (it loses guidance at once, the existing ballistic
  coast), no shield needed. A bright crackling burst at the ship (UI bus),
  "Chaff away. 3 left." Useless against beams: "Chaff does nothing against a
  laser. Shields." With nothing inbound it STILL fires and wastes one
  (Brian: decided): "Chaff away, nothing inbound. 3 left."
- Veteran/Ace enemies may launch a second missile while the first coasts;
  Rookie never does.

#### 1.12 Sound options: beacons off, a level per category (ideas3) — DONE, needs Brian's ear

Built and machine-tested at a local server: beacons muted at sector
entry with the intro reading "Beacons: off. B cycles them."; `B` cycles
off → target only → on → off with the four mute gains following (target
only: the selected beacon at 1, the other three at 0, and a Tab moves
the 1 to the new selection within a frame or two); the lock tick still
locks with every beacon silent ("Locked. Distance 8460."); `B` also
works at the mission menu and inside the Sound list ("Applies in open
sector space" appended outside the sector); the Sound list browses,
wraps, speaks each level change, plays a short sound in that category,
saves, and reloads at boot (a reload with all three at quiet came up
with both buses at 0.35 and the cue level at 0.35); a stray key in the
list gets the hint; F12 describes `B`; `poke({ beacons: 'off' })` sets
the live mode without touching the saved copy. No console errors. Not
yet heard.

One engine gotcha found and fixed: the bus level setter first used the
shared `ramp()` helper (cancelScheduledValues + setValueAtTime(value) +
linearRamp). Three quick level changes on the world bus left its gain
stuck at 0.297 with nothing correcting it — the cancel + set-from-
`param.value` idiom misreads a param mid-ramp. `setBusLevel` now uses
`setTargetAtTime`, which starts from wherever the param actually is and
always converges. `ramp()` itself is unchanged (voices and ducking use
it once at a time); worth remembering if any other param ever gets
re-ramped while in flight. Three cues in the registry scheduled their
second note with `setTimeout`, outside the dispatch window the Effects
level is applied in — converted to `at:` offsets, behavior-identical.

Brian's ask: a main-menu option to turn the POI sounds off — while Claude
tests with a point targeted, its beacon keeps sounding through his
speakers and interferes with him listening to other audio, and veteran
pilots may not want the beacons at all. Plus in-game sound options
generally (labels and categories: Claude's judgement, adjust later).

- A **Sound** item on the mission menu opens a small list (same shell as
  the station menu; Escape returns): one line per category, Left/Right
  cycle **Off / Quiet / Full** — three levels, not a percentage, which is
  a lot of arrow presses by ear **(accepted by default)** — spoken as
  "Beacons: off." Saved in the profile (`profile.sound`), applied at boot
  and the moment a line changes. Speech is never touched (it's the screen
  reader's).
- **Beacons are NOT on the menu — they're on the `B` key in-game** (Brian:
  decided). `B` cycles **On / Off / Target only**: "Beacons: off." /
  "Beacons: target only." (the selected nav target's beacon sounds, the
  other three are silent). The four POI voices (`buildPoiVoice`,
  `poiGain`) ramp to silence and back, no rebuild. With beacons off the
  targeting cursor still works exactly as with enemy ships: Tab/T select,
  the lock tick walks the nose onto the point, "Locked. Distance N." on
  lock — Brian: there are stretches of open-space flying where the
  beacons should be quiet, and the tick is how you find things then.
  Saved in the profile (`profile.beacons`) and read back at sector entry
  when it isn't On ("Beacons: target only.") so a silent sector is never a
  mystery **(accepted by default)**. `B` outside the sector: "Beacons are
  a sector thing." — silence is a bug.
- Menu categories (the `Sound` item):
  - **World** — everything HRTF: ship engines, rocks and dust, enemy
    chirps/beams/missiles, explosions at a position, the beacons. Needs
    one engine change: a `worldBus` gain in `audio_engine.js` between the
    panners and `masterGain` (panners connect straight to `masterGain`
    today, `makePanner`).
  - **Cockpit** — the UI bus (`uiBus`): lock tick, thrusters and
    stabilizers, tools, shield hum, overheat hiss, docking instruments.
  - **Effects** — the discrete cue registry (`SIM.cues`): menu clicks,
    chimes, warnings, explosions, the fanfare. A gain multiplier inside
    `SIM.cues.play`, so it stacks with whichever bus the cue lands on.
- Testing rule (now in CLAUDE.md): every machine-test script sets beacons
  off first thing after boot, live and unsaved (`__sim.poke({ beacons:
  'off' })`), so a leftover targeted point never sounds on Brian's side.
  `poke` never calls `saveProfile`.

#### 1.13 Warp core: spoken charge alerts, no regen hiss (ideas3) — DONE, needs Brian's ear

Built and machine-tested: the hiss (`warpCoreSound`/`warpCoreNodes`) is
gone from the code entirely; "Warp core 50 percent." and "Warp core 75
percent." speak on the exact crossing and never repeat while the charge
sits between thresholds; "Warp core cooled. Tank full." keeps its chime
and the core is silent after; dropping the charge below a threshold
re-arms it (a second "50 percent" after a poke back down); nothing
regenerates or speaks in an encounter or at the menu. Stateless by
design — the alert fires when one frame's regen carries the charge
across a threshold, so there's no "already said" flag to reset on a
jump. No console errors. Not yet heard.

- Remove the core-cooling hiss (`warpCoreSound`: bandpass noise on the UI
  bus, breathing, thinning as the tank fills). Brian: "remove the ticking
  sound of the warp core recharging."
- In its place, speech as the charge crosses `warpAlertPcts` [50, 75, 100]
  while regenerating in open flight: "Warp core 50 percent." / "Warp core
  75 percent." / "Warp core cooled. Tank full." (the existing line, keeps
  its chime). Speech only for now (Brian: "audio TTS for now"); a chime
  per step is a later ear decision. Each threshold speaks once per fill —
  a jump that drops the charge back under a threshold re-arms it. Open
  sector flight only: encounter exits and the station already say "Warp
  tank filled", no double announcement. `I` keeps reading the exact charge.

#### 1.14 Laser switching takes time, timed by the switch recordings (ideas3) — DONE, needs Brian's ear

Built and machine-tested: the six wavs are decoded into `audio_assets.js`
(mono 48 kHz 96 kbps like the rest, ~25-33 KB each); pressing another
slot speaks "Slot 2, mining laser two, switching.", Space during it is
refused with the seconds left, re-pressing the same key restates the
countdown, the window ends with "Mining laser two ready." on the dot
(slot 1 measured 1.8 s: 0.8 left at +1.0 s, ready by +2.0 s); an empty
slot cancels a switch in progress and refuses with no delay; a burst in
progress refuses the switch; `I` reads "switching, N seconds"; the clip
rates come out as designed (slot 2 at 1.448×, slot 5 at 0.833×). No
console errors. Not yet heard — the pitch shift from the stretch is the
first thing for Brian's ear, then the three tied 1.4 s slots.

- Six recordings, `audio/weapons/lasers/laser_switch1–6.wav`, measured
  from their WAV headers 2026-09-04: 1 = 2.023 s, 2 = 2.666 s, 3 = 2.164 s,
  4 = 2.027 s, 5 = 2.297 s, 6 = 2.023 s. Light → heavy by length: 1 ≈ 4 ≈
  6 (2.02), 3 (2.16), 5 (2.30), 2 (2.67). Brian: the shortest clip is the
  lightest laser and switches fastest; the variance is too small, so the
  lightest laser's delay goes SHORTER than its clip and the heaviest
  LONGER, for a better spread.
- The switch sound and delay belong to the **slot** (the hotkey), not the
  laser fitted in it (Brian: decided). A `SLOT_SWITCH` table, one row per
  slot `{ asset, s }`, with the delay stretched linearly from the clip
  lengths so the shortest clip lands at 1.4 s and the longest at 3.2 s
  (Brian's range):

  | Slot | Clip | Clip length | Delay `s` |
  | --- | --- | --- | --- |
  | 1 | laser_switch3 | 2.164 s | 1.8 |
  | 2 | laser_switch4 | 2.027 s | 1.4 |
  | 3 | laser_switch5 | 2.297 s | 2.2 |
  | 4 | laser_switch1 | 2.023 s | 1.4 |
  | 5 | laser_switch2 | 2.666 s | 3.2 |
  | 6 | laser_switch6 | 2.023 s | 1.4 |

  Clips 1, 4, and 6 are the same length to the millisecond, so slots 2,
  4, and 6 tie at 1.4 s — the numbers are in the table so Brian can
  hand-set them once he has heard the six in place.
- The clip is **time-stretched to fit the window** (Brian: decided —
  "stretch and shrink"): `playbackRate = clipLen / s`, so slot 5 plays
  ~17 % slow and lower, slot 2 ~45 % fast and higher. The pitch shift is
  part of the character: heavy slots grind, light ones snap.
- Pressing 1–6 starts the switch: the clip plays on the UI bus (a cockpit
  sound), "Slot 2, mining laser two, switching." Space during the switch
  is refused like a cooldown: "Switching lasers, 2 seconds." At the end:
  a ready cue and "Mining laser two ready."
- Re-selecting the current slot: no switch, no delay. Switching mid-burst:
  refused, the burst can't be stopped (1.9). Switching to an empty slot:
  today's refusal, no delay. The `I` status reads "switching, N seconds."
- The six wavs get decoded into `audio_assets.js` (mono 96k MP3 like the
  rest, ~25 KB each).

#### 1.15 Keys: R = range, Shift+T cycles back, Shift+W auto-thrust (ideas3) — DONE, needs Brian's ear

Built and machine-tested: R reads "Range 270." at rest and "Range 260,
closing." under way (the trend is the relative velocity along the line
of sight, spoken past 2 units a second); Shift+R runs the old sweep;
Tab, Tab, Shift+T, Shift+Tab walk forward twice and back twice through
the same order; Shift+W speaks "Auto-thrust on. W, S, or shift W ends
it.", the ship moves with no key held, `I` reads "Auto-thrust on", and a
plain W, a plain S, or Shift+W again each speak "Auto-thrust off."; a
warp jump speaks "Auto-thrust off. Hyperwarp charging." and docking
"Auto-thrust off. Docked at Station Meridian."; while paused a Shift
chord answers "Paused."; F12 describes the Shift forms on R, T, Tab, and
W. No console errors. Not yet heard.

- **R reads the range to the current target**: "Range 430, closing." —
  the distance and whether it's closing or opening (the sign of the range
  rate; a docking and tow instrument later). No target: "No target
  selected. Tab cycles targets." The radar sweep (every target, nearest
  first, `radarPing`) moves to **Shift+R** (Brian: decided).
- **Shift+T cycles targets backward** (Tab forward). Shift+Tab does the
  same **(accepted by default)** — the convention, and free.
  Implementation: `lname` is lowercased, so 'T' and 't' look alike; read
  `e.shiftKey` in `onKeyDown` the way `helpKey` already does. NVDA's
  pause-on-Shift only fires on a bare Shift press, not a chord.
- **Shift+W toggles auto-thrust**: "Auto-thrust on." — the ship thrusts
  forward as if W were held (thruster sound on, no stabilizer puffs, the
  speed cap applies) until Shift+W again, any W or S press **(accepted by
  default: any manual thrust input cancels, S included)**, a warp jump,
  docking success, leaving the mode, or losing the ship — each ending
  speaks "Auto-thrust off." Pause freezes it and it resumes. It stays
  engaged into a docking corridor on purpose — the corridor's own too-fast
  abort is the consequence. Gotcha: Shift+W arrives as `lname` 'w' and
  would land in `keysDown` via the `HELD` branch; check `e.shiftKey`
  before it.
- F12 explore, F1 help, KEY_DESCRIPTIONS, README, and CLAUDE.md's key map
  updated for all three.

### Phase 1, second pass — Brian's ideas4 (2026-09-04, evening)

Five items from `ideas4.txt`, folded in here 2026-09-04 (Fable, docs
only). Brian: Sonnet builds these next. Suggested order — 1.19 first (a
removal, it unblocks every docking test), 1.20 (one number per tier),
1.16 (a test, nothing to build), 1.18, then 1.17 (the biggest, and it
waits on the clip-length decision below). Same rules as everything
above: one commit per item, machine-test at a local server with beacons
off, docs in sync, push, re-test at Pages, close every tab.

#### 1.16 Chaff is instant, any time (ideas4)

Brian: "chaff is instant, can be used during laser or shields." Already
true as 1.8 was built — `fireChaff()` has no gate on a burst in progress
or on raised shields, and D answers in the same frame. This item makes
it a RULE rather than an accident: D never gets a gate beyond "in an
encounter, not paused, not over." Test checklist: D mid-burst spoofs the
missile and the burst keeps running; D with shields up spends a round
("That missile was already ballistic") since the shield already broke
its guidance.

#### 1.17 Warp takes time: a three-phase recorded warp, 25 % minimum charge (ideas4)

Brian's ask: warping should take time — 10,000 distance ≈ 10 seconds on
the current engine — and play three recorded phases: warp start, warp
engaged (looped to fill), warp end. Six start and six end variants for
six engine types, engaged loops to match. No warp below 25 % charge, so
there is always time for all three phases. (He wrote "quadrant warping";
the only warp that exists is the in-sector `H` hyperwarp, so this is
that — the Phase 4 quadrant jump inherits it later.)

The recordings, measured 2026-09-04 (ffprobe), all in `audio/ships/warp/`:

| Files | Length | Format |
| --- | --- | --- |
| `warp_start1–6.mp3` | 4.0 s each | stereo 48 kHz |
| `warp_engaged1r–6r.mp3` | 1.5 s each (Brian guessed 1.54) | stereo 48 kHz |
| `warp_finish1–6.mp3` | 4.0 s each | stereo 48 kHz |

So the start and finish clips are 4 s, not the ~1.5 s the note assumed.
Brian (decided, same evening): **no trimming, no rate changes — the
clips play as recorded.** The shortest jump is one full play of start,
one engaged, and finish (4 + 1.5 + 4 = 9.5 s); longer jumps run the
engaged loop longer; the longest jump the tank allows is 12 s, and the
timed run's first leg — station to the Contested Zone on a full tank —
must be exactly that 12 s.

- **Time, not speed**: a jump's total time from H to arrival is
  `warpJumpMinS` 9.5 at `warpMinDist` (1,200), rising linearly to
  `warpJumpMaxS` 12 at `warpJumpLongDist` — set from `SECTOR_POIS` so the
  delivery run's station → Contested Zone leg lands on 12 s exactly
  (Sonnet measures the leg's travel distance and puts that number in
  CFG). Anything longer is still 12. `travel` is the distance to
  `warpDropout` short of the target, capped by the charge exactly as now
  (a jump past the tank still goes and drops out where the charge runs
  dry — unchanged from 1.10; its time comes from the shortened travel).
  The ship MOVES along the line every frame during the flight at
  `travel / flight time` (the map, beacons, and R's range all stay
  honest; the delivery clock already counts in warp); keys answer
  "Hyperwarp in progress." as now. `warpChargeMs` (the 2 s spool) goes
  away — the start clip IS the spool.
- **Minimum charge**: refuse under `warpMinChargePct` 25 %: "Warp core
  below 25 percent. Let it cool, or fly it." (replaces today's
  zero-charge refusal; the 1.13 alerts at 50/75 tell the pilot when it's
  coming back).
- **Engine type**: `warpEngine` 1–6, a CFG default of 1 today; a drive
  module chooses it later (A.5). Engine N plays `warp_startN`,
  `warp_engagedNr` looped, `warp_finishN`. **Accepted by default**: embed
  only set 1 in `audio_assets.js` now (~150 KB mono 48k 96k, the same
  pipeline as the laser clips); the other five stay on disk until a
  second drive exists — all 18 would add ~0.9 MB to a 2.2 MB file.
- **The sequence** for a jump of total time `T` (9.5–12 s): the start
  clip plays from the moment H is accepted, 4 s at its own rate; the
  ship departs when it ends; the engaged clip loops seamlessly from 4 s
  until `T − 4`; the finish clip plays its full 4 s and ends exactly at
  arrival. The engaged section is therefore `T − 8` seconds (1.5 s at the
  shortest jump = one play, 4 s at the longest) — its last repeat is
  simply cut with a short fade when the finish starts, never sped up or
  slowed. A dry drop-out is an arrival like any other: the finish plays
  its last 4 s before the charge runs out, then "Warp charge
  exhausted..." as now. The existing synth cues (`warp_charge`,
  `warp_arrive`, `warp_dry`) stay as the fallback when the assets aren't
  decoded; `warp_dry` still fires after the finish on a dry jump.
- Escape during a flight: see 1.18 — the menu opens, the warp KEEPS
  FLYING and sounding underneath it (Brian: decided — nothing hostile
  waits at the far end of a warp today), arrival speaks under the menu,
  Resume returns to the arrived ship.
- Help, KEY_DESCRIPTIONS (`h`), README warp paragraph, `I` ("Hyperwarp,
  N seconds to go.") all updated. CLAUDE.md's 1.10 bullet and the "warp
  drama" note in "Where we left off" get superseded.

#### 1.18 Escape opens the mission menu from open space or an encounter (ideas4)

- Today Escape = pause (masterGain ducked, sim frozen, "Paused."). New:
  Escape in the raw sim — open sector space or any encounter — opens
  the MISSION MENU over the live mission: sim frozen, audio ducked, the
  same freeze help/map/run log already use. **Exception, mid-warp
  (Brian: decided)**: the menu opens but the sim does NOT freeze — the
  warp flight and its sound continue, the ship arrives under the menu
  ("Hyperwarp complete..." spoken as now), and Resume returns the pilot
  to the arrived ship. Nothing hostile waits at the far end of a warp
  today, so an open menu during the flight is safe. A new
  first item **Resume** ("Back to the ship."); Escape again also resumes
  **(accepted by default)**. Choosing any mission item abandons the
  current one exactly as X does today (X keeps every current meaning:
  leave, return to the sector, cancel). Sound, Difficulty, Run log, Help
  work from there as now. The delivery clock stops while it's open (it
  already stops for menu/help/map).
- The separate "paused" state goes away — the open menu IS the pause,
  and the few "Paused." refusals (Shift chords, etc.) become the menu's
  own captured-key behavior. `over()` (won/lost) keeps its Enter/X flow.
- Overlays keep Escape as today: help, map, run log, Sound list close;
  the station menu undocks. Only the bare sim changes.
- The cursor lands on Resume when opened from a mission; at boot the
  menu still has no Resume line (nothing to resume) — build the item
  list with Resume only while a mission is live.
- KEY_DESCRIPTIONS (`escape`), help System line, README key row.

#### 1.19 Station by range, not corridor (ideas4) — supersedes 1.6

Brian: remove the landing corridor; use ranges for the communication
and landing zones. 1.6 stays in the record as built-and-superseded; the
docking-computer module idea from 1.7/A.5 goes with it.

- **Remove** the corridor entirely: `startDocking`/`updateDocking`/
  `dockOffsets`/`corridorFrame`/`abortToEntry`/`dockToneOn`/
  `scheduleDockTick`, the `docking` state, `dockAxis` on `SECTOR_POIS`
  and in `makeSectorRoster`, the `dock*` CFG block (keep nothing of it),
  the `dock_abort` cue (keep `dock_clunk`), the corridor help lines and
  README paragraph, `X` cancelling an approach, CLAUDE.md's corridor
  bullet and its tuning note. `docked`, the station menu, and
  `finishDocking`'s service/handover/influence all stay.
- **Two ranges per station**, both in CFG: `stationCommRange` 500 (=
  today's `poiInteract`) and `stationDockRange` 150. `C` inside comm
  range but outside dock range = a **hail**, no docking: "Meridian
  control: [influence greeting if earned] services ready — repair, rearm,
  chaff, fuel. Come within 150 to dock." (a short status, not the menu).
  `C` inside dock range = dock, instantly, `finishDocking` as today.
  No speed check **(accepted by default** — Brian said ranges only);
  the lock tick and "Locked. Distance N", plus R's range-with-closing
  from 1.15, are the landing instruments now.
- **Undock**: place the ship `stationDockRange + 100` out along the
  direction it arrived from (store the approach vector at dock time —
  `dockAxis` is gone), velocity zero, as today otherwise.
- Planet and the other points: unchanged (`poiInteract` stays for them).
- Test checklist: C at 400 hails, C at 120 docks, the delivery handover
  still fires on the dock, undock lands outside dock range, `X` in open
  space no longer mentions a corridor, no console errors.

#### 1.20 Lasers do double damage against ships at Rookie (ideas4)

Brian: "make lasers do 2x damage on enemy ships at this difficulty."
- A per-tier number, `laserShipMult` in `TIERS[].cfg` (Rookie 2,
  Veteran 1, Ace 1), multiplied into the ship branch of `beamTick` only
  (`dmg * L.hullMult * CFG.laserShipMult`); rocks and the per-laser
  `hullMult` character are untouched. Spoken damage numbers double with
  it, so the pilot hears the change.
- Rookie confirmed (Brian, same evening) — the tier he is testing at.
- Help (Weapons line about lasers), README combat paragraph, the
  Difficulty descriptions (`TIER_DESCS`) mention it.

### Phase 2 — a living sector, smarter enemies, the second resource

#### 2.1 Distress calls + rescue-and-tow (new, not combat/mining)

- Every `distressMinS`–`distressMaxS` (120–300 s) of open-sector flight a
  distress call may spawn 3000–6000 out: a temporary POI with an SOS beacon
  (three short, three long, three short, thin 1 kHz), announced once:
  "Distress call. Bearing 40 left. Q for the map." Fades after
  `distressLifeS` 240.
- Answering (C within 500) enters the **rescue encounter**:
  1. A survival pod within 800 transmits a weak intermittent signal that is
     not a normal target: no Tab, no radar. Loudness tracks distance only,
     no panning until within 250, then it snaps into HRTF. Finding it is
     warmer/colder by ear.
  2. Within 250 it becomes a target. It drifts at 10–20; **match speed**:
     within `towMatchDist` 60 with relative speed under `towMatchSpeed` 8
     for 2 s, narrated by a beat frequency that slows to zero as speeds
     match.
  3. `E` latches the tow ("Tow line secure."). Above `towMaxSpeed` 60 the
     line strains (rising creak), snaps at `towSnapSpeed` 75 ("Tow line
     parted."); re-latch by matching again.
  4. Within 500 of the station: "Pod recovered. Meridian control sends
     thanks, and 300 credits." Influence up.
- Gentle flying and listening, the opposite of combat. Variants later: a
  miner adrift (tow a core), a freighter under attack (combat, then tow).

#### 2.8 Loot containers and hydrogen (from A.3/A.4) — NEW

- A destroyed ship drops a container (target kind `'loot'`, a soft
  intermittent beacon at the wreck, drifts slowly, fades after
  `lootLifeS`). Fly within `lootPickupDist` 100 and `V` collects it:
  "Container: 40 hydrogen." Contents from a `LOOT` table by ship class.
- `hydrogen` joins ore in the hold and the `I` status; the hydrogen
  extractor module makes mining ticks yield it too. The station buys it
  (1.7). The quadrant jump is its real sink (Phase 4).

#### 2.2 Ship classes with different brains

`SHIP_CLASSES` table keyed from the roster:
- **Interceptors** (Raider, Scout): close-range laser attackers; strafe
  after every attack (reuse the evade code) so the pilot re-acquires them;
  prefer to attack while the pilot's shields are recharging.
- **Corvette** (Drone): pack animal; attacks only while another hostile is
  mid-attack or within 3 s after (two threats may overlap; cap 2, Rookie 1).
- **Cruisers** (Freighter, Cruiser): stand-off; missiles only from ≥ 700;
  back away if the pilot closes inside 500.
- Rookie keeps every class passive until hit; classes change HOW they
  fight, not WHEN.

#### 2.3 Adaptive commander (enemies that learn the pilot)

Not machine learning; tendencies the enemies read, updated per encounter,
saved in the profile. Code name `commander`.
- Tracked: mean shield reaction time after a lock warning; share of
  attacks shielded; mean laser engagement distance; laser-vs-missile kill
  ratio; mean shield hold; chaff usage rate.
- Rules (`COMMANDER_RULES`, thresholds in CFG): fast shield reaction →
  interceptor FEINTS (lock chirps with no beam, 30 %, then a real attack
  when the shield drops); shields most attacks → cruisers time missiles
  for the collapse/recharge, packs overlap more; fights close →
  interceptors strafe more, cruisers retreat earlier; relies on missiles →
  evade on LAUNCH at Veteran+; uses chaff often → missile pairs at
  Veteran+.
- Every rule has an audible tell (a feint's chirps are slightly detuned).
  Speech never explains the rule. Rookie: observes, applies only the feint
  rule at half rate.

#### 2.4 Gas clouds (new POI type)

"Nebula Gas Pocket Theta", soft broadband hiss beacon. 3–5 gas pockets
(kind `'gas'`) with a breathy HRTF voice. `V` harvests at 2× the dust rate;
gas sells at 3× ore. Lasering a pocket ignites it: flash-bang at its
position, hull damage 15 within 200, pocket gone. Missiles the same at any
range. The wrong tool hurts — and the right laser (A.2) matters here.

#### 2.5 Asteroid hazards

A rock faster than `rockDangerSpeed` 40 passing within `rockHitDist` 60
strikes the ship: hull damage by size and speed, a scraping crunch (UI bus)
plus the rock's own impact at its position. A rising proximity tone (UI
bus, panned toward it) from 300 in. Mostly a consequence of missiling a
medium rock at close range.

#### 2.6 Jump gate POI (sealed, now with a purpose)

"Jump Gate Tau": deep cyclic hum, periodic discharge. Calling it: "Gate
control: transit lane not commissioned. Hydrogen reserves insufficient."
It is the sector's exit and hydrogen's sink; opening it is Phase 4.

#### 2.7 Mining scanner

`N` scans the selected rock: sonar ping from the ship, echo from the rock
(HRTF), then "Iron. Rich." / "Ice. Lean." A hint, never a number — hidden
thresholds stay hidden. Later a module tells you which laser suits it.

### Phase 3 — teaching and hosting

#### 3.1 Tutorial shell (framework only)

`TUTORIAL_STEPS` `{ say, expect: { key | condition }, then }`; the runner
speaks a step, waits, advances; Escape leaves; a "Tutorial" menu item.
Three steps only (W, Tab, lock) until mechanics settle — the laser change
in 1.9 is exactly why the content waits.

#### 3.2 Hosting, second pass

Lazy-load the ship loops and new recordings over fetch on https (base64
stays for file://); a service worker for offline play; a share page. The
double-click file keeps working.

### Phase 4 — the strategic layer (direction only, no specs yet)

Quadrants and the universe map · opening the gate with hydrogen · the sun as
a hydrogen source · station influence into unions · flipping, holding,
developing, capturing quadrants · automated war · auto-governed stations
and planets · planetside resources, trade goods, hauling contracts · a
planet farm game · a local AI model writing news. Each becomes a phase with
numbered items when it's next; none of it starts before the demo is heard.

---

## Part C — Decisions

Decided (Brian, 2026-09-04): chaff wastes a round when nothing is
inbound; the mining scanner is in; Pages is the test reference; lasers are
fire-and-forget on slots 1–6 and **cannot be stopped**; **misses still
matter** (overheat stays on top of the cooldown); damage is a **per-tick
profile matched to the laser's sound**; the demo ships with **Mining_laser
1 (steady) and Mining_laser 2 (two heavy ticks, then steady)**; warp has a
tank measured in distance and the demo route is station → combat (one
tank) → mining (tank + ~500 flown) → station (tank + ~500 flown); the tank
refills in encounters and at the station; the ship window is **not for the
demo** and screens like it go on **function keys**; hydrogen gates
quadrants; modules have mass; **lasers are built first**; the single-file
demo is gone for good.

Decided (Brian, ideas3, 2026-09-04, questions answered the same day):
**`B` cycles the beacons On / Off / Target only** in-game (not a menu
item), the targeting tick works on points with beacons off; a `Sound`
menu item with a level per World / Cockpit / Effects (1.12); no
warp-core regen hiss — spoken 50/75/100 % alerts instead (1.13); laser
switching takes time, **per slot**, clips 3/4/5/1/2/6 on slots 1–6,
delays stretched into **1.4–3.2 s**, the clip **time-stretched to fit**
(1.14); R reads range, **Shift+R is the radar sweep**, Shift+T cycles
back, Shift+W is auto-thrust (1.15); build order 1.12 → 1.13 → 1.14 →
1.15 → 1.8.

Accepted by default (say otherwise): shields as a damage pool; credits and
modules persist across sessions; chaff on `D`; `G` refused during a
laser burst; slow warp regen in open flight so a dry tank never strands;
three sound levels per category (Off / Quiet / Full); the beacon setting
persists and is read back at sector entry when it isn't On; Shift+Tab
alongside Shift+T; any W or S press cancels auto-thrust.

Decided (Brian, ideas4, 2026-09-04 evening, follow-ups answered the
same night): chaff is instant and works during a burst or with shields
up (1.16); warp takes time — the recorded start / engaged-loop / finish
play at their own rates, untrimmed, the shortest jump is one full pass
of all three (9.5 s), the longest 12 s, and the timed run's first leg is
that 12 s; no warp under 25 % charge (1.17); Escape opens the mission
menu from the live sim, and mid-warp the flight continues under the
menu (1.18); the docking corridor goes — a station has a communication
range and a landing range, nothing else (1.19); lasers do double damage
to ships at Rookie, the tier Brian tests at (1.20).

Accepted by default (say otherwise), ideas4: Resume as the menu's first
item while a mission is live, Escape again resumes; no speed check at
the dock range; embed only warp engine set 1 now; the start clip is the
spool (the 2 s `warpChargeMs` goes); the engaged loop's last repeat is
cut with a short fade under the finish; undock along the arrival vector.

**DECIDE** (open): the real per-tick damage numbers for each laser — set by
Brian's ear after hearing each recording against its profile; the code
ships placeholders. The per-slot switch delays (three tie at 1.4 s) —
Brian hand-sets them in `SLOT_SWITCH` after hearing them. Nothing open
from ideas4 — all three follow-up questions were answered.

## Deferred (Brian: "not yet")

Enemy shields · subsystem damage sounds (no cue design yet) · nebula
muffling · full tutorial content · fully inert systems.

## Test checklist per item

- Every new key answers in every mode (silence is a bug), including docked,
  corridor, rescue, the station menu, and the ship window.
- F12 explore describes every new key; F1 help has a section per new
  mechanic; README key table updated.
- `window.__sim.state()` exposes the new state (lasers, warp charge,
  hydrogen, modules, corridor, tow, commander) and `poke` can force a
  distress call, drop a container, set credits, set the shield pool.
- localStorage blocked/absent → game still runs.
- Commit; push; wait for the Pages deploy; re-test at the URL; close every
  browser tab and stop the local server.
