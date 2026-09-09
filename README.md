# The Silence

(The working name was Headless Space Sim — the repository and the URL
still carry it.)

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
browse it, Enter selects, and a first letter jumps to an item. The
**Encounters** item holds every self-contained drill and instance — combat
training, mining, the flight course, the escort and defend drills, and more
as they arrive: right arrow or Enter opens that list, left arrow or Escape
returns. Everything is
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
10, fastest first, with the difficulty and date of each, followed by your
best times on the quadrant's own timed contract (see below), and then
your best times on the flight course (see below) — each its own board,
since none of the three compare meaningfully to each other. Also saved
to your browser. Finish a run to add to it.

## Sound

The Sound item on the menu sets a level — off, low, quiet, medium, or
full — for four kinds of sound: the world around you (engines, rocks,
enemy fire, explosions, beacons), your cockpit instruments (the lock
tick, thrusters, tools, the shield hum), sound effects (clicks, chimes,
warnings), and music. The menu also has its own Beacons line, cycling
the four point-of-interest beacons between on, off, and only your
selected nav target, for stretches of open flying when you'd rather
not hear them — Tab, T, the map, and the lock tick still find every
point. Speech is never affected. All of it is saved with your profile.

Music is a real background player, on by default: `[` turns it on or
off, `]` skips to the next track, and shift `]` goes back — shuffled so
every track plays once before any repeat, and it says the title every
time one starts. It works everywhere (the menu, flying, any encounter)
and keeps playing through docking and mission changes. The Sound
menu's own Music line opens a submenu for play/stop, next, previous,
style, and its volume level — volume lives only there, never on a key.

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

Calling the station works by range: within 2000 it hails you back with a
small menu (missions and a status report), within 600 it also reaches
the transporter (rearm, sell ore, buy reaction mass), and within 150 it
docks you outright — the delivery run's own Station Meridian always
welcomes you at every range, no standing required. Fly it in by ear —
the lock tick and R (range, closing or opening) are your instruments.
Docking repairs your hull, rearms your eight missiles, restocks decoys,
refills the warp tank, and tops off your reaction mass. You hear a cue
and a word as you cross into each range; docked, the beacons outside go
quiet and the station's own interior takes over. Undocking puts you
1000 out, facing away — the drive won't spool within 1500 of the
station, so thrust clear before jumping. Losing your ship no longer
fails the run outright — a tug is dispatched instead, on the clock, and
the run's timer keeps running while you wait.

Once docked, a station menu opens: **Sell ore** (and salvage, and alloy)
trades your cargo for credits, and **Modules** spends them on permanent
upgrades — a faster shield, a bigger shield pool, a larger missile
magazine, a bigger warp tank, faster core cooling, and three that stretch
your reach with stations: a comm array, a transporter booster, and a
docking computer. Every module adds a little mass, and mass is the
tradeoff: no friction in space, so a heavier ship just turns and thrusts
a little slower. **Lasers** is where you buy
a higher level for either family with credits and alloy, and repair one
that's worn down — firing any laser wears it a little, hit or miss, and
enough wear drops it back a level until you pay to fix it. Escape undocks.

The hail (in range but not close enough to dock) also offers **Missions**:
escort a freighter to Planet Auren, or defend a miner at Field Kappa.
Raiders leave you alone until you hit one — until then they're going
after the friendly instead, whose hull you'll hear called out as they
take hits. Survive the escort's run or clear both of the defend's waves
and the friendly lives, paying credits and a little standing at the
station; lose the friendly and the mission pays nothing. Each mission
goes back on offer a while after you take it.

Missions also offers a **distress call**: a disabled ship drifts
nearby, calling for help. No weapons this time — tractor it in with B,
then E recovers it once it's close, and flying it home to the station
that called for help pays out. Leave without recovering it, or lose
your own ship first, and the call fails.

Out in the open **Sector**, Station Meridian's own hail also offers a
**Timed delivery** contract: clear the quadrant's current Contested Zone,
mine 15,000 ore at any field, and dock back at Meridian with it — paid at
the ore's usual price plus a bonus, on its own clock, with its own
best-time log in the run log. Selling ore is blocked while one is open,
same as it is during the fixed delivery run above.

The quadrant's **Jump Gate** is locked until its own condition is met.
Call it (C) within 600 to hear "Locked" and what it still needs, or
"Open" once it isn't. The moment the condition is met, calling it
unlocks it for good, with its own chime — this is just the lock;
actually flying through it is a later item. Its own vortex loop reads
silent past 3000, tighter than every other beacon in the quadrant, so
it doesn't drown everything else out.

