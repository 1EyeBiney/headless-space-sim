# PHASE_PLAN.md — Headless Space Sim, Rounds 11+

Instructions for the implementing agent. Read `CLAUDE.md` first: every rule
there (ear-first, CFG-only tuning, silent testing, one-script combat tests,
help + KEY_DESCRIPTIONS + README in sync, regenerate `space_sim_demo.html`,
commit + push each round) applies to every phase below. Brian decides all
sound; build the mechanics, keep every sound parameter in CFG or a data
table, and report every file change explicitly.

Everything here is decided. Items marked **(Brian: recommendation accepted
by default)** were settled on Claude's recommendation without an explicit
note from Brian; build them as written unless he says otherwise. Decided
2026-09-03: chaff wastes a round when nothing is inbound; the mining scanner
is in; hosting comes first because Brian tests at the GitHub URL from now on.

Work phase by phase, one commit per numbered item where practical, and stop
at the end of each phase for a play-test. Do not start the next phase
without Brian's go.

---

## Phase 1 — Hosted, survivable, repeatable, and a station worth visiting

Goal: the game served from GitHub, a Rookie tier a starting player can
actually finish, a run that remembers itself, and the station as a place
with a menu.

### 1.0 GitHub Pages first (Brian tests at the URL from now on)

- Enable Pages on `1EyeBiney/headless-space-sim`, branch `main`, folder `/`
  (root). `index.html` + `audio_assets.js` are the served game; no build
  step, no moves. Expected URL: https://1eyebiney.github.io/headless-space-sim/
  Confirm the real URL from the Pages settings and put it at the top of
  README.md and in CLAUDE.md. The repo is private; Pages on a private repo
  needs a paid plan, so make the repo public first (Brian intends to share
  it anyway). Ask Brian before flipping visibility.
- New testing rule (add to CLAUDE.md Working agreements): after every push,
  wait for the Pages deploy (about a minute; `gh run list` shows the
  pages-build-deployment workflow) and test at the URL, not file://. The
  double-click `index.html` and `space_sim_demo.html` must keep working, but
  the URL is the reference.
- Because the page is now https, `fetch` works. Do NOT change asset loading
  in this phase; lazy-loading the ship loops is 3.2. The base64 bank stays.
- Add the `?run=delivery` URL parameter now (cheap): it skips the menu and
  starts the delivery run after the Press-Enter gesture. Handy for sharing.
- If a test at the URL shows stale behavior, it is browser caching: hard
  reload (Ctrl+F5, which BROWSER_KEYS already leaves to the browser).

### 1.1 Difficulty tiers (Rookie / Veteran / Ace)

- One `TIERS` table in CONFIG. Each tier is a partial CFG overlay merged
  onto CFG at mission start (`applyTier()`), plus a per-ship overlay for the
  roster (`makeRoster()` reads it). Never hardcode tier numbers inline.
- **Rookie** = current settings except the Cruiser (see 1.2). Enemies passive
  until hit, provoked fuse 4 s.
- **Veteran** = the always-on attack pacing from the first Round 10 build:
  every ship hostile from the start, grace 8 s, gap 7–12 s.
- **Ace** = Veteran + Standard zone default, shield spool 2.5 s, laser miss
  window 12 s, missile magazine 6.
- Tier lives on the mission menu as a "Difficulty: Rookie" line that
  Left/Right adjusts (KC pattern: Left/Right adjust, Enter confirms). Tier
  persists in the profile (see 1.4). The delivery-run log records the tier.

### 1.2 Cruiser easing at Rookie

Brian cannot beat the Cruiser at Rookie: it orbits AND shoots back. Rookie
overlay for the Cruiser:
- `degPerSec` 8 → 3 (still moves, slowly enough to hold in the laser zone).
- hp 150 → 120.
- Attacks only by missile (longest warning), never by laser, even inside 600.
- No evade burst on missile survival at Rookie (it just reports hull and
  retaliates by missile). Veteran/Ace keep the current Cruiser.

### 1.3 Shields rework: bigger, and never destroyed

- Shield capacity ×1.5, expressed as a damage pool **(Brian: recommendation
  accepted by default)**: `shieldPool` 45 points (1.5× a full enemy beam),
  replacing the 10 s hold timer. Shields stay
  up as long as the pilot wants; every absorbed hit drains the pool by its
  damage; at zero the shield drops. While down, the pool refills at
  `shieldRegenPerS` 3. The hold timer goes away. This is what "1.5 times
  larger" and "disrepair" naturally mean together, and it makes the enemy's
  damage numbers matter on both sides.
