# SPEC.md — Headless Space Sim

The one planning document. Merges the old PHASE_PLAN.md (near-term build
order, Rounds 11+) with Brian's ideas2 notes (the long-range game), because
the long-range shape decides things in the small playable parts now: what a
laser key does, what a warp costs, what the station sells, what "a module"
even is. Part A is direction — where the game is going, not build
instructions. Part B is the build plan for the playable demo, the thing
Brian wants to show people first. Part C is what's decided vs open.

Read `CLAUDE.md` first: every rule there (ear-first, CFG-only tuning, silent
testing, help + KEY_DESCRIPTIONS + README in sync, regenerate
`space_sim_demo.html`, commit + push each round, test at the Pages URL or a
local server) applies to every item below. Brian's ear decides all sound.

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
1.4 saved profile + run log, 1.5 no-warp zone, and the audio split
(`audio_engine.js` / `audio_cues.js`, see CLAUDE.md "Audio architecture").

Suggested order for the rest — lasers first because they change the feel
of the thing being shown, then the station because everything else hangs
off it:

#### 1.9 Laser slots and fire-and-forget (from A.2) — NEW

- `LASERS` data table; each entry `{ id, name, burstS, cooldownS,
  tickDamage, rockMult, cue }`. Starting ship: slot 1 a combat pulse laser,
  slot 2 a mining laser (both from the recordings once auditioned; synth
  placeholder until then). Slots 3–6 empty: "Slot 3 empty. Fit a laser at
  the station."
- Keys `1`–`6` select: "Slot 2, mining laser." Space fires the selected
  slot. Selection persists in the profile.