Out in the open Sector, every station also has its own **standing**
toward you — Unknown, Known, Trusted, or Allied — spoken every time you
hail it. Known opens the transporter (rearm, sell, buy reaction mass);
Trusted opens docking; Allied stretches all three ranges another
quarter. Standing rises by finishing a mission there or selling what you
have, and falls if a mission fails or its own ship is lost, drifting
back down slowly if you stay away too long — though never further than
one step below the best you've ever reached there. Station Meridian
starts Trusted; every other station starts a stranger. A tug always
finds you the nearest station that actually trusts you, at the usual
wait — or, failing that, the long way home to Meridian. You start with
100 credits, and Enter pays 50 to halve whatever's left of the wait —
repeatable, for another halving each time, as long as you can afford
it. The countdown also reminds you, twice, that F2 reads your ship and
F3 your hold.

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

## The flight course

Eight beacons in a row, teaching the stick. Fly through the active one
to clear it — a detuned tone tells each gate apart from the last — and
the next one starts sounding; up to four are ever audible at once, the
nearest one loudest. The tick and lock tone find the active gate exactly
the way they find any other target. The clock starts the moment you
first thrust, not at the menu, and runs until the eighth gate. Flying
wide of a gate still clears it — no gate ever stops the run — but costs
10 seconds on the clock, named as it happens, and chimes down instead of
up. Weapons, shields, and auto-target are all off: this one is flown by
hand. The last gate reads the total time, how many of the eight you
cleared cleanly, your average distance off each gate's own centre, and
how your time compares to your best. Enter tries again; your best 10
times land in the Run log, their own board.

## Escort and Defend drills

The same two missions a station's Missions list offers, playable
directly from the Encounters list so you can hear them without flying to a
station first. No station means no favor and no cooldown — they're
replayable any time, and pay credits on a win the same as the
station-offered versions do.

## Turret defense

A fourth kind of encounter, not flown at all: three fixed zones sit in
front of you, left, centre, and right, and left/right arrows switch
between them. Space fires that zone's laser, F a missile from a small
shared magazine, G toggles that zone's own shield. Each zone can hold
one incoming at a time, closing on its own clock — clear it, catch it on
a shield, or take the hit. Clearing one scores by timing: a sweet spot
partway through the approach pays the most, too early or too late pays
less, and the approach gets a little faster as the drill goes on.
Nothing is announced in play when you clear one — just the cue — so the
tones can be heard clearly; I and the end-of-run debrief read the actual
score. String successes together and every zone's shield snaps up on
its own for a few seconds. Survive the clock and a debrief opens —
score, accuracy, timing, best streak, and more.

## The haul

A rock waits ahead and a home beacon sits somewhere out there. Fly up
close and B engages the tractor, same as mining — but here it tows behind
your own ship as you fly instead of pulling the rock to a stop. The tow
line has a strain: fly smoothly and it's quiet, but hard thrust, sharp
turns, and above all braking or backing into the load all strain it, with
a creak warning before it parts. A parted line lets the load coast; catch
up and re-engage. Bring it home, still latched, and the run reports the
reaction mass it cost against a par.

## Minefield

Nothing to shoot here — a field of slow-drifting mines sits between you
and an exit beacon, and Tab finds the beacon (the mines themselves are
never a target). Each mine has its own tick, positioned right where it
is, quickening the closer you get. A mine only detonates if you're
moving too fast when you pass close by it; slow down and thread through
and it stays silent. Weapons, shields, and auto-target are all off, same
as the flight course. Reach the beacon and the run reports the time, how
many mines went off, and how that compares to your best.

## The shadow

Tail one ship ahead of you as it thrusts in bursts. While it's
thrusting, Tab, T, the lock tone, and the tick all work on it
normally; the instant its engine cuts, the lock drops and the tick
goes silent, no bearing updates until it thrusts again. It coasts on
its old heading while dark, but its nose turns, so the next burst can
head somewhere new — fly on the last bearing you had; R still reports
range with closing or opening either way. Contact time counts
whenever you're close enough, lit or dark — staying with it through a
dark leg by dead reckoning still counts. Reach the total needed and
the run reports how long it took. Weapons, shields, and auto-target
are all off.

## Capital ship

A large ship slowly orbits and turns to face you, carrying four turrets.
Tab cycles between them; each is closed and invulnerable by default — a
hit on a closed door just splashes off. A door opens a few seconds before
its turret fires and stays open through the shot and a beat after — that
whole stretch is the only time it can be hit. The lock tone itself says
which state a turret is in: wavering means closed, steady means open, and
it updates the instant the door changes even if you're already locked on.
Only one door is ever open at a time. Clear all four and the ship breaks
apart.

## Keys

Right hand on the arrows, left hand on everything else.