- **Disrepair instead of collapse.** When the shield drops from damage (pool
  empty) it enters DISREPAIR: a damage-control crew repairs it over
  `shieldRepairS` 12 s. Audible the whole time on the UI bus: a slow ratchet
  or welding-tick loop that speeds up as repair nears done, then a clunk +
  "Shields back online, N percent" at `shieldRepairReturn` 0.5 of the pool.
  The pilot can raise them again at once (with half a pool). Shields are
  never destroyed at this stage; fully inert systems come later.
- Speech: "Shields failing" at 25 % pool (once per raise), "Shields down.
  Damage control on it." on drop, "Shields back online, 50 percent." on
  return. I status reads pool percent.
- Manual drop (G while up) is unchanged and does not trigger disrepair.

### 1.4 Profile + run log (localStorage)

- One profile object (`kbc_profile`-style, key `hss_profile`): tier,
  credits, upgrades owned, chaff count, best runs. Load at boot, save on
  every change. Must survive a missing/blocked localStorage (file:// in some
  browsers throws): wrap every read/write in try/catch, run without it.
- Delivery run log: array of `{ seconds, tier, upgrades, date }`, keep the
  best 10. On delivery: "Run time 6 minutes 12 seconds. New personal best!"
  or "Best is 5 minutes 40." Menu gets a "Run log" item that reads the top
  times line by line (arrows, Escape), same widget as help/map.
- **(Brian: recommendation accepted by default)** — credits and upgrades
  PERSIST across sessions: one ship you keep improving, like a KC profile.
  The run log records the upgrade count so times stay comparable; a "Fresh
  ship" option can come later if leaderboard fairness matters.

### 1.5 No-warp zone

- `warpInhibitDist` 1500: H refuses while any POI is closer than that:
  "Hyperwarp inhibited this close to Station Meridian. Fly clear first."
  with a short refusal buzz. After a station visit the pilot must fly out
  ~1000 before jumping. Distances are placeholders; tune later.

### 1.6 Docking approach (the corridor)

The station is entered by flying a corridor, not by pressing C at 500. This
is deliberately the HARDEST version now; later upgrades (docking computer)
loosen it.
- Calling the station (C within `poiInteract`) now answers "Meridian control:
  cleared to dock. Approach corridor active." and starts the approach.
- Corridor = a line from a point `dockCorridorLen` 800 out to the station
  door, on a fixed heading per station (data on `SECTOR_POIS`). Instruments,
  all UI bus, deliberately NOT HRTF (it is a cockpit instrument like the
  tick):
  - Centerline: a tone panned left/right by lateral offset (off the line to
    the right = tone on the left = turn left, same convention as the tick).
    Dead center = mono.
  - Glide slope: pitch of that tone rises when high, falls when low.
  - Range: a click rate that speeds up toward the door.
  - Speed: over `dockMaxSpeed` 25 inside the last 300 = "Too fast. Abort."
    The approach resets to the corridor entry (no damage at this stage).
- Success: inside `dockRadius` 40 at ≤ `dockMaxSpeed`: docking clunk,
  "Docked at Station Meridian.", the station menu opens (1.7). Ship is held
  in place; thrust keys answer "Docked. Undock from the station menu."
- Speech coaching every ~3 s while in the corridor: "Left 40, high 10,
  range 500" style numbers (round10), suppressed when centered.
- All corridor numbers in CFG. Later unlocks will widen `dockRadius`, raise
  `dockMaxSpeed`, and add an autopilot.

### 1.7 Station menu (the economy)

A KC-style list (same menu code as the mission menu; make it a reusable
`listMenu(items, opts)` so the mission menu, station menu, run log, and any
future menu share one implementation).
- Items: Sell ore · Repair · Rearm · Restock chaff · Upgrades ▸ · Undock.
- **Sell ore**: `orePrice` 1 credit per 10 ore (placeholder). Speaks the
  sale and the balance. Delivery-run handover happens here too (quota met →
  the run is complete when the ore is sold).
