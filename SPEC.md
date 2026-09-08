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

### A.6 Stations: favor, control, the three ranges (Brian, 2026-09-04 night)

- **Stations are the gate to the macro game.** A station exists to
  **serve** something in its quadrant — a planet, the jump gate, later an
  anomaly — and wants what that thing needs. Bring it and the station
  warms to you; hold enough of them and the next stage of the game opens
  (A.13).
- **Two meters per station** (Brian's answer, Phase 3 questions):
  **favor** (0–100) is the station's opinion of you — earned by
  missions, rescues, selling what it wants, feeding its planet's
  biomass to it; lost by failure, by hurting what it protects, and by
  slow decay in your absence. Favor **tiers** gate what you may do:
  Unknown, comms only → Known, the transporter → Trusted, docking →
  Allied, a price break, the good missions, and the right to Invest.
  **Control** (0–100) is your *share* of the station against the
  quadrant's named unions — bought at Allied with the resources it wants,
  eroding slowly toward the unions unless you keep feeding it.
  Controlled at a majority: the station docks you free, pays a tithe in
  credits and its resource, counts toward union play, and — once every
  station in the quadrant is yours — makes comms quadrant-wide.
- **Three ranges**, replacing the two of 1.19: **comms** (far — talk:
  the greeting, prices, what it wants, accept missions), **transporter**
  (middle — hand over: turn in, sell, buy, rearm, invest; cargo beams
  across), **docking / landing** (near — land: repairs, refits, the
  shipyard, the interior). Each is gated by a favor tier and extended by
  shipyard modules and by favor itself. Why a veteran still hails from
  far out: comms is where work is taken and prices are read, all game
  long.
- **Home**: Station Meridian starts Trusted; everyone else starts
  Unknown. The delivery run's fixed sector runs none of this.
  **Superseded (Brian, ideas10, 2026-09-05): nobody starts at 40** —
  Meridian is a stranger too; every station is Unknown until earned.
  Trusted is *permanent* once reached (favor never drops below 40), and
  decay doesn't start at all until Allied — it only ever pulls a pilot
  from Allied/Honored back toward Trusted. The "stranger gate" at any
  station is one combat encounter *or* 20,000 ore donated — the initial
  hold (3.14) — so the best players can clear quadrant 1 in one fight,
  carry a full hold through the gate, and buy their way past the
  stranger gate in quadrant 2 at once. Choices, not one path.
- Long game (unchanged): control enough stations to form a **union**;
  quadrants end up in unions; the player flips, holds, develops, or
  captures quadrants; an automated war runs; a small local AI model
  writes news. Planets and stations can be controlled and
  **auto-governed** so resources collect without micromanagement once the
  empire is big. Possibly a farm game on planets. Built in Phase 3 (3.23,
  3.11, 3.19, 3.22) as far as one quadrant and the frontier beyond it.
- **Favor, second pass (Brian, ideas9, 2026-09-05, after reading 3.23 as
  built).** Five tiers now, and every tier past Known widens the ranges:
  Unknown (0) comms · Known (10) the transporter · Trusted (40) docking
  and **+25 %** to all three ranges · Allied (70) **+50 %** ranges, the
  price break when 3.20 exists · **Honored (90)** +50 % ranges, **25 %
  off purchases**, likely unique or bonus items, and decay **halved**.
  **Favor never goes below 40 once reached** — Trusted is a floor, not a
  tier you can fall out of (replaces "one tier below the peak"). Decay is
  only ever in *absence* — no sale, mission, donation, or hail there —
  and slows with the empire: 1 per play-hour of absence, 0.5 past
  Honored, 0.4 when every station in the quadrant is controlled, 0.25
  when controlled quadrants touch. Missions pay **twice** what 3.23
  gives; selling what a station wants pays **1 per 500 ore** (200 was
  "too big a jump"); clearing the quadrant's Contested Zone pays favor
  at the nearest station; and a pilot can **always donate ore** to a
  station, at any tier — the way a stranger becomes Known without a
  mission. A new quadrant is meant to be *entered*, not courted: pick an
  encounter POI at once; beating the combat one grants **quadrant-wide
  comms** (hail any port from anywhere in that quadrant).
- **Control, rethought (ideas9).** Brian is questioning the share-vs-
  unions model: favor unlocks *benefits*; control is **earned by
  investing** in a station or planet, and what it gives back is
  **passive production** — the resources a base will need, collected
  without micromanagement. Stations have **levels** (donating 15,000 ore
  goes into levelling one); each resource a station produces has a
  production unit that makes it per play-hour into a **holding bay**
  that fills and stops (bigger with level, so fewer visits); the pilot
  collects within transporter range; eventually automated shuttles
  collect for them. Selling ore straight for credits, donating it for
  favor, or sinking it into a station's level is the strategic choice
  at every landing. Production is **not** in the first quadrant; in the
  second, every POI **produces two things and wants two things**, so a
  trader earns a side income by travelling (this collides with the
  Frontier as specced in 3.22 — DECIDE, Part C). Unions form at **10
  controlled stations** and gate the base; a broken union stops base
  work until mended. Open: the total station count that makes 10
  reachable, and whether the computer starts with two unions the
  player must break (Phase 4/5, Part C). The share/tithe/erosion model
  stays on paper as an option, not a plan.

- **A stats page outside the shell (Brian, ideas12.txt, 2026-09-05 —
  discussion, not yet a build).** Game stats in real HTML tables on a
  standard page, for native screen-reader table navigation the aria-live
  single voice can't give. Brian: "do not just do this, we need to
  discuss as this takes us out of the keyboard input trap and on to a
  standard web page." The Sound Lab already set the precedent (a real
  navigation from the menu, Back returns); the profile in `localStorage`
  is the data; the real work is the counters that don't exist yet. See
  3.47 for what it could show today, what it can't, and the five
  questions to settle first.

### A.13 Quadrants, gates, and the road to the galactic map (Brian, 2026-09-04 night)

- **Quadrant 1 is the opening** — the hand-authored home quadrant of
  A.10, where the favor game is learned. **Quadrant 2 is the Frontier**:
  no ports, richer fields, one anomaly, a gate back and a sealed gate
  onward — where the next mechanics live (the anomaly instance first;
  Brian has more in mind). The **galactic map and union play open only at
  the gate after Quadrant 2** — pass it and Phase 4 begins.
  **Revised (Brian, ideas10, 2026-09-05):** three quadrants, each a
  step. **Quadrant 1** — favor, missions, mining, combat, the contract;
  no trading. **Quadrant 2** — the economy: ports with prices, wants,
  production (every POI produces two, wants two), planets as ports,
  hauling; still safe, no control. **Quadrant 3** — control and rival
  unions on the same schema, where Phase 4 begins. The gate out of 1
  opens at Known, so a strong pilot can be in 2 after one fight with a
  full hold to buy their way in.
- A pilot leaves Quadrant 1 early: the gate opens **once any station
  trusts them**, for a hydrogen fare. Support — favor and control — is
  gathered quadrant by quadrant; nothing at the galactic scale is
  needed to travel, only to *play* the union game.
- **Anomalies** are a POI kind with an instance of their own, the way
  combat zones and asteroid fields are: a vortex storm (Brian's vortex
  recordings orbiting a hidden core), a derelict hulk, a gas-pocket field
  (2.4). A station can serve one — research wants hydrogen, pays favor
  for readings taken inside. Specified as a kind in Phase 3; the first
  instance is built when its sound exists.
- Time is game time everywhere; every quadrant keeps its own saved
  state; favor and control are per station, so per quadrant by nature.
- **The galactic map is 3D and browsed by ear** (Brian, ideas8,
  2026-09-05). The quadrant map stays the flat spoken list it is — this
  is a *new* map, opened at the gate after the Frontier, that lays the
  quadrants out with real elevation: a **sound cursor** the arrows steer
  through the field (azimuth, elevation, distance), each quadrant
  sounding at its true bearing from where you are, and Enter on whatever
  is centred sets the destination and jumps. Elevation is meant to
  *mean* something strategically — travel cost, territory, or a rule
  not yet chosen (DECIDE, Phase 4). Confirmed possible on the present
  engine: it is the Position Explorer (L.1) plus the listener
  orientation the game already sets every frame. L.1 is its prototype;
  the lab's elevation demos are how Brian finds out how much height the
  ear can carry before the galaxy is given any.
- **The cursor is a grid, not a compass (Brian, ideas9).** Having heard
  L.1's idea, Brian's picture of the galactic map is a **3D coordinate
  grid** the cursor steps through: arrows for up/down and left/right, W
  forward, S back, and the **coordinates spoken** as it moves, so the
  cursor is always on a grid point — not the polar azimuth/elevation/
  distance steps L.1 has now. "If there are other ways to do this
  better, I am open." L.1b in the lab is where that gets tried.

- **The lattice (Brian, ideas11.txt, 2026-09-05 — proposed, awaiting his
  answers in Part C).** The galactic map is a **9×9×9 grid of which the
  quadrants occupy a 3×3×3 lattice** — one quadrant every third cell on
  each axis, up to 27 — and travel is only along the lattice lines, the
  "established space routes": a **gate is an edge** of the lattice, so a
  corner quadrant has three gates, an edge four, a face five, the centre
  six. The two cells between neighbouring quadrants on a route are
  **waypoints** — where route encounters live (the old Frontier's
  "anomaly" becomes a waypoint kind), or nothing. The cursor is L.1b's
  grid cursor exactly: an unshifted press moves a whole quadrant (three
  cells), Shift moves one cell, coordinates spoken as now, and it
  **refuses to leave a route** — nine stops along any one line. Up to
  **eight opposing factions** start in the other corners (a ninth at the
  centre is Brian's own maybe). **This reconciles with ideas10's three
  quadrants rather than replacing them**: Q1 (home, no trading), Q2 (the
  economy), Q3 (control) are the three quadrants of ONE lattice edge —
  cells 0, 3, 6 along the home route — so everything specced for them
  stands, and the other 24 are Phase 4/5 content generated from the same
  template. What it changes: A.13's "galactic map opens at the gate after
  Quadrant 2" is unchanged; the Frontier's anomaly moves to a waypoint;
  "how many opponents" (open since ideas9) gets its ceiling — eight — and
  should be a difficulty setting, not a fixed number. Written as
  direction here; the buildable pieces are Phase 4's (see Part C, the
  ideas11.txt review).
  **Revised the same day — "our cube" (Brian, 2026-09-05).** Q1 IS a
  corner (decided). And the lattice shrinks: a **3×3×3 cube whose eight
  CORNERS are the quadrants** — no 9×9×9 underneath, no quadrants on the
  edges, faces, or centre. 27 (or the 26 he'd keep on the faces) is
  "a lot of quadrants to explore control whatever"; more to the point,
  "I do not want quadrants to ever feel the same or they will get very
  boring" — eight can be hand-authored, each unmistakable by ear (a
  star, a field mix, a station count, a signature recording — the
  pulsar and space_loop candidates on disk are exactly this), which 27
  generated ones never would be. Each quadrant holds **more stations
  than today's two** (four to six — DECIDE). The **twelve edges are the
  routes**; the cell at each edge's midpoint is its one **waypoint**
  (encounters, the anomaly, a lone outpost — or nothing); the six face
  centres and the centre are travel space at most, "not controllable
  area, or at least not quadrants" — Fable's suggestion: keep them
  unreachable for now and **reserve the centre for A.8's base**, the one
  place in the cube every corner is equidistant from. A corner has three
  edges, so **three neighbours**: Q2 (the economy) and Q3 (control) are
  two of Q1's three neighbours, the third a later quadrant — ideas10's
  three tiers survive as three corners instead of three cells of one
  edge. The galactic cursor is simpler than the lattice needed — three
  positions per axis, only corners and edge midpoints valid, one press
  a corner and Shift a midpoint. Travel gets faster "once the game gets
  more macro" and **jump distance is the edge**: one hydrogen fare per
  edge, the warp tank still for flying within a quadrant. Opponents:
  seven other corners is the ceiling, but seven rivals in eight
  quadrants is one per quadrant — the count should be a difficulty
  setting with most corners **unaligned**, quadrants to win. Expansion
  later is the cube's own outer shell, or a second cube — the
  buildable shape is the same either way. What this changes in the
  spec is listed in Part C under the ideas11.txt review.
  **The cube's coordinates, spoken (Brian, 2026-09-05).** Decided:
  stations per quadrant are unique, part of each corner's character;
  the centre is for bases; faces and centre are unreachable for now.
  The frame: the cube seen from one face is the game's default view,
  the **centre is the origin**, and every cell is spoken as up to three
  words in a **fixed order — vertical, lateral, depth**: "1 below" /
  "1 above", "1 left" / "1 right", "1 behind" / "1 ahead" — **a zero is
  not spoken**. Brian's own example: from the origin, Left gives "1
  left"; Down then gives "1 below, 1 left"; S then gives "1 below, 1
  left, 1 behind" — which is **home**: the player starts in the
  bottom-left-behind corner. Home's three neighbours are therefore
  "1 below, 1 right, 1 behind", "1 above, 1 left, 1 behind", and
  "1 below, 1 left, 1 ahead" — which of those is Q2 and which Q3 is open
  (Fable's proposal: Q2 is "1 right", the natural first move on the face
  you're looking at; Q3 "1 above"; "1 ahead" the third, later). The
  number stays even though every nonzero value is 1 in a 3-cube — it
  costs one syllable and survives an expansion. The same words should
  replace L.1b's "up/forward" in the lab so there is one vocabulary.
  **The cube in the quadrant — gates are semi-realistic (Brian's
  question, Fable's answer).** Every other POI orbits the star
  (`ringPos`, `degPerHour`); a gate does not. A gate is infrastructure
  anchored to its route, not a body — so each of a corner's three gates
  is **fixed** (`degPerHour` 0) on the outer ring **in the direction of
  the edge it serves**, in the quadrant's own frame: the gate to the
  neighbour "1 right" sits on the quadrant's right, the gate to "1
  above" sits **above the star's plane** — a genuinely elevated POI,
  which the ear already handles (bearings speak "high"/"low", the tick
  pitches) — and the gate to "1 ahead" sits ahead. Three gates per
  corner, not one hub with a menu (Fable's earlier suggestion,
  withdrawn — a menu teaches nothing; a gate you have to climb to
  teaches the map). Arriving through a gate puts you at the neighbour's
  **matching** gate — leave by the right-hand gate, arrive at the
  left-hand one, the new star now ahead of you — so the geometry of the
  cube is felt from inside every quadrant. The one mapping lives in one
  table (`CUBE_AXES`: which world axis is "right", "above", "ahead"),
  shared by the gates' placement, the galactic cursor's words, and the
  arrival point. L.9's lighthouse cone finally makes sense on a fixed
  gate — a beacon marking a route, sweeping.
  **The one reachable non-corner: the near face's centre, from Q2 only
  (Brian, 2026-09-05).** Of the 26 cells, exactly one that is not a
  corner can be travelled to — the centre of the facing plane, "1
  behind" — and only from Q2, never from home or any other corner. It
  is a protected place: the only door is in Q2, so whoever holds Q2
  holds the door, and it sits beside home without a route from home —
  "this kind of protects it and the player's home quadrant, and we can
  do special things in there." The geometry: a face centre is not
  adjacent to any corner (two cells away, across the face), so this is a
  **spur off the lattice, not an edge** — Q2 gets a **fourth gate**, the
  cube's only off-axis one, on Q2's outer ring in the direction of the
  face centre (up-and-left from Q2: "1 above, 1 left" in Q2's own frame),
  its oddness on the map the tell that it leads somewhere special. The
  place itself has one gate back, to Q2. Cursor rule amended: the six
  face centres are view positions, EXCEPT this one, which is a
  destination — Enter travels there only while the pilot is in Q2;
  from anywhere else, "Reached only from [Q2's name]." Rival factions
  never enter (the door is the pilot's — a favor or quest gate at Q2's
  station, DECIDE), so it can be genuinely private. What it IS is open
  (Part C): Fable's proposal is the pilot's mid-game harbour — storage
  beyond the hold, a free yard, where saved things live — the base at
  the cube's centre staying the endgame.

  **Waypoints as outposts, and jumps by distance (Brian, ideas13.txt,
  2026-09-06).** Two additions to the cube, one confirmed and one
  postponed. (1) **Postponed** — the twelve edge midpoints as
  controllable outposts (held, a waypoint produces something; decays
  unless the corners at both its ends are held, ideas11's "cut-off
  erodes control" given shape). Brian: "postpone." Stays open, no
  numbers, revisit alongside 3.23b's own control work. (2)
  **Confirmed** — **travel is by manhattan distance, not one fare per
  edge**: from home a pilot may jump to any valid cell within their
  jump budget, one hydrogen unit per cell (an edge is 2, a face's
  diagonal 4, the far corner 6). Brian: "you are right." Reconciled
  with the three fixed gates per corner as: **the gate is which way you
  leave, the map is how far** — fly to the gate on the first axis of
  the path, pick the cell on the map, the network does the rest. This
  supersedes "one hydrogen fare per edge" above. Not yet built — lands
  with 3.22/quadrant 2, alongside the gate work itself.

### A.14 The sound lab as the HRTF laboratory (ideas_crazy_7, 2026-09-05)

The lab stops being only a list of every sound and becomes the place
the spatializer itself is put through its paces, one perceptual trick
per demo: a sound you place anywhere (L.1), eight vortices you shape
individually (L.5), planes on routes and stunts (L.4), a room you turn
in and are tested on (L.8), a directional source (L.9). Two rules: a
demo never changes the game by itself — anything that graduates gets
its own numbered item — and every new asset is auditioned here first
(the gate's lighthouse in L.9, the station recordings in 3.31), so
Brian hears a thing in isolation before he meets it in flight.

### A.7 What stays true at every scale

Ear-first, one live region, left-hand keys, silence is a bug, hidden
mining thresholds never spoken, every attack telegraphed, every rule has an
audible tell. The strategic layer is menus, maps, and speech — the same
widgets the mission menu, quadrant map, and run log already are.

### A.8 The endgame: the base, and bases at war (ideas5, 2026-09-04)

- The player's long game is building a **base**: a Death Star, a hollowed
  rogue moon, a mined-out asteroid, whichever construct — the type sets
  some of the base's attributes, but every base is the same kind of thing:
  a resource generator, a home, and eventually a combatant.
- The endgame is **base against base**: a new combat sim where the player
  controls a station with small fleets, a galactic battle rather than a
  dogfight. Not designed yet beyond this sentence; it's what every
  resource below is ultimately FOR, so the resource ladder (A.9) is built
  with a base as its sink.
- Winning = a base that outlasts the others. Everything before that is
  gathering the five resources and the influence to build and defend it.

### A.9 The resources (ideas5)

Six resources (ore, and five special ones), each with an activity that
produces it and a sink that wants it, so where a player spends their
hours is a strategic choice:

| Resource | Comes from | Spent on |
| --- | --- | --- |
| Ore | Mining any rock | Credits at a station |
| Reaction mass | Ice rocks, station fuel, small combat drops | Thrusters, braking, stabilizers (A.10) |
| Alloy | Iron rocks | Modules and lasers that need metal, later the base |
| Hydrogen | Combat containers, a hydrogen-extractor module | Quadrant jumps, later the base |
| Salvage | Combat kills only | Modules and lasers that credits alone cannot buy |
| Biomass | Planet agriculture, later | The base's crew and production |

- **Levers**: each sellable category carries a saturation number. Selling
  into it pushes its price down; the number decays over play time, so a
  neglected category drifts back above base price. A combat-only player
  still wins, but every kill's salvage is worth less the longer they go
  without mining, so they need more kills — more effort in one category
  beats the balanced player's spread only with more total effort.
- **Gates**: some modules need salvage, so even the most mining-focused
  pilot fights a little. For them, "super easy" combat — targets that
  don't fire back, harder to hit as tiers rise — is offered only by a
  friendly station (influence past the threshold), costs mined resources
  to accept, and is rate-limited per station, so nobody farms it.
- Every resource is a line on the F3 resources screen (A.12).

### A.10 The quadrant is a solar system (ideas5)

- A quadrant has a star at its center, two or three planets on orbits,
  two or three stations each with its own market, one jump gate, ONE
  active combat zone, and one to three asteroid clouds — about ten points
  of interest. Combat zones appear at different places over time and
  clouds DRIFT on orbits like real asteroids, so travel inside the
  quadrant has value and the warp tank module matters.
- Instance rules (Brian): one combat zone active at a time; when it's
  cleared and exited, it disappears from the map and a new one spawns
  elsewhere. One to three clouds; a depleted cloud disappears on exit and
  a new one spawns so there is always at least one.
- The spawn rules that keep it flyable against the warp tank (Phase 3,
  3.10 has the numbers): a replacement spawns 5,000–11,000 from the pilot
  at that moment (one clean jump — leaving any encounter refills the
  tank), at least 4,000 from any other point, and within 11,000 of at
  least one station, so fuel and a market are always in reach. The
  quadrant is 16,000 in radius — two to three tanks edge to edge, so a
  crossing needs a station stop or a regen wait.
- Stations differ: each has its own market demands, met by the player's
  supply and simulated so prices diverge — a reason not to fly to the
  same station every time. Planets, until agriculture exists, are
  second markets buying certain things at better prices. F4 is the
  trading screen (A.12).
- **Time is game time**, never wall-clock: play seconds that don't advance
  in a menu. Markets, respawns, and drift all run on it. A pilot who saves
  for the night comes back in the morning to exactly what they left.
- The timed delivery run keeps today's FIXED layout — its legs are
  hand-tuned. The moving world belongs to the open campaign.

### A.11 Death: the tug (ideas5)

- A lost ship is **rescued by a tug** from the nearest station: a wait in
  game time, spoken as a countdown, then the pilot is back at the station
  with the hull repaired. Cargo survives. The wait is the penalty and it
  is never crippling.
- Levers on the wait: credits buy a shorter ride; influence at that
  station shortens it for free; experience later. An experienced, liked,
  funded pilot barely notices; a broke first-timer waits the full base
  time. The delivery clock keeps running through it.
- Training drills (Combat training, Mining from the menu) keep today's
  instant Enter-to-retry — the tug is a campaign thing.
- **ideas10.txt (2026-09-05):** pilots start with 100 credits and the
  50-credit rush is repeatable — each payment halves what's left, so a
  fresh pilot can buy two. And the wait teaches: the countdown reminds a
  lost pilot that F2 reads the ship and F3 the hold (F4 once it exists).
  Built as 3.35.

### A.12 Screens (ideas5)

Function keys, the way F1 is help: **F2 ship** (attributes, slots with
each laser's matchups in words, modules, mass), **F3 resources** (one
line per resource and what it's for), **F4 trading** (prices at the
station you're hailing, and what it wants). All browse line by line like
the run log, Escape closes, F12 describes them. The ship's six
attributes — hull, shield pool, reaction mass, warp charge, cargo, mass —
are what every module and laser adjusts; battery mode is a flat fraction,
not a seventh attribute. Also planned: a verbosity setting in Sound for
pilots who want fewer spoken numbers, and a journal — a browsable log of
the session for when a line got talked over. Tutorials are several and
contextual: the first time a pilot leaves a quadrant, opens the galactic
map, lands on a planet, docks — not one long lesson (Phase 3).

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

#### 1.11 Ship window (from A.5) — moved to 2.13

- Brian deferred it past the first demo; ideas5 brought it back as the
  F2 ship screen, because sixteen lasers need somewhere to be explained.
  Built as 2.13, with F3 resources beside it (2.15).

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
only, Brian's follow-up answers folded in the same night — see Part C).
Suggested order — 1.19 first (a removal, it unblocks every docking
test), 1.20 (one number per tier), 1.16 (a test, nothing to build),
1.18, then 1.17 (the biggest). Same rules as everything above: one
commit per item, machine-test at a local server with beacons off, docs
in sync, push, re-test at Pages, close every tab.

1.19, 1.20, 1.16, 1.18, and 1.17 are all DONE (Sonnet, Round 13) — see
below. ideas4 is fully built. Next is **Phase 2, the Sunday demo**
(2.10–2.18 below, from ideas5 and the 2026-09-04 design conversation),
which absorbs 1.11: the ship window is 2.13 now.

#### 1.16 Chaff is instant, any time (ideas4) — CONFIRMED, no code change

Brian: "chaff is instant, can be used during laser or shields." Already
true as 1.8 was built — `fireChaff()` has no gate on a burst in progress
or on raised shields, only the same `!paused && !over()` every key
respects; verified rather than built. Confirmed at a local server:
pressed mid-burst, chaff spent and answered in the same frame while the
burst kept ticking down untouched (`burstLeft` 5→4 across the press);
pressed with shields fully raised, same — answered instantly (a laser
threat had started in the background, so the reply was correctly
"Chaff does nothing against a laser. Shields."), shields stayed up. No
code changed; this is the rule going forward, not an accident of how
1.8 happened to be written.

#### 1.17 Warp takes time: a three-phase recorded warp, 25 % minimum charge (ideas4) — DONE, needs Brian's ear

Built and machine-tested: the station → Contested Zone leg (measured
from the actual `placeAtStationStart` entry point) comes out to exactly
`warpJumpLongDist` 10606 travel units, which the calibration maps to
`warpJumpMaxS` 12 — confirmed directly: a full-tank jump to the
Contested Zone from the delivery run's start read `totalTime: 12` and
`travel: 10606` before a frame had elapsed. Stepped through a whole
flight with the phase reported every tick: position frozen through the
4 s start clip, moving at a constant rate the instant the engaged loop
starts (confirmed the exact frame it began, `phase` flipping
'start'→'engaged'), the engaged loop stopping and the finish clip
starting at exactly `totalTime − 4` (confirmed), arrival exactly at
`totalTime` with the ship exactly `warpDropout` (600) from the target
and `warpCharge` down by the full 10606 — "Hyperwarp complete. Contested
Zone dead ahead, distance 600.... Warp charge 15 percent." A dry jump
(travel capped by a low charge) produced a proportionally SHORTER
`totalTime` (10.13 s for a 3125-unit travel) and the correct "Warp charge
exhausted..." line, confirming "its time comes from the shortened
travel." The 25 % gate: 24 % refused ("Warp core below 25 percent. Let
it cool, or fly it."), exactly 25 % (3125/12500) allowed. Not yet heard.

**A real bug found and fixed in testing**: the mid-warp Escape exception
(1.18) opened the mission menu correctly, but `onKeyDown` checked
`if (warping) {...}` BEFORE `if (menuOpen) {...}`, so once the menu was
open every key except Escape itself still hit the warping guard first
and got swallowed as "Hyperwarp in progress." — arrow keys couldn't
navigate the menu that Escape had just opened. Fixed by moving the
`menuOpen` check first (`onKeyDown` now checks it before the warping
guard); the warping-blocks-input branch only matters once `menuOpen` is
already false. Confirmed after the fix: menu navigation to Combat
training worked mid-flight, selecting it correctly abandoned the warp
(`clearMission()` now also stops the engaged loop and clears
`warpFlight` — added in this round, see below); Resume mid-flight
correctly returned to a STILL-flying ship, its `elapsed` continuing to
advance afterward (4.3 s at pause, 5.3 s one second after resuming).

Clips embedded: only engine 1's three assets (`warp_start1`,
`warp_engaged1r`, `warp_finish1`, mono 48 kHz 96 kbps, ~155 KB total) —
the other five engines' clips stay on disk until a second drive exists,
per SPEC.

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

#### 1.18 Escape opens the mission menu from open space or an encounter (ideas4) — DONE, needs Brian's ear

Built and machine-tested: Escape from any live mission opens the SAME
mission-menu list with a new **Resume** item appended after Run log
(appended, not prepended — every other item keeps its own index whether
or not Resume is showing, which matters once the overlay closes and
`X` reads the plain list again); the cursor lands on Resume; the sim
freezes (confirmed: holding W while the menu was open moved the ship
0 units); Escape again resumes instantly, and so does Enter on Resume
(with the normal select-beat); choosing any other item abandons the
mission exactly as its own `run()` already did (confirmed: Combat
training selected from mid-Sector-flight correctly left `mode`
`'combat'`), and `X` afterward reads the right item at the right index
(no off-by-one). Help/Map/Run log/Sound opened from inside the overlay
still work exactly as before and return to it ("Help closed. Mission
menu still open." — the old "Still paused." line updated ). The
separate `paused` state is gone entirely — grepped clean; every guard
that used to read `!paused` either reads `!menuOpen` (the audio-duck
double-guard in help/map/run log, `beamTick`'s freeze) or was flat-out
dead code once `menuOpen` already intercepts all key dispatch before
reaching the switch, and was deleted.

**Mid-warp exception, confirmed working**: pressing Escape while
`warping` is true opens the menu WITHOUT ducking audio — held for the
whole 2 s spool in one continuous test, `masterGain` never moved off
its resting value while `warping` stayed true. The warp-completion
`setTimeout` is a real timer independent of `menuOpen`/the RAF loop, so
it fires on schedule regardless: confirmed the arrival line ("Warp
charge exhausted..." on this test, a dry jump) spoke correctly UNDER
the still-open menu, menu navigation kept working immediately after,
and Resume returned control to the ship at its new, correctly-updated
position. (Two of my own EARLIER test attempts appeared to show ducking
and a missing arrival line — both were testing artifacts: splitting the
mid-warp wait across separate tool-call round-trips let real wall-clock
time exceed the 2 s spool before the next script even ran, so `warping`
had already gone false by the time it checked. A single continuous
script proved the real behavior is correct.) No console errors anywhere
in testing. Not yet heard.

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

#### 1.19 Station by range, not corridor (ideas4) — supersedes 1.6 — DONE, needs Brian's ear

Built and machine-tested: `C` at 400 (inside `stationCommRange` 500,
outside `stationDockRange` 150) hails — "Station Meridian control:
services ready — repair, rearm, chaff, and fuel once you dock. Come
within 150 to dock."; `C` at 1200 refuses ("Too far... Get within
500."); `C` at 100 docks instantly with the same repair/rearm/refuel/
handover `finishDocking` always did (renamed `dockAtStation`); undock
places the ship 250 out (`stationDockRange` + 100) along the direction
it was actually facing when it docked, confirmed twice from two
different approach angles; the full delivery-run handover still fires
through the instant dock; F12 describes `C`'s new ranges; no stale
corridor code or cue remained (`docking`/`corridorFrame`/`startDocking`/
`dockOffsets`/`dockToneOn`/`scheduleDockTick`/`abortToEntry`/`dockAxis`/
the `dock_abort` cue all removed, grepped clean); no console errors.
Not yet heard.

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
  range but outside dock range = a **hail**, no docking. `C` inside dock
  range = dock, instantly, `finishDocking` (now `dockAtStation`) as
  today. No speed check (Brian said ranges only); the lock tick and
  "Locked. Distance N", plus R's range-with-closing from 1.15, are the
  landing instruments now.
- **Undock**: places the ship `stationDockRange + 100` out along the
  ship's actual position relative to the station at the moment it
  docked (`docked.approachDir`, computed fresh each dock — `dockAxis`
  is gone), velocity zero, as today otherwise.
- Planet and the other points: unchanged (`poiInteract` stays for them).

#### 1.20 Lasers do double damage against ships at Rookie (ideas4) — DONE, needs Brian's ear

Built and machine-tested: `CFG.laserShipMult` is 2 at Rookie, 1 at
Veteran and Ace (`TIERS[0].cfg`); the same tick fired point-blank at a
Rookie ship spoke 54, at a Veteran ship 27 — exactly double, confirmed
directly; a rock tick under the same conditions (29, inside its normal
random-hardness range) confirmed the rock branch is untouched, since
the multiplier only lives in the ship branch of `beamTick`. The
Difficulty line's Rookie description now reads "...Lasers do double
damage to ships. Standard shields and magazine."; the Weapons help
section's damage-tick line appends "At this difficulty, that damage
against ships is doubled." only when the multiplier is above 1 —
confirmed present at Rookie, absent at Veteran. No console errors. Not
yet heard.

Brian: "make lasers do 2x damage on enemy ships at this difficulty."
Rookie confirmed (Brian, same evening) — the tier he is testing at.

### Phase 2 — the Sunday demo (target 2026-09-06)

Brian wants a playable demo to show off by Sunday, two days after this
was written. Sonnet built five items in a day in Round 13, so this is
eight items, specs precise enough not to need questions. Same rules as
Phase 1: one commit per item, machine-test at a local server with
beacons off, docs in sync, push, re-test at Pages, close every tab.
**If it slips, drop 2.16 and 2.17 first** — they're new content; the
rest fixes or explains things Brian has already heard. Order: 2.10,
2.11, 2.12+2.13 together, 2.14, 2.15, 2.18, then 2.16 and 2.17.

2.10 through 2.19 are all DONE (Sonnet) — Phase 2 is complete. 2.20 (Brian's
ideas6, the first notes from actually flying the Phase 2 build) is DONE too
(Fable, Round 16).

Every number below is a placeholder Brian retunes by ear; all live in
CFG or a data table. Decisions behind them are in Part C.

#### 2.10 Warp overlap, 11 seconds (ideas5) — DONE, needs Brian's ear

Built and machine-tested at a local server: `warpJumpMinS`/`warpJumpMaxS`
are 8.5/11; the delivery run's station → Contested Zone leg (travel
10606, the same distance as before) now measures exactly 11 s; the
engaged loop starts and the ship begins moving at elapsed 3.5 (was 4.0),
confirmed by polling `warpFlight.phase`/`elapsed` every 0.1 s; the finish
phase begins at elapsed 7.0 (`totalTime − warpEdgeClipS` = 11 − 4,
unchanged formula, smaller `totalTime`); the finish clip now fades in
over 0.15 s (`playWarpFinish` rebuilt like `startWarpEngagedLoop` instead
of a flat `playAsset` call) so it crossfades against the engaged loop's
existing 0.15 s fade-out instead of cutting; arrival speech ("Hyperwarp
complete...") still fires correctly. No console errors. Not yet heard —
the crossfade quality is the thing for Brian's ear.

- Two new numbers: `warpEngagedLeadS` 0.5 and `warpFinishLeadS` 0.5. The
  engaged loop starts that much BEFORE the start clip ends; the finish
  clip starts that much EARLIER than it does now. The phases crossfade
  (a 0.15 s ramp each way) instead of butting.
- The jump lengths shorten to match, both ends: `warpJumpMinS` 8.5,
  `warpJumpMaxS` 11. The timeline for a jump of total time T: start clip
  0–4; engaged from 3.5 until the finish starts; finish starts at T − 4
  and ends exactly at arrival; the engaged section is T − 7 seconds long
  (1.5 at the shortest jump = one loop, 4 at the longest). The ship
  departs when the engaged loop begins (3.5), not when the start clip
  ends. `warpJumpLongDist` stays 10606, so the delivery run's first leg is
  exactly 11 s — confirm it, as 1.17 did for 12.

#### 2.11 The sound lab, and the open-space lock tone (ideas5) — DONE, needs Brian's ear

Built and machine-tested at a local server: `soundlab.html` loads
`audio_assets.js`/`audio_engine.js`/`audio_cues.js` unmodified (a small
inline `CFG`/`clamp` shim stands in for what index.html's closure
normally exposes) behind a "Start audio" gesture button, then five
sections — the lock-tone candidates, all 26 `SIM.cues` entries generated
from `SIM.cues.categories()`/`list()` grouped by category, 13 hand-picked
primitive presets, all 23 embedded assets (each button disabled until
its buffer finishes decoding, confirmed all enable within the poll
window), and all 50 not-yet-embedded recordings as native
`<audio controls>` elements grouped by folder (paths with spaces
`encodeURI`'d, confirmed against `Mining_laser 3.mp3`). No console
errors; both a plain audio file and a synthesized cue play cleanly.
Keyboard access is native HTML buttons/audio controls (Tab, Enter/
Space) rather than a custom key-trap shell — the right call for a
browse-and-click tool, not the always-listening game shell.

**The lock tone itself**: `lockToneUsesPulse()` returns true for
`sector`/`mining`, false for `combat`; `startLockTone()`/`stopLockTone()`
replace every direct `startSolidTone()`/`stopSolidTone()` call site (9
of them, `selectNearest`, `cycleTarget`, `updateTargeting` ×2,
`shatterCore`'s auto-track, `startDemo`, the map's set-nav-target and
depart-to-a-different-point branches, `returnToSector`, `clearMission`)
so every lock-clearing path also cancels the pulse's own repeat chain.
Candidate A (the soft double-blip) ships as the live default —
confirmed by a new `lockToneMode` field on `__sim.state()`: `pulse` in
sector, `solid` in combat, lock still speaks "Locked. Distance N." in
both. The pulse's own `setTimeout` chain checks `locked` and the mode
before each repeat, so it self-terminates even if a call site were ever
missed. Not yet heard — Brian picks A, B, or C from the lab.

- `soundlab.html` — this project's own `.soundtester`-style page,
  loading the same `audio_assets.js`/`audio_engine.js`/`audio_cues.js`
  so nothing is duplicated. One button per `SIM.cues` entry grouped by
  category (`SIM.cues.list()` exists for exactly this), a row of the
  primitives with a few presets each, one button per embedded recording,
  and one per UN-embedded recording under `audio/` played with a plain
  `<audio>` element (works from the local server and Pages, not from
  `file://`). Keyboard-first like everything else: arrows and Enter, the
  button's name spoken. Not linked from the game; Brian opens it
  directly. Test convention: `.claude/launch.json`'s static server.
- **The lock tone** (Brian: the solid tone is harsh over the minutes a
  sector lock lasts; combat locks are brief). Three candidates in the
  lab, Brian picks by ear, the pick is wired in as context-dependent —
  combat keeps today's solid 880 Hz sine, sector and mining get the pick:
  A. a soft low double-blip every 2 s (two 60 ms sines, 330 then 440 Hz,
  quiet); B. today's tone dropped to 440 Hz with a slow tremolo, fading to
  a quarter of its level after 3 s and holding there; C. a single filtered
  pulse every second (a 40 ms lowpassed square at 220 Hz). `CFG.lockTone`
  = `{ combat: 'solid', sector: <pick>, mining: <pick> }`. Until Brian
  picks, ship A as the default so the irritant is gone on Sunday.

#### 2.12 Sixteen lasers, cycling on 1 and Shift+1 (ideas5) — DONE, needs Brian's ear

Built and machine-tested at a local server: pressing 1 while slot 1 is
already selected cycles mining1 → mining2 → mining3 (confirmed via
`profile.slots`), Shift+1 cycles back (mining3 → mining2), each cycle
runs the same switch clip/delay as changing slots; pressing 2 switches
to the Rapid family at its current version ("Slot 2, rapid 1,
switching." → "Rapid 1 ready."); an empty slot (3–6) still refuses with
no delay and doesn't cycle. The F2 ship screen (2.13) confirms both
families' matchup text is correctly wired from the same data table.
`laserMatchupMult()` was checked directly for logic correctness (a
plain array-membership lookup) rather than by a noise-free live A/B —
aim quality and range vary too much shot to shot to isolate the 1.3×/
0.7× difference cleanly in a fired-beam test. All 14 remaining
recordings are embedded (mono 48k 96k, ~1.6 MB added — slightly over
the ~1.4 MB estimate). No console errors. Not yet heard — the ×1.1
per-version curve and the family matchup assignments are both by-ear
candidates for Brian.

- **Slots become families.** Slot 1 is the Mining family, slot 2 the
  Rapid-pulse family, slots 3–6 stay empty. Each family carries all eight
  versions for now (a carry limit per family comes later, Brian).
  `LASER_FAMILIES` `{ id, label, tickBase, ticks, tickS, cooldownS,
  assetPrefix, matchups }`; `LASERS` becomes the 16 entries generated
  from it (`mining1`–`mining8`, `rapid1`–`rapid8`), each `{ id, family,
  version, name, asset }` with damage derived: version n's ticks are the
  family's `tickBase` × 1.1^(n−1), so version 8 is ~1.95× version 1.
  Labels are just "mining 3", "rapid 5".
- **Keys**: pressing 1 when slot 1 isn't selected switches to slot 1 at
  its current version (the 1.14 switch, same clip, same delay). Pressing
  1 again advances to the next version — also a switch, same clip, same
  delay (Brian: it takes the same time and uses the same sound triggers).
  Shift+1 goes to the previous version. Wraps at both ends. Same for 2.
  Speech: "Slot 1, mining 3, switching." then "Mining 3 ready." The
  selected version per slot persists (`profile.slotVersion[i]`).
- **The two families**, placeholders Brian approved:

  | | Mining | Rapid-pulse |
  | --- | --- | --- |
  | Burst | 8 ticks over 8 s | 10 ticks over 5 s |
  | Tick at version 1 | 15 | 6 |
  | Cooldown | 3 s | 1.5 s |
  | Strong (×1.3) | iron, cruisers | ice, interceptors |
  | Weak (×0.7) | ice, interceptors | iron, cruisers |
  | Middle (×1.0) | stone, corvettes | stone, corvettes |

  The burst length follows the recording (Mining clips are 8 s, Rapid
  5 s), so the two families sound as different as they play. Ship
  classes for the matchup: Freighter and Cruiser are cruisers, Drone is a
  corvette, Raider and Scout are interceptors (the same split 2.2 uses).
  `hullMult`/`rockMult` per laser go away in favor of the family
  matchup table; `CFG.laserShipMult` (Rookie ×2, 1.20) still multiplies
  on top for ships.
- **Assets**: all 14 remaining recordings embedded (mono 48k 96k, the
  laser_switch pipeline), ~1.4 MB more on `audio_assets.js`. The
  lazy-load path (3.15) comes after Sunday; note the load time.
- Help, KEY_DESCRIPTIONS for 1–6 and Shift, README, `I` ("Slot 1, mining
  3, ready"), all updated.

#### 2.13 F2, the ship screen (ideas5; was 1.11) — DONE (partial), needs Brian's ear

Built and machine-tested: F2 opens from any live mission AND from the
mission menu (`menuKey`'s F2 branch), freezes/ducks like help, browses
line by line (confirmed all 13 lines on a fresh profile: hull, shields,
warp charge, cargo/credits, missiles, chaff, six slot lines — 2 fitted
with their matchup sentence, 4 "is empty" — then total mass), Escape or
a second F2 closes it, top/bottom-of-list blips work, no console
errors. Built now with what exists today (hull/shields/warp/ore/
credits/missiles/chaff/lasers/modules/mass); the reaction-mass and
salvage/alloy lines get added when 2.14/2.15 land rather than blocking
this screen on unbuilt systems. Not yet heard.

- Same shell as the run log: F2 opens it anywhere a key works (freezes
  and ducks like help), arrows read line by line, Escape closes, F12
  describes it. Lines, in order: hull; shields (pool and state); warp
  charge; reaction mass (2.14); cargo — ore, salvage, alloy (2.15);
  credits; missiles; chaff; then one line per slot: "Slot 1, mining 3,
  ready. Bites iron and cruisers. Weak on ice and interceptors." (the
  matchup in words, never numbers unless Brian asks); then fitted
  modules one per line; then total mass.
- The matchup sentence is the point of the screen: it's where a pilot
  learns which laser to bring to which rock and which ship.

#### 2.14 Reaction mass, the approach, collisions, hail versus land (ideas5) — DONE, needs Brian's ear

Built and machine-tested at a local server: 2 seconds of W drains reaction
mass (100 → 97, the extra point from the stabilizer's own passive-damping
shed, which runs unconditionally alongside thrust exactly as before);
forcing the tank to 3 and holding W drains it to exactly 0 and speaks
"Reaction mass empty. Battery power." — thrust still moves the ship
afterward, at the reduced battery fraction, never stalling; docking (even
forced into battery mid-flight) always fully refills and clears battery
mode, spoken as "Reaction mass filled."

The hail menu (replacing 1.19's plain status line) was exercised in full:
Sell ore computed correctly (3400 ore → 340 credits), Buy reaction mass
filled a partially-drained tank for the exact remaining-units price (40
credits for 40 units, balance debited correctly), Rearm correctly
reported "already full" against an untouched magazine, Escape closes it
("Hail closed."). Collision: a ship placed 40 units from Station Meridian
(inside `stationHullRadius` 60) at speed 60 (35 over `collisionSafeSpeed`
25) took the expected ~70 damage, was stopped and pushed back to exactly
60 units out, and spoke "Your hull N."; docking afterward billed the
collision damage first — with only 300 credits on hand against a 345
cost, it correctly repaired 60 of 69 billable points for 300 credits and
left "the rest waits on credits," reducing `collisionDamage` to 9 rather
than zeroing it. `I` and F2 both read the reaction-mass percentage
correctly. No console errors. Not yet heard or flown by Brian — the
stopping distance, burn rates, and collision thresholds are all
placeholders for his ear and hands.

- **Not Newtonian** (Brian: too hard to fly). The stabilizers keep
  countering momentum automatically exactly as they sound today; the
  pilot has no control over them beyond not thrusting in the first place.
  What changes: they SPEND reaction mass while they work, and so do W
  and S.
- `rcs` (reaction mass), `CFG.rcsMax` 100, in the profile like warp
  charge. Burn: W `rcsThrustPerS` 1, S `rcsBrakePerS` 1.5, stabilizers
  `rcsPerSpeedShed` 0.02 per unit of speed they remove. Empty = **battery
  mode**: thrust, braking, and stabilizers at `rcsBatteryFactor` 0.4 of
  strength, never zero, never stranded ("Reaction mass empty. Battery
  power."). Spoken at 50 and 25 percent like the warp core, `I` reads it.
  Emergency canisters in the hull are a later anti-stranding lever.
- **Braking is a reverse thruster**, not today's near-instant `brakeKeep`:
  `CFG.brakeThrust` 35 (half of `thrust` 70), so from top speed the ship
  needs ~3 s and ~140 units to stop. That is what makes an approach a
  piloting task and burns the mass.
- **Refills**: landing at a station fills it free; an ice core extracted
  gives `rcsPerIceCore` 10; a kill gives `rcsPerKill` 5; a hail buys it at
  `rcsCreditPerUnit` 1.
- **Collision**: inside `stationHullRadius` 60 of a station (or planet)
  faster than `collisionSafeSpeed` 25, the ship hits it: damage
  `collisionDmgPerSpeed` 2 per point of speed over the limit, a crunch on
  the UI bus and the impact at the station's position, the ship stopped
  and pushed back to the hull radius. That damage is the only hull damage
  that COSTS to repair: `repairCreditPerPoint` 5 on landing; the station
  repairs what the pilot can afford and says so. Bad drivers get a bill.
- **Hail versus land**: `C` inside `stationCommRange` 500 opens a short
  **hail menu** (the station-menu shell with a different list): Rearm
  (missiles and chaff), Sell ore, Buy reaction mass, Missions (2.17),
  Prices (3.11, later), and Close. `C` inside `stationDockRange` 150
  docks as now; the landing menu keeps Modules (and lasers), Repair, the
  free full reaction-mass refill, and Undock. You land because that is
  where the shop is, and landing means braking, which means spending
  mass. Ranges may move once Brian has flown it.
- The delivery run starts with a full tank of mass.

#### 2.15 Salvage, alloy, ice, and F3 the resources screen (ideas5) — DONE, needs Brian's ear

Built and machine-tested at a local server: F3 opens anywhere and reads
all 9 lines correctly in order (ore, salvage, alloy, reaction mass, warp
charge, hydrogen, credits, missiles, chaff); a Scout kill (interceptor
class) correctly added exactly 2 salvage, confirmed against a genuinely
clean profile after isolating a test-script contamination issue (see the
bug below); the landing menu's new Sell salvage line correctly priced 2
salvage at 60 credits (2 × 30) and Sell alloy correctly reported "No
alloy in the hold." against zero. No console errors.

**A real bug found and fixed**: `say()` only ever sets `liveEl.textContent`
directly, with no queue — two `say()` calls in the same synchronous tick
collapse into ONE DOM mutation, so a screen reader only ever perceives
the LAST of the two. `addSalvage()` originally spoke its own "Salvage
plus N." immediately before `damageTarget`'s "X destroyed" line; in
practice the salvage announcement was silently swallowed every time,
confirmed by an isolated test where the profile updated correctly (2
salvage saved) but the spoken line never appeared in the announcement
log. Fixed by making `addSalvage` silent (it returns the amount) and
folding it into the SAME `say()` call as the kill/victory line —
`destroyTarget` now takes an optional `extra` string it prepends to its
own (real-setTimeout-delayed, so already safe) victory line, and
`damageTarget` builds one combined string for the ordinary case.
**This is a general gotcha for anything built on this codebase's speech
model going forward: never call `say()` twice without an await/setTimeout
between them** — combine into one string, or use `setTimeout` to force a
real task boundary. Confirmed fixed: "Salvage plus 2. Scout destroyed.
4 targets remain." now speaks as one line.

Not yet heard by Brian — the salvage-per-class and sell-price numbers are
placeholders for his ear.

- `profile.resources` `{ salvage, alloy }` beside `credits`; ore stays
  the cargo hold. **Salvage**: every kill adds it by class, `SALVAGE`
  `{ interceptor: 2, corvette: 3, cruiser: 5 }`, collected on the kill
  (2.8's containers to fly to come later). **Alloy**: every iron core
  extracted adds 1. **Ice**: every ice core extracted adds 10 reaction
  mass (2.14). Spoken as they land: "Salvage 3." / "Alloy 1." / "Reaction
  mass plus 10."
- Sinks for Sunday: both sell at the station's landing menu at fixed
  prices, `salvageCredit` 30, `alloyCredit` 20. Salvage-gated modules and
  the easy drone missions are 3.13.
- **F3 resources**: one line each — ore, salvage, alloy, reaction mass,
  warp charge, hydrogen (0 until 2.8), credits, missiles, chaff — each
  with a few words on what it's for. Same shell as F2.

#### 2.16 Death by tug (ideas5) — DONE

Built as specified. `tugCandidate()` is the one gate: `sectorHome ||
mode === 'sector'` — true for any loss reached via the sector (an
encounter entered from it, or dying in open flight itself, e.g. to a
collision) and for the delivery run (which is always inside one of
those two), false for a standalone training drill started directly
from the mission menu. `shipDestroyed()` checks it once and either
calls `startTug()` or falls through to the untouched old "Enter tries
again" path. `startTug()` reads `profile.stations['Station
Meridian'].influence` BEFORE this death could touch it (same ordering
rule as `influenceGreeting`) and sets `tug = { total, remaining,
poiData, paid }`, `total` = `CFG.tugBaseS` (90) halved by
`CFG.tugInfluenceFactor` (0.5) once influence clears
`CFG.influenceThreshold`. `updateTug(dt)` runs from `simTick` on the
same help/map/menu-gated clock as the delivery timer (NOT gated on
`!over()`, since being lost is what starts it) and speaks "Tug in N
seconds" on every whole-10-second boundary crossed, exactly like the
warp-core alert's before/after bucket comparison; at zero it calls
`tugArrives()`, which clears `tug`/`sectorHome`, rebuilds the sector
roster, drops the ship just outside Station Meridian, and calls
`dockAtStation(poi, 'Tug arrives. ')` — the same repair/rearm/refuel/
restock/delivery-handover path a normal docking always runs, with the
new `extra` param prepended so the whole thing is still one `say()`
call (the SPEC 2.15 double-call lesson applied on purpose here).
`payTugFee()` (Enter, while `tug` is set) spends `CFG.tugFeeCredits`
(50) once (`tug.paid` guards a second press), halving whatever's left
at that moment — stacks multiplicatively with an influence halving,
not additively, since it operates on `tug.remaining` directly. X and
the Shift+T/R/W chord are refused during the wait ("A tug is already
on the way...") instead of returning to the sector or restarting,
since the tug is now the only way back for a sector-campaign loss;
`clearMission()` clears `tug` too, so abandoning the wait via the
mission menu (Escape, then a different item — the existing SPEC 1.18
"selecting anything else abandons the live mission" behavior, untouched
by this) doesn't leak stale tug state into whatever comes next. Help
text (the "Shields and enemy fire" section) and `KEY_DESCRIPTIONS.enter`
both updated to describe the split between a drill's retry and a
campaign's tug.

Machine-tested at a local server (a `kill` and a `credits` poke added
to `__sim` for this, matching the existing test-hook convention): a
standalone Combat training drill death still answers "Enter tries
again" with no `tug` set, unchanged from before; a death inside a
sector-entered combat encounter and a death in plain open sector flight
(no encounter at all) both correctly start a 90 s tug at Station
Meridian; a seeded influence of 5 (threshold 3) halves that to 45 s;
paying the fee with 50+ credits halves whatever remains and a second
Enter refuses ("Already paid"); paying with 0 credits refuses and
charges nothing; X and the Shift-chord are both refused mid-wait with
the tug-specific message instead of the old ones; the countdown was
confirmed firing at each 10-second game-time boundary (90 -> 80 -> 70 ->
60 -> 50 -> 45 after a mid-wait pay -> 40 -> 30 -> 20 -> 10 -> arrival)
stepped through `__sim.step()`, each announcement landing as its own
distinct speech (not collapsed, since `updateTug`'s `say()` calls are
naturally spaced by real/game seconds apart, unlike the SPEC 2.15 bug);
arrival correctly repairs hull to 100, refills reaction mass, leaves
cargo untouched, and opens the station menu, with the influence greeting
included when earned. The delivery run's own death was confirmed
routed to the same tug (no more "Delivery run failed... restarts from
the beginning") and its clock confirmed STILL ADVANCING through the
wait (elapsed 3 at the moment of death, 13 ten seconds into the tug
wait, 53 at arrival) — the demo object survives the tug arrival intact
(`combatCleared`/`delivered` unchanged) and resumes normally afterward.
Zero console errors throughout. Not yet heard by Brian.

#### 2.17 Escort and defend missions (ideas5) — DONE

Built as specified, with one deliberate architectural simplification
(see below) and one naming trade-off, both explained here rather than
buried in code comments alone.

**Where it's offered**: `HAIL_ITEMS` gained a `Missions` line (before
`Close`); selecting it opens a nested `MISSIONS` submenu
(`hailMenu.submenu = 'missions'`, dispatched from `hailMenuKey` exactly
the way the station menu's Modules list already nests under
`stationSubmenu` — same shell, same precedent) listing "Escort freighter
to Planet Auren" and "Defend the miner at Field Kappa". Accepting one
(`startMissionRun(kind)`) starts the cooldown immediately (at ACCEPT,
not completion — matches "offered once", and means abandoning a mission
early via X still costs the cooldown), snapshots the sector spot the
same way `callPoi()`'s combat/mining branches already do, and calls
`newGame('combat', spec)` — `mode` stays `'combat'` throughout (per the
codebase's own shape: `updateEnemies`/`statusReport`/`tugCandidate`/the
map's `won`-gate all key off the literal string `'combat'`, and a brand
new `mode` value would need to be threaded through every one of those;
a mission is a `mission` object layered on top instead, the same way
`demo` already layers the delivery run's objective on top of
`'combat'`/`'mining'` without being its own mode).

**The friendly target**: `makeMissionRoster(mission)` builds ONE target
with `kind: 'friendly'` — the Freighter (hull 200, the same voice/
recorded engine loop as the training roster's own "Freighter" entry) or
the Miner (hull 150, oscillator voice only — no recorded loop exists for
one yet). `buildVoice(t)` needed no changes at all to accept it (it was
already generic enough — confirmed by reading it before writing this).
`selectNearest()`/`cycleTarget()` both gained a `t.kind === 'friendly'`
exclusion so it's never Tab-cycled, matching spec; `destroyTarget`'s
generic "all targets destroyed = victory" check is skipped entirely
when `mission` is set (the friendly stays `alive` the whole mission, so
that check would never fire for escort and would fire too early — after
any single wave, before the next spawns — for defend), replaced by
`updateMission`'s own wave-count/timer logic.

**Raiders arrive in scripted waves**, not all at once:
`CFG.missionEscortWaveTimes` `[15, 45, 75]` / `CFG.missionDefendWaveTimes`
`[10, 45]`, sizes `CFG.missionEscortWaveSize` 2 / `CFG.missionDefendWaveSize`
3, `spawnMissionWave()` called from `updateMission(dt)` once `mission.elapsed`
crosses each scheduled time. Every raider is named plainly `'Raider'`
(not numbered) — SHIP_CLASS/SALVAGE/laser-matchup-multiplier all key off
exact ship name, and a numbered "Raider 1" would silently fall back to
the wrong salvage/matchup tier; the trade-off, accepted on purpose, is
that Tab-cycling between two simultaneous raiders can't distinguish them
by name, only by bearing/distance, same as flying blind between two
same-named things has always meant in this codebase (there was no
existing precedent either way, since the training roster never
duplicates a name).

**The provoke/victim mechanic — the one deliberate simplification**:
spec says "enemies target the freighter unless the pilot hits them
first." The FULL version of that would mean threading a "who's the
victim" parameter through `startEnemyLaser`/`startEnemyMissile`/
`stepThreat` — the exact telegraph/beam/guided-missile machinery every
other combat scenario in this game already relies on, heavily tested,
and touching it risked regressing standalone drills, the sector's
Contested Zone, and the delivery run all at once for a feature none of
which need it. Built instead as a side-channel that reuses that
machinery UNCHANGED for its actual job (fighting the player) and adds a
separate, simpler mechanic for the other case: `provoke(t)` (called by
every `damageTarget` hit, mission or not) now unconditionally sets
`t.provoked = true` before its existing hostile-latch logic — a no-op
outside a mission, since nothing reads it there. `updateEnemies`'s
candidate pool, which every mission raider is otherwise eligible for
(since raiders spawn `hostile: true` from the start, per spec), now
checks `mission ? t.provoked : t.hostile` — meaning only a raider the
PLAYER has actually hit ever joins the real telegraph/beam/missile fight
against them, using every one of those systems exactly as they already
work. Every raider that hasn't been hit yet instead gets picked, on a
`CFG.missionStrikeGapMinS`–`MaxS` (6–10 s) timer, by `missionStrike(t)`
in `updateMission`: a one-shot tone at the raider's position plus
`CFG.missionStrikeDmg` (15) off the friendly's hp, spoken as one combined
line ("Raider hits the Freighter. Freighter hull N percent.") — a
deliberately simpler simulation than the full telegraph+sustained-beam
model, not a scaled-down version of it. This means a raider currently
harassing the friendly and a raider currently fighting the player are
running on two independent systems that happen to share the same target
objects — confirmed working correctly together in testing (see below):
a provoked raider immediately stopped appearing in `missionStrike`'s
candidate pool and started telegraphing/firing at the player instead,
mid-mission, while its still-unprovoked wave-mates kept hitting the
friendly on their own schedule, no interference either way.

**Ending a mission**: `missionEnd(success)` sets `won = true` for BOTH
outcomes (not `lost` — the player's own ship is never destroyed by a
mission failure, only the friendly is, so reusing `lost`'s ship-destroyed
semantics would have been wrong) and gates on `mission.success` for the
reward/message. Success (escort: `mission.elapsed >= CFG.missionEscortLegS`
90 with the friendly still alive; defend: both waves sent and every
non-friendly target destroyed) pays `CFG.missionCredits` 300 credits and
bumps Station Meridian's influence by 1. Failure (the friendly's hp
reaching 0, via `missionStrike`) pays nothing, exactly as specified.
Enter is refused after either outcome ("Mission complete/over. X returns
to the sector.") rather than replaying in place — a mission is offered
once per cooldown from the hail menu, not farmable via Enter — and the
generic Enter-retry code path (which still runs `combatIntro()` and
would have said something nonsensical like "Five targets detected") is
now gated to skip entirely whenever `mission` is set. `statusReport` (I)
gained a friendly-hp line and, for escort, a leg-progress line; the
"N targets remain"/"N targets remain" readouts on a kill and on I both
exclude the friendly from the count so they don't stay off-by-one
forever.

**Cooldown**: spec's "600 of game time" needed an actual game clock that
exists even outside the delivery run (the only other game-time value in
this codebase, `demo.elapsed`, only exists while a delivery run is
active). Added `simClock`, a plain session counter advanced in `simTick`
on the same live/not-under-an-overlay gate as everything else — NOT
persisted across a reload, same as `demo.elapsed` isn't either, so
"per station" reduces to "for this session" today (there's only one
station to offer missions from anyway). `missionCooldownUntil = {escort,
defend}` are simClock timestamps, not part of `profile` — checked via
`missionAvailable(kind)`, refused with a spoken remaining-seconds count
in the Missions submenu.

**Interaction with SPEC 2.16's tug**: untouched on purpose — a mission
always sets `sectorHome` the same way any other sector-entered encounter
does, so the player's own ship being destroyed mid-mission (as opposed
to the friendly) routes through `tugCandidate()`/`shipDestroyed()`
exactly like any other sector loss, with no mission-specific code
needed. Confirmed in testing: killing the player mid-escort correctly
dispatched the tug, and `mission` was cleanly cleared to `null` (via
`clearMission()`, already called from `tugArrives()`'s own
`newGame('sector')`) by the time the tug docked.

Machine-tested at a local server end to end: opened the hail menu,
browsed to Missions, accepted Escort — friendly spawned at full hull,
wave 1 (2 raiders) arrived on schedule with a spoken "2 raiders inbound
on the Freighter..." line, unprovoked raiders hit the friendly on their
own timer while it kept flying its leg; hit one raider with a missile
(survived, didn't kill it) and confirmed it immediately switched to
telegraphing/firing at the PLAYER through the untouched vanilla threat
system while its wave-mates kept hitting the friendly independently;
killed a different raider outright and confirmed salvage awarded and
the "N targets remain" count correctly excluded the friendly; let the
full 90-second leg play out with the friendly surviving at 25% hull —
mission succeeded, 300 credits and one influence point awarded, Enter
correctly refused to replay, X returned cleanly to the sector; accepted
Defend next and force-lowered the miner's hp near zero via a test poke
to reach the failure path — "Raider hits the Miner. Miner destroyed."
followed by "Mission failed. No reward." with credits confirmably
unchanged; re-hailed the station immediately after and confirmed BOTH
mission kinds correctly refused as on-cooldown with an accurate seconds-
remaining readout, and that accepting while on cooldown is blocked with
no credits spent and mode unchanged; killed the player's own ship mid-
mission and confirmed the SPEC 2.16 tug fired normally and mission state
was cleanly cleared by the time it docked. A regression pass on the
UNTOUCHED standalone Combat training drill confirmed the original "all
five destroyed = Victory, Enter restarts" path still works byte-for-byte
as before (its own salvage/kill/victory speech unaffected by any of the
`mission`-gated branches added this round). Zero console errors across
every scenario. Not yet heard by Brian — the friendly-strike tone, the
wave-inbound announcement, and the mission-complete fanfare are all new
sounds nobody has listened to yet.

Phase 2 (the Sunday demo, 2026-09-06 target) is now complete: 2.10
through 2.19 are all DONE.

#### 2.18 The profile version (ideas5) — DONE

Built retroactively (2.14/2.15/2.19 already landed by the time this was
built, so the "do this before 2.14/2.15 land" ordering in the original
brief didn't happen — no tester's save existed yet to lose, since Brian
hasn't played any of this session's rounds). `PROFILE_VERSION = 2` in
`index.html`; `defaultProfile()` stamps `version: PROFILE_VERSION`.
`loadProfile()` captures `loadedVersion = profile.version || 1` right
after the `Object.assign` merge, runs every existing defensive
per-field normalization (runs/upgrades/stations/slots/sound/beacons/
resources — this is the actual v1→v2 migration; those checks already
existed field-by-field before 2.18 gave them a version number, so
nothing about their behavior changed here) and finishes with
`profile.version = Math.max(loadedVersion, PROFILE_VERSION)` so a save
is never downgraded. (The original brief named `rcs`/`slotVersion` as
migrated fields; neither exists as persisted profile state — `rcs` is
session-only battery charge, rebuilt fresh every boot, and there's no
separate slot-version field, just the `slots` id array already
covered — so the real migration list is the fields above instead.)
`__sim.state().economy` gained a `version` field for testing.

Machine-tested at a local server, three scenarios: a fresh profile
(no localStorage entry) booted straight to `version: 2`; a seeded
v1-shaped save (`{tier, credits, upgrades, chaff, runs}`, no `version`
and none of the newer fields) loaded with credits/tier/upgrades intact
and `version` backfilled to 2; a seeded "future" save (`version: 3`,
every current field present, plus one field the code has never seen,
`futureField`) loaded with its data intact, `version` staying 3 (not
downgraded to 2), and `futureField` still present verbatim in
localStorage afterward since nothing overwrote it. Zero console errors
in a fresh tab across all three. Not yet heard/played by Brian — there's
nothing to hear, this is pure persistence plumbing.

#### 2.19 Recorded audio as fetched files, not base64 (Brian, 2026-09-04) — DONE; supersedes 3.15 and the `file://` requirement

Brian: "I do not need to run via index locally and will be happy to run it
off Git." **`file://` support is dropped.** The game runs from GitHub
Pages, and from the local static server during development — nowhere
else. He is creating and collecting more audio now, ambient music next,
so the bank has to scale as files, not as a 3.8 MB base64 blob decoded
at every boot.

- **`audio_assets.js` becomes a manifest.** Same filename and script tag,
  so nothing else moves: `window.AUDIO_MANIFEST = { asteroid1:
  'audio/mining/asteroid1.mp3', ... }`, one line per sound, keys unchanged
  — every call site already looks sounds up by key through
  `SIM.audio.assetBufs`, so gameplay code doesn't change. `AUDIO_ASSETS`
  and the base64 go away. Paths are repo-relative; the loader
  `encodeURI`s them, so Brian's existing filenames with spaces
  (`Mining_laser 3.mp3`) work as they are, no renaming. Convention for NEW
  files: lowercase, underscores, no spaces, filename = key
  (`audio/music/ambient_sector1.mp3` → `ambient_sector1`), so adding a
  sound is one manifest line.
- **Serve MP3, keep the WAV masters.** The twelve WAV recordings (six in
  `audio/mining/`, the six `laser_switch` clips) are 1–2 MB each — too big
  to fetch. Convert each once with the exact pipeline every embed used
  (`ffmpeg -i in.wav -ac 1 -ar 48000 -b:a 96k out.mp3`), commit the `.mp3`
  beside its `.wav`, point the manifest at the mp3. The MP3 originals
  (lasers, ships, warp, explosions) are served as they are; stereo ones on
  the UI bus stay stereo, and a stereo buffer into an HRTF panner is
  downmixed by Web Audio, so positioned voices work either way.
- **The loader** (`audio_engine.js`): `decodeAssets()`, the atob path, is
  deleted. `SIM.audio.load(key)` returns a Promise — buffer cached →
  resolve; fetch in flight (`pending[key]`) → return it; else
  `fetch(encodeURI(AUDIO_MANIFEST[key]))` → `arrayBuffer` →
  `decodeAudioData` → `assetBufs[key]`. A missing key or a 404 rejects,
  `console.warn`s ONCE per key, and leaves the key absent so every
  existing "no buffer → synthesized fallback" branch keeps doing exactly
  what it does today. `SIM.audio.preload(keys)` = `Promise.all` over
  `load`, swallowing rejections; `SIM.audio.ready(keys)` = every key has a
  buffer, synchronous.
- **What loads when.** `audioStart()` kicks off `preload(AUDIO_PRELOAD)` in
  the background — a list in the manifest file of what the demo always
  needs (today's 37 keys: the mining loops and explosions, `missile_fire`,
  the five ship loops, all sixteen lasers, the six switch clips, warp set
  1 — the same ~3 MB the base64 carried, now arriving AFTER the page is
  interactive instead of before). Everything else loads on first use:
  `playAsset` and every direct `assetBufs[key]` reader call
  `SIM.audio.load(key)` when the buffer is absent (start the fetch, use
  the fallback this time, the real sound next time). Mission starts
  `preload` their own keys without waiting; the one existing gate stays —
  Mining's "The asteroid sounds are still loading" via `assetsReady()`,
  which becomes `ready(MINING_KEYS)` — and the delivery run gets the same
  gate for the same keys, since it mines too.
- **Speech**: nothing new. A fetch that hasn't landed is silent-with-
  fallback, exactly like an un-embedded engine is today. A spoken "sounds
  loading" at boot is one line gated on `ready(AUDIO_PRELOAD)` if Brian
  wants it; not built by default.
- **Music hook** (small, so the first ambient track is one manifest line
  away): a fourth bus, `SIM.audio.musicBus` → `masterGain`; a fourth
  `SOUND_CATS` line, Music, in the Sound menu (`profile.sound.music`,
  applied by `applySoundLevels`); `SIM.audio.playMusic(key, {vol, fadeS})`
  / `stopMusic(fadeS)` — loads the key, loops it on the music bus,
  crossfades from whatever was playing. No track plays anywhere yet;
  where music plays (sector, station, combat) is 3.18, once Brian has
  tracks.
- **The sound lab**: "embedded recordings" becomes "in the manifest" (one
  button per key, `load` on click then play, a "missing" marker if the
  fetch fails — the lab is now the manifest checker); "on disk, not
  embedded" becomes "on disk, not in the manifest" (the candidate list as
  now). The lab's shim references `AUDIO_MANIFEST`.
- **Git — this is the part that bites if skipped**: the files have to be
  IN the repo for Pages to serve them. `audio/ships/warp/` and
  `audio/weapons/lasers/` are untracked today, and `audio/missiles/` has
  seven deletions pending from Brian's reorganization. Stage `audio/`
  explicitly (`git add audio/`) in this item's commit — never `git add -A`;
  the ideas files stay untracked and `z.old/` is gitignored regardless.
  About 25 MB of audio lands in the repo; fine for Pages. `audio_assets.js`
  drops from 3.8 MB to ~3 KB.
- **Docs**: every "double-click", "file://", "base64", and "embedded"
  statement in CLAUDE.md's Files, Audio architecture, and Working
  agreements sections is rewritten by this item (the doc edit that
  introduced 2.19 already did the ones that describe the DECISION; the
  ones describing the CODE change with the code). README is already
  Pages-only. 3.15 and 3.2 are superseded.
- **Test checklist** — DONE, machine-tested at a local server, network tab
  open: a fresh boot has zero decoded buffers immediately and all 37
  within about a second, background fetches confirmed via the network log
  (every manifest path 200s; the page is speakable and playable throughout,
  never blocked on the fetch); Mining's "still loading" refusal confirmed
  by forcing an asteroid buffer absent (correctly refuses, correctly
  proceeds once restored); a laser fires with its recording
  (`laser_mining1` in `assetBufs`, burst runs its full 8 ticks); a warp
  plays through the start→engaged transition; a deliberately broken
  manifest path console.warns exactly once across two failed calls,
  confirmed against a genuinely fresh tab (the first attempt's warnings
  and 404s otherwise persist in the browser's own console/network buffers
  across navigations in the *same* tab, which briefly looked like a real
  bug until a fresh tab ruled it out); the Sound menu's new Music line
  browses, changes, saves, and demos on `musicBus`; the lab lists all 37
  manifest keys plus 7 on-disk-only groups (36 files — the two laser
  groups that moved into the manifest back in 2.12 are gone from it now)
  and a manifest button loads-then-plays on click. No console errors from
  a clean boot. `file://` was not tested — it no longer works, by
  decision. Not yet re-tested at Pages by Brian's ear, but the mechanism
  itself (fetch, not embed) needs nothing different there.
#### 2.20 ideas6 — first notes from flying the Phase 2 build (Brian, 2026-09-04, 18:33) — DONE

The first feedback on anything from Rounds 10–15: Brian flew a delivery
run to completion on the 2.17 build. Seven notes; six built, one parked
(his own instruction). Built by Fable in Round 16, machine-tested at a
local server and on Pages, not yet heard back.

- **Decoys, not chaff.** Every player-facing "chaff" is now "decoy(s)":
  the D refusal in open space, the four firing lines, I / F2 / F3, the
  docking and hail restock lines, help, the key descriptions, README, and
  the cue's display name in the sound lab. Variables (`chaff`,
  `CFG.chaffMax`) and the cue id `chaff_burst` keep their names — no
  reason to touch working code for a word.
- **Lock tones by what's under the cursor**, not by mode. SPEC 2.11 picked
  the tone by mode (combat solid, sector/mining pulse). Now `lockToneKind()`
  reads the selected target: a ship (or a mission friendly) gets the solid
  880 Hz tone at `lockToneVol` 0.12; a rock or dust field gets the soft
  double-blip every 2 s at `lockPulseVol` 0.1 (was 0.07 — Brian said he
  needed *something* every two seconds, so the pulse is a touch louder);
  a point of interest gets the solid tone at `lockTonePoiVol` 0.045 AND
  the guidance ticks keep running underneath it at `tickLockedMs` 220,
  still pitched by elevation and panned by azimuth — Brian's "combat
  tone, but softer, and the guidance ticks" — so a minutes-long flight
  onto a beacon never loses its steering. The tick also now idles while
  docked or hailing. All four numbers are CFG placeholders for his ear;
  `__sim.state().lockToneMode` reports 'solid' / 'pulse' / 'poi'.
- **Undocking puts you 1000 out** (`undockDist`), facing away, outside
  comm range and inside the no-warp zone, and says so: "1000 out from
  Station Meridian, facing away. The drive won't spool within 1500 of
  the station — thrust clear first." (was 250 out with a bare
  "Undocked.") Brian reported that after his delivery, undocking left
  him unable to move — only the map answered. **Found and fixed**: since
  SPEC 1.19, `undock()` set the yaw with the sign flipped
  (`atan2(-dir.x, dir.z)` where `shipForward()` needs `atan2(dir.x,
  -dir.z)`, the formula `faceSelected` already uses), so "facing away
  from the door" actually faced the station. At 250 out, W flew the ship
  into the 60-unit hull within a few seconds, where `updateCollisions`
  stops it and pushes it back on every press — no net movement, and
  only the map is unaffected. The first attempt to reproduce it
  measured the ship moving and missed that it was moving *toward* the
  station; the Pages check after the fix's own round caught the tell
  ("Locked. Distance 1000" the moment after undocking, on a ship
  supposedly facing away). Fixed to `atan2(dir.x, -dir.z)`; a W after
  undock now opens the distance. Kept as well, since they're right
  regardless: `undock()` resets held keys and auto-thrust, and a held
  W/S/arrow while `over()` is holding the ship still now answers instead
  of doing nothing (`overHeldText()`: "Ship lost. A tug is on the way, N
  seconds out." / "Mission over. X returns to the sector." / "Encounter
  over. Enter plays again, X ...").
- **Comm-range and dock-range cues.** `updateStationRanges()` runs every
  sector frame next to the collision check and compares each station's
  range band (outside / comm / dock) before and after — stateless, the
  same before/after idiom as the warp-core alerts. Crossing inward:
  `comm_range` (a rising pair) + "Comms range. C hails Station Meridian;
  within 150 it docks." or `dock_range` (a rising triple) + "Docking
  range. C docks at Station Meridian." Crossing outward: `range_lost` (a
  falling pair) + "Out of docking range. Still in comms range." / "Out
  of comms range." The ranges themselves are untouched (Brian: upgrades
  will extend them). Warp drops out at 600, just outside comm range, so
  an arrival never trips the cue; the first frame after a roster build
  only records the band; undock sets it to "outside" silently.
  Machine-tested at 600 / 450 / 120 / 300 / 700 in that order — bands
  0-1-2-1-0 with the right line each time.
- **Docked is its own place.** `beaconAudible()` is false while docked,
  pushed to every beacon at the moment of docking by `applyBeaconMutes()`
  (updateTargeting can't — simTick is frozen while docked); the lock
  tick and tone stop and `locked` clears; and Brian's
  `space_station_interior1` loops on the music bus at `stationAmbientVol`
  0.35 (`SIM.audio.playMusic`, the 2.19 hook, finally with a track). The
  WAV master (29 MB, stereo 24-bit 44.1k) got a stereo 48k 128k MP3
  sibling, `audio/quadrant/space_station_interior1.mp3` (1.8 MB); the
  WAV itself is not served and **not committed** — Brian's call whether
  it goes in like the mining/laser masters did. The loop is fetched when
  the sector roster is built (cached, so re-entries are free), not in
  the boot preload set. Undock fades it over 1 s; `clearMission` stops it
  too, so leaving to the menu never leaks it. Machine-tested: `music`
  true while docked, false after undock, the fade confirmed gone 1.3 s
  later; the beacon mute is a one-line guard, verified by reading, not
  by ear (tests run with beacons off).
- **The vortex orbit demo** lives in `soundlab.html`, a new section
  ahead of the cues: Brian's eight `audio/quadrant/vortex/space_vortex1–8`
  recordings (all stereo 48k, 8 or 10 s) loop on eight HRTF panners
  orbiting the listener — radii 90–200, four one way and four the other
  at rates 0.18–0.5 rad/s, a shared multiplier on all eight, one shared
  height. Focus the box: Up/Down move every orbit ±15 per press (clamped
  ±300), Left/Right multiply the shared speed by 1.25 (0.125×–8×),
  Escape stops; a polite live region reads each change back. The eight
  files are manifest keys `vortex1–8` (and the interior is
  `station_interior1`), excluded from `AUDIO_PRELOAD` — it's now a
  curated filter rather than "every key", as the 2.19 comment said it
  would become. Machine-tested: all eight load, the arena takes focus,
  every key changes the status line, Escape stops. Nothing here is heard
  by anyone yet — it's built precisely so Brian can.
- **Parked on his instruction**: the other audio sets he's collecting
  ("do not worry about them yet").

### Phase 2, continued — a living sector, smarter enemies (the existing 2.1–2.8)

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

#### 2.8 Loot containers and hydrogen (from A.3/A.4) — moved into Phase 3 as 3.18

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

### Phase 3 — the moving world, the ports, the favor game (after the demo is heard)

Scoped with Brian in six rounds of questions on the night of 2026-09-04,
right after ideas6 (2.20) landed — three on the world and markets, three
more on his station-game additions the same night. His answers are in
Part C; the direction they set is A.6 and A.13. From A.6, A.9–A.13.
Nothing here is built. Same rules as Phase 2: one commit per numbered
item, machine-test at a local server with beacons off, docs in sync,
push, re-test at Pages, close every tab. Every number is a placeholder
in CFG or a data table for Brian's ear and hands.

**Build order**: 3.10 the quadrant (DONE) → **ideas7 first** (Brian,
2026-09-05, from flying 3.10: 3.24 the two bugs, DONE → 3.25 the escort
second pass and kill buffs, DONE → 3.26 laser levels and wear, DONE →
3.27 system damage and the repair crew, DONE) → **Phase 3L, the lab
round, DONE** (Brian, ideas8, 2026-09-05: L.1 the explorer, DONE → L.5
the 3D vortex, DONE → L.4 the flyby, DONE → L.8 the room, DONE → L.9
the lighthouse gate, DONE both halves) → **the three game items it
brought with it** (3.31 recorded station beacons, DONE → 3.29 the ship
page, DONE → 3.30 the tractor beam, DONE — **Phase 3L and its three
game items are all complete**)
→ 3.28 the quadrant's timed contract, DONE
→ 3.23 favor and the three ranges, DONE (Control rethought, now 3.23b)
→ **ideas9/ideas10, DONE** (Brian, 2026-09-05, after reading 3.23 as
built: 3.33 favor second pass, DONE → 3.34 a full stop to dock, DONE →
the lab second pass L.1b/L.4b/L.5b/L.8b, DONE → 3.32 reaction mass,
DONE) → **ideas11, DONE** (Brian, 2026-09-05, from playing the build
above: the home-station favor correction folded into 3.33, DONE → L.10
"Be the Way" voices, DONE) → **ideas10.txt, DONE** (Brian, 2026-09-05,
from flying: 3.39 the first screen speaks, DONE → 3.40 the lab links
home, DONE → 3.37 decoys confirmed and heard, DONE → 3.35 the tug second
pass, DONE → 3.36 the crew works the hull, DONE → 3.38 auto-target,
DONE) → **ideas11.txt reviewed and largely settled** (Fable, 2026-09-05
— the cube (A.13), its gates (3.22 addendum), control everywhere but
offered from Q3 (3.23b), the spoken coordinates and the protected
harbour cell, all direction; 3.41/3.42 proposed after the playtest) →
**3.43 silent test mode, DONE** (Round 30, Sonnet) → **3.41 the flight
course, DONE** (Round 31, Sonnet — built ahead of its own "after the
playtest" note, at Brian's direct request) → **Brian flies everything
since
3.24, plus the course** → **ideas12.txt, DONE** (Brian, 2026-09-05, from
flying: **3.50 the offline buzz, DONE → 3.51 Y speaks the totals, DONE
→ 3.45 five volume steps and the Beacons line, DONE → 3.49 the course
second pass, DONE → 3.44 B is the tractor in tiers, DONE → 3.48 F2's
equipped laser per slot, DONE → 3.46 four new laser families for slots
3–6, DONE → L.5c the vortex as six presets, DONE** (all eight, Round 33,
Sonnet; 3.47 the
stats page stays a discussion, not scheduled) → **3.54 Escort and
Defend drills on the mission menu** (ideas13.txt — FIRST, cheap, and
it exists to let Brian reach those missions for the playtest) →
**Brian flies/hears everything since 3.24** → **3.53 the course's
accuracy readout** (ideas13.txt, small) → **3.52 the tractor beam,
second pass** (queued 2026-09-06, held back from building until Part
C's cost-shape question is answered — see 3.52's own evaluation) →
**3.54/3.53/3.52 all DONE (Round 39)** → **Brian ear-tested Rounds
28–39, no problems (2026-09-07)** → **Phase 3E, the encounters**
(ideas14.txt + chat, 2026-09-07 — the Encounters submenu 3.56 DONE →
Shift+S 3.57 DONE → 3.58 the facing cone and cannon DONE → 3.59 turret
defense (3-zone) DONE → **3.65 the turret's second pass** (Brian, from
playing it — NEXT) → 3.60 the haul → 3.55 the distress tow → 3.61 the
minefield → 3.62 the shadow → 3.63 nebula transit → 3.64 the gate run →
3.59b (numpad 3×3) — with lettered audio sub-stages injected as Brian's
recordings arrive) →
**3.42 escort in
formation (an experiment, still waiting on 3.38 having been flown)** →
**quadrant 2
(ideas10: the economy lives
there, so the gate goes first)**: 3.18 containers and hydrogen (the
fare) → 3.14 the cargo limit (the 20,000 hold the stranger gate is
priced against) → 3.22 the gate and quadrant 2's skeleton → 3.11 ports
and F4 → 3.19 planets as ports → 3.12 the price levers → 3.20 hauling
and biomass → 3.21 threat escalation → 3.13 salvage gates and the drone
swarm → 3.23b control as investment (quadrant 3 — the Phase 4 line). Then
**Phase 3b**: 3.16 verbosity and the journal, 3.17 tutorials — once the
world has been flown, so the tutorials teach what is actually there.
Stop for Brian's ears after 3.10 (the first thing that *moves* — built;
being flown now), after 3.27 (the first thing that *breaks*), after
3.23 (the first thing that says *no*), and after 3.20 (the first thing
that *pays*).

**What Phase 3 is, in one paragraph.** Today the sector is four fixed
points, one friendly station, and one flat clock. Phase 3 makes it a
quadrant: a star at the center, planets that creep on orbits, ports with
their own prices and their own opinion of you, one combat zone and one
to three asteroid fields that come and go, all on a game clock that is
saved and reloaded so tomorrow's sky is today's. Every station exists to
serve something — a planet, the gate, later an anomaly — and wants what
that thing needs; bring it and the station warms to you, from a voice on
the comms to a place you can land to a station you *hold*. The delivery
run keeps its fixed sector untouched. The pilot's new loops: pick a
field by what it holds, pick a port by what it pays and how it feels
about you, haul between ports, feed a station from its planet, clear
zones that harden the more you fight and soften the longer you don't —
and, once one station trusts you, take the gate to the frontier.

#### 3.10 The quadrant: a hand-authored sky with moving parts (A.10) — DONE

Built as the foundation 3.11/3.19/3.21/3.23 layer onto — this item is
positions, spawning, drift, the game clock, and the save; it does NOT
yet include `serves`/`wants`, unions, favor/control, or threat, all
still to come. Every deviation from the original brief below is a
scope call made while building, not a silent drop.

- **`QUADRANT`** replaces `SECTOR_POIS` for the open campaign (the Sector
  menu item and everything reached from it). `SECTOR_POIS` stays exactly
  as it is for the delivery run — its legs are hand-tuned (A.10);
  `makeSectorRoster()`'s one fork (`if (demo) ... else makeQuadrantRoster()`)
  is the entire seam between the two. Placeholder names, six fixed rows:

  | Name | Kind | Ring | Rate |
  | --- | --- | --- | --- |
  | The Star | star | 0 | — |
  | Station Meridian | station | 3,500 | 0 |
  | Planet A | planet | 6,000 | 6 deg/hour |
  | Station Two | station | 9,500 | 0 |
  | Planet B | planet | 11,000 | 6 deg/hour |
  | Jump Gate | gate | 14,000 | 0 |

  Each row: `{ name, poiType, desc, ring, degPerHour, phaseDeg }` — no
  `serves`/`wants` fields yet (3.11/3.23 add those when the market and
  favor exist to read them). Stations and the gate hold station;
  planets creep at a full orbit per 60 play-hours. Position is
  `ringPos(entry)`: `polar(ring, phaseDeg + degPerHour × clockHours)`
  from `profile.clock`, computed fresh every call — no velocity
  integration, so the save really is nothing but rates and phases.
  **Not built**: the `UNIONS` table/control-share display — that's
  3.23's.
- **The star**: a beacon at the origin, a low 30 Hz drone with a slow
  flicker. Audible everywhere in practice: `CFG.beaconMax` (40,000, set
  long before this round) already exceeds `quadrantRadius` (16,000), so
  no separate "always audible" override was needed. C at it: "The Star.
  Nothing answers."
- **Spawned entries** — the moving parts: one combat zone
  (`spawnZone`) and `CFG.quadrantFieldCount` 2 asteroid fields
  (`spawnField`), placed by `findSpawnPos`: `spawnMinFromPilot` 5,000–
  `spawnMaxFromPilot` 11,000 from the pilot for 50 tries; if none
  validate, 50 more anywhere in `quadrantRadius` (the pilot-distance
  rule dropped, everything else kept); if THAT also fails, the last
  candidate is used regardless — every attempt is checked against
  `spawnMinGap` 4,000 from every existing point and `spawnMaxFromStation`
  11,000 of a station. A cleared zone or a worked-out field is replaced
  the moment its encounter is exited (`returnToSector`, decided and
  executed BEFORE the sector roster rebuilds, so the fresh roster never
  shows the old one). Built with a **fixed field count of 2**, not a
  variable "1 to 3" — a deliberate simplification of "never zero, at
  most 3": two is replaced 1-for-1 forever, satisfying "never zero"
  without a separate growth rule nothing yet calls for. Spawned field
  names walk `GREEK_FIELD_NAMES` from Rho (Sigma, Tau, Upsilon...),
  cycling with a number suffix past the list; the zone is always
  "Contested Zone." Exit announcement folds the sighting into the SAME
  `say()` as everything else leaving fires (the SPEC 2.15 double-say
  lesson applied again): "Asteroid Field Rho is worked out. Asteroid
  Field Tau sighted, mixed deposit. Bearing 50 right. Distance 6030."
- **Fields drift**: a field's `degPerHour` is derived once at spawn time
  from `CFG.cloudDriftPerS` 5 (a linear speed) converted to angular
  speed at its own ring, always prograde — same `ringPos` formula
  planets use. `returnToSector` already follows the field's CURRENT
  position rather than a snapshot, since the sector roster is rebuilt
  fresh from `profile.quadrants` (which has the live rates/phases) every
  time, not from a stored position.
- **Typed fields**: `ice` / `iron` / `mixed` by `FIELD_TYPE_WEIGHTS`
  {0.3, 0.3, 0.4}, biasing `makeMiningRoster`'s rock draw via
  `FIELD_TYPE_ROCK_WEIGHTS` (ice-rich 60% ice, iron-rich 60% iron, mixed
  even) — `makeMiningRoster(fieldType)` takes the type as an optional
  argument; called with none (the delivery run's Kappa, the standalone
  drill), it is byte-for-byte the original function, first-rock-always-
  Ice quirk included. Named at the hail ("Asteroid Field Rho control:
  mining rights confirmed... Iron-rich, plenty.") and on the map
  (`fieldTypeNote`). Depletion: `CFG.cloudOreBudget` 40,000 per field,
  drained by the SAME `ore += amount` gain both extraction (`vacTick`)
  and the dust vacuum (`dustTick`) already produce (`depleteCurrentField`,
  a one-line hook after each) — not saved mid-tick, only at the next
  transition, matching "never mid-encounter." Fullness in words only:
  plenty / thinning / nearly worked out, never a number.
- **The game clock**: SPEC 2.17's session-only `simClock` is now
  **`profile.clock`**, persisted, no session mirror at all — every read
  is `profile.clock` directly, so a reload can never desync a session
  value from a saved one (there isn't a session one anymore). Backs
  orbits, drift, spawns, and mission cooldowns, which — per the original
  brief's own note — now persist too: `profile.missionCooldownUntil`
  replaces the SPEC 2.17 session object of the same shape, no other
  code changed. Advances on the same live/not-under-an-overlay gate as
  the delivery clock.
- **The quadrant save**: simpler than first specced — `profile.quadrants`
  keyed by id (only `'home'` exists; `profile.quadrantId` names the
  current one, always `'home'` until 3.22's Frontier), each `{ zone: {
  name, pos }, fields: [{ name, type, ring, phaseDeg, degPerHour, budget
  }], fieldSeq }`. No `threat`/`ports` yet — those fields belong to
  3.21/3.23 and will be added when built, `Object.assign` already
  preserving whatever a future version adds. **No separate `saveQuadrant()`
  function** — `saveProfile()` already serializes the whole profile
  object wholesale (confirmed unchanged since SPEC 2.18), so the
  quadrant persists through the SAME calls already used for
  transitions: `returnToSector()` (leaving any encounter), the mission-
  accept flow, and a new quiet `CFG.quadrantSaveEveryS` 30-second timer
  in open sector flight (`simTick`, mode `'sector'` only — never mid-
  encounter). `ensureQuadrantHome()` creates the very first zone/fields
  the first time a profile ever picks Sector, using Station Meridian's
  own position as the "pilot position" the initial spawn measures from
  (there's no real ship position in the sector frame yet at that
  moment). `PROFILE_VERSION` → 3; a v2 save backfills `clock: 0`,
  `missionCooldownUntil: {escort:0, defend:0}`, `quadrants: {}`,
  `quadrantId: 'home'` — **NOT** built: folding old `profile.stations`
  influence into a new favor number, since favor doesn't exist until
  3.23; that migration step is 3.23's to add when it lands.
- **Beacons**: `beaconAudible()` gained a distance cutoff —
  `CFG.beaconAudibleDist` 8,000, or the selected target at any distance
  — but ONLY for the open quadrant (`if (demo) return true;` keeps the
  delivery run's four-point sector exactly as tested before, since an
  8,000 cutoff there would have silenced points the shipped/tested demo
  currently relies on hearing from further out).
- **The map, grouped by kind**: `mapBuildItems()` (sector mode only)
  produces heading rows — Stations, Planets, Asteroid fields, Contested
  zone, Gate, Star, in that order, nearest-first within each, a count on
  the heading ("Stations, 2.") — with first-letter jump to a heading
  (s/p/a/c/g; the star has no letter, every other initial being taken).
  A heading row refuses Enter ("That is a heading..."). Applies to the
  delivery run's map too (nothing demo-gates it) — harmless with only
  four points (just two short headings), and one less special case to
  maintain. **Not built**: a zone's threat word, a port's favor tier on
  the line — both read from systems that don't exist yet.
- **The tug and mission destinations, fixed in passing**: two real bugs
  the quadrant's second station exposed immediately. `startTug()` used
  to find "the" station by scanning `SECTOR_POIS`, which only ever had
  one — with two stations and `SECTOR_POIS` no longer even backing the
  open campaign, it would have crashed. Now `nearestStationTo(pilotPos)`
  picks whichever is closer (demo keeps its own Meridian-only branch,
  unchanged). `placeAtStationStart()` similarly picked "whichever
  station turns up last while scanning `targets`" — harmless with one
  station, wrong with two (it would start new pilots at Station Two).
  Now matches Station Meridian by name explicitly. SPEC 2.17's escort/
  defend mission labels named the delivery run's own "Planet Auren"/
  "Field Kappa" unconditionally; `missionDestinationPlanet()`/
  `missionDestinationField()` now name the nearest real planet / the
  quadrant's own first field instead, so a hail from Station Two never
  advertises a place that isn't in this quadrant.
- **`__sim`**: `state().quadrant` (the zone and every field, with type/
  budget/ring — no favor/control, not built), `state().clock`; `poke({
  clock, depleteField: name })` for testing (force-deplete a named field
  without mining 40,000 ore for real).
- **Test**, machine-tested at a local server in a fresh tab (a real bug
  was caught this way — see below): a fresh profile's first Sector visit
  creates a 2-field quadrant with correct positions/types, the ship
  starting at Station Meridian specifically (not Two); the grouped map
  reads all six headings with correct counts, nearest-first ordering,
  and typed field detail, and first-letter jump reaches every group
  correctly including the "no such group" refusal; the star and gate
  give their placeholder lines; mining a typed field draws visibly
  biased rock types; force-depleting a field via `poke` and exiting
  correctly retires it and reports a freshly sighted replacement with a
  real bearing, while an untouched field is left alone; clearing the
  Contested Zone and exiting respawns it elsewhere with a bearing, and
  the "near X" phrasing correctly drops itself when X has moved; the
  distance-based beacon cutoff was confirmed muting far points while
  leaving near ones and the selected target audible, with the delivery
  run's own beacons confirmed unaffected; a seeded v2 profile migrates
  cleanly to v3 and can immediately enter Sector without error; the tug
  from a death near Station Two correctly goes to Station Two, not
  Meridian; the escort/defend mission hail correctly named "Planet A"
  and "Asteroid Field Rho" instead of Auren/Kappa; the delivery run
  itself (`?run=delivery`) was re-run start to finish (four fixed
  points, unaffected beacon behavior, full mining-and-deliver) with no
  change in behavior; the standalone Combat and Mining training drills
  were confirmed unaffected (identical rock draw for Mining's no-
  argument call, identical five-ship win/retry for Combat). One real
  bug was found and fixed DURING this pass: `ensureQuadrantHome()`
  assigned `profile.quadrants.home` before its `zone` field was
  populated, and `spawnField`'s own avoid-list computation
  (`existingQuadrantPositions`) read `q.zone.pos` in that exact window,
  throwing on the very first Sector visit — caught because a stale
  console error from the crash persisted across a same-tab reload and
  looked like it might be unrelated old noise until a genuinely fresh
  tab confirmed it was real, then confirmed the fix. **Not stress-
  tested**: the spawn algorithm's constraint-satisfaction under many
  repeated forced spawns (the original checklist's "200 forced spawns")
  — only the handful of real spawns this session produced were checked
  by hand, all valid; a batch/programmatic version of that check is a
  reasonable follow-up before this ships to Brian if the spawn rules
  ever look wrong in play. Zero console errors throughout. Not yet
  heard by Brian.

#### 3.24 Two bugs from play (ideas7, 2026-09-05) — DONE

- **Shift+1 and Shift+2 arrived as `!` and `@`.** `onKeyDown` matched
  the slot keys on `e.key`, which Shift turns into the symbol on a US
  layout, so `selectSlot(i, reverse)` never fired with Shift held and
  the "cycle back" half of SPEC 2.12 had never actually worked from a
  real keyboard (the ORIGINAL tests that shipped 2.12 dispatched
  synthetic events with `key: '1'` and `shiftKey: true` together, which
  is not what a real keyboard sends — that's why it looked tested and
  wasn't). Fixed: a new check ahead of the existing Shift chords (Shift+
  W/T/Tab/R) reads `e.code` directly when `e.shiftKey` is set —
  `/^Digit([1-6])$/.exec(e.code)` — independent of the shift-layer
  symbol or keyboard layout, and calls `selectSlot(digit-1, true)`
  before the plain digit switch ever sees it. The unshifted digits (`1`
  through `6`) were never affected — `e.key` already returns the plain
  digit there — and are confirmed unchanged.
- **Selling ore busted the delivery run.** Brian sold his 15,000 from
  the hail menu at range; the handover never happened and the run's
  clock ran on. Fixed with a new `oreSellBlocked()` (`demo &&
  !demo.delivered`), checked by BOTH "Sell ore" entries' `ready` (the
  hail menu's and the landed station menu's — they were textually
  identical, one `replace_all` edit) and `desc` (so browsing to the item
  previews the block, not a stale sell price): "That ore is the
  delivery. Dock at Station Meridian to hand it over." `dockAtStation`'s
  own automatic handover is untouched (still fires the instant the hold
  meets the goal); a hold short of the goal was already unsellable
  (`ore <= 0` isn't the gate here — the goal-short case just never had
  enough to matter) — restated as: the new check runs BEFORE the
  existing `ore <= 0` check, so it's the first and only reason for a
  refusal while a delivery is owed. The open quadrant (no `demo`) is
  untouched, confirmed by selling ore normally there in testing.
- **Also fixed in passing**: the "Sector" mission-menu item's own
  description still said "four points of interest" — stale since 3.10
  replaced the open campaign's sector with the quadrant. Reworded to
  name what's actually there.
- **Also added, at Brian's request** (not itself a bug, folded into this
  round since it's a one-line addition): a **Sound Lab** entry at the
  end of the mission menu — he can't reach `soundlab.html` directly (no
  `file://` support since SPEC 2.19) so a link from the one page he can
  already reach is the way in. `run: function () { location.href =
  'soundlab.html'; }` — a real navigation, not an overlay; Back returns.

Machine-tested at a local server: a realistic Shift+1/Shift+2 dispatch
(`e.key` set to the actual shifted symbol `!`/`@`, `e.code` set to
`Digit1`/`Digit2`, matching what a real browser sends) correctly cycled
the current slot backward and switched to a different slot respectively,
confirmed by the spoken slot/version and `__sim.state().laser`; the
plain unshifted `1` key confirmed still switching/cycling forward
correctly (regression); selling ore from the hail menu during a pending
delivery was refused with the correct line and the ore count unchanged,
the same refusal confirmed on the landed station menu's "Sell ore" too;
docking still auto-delivered and completed the run normally; selling
ore normally AFTER delivery (`demo.delivered` true) confirmed working
again; the open quadrant's own Sell ore confirmed unaffected throughout;
the Sound Lab menu item confirmed reachable and correctly navigating
(tab title changed to "Headless Space Sim — Sound Lab") with zero
console errors on the destination page. Zero console errors throughout.
Not yet heard or flown by Brian.

#### 3.25 Escort, second pass, and kill buffs (ideas7) — DONE

Brian flew 2.17's escort and it was too hard to feel good and too
short to build to anything. Numbers are the same placeholders-for-his-ear
as everything else; the shape is decided.

- **Length and waves**: `missionEscortLegS` 90 → 180; three waves of
  **three Drones** (the corvette-class roster ship, hull 40, `SALVAGE`
  3 each) at `missionEscortWaveTimes` [20, 70, 120] — the third wave
  arrives with a minute to go, so a pilot who cleared two waves has the
  freighter under fire as it leaves, exactly the "mediocre effort"
  Brian described. Defend keeps its two waves of three (accepted by
  default), gets the shield and the halved strikes below.
- **Strikes halved**: `missionStrikeDmg` 15 → 8 against the friendly.
  Raiders still only ever fight the *player* once provoked (2.17's
  rule, unchanged — Brian: "continue to only attack the human player
  by the ones they are actively attacking").
- **The friendly has a shield**: a pool like the pilot's —
  `friendlyShieldPool` 60 absorbs strikes first, hull takes the rest;
  regenerates `friendlyShieldRegenPerS` 1.5 (a wave cleared fast leaves
  the freighter near fresh for the next). Spoken on hits: "Raider hits
  the Freighter. Freighter shields 40 percent." then, once, "Freighter
  shields down." then the hull lines as now. I / F2 read the friendly's
  shield and hull while a mission is live.
- **Partial reward** (Brian: by freighter hull remaining): success
  requires the friendly alive at the end, as now; the credits paid are
  `missionCredits` × the friendly's hull fraction at the end (shield
  ignored), rounded, spoken with the outcome ("Mission complete.
  Freighter home at 60 percent. 180 credits."). Salvage per kill is
  unchanged (already per kill). Favor, once 3.23 exists, follows the
  same fraction.
- **Kill buffs** (Brian: missile resupply, laser boost, shield top-up)
  — a `KILL_BUFFS` table, rolled once per ship kill, at most one buff
  per kill, spoken in the SAME `say()` as the kill line (the 2.15
  rule): **missile resupply** `killBuffMissileChance` 0.35 — one missile
  back in the magazine ("Missile recovered, 6 left."); **laser boost**
  `killBuffLaserChance` 0.35 — the selected slot does +`killBuffLaserPct`
  25 % for `killBuffLaserS` 30 s, a second boost extends the timer, never
  the size ("Laser boost, 30 seconds."), a soft rising cue, ticking off
  silently, "Laser boost over." at the end; **shield top-up**
  `killBuffShieldChance` 0.3 — `killBuffShieldPts` 15 back into the
  pool, or 4 s off a disrepair in progress ("Shields plus 15."). Buffs
  apply in every combat, not just missions — a kill is a kill. The
  "semi-permanent" buffs Brian mentioned are the laser levels (3.26);
  everything here is temporary or a consumable.

Built exactly as scoped above; one real bug found and fixed along the
way, and one grammar bug found and fixed. **The shields-down bug**: the
friendly's shield regenerates continuously (`friendlyShieldRegenPerS`),
so a naive "was it above zero before this hit" check re-triggered
"Freighter shields down." on every subsequent hit once the shield sat
near empty and ticked up a fraction between strikes. Fixed with a
sticky `f.shieldDown` boolean (added in `makeMissionRoster`): the
"just dropped" line only fires on the transition into
`shield <= 0.5`, and only re-arms once the shield genuinely recovers
past 10% of the pool — confirmed via deterministic testing
(`__sim.poke({friendlyShield, missionNextStrikeIn})` plus a mocked
`Math.random` sequence to force repeated strikes) that the line now
fires once, stays silent through consecutive low-shield hits, and
correctly re-fires after a real recovery followed by a second drain.
**The grammar bug**: `missionIntro()`'s Defend text originally read
"Defend the Miner from the raiders waves." (a pluralized noun used
adjectivally) — split into separate `singular`/`plural` locals so the
"from the X waves" phrase uses the singular form; re-verified live at
a local server after the fix.

Machine-tested at a local server end to end: accepted both Escort and
Defend fresh (profile cleared via `localStorage.removeItem` in a
separate script call BEFORE the reload, not after — clearing it in
the same script as the boot click is too late, since `loadProfile()`
already ran at page-load time against the OLD profile; a repeat of a
gotcha from earlier this session) and confirmed both intros read
correctly: Escort — "Stay near the Freighter and clear any drone that
engages you. ... The Drones hold their fire on you until you hit
them — until then they harass the Freighter."; Defend — "Defend the
Miner from the raider waves. ... The Raiders hold their fire on you
until you hit them — until then they harass the Miner." Confirmed via
`__sim.poke` (`friendlyHp`, `friendlyShield`, `missionNextStrikeIn`,
`missiles`, `shieldPool`) and a seeded `Math.random` sequence (kept
mocked through an `await` spanning the actual async kill resolution,
not restored immediately after the triggering keypress, since
`rollKillBuff()` runs inside `beamTick`'s per-tick `setTimeout` chain)
that all three kill buffs fire correctly and independently: missile
resupply increments `missiles` and speaks "Missile recovered, N
left."; laser boost sets a 30 s window, multiplies beam damage by
1.25× while active (confirmed via `beamTick`'s tick damage before/
after), speaks "Laser boost, 30 seconds." on grant and "Laser boost
over." on expiry, and a second grant while one is active resets the
timer to a fresh 30 s rather than stacking; shield top-up adds 15 to
the pool (or shaves 4s off an in-progress disrepair) and speaks
"Shields plus 15."; a failed roll on all three correctly grants
nothing and the kill line reads normally. Confirmed buffs fire in the
standalone Combat training drill too, not just inside a mission
(Brian's explicit requirement — a kill is a kill everywhere). Confirmed
the friendly's shield absorbs strikes before hull, regenerates between
waves, and the partial-hull-fraction reward computes and speaks
correctly ("Mission complete. Freighter home at N percent. M
credits.") both at full hull and after damage. F2/F3/I all confirmed
reading the friendly's shield/hull and the laser-boost countdown while
a mission is live. Zero console errors throughout. Numbers (wave
timing, damage, buff chances/magnitudes) are all placeholders for
Brian's ear, same as everything else in Phase 2/3. Not yet heard or
flown by Brian.

#### 3.26 Laser levels, wear, and repair (ideas7 — replaces 2.12's free cycling) — DONE

- **Levels are earned, not cycled.** Each family (mining, rapid) has an
  **owned level** per profile, `profile.laserLevels` `{ mining: 1,
  rapid: 1 }`, and a **health** per level, `profile.laserHealth` `{
  mining: 100, rapid: 100 }`. The eight recordings per family map to
  levels 1–8 exactly as they map to versions today. `1` cycles the
  slot's family *among owned levels* (1..owned), Shift+1 cycles back
  (3.24's fix makes that real); an unowned level is refused by name
  ("Mining laser level 4 is not fitted. The shipyard sells it."). The
  switch sound and delay stay per slot (SPEC 1.14).
- **Damage per level** (Brian): +20 % per level to level 5, +10 % per
  level after: `tickBase × (1 + 0.2 × (L−1))` for L ≤ 5, then × 1.1
  per level above 5. Levels 6–8 back to 20 % is late game (a module,
  or a milestone — not specced). Replaces 2.12's flat 1.1^(L−1).
- **Buying a level** (Brian: at the station only): the shipyard's
  Lasers line lists each family's next level — `laserLevelCredits`
  200 × N credits and `laserLevelAlloy` N alloy (the first 3.13 gate
  that actually bites) — "Need 2 more alloy" refusals name the resource.
- **Wear** (Brian: usage decays a laser to a prior level): every burst
  fired at the owned level takes `laserWearPerBurst` 1 point off that
  level's health, hit or miss. **At 0 the level drops by one** and the
  health resets to 100 — the bought level is lost; the pilot hears it:
  "Mining laser worn down to level 4." A level below the owned one
  (chosen deliberately with 1/Shift+1) wears the SAME per burst but
  costs less to repair — that's Brian's "use a lower laser on the easy
  job." **Repair at the station only**: `laserRepairCreditsPerPoint` 2
  × the level, per point restored, on the shipyard's Lasers line
  ("Repair mining laser level 5, 38 points, 380 credits."). No repair
  at range. Wear is spoken only at 50 % ("Mining laser at half.") and
  25 %, and read by F2 ("Mining laser level 5, health 62.").
- **Migration**: a v3 profile's `slots` (which held version ids like
  `mining3`) become owned levels — the highest version id found per
  family is the owned level, health 100 — so nobody loses a laser they
  had. `PROFILE_VERSION` → 4.

Built as scoped, with two deliberate simplifications and one real bug
found and fixed:
- **One health value per family, not per level.** The spec text names
  the field `profile.laserHealth { mining, rapid }` — a single number
  per family — while also saying a deliberately-lower selected level
  "wears the SAME per burst but costs less to repair." Read literally
  those two claims don't both fit a per-level health model without
  either a health array per level (contradicting the given data shape)
  or an exploit (rack up wear at the top level, downshift to repair
  cheap, upshift back to a "free" full-health top tier). Built as ONE
  health tracker per family that always represents the OWNED (top)
  level — firing ANY selected level, owned or a deliberate downshift,
  drains that same tracker at the same rate (matching "wears the
  same"), and the repair price on the shipyard's Lasers line is always
  `laserRepairCreditsPerPoint x the OWNED level`, matching the spec's
  own worked example exactly (level 5, 38 points, 380 credits = 2x5x38).
  There is no cheaper repair at a downshifted level in this build —
  flagging this explicitly for Brian's ear/decision rather than
  guessing at an unspecified mechanic.
- **The shipyard is one flat submenu**, not a per-family sub-sub-menu:
  `LASER_SHOP` lists a Buy and a Repair line for each of the two
  families (four lines total) under a new "Lasers" entry on the
  station menu, same browsable shell as Modules.
- **A real bug found in testing**: the v3→v4 migration initially never
  fired. `defaultProfile()` seeds `laserLevels`/`laserHealth` with valid
  numbers before a saved profile is merged in, so a `typeof
  profile.laserLevels[fam] !== 'number'` check (the pattern every
  earlier migration in this file uses) can never tell "the save didn't
  have this field" from "the default already filled it in" — a seeded
  v3 save with `slots: ['mining5', 'rapid2']` loaded as `laserLevels:
  {mining:1, rapid:1}` instead of the intended `{mining:5, rapid:2}`.
  Fixed by capturing the raw parsed `saved` JSON in a variable visible
  outside `loadProfile`'s try block and checking THAT for the field's
  presence, not the already-defaulted `profile`. Re-tested after the
  fix and confirmed correct.

Machine-tested at a local server: a fresh profile boots to version 4
with `laserLevels {mining:1, rapid:1}` and `laserHealth {mining:100,
rapid:100}`; firing a burst drops health by exactly 1 (hit or miss);
seeded health crossing 50 speaks "Mining laser at half.", crossing 25
speaks "Mining laser at 25 percent."; forcing health to 0 at an owned
level of 3 drops it to level 2, resets health to 100, speaks "Mining
laser worn down to level 2.", and clamps the flying slot from
`mining3` down to `mining2`; cycling (`1`/Shift+1) wraps strictly
within 1..owned (confirmed 2→3→1→2 with owned=3, and confirmed it
CANNOT reach level 2 when owned was dropped to 1 without also fixing
the slot — correctly refused with "Mining laser level 2 is not
fitted. The shipyard sells it.", the defensive path exercised
deliberately via a direct test poke rather than the normal drop
path); the shipyard's Lasers line correctly lists price/afford text,
buying deducts the right credits and alloy and resets health to 100,
repairing deducts `points x 2 x owned level` and resets health to 100,
and all four refusals (insufficient credits, insufficient alloy,
already full health, already at level 8) were each confirmed with the
correct spoken line and no state change; F2 correctly reads "Mining
laser level N, health N." for both families; the migration bug above
was found, fixed, and re-confirmed against three seeded profiles (a
pre-4 save recovering the right owned levels from its slots, a proper
v4 save with real data left untouched, and a v4 save with a
deliberately-downshifted slot below its owned level surviving
migration without being clamped); a plain empty-slot press (slot 3)
and an ordinary damage tick against a live target were both confirmed
unaffected (regression). Zero console errors throughout. Numbers
(level multiplier curve, buy/repair prices, wear rate, alert
thresholds) are all placeholders for Brian's ear, same as everything
else in Phase 2/3 — and the single-health-per-family read above is
flagged for his call specifically, not just the numbers. Not yet
heard or flown by Brian.

#### 3.27 System damage and the repair crew (ideas7 — un-defers Part C's "subsystem damage") — DONE

- **What can break** (Brian's list, plus one): each laser slot
  (independently), missiles, decoys, shields, the warp engine,
  forward/back thrust (never turning or pitch), the targeting sensor,
  and — added — the **cargo hold**. `SYSTEMS` table, each with a spoken
  name, a knockout weight, and its own offline and half effects:

  | System | Offline | At 50 % |
  | --- | --- | --- |
  | a laser slot | that slot refuses to fire | half damage |
  | missiles | F refuses | launches at half speed |
  | decoys | D refuses | a decoy has a 50 % chance to fizzle |
  | shields | G refuses; a raised shield drops | pool max halved |
  | warp engine | H refuses; regen stops | jump range halved |
  | thrust | W and S do nothing; stabilizers still work | half thrust |
  | targeting sensor | no lock, no tick, Tab still cycles | lock zone halved, tick slower |
  | cargo hold | 2 % of the ore spills per further hit | 1 % |

- **What breaks it** (Brian's answer): only an enemy **missile that
  lands on the hull** — not on a raised shield, never a beam —
  `knockoutChance` 0.4 per hit, one system, drawn by weight
  (`SYSTEMS[i].weight`: decoys 3, a laser slot 3, sensor 3, missiles 2,
  cargo 2, thrust 2, shields 1, warp 1). Spoken with the hull line:
  "Your hull 62. Targeting sensor offline." A system already broken
  can't be drawn again.
- **The crew** (Brian: standard on every ship; the module is the
  upgrade): every ship has a repair crew that works broken systems
  **automatically, one at a time**, in a fixed priority — shields,
  thrust, sensor, lasers, missiles, decoys, warp, cargo. Base speed
  `repairHalfS` 90 to 50 % and 90 more to full. `repair_crew.wav`
  (Brian's new asset, `audio/ships/repair_crew.wav` → an MP3 sibling and
  manifest key `repair_crew`) plays on the UI bus each time the crew
  starts a system; at 50 % a chime (`repair_half`, new cue) and
  "Targeting sensor at 50 percent, usable."; at full, "Targeting sensor
  repaired." Docking still repairs everything instantly, as now.
- **Upgrades** (the module): `repair_crew` in `MODULES` — 500 credits,
  2 alloy — halves both times (45/45); a second tier (400 credits) to
  30/30; planet resources replace credits for a third tier later. F2
  lists the crew's tier and, while anything is broken, what it's on and
  how far along.
- **Test**: force a knockout via `poke({ knockout: 'sensor' })`; every
  offline/half effect in the table; the priority order; the two
  announcements and the cue; docking clears all; the crew module halves
  the times.

Built exactly as scoped, laser slots included dynamically (one entry
per FITTED slot, weight 3 each — a two-laser ship draws from 9 systems
total, matching the "nine systems" figure named when this item was
scoped). Every effect in the table is wired at its own call site
(`startBeam`/`beamTick` for a laser slot, `fireMissile`/`stepMissile`
for missiles, `fireChaff` for decoys, `shieldKey`/a new `shieldPoolMax()`
helper for shields, `startWarp`/`updateWarpCore`/`warpReachText` for the
warp engine, `simTick`'s thrust block for thrust, `zoneRad`/
`updateTargeting`/`tickBeat` for the sensor, `hullHit` for the cargo
spill) rather than one central dispatcher — each system's "offline"
and "half" behavior lives next to the code it actually changes, same
as the rest of this codebase's style. `hullHit` gained an `isMissile`
parameter, true ONLY at the one call site that's an enemy missile
actually landing on the hull (confirmed by reading every other call
site — the enemy beam tick, and `updateCollisions`' station/planet
impact — neither passes it); the knockout roll and the cargo spill
share that one function, folded into ONE `say()` call with the hull
line (the SPEC 2.15 rule). The repair crew is priority-PREEMPTIVE, not
FIFO: `updateRepairCrew` recomputes the highest-priority broken system
every tick, so a higher-priority system breaking mid-repair steals the
crew away from whatever it was working, leaving the interrupted
system's partial progress in place — confirmed in testing (thrust
partway through repair, shields knocked out mid-job, crew switched to
shields immediately while thrust's progress stayed frozen). The
repair-crew module is genuinely tiered (`repair_crew_1`/`_2` in
`MODULES`, the second requiring the first) — the first alloy-costing
and prerequisite-gated entries that table has ever had, so
`moduleText`/`buyModule` both grew optional `alloy`/`requires` handling
generalized enough for any future module to reuse. Docking
(`dockAtStation`) and every "fresh start" path (`startDemo`,
`startMission`, the standalone drill's Enter-retry after a loss) call
the same `repairAllSystems()`; a mid-run mission abandon
(`clearMission`) does NOT clear broken systems, matching hull/ore's own
persist-across-a-sector-run behavior.

Machine-tested at a local server: every system's offline refusal and
half-effect confirmed individually via `poke({knockout: id})` and
`poke({systemHealth: {id: N}})` — a broken laser slot refuses to fire
and a half one deals exactly half damage (28 at full health vs. 14 at
half, same target/range/aim, confirmed via forced A/B bursts); missiles
refuse when offline and fly at exactly half speed when half (65 vs.
130 u/s, stored on the missile itself so a mid-flight repair doesn't
retroactively speed it up, since `steerToward` re-normalizes every
guided frame); decoys refuse offline and fizzle at exactly the
configured 50% chance when half (confirmed both branches via a seeded
`Math.random`); shields refuse to raise offline, a raised shield drops
silently the instant the system breaks, and the pool max halves at
half health (confirmed `shieldPoolMax()` computing 22.5 from 45, the
live pool clamping down to it, and shields still raising successfully
at half); the warp engine refuses to spool offline, and jump range
halves at half health (confirmed a jump whose full `need` was ~3711
correctly capped to exactly 2000 — half of the 4000 charge on board —
and returning `dry: true`); thrust does nothing at all offline and
exactly half acceleration at half (58.5 units/s of speed gained from
1 second of thrust at full vs. 29.3 at half); the targeting sensor
drops or can never acquire a lock while offline (Tab/T confirmed still
working), and at half both the lock zone (8°/12° confirmed halved to
4°/6°) and the tick's own interval are affected; a broken cargo hold
spills exactly the configured percentage of the current hold on every
further hull hit (20 of 1000 ore at offline's 2%, 10 at half's 1%,
both folded into the same line as the hull number). The knockout draw
itself (chance-gate then weighted selection, excluding anything
already broken) was verified with an isolated 200,000-trial simulation
of the identical algorithm in Node: the no-knockout rate matched the
configured 60% almost exactly, every system's observed pick rate
matched its weight's expected fraction closely, an all-but-one-broken
scenario only ever drew the one remaining system, and an
everything-broken scenario always came back empty — confirming the
math is sound without depending on live missile-flight timing (which
turned out to be genuinely awkward to force deterministically through
the real combat AI; the isolated simulation was the more reliable
check). The repair crew's priority order and preemption, the module
tiers (bought sequentially, confirmed the CFG override lands: 45 after
tier 1, 30 after tier 2), the alloy-cost and prerequisite refusals, F2
reading the crew's tier and every broken system with its health and
whether the crew is on it, and I (`statusReport`) reading the same
broken-systems list were all confirmed. Docking was confirmed clearing
every broken system at once and announcing "Systems repaired."; a full
regression pass on the standalone Combat training drill (kill all
five, "Victory", the SPEC 3.25 kill buffs still firing correctly
alongside this) confirmed unaffected. **One testing-methodology
gotcha, not a game bug**: partway through this session's testing the
browser pane silently became visible (`document.hidden` flipped from
true to false), which resumed `requestAnimationFrame` WHILE a test
script was still also manually driving `__sim.step()` — the two
together advanced the sim at roughly double speed for one measurement
(the repair crew's timed rate looked ~2x faster than the configured
`repairHalfS` should allow). Re-verified the actual mechanism was
correct by reading `CFG.repairHalfS` directly off `__sim.state()`
rather than trusting the polluted rate measurement — confirmed 30
after both module tiers, matching the purchase math exactly; the
formula itself (`100 / (repairHalfS * 2) * dt`) was never in question,
just this one measurement's real-time assumptions. Zero console errors
throughout. Numbers (the 40% knockout chance, all eight weights, the
90-second base repair time, every per-system offline/half multiplier)
are placeholders for Brian's ear, same as everything else in Phase 3.
Not yet heard or flown by Brian.

**Addendum (ideas10.txt, 2026-09-05): repairs spend reaction mass.**
Brian, after the hull-repair item was written: "yes, all repairs use
reaction mass." From 3.36 on, `updateRepairCrew`'s system work above
draws `repairRcsPerPoint` (0.2) of reaction mass per percent point
restored, through `spendRcs()`, and pauses at `repairRcsFloor` (10)
with "Damage control paused: reaction mass low." — the same rule, the
same knobs, as the hull. Nothing else here changes; the rates, the
priority, the preemption, and the two crew modules stay as built. It is
built as part of 3.36, not re-opened here.

### Phase 3L — the Sound Lab as an HRTF laboratory (ideas_crazy_7 + ideas8, 2026-09-05)

Brian's notes on a ten-point review of the lab (`ideas_crazy_7.txt`)
and his answers (`ideas8.txt`, both untracked like every ideas file).
**Only the five items he bracketed are written** — L.1, L.4, L.5, L.8,
L.9, numbered to match the note so he can cross-read it. Deliberately
NOT written, on his instruction: the turn-your-head demo (#2 — its
listener-rotation machinery is built anyway, inside L.8), stereo-vs-3D
(#3), the breathing radius (#6), the localization game (#7, "leave it
out"), the cue audition position (#10), and Doppler. All of it lives in
`soundlab.html` on the same shape as the vortex demo today: native
buttons to start and stop, a focused `role=application` arena box that
takes the keys, a polite live region that reads every change back,
STOP ALL stops everything. Every demo stops every other demo when it
starts, and any demo that moves the listener puts it back at the origin
facing forward when it stops — the `AudioListener` is global, and a
head-turn left behind would rotate every other demo on the page. Every
number below is a placeholder for Brian's ear; he tunes in the lab.

#### L.1 The 3D Position Explorer — the galactic map's cursor, prototyped — DONE

- One continuous recognizable sound at a point around the listener:
  default the corvette engine loop (`ship_corvette_1`), a second button
  swaps it for a repeating short blip (a 60 ms 880 Hz sine every 0.8 s)
  for the sharper transients elevation needs. Starts directly ahead,
  level, at 200.
- Keys in the arena, each press a fixed step: Left/Right rotate the
  sound 45° around you; Up/Down move it 30° above/below; Page Up/Down
  move it 100 farther/closer (50–800); Shift with any of them is the
  fine step (15°, 10°, 25); Home resets to dead ahead, level, 200;
  Enter "selects" — a short beacon ding and "Selected: front-left, 30
  above, distance 300." — standing in for the galactic map's jump;
  Escape stops.
- Every step reads back in compass words, never raw degrees first:
  "Rear-left, 30 above, distance 200." The eight azimuth names are
  front, front-right, right, rear-right, rear, rear-left, left,
  front-left (45° steps land exactly on them; fine steps say "front,
  15 right"); elevation says "level", "N above", "N below", "directly
  overhead", "directly underneath".
- Test: every key changes the readout and the panner position;
  directly overhead and directly underneath are reachable; Home
  resets; Enter speaks the selection; Escape silences.

#### L.5 The true 3D vortex — eight vortices shaped one at a time (Brian's bracket on #5) — DONE

- Replaces the shared height with per-vortex shape. Each vortex keeps
  its radius, direction, and rate, and gains: a **centre height**
  (`height`, ±300), a **vertical sway** (`sway` amplitude 0–200 on its
  own slow sine, rates 0.1–0.3 rad/s with offset phases so they weave,
  not bob together), and an **orbit offset** (`offset`, the orbit's
  centre slid along the line from the listener toward the vortex's
  starting angle, so it passes close on one side and far on the other;
  clamped to radius − 20 so no orbit ever passes through your head).
- Keys: **Up/Down select** a vortex (1–8, wrapping; the selected one
  briefly swells in level so you know which you have); **Page Up/Down**
  its sway ±20; **Home/End** its centre height ±15; **[ and ]** its
  offset ∓20/±20; **Left/Right the shared speed** for all eight (as
  today, ×/÷ 1.25); **R** resets every vortex to its starting shape;
  Escape stops. Every change reads back the whole selected vortex:
  "Vortex 3: height 40, sway 90, offset 60, speed times 1.25."
- At all-zero sway and offset it is today's demo exactly; at sway 200
  on all eight it is the chaotic cloud around the head the note
  describes.
- Test: selection wraps and swells; each key changes only the selected
  vortex except Left/Right; the readout names every field; R restores
  the starting shape; no panner position ever comes within 20 of the
  origin; Escape stops all eight.

#### L.4 The flyby — planes on routes, planes doing stunts (Brian's bracket on #4) — DONE

- Brian's eight `audio/demo/propeller_plane1–8.mp3` (all stereo 48k;
  measured: 1–3 are 5.0 s, 4 is 8.0 s, 5–8 are 12.0 s). Manifest keys
  `propeller_plane1–8`, excluded from `AUDIO_PRELOAD` like the vortex
  set. The folder is new and untracked — it gets staged explicitly.
- **Planes 1–4 loop on set routes** around the listener — routes, not
  orbits, and different from each other so the variation shows: 1 a
  low racetrack (a long oval, close in front at 120, far behind at
  400, level); 2 a figure-eight that crosses directly overhead at 150;
  3 a tilted circle that climbs from below-front to above-behind and
  back; 4 (the 8 s clip) a wide circuit at 350 whose height flips sign
  every lap. Laps of 12–20 s. "Start routes" starts all four at once,
  staggered so they don't cross the same point together; "Stop routes"
  stops them.
- **Planes 5–8 are one-shot stunts**, each path fitted to its measured
  12 s so the approach, the stunt, and the fly-off land on the audio:
  5 a close pass (far ahead-left 600 → close left 80 → far behind-right
  600); 6 an overhead dive (far ahead high → directly overhead at 60 →
  far behind low); 7 a corkscrew (spiralling in from 500 to 100 around
  you, then out the other side); 8 an underneath pass (far ahead low →
  directly beneath at 60 → far behind). "Next stunt" plays the next in
  rotation, over the routes if they are running, announcing it first:
  "Overhead dive. Twelve seconds." Distance does the rest — the
  panners' inverse model with the lab's `refDistance` 50 makes 600 to
  60 a real crescendo.
- No Doppler (not bracketed). If Brian wants it later it is a
  `playbackRate` ramp on the stunt's source, labelled as its own thing.
- Test: all eight load; the four routes run and stop together; each
  stunt announces, fits its 12 s (the source ends within 0.2 s of the
  path's end), and the rotation returns to 5 after 8; Escape stops
  everything.

#### L.8 The spatial audio room — five sounds, a solo pass, a turn, a test (Brian's bracket on #8) — DONE

- Five quiet distinct sounds at fixed world positions: **Generator**
  (a ship engine loop), **Beacon** (the station blink), **Crackle**
  (bandpassed noise ticking), **Pump** (a slow low pulse), **Radio**
  (a repeating three-chirp). Level 0.08 each — deliberately quiet, so
  the solo pass is the way you learn the room.
- **Every run is randomised so it can't be memorised**: azimuth from
  the eight compass points with no two sharing one, elevation from
  high / level / low, distance from 120 / 200 / 300 — all five
  drawn fresh on every Start.
- **The flow Brian gave**: Start test → every level lowered → the name
  of an object is spoken ("Generator") → its level rises to 0.35 for
  three seconds → lowers → next name → and so on through all five, in
  a **shuffled order that is never the order of distance** → then
  "Turning 90 degrees left" (or right — chosen at random per run,
  spoken *before* the turn) → the listener orientation ramps 90° over
  1.5 s while all five keep sounding at the quiet level → then the
  questions.
- **The test is on-screen multiple choice**, native buttons in the
  arena (Tab/arrows browse, Enter answers — the lab's own idiom, not
  the game's key trap), three questions per run: two of "Where is the
  Pump now?" (eight direction buttons, the answer judged against the
  post-turn bearing) and one "Which is closest?" (five name buttons —
  the reason the distances differ). Each answer is confirmed at once
  ("Correct, rear-left." / "You chose left. The Pump is rear-left,
  high."), then the score: "2 of 3." Escape or Stop ends the run and
  puts the listener back facing forward.
- Test: five distinct positions and no duplicate azimuth on any run;
  the solo order is never distance order; the turn is spoken before it
  happens and measures 90° on the listener; every question judges
  against the *turned* bearing; the listener is reset on stop.

#### L.9 The lighthouse gate — a directional source, in the lab and in the game (Brian's bracket on #9) — DONE (lab half; the game's gate cone is 3.31)

- `PannerNode` orientation and cones, which nothing in the game uses
  yet. **The lab demo**: the gate sound at a fixed point 150 to your
  right, its beam sweeping a full turn every `gateSweepS` **10 s**;
  Left/Right walk it around you in 45° steps, Page Up/Down change the
  sweep period (5–30 s), Escape stops. You hear its place *and* its
  turning — loud as the beam passes you, faint as it points away.
- **The game**: the Jump Gate's beacon in `buildPoiVoice` (today a
  synthesized 55 Hz hum, a 3.10 placeholder) becomes Brian's
  `audio/stations/space_station6.mp3` (8.0 s, stereo 48k; manifest
  key `space_station6`) looping through the *same* gain → lowpass →
  mute → panner chain every beacon uses, so the B key, the distance
  haze, and the range cutoff all still apply — with the panner given a
  cone: `gateConeInner` 60°, `gateConeOuter` 180°, `gateConeOuterGain`
  0.15 (never zero — silence is a bug, and "target only" beacon mode
  still has to find it), its orientation rotated a full turn every
  `gateSweepS` 10 s from `updateTargeting`, where the beacon mute is
  already driven every frame. This lands on the existing 3.10 gate now;
  3.22 inherits it.
- Test (lab): the readout names the bearing and period; the level at
  the listener rises and falls once per period. Test (game): the gate
  plays the recording, the cone's orientation completes a turn in 10 s
  (`__sim.state()` exposes the gate's sweep phase), the beacon is still
  audible at the outer-gain floor when pointed away, B mutes it, and
  the delivery run (which has no gate) is untouched.

**The lab round (L.1, L.4, L.5, L.8, L.9) built as scoped above, all in
`soundlab.html`**, sharing one new block of helpers (`labPolarToPos`,
`labNormAz`, `labDescribeAz`/`labDescribeEl`, `LAB_NAMES8`, `labShuffle`,
`labResetListener`) — the polar-to-world conversion IS the galactic
map's future sound-cursor math (A.13), reused by L.1's cursor and L.4's
keyframe-based stunt paths alike. `stopAll()` now calls
`labResetListener()` unconditionally, so any global stop leaves the
`AudioListener` facing forward regardless of which demo (only L.8 turns
it) was cut short. Manifest keys added: `propeller_plane1–8` (L.4,
`audio/demo/`, lab-only, excluded from `AUDIO_PRELOAD`) and
`space_station1–10` (3.31/L.9, `audio/stations/`, DO preload — real
station voices in the live game, not lab-only). Both new folders were
untracked; staged explicitly, never `git add -A`.

**A real gotcha found and fixed while testing, not a game bug**: this
sandboxed preview pane's `requestAnimationFrame` proved unreliable in
isolation for every one-shot TIMED demo (the flyby stunts, the room's
90° turn) — `document.hidden` read `false` throughout, yet a 12-second
stunt sometimes sat frozen well past 15 real seconds without
completing. Rather than trust wall-clock waits, every timed demo was
rebuilt around an explicit **millisecond accumulator** (`elapsedMs` on
its own node, advanced either by the real rAF loop's measured delta or
by a manual clock) instead of diffing against `performance.now()`
directly — the same shape as the main game's `dt`-based `simTick`, and
exactly why the main game keeps `__sim.step()` as an escape hatch from
its own rAF. A new **`window.__lab`** test hook (`tick(ms)` drives
every currently-active demo's accumulator directly, bypassing rAF
entirely; `state()` exposes each demo's live numbers) is this page's
equivalent of `__sim.step()`/`__sim.state()`, added for exactly this
reason. Once ticked manually, every stunt and the room's turn completed
in exactly its configured duration.

Machine-tested at a local server end to end: **L.1** — every key
(45°/30°/100 steps, 15°/10°/25 shift-fine steps) changes the readout
and the panner position, confirmed via repeated presses landing on
"front, 15 right" (the fine-step case), "directly overhead" and
"directly underneath" at exactly ±90°, distance clamped at 800, the
voice swap, and Escape. **L.5** — selecting a vortex swells it and
wraps correctly (1→2→3, 8→1); Page Up/Down, Home/End, and `[`/`]` only
ever change the SELECTED vortex's own sway/height/offset (confirmed a
second vortex starts at all-zero while the first kept its shaped
values); the offset clamp measured exactly `radius − 20` on two
different vortices (130 for radius 150, 160 for radius 180); Left/Right
changed the one shared `speedMul` (confirmed 1.25² = 1.56); R reset
every vortex AND the shared speed at once; Escape stopped all eight.
**L.4** — all eight assets load and play; the four routes start and
stop together; all four stunts were driven to completion via
`__lab.tick` and confirmed to cycle 5→6→7→8→5 with each announcing its
name and "Twelve seconds" before playing. **L.9** — the lab's own
sweep measured exactly a full 360° in 10 seconds via two 5-second manual
ticks (phase 0→180→0); Left/Right changed its bearing in 45° steps;
Page Up/Down changed the sweep period; Escape stopped it. **L.8** — 15
consecutive fresh runs each drew 5 distinct azimuths and a solo order
that was never monotonic by distance (the "can't be memorised" and
"never distance order" requirements); the solo sequence (real-timer
driven, not rAF) named each object correctly; the announced turn
direction matched the actual 90° listener rotation (confirmed via the
apparent-bearing math against a listener manually turned left 90°: an
object originally at azimuth 270 correctly judged as "front" afterward,
one at 180 as "left"); all three questions (two "where is X now",
one "which is closest", including a tie broken toward the first match)
judged correctly against both a right and a wrong answer, producing an
accurate final score ("2 of 3" confirmed against a deliberately mixed
correct/wrong/correct run); the listener reset to facing forward on
Stop, confirmed by reading `AudioListener.forwardX/Z` directly before
and after. Zero console errors throughout every demo. Every number is
a placeholder for Brian's ear. Not yet heard by Brian.

#### Phase 3L, second pass — Brian's notes after hearing the lab (ideas9, 2026-09-05) — DONE

Four changes to demos that exist, one round, all in `soundlab.html`.
Same shell, same `__lab` hook, same stop-everything rule.

- **L.1b The grid cursor.** L.1's polar explorer becomes (or gains a
  sibling that is) a **3D grid**: the cursor steps `gridStep` 100 along
  axes — Left/Right x, Up/Down y (height), **W forward / S back** on z —
  and each step **speaks the coordinates** ("2 right, 1 up, 3 forward"),
  so the cursor is always on a grid point; the source sounds from the
  cursor's position as now, Enter "selects" as now, Home resets to the
  origin. Shift steps 25. This is the galactic map's cursor (A.13)
  tried on a grid instead of a compass; Brian is open to a better way
  if one turns up in the building — say so in the DONE note.
- **L.4b The flyby, re-cast.** The four **routes** use the *last* four
  recordings (`propeller_plane5–8`, the 12-second ones, looped); the
  **stunts** use a **synthesized propeller** — the best the engine's
  primitives can do (a low sawtooth under a pulsed noise bed, pitch
  following the stunt's speed), not a recording. Clips 1–4 come off
  the demo.
- **L.5b The vortex, back to one group.** The per-vortex selection goes
  away; the keys shape all vortices together as they did before L.5:
  Up/Down height, Left/Right speed, Page Up/Down **vertical wobble**,
  Home/End **tilt in the x-y plane**, **[ / ] fewer / more vortices
  audible** (1..8). Readback after every change, R resets, as now.
- **L.8b The room, without the quiz.** Four sounds, from the game's own
  assets: an asteroid loop, a propeller plane, a mining laser, a vortex.
  No questions: the room **rotates 90° every 10 seconds**, each turn
  preceded by the announcement ("Turning left") and, after it, the
  room's orientation **relative to the original** ("Facing 90 right of
  where you started; the asteroid is now behind you"). Escape stops.
- Test: every key in each demo answers; the grid cursor's coordinates
  read back on every step and reset on Home; the flyby's routes play
  clips 5–8 and its stunts play no recording; the vortex count changes
  on the brackets; the room turns every 10 s with both lines.

**DONE (Round 25, Sonnet).** All four built as specced, in
`soundlab.html`. **L.1b**: a new "3D grid cursor" section (`gridStart`/
`gridStop`/`gridArena`), a sibling to L.1 rather than a replacement —
both stay in the lab side by side, per Brian's own "or gains a sibling"
phrasing. Position tracked in raw world units (`gridExplorer.x/y/z`,
`GRID_STEP` 100, `GRID_STEP_FINE` 25 under Shift); coordinates are read
back as grid-cell counts **rounded to the nearest coarse cell**, even
right after a fine Shift step — a deliberate simplification, flagged for
Brian: a true fractional grid would need either showing a decimal or a
second finer grid entirely, and rounding was the simplest way to keep
"always on a grid point" true to the ear without inventing either.
Confirmed live: `2 right, 1 up, 3 forward` after Right×2/Up×1/W×3,
matching Brian's own example exactly. **L.4b**: `FLYBY_ROUTES` now
loads `propeller_plane5–8` (clips 1–4 dropped from the manifest
reference entirely, still on disk); the stunts' old `A.load(stunt.asset)`
is gone, replaced by `flybySynthPropellerStart/Update/Stop` — a
sawtooth oscillator (engine buzz) plus `SIM.audio`'s own shared
`noiseBuf` through a bandpass filter, pulsed by a slow LFO (the blade-
chop), both re-targeted every tick by `flybyStuntTick`'s own computed
speed (straight-line distance moved since the last tick, over real
elapsed seconds) — a fast, close moment buzzes higher and chops faster
than a lazy one. Confirmed live: "Close pass. Twelve seconds.
Synthesized propeller." and a full 12 s completion via `__lab.tick()`.
**L.5b**: `vortex.nodes` per-node `height/sway/offset` fields are gone;
one shared `vortexGroup` object drives all eight, with Home/End now a
**tilt** (0–90°) that rotates the orbital plane from flat (x-z, around
the listener) toward vertical (x-y, a ring rising and falling in front)
by blending the `sin(angle)` term between z and y, and `[`/`]` now mute/
un-mute the group down to N of 8 audible (ramped gain, not stopped —
orbiting continues silently so un-muting mid-run doesn't restart
anything). Confirmed live: Up/PageUp/Home/`]` all changed the shared
readback in one pass ("Height 15, sway 20, tilt 15 degrees... 7 of 8
audible"), R reset everything. **L.8b**: the five synthesized voices and
the quiz are gone; `ROOM_ASSETS` now loads four real manifest keys
(`asteroid1`, `propeller_plane1`, `laser_mining1`, `vortex1`), all
playing at once from randomized positions; `roomDoTurn`/`roomTurnTick`
turn the listener 90° in the SAME direction every ~10 s (chosen once at
Start) and `roomOrientationReport` speaks the listener's own cumulative
facing relative to the start ("Facing 180 right of where you started")
plus each asset's new apparent bearing in natural phrasing
(`ROOM_DIR_PHRASE`, e.g. "The asteroid is now behind you," matching
Brian's own example) — confirmed live end to end. **A real, pre-
existing bug found and fixed in this round's own testing, unrelated to
any of the four items above**: `stopAll()` cleared its own
`activeStopFns` registry to `[]` after every call, but `registerStop()`
is only ever called ONCE per demo at page-parse time (a permanent
registration, not a per-run one) — so the very first `stopAll()` call
on a fresh page load (fired automatically the instant ANY demo's own
`xStart()` ran, since every demo calls `stopAll()` first to silence the
others) permanently emptied the registry, silently breaking BOTH the
STOP ALL button and "every demo stops every other" for the rest of that
page's life. Confirmed via a direct repro (`stopAll()` logging 7
registered functions on its first call, 0 on every call after) and
fixed by simply never clearing the registry — every stop function is
already idempotent, so there is nothing to "re-arm." Re-confirmed
working after the fix: starting a second demo correctly silenced the
first, and TWO separate STOP ALL presses both correctly tore everything
down. Zero console errors throughout all four demos and the bug fix.
Not yet heard by Brian.

#### L.5c The vortex as six presets (ideas12.txt) — DONE

- Brian: "rather than individual controls, I'd like to have preset
  configurations and behaviors for the prims, just use 6 different
  configurations with variations in speed, rotation, all kinds of
  things to showcase this, use enough variation to showcase the HRTF."
- The third shape of this demo (L.5 per-vortex → L.5b one group →
  L.5c presets), and the simplest: the group controls go; keys **1–6**
  (or Up/Down) pick a **`VORTEX_PRESETS`** entry, each a named
  configuration of the eight orbits — count audible, radii, speed
  multiplier and per-vortex direction, height, sway, tilt — chosen to
  make one thing each obvious to the ear: *Ring* (all eight, flat, one
  direction, slow); *Counter* (four each way, same radius — passing
  each other); *Tilt* (a vertical ring rising and falling in front);
  *Near and far* (two radii, one tight and fast, one wide and slow);
  *Storm* (all eight, sway on, fast, tilted); *Solo* (one vortex, wide,
  slow — the reference). Readback names the preset and its recipe on
  select; R replays the current one from its start; Escape stops.
  `__lab.state().vortex` reports the preset index. Nothing else in the
  lab changes.
- Test: each key lands its preset with the stated count/direction; the
  readback names it; switching mid-run ramps rather than pops.

**DONE (Round 33, Sonnet).** `soundlab.html`'s vortex demo, previously
L.5b's one shared group of live-adjustable knobs, is replaced with
`VORTEX_PRESETS` — six entries, each a full 8-slot `{r, w}` orbit table
plus its own height/sway/tiltDeg/speedMul/audible-count, matching the
six recipes exactly as specced (Ring/Counter/Tilt/Near and far/Storm/
Solo). The 8 audio nodes are created once in `vortexStart()` and never
recreated by a preset switch — `vortexApplyPreset(idx)` just retargets
each node's own `.orbit` object and ramps the shared group fields
(gain for the new audible count included), so the underlying loops
never restart; only their orbital path and the shared height/sway/tilt
change, which is what makes switching mid-run smooth rather than a
pop. Keys 1–6 pick a preset directly, Up/Down step through them
wrapping at both ends, R resets every node's angle and the shared sway
phase back to each preset's own starting layout and re-applies it
(replaying the choreography without touching the underlying loop
playback), Escape stops as before. The old height/sway/tilt/speed/
audible-count live-adjustment keys (arrows, Page Up/Down, Home/End, `[`/
`]`) are gone along with the group-controls model itself, per Brian's
own ask; the on-page copy, the `role="application"` aria-label, and the
table-of-contents link were all updated to describe the preset picker
instead. `__lab.state().vortex` gained `presetIdx`/`presetName`
alongside its existing (now preset-derived, not independently settable)
height/sway/tiltDeg/speedMul/audibleCount fields. The neighboring "Be
the Way" section's own blurb, which used to describe itself relative to
"the vortex demo above" being one shared group, was updated too, since
that comparison stopped being true — "Be the Way" is the one demo that
still has live per-voice controls now. **One real snag hit purely in
testing, not a bug**: this session's own local-server preview needed the
lab's "Start audio" button clicked via its real `id` (`startBtn`)
rather than a stale coordinate-based ref, which had silently landed
nowhere useful and left `SIM.audio.ctx` null — `vortexStart()`'s own
`if (!A.ctx) return;` guard then failed completely silently (no status
text, no error), which is exactly the right behavior for that guard but
made the mistake momentarily look like a real bug before the actual
cause (the click never reaching the button) was found. Machine-tested
at a local server via `document.getElementById(...).click()` and real
`keydown` dispatches into `vortexArena`: all six presets confirmed
selecting the correct name, description, and resolved
height/sway/tiltDeg/audibleCount (Solo measured `audibleCount:1`, Storm
`sway:90`/`tiltDeg:45`, Tilt `tiltDeg:90`); Up/Down confirmed wrapping
Ring↔Solo at both ends; the node count stayed at a constant 8 across
every single preset switch (direct confirmation nothing restarts);
`__lab.tick(2000)` advanced the orbit with no error; R replayed the
current preset with the correct spoken confirmation; Escape and the
Stop button both correctly tore down to 0 running nodes; a full
second start/stop cycle confirmed nothing was left broken by the
first. Zero console errors throughout. This closes out every
ideas12.txt item — the next step per the standing build order is
Brian actually flying/hearing everything shipped since 3.24, a human
playtesting checkpoint, before 3.42 or quadrant 2.

#### L.1c Galactic map: the cube (A.13, ideas9/ideas11) — DONE

Brian, mid-playtest-checkpoint: "I'd like the demo of our 3D galactic
map to be reflective of how we envision our game being with the 3x3x3
grid, starting at the center of the closest face." A.13's cube design
had been fully talked through and decided by this point (see A.13
above — corners are quadrants, edge midpoints are waypoints, face
centres are views except one, coordinates spoken vertical-lateral-
depth) but never actually built; L.1b was still the free-roaming
"grid cursor" prototype from Round 25, one press moving 100 raw world
units in any direction with no cube shape to it at all. This item
turns L.1b INTO the decided design rather than sitting a new demo
beside it — the whole reason L.1b existed was to prototype the
galactic map's cursor, and the map's shape is no longer undecided.

- **DONE (Round 36, Sonnet).** `gridExplorer.{x,y,z}` are now cube
  coordinates in `{-1, 0, 1}`, not raw world units — `GRID_SPACING`
  (400) is only how far apart cells sit for the HRTF panner, not a
  step size choice any more. `gridCellKind(x,y,z)` sorts a cell by how
  many axes are nonzero — 3 = corner (a quadrant), 2 = edge midpoint
  (a waypoint), 1 = face centre (a view) — the same geometric test the
  real map will use. Arrows step vertical/lateral, W/S step depth,
  each press changing exactly one axis by one cell and clamping at the
  cube's own boundary; Shift has no role any more (A.13's own decision
  once the cube shrank from the earlier 9×9×9 lattice — there is no
  finer step left to take). Two refusals, both new: landing back on
  the same cell (the boundary) says "No route that way."; landing on
  `(0,0,0)` — reachable only by moving a face centre's own single
  nonzero axis toward zero — says "No route through the centre.",
  since the cube's own centre (reserved for A.8's base) is never a
  cursor position at all. `gridDescribe()` speaks vertical, then
  lateral, then depth, a zero never spoken — "1 below, 1 left, 1
  behind" for home, matching Brian's own worked example exactly.
  `CUBE_NAMES` gives the 8 corners placeholder identities: home
  (`-1,-1,-1`), Quadrant 2 "the economy" at home's lateral neighbour
  and Quadrant 3 "control" at its vertical neighbour (Fable's proposed
  assignment — still open in Part C, not re-decided here, just used
  as the best current answer so the demo has real names to speak), and
  four unlabelled corners for the rest. Enter is context-sensitive: a
  corner plays `ready_chime` and speaks "Jump: [name]."; a waypoint
  gets a lower blip and "A waypoint. No destination here, just the
  road."; an ordinary face centre refuses, "Not a destination."; the
  one exception — the near face's centre, `(0,0,-1)`, the demo's own
  start position — always succeeds, "Harbour reached — reachable only
  from Quadrant 2, the one place a rival can never follow." A corner
  gets a real voice (the same `ship_corvette_1` loop L.1b always used,
  full volume); a waypoint gets the same loop heavily lowpassed and
  quiet ("just the road, not a place"); a face centre gets no voice at
  all, matching "a view, not a destination." **One deliberate
  simplification, flagged**: the harbour's special reachability rule
  is normally gated on the pilot actually being in Quadrant 2, but this
  is a standalone lab demo with no real "current quadrant" behind it,
  so Enter there always succeeds rather than checking anything — the
  real map will gate it for real. **The start position is exactly
  what Brian asked for**: `(0, 0, -1)`, the centre of the face facing
  the pilot by default (A.13's own "the default view is over the
  pilot's shoulder — the near face is the 'behind' face"), from which
  every corner of that face is exactly two presses away, matching
  Fable's own read of it as "a good start position." Section renamed
  in the lab (`3D grid cursor` → `Galactic map: the cube`), the TOC
  link and `aria-label` updated to match, `__lab.state().grid` gained
  `kind`/`label`. Machine-tested at a local server: the demo starts at
  `(0,0,-1)`, spoken "1 behind"; Brian's own worked example replayed
  exactly — Right then Down reaches `(1,-1,-1)`, "1 below, 1 right, 1
  behind", named Quadrant 2, while Left then Down reaches home instead,
  both matching A.13's own text verbatim; the centre-crossing refusal
  confirmed by pressing "ahead" from the start position (would land on
  `(0,0,0)`); the boundary refusal confirmed at `(1,0,0)`; Enter
  confirmed on a corner (jump + chime), a waypoint (road message), an
  ordinary face centre (refusal), and the harbour (success); Escape and
  the Stop button both confirmed tearing down to zero running nodes;
  a full restart cycle confirmed nothing was left broken. Zero console
  errors throughout. Every quadrant name beyond home/Q2/Q3 is a bare
  placeholder, and Q2/Q3's own assignment is still Fable's proposal,
  not Brian's confirmed answer — flagged here, not silently decided.
  Not yet heard by Brian.

#### L.10 "Be the Way" voices (ideas11, `audio/demo/"be the way vortex demo1.txt"`) — DONE

Brian dropped a new txt alongside four new recordings in `audio/demo/`
(`be_the_way1.mp3`, `be_the_truth1.mp3`, `be_the_light.mp3`, plus three
outro clips) and asked for a demo built from it before resuming the
build order proper. His own words: "use 4 primatives, not linked... the
prims should act like the vortex demo in that they are individual and
orbit about the listener. they should fire in the order listed. they
should be independent in speed and rotation and I want at least 2 to
move in opposite directions. we need speed, height and tilt controls...
this is to see how voices sound when rotating." A second paragraph
(concentric orbits around an off-center point, near/far distance
modulation rather than a flat ring) is a further idea, not a spec —
no numbers, no clear mechanism yet; noted here for later, not built.

New section in `soundlab.html`, `#sec-way`, right after the vortex demo:
four independent HRTF sources (`WAY_VOICES`), each on its OWN orbit
(own radius, own angular velocity and direction — two clockwise, two
counter, satisfying "at least 2 opposite" by default) and each with its
OWN live speed/height/tilt state — explicitly NOT the vortex demo's own
shared-group model (L.5b), since Brian's "not linked" here asks for the
opposite of what he asked for there. Up/Down selects one of the four by
name; Left/Right, Page Up/Down, and Home/End shape ONLY the selected
one's speed, height, and tilt (mirroring the ORIGINAL pre-L.5b vortex
key layout, since that model fits a "not linked" ask exactly). "Fire in
the order listed" is read literally as a staggered entrance rather than
all four landing at once: the Way starts alone, then (`WAY_FIRE_GAP_MS`
4000) the Truth joins, then the Light, then the outro — each plays
through ONCE (`loop: false`), since these are discrete spoken/sung
segments forming a sequence ("I am the way, the truth, and the life"),
not ambient texture like every other looping source on this page.
Three outro clips exist on disk (13s/18s/full-song); the full-song
ending is wired in as a named placeholder pick, easy to swap. New
manifest keys share a `way_` prefix (`way_the_way`/`way_the_truth`/
`way_the_light`/`way_outro`) purely so `AUDIO_PRELOAD`'s own exclusion
regex can skip this lab-only set with one added clause, same pattern as
`vortex\d`/`propeller_plane\d`. Registers with the shared `stopAll()`
registry like every other demo (the bug fixed above, three items up,
covers this one too — confirmed).

Machine-tested at a local server: all four manifest paths fetch
correctly (200 OK); polling `__lab.state().way` at real intervals
confirmed the staggered entrance fires on schedule (the Way alone at
0–2s, the Truth alone by 4.5s once the Way's own short clip had ended,
the Light alone by 8.5s, the outro — the long clip — still sounding at
13s); selecting "The Truth" and raising its speed/height/tilt left
"The Way," "The Light," and "The outro" completely untouched at their
own defaults, confirming true independence; R reset all four; Escape
stopped all four; starting the vortex demo then starting this one
correctly silenced the vortex, and STOP ALL correctly silenced this one
in turn. Zero console errors. Every timing number (the 4-second stagger
gap, the three orbit radii/speeds) is a placeholder for Brian's ear —
worth a specific note: the three short voice clips are only a few
seconds each, so a 4-second gap already gives near-zero overlap between
them; a shorter gap may sound better for "hearing them rotate together"
depending on what he's after. Not yet heard by Brian.

#### 3.31 Recorded station beacons — Brian's ten, applied down the list (ideas8) — DONE

- `audio/stations/space_station1–10.mp3` (new, untracked, staged
  explicitly; durations measured on build — number 6 is 8.0 s stereo
  48k). Brian: "use the new assets for space stations including existing
  ones; just start going down the list." Manifest keys
  `space_station1–10`, filename equals key.
- **Assignment, in order**: Station Meridian = `space_station1` (both
  the delivery run's fixed sector and the quadrant — same station);
  Station Two = `space_station2`; the Jump Gate = `space_station6`
  (L.9, Brian's explicit pick); every future station takes the next
  unused number (3, 4, 5, 7 …) via a `beaconAsset` field on its
  `QUADRANT`/`SECTOR_POIS` row. A station's recording loops through the
  same chain as every beacon (gain → lowpass → mute → panner), replacing
  the 660 Hz square-gated blink for that station; `stationBeaconScale`
  still halves it; a row with no `beaconAsset` keeps the synthesized
  blink, so nothing breaks while the list is being filled.
- Any recording Brian wants swapped is a one-field change on the row.
- Test: both stations and the gate play their recordings from their
  positions; the delivery run's Meridian plays number 1; B and the
  distance cutoff still work; a row without `beaconAsset` still blinks.

Built as scoped, plus L.9's game half (the lab half shipped in the
prior round): the Jump Gate's `buildPoiVoice` branch gained a cone
(`gateConeInner`/`Outer`/`OuterGain` — 60°/180°/0.15, the outer floor
never zero) and `updateTargeting` gained one new step, gated on
`t.poiType === 'gate'`: advance a per-target `t.gatePhase` by
`360 / CFG.gateSweepS` degrees per second and write it to the panner's
`orientationX/Y/Z` (or `setOrientation` on the older API) every frame —
`updateTargeting` needed a `dt` parameter for this, threaded through
its two call sites in `simTick`. A recorded beacon REPLACES the
synthesized voice for that `poiType` entirely rather than layering on
top of it (`buildPoiVoice` checks `t.beaconAsset` first, before the
`combat`/`mining`/`station`/`gate`/`star`/planet chain); it loads
async and is guarded against the target having already been torn down
by the time the fetch lands (the same `t.nodes !== nodes` staleness
check used elsewhere in this codebase) so a slow-to-decode asset can
never start playing into a voice nothing will ever stop. Both
`makeSectorRoster`'s `demo` branch (`SECTOR_POIS`) and
`makeQuadrantRoster`'s (`QUADRANT`, via `quadrantPoiList`) thread
`beaconAsset` from the row onto the target object the same way.
`__sim.state()` gained a `gate` field (name, sweep phase, whether its
asset has attached) for testing.

Machine-tested at a local server: both quadrant stations and the gate
fetched their assigned recordings at boot (confirmed via network
requests — all ten `space_station` files preload); the gate's sweep
phase measured exactly 180° after 5 of its 10-second period, confirmed
via `__sim.step()`-driven ticking, not real-time waits; the delivery
run's fixed `SECTOR_POIS` roster still lists all four original points
with Station Meridian among them, sharing the identical `beaconAsset`
code path already confirmed working for the quadrant; B still cycles
on/off/target-only correctly with the new asset-based voices (mute
levels read back at ~0.98 in "on" mode, matching the existing ramp);
returning to the sector and rebuilding the roster a second time
produced no errors. Zero console errors throughout. The station/gate
CFG numbers (the cone angles and outer gain, the 10-second sweep) are
placeholders for Brian's ear; the asset-to-station assignment beyond
Meridian/Station Two/the gate is Brian's own to reorder by ear later,
per his "just start going down the list, I'll say if I want something
changed" instruction. Not yet heard by Brian.

#### 3.29 The ship page — F2 becomes the full reference (ideas8) — DONE

- Brian: "the ship page needs to show all ship systems and components
  and their status and attributes and properties — where players look
  up stats on things like lasers, or how far their extractor at this
  tier can go." F2 grows from the SPEC 2.13 status list into that
  reference, **every number read live from `CFG`, `LASERS`,
  `profile`, and `shipSystems`** so tiers, modules, wear, and damage all
  show through without a second source of truth.
- **Headings, browsable like Help and the map**: H and Shift+H jump
  between headings (the F1 idiom), a first letter jumps to the heading
  that starts with it (the map's idiom), arrows read line by line,
  Escape closes. Headings and lines: **Hull** (percent, collision
  damage owed); **Shields** (pool of max, raise time, regen per second,
  disrepair time and return fraction, state); **Lasers** (per family:
  level owned of 8, health, damage per tick at this level, ticks and
  burst length, cooldown, range and point-blank bonus, bites/weak
  matchups; per slot: what's fitted and ready/recharging); **Missiles**
  (count of max, damage, speed, reach in units, the zone it needs);
  **Decoys** (count of max); **Warp** (charge of tank, regen per
  second in open flight, minimum to jump, reach at this charge);
  **Reaction mass** (percent, battery factor); **Thrusters** (thrust,
  brake, turn rate, mass factor); **Extractor** (reach — `vacRange`,
  300 today — and "tier 1" until a tier exists); **Vacuum** (cloud
  radius); **Tractor beam** (3.30, once fitted: pull rates by rock
  size, reach); **Sensor** (the three zone sizes' lock angles, which is
  active, the tick's cadence); **Repair crew** (tier, seconds to half
  and to full); **Systems** (every broken one, health, crew on it —
  3.27's lines); **Cargo** (ore, credits; the limit once 3.14 exists);
  **Modules** (each fitted, its effect, its mass; total mass).
- Every value that a tier or module changes says so in the line ("at
  level 5", "tier 2 crew"), so a pilot can hear what an upgrade bought.
- Test: every heading reachable by H, Shift+H, and first letter; every
  line reads a live value (buy a module, reopen F2, the number moved);
  no line ever reads `undefined`; Escape closes and the audio duck
  restores; F12 describes F2's new shape.

Built as scoped, with **Tractor beam left out on purpose**: 3.30 hasn't
landed yet, and a heading for a system that doesn't exist would read
either empty or `undefined` — it goes in as part of 3.30's own work
instead, when there's a real `tractorPull`/`tractorRange` to read.
Everything else in the list is built exactly as named, plus one line
the original SPEC 2.13 screen already had and the new heading list
didn't explicitly re-mention: a conditional **Mission** heading (only
present while `mission` is set) carrying the escort/defend friendly's
shield and hull percent, right after Hull — dropping it would have
been a real regression, not a simplification. First-letter jump
**cycles on repeats** rather than refusing or picking arbitrarily among
duplicates: several headings share an initial (Hull/Shields/Systems/
Sensor all start with a repeated few letters, as do Reaction mass/
Repair crew and Missiles/Modules), so the search runs forward from just
past the cursor and wraps — the same type-ahead idiom any listbox uses,
and it needed no new state beyond the existing cursor. `updateTargeting`
gained a `dt` parameter for this round's gate-cone work (SPEC 3.31,
built first) that F2's Sensor heading also reads from (`systemState`,
`zoneRad`'s own halving math) — no new machinery, just live reads of
what 3.27 already tracks.

Machine-tested at a local server: F2 opens naming its heading and line
count (15 in a standalone drill, 16 once a mission is accepted); H
walks all 15/16 headings in order and correctly refuses past the last;
Shift+H walks back; every one of the 56+ lines was read via repeated
arrow-down with zero instances of `undefined`/`NaN` in any of them;
first-letter jump confirmed cycling correctly for `s` (Shields → Sensor
→ Systems → wraps to Shields), `m` (Missiles → Modules → wraps), and
`r` (Reaction mass → Repair crew → wraps), and correctly refusing for a
letter no heading starts with; buying a shield-capacitor module at a
real station and reopening F2 showed the fitted module under Modules
AND the raise time already updated under Shields (1 second, not 1.5) —
confirmed live, no stale cache; forcing the targeting sensor to half
health showed the Sensor heading's lock angles already halved (4.0/6.0
instead of 8.0/12.0), matching `zoneRad()` exactly; F12 explore mode
speaks F2's new description without opening it; Escape closes and
restores the audio duck. Zero console errors throughout (one benign
browser-level `[info]` autofocus log, unrelated to this feature, was
also present before this round's changes). Not yet heard or flown by
Brian.

#### 3.30 The tractor beam — Z pulls rocks to you (ideas8) — DONE

- Brian: "pull asteroids toward the ship; at game start it would not be
  on the ship, but build it to test; keybind Z; does nothing to huge or
  large asteroids and only barely moves mediums; used instead of
  thrusters; range 500; in 10 seconds pulls a core to within 300."
- **Z** starts the tractor on the selected rock or core within
  `tractorRange` 500 (refused by name beyond it, or with no rock
  selected, or in any mode but mining); Z again stops it; it stops by
  itself when the target is within `tractorHoldDist` 300 — which is the
  extractor's own `vacRange`, so a core reeled in is a core E can take
  without thrusting — or when the target dies, shatters, or leaves
  range. While it runs it is a cockpit sound (a steady low pull hum on
  the UI bus, pitch rising as the target closes) *and* the rock's own
  voice approaching — its HRTF panner moves with it for free.
- **Pull by size, tier 1** (`tractorPull` per second): core and small
  rock 20 (500 → 300 in exactly Brian's 10 s), medium 4 ("barely"),
  large and huge 0 (refused by name: "Too massive for this tractor.").
  Each tick also damps the target's own velocity by `tractorDamp` 0.5
  a second, so a rock the laser has shoved keeps coming instead of
  sailing past. The laser's `beamPush` still shoves; tractor and laser
  fight, and the tractor's numbers decide who wins by size.
- **A module, not standard**: `tractor_1` in `MODULES` (600 credits, 2
  alloy, mass 10, placeholder) — the thing the shipyard sells later,
  with higher tiers moving large and then huge rocks as the tier
  numbers Brian sets. Until he has heard it, `CFG.tractorTestFit`
  **true** fits it to every ship for free (and F2 says "test fit"); it
  flips to false, and the module becomes the only way, once he says so.
- **The Z key conflict**: Z is today's target-zone cycle (wide /
  standard / narrow). The zone size is a setting changed rarely; the
  tractor is a tool used constantly, and Brian asked for Z by name — so
  the tractor takes **Z** and the zone cycle moves to **Shift+Z**
  (accepted by default, Part C; help, F12, README, and the key map
  updated together).
- Test: Z on a core at 500 pulls it to 300 in 10 ± 0.5 s and stops with
  a spoken "In extractor range."; Z on a medium moves it 4 a second; Z
  on a large or huge refuses by name; Z beyond 500 refuses with the
  distance; Z again stops it; the rock's velocity damps; the pull hum
  runs only while pulling; Shift+Z cycles the zone exactly as Z did;
  with `tractorTestFit` false and no module, Z says the shipyard sells
  it.

Built as scoped, with the "fight" between the tractor and the laser's
own `beamPush` **deliberately simplified, flagged for Brian's call**:
rather than modeling a real competing force (which would need the
pull to push against `t.vel` frame by frame, in tension with the
existing rock-friction physics every rock already has), the tractor
is a clean, constant kinematic pull — it closes distance by exactly
`tractorPullCore`/`tractorPullMedium` units a second regardless of
`t.vel`, while separately damping whatever velocity the target already
carries (`tractorDamp`, stronger than the ambient `rockFriction`) so a
laser-shoved rock's own momentum bleeds off quickly instead of
persisting. This gives the clean, exact numbers the spec's own worked
example asks for (500 → 300 in precisely 10 s) without an unbounded
tug-of-war, at the cost of the pull never literally *losing* to a
laser's shove mid-frame the way the original wording implies — a
pilot can still out-shove the tractor's SELECTION (a laser blast still
knocks the rock's position around before the next tractor tick catches
up and damps it), just not by out-pulling it once engaged. `core and
small rock` share `ROCK_SIZES.length - 1` (a core is a collapsed small
rock, same `t.size`), so the size-to-pull-rate mapping needed no new
field. `updateTractor(dt)` runs from `simTick`'s existing mining-mode
rock-physics block, right after the ambient friction/cloud-radius
pass, so both the ambient physics and the tractor's own pull apply to
the same target in the same frame (any one-frame residual drift from a
laser shove gets a chance to show before the tractor's stronger
damping catches it — a small, honest bonus alignment with the "fight"
language, not a full model of it).

Machine-tested at a local server, via new test hooks (`poke({
targetPos, targetSize, tractorTestFit })`, `state().tractor`) that
place and resize the SELECTED rock directly rather than hunting for
one of the right size and distance by hand: Z on a core forced to
exactly 500 engaged immediately; ticked to exactly 10 s it closed to
300 and self-stopped with "In extractor range." (a real floating-point
bug was found and fixed here — the pull's own clamped closeAmount can
leave `dist` a hair above `vacRange` by rounding noise, so a strict
`<=` check never actually tripped; fixed with a 0.5-unit tolerance); a
medium rock measured exactly 4 units closed per second; large and huge
both refused by name without engaging; a rock forced to 900 (beyond
`tractorRange`) refused naming both the distance and the reach; Z
again toggled a running tractor off; Shift+Z was confirmed still
cycling the target zone exactly as Z used to (both from the standalone
mining drill); Z in a combat drill correctly refused ("only works
while mining"); with `tractorTestFit` forced false and the module not
yet owned, Z correctly refused by name; buying `tractor_1` at a real
station (600 credits, 2 alloy, confirmed deducted) let Z work
immediately afterward and dropped F2's Tractor beam heading's "Test
fit" qualifier now that it's genuinely owned; F2's new heading (added
only once `tractorFitted()` is true, so it doesn't appear as a
placeholder before this item existed) reads its numbers live in both
the test-fit and owned cases. Zero console errors throughout. All
tractor numbers (the two pull rates, the damping factor, the range,
the module price) are placeholders for Brian's ear. Not yet heard or
flown by Brian.

#### 3.28 The quadrant's timed contract (ideas7 — the timed run lives in both places)

- The **Delivery run** menu item stays exactly as it is — the fixed
  sector, its hand-tuned legs, its own personal-best log. Untouched.
- The **quadrant** gains a **Timed delivery** line in Station Meridian's
  Missions list (2.17's shell): "Clear the current Contested Zone, mine
  15,000 at any field, deliver here. Timed." Accepting starts a contract
  clock (`contract.elapsed`, the delivery clock's own rules — runs while
  the sim is live, through a tug); clearing the zone, then reaching
  15,000 in the hold, then docking at Meridian with it completes it and
  speaks the time. Its own log, `profile.contractRuns` (best 10, same
  shape as `runs`), its own "New personal best!" — the legs vary with
  the sky, so the two boards never compare. Pays the ore's price plus
  `contractCredits` 200 on top; favor once 3.23 exists. Cooldown
  `missionCooldownS` like the others. Selling ore is blocked while a
  contract is open, exactly as 3.24 blocks it for the run.

**3.28 — DONE (Round 22, Sonnet).** A new `contract` object (`{elapsed,
combatCleared, delivered, quotaSaid}`, module-level, mirroring `demo`'s own
shape exactly) tracks the quadrant's own run, kept deliberately separate
from `demo` — the two are mutually exclusive in practice (`contract` only
ever starts from a station hail, reachable only in the open quadrant) but
nothing enforces that as a hard rule, so every check treats them
independently rather than assuming one implies the other's absence.
`CONTRACT_MISSION` is a third mission definition alongside `MISSIONS`'
escort/defend, but held out of that array and only appended by
`activeMissions()` when the station being hailed is named "Station
Meridian" — escort/defend stay offered everywhere, the contract is home's
alone. Accepting it (`startMissionRun('contract')`) is a real branch, not
a variant of the escort/defend path: unlike those, it never snapshots
`sectorHome` or calls `newGame('combat', spec)` — it just starts the clock
and hands the pilot back to the open quadrant they were already flying,
since the "encounter" here is the whole rest of the quadrant trip, not one
scripted fight. `destroyTarget()`'s zone-clear win check gained an
`else if (contract && !contract.combatCleared)` branch alongside `demo`'s
existing one, so killing every ship in the quadrant's current Contested
Zone flips `contract.combatCleared` the same way it flips `demo`'s.
`dockAtStation()` gained a parallel completion branch, gated on all three
of `contract.combatCleared`, `poi.name === 'Station Meridian'`, and
`ore >= CFG.demoOreGoal` — paying `Math.floor(ore / CFG.oreCreditRate) +
CFG.contractCredits` credits (15,000 ore + the 200 bonus = 1,700 credits
in testing, confirmed exact), zeroing the hold, and recording the run via
a new `recordContractRun()` (byte-for-byte `recordRun`'s own bookkeeping,
writing to `profile.contractRuns` instead). Docking anywhere else, or at
Meridian without every condition met, falls to a new `contractDockNote()`
naming whichever of the three steps is still outstanding (zone, ore
count, or "wrong station") — all three branches confirmed by direct
test. `oreSellBlocked()` now also checks `contract && !contract.delivered`,
so Sell ore refuses at any station's hail or a docked station menu for the
whole time a contract is open, same rule 3.24 already gave the fixed run.

**One deliberate simplification, flagged for Brian's call**: the spec text
describes the same three-step order the demo enforces ("clear the zone,
mine 15,000, deliver"), but the demo enforces that order with a hard
block — Asteroid Field Kappa outright refuses mining rights until the zone
is cleared. This build does NOT add an equivalent block to the open
quadrant's mining fields: a pilot can mine at any field at any time,
contract open or not, exactly as the quadrant already worked before this
item. Only the final delivery is gated on `contract.combatCleared` — ore
mined before the zone is cleared still counts once it is. Reasoning: the
demo's hard block makes sense as a guided, linear tutorial; hard-blocking
every mining field in the open quadrant felt like it would compromise the
sandbox's own free-flight character for a mechanic this text doesn't
explicitly ask for. Easy to add later if Brian wants the harder gate.

**A real bug found in testing, fixed before it shipped**: the first
implementation's `missionAvailable('contract')` checked plain truthiness
of `contract` to refuse re-offering one already open — but `contract`
itself is never reset to null on a SUCCESSFUL delivery (`delivered: true`
lingers, same as `demo` does, purely so its F2 heading and status line
still have something to report until the pilot leaves the sector via X).
That meant once a pilot completed one contract, `missionAvailable` would
return false FOREVER afterward, regardless of the cooldown timer —
`CFG.missionCooldownS` would tick down to zero with the contract still
permanently refused, unlike escort/defend which correctly reopen after
their own cooldown. Fixed by checking `contract && !contract.delivered`
instead of bare truthiness, in both `missionAvailable` and the "already
open" message in `missionText`. Confirmed by completing a contract,
advancing `profile.clock` (via `poke({clock})`) past the 600-second
cooldown, and confirming the Missions list correctly re-offered "Timed
delivery" with its full description rather than "already open" or a
stale refusal.

Also touched: F2 (SPEC 3.29) gained a conditional "Contract" heading
(independent of the existing "Mission" heading — a pilot can have an
escort/defend encounter live at the same time as an open contract, since
accepting one never touches the other), reading the clock and
`contractObjective()` live; `statusReport()` (I) speaks the same pairing
whenever `demo` isn't active; the Run log (last mission-menu item)
now lists the fixed delivery run's times first, then the contract's
own times after, in one flat browsable list — each line self-labeled
("Delivery run number N" / "Timed delivery contract number N") so the
two boards are both reachable without ever merging or sorting against
each other, matching "the two boards never compare." `exitToMenu()`
(X from the open sector) clears `contract` to null, same as it already
cleared `demo` — abandoning the quadrant abandons its contract too.
`PROFILE_VERSION` → 5 (`profile.contractRuns: []`,
`profile.missionCooldownUntil.contract: 0`), migrated the same way
every prior version bump was: `Object.assign` already preserves an old
save missing these fields, and an explicit `Array.isArray` guard
backfills a malformed one defensively, matching the established pattern.
The Sector, Sound, and README help text all gained a line naming the
contract; the README's "Run log" and "Missions" sections were updated
to match.

Machine-tested at a local server end to end: the Missions list at
Station Meridian correctly lists Escort, Defend, and Timed delivery (in
that order, wrapping correctly); the identical list at Station Two omits
the contract entirely; accepting it sets `contract` and returns the
pilot to open flight with `mode` unchanged and the hail closed and
un-ducked; Sell ore refuses by name at both the hail and a dock while a
contract is open; killing every ship in the Contested Zone (via
`poke({enemyHp: 0})` plus real fired shots, and separately via
`poke({combatCleared: true})` for faster re-testing of the delivery
branch alone) flips `contract.combatCleared` and speaks the "Contested
Zone cleared" line named for the contract, not the demo; docking at
Meridian with the zone cleared and 15,000 ore paid exactly 1,700 credits,
zeroed the hold, recorded a "New personal best!", and left `demo`
untouched (still null throughout); the run log then listed the new
"Timed delivery contract number 1" entry correctly; a second full pass
confirmed the cooldown-reopening bug above, both before and after the
fix; docking short of the goal, before the zone is cleared, and at
Station Two with the goal met all produced their own distinct, correct
refusal line; F2's new Contract heading appeared and read correctly
once a contract was open; a full regression pass confirmed the escort
mission still accepts and enters combat exactly as before, unaffected by
`activeMissions()`'s new station-aware filtering. Zero console errors
throughout. All contract numbers (`contractCredits`, the reuse of
`demoOreGoal`) are placeholders for Brian's ear, same as everywhere else
in this file. Not yet heard or flown by Brian.

#### 3.23 Favor, control, and the three ranges (A.6 — Brian's station game)

- **Favor** is a per-port meter, 0–100, replacing the influence count
  (`profile.quadrants[q].ports[name].favor`; today's `influence` folds
  into it at 10 points each on migration). **Tiers** gate what the port
  lets you do, and every gate is spoken: *Unknown* under `favorKnown`
  10 — comms only; *Known* at 10 — the transporter; *Trusted* at
  `favorTrusted` 40 — docking; *Allied* at `favorAllied` 70 — a
  `alliedPriceBreak` 10 % better price both ways, the good missions
  (2.17's, and 3.13's), the right to Invest (control). Earned by: a
  mission completed for that port (+`favorMission` 8), a rescue
  delivered there (+8, once 2.1 exists), selling what it *wants*
  (+1 per `favorPerWantUnit` — 200 ore, 4 salvage, 4 alloy, 10
  hydrogen, 5 biomass — of a wanted category; nothing for the rest),
  the delivery run's handover at Meridian (+10). **Lost** by: a failed or
  abandoned mission (−`favorFail` 10), destroying something the port
  protects — its escort freighter, its miner (−25) — and, Brian's
  choice, **slow decay**: −1 per `favorDecayPerHour` play-hour of absence
  (no sale, mission, or hail there), never below the tier floor you've
  reached minus one tier (a Trusted pilot can drift to Known, not to
  Unknown; `favorFloorTiers` 1). A regular is remembered; a stranger is
  forgotten.
- **Home**: Station Meridian starts at Trusted (40) on a fresh profile —
  it's home, and the delivery run still ends by docking there (its fixed
  sector doesn't run favor at all). Every other port starts Unknown.
- **Control** is a second meter, 0–100, the pilot's *share* of a station
  against the quadrant's unions (3.10): **Invest** on the hail's menu at
  Allied — deliver what the station wants and each `controlPerUnit`
  delivery unit (same table as favor's) buys one point; the unions' share
  is the remainder and it **creeps back** `controlErodePerHour` 1 per
  play-hour per station, so a neglected station slips. **Controlled at
  51 %** (`controlThreshold`) and it can be lost again. What control
  gives (Brian): the station docks you free of any favor check, pays a
  **tithe** of `titheCreditsPerHour` 20 credits and `titheUnitsPerHour` 2
  of its resource (a gate station: hydrogen; a planet station: biomass)
  per play-hour, collected on any hail ("Tithe: 60 credits, 6 hydrogen
  banked."), counts toward union play (Phase 4), and — once **every**
  station in the quadrant is controlled — makes **comms quadrant-wide**:
  hail any port from anywhere in the quadrant.
- **The three ranges** (Brian's notes, replacing 1.19's two): every port
  has `commRange`, `transporterRange`, `dockRange` — stations 2,000 /
  600 / 150, planets 3,000 / 900 / 300 — and ideas6's crossing cues
  become three: `comm_range`, a new `transporter_range` (a rising pair
  with a shimmer under it), `dock_range`, each with its line. What
  happens where:
  - **Comms** (talk): the hail greeting with the port's mood spoken as
    the tier word ("Station Two control. You're unknown to us."), Prices
    (F4), **what it wants** ("We're short on biomass and hydrogen."),
    accept missions, hear the tithe, read who holds it. Nothing changes
    hands. This is why a pilot still hails from far out for the rest of
    the game — it's where work is taken and prices are read.
  - **Transporter** (hand over), needs Known: turn in missions, sell and
    buy (3.20), rearm missiles and decoys, buy reaction mass, Invest —
    cargo beams across, no landing. The transporter has a sound of its
    own (a rising shimmer, `transporter_beam` cue, positional at the
    port) every time something crosses.
  - **Docking / landing** (land), needs Trusted: repairs, refits, the
    shipyard, the interior loop, the free refill — today's docked state.
    C inside dock range at a port that doesn't trust you: "Station Two
    control: docking denied. Earn our trust first — we're short on
    hydrogen." — a refusal that names the way in.
  - Today's hail menu splits accordingly: the comm-range menu keeps
    Prices, Missions, Wants, Close; Rearm, Sell, Buy reaction mass move
    to the transporter menu, which opens instead when C is pressed inside
    transporter range (the nearer range wins, as dock range does today).
- **Range growth** (Brian): shipyard modules — `comm_array` (+50 %
  comms), `transporter_booster` (+50 % transporter), `docking_computer`
  (docking range doubled) — and favor tiers on top at each port: Allied
  +25 % to all three there; quadrant-wide comms at full control. No
  achievements yet (a milestone table is Phase 4).
- **The tug** (A.11, 2.16) goes to the nearest port that will *dock* you
  (Trusted or Controlled); if none in the quadrant, it's a long ride home
  to Meridian at `tugHomeFactor` 2 × the base wait — spoken as such.
  Docking by tug never changes favor.
- **I / F3** speak the current port's tier when in comms range; the map
  line does too. **F2** gains the three ranges with their module bonuses.
- Test: a fresh profile hails Station Two and is refused docking with the
  reason; selling 200 wanted ore there speaks "+1 favor" and the tier
  changes at 10/40/70 with the transporter, docking, and price break
  each turning on the moment they should; favor decays only in absence
  and never below the floor; Invest moves control and the unions creep
  it back on a stepped clock; a tug from a quadrant with no trusting
  port doubles the wait and lands at Meridian.

**3.23 — PARTIALLY DONE (Round 23, Sonnet).** Favor and the three ranges
are built and machine-tested; **Control (Invest, the tithe, unions,
quadrant-wide comms) is deliberately NOT built this round** — every one
of those depends on a per-station "wants" table that doesn't exist until
3.11, and shipping a Control meter with no way to ever raise it would
just be dead, untestable code. Scope actually delivered:

- **Favor**: `profile.quadrants[q].ports[name] = { favor, peakFavor,
  lastVisitHour }`, replacing the flat `profile.stations[name].influence`
  (`bumpInfluence`/`influenceGreeting` retired outright, not kept as
  unused legacy). Tiers exactly as spec'd (`favorKnown` 10, `favorTrusted`
  40, `favorAllied` 70); `hailGreeting(poi)` now speaks the real tier word
  ("Station Two control. You're unknown to us.") in place of the old
  "good to see you again" threshold line. Gains: `favorMission` (8) on
  any mission completed for that port — including, per this round's own
  reading, the quadrant's own SPEC 3.28 timed contract, treated as "a
  mission completed for Station Meridian" since the spec text doesn't
  separately address it; selling ore/salvage/alloy at `favorPerWantUnit`
  (200/4/4), folded into the same `say()` as the credit total ("+1
  favor."); `favorDeliveryHandover` (10) on the FIXED delivery run's own
  handover at Meridian — the one favor change that fires even though "the
  fixed sector doesn't run favor," exactly as the spec calls out by name,
  via a `writeFavor()` that bypasses every OTHER call's demo guard on
  purpose. Losses: `favorFriendlyLost` (25) when an escort/defend
  mission's own friendly is destroyed (`missionEnd(false)`, which as
  built only ever fires that way); `favorFail` (10) for a mission
  ABANDONED while the friendly was still alive, caught in `clearMission()`
  itself (`if (mission && !mission.ended)`) since every abandonment path —
  X, or picking something else from the Escape menu — funnels through
  there before `mission` is wiped; deliberately NOT applied to an
  abandoned SPEC 3.28 contract, which has nothing at stake the way a
  mission's friendly does. Decay: `favorDecayPerHour` (1) per play-hour
  of absence, floored at `favorFloorTiers` (1) tier below the best ever
  reached at that port — computed lazily on every touch
  (`reconcileFavor`), not a per-frame ticker. **A real, pre-existing bug
  fixed in passing**: mission favor was hardcoded to credit Station
  Meridian regardless of which station actually offered the mission — a
  mission taken at Station Two always fed Meridian's old influence count.
  Fixed by stamping `poiName` onto the mission spec at accept time and
  crediting/debiting that station specifically.
- **The three ranges**, stations only (planets aren't real ports until
  3.19): `stationCommRange` 500→2000, new `stationTransporterRange` 600,
  `stationDockRange` unchanged at 150. `callPoi()`'s station branch now
  picks the innermost range the pilot has physically reached, gated by
  favor: docking (Trusted) gets its own worked refusal line when favor
  falls short ("docking denied. Earn our trust first — Unknown favor, 0
  of 40 needed." — the spec's own example named a wanted resource
  instead, which doesn't exist yet, so the favor number stands in);
  falling short of Known at transporter range silently drops to the
  comms menu instead, since being close but unwelcome there is really
  just "still at comms" from the station's own point of view. The hail
  menu splits into `COMM_ITEMS` (Missions, Close — reachable at any
  tier) and `TRANSPORTER_ITEMS` (Rearm, Sell ore/salvage/alloy, Buy
  reaction mass, Close — gated on Known). **Built as an ADDITIONAL,
  closer-in access tier, not a relocation**: every transporter action
  stays reachable from the docked station menu exactly as before, so
  landing never loses anything it had — a deliberate, flagged scope
  choice, since the spec's own "transporter, no landing" framing could
  also read as moving these out of the docked menu entirely. A new
  `transporter_range` audio cue (a rising pair with a shimmer, per spec)
  joins the existing `comm_range`/`dock_range`/`range_lost` crossing
  cues, `updateStationRanges` now tracking three bands instead of two.
- **Range growth**: three new MODULES (`comm_array` +50%, `transporter_
  booster` +50%, `docking_computer` doubles — matching the spec's own
  wording), applied through the existing `moduleCfgOverlay()` mechanism
  with zero new plumbing; a new `stationRangeFor(kind, poiName)` layers
  an Allied station's own +25% (`alliedRangeBonus`) on top of whatever
  the ship's modules already give, per station, since only stations the
  pilot has actually earned Allied standing at should get it.
- **The tug** (SPEC 2.16) reworked per spec: `nearestTrustedStationTo()`
  replaces "just the nearest station" with "the nearest station that
  actually trusts the pilot," at the base wait; if none in the quadrant
  qualifies, a new `tugHomeFactor` (2) doubles the wait for the long ride
  home to Meridian by name. Replaces the old influence-halving model
  entirely (`tugInfluenceFactor` retired).
- **F2** gained a "Station access" heading (the three base ranges plus
  the Allied-bonus reminder); **I** speaks the selected station's tier
  once in comm range; the quadrant map's per-station line does too
  (`stationTierNote`). **F4 pricing is NOT built** — that's 3.11's own
  item, not duplicated here.
- **Migration**: `PROFILE_VERSION` → 6. An old save's flat
  `profile.stations[name].influence` folds into the new per-quadrant
  `ports` structure at ×10 (the spec's own conversion), only when there's
  real data to migrate — `ensureQuadrantHome()`'s own "first ever Sector
  visit" guard had to move from checking the quadrant record's mere
  existence to checking its `.zone` specifically, since the migration can
  now pre-create a bare shell (zone: null) purely to hold folded-in
  favor for a profile that's never actually visited the Sector.
- **Two real bugs found in testing, both fixed before shipping**:
  1. The migration's original unconditional shell-creation crashed
     `__sim.state()`'s own quadrant accessor (`q.zone.name` on a null
     zone) for a genuinely fresh profile — caught immediately on the
     first clean boot test. Fixed by only creating the shell when
     `profile.stations` actually has data to fold in, and hardening the
     accessor's own guard to check `.zone` too, as defense in depth.
  2. **The load-bearing one**: `reconcileFavor`'s decay-floor logic
     applied `Math.max(floor, decayed)` unconditionally, which doesn't
     just stop decay from crossing the floor going down — it SNAPS ANY
     value already below the floor UP to it, the instant the port is
     next touched, regardless of why it was below (a poked test value,
     or, in real play, a genuine `favorFriendlyLost` loss landing under
     a floor set by an earlier, higher peak). Concretely: favor at 5
     with a peak-derived floor of 10, then a +10 gain, came out to +15
     rather than +10 — the floor-clamp silently added 5 of its own
     before the real gain was even applied. Found via a direct,
     reproducible repro (confirmed with `console.log` instrumentation
     showing the value jump between "before" and "after reconcile," i.e.
     before the actual delta was ever added), root-caused by static
     reading once the repro was solid, and independently confirmed fixed
     via a standalone Node.js simulation of the corrected logic (four
     cases: the exact repro, ordinary long-run decay correctly flooring
     at 10, a real loss correctly draining past the floor toward 0
     rather than being un-done, and decay from just under peak still
     flooring correctly) — cheaper and more trustworthy than continuing
     to fight the browser test harness for this one. Fixed by only
     invoking the floor when favor started AT OR ABOVE it; a value
     already below decays (or sits) freely.
- **A genuine testing-methodology snag, not a game bug**: partway
  through this round, repeated "fresh profile" checks in the sandboxed
  browser pane kept showing old data (a station's favor from many steps
  earlier) despite `localStorage.clear()` confirmed empty immediately
  before boot — closing tabs and fully restarting the local static
  server didn't reliably clear it either. Every conclusion in this
  round's own testing was still verified correctly despite this, because
  every check compared "before" against "after" WITHIN one continuous,
  uninterrupted script rather than trusting a "fresh reload" to establish
  a clean baseline — a discipline worth keeping for any future round that
  hits the same flakiness.
- **Deliberate simplification, flagged for Brian's call**: mining in the
  open quadrant is NOT hard-blocked before the Contested Zone is
  cleared, unlike the fixed delivery run's own gate — only the FINAL
  step of anything gated on favor (docking, the transporter) is
  order-sensitive; free-flight mining stays exactly as open as it always
  was. Also worth Brian's ear: Station Meridian starts EXACTLY at
  `favorTrusted` (40), its own tier boundary with zero buffer — any
  decay at all (even a few idle minutes without a sale or mission there)
  drops it into Known until touched again, observed directly in testing.
  A slightly higher starting value (50, say) would give it real headroom
  as "home" instead of teetering on the line.
- Not built: Control/Invest/the tithe/unions/quadrant-wide comms (blocked
  on 3.11's wants table, see above); F4 pricing (3.11's own item); a
  wants-based favor bonus (every sale counts toward favor for now, not
  just what a station specifically wants, since no such list exists).
  Machine-tested at a local server and confirmed on a fresh profile:
  Station Two starts Unknown and refuses transporter/docking by name;
  two escort missions there correctly cross Known (8+8=16); selling ore
  speaks the right favor gain; Trusted unlocks docking; an Allied
  station's ranges measured exactly 1.25× base; buying `comm_array`
  measured `stationCommRange` at exactly 3000; the tug picks a nearby
  Trusted station at the base wait and doubles the wait home to Meridian
  when none qualifies; the v5→v6 migration folds an old influence save
  in correctly (confirmed against a seeded profile); the demo's own
  Meridian stays completely unconditional regardless of the open
  quadrant's favor state; F2's new heading and the escort mission
  regression both confirmed unaffected. Zero console errors throughout.
  Every favor/range number is a placeholder for Brian's ear. Not yet
  heard or flown by Brian.

#### 3.33 Favor, second pass (ideas9 — Brian's answers to the 3.23 review, 2026-09-05) — DONE

Brian read 3.23 as built (the review in Part C, "ideas9") and answered.
Everything here is a change to 3.23's own code, not a new system —
one round, before 3.11, since the economy builds on these numbers.

- **Decay is absence, not time.** `reconcileFavor` must stop stamping
  `lastVisitHour` on every read; only a real interaction at that port
  stamps it — a hail, a sale, a donation, a mission accepted or
  completed there, a docking. Reads apply whatever decay has accrued
  and leave the stamp alone. (As built, every station is read every
  frame in the sector, so favor drained everywhere at 1 per play-hour
  whether the pilot traded there daily or never.) Rates: `favorDecayPerHour`
  1; `favorDecayHonored` 0.5 past Honored; the 0.4 / 0.25 quadrant-
  control rates wait for control to exist (3.23b) and are written into
  CFG now as `favorDecayQuadrantControlled` / `favorDecayQuadrantsTouching`
  with nothing reading them yet.
- **The floor is 40, and decay starts at 70** (Brian, ideas10). Trusted
  is permanent: once a port's `peakFavor` has reached `favorTrusted`,
  favor never drops below it. And decay **doesn't run at all below
  Allied** — `favorDecayStartsAt` = `favorAllied`; a Known or Trusted
  pilot never loses a point to absence, an Allied or Honored one drifts
  back toward 40 at the rates above and stops there. `favorFloorTiers`
  goes. **Nobody starts at 40**: `ensurePort` no longer special-cases
  Meridian — home is a stranger like every other station, and a fresh
  pilot in the quadrant can't dock anywhere until they've earned Trusted
  somewhere (the tug still lands them at Meridian and docks them, as
  its arrival always has; `nearestTrustedStationTo` finds nothing on a
  fresh profile, so every early loss is the long ride home).
- **Five tiers.** Add `favorHonored` 90. Range bonuses by tier
  (`favorRangeBonus`): Trusted +25 %, Allied +50 %, Honored +50 %
  (`stationRangeFor` reads the tier's bonus instead of Allied-only).
  Honored's 25 % purchase discount (`honoredDiscount`) applies to modules
  and lasers now and to 3.20's Buy lines when they exist; "unique or
  bonus items" is Phase 4 (Part C). `FAVOR_TIER_WORDS` gains a line for
  Honored; F2's Station access heading names the tier bonuses.
- **Numbers.** `favorMission` 8 → **16** (escort, defend, the contract);
  `favorPerWantUnit.ore` 200 → **500** (salvage and alloy stay 4 — a
  full 15,000 hold is now +30, not +75); clearing the quadrant's
  Contested Zone pays `favorZoneClear` **16** at the nearest station —
  Known in one fight, the "stranger gate" Brian describes (spoken in the
  same victory line, never a second `say()`).
- **Donate ore.** A new line on **both** the comms and transporter menus
  (comms is the point — it's how a stranger becomes Known without a
  fight): "Donate ore. 2,000 ore per point of favor; your hold reads N."
  Its own rate, `donateOrePerFavor` **2,000**, not the sale rate — so
  a full 20,000 hold (3.14's `cargoMax`) is exactly Known: Brian's
  "20k to skip the first combat encounter." Enter donates the whole hold
  for `floor(ore / donateOrePerFavor)` favor and no credits, says the
  favor and the new tier if it changed.
  Refused while the delivery run's or the contract's ore is owed
  (`oreSellBlocked`, same rule as Sell). Salvage and alloy are not
  donated — ore is the currency of standing; this is also 3.23b's
  "sink ore into a station" lever in its first form.
- **Quadrant-wide comms** (`profile.quadrants[q].openComms`): set the
  first time the quadrant's own Contested Zone is cleared. While set,
  C on any station from anywhere in the quadrant opens the **comms**
  menu (hail, missions, donate) — the transporter and docking still
  need their ranges. The map line says "comms open" on the quadrant's
  first line; the zone's victory line announces it once. The delivery
  run's fixed sector never sets it.
- **The delivery run keeps the new ranges** (Brian: keep) — nothing to
  change; its Meridian is favor-blind and 2000/600/150 like everyone.
- Test: absence decay only (two stations, trade at one for an hour,
  only the other drops); the 40 floor holds from 41 over any stretch
  and 39 still drains; Honored at 90 widens ranges 50 % and prices
  modules at 75 %; a mission pays 16; 15,000 ore sold pays +30; a zone
  clear pays 16 at the nearest station; donation from comms range at a
  stranger crosses Known and refuses while the contract's ore is owed;
  the zone clear opens comms and a hail from 10,000 out works.

**DONE (Round 25, Sonnet), built against ideas9's own numbers, THEN
Brian's ideas10 answers changed two of them further** (see the note at
the end). `reconcileFavor` is retired, replaced by a clean read/write
split: `decayedFavor(port)` is a PURE calculation (never mutates
`port.favor` or `port.lastVisitHour`) called from every read, including
`favorOf` and every per-frame range-band check; `touchPort(port)`
COMMITS whatever decay has accrued and resets the absence clock, called
only from real interactions — `openHailMenu` (any tier), `dockAtStation`,
`sellOreAt`/`sellResource` (via a new `touchStationVisit` helper, even
when the sale is too small to cross a whole favor point), the new
`donateOreAt`, and mission accept (both escort/defend and the SPEC 3.28
contract) via `startMissionRun`. `favorFloor(port)` returns
`CFG.favorTrusted` once `peakFavor` has ever reached it, else 0, and
BOTH `decayedFavor`'s decay clamp and `writeFavor`'s own gain/loss clamp
route through it — so the permanent floor holds against a hard loss
(a mission's `favorFriendlyLost`), not just slow decay, matching
Brian's literal "favor should not ever go below 40" rather than a
narrower "decay can't drop it" reading. Five tiers: `FAVOR_TIERS` gained
`'honored'`, `favorTierMin`/`favorTier` extended, `FAVOR_TIER_WORDS`
gained a line; `CFG.favorRangeBonus` (`{trusted: .25, allied: .5,
honored: .5}`) replaces the old Allied-only `alliedRangeBonus`, read by
`stationRangeFor`. `honoredDiscountAt(poi)` (1, or `1 - honoredDiscount`
at an Honored station) is threaded through every purchase site: module
cost (`moduleCost`, credits only — alloy stays full price, the same
call this project already made for laser levels), `laserLevelCost`/
`laserRepairCost` (new small helpers, replacing four separate inline
computations), reaction mass (`TRANSPORTER_ITEMS`' Buy line), and
collision-damage repair billing inside `dockAtStation`. **Donate ore**:
a shared `DONATE_ORE_ITEM` object sits in both `COMM_ITEMS` and
`TRANSPORTER_ITEMS` (comms is the point — a stranger's way in without a
fight), `donateOreAt(poi)` gives `floor(ore / donateOrePerFavor)` favor
for the whole hold, no credits, gated by the same `oreSellBlocked()`
rule Sell already uses. **Quadrant-wide comms**: `destroyTarget()`'s
zone-clear branch gained a `!demo && sectorHome` block (gated exactly
like the OLD, since-retired influence bump was — a standalone Combat
drill has no `sectorHome` and doesn't feed it) that pays
`favorZoneClear` at `nearestStationTo(sectorHome.pos)` and, the first
time it happens in a quadrant, sets `profile.quadrants[q].openComms`
and folds a one-time announcement into the SAME deferred `say()` the
victory line already uses. `callPoi()`'s outer "too far" check now
short-circuits for a station when `openComms` is set (comms only —
transporter and docking still read the real distance below); the map's
opening line names it once set. **A pre-existing bug fixed in passing,
same class as 3.23's own mission-favor fix**: `ensurePort` no longer
special-cases Station Meridian's name at all (SPEC 3.33's "nobody
starts favored" is now the WHOLE rule, not layered on top of an old
default). Machine-tested at a local server: a port poked to 80 favor
with its clock parked 1,000 "hours" in the past read back completely
stable across three repeated reads (the OLD bug's own signature — it
would have decayed further on every read); hailing it afterward (a real
touch) correctly floored the commit at exactly 40 and reported "We
trust you" with Trusted's own +25% ranges (750/188 from a 600/150
base); a real 5-ship zone clear (four kills confirmed via real fired
shots, salvage-and-reaction-mass lines read out live, e.g. "Salvage
plus 5, reaction mass plus 15") correctly folded "Quadrant-wide comms
open" into the victory line exactly once, the map's next open echoed
it, and a hail from 14,240 units out (far past every range, boosted or
not) succeeded; Donate ore appeared on both menus and paid the right
favor for a partial (sub-threshold) donation. Zero console errors.
Built directly against the numbers as Brian settled them across both
ideas9 and ideas10 (nobody starts at 40, Meridian included;
`favorZoneClear` 16 to match the doubled mission rate) — this section's
own bullet list above still shows a stray "8" for the zone-clear number
from the ideas9-only draft; fixed to 16 just above, matching CFG. Every
favor/range number is a placeholder for Brian's ear. Not yet heard or
flown by Brian.

**Correction (Brian, ideas11, 2026-09-05): the home station IS the
exception.** Playing the build above, Brian reversed the one line of
ideas10 that mattered most here — "nobody starts at 40, Meridian
included" — back out: "the player would indeed start out favored in Q1
at that first station. that would be the 'home station' and never not
have favor." `ensurePort` now seeds Station Meridian, in the home
quadrant specifically (`profile.quadrantId === 'home'`), at exactly
`favorTrusted` (`favor` AND `peakFavor` both 40) the first time anything
touches it — every other port, and Meridian in any future non-home
quadrant (3.22), still starts a stranger at 0. "Never not have favor"
falls out of the EXISTING floor rule for free: `favorFloor` already
treats `peakFavor >= favorTrusted` as a permanent floor at 40, so
seeding peakFavor there at creation makes the floor permanent from the
very first frame, with no separate special-case needed in decay, hard
losses, or the v5→v6 migration's own `max()`-merge of old influence
data (a save with real old influence at Meridian still correctly keeps
whichever is higher). This also quietly resolves a pre-existing
inconsistency: the game's own help text (`HELP_SECTIONS`, the Sector
entry on favor) had said "Station Meridian starts Trusted — it's home"
the WHOLE time, unchanged since Round 23 — 3.33's "nobody starts
favored" rewrite above never touched that line, so the shipped build
briefly had code and help text disagreeing with each other. They agree
again now. Machine-tested at a local server: a fresh profile's first
Sector entry shows `Station Meridian: {favor: 40, peakFavor: 40}` and
`Station Two: {favor: 0, peakFavor: 0}` in the same read; hailing
Meridian immediately says "We trust you" with Trusted's own +25% ranges
(750/188); forcing Meridian's clock 100,000 hours stale and hailing
again still reads exactly 40 (the floor holding against a decay
"attack" this extreme, same test shape as 3.33's own). Zero console
errors. Not yet heard or flown by Brian.

#### 3.34 A full stop to dock (ideas9) — DONE

- Docking and landing need the ship **stopped**: C inside dock range
  with speed above `dockMaxSpeed` **2** refuses — "Station Two control:
  come to a full stop to dock. Speed 14." — and does not dock. The
  stabilizers bring a coasting ship to zero on their own (2.14), so the
  gesture is *let go of W and wait*, or S to brake, then C again. The
  hail and the transporter don't care about speed. The tug's own arrival
  docks as it always has (it stops the ship first). The delivery run
  gets the same rule — it's the approach Brian wants taught. A new help
  line and the C key description say it. Test: C at 14 refuses and
  names the speed; C at 1.5 docks; the same at a planet once 3.19
  exists.

**DONE (Round 25, Sonnet).** `CFG.dockMaxSpeed` (2) checked in
`callPoi()`'s dock-range branch, before the favor-tier check (the more
basic gate) — `len(ship.vel) > dockMaxSpeed` refuses by name with the
rounded speed, `dockAtStation` never runs. The hail and transporter
branches are untouched (no speed read there at all, matching "don't
care about speed"). The tug's own arrival was already unaffected —
`tugArrives()` runs through `newGame('sector')` (which zeroes
`ship.vel` inside `clearMission()`) before calling `dockAtStation`
directly, bypassing `callPoi()`'s gate entirely, so it never needed a
change; confirmed by inspection, not just assertion. Help text (the
Sector section's own "range and standing" line) and `KEY_DESCRIPTIONS.c`
both updated to mention the stop. Machine-tested at a local server: `C`
at speed 14 inside dock range refused with "Station Two control: come
to a full stop to dock. Speed 14." and left the ship undocked; the same
approach at speed 1 docked normally. Zero console errors. Not yet heard
or flown by Brian.

#### 3.32 Reaction mass matters (ideas9) — DONE

Brian: reaction mass should be *earned* in the ordinary course of a
run — looted from every kill, drawn from dust while vacuuming, paid as
mission reward — sized so that a clean delivery run (five kills, 15,000
ore) never spends long on battery, while a sloppy one (a lost fight, a
rock kicked out and a second cloud, a long thrust out of the no-warp
zone) definitely feels it.

- **Sources**: every ship kill drops `rcsPerKill` by class
  (`RCS_PER_KILL`: interceptor 6, corvette 9, cruiser 15 — into the same
  salvage line: "Salvage plus 3, reaction mass plus 9."); every vacuum
  tick that collects dust adds `rcsPerDustUnit` 0.002 per unit of dust
  (about 2 per 1,000 dust — dust is the steady trickle, cores the lump:
  `rcsPerIceCore` stays); escort/defend/the contract pay `rcsMission` 25
  on success. All folded into the lines that already speak those events.
- **The budget, simulated before it's tuned**: a `__sim.runBudget()`
  test hook (or a Node script over the same numbers) totals a "normal"
  delivery run — thrust to clear the no-warp zone twice, one combat
  (five kills), one field to 15,000 (its dust and cores), the approach
  and stop at Meridian — against `rcsMax` 100 with the stabilizers'
  own spend (`rcsPerSpeedShed`), and reports the balance. Target: the
  clean run ends above 25 % without a station fill; the sloppy run (add
  a second field, a lost fight's tug, 30 s of extra thrust) ends on
  battery. Tune `RCS_PER_KILL`, `rcsPerDustUnit`, `rcsMission` until
  both hold, write the numbers into CFG, and hand the two scenarios to
  Brian to fly — he decides.
- F3's reaction-mass line names what it's fed by. Test: the two
  simulated runs land where the target says; a kill's line names the
  mass; the vacuum's running total rises while dust is collected.

**DONE (Round 25, Sonnet), with one honest limitation flagged up
front**: `runBudget()` is a rough ESTIMATE built from the CFG numbers
directly (named assumptions inline: a corvette-average Contested Zone,
a 0.6 dust fraction of the ore goal, ~40 u/s closing speed out of the
no-warp zone), not a real physics simulation — actually driving the
ship through a full timed delivery run via the browser test harness
would cost far more than this round's budget for a number Brian's own
text already says is a guess ("we need to guess and just pick some
numbers and probably have me try it"). `RCS_PER_KILL` (interceptor 6 /
corvette 9 / cruiser 15, next to `SALVAGE`) and `addKillRcs(shipName)`
fold into `damageTarget`'s existing kill line ("Salvage plus 3, reaction
mass plus 9."), never a second `say()`; a silent per-tick trickle from
`dustTick()` (`amount * CFG.rcsPerDustUnit`, un-spoken on purpose — it's
fractions of a unit every couple of seconds, and naming it there would
just be noise on top of the ore count that line already reads, checked
instead on F3); `CFG.rcsMission` (25) added to both `missionEnd(true)`
and the SPEC 3.28 contract's own completion, the latter flagged as
effectively masked in practice — completing the contract always means
docking, which already refills reaction mass to full a few lines below
regardless, so the mission-parity line is honest but mostly moot there.
The OLD `CFG.rcsPerKill` (a flat 5, never actually wired to anything —
confirmed via a clean grep before removing it) is retired outright, not
kept alongside the new by-class table. `window.__sim.runBudget(scenario)`
sits next to `state`/`poke`/`step` on the test hook. Machine-tested at a
local server: `runBudget('clean')` reports 58% of the tank remaining
(comfortably above the 25% target, no station fill needed);
`runBudget('sloppy')` reports 0%, `onBattery: true` — both land exactly
where the spec's own target says they should. A real 5-ship kill
sequence confirmed the spoken line and the exact by-class amounts live
("Salvage plus 2, reaction mass plus 6" for an interceptor, "...plus 5,
...plus 15" for a cruiser). Zero console errors. Every reaction-mass
number here — the by-class amounts, the dust rate, the mission bonus,
and the budget estimator's own assumptions — is a placeholder for
Brian's ear and, per his own text, for him to actually fly and judge.
Not yet heard or flown by Brian.

#### ideas10.txt — Brian's notes from flying the Round 25/26 build (2026-09-05, 14:26)

A file, not the chat answers Part C already calls "ideas10" — see the
note there. Seven items, all small except the last, all before quadrant
2: 3.39 → 3.40 → 3.37 → 3.35 → 3.36 → 3.38 (the two one-liners first,
then the possible bug, then the tug, the hull, and the one real new
system). Every number is a placeholder for Brian's ear.

#### 3.39 The first screen speaks, and repeats (ideas10.txt) — DONE

- The Press-Enter-to-Begin page is silent until Enter. Brian: announce
  it, and if the player misses it, again after 10 seconds and every
  20 seconds after that until Enter is pressed.
- `say()` works before the AudioContext exists (it's an aria-live div,
  not audio), so the boot script speaks at load: "Headless Space Sim.
  Press Enter to begin. Wear headphones." Then a `setTimeout` at
  `beginRemindFirstMs` 10,000, then `setInterval` at `beginRemindEveryMs`
  20,000, both cleared the instant the begin gesture fires (click or
  Enter). The reminder is the same line — a second wording would be a
  second thing to learn.
- The live region must exist before the click, not be created by it —
  check, since this is the one moment nothing else has spoken yet.
- Test: load, hear the line at 0, 10, 30, 50 s; press Enter at 35 s and
  confirm nothing speaks at 50.

**DONE (Round 26, Sonnet).** Built exactly as specced: `say(BEGIN_LINE)`
right after `liveEl` is assigned in `init()` (before the AudioContext
exists — the aria-live div doesn't need one), then a `setTimeout` at
`CFG.beginRemindFirstMs` (10,000) that re-speaks the line and starts a
`setInterval` at `CFG.beginRemindEveryMs` (20,000); `initBtn`'s own click
handler clears both at the top, before anything else runs. The repeat
works for free off `say()`'s own existing hair-space mechanism — the
identical string spoken again is heard as a new announcement, not
silently dropped. Machine-tested at a local server: a fresh load reads
the line immediately and it's still unchanged (byte-identical, no hair
space) at 2.8s; forcing real time to the 10s mark (a single continuous
`setTimeout`-based wait, since this needed genuine wall-clock time, not
`__sim.step()`) showed the hair-space repeat had landed by 10.4s and not
before; clicking Enter and then waiting 22 more real seconds confirmed
neither timer ever fires again. Zero console errors. Not yet heard by
Brian.

#### 3.40 The lab links home (ideas10.txt) — DONE

- `soundlab.html` is reached from the mission menu's Sound Lab item but
  has no way back except the browser's Back. Brian: links to the main
  menu on the demo pages.
- A "Back to the game" link (`index.html`) at the top of the page — on
  the start gate too, so a screen-reader user who lands here can leave
  without ever starting audio — first in the Quick Navigation list, and
  again at the very bottom. Plain `<a href>`, no custom key trap: Tab
  reaches it, Enter follows it.
- "Demo pages" is plural; today only the lab exists. Any future
  standalone page gets the same link by rule.
- Test: Tab from the start gate reaches the link before the Start
  button; following it lands on the mission menu.

**DONE (Round 26, Sonnet).** Three plain `<a href="index.html">Back to
the game</a>` links: on the start gate (before the Start audio button in
DOM order, so Tab reaches it first — a screen-reader user can leave
without ever starting audio), first in the Quick Navigation list, and
once more at the very bottom of the page content. No custom key
handling — native anchors, Tab and Enter already work. Machine-tested:
`read_page` confirmed the start-gate link precedes the Start button in
tab order; clicking it navigated to `index.html` and landed on the
mission menu. Zero console errors.

#### 3.37 Decoys: confirmed working, and heard working (ideas10.txt) — DONE

- Brian: "I'm not certain that decoys are working, or at least need a
  separate announcement or sound that they worked." Two jobs, in order.
- **First, prove it.** Test a guided enemy missile inbound, D pressed
  mid-flight: `threat.guided` flips false, the missile coasts
  `missileCoastS` and pops without touching the hull. Record the
  measurement in the DONE note. If it does NOT work, that is the bug,
  and the announcement below is built on the fix.
- **Then say so when it pays off, not when it launches.** Today the only
  line is at the press ("Decoy away. Missile spoofed."), in the same
  breath as the launch cue — the player has no way to tell a spoof that
  worked from one that didn't. Add the outcome:
  - a new cue `decoy_took` — a short, distinct sound, NOT `chaff_burst`
    (the launch) — played at the missile's own position on the world
    bus at the moment the spoofed missile pops harmlessly, with "Decoy
    took it." (`endThreat`'s ballistic-pop branch, gated on a
    `th.spoofed` flag D sets). A real timer separates this from the
    launch line, so both are heard (SPEC 2.15's rule).
  - a spoofed missile whose ballistic path still clips the hull says
    "Spoofed missile clipped you." on its hull line instead of the
    plain hit — rare, but the silence would read as "the decoy lied."
  - the launch line drops "Missile spoofed" (a promise it can't yet
    keep) for "Decoy away. Missile going ballistic." — the confirmation
    comes a second later from the pop.
- Test: the proof above; the two lines a second apart; a beam-only
  threat still gets today's "Decoys do nothing against a laser."

**DONE (Round 26, Sonnet).** The proof came first, and decoys were
never broken: `fireChaff()`'s existing `th.guided = false; th.coast =
0;` already sent a spoofed missile properly ballistic, and `stepThreat`'s
existing `coast > CFG.missileCoastS` branch already popped it clear with
no hull contact — this round added a `th.spoofed` flag (set only by
`fireChaff`, never by the shield-drop branch that does the same guided/
coast reset) so the pop can tell a decoy-spoofed miss from a shield-
dropped one, a new `decoy_took` cue (two quick ascending notes at the
missile's own position, on the world bus — deliberately not
`chaff_burst`'s crackle, which stays the launch sound) played there with
"Decoy took it.", and the launch line itself dropped its premature
"Missile spoofed" for "Decoy away. Missile going ballistic." — the actual
confirmation now comes a beat later, from the pop, timed by the missile's
own real coast delay (no artificial timer needed; SPEC 2.15's "never two
say() in one tick" rule is satisfied for free since launch and pop are
already seconds apart). The rare clip case got a matching line:
`hullHit()` gained an optional `prefix` parameter, folded into its
existing single `say()`, used today only for "Spoofed missile clipped
you." ahead of the hull number.
Machine-tested at a local server end to end, against a REAL live guided
missile (not simulated) — the harder part of this item, since the
standalone Combat drill's ships hold fire until hit and this project's
own mining lasers plus Rookie's ×2 ship multiplier one-shot most of the
roster (confirmed the hard way: a full-aim burst killed a Raider, then a
Cruiser, before the fix — aiming AWAY from the target instead turned out
to skip `damageTarget` entirely, since `beamTick` only calls it when
`dmg > 0`, so a dud shot doesn't provoke either). The method that
actually worked: fire a full-aim burst at the Cruiser (guaranteed real
damage, hence a real provoke) while repeatedly `poke({enemyHp: 999})`-ing
it back up between ticks so it survives — Rookie's Cruiser is
`missileOnly`, so once hostile its first attack is always a missile,
never a coin flip. Confirmed: the guided threat appeared
(`state().threat.guided === true`); D flipped it to `guided: false` and
spoke "Decoy away. Missile going ballistic. 3 left."; stepping time past
`missileCoastS` produced "Decoy took it." with the hull untouched at
100; forcing a fresh spoofed missile's position onto the ship's own
(`poke({pos: threat.pos})`) before the coast timer expired produced
"Spoofed missile clipped you. Your hull 75." with the expected 25-point
hit. Zero console errors. Not yet heard by Brian — the confirmation
sound is new and unheard.

#### 3.35 The tug, second pass: 100 credits, a second rush, and a wait that teaches (ideas10.txt) — DONE

- **100 credits to start.** `defaultProfile().credits` 0 → `startCredits`
  100. New profiles only — no migration adds money to a save.
- **Rush the tug more than once.** Brian: "50 is the tow cost so can
  shorten that 2x." Read as: the fee is repeatable — every
  `tugFeeCredits` 50 paid halves whatever is LEFT, as many times as the
  pilot can afford, so a fresh pilot's 100 credits buy exactly two
  halvings (90 s → 45 → 22.5). `tug.paid` becomes a count; the line
  after each payment says the new time and, while credits allow,
  "Enter pays another 50." Broke refuses as now. Flagged in Part C in
  case "2x" meant something else.
- **The wait teaches.** Brian: a lost player needs reminders of F2 (the
  ship), F3 (the hold), F4 (once 3.11 exists). The countdown already
  speaks every 10 s; at two of those marks (the first after death and
  the 30-second mark) it appends one clause: "F2 reads your ship, F3
  your hold." — one `say()`, never a second, and only while F2/F3 are
  actually reachable from the wait (they are). When 3.11 lands F4 joins
  the clause. The delivery run's own tug wait says it too.
- A.11 gains the repeatable fee.
- Test: a fresh profile reads 100 credits on F3; a campaign death at
  90 s: Enter → 45 and "another 50", Enter → 22.5 and no offer (0 left),
  Enter → "Need 50 credits"; the two reminder marks speak the clause
  once each; a drill death is unchanged.

**DONE (Round 26, Sonnet).** `CFG.startCredits` (100) replaces
`defaultProfile()`'s hardcoded 0 — a save with real data still overwrites
it via `loadProfile`'s own `Object.assign(profile, saved)`, so no
migration adds money to an existing profile, only a genuinely fresh one
gets 100. `tug.paid` is now a count, not a boolean; `payTugFee()` dropped
its old "already paid" refusal entirely — only "not enough credits" ever
refuses now — and offers "Enter pays another 50." in the same line
whenever the remaining balance still covers it. `updateTug`'s own
10-second countdown gained `TUG_REMINDER` (" F2 reads your ship, F3 your
hold."), appended once at the FIRST boundary crossing after death
(`tug.remindedFirst`) and once more at whichever crossing first lands at
or under `CFG.tugReminderMarkS` (30s, `tug.reminded30`) — mutually
exclusive, so a single announcement never carries the clause twice.
Machine-tested at a local server via a real Contested Zone kill (not a
drill — `tugCandidate()` needs `sectorHome`): a fresh profile read 100
credits on F3 before the fight; after death, Enter → "Paid 50 credits.
Tug in 45 seconds. Enter pays another 50." → Enter → "Paid 50 credits.
Tug in 23 seconds." (no offer, 0 credits left) → Enter → "Need 50
credits to rush the tug; you have 0."; a SECOND fresh death (no
payments this time) confirmed both reminder marks firing exactly once
each, at the first boundary and again at the 30s mark, via
`__sim.step()`-driven ticks (one cosmetic wrinkle found along the way,
not a bug: `shipDestroyed`'s own delayed 900ms "Hull breached..."
message can transiently overwrite whatever the tug's own countdown just
said, in the same visible `announce` div — the flags underneath are set
correctly regardless of which text a screen reader happens to catch,
and this race predates this round, unrelated to the repeatable fee).
Zero console errors. Not yet heard or flown by Brian.

#### 3.36 The repair crew works the hull (ideas10.txt) — DONE

- Brian: "repair crews should work on the hull when it gets damaged, so
  that if a player takes damage but their shields recharge, they can
  actually get healthier while still fighting."
- The hull becomes the crew's job **when nothing else is broken** — the
  lowest rung under `REPAIR_PRIORITY`, so a knocked-out system always
  pulls the crew off the hull first and the hull resumes when the
  systems are whole (3.27's preemption, one rung longer). Rate: **half
  the crew's system rate** (Brian: "hull repairs do not happen at the
  same rate as other modules/components, let's use 1/2") — systems
  climb at `50 / repairHalfS` percent a second, so the hull climbs at
  `25 / repairHalfS` points a second (`repairHullFactor` 0.5, one knob,
  in case the fraction moves): stock 90 → ~0.28/s, a 100-point hull in
  about six minutes; the two `repair_crew` modules speed it exactly as
  they speed everything else (45 → 0.56/s, three minutes; 30 → 0.83/s,
  two). No cap: the crew takes the hull back to 100 given time. Docking
  stays instant. Collision damage repaired by the crew is still BILLED
  at the next landing (2.14's `collisionDamage` is money owed, not
  hull) — say so in the DONE note if it feels wrong in play.
- **All repairs spend reaction mass** (Brian: "repairs use reaction
  mass or whatever the resource we use for thrusters... yes, all repairs
  use reaction mass" — it is reaction mass, 2.14's `rcs`). One rate for
  the whole crew, `repairRcsPerPoint` **0.2** per point restored — a
  hull point or a system's percent point alike — so a full 100-point
  hull or a full 0→100 system repair costs 20 of the 100-unit tank, and
  a long fight's patching shows up on F3: a pilot who fixes everything
  the slow way pays for it in maneuvering. This reaches back into 3.27
  as built: `updateRepairCrew`'s system work spends mass at the same
  rate from this item on (a one-line change there, noted under 3.27).
  Drawn through `spendRcs()` so the 50/25 % alerts and the battery flip
  fire exactly as thrusting does. The crew **stops all work** at
  `repairRcsFloor` **10** — it never drains the tank past the point
  where the ship can still turn and brake — saying "Damage control
  paused: reaction mass low." once, and resumes on its own when a kill,
  an ice core, or a fill puts mass back. Empty tank (battery) therefore
  means no repairs at all, hull or system — a broken thruster with an
  empty tank is a real predicament, which is the point.
- Spoken: "Damage control on the hull." once when the crew turns to it
  after a hit; "Hull repaired." at 100 (the 2.13 pattern — a threshold
  crossing, spoken once, no flag). No line per point. F2's Hull heading
  says whether the crew is on it and the mass it has spent this sortie;
  the Repair crew heading lists the hull as its idle job and the rate.
- Never during the tug wait (the ship is lost) and never while docked
  (the station does it instantly).
- Test: hull to 60 with no systems broken → rising at exactly half the
  system rate (measure both in one run), reaction mass falling 0.2 a
  point, "Hull repaired." once at 100; a knockout mid-repair pulls the
  crew off (hull frozen, mass untouched) and it resumes after; mass
  poked to 12 → repair runs to the floor at 10 and pauses with the line,
  a kill's mass resumes it; a knocked-out system's own repair also draws
  0.2 a percent point and also pauses at the floor (3.27's crew, same
  rule); the modules change the rate and nothing else.

**DONE (Round 26, Sonnet).** `REPAIR_PRIORITY` gained `'hull'` as its
lowest rung; `updateRepairCrew` now picks a `targetId` — the highest-
priority broken system, or `'hull'` once none are broken and
`hull < CFG.shipHull` — and, before doing ANY work, computes that
frame's reaction-mass cost and checks it against `CFG.repairRcsFloor`
(10): short of it, the crew freezes in place (hull OR system, whichever
it was on) and speaks "Damage control paused: reaction mass low." once
(`repairRcsPaused`, cleared the instant mass allows work again); Reserved
mass gates BOTH the hull and every system's repair through the same
`spendRcs()` call systems already had none of before this round, so the
usual 50/25% alerts and the battery flip fire identically to thrusting.
Hull's own rate is the system rate x `CFG.repairHullFactor` (0.5); a new
`repairRcsSpentSortie` accumulator (reset in `repairAllSystems()`, same
as `collisionDamage`) feeds a new F2 Hull line. Machine-tested at a
local server, all via `__sim.step()` for determinism: hull poked to 80
with nothing else broken rose to exactly 82.778 over 10 real-sim
seconds (25/90 x 10, matching the spec's own formula bit for bit) while
reaction mass fell by exactly 4.0 over the FULL climb from 80 to 100 (20
points x 0.2/point — confirmed over a longer window after a shorter one
showed only rounded integers and looked briefly like double the
expected cost); "Hull repaired." fired once at 100; knocking out the
sensor mid-repair froze the hull in place (a separate, real check —
hull genuinely unmoved, not just under a rounding threshold) while the
crew worked the sensor first, confirming the priority rule reaches the
new rung too; forcing mass down near the floor produced the pause line
and a genuinely frozen hull (both hull and mass unchanged over 5 more
seconds), and restoring mass resumed work without any further prompt;
F2's Hull heading read "Damage control on it." plus the cumulative mass
line, and the Repair crew heading read its own new rate/cost/floor
sentence. Zero console errors. Not yet heard or flown by Brian.

#### 3.38 Auto-target — the stabilizers aim the ship (ideas10.txt) — DONE

- Brian's problem, verbatim: "i just did a combat mission where i just
  could not get the cruiser targetted." The cruiser orbits; a blind
  pilot steering onto a moving tick by ear can lose it for a whole
  fight. His ask: an "auto target" that positions and aims the ship —
  never fires, never does damage — as an emergency, from a limited
  pool, not something a starting pilot has, in levels, the fastest
  built first so he can test it. Shift+T.
- **The key.** Shift+T today cycles targets backward (1.15), as does
  Shift+Tab. Shift+Tab keeps cycle-back alone; **Shift+T becomes
  auto-target**. Help, F12, README, and `KEY_DESCRIPTIONS` all change.
  Flagged in Part C — a rebinding of a shipped key.
- **What it does.** With a target selected (Tab), Shift+T spends one
  charge and hands the stabilizers the ship: `updateAutoTarget(dt)`
  yaws and pitches toward the selected target at `autoTargetRate`
  degrees a second (yaw and pitch together), then **holds on it** for
  `autoTargetHoldS` 5 s — tracking a moving target so the lock
  actually lands — then releases with "Auto-target released." Any
  arrow key mid-slew cancels it (the pilot always wins) and the charge
  is spent regardless. The lock itself is untouched: `updateTargeting`
  acquires it the moment the nose is inside the zone, and speaks the
  distance as it always has. The thrust keys keep working under it.
  Sound: the stabilizer puffs already exist (2.14) and play from the
  jets doing the work; add a steady `autotarget_hum` on the UI bus for
  the duration so the pilot hears it's the ship steering, not them.
- **The rate, from the worst case.** Brian: enemy directly behind and
  at max height, the fastest tier takes 2 seconds. Worst case = 180° of
  yaw plus `pitchLimit` (whatever the pitch clamp is) of pitch, moving
  together → `autoTargetRate = max(180, pitchLimit) / autoTargetWorstS`
  with `autoTargetWorstS` **2** for the fastest tier, **4** and **6**
  for the two slower ones (placeholders). Mass (1.7's `shipMass`) does
  NOT slow it — the tier is the number Brian tunes.
- **The pool.** `autoTargetCharges` **3** per sortie, refilled wherever
  missiles are (mission start, retry, docking, the transporter's Rearm);
  I and F2 report them; a press with none left refuses ("No auto-target
  charges. The station refills them."). Brian: "it might be a buff of
  sorts" — a fourth roll in 3.25's `rollKillBuff` (`killBuffAutoTargetChance`
  0.25, +1 charge, folded into the same kill line) so a fight can hand
  one back.
- **Not standard gear.** Three shipyard modules, `auto_target_1/2/3`
  (the 6 s, 4 s, 2 s tiers, each requiring the one below, priced like
  the repair crew's tiers — placeholders), and `CFG.autoTargetTestFit`
  true so every ship has **tier 3** until Brian has flown it — the
  tractor's pattern (3.30). F2 gains an "Auto-target" heading naming
  the tier, the charges, and "Test fit" when the module isn't owned.
- Test: a Cruiser set directly behind at max pitch → locked in 2.0 s
  measured via `__sim.step`; a ship 30° off → proportionally sooner; an
  orbiting Cruiser stays locked through the 5 s hold; an arrow press
  mid-slew releases it and the charge is gone; three presses then a
  refusal; docking refills; the kill-buff roll adds one; Shift+Tab
  still cycles back and Shift+T no longer does.

**DONE (Round 26, Sonnet).** Shift+T split out of the shared shift-chord
block (which still handles Shift+W/Tab/R) into its own `autoTargetKey()`
call; Shift+Tab keeps cycling back, untouched. `autoTargetTier()` reads
ownership directly (`CFG.autoTargetTestFit`, then `auto_target_3/2/1` in
`ownedModules()`) rather than through `moduleCfgOverlay()` — deliberately,
since which tier is owned decides WHICH of three worst-case times
applies, not a flat value to overwrite (the tractor beam's own pattern,
reused). `autoTargetRateRadPerS() = max(π, CFG.pitchLimit) /
CFG.autoTargetWorstTiers[tier-1]` — `π` (180°) always wins today since
`pitchLimit` is 85°, matching the spec's own formula exactly.
`updateAutoTarget(dt)`, called from `simTick` right after the manual
arrow-key block, steers `ship.yaw`/`ship.pitch` toward the selected
target's true bearing via a new `angleTowards`/`angleDiff` pair (shortest-
path, wrapping correctly through ±180°) at that rate, flips `holding`
true the moment `aim(t.pos).err` is within `CFG.autoTargetAimToleranceRad`
(1°) — from then on the 5-second hold counts down while STILL steering
every frame, so a moving target doesn't slip back out — and releases on
either a held arrow key (checked first, before any steering, so the
pilot's own press always wins that frame) or the hold reaching zero. A
steady `autoTargetHum` (sine on the UI bus, ramped in/out) plays for the
duration, alongside the existing stabilizer puffs. Three new MODULES
(`auto_target_1/2/3`, 6/4/2 second tiers, each requiring the one below,
`cfg: {}` — gating only, same as `tractor_1`), `autoTargetCharges`
refilled at all five sites `missiles`/`chaff` already are, a fourth
`rollKillBuff` roll (`killBuffAutoTargetChance` 0.25, +1 charge, gated on
being fitted and not already at the cap), and an F2 "Auto-target" heading
(conditional on `autoTargetFitted()`, matching the Tractor beam heading's
own "no placeholder before the feature exists" rule) plus a line in `I`.
A new `poke({yawDeg, pitchDeg})` test hook (this round's own addition, the
tractor's `poke({targetPos, targetSize})` precedent) and a `state().
autoTarget` block made the exact worst case reproducible without hand-
flying there. Machine-tested at a local server against a REAL selected
target (not a mock): facing it via `faceSelected()`, flipping yaw 180°
and pitch to -85° (the engineered worst case — dead behind, max height),
then Shift+T measured `holding` flipping true at EXACTLY 2,000ms via
repeated small `__sim.step()` calls, matching Brian's own "2 seconds"
requirement bit for bit; a fresh engage measured the mid-slew rate
directly (45° covered in 0.5s = 90°/s, exactly `180°/2s`); the 5-second
hold released on schedule with "Auto-target released."; an ArrowLeft
press mid-slew canceled it at once (`active` false, charge still spent,
manual turning resumed normally the same frame); three charges spent in
a row correctly refused a fourth with "No auto-target charges. The
station refills them."; F2's Auto-target heading read "Tier 3, 2 seconds
worst case, holds 5 seconds once aimed. Test fit." and the live charge
count. Zero console errors throughout. Every number — the three tier
times, the hold, the charges, the module prices — is a placeholder for
Brian to test and judge, per his own request that the fastest tier ship
first specifically so he could. Not yet heard or flown by Brian.

#### ideas11.txt — three proposed items (Fable's review, 2026-09-05; awaiting Brian, Part C)

Written from Brian's `ideas11.txt` as items so they are buildable the
moment he says yes; none is scheduled yet. The two galactic-scale notes
in that file (the lattice, supply chains) went to A.13 and 3.23b as
direction, not here.

#### 3.43 Silent test mode (ideas11.txt) — DONE

- Brian: "add an option for no sound at all and have Sonnet use that
  when testing for now." The `.click()` boot was never actually silent
  once synthetic keys resumed the context — a targeted beacon, a laser
  burst, a tug countdown all reach Brian's own speakers while a test
  runs. Beacons-off (`poke({beacons: 'off'})`) was a partial fix.
- **Unsaved, deliberately.** The Sound menu's four levels are saved to
  the profile; an "everything off" saved there would silently persist
  into Brian's own profile in the same browser after a test. So: a URL
  flag `?mute=1` and `poke({mute: true})`, both setting
  `SIM.audio.masterGain` to 0 (ramped) for the session only, plus
  `state().muted`. Speech is never touched. A Sound-menu "Everything"
  line is Brian's call (Part C) — the test tool doesn't need it.
- **Standing rule once built** (CLAUDE.md, Working agreements): every
  test script boots with `?mute=1` in addition to beacons off.
- Test: `?mute=1` boots to a master gain of 0 with `assets` still
  loading and `say()` still speaking; a reload without the flag is loud
  again; nothing about it is in `localStorage`.

**DONE (Round 30, Sonnet).** A module-scope `muted` flag and one
`setMuted(m)` function are the whole mechanism: `?mute=1` sets `muted`
at parse time (alongside `?run`'s own parsing) and, inside `initBtn`'s
click handler, the gain is set DIRECTLY to 0 (not ramped) the instant
`audioStart()` creates `masterGain` — a boot-time ramp would let through
a brief, audible blip at full volume before reaching zero, which a
"silent test mode" should never do. `poke({mute: true/false})` calls
`setMuted` for a live, ramped (50ms) toggle mid-session, and
`state().muted` reports it. Neither path touches `profile` or
`localStorage` — the Sound menu's own four saved levels are completely
untouched, and `setMuted` only ever moves `masterGain`, sitting
underneath every category bus multiplicatively. `say()` is unreachable
by any of this — it is an aria-live div, no Web Audio node in the
chain. Machine-tested at a local server: `poke({mute: true})` measured
`masterGain.gain.value` dropping from 0.7 to exactly 0 and
`poke({mute: false})` measured it returning to exactly 0.7, both
confirmed after the ramp had time to land; speech (a live menu
navigation) was confirmed still audible-to-a-screen-reader (the
`announce` div still updated correctly) while muted; `localStorage`'s
saved profile was inspected directly and contains no trace of mute
ever having been touched. **A local-testing wrinkle, found and then resolved on Pages**: this
session's browser-preview tool strips query strings from every LOCAL
static-server URL regardless of how it's reached (`navigate`,
`preview_start`, even `history.pushState` + `reload()` all landed back
on the bare origin) — so `?mute=1` itself couldn't be exercised against
`localhost:8934`. It was NOT a code problem: the identical URL against
the live Pages deploy (`?mute=1` is a real navigation there, not this
pane's own sandboxed one) kept the query string and booted with
`state().muted === true` and `masterGain.gain.value === 0` from the very
first read, speech confirmed still working (a menu navigation spoke
normally) and zero console errors — a genuine end-to-end confirmation,
just not one available against the local server this round. Zero
console errors throughout. This is now a standing testing convention
(CLAUDE.md, Working agreements) — every future test script adds
`?mute=1` to its navigation, in addition to the beacons-off poke. Not
yet heard or flown by Brian — nothing to hear, by design.

#### 3.41 The flight course — beacons to fly through, against the clock (ideas11.txt) — DONE

- Brian: a stunt/obstacle course that teaches the controls, the way
  visual games do with a flight path and hoops, made audible: beacons
  to fly through, guidance ticks on the active one, missed gates as
  time penalties, "just seeing how fast the player can complete the
  route" — "this might prove to be a new mini game or encounter/
  instance."
- **In the game, not the lab — the one push-back.** Brian said "the
  demo page," but `soundlab.html` has no ship: the flight model, the
  targeting tick, the thrusters, `HELD` keys, auto-thrust all live in
  `index.html`'s closure, and the lab reproducing them would be a second
  ship to keep in step. His own next sentence asks for "the same
  controls and environment as we've been using in the space sim" — that
  IS the game. So: a mission-menu item, **Flight course**, a new mode
  `'course'` beside the combat and mining drills, with the lab untouched.
- **Shape**: `COURSES` — a list, the first (`gentle`) eight gates as
  positions relative to the start, turns under 30°, spacing ~600, so it
  flies on auto-thrust (Brian's own condition). Each gate is a beacon
  on its own HRTF panner (`buildPoiVoice` with a `course` type: one
  base tone, each gate detuned a little by index — "slight variations
  between the tones"), triggered by passing within `courseGateRadius`
  150. The **active** gate — the lowest-numbered uncleared one — is the
  selected target: it gets the guidance ticks exactly as a POI lock
  does today (`lockToneKind` 'poi'), and when it becomes active its
  number is spoken once ("Gate 3."). **At most `courseAudible` 4 gates
  sound at once**, in order, on a volume ladder (`courseGains` [1, 0.6,
  0.35, 0.2]); a cleared gate falls silent and is removed, and the
  ladder shifts up — so the next one grows as you approach it. **A
  miss** — the ship passes the gate's plane (dot of the ship's position
  against the gate's forward) outside the radius — clears it anyway,
  adds `courseMissPenaltyS` 10 to the clock, and says so ("Gate 3
  missed, plus 10."). The clock runs from the first thrust; the last
  gate speaks the time; `profile.courseRuns` is a third best-10 board
  in the Run log, labelled like the contract's. Enter restarts, X
  leaves. Weapons cold, as in the sector.
- Relation to what exists: this is 3.17's flight tutorial in playable
  form, and the seed of a race POI in a quadrant later (a waypoint kind
  under A.13's lattice, even). Nothing here is new machinery — beacons,
  the tick, the run log, auto-thrust — only a new roster and a new
  win condition.
- Test: eight gates cleared in order on auto-thrust with no key but
  Shift+W; the ladder measured at four audible with the right gains;
  the number spoken once per gate; a deliberate miss adds 10 and moves
  on; the time lands in the Run log and the board sorts.

**DONE (Round 31, Sonnet).** Built exactly as specced, as a fourth mode
(`'course'`) alongside sector/combat/mining, reached through
`startMission('course')` like the others. `COURSES` holds one entry
(`gentle`) as a list of TURNS — how much the path's own heading changes
before stepping `courseSpacing` (600) forward — rather than raw
positions, so the shape stays easy to read and re-tune;
`buildCourseGates()` walks the list once into world positions and each
gate's own forward vector. Each gate is a `kind: 'poi'` target with
`poiType: 'course'` — reusing the ENTIRE existing targeting stack
(lock tone, tick, distance haze, `bearingText`) for free — and its own
tone in `buildPoiVoice` (one sine per gate, detuned by `500 +
gateIndex*35` Hz, "slight variations between the tones"). The volume
ladder (`courseGainFor`) replaces `beaconAudible()`'s on/off for this
`poiType` only, inside `updateTargeting`'s existing mute-setting line —
course gates ignore the B key entirely, the ladder is the only thing
driving their volume. Clearing a gate (`updateCourse`, called from
`simTick`) is a single geometric check: the dot of the ship's
gate-relative position against the gate's own forward vector crossing
from negative to positive means the ship has passed the gate's plane;
the PERPENDICULAR distance from the gate's own axis at that crossing,
against `courseGateRadius` (150), decides clean vs. miss. A miss adds
`courseMissPenaltyS` (10) directly to the clock and is folded into the
SAME `say()` call that activates the next gate (SPEC 2.15's rule —
verified this matters: the miss line and the next gate's own number
would otherwise collide in the same tick). The clock
(`courseState.elapsed`) only accumulates once `courseState.started`
flips true, set the first frame real thrust (W or auto-thrust) is
applied — checked at the exact `k.w` thrust-application site so either
source counts. Weapons, shields, and auto-target are all refused with
the sector's own "cold" line (`weaponsCold()`, a new small helper —
Space/F/D already shared this check with the sector; G did not, and
GAINED it only for course, since sector's own G has never refused and
this isn't the place to change that); course gates are excluded from
Tab's cycling pool (the friendly-exclusion pattern, reused) since the
active gate is chosen for the pilot, in order, not browsable. Finishing
sets `won = true` (the same generic Enter-retry and X-to-menu paths
every other drill already has work unmodified) and calls a new
`recordCourseRun`, a third best-10 board (`profile.courseRuns`,
`PROFILE_VERSION` → 7) alongside `runs`/`contractRuns` in the Run log,
self-labeled so none of the three ever merge or sort together.
Machine-tested at a local server, entirely via `__sim.step()` and
direct `poke({pos})` placement at each gate's own computed
position/forward (two new test-only additions: `poke({yawDeg,
pitchDeg})` for a later item and `state().course` exposing
activeIndex/elapsed/started/the live ladder gains/every gate's own
pos+fwd+cleared flag, needed since flying the actual winding path by
hand-simulated key input would have been far slower to verify than
placing the ship precisely): a clean pass at Gate 1 (ship placed 1 unit
past its plane, centered) advanced to Gate 2 with elapsed still 0; a
deliberate miss at Gate 2 (placed 300 units off-axis, well past the
150 radius) produced "Gate 2 missed, plus 10. Gate 3." in one line and
elapsed jumped to exactly 10; clearing the remaining six gates the same
way produced "Course complete. Time 10 seconds. New personal best!",
`won: true`, and a real entry in `profile.courseRuns` (confirmed by
reading `localStorage` directly); Enter correctly restarted with fresh
`activeIndex: 0`/`elapsed: 0`; Space/G both refused with the cold line,
Shift+T refused with its own course-specific line, Tab said "No targets
remain.", and `I` read "Gate 1 of 8. Clock 0 seconds." in place of the
generic "targets remain" line. The volume ladder itself was confirmed
settling to exactly `[1, 0.6, 0.35, 0.2, 0, 0, 0, 0]` after the mute
node's own ramp had time to land (a snapshot taken too early read
partial ramp values — not a bug, just `setTargetAtTime`'s asymptotic
approach, resolved by waiting long enough and re-checking). Zero
console errors throughout. Every number here — the turn angles, the
spacing, the radius, the ladder, the miss penalty — is a placeholder
for Brian to actually fly and judge; the path is gentle enough that
Brian's own condition (flyable on auto-thrust alone) should hold, but
that too wants his own ear before it's trusted. Not yet heard or flown
by Brian.

#### 3.42 Escort in formation — station-keeping on the freighter (ideas11.txt) — proposed experiment

- Brian, on the escort: would it be better to "attach" the ship to the
  freighter's path — W/S sliding ahead or behind along the route,
  left/right and up/down rotating the ship *around* the path — with a
  freighter engine sound so the HRTF makes it feel like guarding its
  underbelly, and a button that auto-flies from below to above? "I do
  not know if this would make it any different."
- **Fable's honest read**: today's escort is a free-flight fight near a
  freighter that does move (along +z at `missionEscortSpeed`) but has no
  voice of its own that motion would sell, and the pilot spends the leg
  chasing bearings rather than *escorting*. Formation turns the leg into
  station-keeping on a moving, audible hull — which is what escort
  means — and it puts the HRTF to work on the one thing it does best:
  a big engine loop passing over or under you. So yes, different, and
  probably better; the risk is aiming, below.
- **Shape, as a toggle so free flight stays**: **Shift+F** (unused today)
  enters/leaves formation during an escort. In formation the ship's
  position is a frame on the freighter: `formation = { along, angle,
  standoff }` — W/S slide `along` ±`formationAlongMax` 300, left/right
  rotate `angle` around the freighter's axis (the "underbelly" is
  angle 180 at the default standoff), up/down change `standoff`
  between `formationStandoffMin` 80 and `Max` 250 (Brian's "up/down does
  the same" read as distance, since angle already covers the rotation
  — Part C). A station key (Shift+F again? a second key?) cycles
  presets: below, above, port, starboard, ahead, astern — Brian's
  "button that moves the prims around." The freighter gets a real
  engine loop (one of the un-wired cruiser recordings on disk —
  `spaceship_cruiser_2r` — as `friendlyAsset`, Brian's "rocket freighter
  sound"), so every slide and rotation is heard against it.
- **Aiming is the catch**: lasers are nose-on, and in formation the
  arrows move the ship's *position*, not its nose. Two choices — the
  nose auto-points **outward** (away from the freighter), so drones
  closing on it are ahead of you, or the pilot leans on **auto-target
  (3.38)** to swing the nose while the frame holds position. Fable's
  recommendation: outward by default, Shift+T on top — 3.42 leans on
  3.38 being good, which is another reason it waits for Brian to have
  flown 3.38.
- Test: toggling on snaps to the underbelly and the engine loop is
  audibly above; W/S slide, arrows rotate/standoff, presets cycle; a
  drone's strike still lands on the freighter and the pilot can fire on
  it from formation; toggling off returns free flight with the ship
  where the frame left it.

#### ideas12.txt — Brian's notes from flying the Round 28–31 build (2026-09-05, 19:14)

Nine notes, written as eight items plus one lab reshape (L.5c). Fable's
push-backs are in each item and gathered in Part C. Proposed order,
cheapest first: 3.50 → 3.51 → 3.45 → 3.49 → 3.44 → 3.48 → 3.46 → L.5c;
3.47 is a discussion, not a build, until Brian answers.

#### 3.50 The offline buzz (ideas12.txt) — DONE

- Brian: "a buzz indicator for when a user tries a system that is
  offline / not available yet." Today every refusal is one of two
  clicks — `refusal_dud` (a dud, e.g. an empty slot) or `refusal_wait`
  (recharging/blocked) — so "the laser is offline" and "the laser is
  recharging" sound the same.
- A third cue, **`refusal_offline`**: a short low buzz (~0.3 s, a 90 Hz
  square through a lowpass, UI bus), clearly not a click. Used by every
  `systemState(...) === 'off'` refusal 3.27 added (laser slot, missiles,
  decoys, shields, warp, thrust), by "not fitted" (tractor, auto-target,
  an empty slot), and by "not in this mode" (weapons cold on the course
  and in the sector, auto-target off on the course). `refusal_dud`
  stays for empty/spent (no missiles, no decoys, no charges);
  `refusal_wait` stays for recharging/switching/cooling. One rule to
  state in the code: **buzz = you can't here or it's broken; click =
  you can't yet.**
- Test: each refusal class plays its own cue; the sound lab lists the
  new one under UI.

**DONE (Round 33, Sonnet).** `refusal_offline` landed in `audio_cues.js`
right after `refusal_dud` in the `'ui'` category (a small composite —
`sfxTone` has no filter option — an oscillator through a lowpass into a
gain envelope, ~0.3 s, on the UI bus), auto-surfaced in `soundlab.html`'s
discrete-cues list with no page edit needed, since that page generates
its listing from `SIM.cues.categories()/list()`. ~20 call sites across
`index.html` were reclassified against the one-line rule (**buzz = you
can't here or it's broken; click = you can't yet**): every `systemState
(...) === 'off'` refusal (laser slot, missiles, decoys, shields, warp),
every "not fitted" refusal (tractor, an unowned laser level, an empty
slot), and every wrong-mode refusal (weapons cold, the tractor's
mining-only check, auto-target's mode/fitness checks, the extractor/
vacuum's mining-tool check) moved to `refusal_offline` — several of
these (weapons-cold, auto-target's checks, the mining-tool checks) had
no cue at all before this round, silent on the audio layer even though
`say()` already spoke the refusal. `refusal_dud` and `refusal_wait` kept
their existing meaning (empty/spent vs. temporary-resolves-with-time)
and picked up a few internal-consistency fixes along the way: "No
missiles left" moved from `wait` to `dud` (it's spent, not temporary,
matching the spec's own example list); a laser-burst-in-progress
blocking shields moved from `dud` to `wait` (a burst finishing is
exactly the "temporary" case); paying the tug fee with insufficient
credits moved from `wait` to `dud`, matching every shop's own
not-enough-credits convention (deliberately left untouched everywhere
else — Modules/Lasers purchases were out of scope, already `dud`
throughout). Two judgment calls made on cases the spec didn't literally
enumerate, both flagged here rather than silently decided: the tractor's
"too far" refusal stayed `dud` (ambiguous — arguably neither spent nor
offline — lower priority than the clearer cases); the tractor's "too
massive for this tractor" became `refusal_offline` (a hard capability
mismatch, not a spent resource). Machine-tested at a local server: each
of the three cues confirmed playing at its own reclassified call site
(an offline laser slot, an empty slot, a cooling laser, a spent missile
magazine, an offline tractor, a wrong-mode tractor call, a wrong-mode
extractor call, the weapons-cold refusals) with no cue collisions and no
console errors. Not yet heard by Brian.

#### 3.51 Y speaks the totals (ideas12.txt) — DONE

- Brian: "Y to announce resource totals, starting with credits,
  hopefully this can be used anywhere, as I was using the station and
  needed this info." Y is unbound today.
- One line, credits first: "Credits N. Ore N. Salvage N. Alloy N.
  Reaction mass N percent. Warp N percent. Missiles N, decoys N."
  (auto-target charges when fitted). F3 stays the browsable long form;
  Y is the glance. Works in the raw sim, the mission menu, and — the
  point — inside every captured-input menu: station, Modules, Lasers,
  hail, transporter, Missions, the map, F2/F3, the run log. Each of
  those key handlers gets a `y` pass-through, the way `b` already has
  one in the Sound list. F12 describes it; help and README list it.
- Test: Y from the station menu, mid-Modules, mid-hail, and in flight
  all speak the same line; nothing else in those menus changes.

**DONE (Round 33, Sonnet).** A new `speakTotals()` builds one combined
line — credits, ore, salvage, alloy, reaction mass percent, warp
percent, missiles, decoys, plus auto-target charges when fitted (the
SPEC 2.15 rule: one `say()` call, never several back to back). Bound as
`case 'y': speakTotals(); break;` in the raw sim's key switch, then as
an `else if (lname === 'y') { speakTotals(); }` pass-through in every
captured-input menu handler: the run log, F2 (ship screen), F3
(resources), the map, Modules, the Lasers shop, Missions, the hail/
transporter menu, the station menu, and — added in this same round,
for consistency, since it closes an actual gap in "works everywhere" —
the Sound menu too. Two handlers needed care: `shipScreenKey` (F2) and
`mapKey` (Q) both have a generic first-letter-jump catch-all for any
single lowercase letter, so the `y` check had to be inserted BEFORE
those catch-alls or it would have been silently swallowed as a jump
attempt. `KEY_DESCRIPTIONS.y`, the "Flying" help heading, and the
README's key table all describe it. Machine-tested at a local server:
Y confirmed speaking the identical line from the raw sim, the run log,
F2, F3, the map, Modules, the Lasers shop, Missions, the hail menu, the
station menu, and the Sound menu, each time confirmed NOT altering that
menu's own cursor/selection state; the F2/Q catch-all interaction
specifically re-tested to confirm `y` is never misread as a heading/
first-letter jump. Zero console errors. Not yet heard by Brian.

#### 3.45 Five volume steps (ideas12.txt) — DONE

- Brian: "5 steps of sound volume controls in the sound menu." Today
  `SOUND_LEVELS` is three (off / quiet 0.35 / full 1).
- `SOUND_LEVELS` → five: off 0, low 0.15, quiet 0.35, medium 0.65,
  full 1. `profile.sound` stores level INDEXES, so a saved profile
  needs a one-time remap (0→0, 1→2, 2→4) keyed off `PROFILE_VERSION`
  → 8; the Sound menu's Left/Right and its demo sound per step are
  unchanged. Also lands here: the **Beacons line** 3.44 moves into
  this menu ("Beacons: on / off / target only", Left/Right cycles,
  same `beaconMode`/`profile.beacons` underneath).
- Test: five steps each speak their name and play the category's demo
  at the new level; an old three-step save loads at the equivalent
  step; the Beacons line cycles and saves.

**DONE (Round 33, Sonnet).** `SOUND_LEVELS` grew to five entries (off 0,
low 0.15, quiet 0.35, medium 0.65, full 1); the Sound menu's existing
Left/Right-cycles-a-level and per-step demo sound needed no change,
since both already read through `SOUND_LEVELS` generically rather than
hardcoding three steps. **Two real regressions caught before they
shipped, both from the same root cause**: growing the array silently
changes what index 2 MEANS (was "full", the old last index; is now
"quiet") — so (1) `defaultProfile()`'s hardcoded `sound: { world: 2,
cockpit: 2, effects: 2 }` would have booted every brand-new profile at
"quiet" instead of "full" (fixed: the literal `2` is now
`SOUND_LEVELS.length - 1`, so it tracks the array instead of assuming
its size), and (2) an existing saved profile's own index 2 ("full"
under the old scheme) would have silently been reinterpreted as
"quiet" under the new one with no warning to the player. Fixed with a
`PROFILE_VERSION` → 8 migration, checked against the RAW saved JSON
(`saved.sound`), not the already-`Object.assign`-merged `profile`
object — the same trap SPEC 2.18 and SPEC 3.26 exist to avoid, since a
naive check against `profile.sound` would find plausible-looking
values there regardless of whether a real old save actually had them.
The remap (`{0:0, 1:2, 2:4}`) runs once, before the general
"is this index in range" validation that was already there, so an old
save's real levels land on their true equivalents and a value the old
save never had still falls through to today's normal "default to
full" behavior. **The Beacons line**: rather than adding a fake
`SOUND_CATS` entry (which would wrongly imply it's driven by
`SOUND_LEVELS`/`applySoundLevels`, when it actually cycles the
3-state `BEACON_MODES` beacons already used), it's one extra row
appended past the real categories (`n = SOUND_CATS.length + 1`,
`soundMenu.idx === SOUND_CATS.length` marks it) with its own
Left/Right handling and its own line text ("Beacons: on/off/target
only. Cycles the sector's four POI beacons..."), landing on the exact
same `beaconMode`/`profile.beacons` the standalone `B` key already
uses — `B` itself is untouched here; that's 3.44's job, not yet built.
Every stale "off, quiet, or full" / "Beacons are on the B key"
reference in `HELP_SECTIONS`, the Sound menu's own item description,
and README.md was found and updated to match. Machine-tested at a
local server: a fresh profile confirmed defaulting to "full" (not
"quiet") on world/cockpit/effects; all five steps browsed and cycled
correctly in both directions with a wrap at each end, each one heard
via its category's demo sound; the Beacons line browsed to, cycled
through all three modes both directions, and confirmed saving to
`profile.beacons`; a seeded pre-3.45 profile (`version: 7`, three-level
indexes `{world:1, cockpit:2, effects:0}`, no `music` key at all)
reloaded with `sound` correctly migrated to `{world:2, cockpit:4,
effects:0, music:4}` — the missing `music` key defaulting to full
exactly like a fresh profile, not remapped (nothing to remap); the
persisted `localStorage` copy confirmed still holding the OLD indexes
and `version: 7` until the next real save, then confirmed rewritten
with the new indexes and `version: 8` on that save, matching every
prior migration's own "profile.version never regresses, and isn't
rewritten to disk until something actually saves" behavior. Zero
console errors throughout. Not yet heard by Brian.

#### 3.49 The flight course, second pass (ideas12.txt) — DONE

- Brian: gates closer by 200; trigger range +100; a positive chime for
  a clean pass and a negative one for a miss; count made vs. missed in
  the final line; say how the time ranks against the best.
- **The push-back, with the math.** `courseSpacing` 600 → 400 and
  `courseGateRadius` 150 → 250 together break the course: a 25° turn
  over 400 units puts the next gate only 400·sin 25° ≈ **169** units off
  a straight line — inside a 250 radius — so a pilot who never turns at
  all "cleans" most of the gentle course. The radius has to stay below
  the lateral offset the turns create, or the turns have to grow.
  Fable's proposal, keeping Brian's intent (closer, more forgiving):
  spacing **400**, radius **200**, and the gentle course's turns raised
  to **35–45°** (400·sin 35° ≈ 229 > 200, so straight flight misses)
  — still flyable on auto-thrust, since the arrows turn at 60°/s and a
  gate is 4–6 seconds away at cruise. Or: keep his exact numbers for a
  true beginner course ("gentle", where flying straight IS the lesson)
  and add a second course ("turns", sharper) — DECIDE.
  **Decided (Brian, 2026-09-05): "cut my requests in half except the
  radius."** So `courseSpacing` 600 → **500** (closer by 100, not 200)
  and `courseGateRadius` 150 → **250** (the full +100 stands). And the
  reason behind the ask, which changes 3.41's own premise: Brian flies
  the course on **manual thrust** — "for beginners, auto-thrusters
  probably won't be used that much, it's very hard to keep things
  centered." The course is a manual-thrust drill first; auto-thrust is
  the expert's shortcut, not the design condition. The geometry check
  on the decided numbers: 500·sin 25° ≈ **211**, still inside 250 — so
  the gentle course's turns must grow for the course to teach turning
  at all: **35–45°** gives offsets of 287–354, outside the radius, so
  flying straight misses, while the 250 radius (a ±27° cone at 500
  spacing) forgives the sloppy centering Brian describes once he HAS
  turned toward the tick. Both wants held: you must turn, you needn't
  be precise. Turns raised in `COURSES.gentle` as part of this item.
- **Chimes**: `course_pass` (a bright rising two-note, UI bus) on a
  clean gate; `course_miss` (a short falling minor pair, not the
  offline buzz) on a miss — each folded into the same tick as the
  gate's own spoken line, never a second `say()`.
- **The final line** gains the tally and the rank: "Course complete.
  Time 1:42. 7 of 8 gates, 1 missed. 6 seconds off your best." / "…
  New personal best by 3 seconds." / first run: "… Your first time."
  `recordCourseRun` returns the previous best (not just a boolean) so
  the delta can be spoken; `courseState` counts `made`/`missed`.
- Test: straight flight through the gentle course MISSES at least one
  gate under the new numbers (the whole point); a clean pass chimes up,
  a miss chimes down; the final line reads 7/1 and the delta; a second
  run reports its rank against the first.

**DONE (Round 33, Sonnet).** `CFG.courseSpacing` 600 → 500 and
`CFG.courseGateRadius` 150 → 250 exactly as decided; `COURSES.gentle`'s
turns raised from under-30° to 35–45° in magnitude (alternating sign,
one pitch wiggle per turn kept from the original shape). Two new cues,
`course_pass` (a bright rising two-note) and `course_miss` (a short
falling pair, deliberately not `refusal_offline`'s buzz — a miss still
clears the gate and keeps the course moving, it isn't a refusal),
folded into `clearCourseGate()` alongside its existing miss-penalty and
tally increment (`courseState.made`/`missed`, new fields alongside
`activeIndex`/`elapsed`/`started`). `recordCourseRun()` now returns the
PREVIOUS best in seconds (`undefined` on a first-ever run) instead of a
plain boolean, so `finishCourse()` can speak the real delta either way:
"Your first time." / "New personal best by N seconds." / "N seconds off
your best." — folded into the SAME final `say()` as the tally and the
time, per the SPEC 2.15 rule. Help text (`HELP_SECTIONS`) and README
both updated to describe the chimes and the richer final line — nothing
else in either referenced the old spacing/radius numbers or turn cap
directly, so no other stale text needed a fix. **Machine-tested at a
local server**, and this round needed real care about *how*: a first
attempt to prove "straight flight misses gates" by walking positions
along a single fixed world-axis line produced a subtly WRONG per-gate
attribution (an edge case where a position placed exactly ON a gate's
own plane, at depth 0, doesn't register as "reached" it yet — realistic
continuous flight always arrives at some small positive depth instead)
— caught by the test's own confused output rather than shipped as a
false negative, and corrected by nudging every test position a couple
of units PAST each gate's plane along its own forward vector, matching
how a real approach actually crosses it. With that fix: straight
never-turning flight through the gentle course cleanly confirmed
missing the large majority of gates (only the one gate that happens to
lie exactly on the initial heading passed clean) — strongly validating
the geometry fix; a controlled run alternating clean/miss by design
(computed via each gate's own cross-product perpendicular, not a
world-axis guess) confirmed both `course_pass`/`course_miss` firing at
the right gates with zero console errors, the tally reading "4 of 8
gates, 4 missed", and a first-ever completion correctly saying "Your
first time."; a second, all-clean run measured 0 seconds and correctly
said "New personal best by 40 seconds."; a third run with one deliberate
miss (10 seconds) correctly said "10 seconds off your best." against
the new 0-second best. Zero console errors throughout. Every number —
the spacing, the radius, the turn angles — is a placeholder for Brian
to fly and judge, same as every other tuning number in this file. Not
yet heard or flown by Brian.

#### 3.44 B is the tractor, in tiers; beacons move to the Sound menu (ideas12.txt) — DONE

- Brian: "Use B for Tractor Beam, treat this like lasers in that it
  will have levels. just use laser switch 5 for when this one switches.
  Shift B should go backwards down the tiers, but generally the player
  will just use whichever one is there. Move Beacon sound control into
  the sound menu."
- **The rebind.** B was the beacon cycle (SPEC 1.12), Z the tractor
  (3.30). B becomes the tractor; Z is **unbound** (answers "Z does
  nothing here"); beacons become a line in the Sound menu (3.45).
  Cost, stated plainly: the mid-flight beacon toggle goes from one key
  to Escape → Sound → Left/Right → Escape → Resume. Brian chose B on
  purpose (B for beam), and the quadrant's own distance cutoff already
  keeps beacons from being a soup, so Fable accepts it — flagged.
- **Tiers, like lasers.** `TRACTOR_TIERS` 1–3: tier 1 today's numbers
  (`tractorPullCore` 20, medium 4, large none); tier 2 medium 12, large
  3; tier 3 medium 20, large 10, huge 3 — a top-tier tractor moves
  anything, slowly. Owned tier = `profile.tractorLevel` (1 with the
  test fit, else the highest `tractor_N` module bought; `tractor_2/3`
  join MODULES, each requiring the one below, alloy-priced like the
  repair crew's). **B engages/releases** the tractor at the selected
  tier — Z's exact job today, moved. **Shift+B steps the selected tier
  down** (wrapping to the top), for the case Brian named — a delicate
  core you'd rather not yank — with `laser_switch5` playing at its
  natural length (2.2 s, SLOT_SWITCH[2]'s own clip) and B refused
  until it ends, exactly 1.14's mechanism. No wear on the tractor —
  it isn't a weapon and 3.26's wear was about firing.
- F2's Tractor heading gains the tier and the selected tier; help,
  F12, README, and `KEY_DESCRIPTIONS` all change for B, Z, and the
  beacons' new home.
- Test: B toggles the tractor as Z did; Shift+B steps 3→2→1→3 with the
  clip and the refusal mid-switch; a tier-3 pull moves a large rock at
  10/s; Z says it does nothing; the Sound menu's Beacons line cycles
  and saves; `beaconKey` is gone from the raw-sim switch.

**DONE (Round 33, Sonnet).** `B` now calls `tractorKey()` (was `Z`'s job);
`Z` has no case left in the raw-sim switch at all, falling through to the
generic "Z does nothing here" the switch's own `default` already gave
every unbound key — no explicit `case 'z'` needed to say it. `Shift+Z`
(the target-zone cycle) is completely untouched, still its own guarded
`if` block ahead of the switch. **Tiers**: `TRACTOR_TIERS[0..2]` holds
medium/large/huge pull rates per tier (core/small stays flat at
`CFG.tractorPullCore` on every tier, per spec); `tractorLevel()` — the
OWNED ceiling — reads module ownership directly (1 with the test fit,
rising with `tractor_2`/`tractor_3` bought), the exact pattern
`autoTargetTier()` already borrowed from this feature's own original
3.30 shape. `tractorTier` — the SELECTED tier — is live session state
(not saved to the profile, same as `tractor.active` itself), reset to
the owned ceiling on every fresh mission/drill start (`clearMission()`)
so a pilot who never touches Shift+B always gets their best, matching
Brian's "generally the player will just use whichever one is there."
**Shift+B** (`tractorTierDown()`) steps the selected tier down, wrapping
to the top, playing `SLOT_SWITCH[2]` (`laser_switch5`, 2.2s) at its own
natural length — no per-slot time-stretch, since this is one fixed clip
reused, not a weight-varying delay — with B itself refused
(`refusal_wait`) until it ends, the exact shape 1.14's own laser-slot
switch established (`tractorSwitch`/`stopTractorSwitch()`/
`tractorSwitchLeft()`, all direct mirrors of `laserSwitch`'s own
machinery). Two new MODULES, `tractor_2`/`tractor_3`, each `requires`
the one below, alloy-priced like the repair crew's, `cfg: {}` (ownership
read directly, not a CFG overlay — same as `auto_target_2/3`). F2's
Tractor heading now reads "Tier N owned, tier M selected" plus the
tier-specific pull numbers; help (Mining and System headings),
`KEY_DESCRIPTIONS.b`/`.z`, the mission-menu description for Sound, and
README were all updated — a broader sweep than the item's own bullet
called out turned up FOUR more stale "the B key"/"B cycles beacons"
references left over from when 3.45 moved beacons into the Sound menu
(a live-code one, `beaconNote()`'s own spoken hint at sector entry,
would have kept telling a player with beacons off to press a B that no
longer does that — fixed alongside three comments). `beaconKey()` itself
is deleted outright (three call sites: the raw-sim switch, a
mission-menu B-passthrough, and a Sound-menu B-passthrough — all three
removed, not just the first) since nothing calls it once B means the
tractor everywhere; `beaconModeText()` survives untouched, still backing
the Sound menu's own Beacons line built in 3.45. New test hooks:
`state().tractor` gained `owned`/`tier`/`switching`. Machine-tested at a
local server against a profile seeded with `tractor_2` owned: Z
confirmed answering "Z does nothing here", Shift+Z confirmed still
cycling the zone exactly as before, a fresh mining-mission start
confirmed `tractorTier` defaulting to the owned ceiling (2) automatically,
a medium rock's pull rate measured at exactly 12/s at tier 2 and exactly
4/s after Shift+B stepped down to tier 1 (both matching `TRACTOR_TIERS`
precisely), a large rock confirmed refused at tier 1 ("Too massive for
this tractor") and confirmed pulling at exactly 3/s once tier 2 was
restored, B confirmed refusing mid-switch with the correct countdown,
Shift+B's wrap-to-the-top confirmed (tier 1 → tier 2, the owned ceiling,
not tier 3), F2's Tractor heading read correctly, the mission menu's B
press correctly fell through to "No item starts with B," and the Sound
menu's own Sound item description read cleanly with no B-key reference
left. Zero console errors throughout. Every tier number and price is a
placeholder for Brian to fly and judge. Not yet heard or flown by Brian.

#### 3.52 Tractor beam, second pass (Brian, 2026-09-06) — DONE

A further pass on the tractor beam (3.30/3.44). Fable's evaluation
(cost shape, the beam exclusion) and Brian's own answers are both
folded in below — this is the buildable shape, nothing left open
except what's explicitly flagged.

- **Shift+B is gone. There is no "selected" tier any more, only
  "owned."** Brian: "forget using Shift B to go down a tractor beam
  level, it will be upgradeable but not switcheable... we can just make
  them pull faster, reach longer, and use less reaction mass." This
  removes the whole `tractorTier`/`tractorSwitch` machinery 3.44 built
  — `tractorLevel()` (the owned ceiling, already exists) IS the active
  tier now, used directly for pull rate, range, cost, and which
  recording plays. `tractorTierDown()`, `stopTractorSwitch()`,
  `tractorSwitchLeft()`, and the `SLOT_SWITCH[2]`/`laser_switch5` reuse
  all go away entirely — there is nothing left to switch. Shift+B
  itself needs no special handling: with the chord removed, it simply
  falls through to plain B's own case (engage/release), which is
  harmless.
- **Four tiers, each with its own recording, its own pull rate on
  every size (including core), its own range, and its own cost
  multiplier.** `TRACTOR_TIERS` grows a `range` and `costMul` field per
  tier, and core/small — flat at 20 across all tiers since 3.30 — now
  scales too, since nothing about "not switchable, just better" argues
  for holding one number back. Placeholders throughout, Brian's ear
  decides the real numbers:

  | Tier | Core | Medium | Large | Huge | Range | Cost×  | Recording |
  |---|---|---|---|---|---|---|---|
  | 1 | 20 | 4  | 0  | 0 | 500 | 1.0 | `tractor_beam` (`tractor_beam2.mp3`, unchanged) |
  | 2 | 26 | 12 | 3  | 0 | 650 | 0.8 | `tractor_beam_2` (`tractor_beam7.mp3`) |
  | 3 | 32 | 20 | 10 | 3 | 800 | 0.6 | `tractor_beam_3` (`tractor_beam8.mp3`) |
  | 4 | 40 | 28 | 16 | 6 | 950 | 0.4 | `tractor_beam_4` (`tractor_beam9.mp3`) |

  Brian confirmed the file mapping ("they sound fine") — tier 1 keeps
  `tractor_beam2` (already wired), tiers 2/3/4 take `tractor_beam7/8/9`,
  the last three files onto the last three tiers; `tractor_beam3-6`
  stay in reserve, unused. A fourth `tractor_4` module joins `MODULES`,
  requiring `tractor_3` (placeholder 500cr/3 mass/5 alloy, continuing
  the existing three's progression). `tractorFitted()`/`tractorLevel()`
  are otherwise unchanged (test-fit still gives tier 1 free).
- **Reaction mass charges for WORK, not time — Fable's proposed fix,
  Brian confirmed ("ok").** A flat per-second draw punishes the
  tractor for being slow by design and made every tier worse than just
  flying (checked against `rcsThrustPerS`/`rcsPerSpeedShed`: ~3–6 rcs to
  fly 200 units, versus ~19 rcs for a first-draft tier-1 pull over the
  same ground) — charging for the actual distance closed, scaled by
  the rock's own mass, fixes this by construction. Per real frame in
  `updateTractor`: `cost = rockMass(t.size) × closeAmount × 0.004 ×
  TRACTOR_TIERS[tier-1].costMul`, spent via `spendRcs()` (the same
  helper thrust/braking/repair already use — same battery-mode
  interaction, same 50/25% alerts). `rockMass`: core/small 1, medium 3,
  large 8, huge 20 (mass is the ROCK's own property, independent of
  which tier is pulling it — a higher tier is a better motor, not a
  lighter load). Confirmed target: a tier-1 core pulled the full 250
  units (500 → `tractorStopDist`) costs 1×250×0.004×1.0 = **1.0 rcs**,
  well under half of flying the same distance — the design goal
  Brian stated ("skilled usage should be better than just using
  thrusters") holds at these numbers, not just asserted.
- **Pulled items stop at 250, not 300 — confirmed.** A new
  `CFG.tractorStopDist` (250) replaces `CFG.vacRange` in
  `updateTractor`'s own stop check only; `vacRange` (300, the
  extractor's reach) is untouched everywhere else. Reason it's not a
  magic number: a rock stopped exactly at 300 can drift back out while
  the pilot switches from B to E; 250 is a real margin.
- **Range scales with tier — the "lost target" threshold must scale
  with it too.** `updateTractor`'s own drop check
  (`dist > CFG.tractorRange × 1.5`) becomes `dist >
  TRACTOR_TIERS[tier-1].range × 1.5`, or a tier-4 pull started near its
  own 950 range drops the target the moment it drifts.
- **Tractor/laser exclusion, confirmed, and widened to every beam
  tool — Brian: "ok."** Fable's gap-check: E and V are beams too
  (`startBeam('vac')`/`startBeam('dust')`), and reaching for the
  extractor right after a pull finishes is the single most likely next
  move a pilot makes — restricting the cutoff to lasers only would
  miss the common case. So: **any** `startBeam(tool)` call — laser,
  vac, or dust — cuts the tractor the instant it actually commits to
  firing (right where `wearLaser` already marks "committed," so a
  refused attempt, e.g. shields up, never touches the tractor). The
  other direction is unchanged: **B while a beam is running** refuses
  with the existing `beam && beam.tool === 'laser'`-shaped check,
  generalized to `beam` alone (any tool), `refusal_wait`, "Beam in
  progress, N seconds. Tractor after." The cutoff itself stays silent
  (per SPEC 2.15 — the hum stopping is already the audible tell; no
  second `say()` competing with the firing announcement).
- **Built and machine-tested at a local server.** A core forced to
  exactly 500 (tier 1's own range) engaged immediately; stepped forward
  it closed to exactly 250 and self-stopped with "In extractor range."
  (not 300); reaction mass measured 100 → 99 over the full pull — 1 rcs
  spent, matching the ~1.0 target exactly, not just asserted. A rock
  forced to 700 refused by name ("Too far for the tractor. Distance
  700, reach 500."), confirming the range comes from the tier row, not
  a flat CFG value. Firing the laser (Space) while the tractor was
  active cut it silently (`tractor.active` false immediately after,
  with no new spoken line) — confirmed working the OTHER direction too:
  engaging B while a laser burst was running refused with "Beam in
  progress, 8 seconds. Tractor after." and left the tractor off.
  Shift+B was confirmed harmless twice — once refusing "No rock
  selected" (correct given the actual selection at the time) and once
  engaging the tractor normally — proving it falls through to plain
  B's own case exactly as designed, no special handling needed. F2's
  Tractor beam heading read "Tier 1 owned. Test fit." / "Pull 20 a
  second on a small rock or a core, 4 on a medium, none on a large,
  none on a huge." / "Range 500. Costs reaction mass per unit of mass
  moved." — matching TRACTOR_TIERS row 1 exactly, no "selected tier"
  language left anywhere. Zero console errors throughout. Every
  tractor number is still a placeholder for Brian's ear — only the
  MECHANICS (cost shape, stop distance, range-per-tier, the exclusion,
  no switching) were the point of this pass. Not yet heard or flown by
  Brian.

#### ideas13.txt — Brian's notes, reviewed (Fable, 2026-09-06)

Seven notes. Two are already built and waiting to be flown; two are
small, buildable now (3.53, 3.54); two are galactic-map direction that
go to A.13/3.23b with questions; one is a discussion that opens a
list. `backstory.md` arrived alongside — a full setting outline ("The
Silence") — and is NOT reviewed here; it deserves its own pass as an
A-section, and it bears directly on the encounters note below.

- **"Half-vertice spots can be controlled but lose control faster if
  connected to vertices the human doesn't control"; "controlling them
  generates resources... but vertices are more valuable."** In the
  spec's own words: the cube's edge MIDPOINTS (waypoints) become
  **controllable outposts** — they produce when held, so a player could
  grab many cheaply, but a waypoint decays unless the CORNERS at its two
  ends are held too; corners (quadrants) are worth more. This is the
  supply-line rule ideas11 asked for ("cut-off erodes control, not
  favor") given a shape: a waypoint between two of your corners is
  stable, between yours and a rival's is contested and decays, between
  two rivals' can't be held at all. Coherent, and it makes the map's
  geometry matter for control the way it already matters for travel.
  Written into A.13/3.23b as direction (Phase 4 — control is Q3's).
  **Postponed (Brian, 2026-09-06): "postpone."** What a waypoint
  produces, the decay rates for the three cases, and whether its
  production feeds the adjacent corners all stay open — not urgent,
  not blocking anything, revisit when Q3/control is actually being
  built.
- **Manhattan-distance jumps — confirmed (Brian, 2026-09-06): "you are
  right."** Fable's reconciliation stands: the gate is WHICH WAY you
  leave, the galactic map is HOW FAR — fly to the gate on the first
  axis of the path, pick any cell on the map within your jump budget,
  the network routes the rest, one hydrogen unit per cell of manhattan
  distance (an edge = 2 units). Supersedes A.13's earlier "one fare per
  edge." Waypoints become real destinations now, not "later." Changes
  on build: 3.18's "the fare" is per cell, not per edge; 3.22's gate
  arrival is at the nearest gate on the destination side. Brian's own
  "5 warp corner to corner on a face" still doesn't match any pair
  (adjacent 2, a face's diagonal 4, the far corner 6) — left unresolved
  since it doesn't block anything; likely a cell count (5 on the
  diagonal path, both ends included) rather than a jump count.
- **"A little chime..." / approach cue — resolved (Brian, 2026-09-06):
  "ok."** Read as: the existing `course_pass`/`course_miss` chime
  (built, SPEC 3.49, shipped Round 33, not yet flown) is enough: no
  separate approach cue on entering a gate's radius. No new item.
- **"More stats..." — resolved (Brian, 2026-09-06): "ok, no new
  leaderboard."** Hit/missed and rank-vs-best are built, 3.49; the
  accuracy metric (average off centre) is **3.53**, below, read out
  on the final line, never a second ranked board.
- **"The 2 station missions in the main menu" — confirmed (Brian,
  2026-09-06): "yes."** **3.54**, below, before the playtest checkpoint.
- **"We need to start thinking of other encounters/instances" —
  Brian, 2026-09-06: "do your recommendation, ignore the backstory
  file for now."** Fable's pick, **the distress-call tow**, is
  confirmed as the next encounter to spec — written up as **3.55**,
  below. `backstory.md` ("The Silence") stays unreviewed and is
  explicitly NOT being folded into A.15 right now — the two encounter
  ideas that drew on it (the recorder, the gate waking) stay listed
  as later options, not built toward.

#### 3.53 The flight course, third pass: accuracy (ideas13.txt) — DONE

- Brian: "total distance from beacon center when following path or
  some other metrics to evaluate it beyond just time."
- `updateCourse` already computes `lateral` — the crossing's distance
  from the gate's own axis — for the clean/miss decision and then
  throws it away. Keep it: `courseState.offsets[]` per gate, and the
  final line adds **"average N off centre"** (mean of the eight; a miss
  counts at its real distance, so a wide miss drags the average up).
  Store `avgOffset` on the `courseRuns` entry; the Run log speaks it
  beside the time. One more metric, if wanted: **best gate** ("gate 5,
  dead centre") — cheap, and it tells the pilot what a good crossing
  felt like. Not a second board — time stays the ranking; accuracy is
  read out, not competed on, until Brian says otherwise. **Not built**:
  the optional "best gate" line — flagged as "if wanted," and skipped
  to keep this pass to what was actually asked for; easy to add later
  if Brian wants it once he's heard the average.
- **Built and machine-tested at a local server.** Placed the ship at
  each gate's own crossing point with a known perpendicular offset (50
  units at seven gates, 300 at the eighth to force a miss) via
  `poke({pos})` and `__sim.step()` — no hand-flying needed to hit an
  exact, checkable number. The final line read "Course complete. Time
  10 seconds. 7 of 8 gates, 1 missed. Average 81 off centre. Your first
  time." — (7×50 + 300) / 8 = 81.25, rounds to 81, matching the hand
  calculation exactly. `profile.courseRuns` carried `avgOffset: 81.25`
  in `localStorage`; the Run log spoke "Flight course number 1: 10
  seconds, average 81 off centre, 2026-09-06." confirming the stored
  value round-trips through both the live announcement and the saved
  log. Zero console errors.

#### 3.54 Escort and Defend on the mission menu, as drills (ideas13.txt) — DONE

- Brian: "I'd like the 2 missions we have made for the station to be
  in the main menu for demo purposes, otherwise no way to see that
  without playing."
- Two `MENU_ITEMS`, **Escort drill** and **Defend drill**, after Flight
  course, each calling a new `startMissionDrill(kind)` — the same
  mission-spec shape `startMissionRun(kind)` builds for the station-
  offered version, minus the station-specific setup (no `hailMenu.poi`,
  no `sectorHome` snapshot, no `touchStationVisit`, `poiName: null`) —
  the same relationship Combat training has to the Contested Zone: same
  waves, same friendly, same win/loss, but a standalone drill.
  Consequences to decide, Fable's proposal in each:
  no station means no favor (`poiName` null; `missionEnd` skips the
  favor bump — it has to, there's nothing to credit); credits **kept**
  (a drill that pays is fine — Combat training pays salvage); the
  cooldown **skipped** (a drill is replayable — that's the point);
  death is a drill death (Enter retries, no tug — `tugCandidate()`
  already returns false with no `sectorHome`). Enter after a win
  replays it (drill behavior), which is the one place this differs
  from the station-offered version, where Enter is refused. The
  mission menu grows to twelve; first-letter D now cycles Delivery run
  → Defend drill, E jumps to Escort drill, both fine.
- **Built and machine-tested at a local server.** Both drills reachable
  from the menu by arrowing down past Flight course; starting Escort
  drill read its intro and set `mode: 'combat'`, `mission.kind:
  'escort'` with no `sectorHome`. Forced the win with
  `poke({missionElapsed: 180})` (`CFG.missionEscortLegS`) — credits
  went from 100 to 400 (the full 300 reward, friendly at 100% hp), and
  the spoken line correctly said "Enter plays again, X for the mission
  menu." (the drill-specific ending, not the station-offered "X returns
  to the sector."). Enter replayed it immediately (`mission.elapsed`
  back to 0, `won` false, fresh friendly). Restarted, then abandoned it
  mid-run with X — returned to the menu cleanly with no crash, verifying
  `clearMission()`'s new `mission.poiName` guard (there is no station to
  credit or blame, and the code needs to know that rather than writing
  favor to a bogus port keyed by a null name). Defend drill confirmed
  starting the same way (Miner, hull 150, Raiders). Zero console errors
  throughout; the station-offered versions were not touched by this
  change (still built on `startMissionRun`, still cooldown-gated, still
  favor) and this round's testing didn't re-exercise them, but nothing
  in `missionEnd`/`clearMission` changed behavior when `poiName` is set
  — the new checks are additive (`if (mission.poiName) ...`), not a
  rewrite of the existing branch.

#### 3.55 Distress call: the tow, in reverse (ideas13.txt, Fable's pick, confirmed by Brian) — proposed, next after 3.52

- Brian: "I can't remember whether we have another encounter/instance
  mission already planned or not but we need to start thinking of other
  encounters/instances to do." Asked for Fable's own recommendation
  ("do your recommendation"); this is it.
- **The pitch**: SPEC 2.16 already put the player on the OTHER end of
  this exact fiction — lose your ship, wait for a tug, get towed home.
  A distress-call mission flips it: the player IS the tug, for someone
  else. It also gives the tractor beam (3.30/3.52) its first real
  mission-level job, past mining — the whole reason to build 3.52 well.
- **Deliberately reuses existing verbs rather than inventing a new "tow"
  physics model.** The obvious literal version — the tractor holds the
  disabled ship at a fixed distance BEHIND the player's own ship as it
  flies the whole way home, a real leash — is a bigger mechanical change
  than this one mission should force (3.52's tractor is built to close a
  gap to a stop distance and hold there; it was never built to trail a
  moving puller, and making it do so touches `updateTractor` in a way
  every OTHER tractor use — mining — doesn't need). Built instead on the
  same two verbs the game already teaches: **tractor** closes the
  distance (unchanged from 3.52, no new code there), and **extract**
  (E) is the "recover" action, reused by name — the exact same idea as
  extracting an ore core, just on a stranded ship instead of a rock.
  Once recovered, the derelict is abstracted out of the world (its
  distress voice stops, no physical body to carry home) and the mission
  becomes "get yourself back to the station," which needs nothing new
  at all.
- **Shape**: offered from a station's Missions list (`MISSIONS`, same
  submenu as Escort/Defend/Contract), `poiName` stamped like the others.
  Accepting spawns ONE `kind: 'friendly', disabled: true` derelict
  (reusing the friendly-target machinery from 2.17 — no weapons, no hp
  drain, excluded from Tab like every other friendly) at a spawn
  distance matching escort/defend's own convention, silent engine, a
  quiet distress-beacon voice in its place so it's locatable by ear like
  any lock target (a synthesized ping if nothing recorded fits — check
  `audio/` for anything named `distress`/`sos`/`beacon` first; ask
  before synthesizing if genuinely unsure). Flying into tractor range
  and engaging Z pulls it in exactly as 3.52 specs (no changes there);
  once inside `tractorStopDist`, **E recovers it** — one line ("Derelict
  secured. Bring it home to [station]."), `mission.recovered = true`,
  the derelict despawns. From there it's an ordinary flight back:
  `dockAtStation`/`callPoi` gain a `mission.recovered`-aware branch
  (the same shape as 3.28's `contract` docking branch) that pays
  credits and the standard `favorMission` bump and ends the mission.
  Leaving without recovering it, or dying, fails it the same generic
  way escort/defend already do (`clearMission()`'s existing
  `favorFail` hook needs no new code — it already fires for any mission
  with a `poiName` set).
- **Open, flagged rather than decided**: whether this first version
  carries any threat at all (a couple of scavenger raiders drawn to the
  same wreck, reusing the escort/defend provoke-and-redirect pattern) or
  ships pure-navigation-and-tractor for v1, with a threat layered on
  later without touching the recovery logic. Fable's lean: ship it
  without a threat first — proving the tractor's new economics (3.52)
  matter is the point, and a fight would just be Combat training again
  with extra steps.
- Test (once built): accepting spawns the derelict at the right range
  with its own locatable voice; tractoring it to `tractorStopDist` then
  E recovers it and despawns it; docking afterward pays credits and
  favor and ends the mission; leaving or dying beforehand fails it via
  the existing generic path with no new code; the station-offered
  Escort/Defend/Contract missions are unaffected.

### Phase 3E — the encounters (ideas14.txt + Brian in chat + Fable's five, 2026-09-07)

Brian, 2026-09-07, having ear-tested "almost all" of Rounds 28–39 with
no problems so far: "we will tweak things as I playtest more. Let's move
on to the next stages." The stage is **more encounters** — self-contained
instances, each reachable from the main page for testers before any of
them is tucked away inside a quadrant. `ideas14.txt` (untracked, like
every ideas file) carries his own three; the chat added Shift+S and a
correction about the tow; Fable added five more at his request ("give
me 5 suggestions" — "I like them all, at least to try the new ideas").
Build order: **3.56 the Encounters submenu first** ("let's build the menu
stuff first then work on the encounters"), then **3.57 Shift+S** (five
lines, and 3.60 needs it), then the encounters in the order below —
cheap modifiers to combat before whole new instances, and Brian's own
before Fable's. Same rules as everything in Phase 3: one commit per
item, machine-tested at a local server muted with beacons off, docs in
sync, every number a placeholder for Brian's ear.

**Audio sub-stages.** Brian: "I will probably be collecting other audio
assets while we do this so at some point I think we'll be injecting
sub-stages for these audio assets while we add encounters." Convention:
an encounter ships first on whatever the game already has (synthesized
where nothing recorded fits, the way every cue started), and when a
batch of recordings arrives for it, that lands as its own lettered
sub-item — **3.60a "the haul's own sounds"**, say — a manifest edit plus
whichever call site swaps its fallback for the asset, the same shape
Rounds 34/35 used for the core voices, the crumbles, the tractor hums,
and the ship explosions. Never a blocker: no encounter waits on a
recording to be built or played.

**One correction, for the record (Brian: "correct me if I am wrong").**
Brian's picture of the tow — "balancing the forces put when trying to
tug and not allowing someone to auto-thrust backwards or they lose
tether on the asteroid" — is the OLD 2.1 shape (a real tow line that
strains above `towMaxSpeed` and parts at `towSnapSpeed`), not 3.55 as
Fable wrote it, which deliberately has no tether at all: tractor closes
the gap, E recovers the derelict, it despawns, fly home. Both are kept:
3.55 stays the gentle navigate-and-recover intro, and Brian's version —
which is the better encounter — becomes **3.60 the haul**, its own
item, the one that needs Shift+S to exist so it can be the thing that
ruins you.

**ideas14.txt, line 1 — "press enter to begin" needs to repeat.** This
is 3.39, built Round 28: the line speaks at load, again at 10 s, then
every 20 s until Enter (`CFG.beginRemindFirstMs`/`EveryMs`). Brian
confirmed it silent (2026-09-07: loaded the page, pressed Ctrl to
silence NVDA, never heard it again; Down arrow before Enter also
silent). **Found and fixed (Round 43, Fable)**: the `#announce` live
region sat INSIDE `<div id="game" hidden>` — a `display:none` subtree
is not in the accessibility tree, so every 3.39 `say()` wrote text the
screen reader could never see until Enter unhid the container. Round
28's test checked the DOM text changed, not that it was exposed. Moved
the live region out to the body, beside the button. The Down-arrow
silence was a second hole: the body is `role=application`, so NVDA is
in focus mode from the first frame and arrows reach `onKeyDown` — whose
first line was `if (!running) return;`. Now any key before Enter other
than Enter/Space/Tab re-speaks the begin line. Confirmed at a local
server via the accessibility tree (the live region present with the
begin line before Enter) and a synthetic Down and Ctrl each re-speaking
it. Lesson, for CLAUDE.md: **a live region must be tested for
exposure, not just for text** — `read_page` before the gesture, not
`textContent` after.

#### 3.56 The Encounters submenu (ideas14.txt) — DECIDED, build first

- Brian: "think we now need a main menu option for 'Encounters' and tuck
  all our examples of them inside this menu, using right arrow to access
  this submenu from the main menu and then up and down arrows to select
  the encounter to try." And: "don't think we need to demo page these"
  — the game's own menu is the demo page; nothing goes in the lab.
- **Shape**: one new `MENU_ITEMS` entry, **Encounters**, between Sector
  and Help, carrying a `sub` list (`ENCOUNTER_ITEMS`) that takes over
  the five drills currently sitting top-level — Combat training, Mining,
  Flight course, Escort drill, Defend drill — and every encounter this
  phase adds after them. The top level shrinks to Delivery run, Sector,
  Encounters, Help, Difficulty, Sound, Run log, Sound Lab (plus Resume
  when the menu is open over a live mission).
- **Keys**: on the Encounters line, **Right or Enter opens** the sublist
  (a click, "Encounters. N to try. Up and down browse, Enter starts one,
  Left or Escape returns." plus the current item); Left on it just says
  how to open it. Inside: Up/Down wrap with the click, Enter or Right
  selects with the same two-note/"X selected"/600 ms beat the main list
  uses, **Left or Escape returns** to the main list on the Encounters
  line, Tab repeats, a first letter jumps and cycles (`c` for Combat
  training, `m` Mining, `f` Flight course, `e` Escort, `d` Defend —
  today's top-level letters `c`/`m`/`f` stop working at the top level,
  since those items are no longer there; `e` jumps to Encounters
  itself). The sublist remembers its own cursor across trips out and
  back, like the main list does. Escape inside the sublist closes the
  sublist — never resumes a live mission directly; a second Escape does
  that, so the two levels behave the same way.
- **Nothing else changes**: `startMission`/`startMissionDrill` are
  called exactly as before; `RESUME_ITEM` stays appended after
  `MENU_ITEMS` (its index moves down by four, which is why it's
  appended, not fixed); `exitToMenu()`/`openMissionMenuOverlay()` close
  any open sublist so a return to the menu always lands on the main
  list. `KEY_DESCRIPTIONS` for the moved first letters, the help
  section that lists the menu, README's menu paragraph and its drill
  sections, and `__sim.state().menuSub` all follow.
- Test: Right on Encounters opens it and reads Combat training; Down
  ×4 reads Defend drill, Down again wraps; Left returns to "Encounters"
  on the main list; Right again reopens on the remembered item; Enter
  on Mining starts mining exactly as before; Escape from the sublist
  over a live mission closes the sublist, a second Escape resumes; `c`
  at the top level says "No item starts with c"; the delivery run and
  the sector are untouched.

#### 3.57 Shift+S: auto-thrust in reverse (Brian, chat, 2026-09-07) — DECIDED

- Brian: "we are going to need to use Shift S to auto-thrust backwards,
  like we use Shift W for auto-forwards."
- `autoThrust` becomes a direction — `false`, `'fwd'`, `'rev'` — and
  `simTick`'s effective-keys object synthesizes a held `s` instead of a
  held `w` for `'rev'`, at `brakeThrust` (35, half of W) exactly as a
  held S already is: it decelerates, stops, and backs up. Shift+S from
  off turns it on ("Auto-reverse on. W, S, or shift S ends it."), from
  `'rev'` off, from `'fwd'` flips it to reverse in one press (and Shift+W
  from `'rev'` flips forward — a cruise doesn't have to be stopped to be
  reversed). Every existing cancel path (any W or S press, a warp jump,
  docking, `clearMission`, undocking) already reads the flag's truthiness
  and needs no change; `statusReport` and the docking/undock lines name
  the direction. Reaction mass is spent as a held S would spend it.
- Test: Shift+S from rest backs the ship up at the brake rate; Shift+S
  while cruising forward reverses in one press; S ends it; Shift+W from
  reverse flips forward; I reads "Auto-reverse on."

#### 3.58 Enemies that turn toward you: the facing cone and the cannon (ideas14.txt) — DONE

- Brian: "enemy ships approach and get within laser range; we use the
  cone effect on sound so that they can be heard when they turn towards
  the player... a steady machine gun sounding effect so that it sounds
  different when the enemy ship is pointed at the player, this is to
  simulate a 'turning towards me' effect." Also: "probably stay on the
  same vertical plane; they can move horizontally but need to turn in
  the direction they thrust and then turn back towards the human player
  in order to shoot."
- Two modifiers to combat as it exists, not a new instance. **(a) The
  cone**: every enemy's engine voice gets a `PannerNode` cone (the Jump
  Gate already has one, 3.31/L.9 — `gateConeInner`/`Outer`/`OuterGain`
  become per-ship `enemyConeInner`/`Outer`/`OuterGain`), oriented along
  the ship's own facing, which today's enemies don't HAVE — they orbit
  or sit, and the telegraph is the three chirps. So each hostile gains
  a `facing` yaw that turns toward its own velocity while it moves and
  **toward the player before it fires**: the telegraph phase (the 1.2 s
  chirps) becomes "yaw onto the player, then chirp" — the engine
  brightens through the cone as the nose comes round, and that
  brightening IS the first warning, ahead of the chirps. Same vertical
  plane: `facing` is yaw only, pitch stays flat, per Brian. **(b) The
  cannon**: a third enemy weapon alongside the beam and the missile, a
  steady rattle (`enemy_cannon`, synthesized until a recording exists —
  3.58a) that is the cone's own sound: fully loud only inside the inner
  cone, fading to `OuterGain` outside it, so "it's pointed at me" and
  "it's shooting" are the same sound, and side-stepping out of the cone
  is the defense. Damage per second inside the cone, none outside;
  shields absorb it like the beam. Which ships carry a cannon is a
  roster field (`weapon: 'cannon'`), Raider and Scout first.
- Brian's own aside — bullets walking in, thumps on dirt, the twang of
  a hit shield — is written down here as the sound design brief for
  3.58a, not built: the rattle gets a "walking in" sweep as the cone
  closes on you and a distinct shield-twang variant of the existing
  splash.
- Test: a hostile's engine measured brighter inside its cone than
  outside at equal distance; a cannon ship damages only while the
  player is inside the cone and stops when they thrust out of it; the
  beam and missile attacks, and Rookie's passive-until-hit rule, are
  unchanged.

**DONE (Round 41, Sonnet).** Built as scoped above, no changes to the
shape. `t.facing` (yaw-only radians, `updateFacing`/`angleTowards` —
reusing 3.38's own helper) turns at `enemyFacingTurnRateDeg` (90°/s)
toward the ship's own velocity while it's actively moving (an evade
burst, or an orbit's spin kick) and toward the pilot otherwise;
`buildVoice` fits every combat ship's panner with a cone
(`enemyConeInner`/`Outer`/`OuterGain` — 70°/160°/0.35, the gate's own
shape at 3.31/L.9 reused, not copied: a new shared `SIM.audio.
setOrientation()` replaces both the gate's inline branch and this
one) and `stepCombatShips` drives its orientation every frame from
`t.facing`. A `weapon: 'cannon'` roster field (Raider, Scout) is read
in `updateEnemies`'s existing range dispatch — ahead of the beam check
at the same range — to call `startEnemyCannon` instead of
`startEnemyLaser`; the cannon (`enemyCannonVoice`, a looped noise
buffer through a bandpass filter pulsed by a square LFO — a
synthesized placeholder, flagged for the 3.58a audio sub-stage once a
real recording exists) has no telegraph and no fixed beam-length
voice swap: `stepThreat`'s new `cannon` branch recomputes
`facingConeAngle(t)`/`coneMulFor()` every frame, drives the voice's
live gain from it, and scales each tick's damage by the same
multiplier — full inside the inner cone, `enemyConeOuterGain` in the
outer band, zero beyond it — reusing `absorbShield`/`hullHit`
unchanged either way. Two small permanent test hooks:
`poke({enemyFacingDeg, enemyName})` and `poke({enemyPos: {name, x, y,
z}})`, plus a `facings` array and `threat.coneMul`/`dealt` in
`state()`. Machine-tested at a local server: booting a fresh Combat
training drill at Veteran (so every ship starts hostile) showed each
ship's own initial `coneAngle` genuinely varied by its actual spawn
geometry (53°–180° across the five), then converged toward 0° after
a few seconds of `__sim.step()` as `updateFacing` turned every ship
toward the player — confirming the turn-rate math, not just that a
number exists; forcing the Raider (a cannon ship) into range produced
a real `threat.type === 'cannon'` with `dealt` landing at exactly
`CFG.enemyCannonTickDmg` (5) per tick while `coneMul === 1`, and
`endThreat` tore the voice down cleanly with the threat returning to
`null` and the encounter otherwise unaffected; the untouched laser
path (Cruiser, no `weapon` field) was exercised in the same session
and absorbed correctly into a raised shield (pool 45→15, hull
untouched), confirming `buildVoice`'s new cone block doesn't disturb
a non-cannon ship's ordinary attack. **One real testing snag, not a
game bug**: `Cruiser`'s `orbit` field overwrites `t.pos` from its own
orbit formula every `stepCombatShips` frame, so the `enemyPos` test
poke (built this round to relocate a named ship out of range) cannot
actually move it — harmless for real play, since nothing else tries
to reposition an orbiting ship either, but it means a test aimed at
isolating one non-orbiting ship's cannon should pick targets other
than the Cruiser to push aside. Zero console errors throughout. Every
number (the turn rate, the two cone angles, the outer gain, the
cannon's own tick count/damage) is a placeholder for Brian's ear —
this pass was about the mechanism (turn-to-face, cone-gated damage),
not the tuning.

#### 3.59 Turret defense: three zones, then the numpad 3×3 (ideas14.txt) — 3-zone DONE, 3.59b proposed

- Brian: "the player has 3 zones in front of them, using arrow keys
  moves between the zones... with 3 enemy ships in front, spaced and
  using HRTF, so the player cycles through their own zones using left/
  right arrows and would fire missiles in zone 2, put up shields, go to
  zone 3, use laser, go to zone 1 while laser in 3 is shooting and put
  down shields in 1... to represent maybe defending the back of a ship
  from a turret like thing." Then the numpad: "each key on the numpad
  firing a laser in that cell of a 3×3 grid... based on perceived
  height, fires a laser on the far left using 1, 4, 7, and it either
  misses in that cell going out or hits and destroys the incoming, with
  cooldown on the fired laser so a miss at some point means damage."
- A new `mode`, `'turret'`, the first encounter where **the ship does
  not move**. Left/Right pick a zone (three fixed bearings, −40° / 0° /
  +40°, spoken as left / centre / right); Space, F, G act **in the
  selected zone only** — each zone has its own laser cooldown and its
  own shield, so the sequence Brian describes (missile in 2, shield 2,
  laser 3, back to 1, drop shield, laser 1...) is the whole skill.
  Incoming things (ships, or later projectiles) each sit in one zone at
  one of three heights, drawn from a wave table, closing on their own
  clock; a miss or a cooldown gap means a hit on the hull. Score is
  waves survived. Built on the existing target/lock/beam machinery with
  `aim()` bypassed — the zone IS the aim.
- **Second pass, 3.59b: the 3×3.** Nine cells (three bearings × three
  elevations) on the numpad, `7 8 9 / 4 5 6 / 1 2 3`, with a non-numpad
  map — Fable proposes `Q W E / A S D / Z X C` on the letter block,
  same shape under the left hand — and the rule that a laser fired into
  the wrong cell "misses, going out." Elevation is the new thing the ear
  has to read, which is exactly what this encounter is for. Whether
  the 3-zone version survives once the 3×3 exists is Brian's call after
  hearing both.
- Test (3-zone): three targets spawn one per zone at three heights; a
  laser in the selected zone hits only that zone's target; a zone's
  shield absorbs only that zone's incoming; a missed cooldown window
  costs hull; Left/Right at the ends wrap or refuse (decide by ear).

**DONE — the 3-zone pass (Round 42, Sonnet).** A new `mode: 'turret'`
(`ENCOUNTER_ITEMS`, `startMission('turret')`) that skips `simTick`'s
entire flight/thrust/collision block outright (a new early branch right
after the `menuOpen` freeze, calling only `updateTurret(dt)` plus the
listener/status line every mode needs) — the ship truly never moves.
State lives in its own `turretState` (`{zone, zones: [{laserReadyAt,
shieldUp, incoming, spawnIn}, x3], elapsed, cleared, hits, missiles}`),
not `targets` — incoming ships are never Tab-cycled or locked, matching
Brian's own "the zone IS the aim" framing exactly; each owns a
lightweight voice (`buildIncomingVoice`/`moveIncomingVoice`, a triangle
tone pulsed by a sine LFO, both the tone's pitch and the pulse rate
rising as it closes) positioned by `turretIncomingPos()` from its
zone's fixed bearing (`turretZoneBearingsDeg`, −40°/0°/40°) and height
(`turretHeightOffsetsDeg`, low/mid/high). `turretKey()` is a single
early intercept in `onKeyDown` (right after the `warping` check, ahead
of every other chord/HELD/switch machinery) claiming Left/Right (switch
zone), Space (fire that zone's laser — clears the incoming, cooldown
`turretLaserCooldownS`, refuses empty or recharging), F (a missile from
a small shared `turretMissileMax` magazine — guaranteed clear, no
cooldown, no per-zone limit), G (toggle that zone's own shield —
instant, no spool, no pool, a deliberate simplification from the
pilot's real shield, flagged for Brian's ear), and I (a turret-specific
status line); every other flight/weapon key (arrows up/down, W/S, Tab/
T/R, D/B/Z/E/V/Q/H/C) is refused with the offline buzz naming the two
real keys. F1/F2/F3/F12/Escape/X/Enter/Y are deliberately NOT claimed —
`turretKey()` returns `false` for them and they fall through to the
exact same generic switch every other mode already uses, so help, the
ship/resource screens, the mission-menu overlay, leaving, retrying, and
Y-for-totals all just work with zero new code. `updateTurret(dt)` ticks
whichever zones hold an incoming (impact on timeout — the zone's own
`shieldUp` absorbs it silently or `hullHit(CFG.turretHullDmg, ...)`
lands, reusing the existing hull/loss/tug-eligibility machinery
unchanged) and spawns a fresh one after an empty zone's own randomized
gap; surviving `CFG.turretDrillS` (60s) wins. `clearMission()` gained
`stopAllTurretVoices(); turretState = null;` (incomings aren't
`targets`, so the existing `targets.forEach(stopVoice)` never reaches
them), and both `startMission('turret')` and the generic Enter-retry
path build a fresh `turretState` after `newGame()` — the same
relationship `courseState` already has to `newGame()`, reused rather
than reinvented. Two test hooks: `poke({turretIncomingS, turretZone})`
(force a zone's incoming to a specific time-to-impact, spawning one if
none exists, for deterministic testing) and `state().turret`. Machine-
tested at a local server: zone switching wraps both directions and
speaks what's in the new zone; every refusal (empty zone, recharging,
no missiles, an unclaimed key) fires with the right cue and line; a
forced impact with the zone's shield up left hull untouched while an
identical impact with it down cost exactly `CFG.turretHullDmg` (12); a
missile cleared a zone that was still on laser cooldown, decrementing
the shared magazine; fast-forwarding through a whole drill with no
player action confirmed hull eroding to 0 and routing to the standard
non-tug retry (a menu-launched drill, no `sectorHome`); Enter rebuilt a
fresh `turretState` (hull, cleared, hits, missiles all reset) and
re-spoke the intro; X returned to the mission menu and nulled
`turretState`. Zero console errors throughout. **Deliberately NOT
built**: 3.59b (the numpad 3×3 second pass) — the 3-zone version is a
complete, playable encounter on its own, and Brian's own spec text
already frames the 3×3 as a distinct later pass to compare against by
ear, not a prerequisite. Every number (the bearings, the drill length,
the cooldown, the hull damage, the magazine size) is a placeholder for
Brian's ear.

#### 3.65 Turret defense, second pass: the sweet spot, pressure, a second noise, streaks, and the debrief (Brian, 2026-09-07, from playing 3.59) — DECIDED, build before 3.59b

Brian played the 3-zone build: "I think I got most of the objects and
my hull got hit maybe 1 time." Too easy, and points alone won't tell
him anything. Five changes, all inside `updateTurret`/`turretKey`:

- **1. Score by where you hit it.** Brian: "a player gets rewarded for
  hitting the target at a certain spot and that value goes down further
  the farther the incoming object is from that spot — hit way too early,
  it's not worth as much; hit right before it hits the player, not as
  much either." Every incoming has a **sweet spot** at
  `turretSweetFrac` (0.45) of its approach — `frac = timeLeft / total`,
  so 1 is "just spawned" and 0 is impact. A clear at `frac` scores
  `turretMaxPoints` (100) × `max(0, 1 − |frac − sweet| / turretSweetWidth)`
  (width 0.45 — so a clear at spawn or at the last instant scores ~0,
  and the sweet spot is the middle of the approach, where the tone has
  risen enough to be read but there's still time to act), floored at
  `turretMinPoints` (10) so any clear is worth something. Spoken with
  the clear ("Centre cleared, 82." — one say(), SPEC 2.15), and a pitch
  cue on the clear chime that tracks the score. A missile clear scores
  the same way (it's still a timing choice). Running total on I.
- **2. Pressure: the tone rises faster.** Brian: "we would alter the
  speed that the incoming object is by making the tone rise faster,
  thus shortening the reaction time... for now, the incoming noises
  can't be too fast." The time-to-impact drawn at spawn
  (`turretIncomingMinS`–`MaxS`, 4–7 today) is multiplied by a ramp that
  falls from 1 at the start to `turretRampFloor` (0.6) at the end of the
  drill, linearly over `turretDrillS` — the tone rise IS the speed
  (moveIncomingVoice already derives pitch and pulse from `frac`), so
  nothing else needs to change for it to sound faster. Gentle by
  Brian's own instruction; the floor is the knob.
- **3. A second noise that only the shield answers.** Brian: "we also
  need to inject a 2nd noise for the player to have to use shields."
  Each spawn is one of two kinds: `'shot'` (today's — laser or missile
  clears it) or `'volley'` (`turretVolleyChance` 0.3): a distinct
  timbre — a filtered-noise sweep, not a tone, rising the same way —
  that **cannot be shot**: Space/F on a volley refuses ("That one can't
  be shot. Shield, G." with the offline buzz) and the only defense is
  the zone's shield up at impact, which catches it (a splash, +
  `turretVolleyPoints` 40, spoken) — otherwise it lands on the hull like
  any other. So the ear has to tell the two apart and pick the right
  key, which is the whole point of the encounter. A volley never counts
  as "cleared" for the streak below unless the shield catches it.
- **4. Shields instant.** Brian: "we need to make shields be instant
  up and down for this encounter." Already true as built (G toggles
  `shieldUp` with no spool, no pool) — confirmed as the rule, not an
  accident; the pilot's real shield (1.5 s spool, a pool) stays as it
  is everywhere else.
- **5. Streaks earn a temporary shield.** Brian: "add something that
  gives a temp boost for a temp shield if a player strings kills in a
  row as a defense mech as this encounter gets harder." `streak`
  counts consecutive clears (shot clears and shield-caught volleys)
  with no hull hit in between; at `turretStreakFor` (5) it fires a
  **streak shield**: every zone's shield goes up for
  `turretStreakShieldS` (6 s) whatever the player has set, a distinct
  rising cue and "Streak! Shields up, 6 seconds.", then each zone drops
  back to what the player had set. A hull hit resets the streak to 0
  (no cue beyond the hit itself). `bestStreak` is kept for the debrief.
- **6. The debrief.** Brian: "after the 60 seconds, we need some
  scoring and other evaluation data (I've no idea how to measure this
  but we need more than just points)." At the end (won, or the hull
  gone), ONE spoken debrief, then browsable: the score; **accuracy**
  (clears ÷ everything that came, as a percentage); **timing** (mean
  distance from the sweet spot in seconds, and whether you run early or
  late on average — "you fire 0.8 seconds early" — the course's own
  "average off centre" readout, in time); **best streak**; **volleys
  caught vs. landed**; **missiles used**; and the **weakest zone** (the
  zone that landed the most on the hull — "Right zone took 3 of your 4
  hits"). Those six are Fable's proposal for "more than points": each
  one names something the player can *change* next run. The debrief is
  read line by line like the run log (arrows), Escape/Enter/X as
  today. `profile.turretRuns` keeps the best 10 by score, one line each
  in the Run log (score, accuracy, streak) — `PROFILE_VERSION` → 9.
- Test: a clear at frac 0.45 scores 100, at 0.9 and 0.05 ~10; the
  drawn time-to-impact at elapsed 59 s is 0.6× the one at 0 s; Space on
  a volley refuses and G-up catches it for 40; five clears in a row
  raise all three shields for 6 s and then restore each zone's own
  setting; a hit resets the streak; the debrief's accuracy/timing/
  weakest-zone numbers match a hand count from `state().turret`; the
  Run log shows the new board; a v8 save migrates to v9 with an empty
  `turretRuns`.

#### 3.60 The haul (Brian's tow, force-balanced; needs 3.57) — proposed

- Brian's own picture, quoted above under "One correction". The tractor
  latches a huge rock (or a derelict) and **stays latched while you fly
  it home** — this is the one place the tractor trails a moving puller,
  which 3.55 deliberately avoided; here it's the whole game. A live
  tension line: a creak whose pitch tracks the strain between the ship's
  velocity and the load's, `haulStrainWarn` where it starts to rise,
  `haulSnap` where the line parts ("Tow line parted.") and the load
  coasts on at whatever it had — go catch it and re-latch. What breaks
  it: thrusting too hard forward (the load lags, strain climbs),
  turning too sharply, and above all **braking or reversing into your
  own load** — S held, or Shift+S, drives strain to the snap point in
  under a second, which is Brian's "not allowing someone to auto-thrust
  backwards or they lose tether." Reaction mass is the score: the
  tractor's work-based cost (3.52) plus every thruster puff, against a
  par per haul.
- Shape: a `mode` of `'mining'` with a `haul` object on top (the
  `demo`/`contract`/`mission` pattern), one target with `haulable:
  true`, a home beacon at a fixed distance; complete by bringing the
  load within `tractorStopDist` of the beacon with the line intact.
  Reuses `updateTractor` with one new branch (a latched load follows
  the ship's velocity through a spring, not a close-to-stop-distance
  pull) — flagged: this is the `updateTractor` change 3.55 stepped
  around, done here on purpose, gated on `haul` so mining's tractor is
  byte-for-byte untouched.
- Test: latching, a gentle haul home completing under par; a hard W
  raising the creak and parting the line at the configured strain;
  Shift+S parting it inside a second; re-latching a coasting load; the
  reaction-mass total spoken at the end against par.

#### 3.61 The minefield — proposed (Fable)

- Nothing to shoot. A field of slow-drifting proximity mines, each with
  its own tick that quickens as you close (the lock tick's own shape,
  one per mine, world-positioned), a speed ceiling (`mineSafeSpeed`)
  above which a mine within `mineTriggerDist` detonates on you, and a
  beacon on the far side to reach. Pure listening and throttle control —
  the skill every other encounter assumes and none of them teach.
  Reuses rock voices for the mines, `updateCollisions` for the
  detonation check, a clock for the score.
- Test: crossing at the ceiling clears; one mine passed too fast
  detonates with a hull hit; the far beacon ends it with the time.

#### 3.62 The shadow — proposed (Fable)

- Tail a ship that keeps cutting its engine. It flies a route with
  random silent legs (`shadowSilentMinS`–`MaxS`, engine loop ramped to
  nothing, no lock, no tick); you hold within `shadowRange` for
  `shadowNeedS` seconds total, and while it's dark you fly on the last
  bearing and `R`'s closing/opening readout until it lights up again.
  Trains tracking. Reuses the escort friendly's route code and the
  sensor-offline lock rule from 3.27 for the dark legs.
- Test: contact time accrues only within range; a silent leg drops the
  lock and the tick; re-acquiring after the leg resumes accrual; the
  total reached ends it with the time.

#### 3.63 Nebula transit — proposed (Fable; the staged pulsar/space_loop audio finally gets a job)

- Inside the cloud the sensor runs at 3.27's "half" state (lock zone
  halved, tick doubled) and a **pulsar** — one of Brian's `pulsar1-8`
  recordings, world-positioned, on a fixed rhythm — is the only stable
  bearing; a `space_loop` bed is the cloud itself. Find the exit gate
  before the hull ablates (`nebulaHullPerS`, slow). Danger variants take
  Brian's own nebula prompts (#3/5/8/10 in `audio/stations/"sound
  description for nebulae.txt"`) as sub-stages. This is the "nebula
  muffling" the Deferred list has held since Phase 1, given a place to
  live.
- Test: sensor state reads half inside and ok outside; the pulsar's
  bearing is stable while everything else drifts; reaching the gate
  ends it; the hull drain stops at the boundary.

#### 3.64 The gate run — proposed (Fable)

- The Jump Gate's cone already sweeps every `gateSweepS` (L.9, 3.31).
  Rule: you can only jump while inside the beam. Fly to it, time the
  approach, hit H on the pass — a timing game the ear does better than
  the eye, and it teaches gates before quadrant 2 exists (3.22 can then
  adopt the rule wholesale). A wrong-time H refuses with the wait
  ("Beam passes in 6 seconds."). Score: time, and passes wasted.
- Test: H outside the beam refuses naming the wait; H inside jumps; the
  wasted-pass count is spoken at the end.

#### 3.48 F2 lasers: the equipped laser per slot, switchable there (ideas12.txt) — DONE

- Brian: "F2 should show the currently equipped laser in that slot and
  not all the lasers, where the player could switch the laser in that
  slot if they have the access to it and see the numbers change."
- Today the Lasers heading reads every FAMILY's level and profile, then
  every slot's name — two lists to reconcile. Instead: **one block per
  fitted slot** — "Slot 1: mining laser level 3. 22 per tick, 8 ticks
  over 8 seconds, 3 second cooldown. Bites iron and cruisers, weak on
  ice and interceptors. Health 62." — and the family-level lines go.
  On a slot's line, **Left/Right cycles that slot's level within the
  owned range** (the same `cycleLaserVersion` 1/Shift+1 use in flight),
  and the block re-reads with the new numbers. F2 is frozen sim, so no
  switch delay — but the slot's own `laser_switch` clip still plays,
  for the feel, at natural length with no refusal window. Weapons cold
  modes still can't fire it; changing it here is just choosing.
- Test: Left on slot 1 at level 3 reads level 2's numbers and the
  clip plays; Right past the owned level wraps; an empty slot's line
  refuses Left/Right with the buzz (3.50); leaving F2 and firing uses
  the level chosen there.

**DONE (Round 33, Sonnet).** The Lasers heading is rebuilt as one block
per slot (name/level/status, per-tick/ticks/cooldown, matchup, health —
four lines, or one "Slot N is empty" line), with the old per-FAMILY
list gone entirely; a shared Range/point-blank line stays, since it
isn't tied to any one slot. Every line in a slot's own block carries a
new `slot` tag (`buildShipLines()`'s `line()` helper grew an optional
second argument) so `shipScreenKey`'s new Left/Right handler can find
which slot the cursor is on regardless of which of that slot's four
lines it happens to be reading — pressing Left/Right on the Range line,
a heading, or any other non-tagged line instead says "This line isn't
one." and does nothing. On a real slot line, Left/Right calls the same
`cycleLaserVersion(i, dir)` flight already uses (wrapping 1..owned both
directions), saves the profile, plays the slot's own `laser_switch`
clip through a new `playSlotSwitchClipNatural(i)` — natural length, no
`playbackRate` stretch and no refusal window, since F2 is a frozen sim
and nothing is actually "switching" — then rebuilds `shipScreen.lines`
and re-speaks the current line so the numbers are heard fresh
immediately. An empty slot's line refuses with `refusal_offline` (3.50)
instead of cycling. `KEY_DESCRIPTIONS.f2`, the F2 open/idle hint lines,
and README's F2 row all mention the new Left/Right behavior. Machine-
tested at a local server against a profile seeded with mining level 3
(owned) in slot 1 and rapid level 1 in slot 2: Left cycled 3→2, Right
cycled 2→3, a further Right wrapped 3→1, and a further Left wrapped
1→3 — all four confirmed reading the correct name/per-tick numbers
each time; the per-tick line itself confirmed reflecting the new
level's real damage (15 at level 1 vs. 21 at level 3, same tick base);
Left/Right on the Lasers heading line and on the shared Range line both
correctly refused as "not a slot line"; the empty slot 3 correctly
refused with the fit-at-the-station message; closing F2 and reading
`localStorage` directly confirmed `profile.slots[0]` persisted at the
level last chosen in F2, with `laserHealth` completely untouched by any
of the cycling (health/wear is a firing-time mechanic, not a browsing
one). Zero console errors. Not yet heard or flown by Brian.

#### 3.46 Lasers for slots 3 to 6 — four new families (ideas12.txt) — DONE

- Brian: "I think I have enough laser assets now to wire up slots 3
  through 6, please verify." **Verified**: `audio/weapons/lasers/` now
  holds four new sets of eight — `burst_plasma_laser1–8`,
  `fast_fighter_laser1–8`, `rotary_cannon_laser1–8`,
  `rugged_mining_laser1–8` (untracked; 32 files, to be staged
  explicitly, never `git add -A`). Enough for slots 3–6, one family
  each, eight levels each, exactly the shape 2.12/3.26 already give
  slots 1 and 2.
- **Four `LASER_FAMILIES` entries** — profiles are Fable's proposal for
  Brian's ear, built so each family has a job the others don't:
  - **Rugged mining** (slot 3): mining's heavy cousin — 6 ticks over
    9 s, tickBase 22; strong on iron and stone, weak on every ship.
    A miner's laser, useless in a fight.
  - **Fast fighter** (slot 4): rapid's cousin — 12 ticks over 4 s,
    tickBase 5; strong on interceptors and ice, weak on cruisers and
    iron. The dogfighter.
  - **Rotary cannon** (slot 5): many small bites — 16 ticks over 6 s,
    tickBase 4; strong on corvettes, weak on rocks of every kind.
  - **Burst plasma** (slot 6): three heavy bites front-loaded — 3 ticks
    over 4.5 s, tickBase 40; strong on cruisers, weak on interceptors.
  Every clip's real length is measured at build (ffprobe) and each
  family's burst is fitted to it, the way 2.12 fitted mining/rapid;
  32 manifest keys; all excluded from nothing (they're game assets,
  they preload).
- **The missing piece: fitting a family into an empty slot.** Slots
  3–6 are empty today with no way to fill them — 3.26's Lasers shop
  only sells LEVELS of a family you already have. It gains **"Fit
  [family] in slot N"** lines for each empty slot and each unowned
  family, `laserFitCredits` 300 + 1 alloy, which sets
  `profile.slots[N]` to that family's level 1 and
  `profile.laserLevels[family]` to 1. Per-family levels/health/wear
  then work unchanged. `STARTING_SLOTS` stays `['mining1', 'rapid1']`.
- Test: all 32 keys preload; each family fires its own recording at
  its measured length; the shop fits a family into slot 3 and refuses
  a second fit of the same family; 3/4/5/6 select and fire; F2 (3.48)
  shows each; the matchup multipliers apply.

**DONE (Round 33, Sonnet).** The 32 files were re-verified with `ffprobe`
rather than trusted at face value — a good thing, since the real
lengths (burst_plasma/fast_fighter 5.0s, rotary_cannon/rugged_mining
7.0s, uniform across all 8 levels within each family, same as mining/
rapid's own convention) didn't match Fable's proposed durations (9s/4s/
6s/4.5s), written before the clips existed to measure. Every family's
`tickCount`/`tickS` was refit to its REAL length instead — rugged
mining 7×1s=7s, fast fighter 10×0.5s=5s (this one happens to land
exactly on rapid's own cadence, fitting "rapid's cousin" neatly),
rotary cannon 14×0.5s=7s, burst plasma 4×1.25s=5s — preserving each
family's intended character (heavy-and-few vs. rapid-and-many) as
closely as the real clip lengths allow; `tickBase`/`cooldownS` adjusted
to match. `strong`/`weak` arrays (the actual multiplier keys, separate
from `matchupSpoken`'s spoken strings) were built from `SHIP_CLASS`'s
three classes and `ROCK_TYPES`' three rock names. All 32 manifest keys
added to `audio_assets.js` following the `laser_<family><version>`
naming `LASERS`' own generation loop already expects — no code change
needed there, only data. **The missing piece** (fitting a family into
an empty slot) is a new `buildLaserShop()` that REBUILDS the shop's own
item list (buy/repair lines for every OWNED family, one "Fit X in slot
N" line per empty-slot-x-unowned-family combination) rather than the
old fixed list, called at `openLaserShop()` and after every buy/repair/
fit action; a family fit once becomes owned and drops out of every
remaining "fit" line for every other empty slot, which IS the "refuses
a second fit" behavior — no special-case check needed, just the natural
consequence of the list being rebuilt from current ownership. A new
flat-cost path (`CFG.laserFitCredits` 300, `laserFitAlloy` 1, always
level 1) sits alongside the existing per-level `buy`/`repair` costs in
`laserShopText`/`laserShopReady`/`laserShopKey`. **A real, pre-existing
migration bug found and fixed while testing, not introduced by this
round's own new code but only ever exposed by it**: `loadProfile()`'s
SPEC 3.26 (v3→v4) migration iterated the LIVE `LASER_FAMILIES` array
unconditionally on every single load (not gated on `loadedVersion`, and
reading current data rather than a frozen historical shape) to backfill
`laserLevels`/`laserHealth` for any family missing from the raw saved
JSON — harmless while the array only ever held mining/rapid (both
meant to be always-owned, so the backfill was redundant with
`defaultProfile()`'s own seed), but the instant this round grew
`LASER_FAMILIES` to six entries, the SAME loop silently stamped level 1
onto all four new families for EVERY profile, fresh or old, since none
of them exist in ANY saved JSON either — confirmed by direct repro (a
freshly-cleared profile read `laserLevels: {mining:1, rapid:1,
rugged_mining:1, fast_fighter:1, rotary_cannon:1, burst_plasma:1}`
despite `profile.slots` correctly showing slots 3–6 still empty, and
the Lasers shop showed all four new families as normal level-2 buy
lines instead of "Fit" lines). Fixed by gating the whole block on
`loadedVersion < 4` AND hardcoding the migrated family list to
`['mining', 'rapid']` instead of the live array — a migration has to
stay pinned to what it originally migrated, the same lesson SPEC 2.18's
version field and this round's own SPEC 3.45 sound-level migration both
already exist to teach, just encountered from a new angle (a *live data
table* growing, not a *save format* changing). Re-confirmed fixed: a
freshly-cleared profile now reads exactly `{mining:1, rapid:1}. Machine-
tested at a local server end to end, docked at Station Meridian with
seeded credits/alloy: the Lasers shop's browsable list showed exactly
16 "Fit" lines (4 empty slots × 4 unowned families) before any fitting;
fitting burst plasma into slot 3 correctly deducted 300 credits/1
alloy, set `profile.slots[2]` and `profile.laserLevels.burst_plasma`,
and rebuilt the list down to 9 remaining fit lines with burst plasma's
own buy/repair lines now present instead (confirming the "no second
fit" behavior); insufficient-credits and insufficient-alloy refusals on
a fit line both confirmed with the correct shortfall spoken; selecting
the newly-fit slot 3 in flight spoke "Slot 3, burst plasma 1,
switching."; F2 read both newly-fit lasers (slots 3 and 4) with their
real per-tick/tick-count/cooldown/matchup numbers exactly matching the
family data. Firing itself was not exercised in a live combat encounter
this round (weapons are cold in open sector flight, and reaching a
combat zone to fire for real was out of scope for a data-only addition)
— confidence instead comes from `beamTick`/`startBeam` being completely
unchanged code, reading the exact same `LASER_FAMILIES_BY_ID`/
`laserLevelMult` values F2 already confirmed correct. Zero console
errors throughout. Every family's numbers and the fit price are
placeholders for Brian to fly and judge. Not yet heard or flown by
Brian.

#### 3.47 The stats page — a discussion, not a build (ideas12.txt)

- Brian: "a button that opens a page (probably a new page) that
  displays the game stats in tables for the screen reader user to
  navigate using native table navigation techniques on a standard web
  page. **do not just do this, we need to discuss** as this takes us
  out of the keyboard input trap and on to a standard web page."
- Fable's read, for the discussion: **the precedent already exists** —
  the Sound Lab is exactly this, a standard page reached by a real
  navigation from the mission menu, with Back (and now a link) to
  return; nothing about the game's own key-trap shell changes, it
  simply isn't on that page. A `stats.html` can read `hss_profile`
  from `localStorage` directly (same origin) — no export step, always
  current. Native table navigation is the right call for tabular data;
  the aria-live single voice can't give it and shouldn't try.
- **What it could show today, from the profile alone**: the three run
  boards (delivery, contract, course — time, tier, date), favor per
  port per quadrant (favor, peak, tier), lasers (level, health, per
  slot), modules owned, credits/salvage/alloy, the game clock. **What
  it can't, because nothing counts it yet**: kills by class, ore mined,
  credits earned/spent, deaths, distance flown, time in each mode,
  gates cleared/missed lifetime, missions by outcome. That's the real
  work — a `profile.stats` counter set with a dozen increment sites —
  and it's the part worth deciding on before building anything.
- **Questions for Brian**: (1) read-only, or also a place to change
  settings? **Decided (Brian, 2026-09-05): read-only** — settings stay
  in the game's own menus. (2) Which of the uncounted stats matter enough to add counters for?
  (3) One page with several tables, or one table per section with
  headings? (4) Reached from the mission menu next to Sound Lab, same
  "leaves the page — Back returns" wording? (5) `PROFILE_VERSION`
  bumps for the counters — fine?
- Not scheduled. Direction recorded in A.12.

#### 3.11 Ports: stations, prices, and F4 trading (A.10)

- **`PORTS`** keyed by name: `{ kind: 'station' | 'planet', serves,
  wants: ['biomass', 'hydrogen'], prices: { ore, salvage, alloy,
  hydrogen, biomass }, bias: { category: +0.3 | −0.3 | 0 }, shipyard:
  bool }`. `price` = base × (1 + bias); a port's bias is its character
  and the guarantee that prices *diverge*: a station wants (and pays
  most for) what the thing it serves needs — Meridian, serving Planet A,
  wants biomass and buys ore dear; Station Two, serving the gate, wants
  hydrogen and sells it, buys alloy cheap; the planets pay for salvage
  and hydrogen and sell biomass (3.19). Base prices are today's
  (`oreCreditRate`, `salvageCredit`, `alloyCredit`) plus `hydrogenCredit`
  25 and `biomassCredit` 15.
- **F4** = the trading screen (A.12): the same browsable shell as F2/F3.
  One line per category: "Ore. Buys at 0.13 a unit, sells at 0.16. High
  here. Wanted." — buy price, sell price, the word (high / normal / low
  against base), and *wanted* where it earns favor. Reachable by F4
  within comms range of any port and from the hail menu's **Prices**
  line; outside comms range F4 shows the **last-seen** prices at every
  port, each dated in play-minutes ("Station Two, 14 minutes ago: ore
  low, wants hydrogen") — accepted by default, the pilot's memory, since
  a blind trader can't glance at a chart.
- Both stations dock, repair, refit, rearm exactly as Meridian does
  today — for a pilot they trust (3.23); only prices, wants, and the
  interior sound differ (Brian is collecting ambience sets —
  `station_interior1` is Meridian's, a second gets a key when it
  exists). Sell lines name the *price* as well as the amount.
- **Steering from 3.23 as built (Brian, ideas9)**: once `wants` exist,
  favor from selling applies **only to a wanted category** — 3.33's
  "every sale counts" was the stand-in; and each station's **missions
  follow what it serves**: Meridian escorts to the planet it serves and
  defends the field nearest it, Station Two defends the gate's own field
  — `missionDestinationPlanet/Field` read `PORTS[name].serves` instead
  of "nearest to the ship," so favor and the missions tell one story.
  The comms menu gains **Prices** and **Wants** here (3.23's comms tier
  has been Missions, Donate, Close until now). **And (ideas10): these
  ports are quadrant 2's.** Quadrant 1's two stations never get prices
  or wants; 3.11, 3.19, 3.12, and 3.20 are built against quadrant 2's
  hand-authored roster (3.22), so 3.22's gate and quadrant skeleton go
  in first — see the build order.

#### 3.19 Planets as ports (Brian: land like a station; market and fuel, no shipyard)

- A planet has the three ranges of 3.23 at planet scale (comms 3,000,
  transporter 900, landing 300 — it's big) and a `planetHullRadius` 200
  for the collision check. It runs favor like a station: Known for the
  transporter, Trusted to land. C inside the land range at a planet that
  trusts you → `dockAtStation(poi)` with `docked.kind = 'planet'`: the
  same held-still state, its own menu: **Sell**, **Buy** (3.20),
  **Launch**. Repairs and the reaction-mass refill are free as at a
  station (collision damage billed as ever); missiles and decoys are NOT
  restocked (no armory — accepted by default, one thing a station has
  that a planet doesn't besides the shipyard); no Modules; the warp tank
  refills (the core cools anywhere you're parked). Launch = `undock()` at
  `undockDist`, the same no-warp-zone line.
- **Biomass** (Brian: now, simply): a planet **sells** biomass at
  `biomassCredit` 15 × its bias (−0.3 — it has plenty) from Known, via
  the transporter or landed; cargo weight 5 (3.14). The station that
  *serves* that planet wants it: pays `biomassCredit` × (1 + 0.4) and
  favor (3.23) — the single biggest favor lever in the game, the
  planet-to-orbit run Brian described. Agriculture, farming, and other
  planetside goods stay Phase 4; Phase 3 only needs the good to exist.
- The planet's interior loop: `planet_interior1` when Brian records one;
  until then a synthesized wind bed (`planet_wind`, a slow-filtered noise
  on the music bus at `stationAmbientVol`) so landing still *feels*
  different — accepted by default, replaced the day a recording exists.
- Planets pay: salvage and hydrogen at `bias` +0.4, ore −0.3, alloy 0.
  Planet Auren in the delivery run's sector keeps its placeholder hail —
  the run is untouched.

#### 3.14 Cargo limit (A.12) — builds before 3.20, since hauling needs a hold

- `CFG.cargoMax` 20,000 ore-equivalent; ore fills it 1:1, alloy 20 per
  unit, hydrogen 10 per unit, biomass 5 per unit; salvage is small and
  never counts. The hold refuses more ("Hold full. Sell, or extract no
  more."); I / F3 read "Hold 14,200 of 20,000". A `cargo_bay` module
  (+10,000, mass 20, needs 3 alloy — the first 3.13 gate) at the
  shipyard.
- The tug gains the experience lever only once experience exists (A.11,
  still deferred).

#### 3.12 The price levers (A.9)

- Per port per category: `saturation` rises `satPerSale` 0.1 per unit
  sold (scaled per category so 10,000 ore and 20 salvage move it about
  the same), decays `satDecayPerMin` 0.05 per play-minute on the game
  clock; the port's price for that category = base × (1 + bias) ×
  clamp(1.5 − saturation, 0.5, 1.5) × (Allied ? 1.1 : 1) when selling
  (÷ when buying). Sell a lot in one place and it drops toward half;
  neglect a category ten minutes and it drifts back past base.
  **Buying** into a port lowers its saturation (`satPerBuy` 0.1 per
  unit) — a port you've bought out pays more to restock. The lever is
  audible before the sale: the Sell line names the price it will
  actually pay for the whole lot. A *wanted* category saturates at half
  the rate — the station keeps wanting.

#### 3.20 Hauling: buy low, sell high (Brian)

- Every port **buys and sells** ore, alloy, salvage, and biomass;
  hydrogen is bought only at a port that serves a gate (Station Two) and
  sold anywhere. Buy price = sell price × `buySpread` 1.25 at that port,
  so a same-port round trip always loses and the profit is in the
  divergence between ports (3.11's biases, moved by 3.12's saturation).
  **Buy** lines on the transporter and landed menus: "Buy ore. 0.20 a
  unit here, 4,000 credits fills the hold." — Enter buys as much as
  credits and the hold allow, in one go, and says the result. Bought
  goods are just cargo; a haul is: buy where the word is *low*, fly,
  sell where it's *high* — or *wanted*, for favor — F4's last-seen memory
  being the planning tool. The planet-to-station biomass run is the
  first haul every pilot learns (3.19).
- Bought ore in the hold delivers on the delivery run exactly like mined
  ore would — except the delivery run has no hauling (its sector has one
  port and no Buy line), so the shortcut doesn't exist there.
- Test: a full loop (buy at Meridian, sell at Two) makes money when the
  biases oppose and loses it same-port; a biomass run from Planet A to
  Meridian pays credits and favor; saturation from a big sale is audible
  on the next Sell line; the hold cap holds.

#### 3.23b Control — investment, levels, production (A.6 second pass; direction, not yet a build spec)

Deferred out of 3.23 (it needed 3.11's wants), then rethought by Brian
in ideas9 before it was ever built. What's settled: **favor unlocks
benefits; control is earned by investing** in a station or planet, and
pays back as **passive production** — the resources a base needs,
collected without micromanagement. The pieces, in the order they'd
build once the questions in Part C are answered:

- **Station levels**: `PORTS[name].level` 0..`stationLevelMax`; donating
  `stationLevelOre` 15,000 ore (3.33's Donate line, with a second
  choice: "for favor" or "into the station") raises it by one. Level
  is spoken at the hail ("Station Two, level 2.").
- **Production units**: each resource a port produces (3.11's `serves`
  and a new `produces` list) has a unit making `produceRate[res]` per
  play-hour into a **holding bay** capped at `bayCap[level]` — it fills
  and stops. Collected by the pilot within transporter range ("Holding
  bay: 40 hydrogen, 12 biomass. Collect?") — the tithe, in its new form.
  Bigger bays at higher levels mean fewer visits; automated shuttles
  that collect for the pilot are later (Phase 4).
- **Control** itself is what the pilot's investment share of a port's
  levels is — the measure union play (Phase 4) counts; whether it also
  erodes, and to whom, is open (Part C).
- **Where**: not in the home quadrant. Brian wants the second quadrant
  to be where every POI **produces two things and wants two things**, so
  a trader earns by travelling. That is the same quadrant 3.22 specs as
  the port-less Frontier — one of them has to give (DECIDE, Part C).
- Placed here, after 3.20, because Buy/Sell, wants, hydrogen, and
  biomass all have to exist for production to have anything to produce.
- **Supply chains, cut-off quadrants, and investing in planets (Brian,
  ideas11.txt, 2026-09-05 — proposed, awaiting Part C).** Brian's
  questions, with how each lands on what exists: (1) *How many stations
  in a 3×3×3 lattice, how many for a union?* — at two stations a
  quadrant (A.10's template) that is about 54; ideas9's "10 controlled
  stations form a union" is then roughly a fifth of the galaxy, a corner-
  to-corner run along one face. Fine as a first number; it is a CFG
  value the moment unions exist. (2) *Supply chains* — fit 3.11's
  `serves`/`wants` plus this item's production directly: a station's
  production units need their inputs (biomass from its quadrant's
  planet, ore from its fields) and stall without them, so a chain is
  quadrant-local first and cross-quadrant only through the pilot's
  hauling (3.20) or, later, automated shuttles. (3) *Do cut-off
  quadrants lose control/favor faster?* — this is exactly what the two
  CFG knobs 3.33 wrote and nothing reads yet are for:
  `favorDecayQuadrantControlled` (0.4) and `favorDecayQuadrantsTouching`
  (0.25) slow decay for a controlled and a connected quadrant; a
  quadrant with no route to any other controlled one is simply the
  un-slowed case — no new rule needed, only the lattice's adjacency.
  **One catch to flag**: under 3.33 favor only decays at Allied or above,
  so "cut off decays faster" cannot touch a Trusted station at all;
  if Brian wants isolation to bite lower, it should erode *control*
  (this item's investment share), not favor — the cleaner reading
  anyway, since control is the strategic layer and favor the personal
  one. **Decided (Brian, 2026-09-05): control.** A cut-off quadrant —
  a controlled corner of the cube with no controlled neighbour along any
  of its edges — erodes the pilot's control there; favor is untouched,
  3.33's rules stand. Under the cube (A.13), "controlled quadrant" itself
  needs a definition: a majority of its stations held — DECIDE.
  **And control exists everywhere, offered only from Q3 (Brian,
  2026-09-05).** Every quadrant's save carries control state from the
  start — NPC unions act in it whether or not the pilot can see it —
  but the Invest line, the tithe, and F4's control readout appear only
  once the pilot has reached Q3 (`profile.controlUnlocked`, set on first
  arrival there). So a pilot who later returns to Q1 or Q2 can invest
  there too, and a pilot arriving in Q3 finds control already contested
  — ideas9's "does the computer start with unions" answered by
  construction: yes, and they were working the whole time.
  (4) *Resource-specific quadrants* — A.10's typed fields per
  quadrant and 3.12's price levers already give a quadrant a resource
  identity; the lattice just makes "which ones to get" a map question.
  (5) *Planets the pilot has invested in supplying their station, favor
  without visiting* — passive production shipping itself: an invested
  planet's holding bay empties into its quadrant's station on a timer,
  each shipment paying `favorPerWantUnit` at that station and counting
  as a real interaction (a `touchPort`), so 3.33's "favor is remembered
  by interaction, not by clock" rule holds — the pilot is present by
  proxy. Every number here is direction, not spec, until Part C is
  answered.

#### 3.21 Threat escalation, and its decay (Brian)

- `profile.quadrants[q].threat` 0..`threatMax` 6: +1 each time a combat
  zone is cleared; −1 per `threatDecayMin` 20 play-minutes without a
  clear. A new zone spawns sized by threat: roster size `3 + floor(threat
  / 2)` (capped at 5), class weights shifting toward cruisers as it rises
  (`ZONE_CLASS_WEIGHTS[threat]`), hull × (1 + 0.1 × threat) at Veteran
  and Ace only — Rookie feels the count, not the hardness. Spoken at the
  zone's beacon hail and on the map as a word: light (0–1), moderate
  (2–3), heavy (4–5), severe (6). Salvage scales with what spawned
  (it already does, per kill). The delivery run's zone is always today's
  five. The first zone on a fresh profile is threat 0: three ships.
- A pilot who mines and trades for a stretch finds the next zone easier;
  a pilot who chains fights finds them harder — where a pilot spends
  their hours is the strategic choice (A.9), now in combat's own terms.

#### 3.18 Loot containers and hydrogen (the old 2.8, moved into Phase 3 — the market's fourth good)

- A destroyed ship drops a **container** (target kind `'loot'`): a soft
  intermittent double-click beacon at the wreck's position, drifting at
  `lootDriftSpeed` 5, fading after `lootLifeS` 90. Not Tab-cycled;
  found by ear and by the radar sweep (Shift+R names containers last).
  Fly within `lootPickupDist` 100 and **V** collects it: "Container:
  40 hydrogen." Contents from `LOOT` by class: interceptor 10–20
  hydrogen, corvette 15–30, cruiser 40–60 plus one alloy in three.
  Uncollected containers are lost on leaving the encounter.
- **Hydrogen** is the seventh resource line (F3), persistent like
  salvage and alloy (`profile.resources.hydrogen`), sold at any port and
  bought at a gate station (3.20), cargo weight 10 (3.14), the gate's
  fare (3.22), and what a gate station wants (3.23). The
  hydrogen-extractor module (mining ticks yield it) waits for Phase 4.

#### 3.13 Salvage gates and the drone swarm (A.9) — as written, with 2.17 in mind

- `MODULES` entries gain optional `salvage` and `alloy` costs on top of
  credits; the first: `cargo_bay` needs 3 alloy (3.14), shield plating
  needs 4 alloy, the missile rack needs 3 salvage, the three range
  modules (3.23) need 2 alloy each. "Need 2 more salvage" refusals name
  the resource.
- **Easy combat**: "Clear the drone swarm" — a third line in the hail
  menu's Missions list (2.17's shell): four drones that never fire, each
  tier faster and jinkier (`droneEvadeTier`). Offered only at Allied,
  costs `easyMissionOre` 2,000 ore to accept, one per port per
  `missionCooldownS` (now on the persistent clock). Pays salvage only —
  the gate for the miner who won't fight.

#### 3.22 The gate and the frontier quadrant (A.13 — Brian)

- **The Jump Gate opens** once any station in the quadrant is at
  **Known** (was Trusted — Fable's push-back on ideas10: with nobody
  starting at 40, Trusted would cost three encounters or 80,000 ore at
  one station, and the fast path Brian wants — one fight, one hold,
  through the gate — needs the gate to open at the stranger gate, not
  past it; confirm, Part C). Before that, 2.6's sealed text with the
  reason: "Gate control: transit lane closed to strangers. Make yourself
  known at a station." After: C within its comms
  range hails it — "Gate control: transit to the Frontier, fare 30
  hydrogen. Confirm?" — Enter pays `gateFareHydrogen` 30 from the hold
  and **transits**: a warp-like flight of `gateTransitS` 12 with the
  gate's own sound (a recording when Brian has one; until then the warp
  engaged loop pitched down under a rising discharge), the quadrant swap
  happening under the sound, arriving `warpDropout` 600 out from the far
  gate, facing away. Every transition-save fires on both sides.
- **Quadrant 2 is the economy, not an empty frontier (Brian, ideas10,
  supersedes "no ports").** Quadrant 1 doesn't trade — its two stations
  keep flat prices, favor, missions, the contract. Quadrant 2 is where
  ports get **prices, wants, and production**: every POI produces two
  things and wants two, so 3.11, 3.19, 3.12, and 3.20 are *built in
  quadrant 2*, hand-authored here (its stations and planets are the
  `PORTS` those items describe; the Meridian/Station Two/Planet A names
  in them are placeholders for quadrant 2's own). Quadrants 1 and 2 are
  **safe** — no control, no rival unions. **Quadrant 3** (Phase 4) is
  where control and the unions' own ships start competing, on the same
  schema. What stays of the old Frontier here: the richer fields and the
  anomaly, below.
- **The rest of the quadrant** — a second hand-authored
  `QUADRANT`: a star, one to three asteroid fields (richer: `cloudOreBudget`
  × 1.5 and iron-rich weighted, the reason to come), one **anomaly** POI
  (A.13: kind `'anomaly'`, placeholder name "the Vortex", a beacon and a
  placeholder hail — "Readings off the scale. Nothing to do here yet." —
  its *instance* is Phase 4's first job, with Brian's vortex set as its
  sound), the gate **back**, and a second gate **onward** that is sealed
  in Phase 3 ("Transit lane uncharted.") — taking it is where the
  galactic map begins (A.13, Phase 4). No stations: no docking, no
  refuel but the core's own regen, no tug — a lost ship in the Frontier
  is towed *back through the gate* to the last trusting port at
  `tugHomeFactor` 2 × the wait (the fare waived; the tug pays). Combat
  zones spawn there too, at the quadrant's own threat.
- What the Frontier is for in Phase 3: the richest mining in the game,
  the first place fuel discipline matters (a full tank is two-thirds of
  the way across; the star's regen is the only refill), the first
  round-trip haul that pays big (Frontier iron → alloy → Station Two's
  shipyard wants it), and the door to Phase 4. Its *mechanics* — the
  anomaly instance and whatever else Brian means by "more mechanics in
  quadrant 2" — are the first thing to spec once Phase 3 has been flown
  (DECIDE, Part C).
- **Per-quadrant state**: `profile.quadrants['home']` and
  `profile.quadrants['frontier']`, each with its own clock offset, threat,
  fields, zone, and ports; the map's first line names the quadrant;
  I says it. Favor and control are per port, so per quadrant by nature.
- Test: the gate refuses before Trusted and names why; transit costs 30
  hydrogen, takes 12 s, and lands 600 out from the far gate facing away;
  the Frontier has no ports and its fields are typed rich; a loss there
  tows back through the gate at double the wait and lands at Meridian;
  both quadrants save and reload independently.

**Addendum — the cube's gates (Brian's question, Fable's answer,
2026-09-05; supersedes the one-gate-hub idea in Part C's ideas11.txt
review).** Under A.13's cube a corner quadrant has **three gates, one
per edge**, and they are the only POIs that do not orbit: each is fixed
on the outer ring in the direction of the edge it serves, in the
quadrant's own frame — the gate to "1 right" on the right, the gate to
"1 above" above the star's plane (an elevated POI; the ear already
copes), the gate to "1 ahead" ahead. `QUADRANT` rows for gates carry
`degPerHour: 0` and an `edge` (`+x`/`+y`/`+z` etc., through one shared
`CUBE_AXES` table); today's single Jump Gate becomes Q1's gate to Q2,
repositioned to its edge. **Arrival is at the matching gate**: leave Q1
by its right-hand gate, arrive at Q2's left-hand gate with Q2's star
ahead — the cube felt from inside. The fare is per edge, as before. The
"one Jump Gate offering three destinations" shortcut is withdrawn: a
menu teaches nothing, a gate you have to fly (or climb) to teaches the
map. Nothing about the gate-opens-at-Known rule changes. **Q2 alone has
a fourth gate** (Brian, 2026-09-05): the cube's only off-axis one, on
Q2's outer ring toward the near face's centre ("1 above, 1 left" in
Q2's frame), leading to the one reachable non-corner cell — a protected
place with a single gate back to Q2 (A.13). Its opening condition is a
DECIDE (favor at Q2's station, or a quest). Not yet scheduled — this is
the shape 3.22 takes when it builds.

#### 3.15 Lazy-load audio — superseded by 2.19

- Promoted into the Sunday phase as 2.19 the moment Brian decided to
  drop `file://` (2026-09-04); there is no base64 fallback to keep, which
  is what made it small enough to do now.

### Phase 3b — verbosity, the journal, the tutorials (after Phase 3 has been flown)

#### 3.16 Verbosity and the journal (A.12)

- A `Verbosity` line in the Sound list: full / brief — brief drops the
  spoken damage numbers, the switch countdowns, and the coaching lines.
- **Journal** on **J** (F5 and F6 belong to the browser): a browsable
  list of the last 30 spoken lines with the game-clock time of each,
  newest first, Escape closes. For when a line was talked over.

#### 3.17 Contextual tutorials (A.12, folds in the old 3.1)

- `TUTORIALS` keyed by first-time events: first sector entry, first hail,
  first refusal at a dock, first transporter trade, first dock, first
  landing, first warp, first sale, first F2/F3/F4, first gate transit,
  first galactic map. Each is three to five spoken steps with an expected
  key, Escape skips, "seen" flags in the profile. The Tutorial menu item
  replays any.

**Open for Brian before 3.10 starts** (DECIDE, Part C): the real names
(ports, unions, the anomaly); whether stations should creep too (fixed
by default); the star's voice (the vortex layers were his own suggestion
for "an interesting 3D space" — he chose to keep them lab-only for now,
so the star gets a plain drone until he says otherwise); and, before
3.22, what "more mechanics in quadrant 2" means beyond the anomaly —
the Frontier is specced as a place to mine, haul, and pass through, and
he has more in mind.

### Phase 3, continued — teaching and hosting (the existing 3.1–3.2)

#### 3.1 Tutorial shell (framework only) — superseded by 3.17

`TUTORIAL_STEPS` `{ say, expect: { key | condition }, then }`; the runner
speaks a step, waits, advances; Escape leaves; a "Tutorial" menu item.
Three steps only (W, Tab, lock) until mechanics settle — the laser change
in 1.9 is exactly why the content waits.

#### 3.2 Hosting, second pass

Fetched audio is 2.19 now. Left here: a service worker for offline play
and a share page. The double-click `file://` build is gone by decision
(2.19) — "offline" means the service worker, not the filesystem.

### Phase 5 — the base, and bases at war (direction only; A.8)

Building the base from the five resources; the base as a resource
generator and home; then the endgame combat sim — the player's station
with small fleets against other bases. Designed when Phase 4 is real.

### Phase 4 — the strategic layer (direction only, no specs yet)

The galactic map, opened by the gate after the Frontier (A.13) · the
first anomaly instance (the vortex storm) · the sun as a hydrogen source
· control into unions (3.23 gives the numbers) · flipping, holding,
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

Decided (Brian, ideas5 and the 2026-09-04 design conversation): the
endgame is base against base (A.8); five resources with price levers and
salvage gates (A.9); the quadrant is a solar system with one active
combat zone, 1–3 drifting clouds, depletion, respawn, 2–3 stations with
their own markets, planets as second markets, game time not wall-clock
(A.10); death is a tug ride with credit and influence levers, never
crippling (A.11); F2 ship, F3 resources, F4 trading, multiple contextual
tutorials, a verbosity setting, a journal (A.12); warp clips overlap by
0.5 s each end and the jumps shorten to 8.5–11 s with the first leg 11
(2.10); the sound lab holds every generated sound and the lock-tone
candidates (2.11); slots 1 and 2 are the two laser families with all
eight versions aboard, 1 cycles forward, Shift+1 back, each version 10 %
over the last, same switch time and clip (2.12); the ship's six
attributes, battery as a flat fraction (A.12); NOT Newtonian — the
stabilizers stay automatic and cost reaction mass, empty is battery
mode (2.14); even the most mining-focused pilot fights a little, via
easy no-return-fire missions that only a friendly station sells for
mined resources (3.13); escort and defend missions are in the demo
(2.17); alloy from iron is the sixth resource (2.15); lazy-load and the
profile version move up (2.18, 3.15); Sunday 2026-09-06 is the demo
target, with 2.16 and 2.17 the first to drop if it slips.

Decided (Brian, 2026-09-04, after seeing `audio_assets.js` at 3.8 MB):
recorded audio is served as files and fetched, not embedded as base64;
**`file://` support is dropped** — the game runs from GitHub Pages and the
local dev server only; do it now, before the rest of Phase 2, because he
is collecting more audio, ambient music included (2.19). Accepted by
default there: serve MP3 and keep the WAV masters; lazy-load everything
outside a boot preload list; a Music bus and Sound-menu line ready for
the first track; the audio folders get committed.

Accepted by default (say otherwise), ideas5: the hail/land split — hail
for rearm, selling, buying reaction mass, missions, prices; land for
modules, lasers, repair, the free refill (2.14); braking as a reverse
thruster at half thrust (2.14); collision repair is the only paid repair
(2.14); the tug replaces the delivery run's restart-from-scratch (2.16);
lock-tone candidate A ships as the default until Brian picks (2.11);
the delivery run keeps a fixed layout while the open campaign gets the
moving world (A.10); beacons audible within 8,000 by default once the
quadrant has ten points (3.10); salvage collected on the kill for now,
containers later (2.15); J for the journal (3.16).

Decided (Brian, the Phase 3 questions, night of 2026-09-04, three
rounds): Phase 3 is **the world and its markets** — 3.10–3.14 plus the
old 2.8 (now 3.18) — with verbosity, the journal, and tutorials as a
Phase 3b after it has been flown; the first quadrant is
**hand-authored** (a `QUADRANT` table like `SECTOR_POIS`) with only
combat zones and asteroid fields spawning by the rules, and the
delivery run keeps its own fixed sector; **planets are ports you land
at** — market and fuel, no shipyard; the **vortex stays in the sound
lab** for now; every category is **bought and sold at every port** so
hauling is an income (hydrogen sell-only until the gate); combat zones
**escalate with play and decay** one step per 20 play-minutes without a
clear; the quadrant **saves on every transition** plus a 30-second timer
in open flight, never mid-encounter; **fields are typed** (ice-rich /
iron-rich / mixed) and say so; the **map is grouped by kind**; the
names are **placeholders** until he chooses.

Accepted by default (say otherwise), Phase 3: stations hold station,
planets creep at 6° per play-hour; the star sits at the origin and is
audible everywhere; Station Meridian stays the first port's name;
hydrogen is persistent like salvage and alloy; F4 remembers the
last-seen prices at every other port, dated in play-minutes; a planet
restocks nothing (no armory) and gets a synthesized wind bed until a
recording exists; buying at a port lowers its saturation; the first
zone of a fresh profile is three ships; Rookie feels escalation as ship
count only.

Decided (Brian, the station-game additions, night of 2026-09-04, three
more rounds): stations are the gate to the macro game and each **serves**
a POI; **two meters** — favor (0–100, tiers gate comms / transporter /
docking / Allied) and control (a contested share bought with the
resources a station wants once Allied, eroded by named NPC unions at 1
point per play-hour, controlled at 51 %); control gives **reach, free
docking, a tithe, and the union count**, quadrant-wide comms once every
station in the quadrant is held; the **three ranges** are talk / hand
over / land (comms: prices, wants, accept missions; transporter: turn
in, sell, buy, rearm, invest; docking: repairs, refits, shipyard), each
gated by a favor tier; **Meridian starts Trusted**, everyone else
Unknown, and the tug goes to the nearest port that will dock you (double
the wait home if none); **biomass exists now** as a plain good planets
sell and the station serving that planet wants most; favor **decays
slowly** with absence (and falls on failure); the gate opens **in Phase
3 once one station trusts you**, for hydrogen fare; **Quadrant 2 is a
frontier** — no ports, richer fields, one anomaly, a gate back, a sealed
gate onward — where the next mechanics live; the **galactic map opens
only at the gate after Quadrant 2**; anomalies are **specified as a kind,
none built** yet; ranges grow by **shipyard modules and favor tiers**, no
achievements yet.

Accepted by default (say otherwise), the station game: tier thresholds
10 / 40 / 70; favor never decays below one tier under the highest
reached; the tithe is 20 credits and 2 units per play-hour, banked and
collected on any hail; a wanted category saturates at half the rate;
Allied's price break is 10 % both ways; the gate fare is 30 hydrogen and
the transit 12 s; the Frontier's fields are half again as rich and
iron-weighted; a Frontier loss tows back through the gate, fare waived;
the transporter has its own shimmer cue; docking denied names the way
in; the range modules cost 2 alloy each.

Decided (Brian, ideas7, 2026-09-05, from flying the 3.10 build, three
rounds of questions): the escort's partial reward scales with the
**freighter's hull remaining**; laser versions become **earned tiers,
worn by use** — bought at the station with credits and alloy, +20 % a
level to 5 then +10 %, 1 point of health per burst, a level lost at
zero, repaired only at the station; the repair crew is **standard on
every ship** and works **automatically in a fixed priority** — the
module is the upgrade; the timed contested-zone-then-mining route lives
**in both places** — the fixed Delivery run stays, and the quadrant
gains a timed contract with its own best-time log; Sell ore is blocked
**everywhere** while a delivery is pending; kill buffs are **missile
resupply, laser boost, and shield top-up**; the **cargo hold** joins the
seven damageable systems; only **missiles on the hull knock systems
out, 40 percent**; ideas7 builds **before 3.23**, small fixes first.

Accepted by default (say otherwise), ideas7: escort 180 s, three waves
of three Drones at 20/70/120 s, strikes 8, a freighter shield pool of 60
regenerating 1.5 a second; Defend keeps two waves of three and gets the
same shield and strikes; kill buffs at 35/35/30 percent, one per kill,
the laser boost 25 percent for 30 s extending not stacking; level N of
a laser costs 200 x N credits and N alloy; wear 1 per burst, repair 2
credits a point times the level, wear spoken at half and a quarter; the
knockout weights in the 3.27 table; the base crew 90 s to half and 90
to full, the module halving it, a second tier to 30/30; repair_crew.wav
on every start, a chime at half; the contract pays ore price plus 200.

Decided (Brian, ideas_crazy_7 and ideas8, 2026-09-05): of the ten lab
suggestions, **only the five he bracketed are built** — the position
explorer (L.1), the flyby with his eight propeller recordings (L.4),
the per-vortex 3D vortex (L.5), the room with his solo-then-turn-then-
test flow (L.8), and the lighthouse gate (L.9); the localization game
is **out**; the galactic map (not the quadrant map) is **3D, with
elevation meant to carry strategic weight**, browsed by a sound cursor
you steer to a quadrant and warp to (A.13); the room's turn is **spoken
before the spin, 90° either way**, its positions and its solo order
**randomised every run**, its questions **on-screen multiple choice**;
in the vortex, **Left/Right stays the shared speed**, the bracket
offset **slides the orbit centre toward you**, **R resets** and every
change **reads the whole vortex back**; planes **1–4 loop on set
routes**, **5–8 are one-shot stunts fitted to their length and rotated
through**; the gate is built **for the game and the lab, a 10-second
sweep, `space_station6.mp3`**; the ten station recordings are **applied
down the list to every station, existing ones included**, swapped on
his word; the **ship page** is the full component reference with
headings; the **tractor beam** is Z, range 500, a core to 300 in 10 s,
nothing on large or huge, barely on mediums, not on the ship at start
but fitted for testing; and the order is **the lab round first, then
its three game items, then 3.28**.

Accepted by default (say otherwise), the lab round: explorer steps of
45° / 30° / 100 with Shift for 15° / 10° / 25, the corvette loop as its
default voice, Enter as a stand-in "select"; vortex sway 0–200 and
offset clamped to radius − 20; the four routes and four stunt shapes
named in L.4, laps of 12–20 s, no Doppler; the room's five sounds
(generator, beacon, crackle, pump, radio) at 0.08, solo at 0.35 for 3 s,
distances 120 / 200 / 300, a 1.5 s turn, three questions (two "where is
X", one "which is closest"); the gate cone 60° / 180° at an outer gain
of 0.15, never silent; station 1 for Meridian, 2 for Station Two, the
next unused number for each new station; the tractor's pull of 20 / 4 /
0 by size with 0.5 velocity damping, hold at 300 = `vacRange`, a 600
credit + 2 alloy module, `tractorTestFit` on until heard; **Z becomes
the tractor and the zone cycle moves to Shift+Z**.

**DECIDE** (open, from the lab round): what elevation *means* on the
galactic map (a Phase 4 question — A.13); the tractor's higher tiers
(what a tier-2 and tier-3 beam move, and their prices) once tier 1 has
been felt; which of the ten station recordings ends up where, after
Brian has heard them in place.

**DECIDE** (open): the real per-tick damage numbers for each laser — set by
Brian's ear after hearing each recording against its profile; the code
ships placeholders. The per-slot switch delays (three tie at 1.4 s) —
Brian hand-sets them in `SLOT_SWITCH` after hearing them. Nothing open
from ideas4 — all three follow-up questions were answered. From ideas5:
the lock tone (Brian picks in the lab, 2.11); whether shields should
also drain slowly while raised with nothing hitting them (today they
only drain by damage absorbed — one number if wanted); the hail and dock
ranges once the approach has been flown with reaction mass (2.14).

**Decided (Brian, ideas9, 2026-09-05 — answers to Fable's review of
Phase 3 as built, plus new direction):** sale favor is **500 ore per
point** ("if you saw that big of a favor jump"); missions pay **twice**
the favor; clearing the Contested Zone **does** pay favor at the nearest
station; the delivery run **keeps** the new 2000/600/150 ranges; the
contract's three calls (mining not gated on the zone, whatever's in the
hold counts, walking away is free) stand; each station's missions
**follow what it serves** (3.11); a new quadrant is entered by picking an
encounter at once, and beating its combat zone opens **quadrant-wide
comms**; ore can **always be donated** for favor, per station; favor has
a **fifth tier, Honored at 90** (+50 % ranges, 25 % off purchases, decay
halved) and Trusted/Allied widen the ranges 25 % / 50 %; **favor never
goes below 40**; docking needs a **full stop**; reaction mass is looted
from kills, drawn from dust, and paid by missions, sized so a clean
delivery run stays off battery and a sloppy one doesn't (3.32); the
lab's four demos change as L.1b/L.4b/L.5b/L.8b say; **Control is
rethought** as investment → station levels → passive production into
holding bays (3.23b), unions at 10 controlled stations gating the base.

**Decided (Brian, ideas10, 2026-09-05 — answers to the eight):** (1)
Trusted is permanent, and **nobody starts at 40** — Meridian included.
(2) Decay doesn't start until Allied (70); it only ever pulls Allied/
Honored back toward Trusted. (3) A stranger can donate from comms; the
stranger gate is one combat encounter or a full 20,000 hold —
`donateOrePerFavor` 2,000, `favorZoneClear` 16, so both land exactly on
Known. (4) Three quadrants: 1 no trading, 2 the economy (ports, prices,
production, safe), 3 control and rival unions (Phase 4) — 3.22 and 3.11
rewritten accordingly. (5) Control can be lost, mostly to *simulated*
rival unions running their own ships on missions and mining, not to a
timer — quadrant 3, Phase 4. (7) The Honored discount covers repairs and
reaction mass too. (6) and (8) unanswered — below.

**DECIDE** (still open):
- The gate opens at **Known** (Fable's push-back, written into 3.22):
  with nobody starting Trusted, a Trusted gate would cost three
  encounters or 80,000 ore before quadrant 2, and the one-fight-and-a-
  full-hold fast path Brian wants needs Known. Confirm, or name the
  tier.
- Honored's bonus items (6): Phase 4 unless Brian names one.
- From earlier rounds (8): 3.26's single health per laser family with
  repair priced off the owned level; the tractor's test-fit flag; Rookie's
  ×2 laser against ships; the repair-crew knockout chance and weights —
  all answered by flying, not by asking. Everything since 3.24 is
  unheard; 3.33/3.34/the lab pass/3.32 are the last round before that.
- Quadrant 2's roster: how many stations and planets, and what each
  produces and wants — needed before 3.22 builds. Fable will propose one
  (a star, two stations, two planets, a gate back and one on, rich
  fields, the anomaly) unless Brian hands over names and pairs first.

**A label collision, for the record:** the block above is labelled
"ideas10" because Brian answered the eight questions in chat before any
file of that name existed. The FILE `ideas10.txt` (2026-09-05, 14:26) is
a different thing — seven notes from flying the Round 25/26 build,
written into Phase 3 as 3.35–3.40 and referred to everywhere as
**ideas10.txt**. "ideas11" is the chat correction about the home station
(folded into 3.33) plus the "Be the Way" lab note (L.10).

**Decided (Brian, ideas10.txt, 2026-09-05):** pilots start with 100
credits; the tug rush is repeatable; the repair crew works the hull;
decoys get an outcome sound; auto-target exists, on Shift+T, in tiers,
the fastest (2 s worst case) first with a test fit, from a limited pool;
the first screen speaks and repeats at 10 s then every 20 s; the lab
links home.

**DECIDE (open, from ideas10.txt)** — each built (by Sonnet, Round 26) as
Fable read it below, flagged here for Brian to overrule once he's flown
it — none of ideas10.txt has been heard yet:
- **"Can shorten that 2x"** (3.35) is read as *twice*: two 50-credit
  payments, each halving what's left. If it meant "one payment, 2×
  shorter," today's once-only fee already does that and only the 100
  starting credits change.
- **Shift+T is rebound** (3.38) from cycle-back to auto-target; Shift+Tab
  keeps cycle-back. Say so if Shift+T should stay and auto-target go
  elsewhere.
- **Auto-target holds for 5 s** after acquiring, tracking a moving
  target, rather than one slew-and-release — an orbiting cruiser was the
  whole problem, and a one-shot slew wouldn't have fixed it. 3 charges a
  sortie, 3 shipyard tiers at 6/4/2 s, a kill-buff roll for a charge —
  all placeholders.
- **Hull repair** (3.36) — Brian agreed the five readings and adjusted
  this one: the hull repairs at **half** the system rate (~6 minutes to
  full at stock, `repairHullFactor` 0.5) and **spends reaction mass**
  (`repairRcsPerPoint` 0.2, stopping at a 10-unit floor so the ship can
  always still turn). Still no cap; collision damage the crew repairs is
  still billed at the next landing. **Decided (Brian): all repairs spend
  reaction mass** — 3.27's system repairs too, at the same
  `repairRcsPerPoint` and the same 10-unit floor. Built this way — see
  the 3.36 DONE note. Nothing open on 3.36.
- **Decoy confirmation comes at the pop, not the press** (3.37) — "Decoy
  took it." a second after the launch. And: it is possible decoys are
  simply broken; the build proves it first.

**Review (Fable, 2026-09-05) of Brian's `ideas11.txt`** — five concepts,
checked against what exists. Brian's own worry: "I am starting to get
ideas that might contradict what we have." Verdict: **nothing here
contradicts the build; two things contradict the *spec* and both
resolve cleanly**, one push-back, and a handful of readings to confirm:
- **No-sound test mode** → fits; written as **3.43**, unsaved on purpose
  (a saved "everything off" would persist into Brian's own profile in
  the same browser). Build it first — it makes every later test quiet.
- **The flight course** → fits everything (beacons, the tick, auto-
  thrust, the run log — no new machinery). **Push-back**: it belongs in
  the game, not the lab — the lab has no ship, and Brian's own words
  ask for "the same controls and environment." Written as **3.41**, a
  mission-menu item. It is also 3.17's flight tutorial in playable form.
- **The 9×9×9 / 3×3×3 lattice** → the one spec contradiction, and it
  resolves: ideas10's three quadrants (1 no trading, 2 economy, 3
  control) are the three quadrants of ONE lattice edge — cells 0, 3, 6
  of the home route — so nothing specced for them changes; the other 24
  are Phase 4/5. Gates are lattice edges (3 at a corner, 6 at the
  centre); waypoints between quadrants take over the Frontier's old
  "anomaly"; the cursor is L.1b's grid exactly, route-locked. Written
  into A.13. "Eight opponents at the corners" collides with ideas9's
  open "does the computer start with two unions?" — Fable's answer:
  eight is the ceiling, the count is a difficulty setting.
- **Supply chains / cut-off decay / planet investment** → fit 3.11 +
  3.23b, and the cut-off rule turns out to be exactly what
  `favorDecayQuadrantControlled`/`QuadrantsTouching` (written unread in
  3.33) already are. **One catch**: 3.33 only decays favor at Allied or
  above, so isolation can't touch a Trusted station — if it should bite,
  it should erode *control*, not favor. Planet shipments count as
  interactions, so 3.33's absence rule holds. Written into 3.23b.
- **Escort in formation** → not a contradiction, a mode: the freighter
  already moves (`missionEscortSpeed`); formation makes the leg station-
  keeping on an audible hull, which is what escort means. Fable thinks
  yes, it would be better — with one catch, aiming (nose-on lasers vs.
  arrows that now move position): nose outward by default, 3.38 on top.
  Written as **3.42**, a toggle, an experiment after Brian has flown 3.38.

**DECIDE (open, from ideas11.txt)**:
- 3.43: URL flag + `poke`, unsaved — enough, or also a Sound-menu
  "Everything" line (saved, with the risk above)?
- 3.41: in the game as a mission-menu item, not the lab — confirmed?
  Eight gates, radius 150, four audible, +10 s a miss — first numbers.
- **Decided (Brian, 2026-09-05): Q1 is a corner; cut-off erodes
  control, not favor.** And the lattice became **the cube** (A.13): a
  3×3×3 whose eight corners are the quadrants, the twelve edges the
  routes, one waypoint per edge, more stations per quadrant. **What the
  cube changes in the spec** (Fable's impact list, for the record):
  - *3.22 (the gate and Q2's skeleton)*: one Jump Gate POI per quadrant
    is enough — it offers the corner's three edges as destinations (the
    galactic map in 3D is that same choice, browsed by ear), rather than
    three separate gate POIs; the fare is per edge. Q2 is one of Q1's
    three neighbours, Q3 another, not cells along one route.
  - *3.10/3.11 (the quadrant, ports)*: `QUADRANT` becomes
    `QUADRANTS[id]`, one hand-authored row set per corner with its own
    station count (four to six, not two), star, field mix, signature
    recording; `PORTS` keyed per quadrant. Favor is already per port per
    quadrant; the map, the tug, `nearestTrustedStationTo`, the contract's
    Meridian-only gate all already iterate stations by name, so more
    stations is a data change, not a code one — the exception is
    anything that assumes "the other station," which nothing does since
    3.10's two-station fixes.
  - *3.23b (control)*: gains **quadrant control** — a corner is
    controlled when the pilot holds a majority of its stations; cut-off
    erodes it; a union (ideas9's ten stations) becomes roughly two whole
    corners. The centre reserved for A.8's base.
  - *3.21 (threat)*: per quadrant as written, nothing changes.
  - *A.13's galactic cursor / L.1b*: simpler — three positions an axis,
    corners and midpoints only, one press a corner, Shift a midpoint.
  - *The Frontier's anomaly* lives at a waypoint, one per edge at most.
  - *Distinctness* is now a hard requirement, not a wish: eight
    quadrants Brian can tell apart blind, each with its own recording
    on the beacon and its own field/station mix. That is the single
    strongest argument for eight over twenty-seven.
- **Decided on the cube (Brian, 2026-09-05)**: stations per quadrant
  are unique, part of each corner's character; the centre is for bases;
  faces and centre unreachable for now; control exists in every quadrant
  from the start but is offered only from Q3 (3.23b); coordinates are
  spoken vertical-lateral-depth with zeros unspoken — "1 below, 1 left,
  1 behind" is home (A.13); gates are three per corner, fixed, placed in
  their edge's direction, arrival at the matching gate (3.22 addendum).
- **Fable's two push-backs on the cursor (open)**: (1) Brian's example
  starts the cursor at the **origin** (the centre) and walks Left, Down,
  S to reach home — but the centre is unreachable and isn't a quadrant,
  so opening the map there puts the cursor on nothing, spoken as
  nothing. Proposal: the galactic map opens with the cursor **on the
  quadrant you are in**, speaking its full coordinate ("1 below, 1 left,
  1 behind"), and the words stay relative to the centre exactly as Brian
  framed them — his example reads as the vocabulary, not the start
  position. If the origin really should be the start, it needs a word
  ("Centre.") and a reason to stand there. **Brian's follow-up: what if
  the start is the centre of the facing plane, and from there 1 right,
  then 1 down — is that a corner?** Yes. The default view is over the
  pilot's shoulder — the near face is the "behind" face — so its centre
  is (0, 0, −1), spoken "1 behind". Right → (1, 0, −1), the midpoint of
  that face's right-hand edge, a waypoint: "1 right, 1 behind". Down →
  (1, −1, −1), all three nonzero: a corner, "1 below, 1 right, 1
  behind" — home's right-hand neighbour (Fable's proposed Q2). Left
  then Down reaches home instead. From the near face's centre every one
  of its four corners is exactly two presses; the far face's corners are
  four; a depth-edge midpoint three. Fable's read: **this is a good
  start position** — the centre of what you're looking at, every home-
  face corner two presses away — better than either the cube's centre or
  the current quadrant, and it resolves push-back (1) if Brian confirms
  it. It needs one rule: a face centre is a **view position, not a
  destination** (faces stay unreachable for travel) — the cursor may
  stand on any of the six face centres and step from one to its four
  edge midpoints, but Enter there says "Not a destination."; the cube's
  own centre is never a cursor position. So the valid cursor cells are
  the 26 non-centre cells, moves are between adjacent valid cells along
  an axis, and travel happens only from a corner (later: a waypoint).
  (2) Step size: with cells at
  −1/0/+1 an axis, **one press moves one cell** — corner to midpoint
  (the waypoint, spoken with that axis silent: "1 below, 1 behind"), a
  second press to the far corner. No Shift step needed; Fable's earlier
  "one press a corner, Shift a midpoint" is withdrawn as the more
  complicated of the two. Off-route directions refuse ("No route.").
- **Decided (Brian, 2026-09-05): the near face's centre is the one
  reachable non-corner, from Q2 only** — a protected place beside home
  with no route from home; Q2 gets the cube's only off-axis fourth gate
  (A.13, 3.22 addendum). Fable's check: it works, because a face centre
  is two cells from every corner, so the route is a spur, not an edge —
  which is exactly what makes it gate-able from one quadrant alone. The
  cursor's "face centres are view positions" rule gets this one
  exception (Enter travels there only while in Q2). **Open**: what the
  place IS (Fable: the pilot's mid-game harbour — storage beyond the
  hold, a free yard, saved things — with the cube's centre staying the
  endgame base); what opens Q2's fourth gate (favor tier at Q2's station,
  or a quest); whether rivals can ever enter (Fable: no — the door is the
  pilot's, which is what "protects home" means in play).
- **Still open**: which neighbour is Q2 — Fable proposes "1 right" (the
  first natural move on the face you're looking at), Q3 "1 above", "1
  ahead" later; the majority rule for quadrant control; opponent count
  as a difficulty setting with most corners unaligned; whether L.1b in
  the lab adopts the same below/above, left/right, behind/ahead words
  (Fable: yes, one vocabulary).
- 3.42: Shift+F for formation; up/down as standoff distance (angle
  already rotates); nose outward by default; `spaceship_cruiser_2r` as
  the freighter's voice — any of those wrong? Build it before or after
  the lattice work?
- Order, Fable's proposal: **3.43 now** (before Brian's playtest, so
  the tests are quiet) → Brian flies everything since 3.24 → 3.41 →
  3.42 → quadrant 2 as ordered. The lattice and supply chains stay
  direction (A.13/3.23b) until Phase 4.

**Review (Fable, 2026-09-05) of Brian's `ideas12.txt`** — nine notes
from flying the Round 28–31 build, written into Phase 3 as 3.44–3.51 and
L.5c. Fable's push-backs, gathered:
- **The flight course numbers (3.49) don't work together.** Closer gates
  (600→400) AND a bigger trigger (150→250) let a pilot who never turns
  clean most of the gentle course — a 25° turn over 400 units only
  offsets the next gate ~169 units, inside 250. Proposal: spacing 400,
  radius 200, turns 35–45° (offset ≥ 229, so straight flight misses).
  Or keep Brian's exact numbers as a true beginner course and add a
  sharper second one. **DECIDE.** Everything else in 3.49 (chimes, the
  made/missed tally, the rank against best) is as asked.
- **B for the tractor (3.44) costs the one-key beacon toggle** — beacons
  become a Sound-menu line, five keys from flight instead of one. Fable
  accepts (Brian chose B on purpose, and the quadrant's distance cutoff
  already tames beacons) and flags it; **Z goes unbound** — say if Z
  should take something.
- **Tractor tiers (3.44)**: three tiers, `tractor_2/3` as modules, tier
  3 moves anything slowly; Shift+B steps DOWN with the `laser_switch5`
  clip and B refused during it (1.14's mechanism); **no wear** — it
  isn't a weapon. Numbers are placeholders.
- **Slots 3–6 (3.46)**: verified — four new families of eight are on
  disk. The missing piece Brian didn't mention: **no way to put a laser
  into an empty slot exists** — the shop sells levels, not families.
  3.46 adds "Fit [family] in slot N" (300 credits + 1 alloy). The four
  profiles (rugged mining / fast fighter / rotary cannon / burst plasma)
  are Fable's proposal — jobs chosen so no two families overlap.
- **F2's laser switching (3.48)**: the switch clip plays but with no
  delay/refusal, since F2 is frozen sim — the delay models hardware
  mid-fight, not choosing at leisure. Say if it should wait.
- **The stats page (3.47) is not scheduled** — Brian said to discuss.
  Fable's read: the Sound Lab is the precedent (a real page, reached
  from the menu, Back returns), the profile in `localStorage` is the
  data with no export step, and the real work is the counters that
  don't exist yet (kills, ore mined, credits earned, deaths, distance).
  Five questions in 3.47.
- **Five volume steps (3.45), the offline buzz (3.50), Y for totals
  (3.51), the vortex presets (L.5c)**: as asked, no push-back. 3.45
  needs a one-time index remap of saved sound levels
  (`PROFILE_VERSION` → 8); 3.51 needs a `y` pass-through in every
  captured-input menu, which is the point of it.
- **Order** (Fable): 3.50 → 3.51 → 3.45 → 3.49 → 3.44 → 3.48 → 3.46 →
  L.5c, cheapest first, all before 3.42 and quadrant 2 — these are play
  feedback on what's built. 3.47 waits for the discussion.

**Decided (Brian, 2026-09-05, on the review above)**: the stats page is
**read-only**; on the course, "cut my requests in half except the
radius" — spacing 500 (closer by 100), radius 250 (the full +100) — and
the course is a **manual-thrust** drill, since beginners won't use
auto-thrust much and centering by hand is hard (which is what the bigger
radius is for). Fable's condition to keep it a course at all: the gentle
turns rise to 35–45°, so 500·sin θ > 250 and flying straight still
misses — written into 3.49.

**DECIDE (open, from ideas12.txt)**: what Z becomes, if anything;
the tractor tier numbers; the four laser profiles and the 300+1 fit
price; F2 switching with no delay; and the five stats-page questions.

**ANSWERED (Brian, 2026-09-06, on the nine questions above)**: 1. work-
based cost, confirmed — 3.52 now specs it that way, with the "under
half of flying it" target hit at ~1.0 rcs for a tier-1 core over its
full stop distance. 2. no gentle-pull rule, no step-down at all —
Shift+B is retired outright ("it will be upgradeable but not
switcheable"), the tier ladder is pure ownership; 3.52 rewritten
around this. 3. confirmed — generalized to every beam tool (laser, E,
V), not lasers alone. 4. confirmed ("they sound fine") — tier 1 keeps
`tractor_beam2`, tiers 2/3/4 take `7/8/9`. 5. **postponed** — folded
into A.13's own waypoint bullet above; no numbers yet. 6. confirmed —
manhattan jumps, gate = direction / map = distance, one hydrogen unit
per cell; folded into A.13 above, not yet built (lands with quadrant
2). 7. no separate approach cue, and "average off centre" is enough —
no second board; 3.53 built to that shape. 8. confirmed as specced —
3.54 built to that shape. 9. **the distress-call tow**, Fable's own
pick, confirmed ("do your recommendation") — see 3.55 below;
`backstory.md` is noted but not folded into A.15 yet ("ignore the
backstory file for now").

**Decided (Brian, 2026-09-07, on Phase 3E)**: Rounds 28–39 ear-tested
"well, no problems so far" — the standing "Brian flies everything since
3.24" checkpoint is passed, tweaks to come as he plays. The next stage
is encounters, each on the main page for testers before it moves into
a quadrant: `ideas14.txt`'s three (the facing cone/cannon 3.58, turret
defense 3.59, the Encounters submenu 3.56) plus Shift+S (3.57) and
Fable's five (3.60–3.64), "all of them, at least to try" — **the menu
first, then the encounters**. Audio arrives as lettered sub-stages.
Brian's tow picture is the OLD 2.1 tether, not 3.55 — kept as 3.60,
3.55 stays as written.

**DECIDE (open, from ideas14.txt)**: 1. **ANSWERED** — it was silent;
a real bug (the live region inside the hidden container), fixed Round
43, see the Phase 3E preamble. 2. The non-numpad map for 3.59b (`Q W E
/ A S D / Z X C` proposed). 3. Whether the 3-zone turret survives once
the 3×3 exists.

**Decided (Brian, 2026-09-07, from playing 3.59)**: the turret's second
pass is **3.65** — score by a sweet spot on the approach, the tone
rising faster as the drill goes on (gently, for now), a second noise
only the shield answers, shields instant (already), a streak shield,
and a debrief with more than points. Fable's six debrief measures are
a proposal (accuracy, timing early/late, best streak, volleys caught,
missiles used, weakest zone) — Brian: "I've no idea how to measure
this," so these are for his ear to keep or cut. Built before 3.59b.

**Open for Phase 4/5 (ideas9, not for now):** the total station count
that makes a 10-station union reachable; whether the computer starts
with two unions the player must break; automated collection shuttles;
what "controlled quadrants touching" means on the galactic map.

## Deferred (Brian: "not yet")

Enemy shields · nebula muffling · full tutorial content · fully inert
systems. (Subsystem damage came off this list with ideas7 — it is 3.27.)

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