- Fire-and-forget: Space starts a burst of `burstS` (~5 s, ticks every
  `beamTickMs` as now, damage per tick from the laser's table), the beam
  carries its own live pitch-tracking voice as today, and it runs to the
  end. Then `cooldownS` before that slot fires again ("Pulse laser
  recharging, 3 seconds."), spoken on a refused press, never silent.
- **DECIDE**: does the miss-overheat (two empty bursts → 5 s down) stay as a
  penalty on top of the cooldown, or does the per-laser cooldown replace
  it? Recommendation: keep both — cooldown is the cost of firing, overheat
  is the cost of firing badly.
- **DECIDE**: can a burst be cancelled early (Space again) with a penalty,
  or is it truly locked in? Recommendation: locked in at Rookie; a
  "beam cutoff" module allows cancelling later.
- Enemy beams are 5 s already; a 5 s player beam changes the duel's rhythm
  — flag for the play-test.
- Help, KEY_DESCRIPTIONS (1–6), README, and the `I` status ("Slot 2, mining
  laser, ready") all updated.

#### 1.10 Warp charge (from A.3) — NEW

- `warpCharge` 0–`warpTankMax` (100). A jump costs `distance /
  warpUnitsPerCharge`; the drive refuses under cost: "Insufficient warp
  charge, 30 percent. This jump needs 45." Regen `warpRegenPerS` in flight
  with an audible core-cooling hiss on the UI bus that fades as it fills;
  full refill at the station (1.7). Starting tank reaches roughly one long
  jump; the tank and cooling are modules.
- `I` reads charge; the map lines read each point's jump cost.
- The delivery run's clock now has a fuel dimension — flag for the
  play-test whether the starting tank makes the run feel strategic or
  merely slow.

#### 1.6 Docking approach (the corridor)

The station is entered by flying a corridor, not by pressing C at 500. This
is deliberately the HARDEST version now; a docking-computer module loosens
it later.
- Calling the station (C within `poiInteract`) answers "Meridian control:
  cleared to dock. Approach corridor active." and starts the approach.
- Corridor = a line from a point `dockCorridorLen` 800 out to the station
  door, on a fixed heading per station (data on `SECTOR_POIS`). Instruments
  on the UI bus, NOT HRTF (a cockpit instrument, like the tick):
  centerline tone panned by lateral offset (off to the right = tone on the
  left = turn left, the tick's convention; dead center = mono); glide slope
  as that tone's pitch (up = high); range as a click rate quickening toward
  the door; over `dockMaxSpeed` 25 inside the last 300 = "Too fast. Abort."
  and a reset to the corridor entry (no damage yet).
- Success inside `dockRadius` 40 at ≤ `dockMaxSpeed`: docking clunk,
  "Docked at Station Meridian.", the station menu opens. Ship held; thrust
  keys answer "Docked. Undock from the station menu."
- Coaching every ~3 s in the corridor: "Left 40, high 10, range 500"
  (round10), silent when centered. All numbers in CFG.

#### 1.7 Station menu (the economy hook)

A KC-style list — make `listMenu(items, opts)` reusable so the mission menu,
station menu, run log, ship window, and every future menu share one
implementation.
- Items: Sell ore · Sell hydrogen · Repair · Rearm · Restock chaff · Refuel
  · Modules ▸ · Undock.
- **Sell**: `orePrice` 1 credit per 10 ore, `hydrogenPrice` (placeholder).
  Speaks the sale and the balance. The delivery-run handover is the ore
  sale (quota met → run complete when sold).
- **Repair / Rearm / Restock / Refuel**: credits (`repairCost` per hull
  point, `missileCost`, `chaffCost`, `refuelCost` per charge point). In the
  delivery run the FIRST repair+rearm+refuel is free (the clock is the
  cost); everything else costs.
- **Modules ▸** (from A.5): `MODULES` table `{ id, name, group, mass, cost,
  effects }`. First list: shield spool 1.5 → 1.0 s; shield pool +50 %;
  missile rack 8 → 12; the second and third lasers (from `LASERS`); warp
  tank +50 %; core cooling ×2; thruster upgrade (offsets mass); hydrogen
  extractor (mining ticks also yield hydrogen); docking computer (widens
  the corridor, Phase 2). Each line speaks price, mass, and whether you can
  afford it. Owned modules live in the profile and apply at boot; mass
  feeds thrust/turn.
- **Influence** (from A.6): `profile.stations[id].influence`, raised by
  delivery, combat clears at that station's zone, sales, rescues. Spoken
  on docking ("Meridian control. Good to see you again, pilot." past a
  threshold). No consumer beyond speech and a price break yet.
- **Undock**: pushes the ship 100 out along the corridor heading, "Undocked.
  Clear of the station." Escape = Undock.

#### 1.11 Ship window (from A.5) — NEW, small

- A browsable overlay (same shell as the run log): hull, shields, warp
  charge, hydrogen, ore, credits, missiles, chaff, then one line per slot
  ("Slot 2, mining laser", "Drive: standard tank"), total mass. Escape
  closes. **DECIDE** the key — recommendation `A` ("all systems"), free
  under the left hand; Menu gets a "Ship" item too.

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

Decided (Brian): chaff wastes a round when nothing is inbound; the mining
scanner is in; Pages is the test reference; lasers are fire-and-forget on
slots 1–6; warp has a tank; hydrogen gates quadrants; modules have mass.

Accepted by default (say otherwise): shields as a damage pool; credits and
modules persist across sessions; chaff on `D`.

**DECIDE** (open, ask before building):
1. Lasers — miss-overheat kept on top of the per-laser cooldown, or
   replaced by it? (Rec: keep both.)
2. Lasers — can a burst be cut short, and at what penalty? (Rec: locked at
   Rookie, a module later.)
3. Starting loadout — which two lasers, and burst/cooldown numbers for
   each? (Rec: pulse 5 s / 4 s cooldown, mining 5 s / 2 s.)
4. Warp tank — starting reach in jumps, regen rate. (Rec: one long jump,
   full regen ≈ 3 minutes of flight.)
5. Ship window key. (Rec: `A`.)
6. Phase 1 order — 1.9 lasers before the station, as suggested, or the
   station first?

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
- Regenerate `space_sim_demo.html`; commit; push; wait for the Pages deploy;
  re-test at the URL; close every browser tab and stop the local server.