| Key | Does |
| --- | --- |
| Arrows | Yaw and pitch |
| Shift+Arrows / Shift+Page Up / Shift+Page Down | Blink: an instant jump, facing and speed completely unchanged. Left/Right sidestep, Up/Down are straight world-vertical, Page Up forward, Page Down back. A short cooldown and a small reaction-mass cost; stops short of a station's or planet's hull instead of landing inside it |
| W / S | Thrust / brake. Shift+W toggles auto-thrust — the ship keeps thrusting until you press W, S, or Shift+W again. Shift+S is auto-reverse, the same at the brake thruster's half push; either chord flips the other's direction in one press |
| 1-6 | Select a laser slot. Slots 1 and 2 start fitted with mining and rapid-pulse; slots 3-6 start empty until the station's Lasers shop fits one of four more families (rugged mining, fast fighter, rotary cannon, burst plasma) into them. Pressing a fitted slot's key again cycles among the levels you own, Shift+ the key cycles back. Higher levels are bought at the station with credits and alloy, and wear down with use until the shipyard repairs them. Switching or cycling takes a moment — you hear the mechanism work, longer for the heavier slots — and Space waits for it |
| F2 | Ship status: the full reference, a heading per system — hull, shields, lasers (one block per fitted slot: level, damage, matchups, health — left and right cycle that slot's level within what you own, and the block re-reads with the new numbers), missiles, decoys, warp, reaction mass, thrusters, extractor, vacuum, tractor beam, sensor, repair crew, broken systems, cargo, modules, station access (your comm/transporter/docking ranges). H jumps between headings, a letter jumps to one, arrows read line by line |
| F3 | Resources: ore, salvage, alloy, reaction mass, warp charge, hydrogen, credits, missiles, and decoys, each with what it's for |
| Space | Fire the selected laser. Five ticks over five seconds, fire-and-forget — it can't be stopped once it starts. Harder up close. Two empty bursts overheat it |
| F | Homing missile. Keep the target inside your missile zone for the whole flight |
| D | Decoy. A burst that spoofs the missile coming at you, sending it ballistic at once — no shield needed, and a moment later you hear it pop clear. Four per sortie, restocked at the station; a press with nothing inbound still spends one |
| G | Shields. Take a moment to raise, block enemy fire, weapons offline while up |
| B | Tractor beam (mining), tiered like the lasers: pulls the selected rock or core toward you instead of flying to it — B again releases it. A higher tier pulls faster, reaches further, and costs less reaction mass. Firing a laser, the extractor, or the vacuum cuts it off |
| Tab / T | Cycle targets / report the selected target. Shift+Tab cycles back. The distance is spoken the moment the lock tone comes on |
| Shift+T | Auto-target: the stabilizers aim the ship at your selected target for you, holding on it a few seconds once aimed so a moving target's lock actually lands. Never fires, never damages. A limited pool, not something you start with |
| R | Range to the selected target, and whether it's closing or opening. Shift+R is the radar sweep of every target, nearest first |
| E / V | Ore extractor / dust vacuum (mining) |
| Z | Quick status: one line a press — hull, shields, the selected laser, missiles, decoys, reaction mass, warp charge, any broken systems, auto-target charges if fitted — skipping anything at full health. Press again within a few seconds to continue, or it restarts at hull |
| Shift+Z | Target zone size: wide, standard, narrow |
| Q / H / C | Quadrant map / hyperwarp (spends the warp tank by distance) / call a point of interest — hails a station within 2000, reaches its transporter within 600 once it knows you, docks within 150 once it trusts you |
| I | Status: speed, target, hull, missiles, laser slot, shields, warp charge, mission clock |
| Y | Resource totals: credits, ore, salvage, alloy, reaction mass, warp charge, missiles, decoys. Works everywhere, including inside the station and its submenus |
| [ | Background music on/off. Says the title every time a track starts. Works everywhere; volume and style live in the Sound menu's own Music submenu |
| ] / Shift+] | Next / previous music track, shuffled so every track plays once before any repeat |
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
missile loses guidance on the spot and your weapons stay live — a
moment later you hear it pop clear, confirmation that the spoof worked.
It does nothing against a beam, you carry four, and at Veteran and Ace a
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

A missile that actually lands on your hull — never a beam, never one
your shields caught — can knock a subsystem offline: a laser slot,
missiles, decoys, shields, the warp engine, thrust, the targeting
sensor, or the cargo hold. Every ship carries a repair crew that works
the worst one automatically, one at a time, coming back partway usable
before it's fully fixed; F2 and I both name what's broken and how far
along the fix is. Once every system is whole, the same crew turns to
your hull, at half the speed. Every point of repair — hull or system —
spends reaction mass, so a long fight's patching shows up on your tank;
the crew pauses rather than ever leave you unable to turn. Docking
always finishes the job instantly, free, and a module at the station
speeds the crew up.

## Files

- `index.html` is the game. It loads `audio_assets.js` (the sound bank),
  `audio_engine.js` (the Web Audio primitives), and `audio_cues.js` (the
  named sound-effect registry) beside it, in that order.
- `audio/` holds the source recordings.
- `CLAUDE.md` is the design and working notes.

All tuning numbers live in the `CFG` table and the data tables near the top
of `index.html`.
