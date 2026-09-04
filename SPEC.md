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
Brian's ideas3 notes (2026-09-04) are folded in as 1.12–1.15 below.
Suggested order for the rest — 1.12 sound options first (Brian needs the
beacons-off switch for his own listening, and it makes Claude's machine
tests silent for him), then 1.13–1.15 (small, one commit each), then 1.8
chaff, then 1.11 ship window if Brian wants it before Phase 2. **DECIDE**:
that order (Part C).

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

#### 1.8 Countermeasures (chaff)

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

#### 1.12 Sound options: beacons off, a level per category (ideas3)

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
- Categories:
  - **Beacons** — the four POI voices in the sector (`buildPoiVoice`,
    `poiGain`). The specific ask. Off = silent; Tab, T, Q, and the lock
    tick still find every point. **DECIDE**: at Off, does the SELECTED nav
    target's beacon stay audible (the homing case), or is Off all four?
  - **World** — everything HRTF: ship engines, rocks and dust, enemy
    chirps/beams/missiles, explosions at a position. Needs one engine
    change: a `worldBus` gain in `audio_engine.js` between the panners
    and `masterGain` (panners connect straight to `masterGain` today,
    `makePanner`); Beacons sit inside World, so both scale them.
  - **Cockpit** — the UI bus (`uiBus`): lock tick, thrusters and
    stabilizers, tools, shield hum, overheat hiss, docking instruments.
  - **Effects** — the discrete cue registry (`SIM.cues`): menu clicks,
    chimes, warnings, explosions, the fanfare. A gain multiplier inside
    `SIM.cues.play`, so it stacks with whichever bus the cue lands on.
- Testing rule (now in CLAUDE.md): every machine-test script sets Beacons
  off first thing after boot, live and unsaved (`__sim.poke({ sound: {
  beacons: 0 } })`), so a leftover targeted point never sounds on Brian's
  side. `poke` never calls `saveProfile`.

#### 1.13 Warp core: spoken charge alerts, no regen hiss (ideas3)

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

#### 1.14 Laser switching takes time, timed by the switch recordings (ideas3)

- Six recordings, `audio/weapons/lasers/laser_switch1–6.wav`, measured
  from their WAV headers 2026-09-04: 1 = 2.023 s, 2 = 2.666 s, 3 = 2.164 s,
  4 = 2.027 s, 5 = 2.297 s, 6 = 2.023 s. Light → heavy by length: 1 ≈ 4 ≈
  6 (2.02), 3 (2.16), 5 (2.30), 2 (2.67). Brian: the shortest clip is the
  lightest laser and switches fastest; the variance is too small, so the
  lightest laser's delay goes SHORTER than its clip and the heaviest
  LONGER, for a better spread.
- Each `LASERS` entry gets `switchAsset` (which of the six) and `switchS`
  (the delay). Proposal: `switchS` from the clip length stretched about
  the middle — `mid + (clipLen − mid) × CFG.laserSwitchStretch`, stretch 3
  puts the lightest near 1.4 s and the heaviest near 3.3 s — or hand-set
  per laser once Brian has heard them. Either way the number lives in the
  table, not inline.
- Pressing 1–6 starts the switch: the clip plays on the UI bus (a cockpit
  sound), "Slot 2, mining laser two, switching." Space during the switch
  is refused like a cooldown: "Switching lasers, 2 seconds." At the end:
  a ready cue and "Mining laser two ready." Delay shorter than the clip:
  the clip fades out at the delay **(accepted by default)**. Delay longer:
  the clip plays, then silence until ready — **DECIDE** whether to
  time-stretch the clip to fit instead (which pitches it).
- Re-selecting the current slot: no switch, no delay. Switching mid-burst:
  refused, the burst can't be stopped (1.9). Switching to an empty slot:
  today's refusal, no delay. The `I` status reads "switching, N seconds."
- The six wavs get decoded into `audio_assets.js` (mono 96k MP3 like the
  rest, ~25 KB each). **DECIDE**: which clip goes with which of the 16
  lasers (8 Mining, 8 Rapid-pulse) — only `mining1`/`mining2` need one
  for the demo.

#### 1.15 Keys: R = range, Shift+T cycles back, Shift+W auto-thrust (ideas3)

- **R reads the range to the current target**: "Range 430, closing." —
  the distance and whether it's closing or opening (the sign of the range
  rate; a docking and tow instrument later). No target: "No target
  selected. Tab cycles targets." R today is the radar sweep (every
  target, nearest first, `radarPing`). **DECIDE** where the sweep goes —
  proposal Shift+R.
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

Decided (Brian, ideas3, 2026-09-04): a main-menu switch for the POI
beacons plus per-category sound levels (1.12); no warp-core regen hiss —
spoken 50/75/100 % alerts instead (1.13); laser switching takes time, set
by the switch recordings' lengths with the variance stretched (1.14); R
reads range; Shift+T cycles back; Shift+W is auto-thrust (1.15).

Accepted by default (say otherwise): shields as a damage pool; credits and
modules persist across sessions; chaff on `D`; `G` refused during a
laser burst; slow warp regen in open flight so a dry tank never strands;
three sound levels per category (Off / Quiet / Full); Shift+Tab alongside
Shift+T; any W or S press cancels auto-thrust; a switch clip fades at the
delay when the delay is shorter than the clip.

**DECIDE** (open): the real per-tick damage numbers for each laser — set by
Brian's ear after hearing each recording against its profile; the code
ships placeholders. From ideas3: the radar sweep's new key (Shift+R?);
which switch clip goes with which laser, and the stretched delay range;
pad-with-silence vs time-stretch when the delay is longer than the clip;
whether the selected nav target's beacon stays audible at Beacons off;
and the build order — 1.12–1.15 before chaff (1.8)?

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
