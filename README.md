# Headless Space Sim

A space sim played entirely by ear. No graphics: the world is 3D positional
audio (Web Audio HRTF panning) and a screen reader's speech. Built by Brian,
who is blind, with Claude Code, as a test of whether browser audio can carry a
full audio-only game.

## Play it

**[Play in your browser](https://1eyebiney.github.io/headless-space-sim/)**
— hosted on GitHub Pages, no download. Add `?run=delivery` to the link to
skip the menu and jump straight into the timed delivery run.

Wear headphones: the whole game is in the stereo image.

Press Enter to begin, then pick a mission from the menu: up and down arrows
browse it, Enter selects, and a first letter jumps to an item. Everything is
announced through an ARIA live region, so a screen reader (NVDA, JAWS,
VoiceOver, Narrator) reads it. Sighted players can follow the small text
status line, but the game does not need it.

## Difficulty

Difficulty on the mission menu is adjusted with left and right arrows right
there on the menu line: **Rookie** (ships hold their fire until you hit
them — the easiest way to learn the controls, and your laser does double
damage to ships), **Veteran** (every ship is
hostile and watching from the moment an encounter starts), and **Ace**
(Veteran, plus a slower shield, a touchier laser, and a smaller missile
magazine). It's saved to your browser and remembered next time you play.

## Run log

The last item on the menu reads back your best delivery-run times, up to
10, fastest first, with the difficulty and date of each — also saved to
your browser. Finish a run to add to it.

## Sound

The Sound item on the menu sets a level — off, quiet, or full — for
three kinds of sound: the world around you (engines, rocks, enemy fire,
explosions, beacons), your cockpit instruments (the lock tick,
thrusters, tools, the shield hum), and sound
effects (clicks, chimes, warnings). Speech is never affected. In the
sector, B cycles the four point-of-interest beacons between on, off,
and only your selected nav target, for stretches of open flying when
you'd rather not hear them — Tab, T, the map, and the lock tick still
find every point. All of it is saved with your profile.

## The timed delivery run (first item on the menu)

The shareable challenge. The clock starts at once.

1. Fly or hyperwarp to the Contested Zone and clear it. Five ships. Each
   one holds its fire until you hit it, then it shoots back. You start
   just outside Station Meridian with a full warp tank, and the zone is
   already your nav target — H jumps you there.
2. Mine 15,000 ore at Asteroid Field Kappa. Laser rocks apart, vacuum the
   dust, extract the glowing cores.
3. Dock at Station Meridian to deliver the ore. Your run time is spoken on
   delivery.

Calling the station works by range: within 500 it hails you back with a
small menu — rearm, sell ore, buy reaction mass, take a mission — and
within 150 it docks you outright. Fly it in by ear — the lock tick and R
(range, closing or opening) are your instruments. Docking repairs your
hull, rearms your eight missiles, restocks decoys, refills the warp tank,
and tops off your reaction mass. You hear a cue and a word as you cross
into comms range and again into docking range; docked, the beacons
outside go quiet and the station's own interior takes over. Undocking
puts you 1000 out, facing away — the drive won't spool within 1500 of
the station, so thrust clear before jumping. Losing your ship no longer
fails the run outright — a tug is dispatched instead, on the clock, and
the run's timer keeps running while you wait.

Once docked, a station menu opens: **Sell ore** trades your cargo for
credits (10 ore per credit), and **Modules** spends them on permanent
upgrades — a faster shield, a bigger shield pool, a larger missile
magazine, a bigger warp tank, faster core cooling. Every module adds a
little mass, and mass is the tradeoff: no friction in space, so a heavier
ship just turns and thrusts a little slower. Escape undocks.

The hail (in range but not close enough to dock) also offers **Missions**:
escort a freighter to Planet Auren, or defend a miner at Field Kappa.
Raiders leave you alone until you hit one — until then they're going
after the friendly instead, whose hull you'll hear called out as they
take hits. Survive the escort's run or clear both of the defend's waves
and the friendly lives, paying credits and a little standing at the
station; lose the friendly and the mission pays nothing. Each mission
goes back on offer a while after you take it.

Thrust and braking both draw on a reaction mass tank, and so do the
automatic stabilizers that quietly cancel your drift whenever you coast —
run it dry and everything gets weaker, never dead. Landing fills it
free; a hail can buy more. Braking is a real reverse thruster now, about
half the push of forward thrust, so slowing down for a landing takes
real distance — and hitting a station or a planet too fast costs hull
that isn't free to fix; the bill comes due at your next landing.

The warp drive has a tank, measured in distance, and a jump spends it —
you need at least a quarter tank to jump at all. A jump longer than the
tank still goes — you drop out where the charge runs dry and thrust the
rest. The tank refills at the station and whenever you leave an
encounter, and recovers slowly in open flight — the ship reports the
core at 50 and 75 percent, and again when it's full; the quadrant map
says whether each point is in range. Expect the legs into the asteroid
field and back to the station to run it dry a little short. The drive
also won't spool within 1,500 of any point of interest, so after a visit
you'll need to fly clear before jumping onward — and which way you fly
out changes how far the next jump reaches.

A jump takes real time — the ship sits still while the drive spools,
then flies the distance in one continuous run, arriving to the sound of
the drive winding down. Longer jumps take longer, up to about 12
seconds. You can still open the mission menu with Escape mid-flight;
the jump keeps going and you'll hear it arrive.

## Keys

Right hand on the arrows, left hand on everything else.

| Key | Does |
| --- | --- |
| Arrows | Yaw and pitch |
| W / S | Thrust / brake. Shift+W toggles auto-thrust — the ship keeps thrusting until you press W, S, or Shift+W again |
| 1-6 | Select a laser slot. Slots 1 and 2 are laser families (mining and rapid-pulse) carrying all eight versions; pressing the slot's key again cycles to the next version, Shift+ the key cycles back. Switching or cycling takes a moment — you hear the mechanism work, longer for the heavier slots — and Space waits for it |
| F2 | Ship status: hull, shields, warp charge, cargo, missiles, decoys, each laser slot with what it's good against, fitted modules, and mass |
| F3 | Resources: ore, salvage, alloy, reaction mass, warp charge, hydrogen, credits, missiles, and decoys, each with what it's for |
| Space | Fire the selected laser. Five ticks over five seconds, fire-and-forget — it can't be stopped once it starts. Harder up close. Two empty bursts overheat it |
| F | Homing missile. Keep the target inside your missile zone for the whole flight |
| D | Decoy. A burst that spoofs the missile coming at you — no shield needed. Four per sortie, restocked at the station; a press with nothing inbound still spends one |
| G | Shields. Take a moment to raise, block enemy fire, weapons offline while up |
| B | Cycle the point-of-interest beacons: on, off, or only your selected nav target. The lock tick still finds every point with them off |
| Tab / T | Cycle targets / report the selected target. Shift+T or Shift+Tab cycles back. The distance is spoken the moment the lock tone comes on |
| R | Range to the selected target, and whether it's closing or opening. Shift+R is the radar sweep of every target, nearest first |
| E / V | Ore extractor / dust vacuum (mining) |
| Z | Target zone size: wide, standard, narrow |
| Q / H / C | Quadrant map / hyperwarp (spends the warp tank by distance) / call a point of interest — hails the station within 500, docks within 150 |
| I | Status: speed, target, hull, missiles, laser slot, shields, warp charge, mission clock |
| X | Leave the mission |
| F1 | Help, read line by line with the arrows |
| F12 | Explore mode: every key describes itself without doing anything |
| Escape | Opens the mission menu over the live game. Resume goes back to the ship; anything else leaves the mission. Escape again also resumes |

## How combat works

At Rookie, every ship is passive until you hit it, and hostile from then
on; Veteran and Ace start every ship hostile. A hostile ship within 600
paints you with three rising chirps from its position and a spoken
warning, then burns a five-second beam that bites once a second. A hostile
ship farther out launches a missile you hear fly in. The answer to both is
G: shields take 1.5 seconds to come up (2.5 at Ace) and hold as long as you
want, but every hit they absorb drains their charge — get them up two
seconds into a beam and only two bites land. Drain them to nothing and they
go into disrepair for a stretch, repaired by a damage-control crew you can
hear working, and come back at half charge; drop them yourself before that
and whatever charge is left keeps recovering. A ship that survives one of
your missiles breaks away hard and hits back within seconds — except a
Rookie-tier Cruiser, which only ever answers by missile and never bothers
with the dramatic evade. Against a missile you also have D, a decoy: the
missile loses guidance on the spot and your weapons stay live — but it
does nothing against a beam, you carry four, and at Veteran and Ace a
spoofed missile brings the next attack fast.

Your own laser burst locks you in too: once you fire, it runs the full
burst and G is refused until it's done — commit to the shot, then
shield.

The mining family bites hardest against iron rocks and cruiser-class
ships, and struggles against ice and interceptors; rapid-pulse is the
reverse. Check F2 for the exact matchup on whatever you have loaded.

Every kill leaves salvage behind, sellable at a station and eventually
needed to fit some modules — even a dedicated miner ends up fighting a
little. Ice cores top off your reaction mass tank instead of ore; iron
cores yield alloy alongside their ore. F3 lists everything you're
carrying and what each resource is for.

## Files

- `index.html` is the game. It loads `audio_assets.js` (the sound bank),
  `audio_engine.js` (the Web Audio primitives), and `audio_cues.js` (the
  named sound-effect registry) beside it, in that order.
- `audio/` holds the source recordings.
- `CLAUDE.md` is the design and working notes.

All tuning numbers live in the `CFG` table and the data tables near the top
of `index.html`.