- **Repair** / **Rearm** / **Restock**: cost in credits (`repairCost` per
  hull point, `missileCost`, `chaffCost`). In the delivery run, the FIRST
  repair+rearm at the station is free (it is the demo; the clock is the
  cost). Everything else costs.
- **Upgrades** (submenu, each a one-time buy, data table `UPGRADES`):
  shield spool 1.5 → 1.0 s; shield pool +50 %; missile magazine 8 → 12;
  laser cooling window 8 → 5 s; cargo… (cargo has no cap yet; skip until it
  does); docking computer (widens the corridor, Phase 2+). Each upgrade is
  a named CFG override applied at mission start by the profile.
- **Undock**: pushes the ship 100 out along the corridor heading, "Undocked.
  Clear of the station.", back to open sector space.
- Escape = Undock. Every line speaks its price and whether you can afford it.

### 1.8 Countermeasures (chaff)

- Key `D` ("decoy"), **(Brian: recommendation accepted by default)**. It is
  free in flight and sits under the left hand. Menu D still jumps to
  Delivery run; KEY_DESCRIPTIONS says both.
- `chaffMax` 4, restocked at the station. One press spoofs the CURRENT
  incoming missile: it loses guidance at once (existing ballistic coast),
  no shield needed. A bright crackling burst at the ship (UI bus) and
  "Chaff away. 3 left." Useless against beams: "Chaff does nothing against
  a laser. Shields." Pressing with no missile inbound STILL FIRES ONE and
  wastes it (Brian: decided). The burst plays, "Chaff away, nothing inbound.
  3 left." That is the decision under pressure.
- Veteran/Ace enemies may launch a second missile while the first coasts;
  Rookie never does.

---

## Phase 2 — A living sector and smarter enemies

### 2.1 Distress calls + the rescue-and-tow mechanic (new, not combat/mining)

- Every `distressMinS`–`distressMaxS` (120–300 s) of open-sector flight,
  one distress call may spawn at a random point 3000–6000 from the pilot:
  a new temporary POI with its own beacon signature (an SOS pattern:
  three short, three long, three short, on a thin 1 kHz tone), announced
  once: "Distress call. Bearing 40 left. Q for the map." It fades after
  `distressLifeS` 240 if not answered.
- Answering (C within 500) enters the **rescue encounter**, a third
  encounter type beside combat and mining:
  1. A survival pod drifts somewhere within 800, transmitting a WEAK
     intermittent signal that is not a normal target: you cannot Tab to it.
     Its loudness rises and falls with distance only (no panning until you
     are within 250, when it snaps into full HRTF). Finding it is listening
     for warmer/colder while flying. `R` radar does not show it.
  2. Once within 250 it becomes a target. The pod drifts at 10–20; the
     pilot must MATCH SPEED: hold within `towMatchDist` 60 with a relative
     speed under `towMatchSpeed` 8 for 2 s. A speed-difference instrument
     narrates this (a beat frequency that slows to zero as speeds match).
  3. `E` latches the tow ("Tow line secure."). Now fly the pod home: above
     `towMaxSpeed` 60 the line strains (rising creak) and snaps at
     `towSnapSpeed` 75 ("Tow line parted."); re-latch by matching again.
  4. Deliver to within 500 of Station Meridian: "Pod recovered. Meridian
     control sends thanks, and 300 credits."
- This is deliberately gentle flying and listening, the opposite of combat.
  Variants later: a miner adrift (tow a rock core), a freighter under attack
  (combat first, then tow).

### 2.2 Ship classes with different brains

Per-class behavior in a `SHIP_CLASSES` table keyed from the roster:
- **Interceptors** (Raider, Scout): close-range laser attackers. After every
  attack they strafe: a sideways burst (reuse the evade code) so the pilot
  has to re-acquire them. They prefer to attack when the pilot's shields
  are RECHARGING.
- **Corvette** (Drone): pack animal. Attacks only while another hostile is
  mid-attack or within 3 s after one (two threats may overlap for the first
  time; cap at 2 simultaneous, Rookie 1).
- **Cruisers** (Freighter, Cruiser): stand-off. Missiles only, launched from
  ≥ 700; if the pilot closes inside 500 they back away (slow retreat burst)
  rather than fight close.
- Rookie keeps every class passive until hit; classes change HOW they
  fight, not WHEN.

### 2.3 Adaptive commander (enemies that learn from the pilot)

Not machine learning; a small set of tendencies the enemies read and react
to, updated every encounter and saved in the profile, so they remember the
pilot across sessions. Honest name in the code: `commander`.
- Tracked per pilot: mean shield reaction time after a lock warning; share
  of attacks that were shielded; mean engagement distance when the pilot
  fires the laser; laser-vs-missile kill ratio; mean shield hold length;
  chaff usage rate.
- Reactions (each a rule in `COMMANDER_RULES`, all thresholds in CFG):
  - Reacts fast to lock chirps (< 1.5 s) → interceptors start using FEINTS:
    the lock chirps without a beam, 30 % of the time, to bait the shield up,
    then a real attack when it drops or is recharging.
  - Shields most attacks → cruisers time missiles to arrive as shields
    collapse/recharge; corvette packs overlap more.
  - Fights close → interceptors strafe more often and cruisers retreat
    earlier.
  - Relies on missiles → enemies evade harder on missile launch (evade on
    LAUNCH, not only on surviving a hit) at Veteran+.
  - Uses chaff often → enemies launch missile pairs at Veteran+.
- Every rule has an audible tell so it is fair: a feint's chirps are
  slightly detuned; a timed missile launch is announced normally. Speech
  never explains the rule; the pilot discovers it.
- Rookie: commander observes but applies only the feint rule at half rate.

### 2.4 Gas clouds (new POI type)

- "Nebula Gas Pocket Theta" POI with a soft broadband hiss beacon.
  Encounter: 3–5 gas pockets (targets, kind 'gas') with a breathy HRTF
  voice. `V` harvests them like dust, at 2× the dust rate; gas sells at 3×
  ore price. Lasering a pocket ignites it: a flash-bang at its position,
  hull damage 15 if within 200, and the pocket is gone. Missiles do the
  same at any range. The wrong tool hurts.

### 2.5 Asteroid hazards

- A rock moving faster than `rockDangerSpeed` 40 that passes within
  `rockHitDist` 60 of the ship strikes it: hull damage scaled by size and
  speed, a huge scraping crunch (UI bus) plus the rock's own impact at its
  position. A rock closing fast gets a rising proximity warning tone (UI
  bus, panned toward it) from 300 in. Brake or turn away; small rocks are
  the flighty ones, so this is mostly a consequence of missiling a medium
  rock at close range.

### 2.6 Jump gate POI (sealed)

- "Jump Gate Tau" POI with a deep cyclic hum and a periodic charged
  discharge. Calling it: "Gate control: transit lane not yet commissioned."
  Nothing else. It exists so the sector map already has its exit.

### 2.7 Mining scanner (Brian: yes)

- `N` scans the selected rock: a sonar ping from the ship, echo from
  the rock (HRTF), then "Iron. Rich." / "Ice. Lean." A hint, never a number,
  so the hidden thresholds stay hidden.

---

## Phase 3 — Teaching and hosting

### 3.1 Tutorial shell (framework only)

Brian's call: build the framework, not the content, until mechanics lock.
- `TUTORIAL_STEPS`: `{ say, expect: { key | condition fn }, then }` list;
  the runner speaks a step, waits for the expected key or condition, then
  advances. Escape leaves. A "Tutorial" menu item.
- Ship three steps only: thrust (W), cycle (Tab), lock (hold the target
  until the tone goes solid). Everything else waits for Phase 2 to settle.

### 3.2 Hosting, second pass

- Pages is live since 1.0. Now: lazy-load the ship loops (and any new
  recordings) over fetch when on https, keeping the base64 bank on file://;
  a service worker for offline play; a proper share page. The double-click
  file must keep working alongside.

---

## Deferred (Brian: "not yet")

Enemy shields · subsystem damage sounds (no cue design yet) · nebula
muffling · full tutorial content · fully inert systems.

## Test checklist per phase (silent, one script per combat scenario)

- Every new key answers in every mode ("silence is a bug"), including
  docked, corridor, rescue, and the station menu.
- F12 explore describes every new key; F1 help has a section per new
  mechanic; README key table updated.
- `window.__sim.state()` exposes the new state (profile, corridor,
  tow, commander tendencies) and `poke` can force a distress call, set
  credits, and set the shield pool.
- localStorage blocked/absent → game still runs.
- Regenerate `space_sim_demo.html`; commit; push; wait for the Pages
  deploy; re-test at the GitHub URL.
