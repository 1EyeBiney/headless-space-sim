# Headless Space Sim

A space sim played entirely by ear. No graphics: the world is 3D positional
audio (Web Audio HRTF panning) and a screen reader's speech. Built by Brian,
who is blind, with Claude Code, as a test of whether browser audio can carry a
full audio-only game.

## Play it

**[Play in your browser](https://1eyebiney.github.io/headless-space-sim/)**
— hosted on GitHub Pages, no download. Add `?run=delivery` to the link to
skip the menu and jump straight into the timed delivery run.

Or download `space_sim_demo.html` and double-click it: a single file with
the sound bank inlined, so it runs from disk in Chrome or Edge with no
server. Wear headphones either way: the whole game is in the stereo image.

Press Enter to begin, then pick a mission from the menu: up and down arrows
browse it, Enter selects, and a first letter jumps to an item. Everything is
announced through an ARIA live region, so a screen reader (NVDA, JAWS,
VoiceOver, Narrator) reads it. Sighted players can follow the small text
status line, but the game does not need it.

## Difficulty

Difficulty on the mission menu is adjusted with left and right arrows right
there on the menu line: **Rookie** (ships hold their fire until you hit
them — the easiest way to learn the controls), **Veteran** (every ship is
hostile and watching from the moment an encounter starts), and **Ace**
(Veteran, plus a slower shield, a touchier laser, and a smaller missile
magazine). It's saved to your browser and remembered next time you play.

## Run log

The last item on the menu reads back your best delivery-run times, up to
10, fastest first, with the difficulty and date of each — also saved to
your browser. Finish a run to add to it.

## The timed delivery run (first item on the menu)

The shareable challenge. The clock starts at once.

1. Fly or hyperwarp to the Contested Zone and clear it. Five ships. Each
   one holds its fire until you hit it, then it shoots back.
2. Mine 15,000 ore at Asteroid Field Kappa. Laser rocks apart, vacuum the
   dust, extract the glowing cores.
3. Deliver the ore to Station Meridian. Your run time is spoken on delivery.

The station repairs your hull and rearms your eight missiles whenever you
call it. Losing your ship fails the run.

The hyperwarp drive won't spool within 1,500 of any point of interest, so
after a station visit you'll need to fly clear before jumping onward.

## Keys

Right hand on the arrows, left hand on everything else.

| Key | Does |
| --- | --- |
| Arrows | Yaw and pitch |
| W / S | Thrust / brake |
| Space | Laser beam, 2 seconds. Harder up close. Two empty bursts overheat it |
| F | Homing missile. Keep the target inside your missile zone for the whole flight |
| G | Shields. Take a moment to raise, block enemy fire, weapons offline while up |
| Tab / T | Cycle targets / report the selected target. The distance is spoken the moment the lock tone comes on |
| R | Radar sweep of every target, nearest first |
| E / V | Ore extractor / dust vacuum (mining) |
| Z | Target zone size: wide, standard, narrow |
| Q / H / C | Quadrant map / hyperwarp / call a point of interest (sector) |
| I | Status: speed, target, hull, missiles, shields, mission clock |
| X | Leave the mission |
| F1 | Help, read line by line with the arrows |
| F12 | Explore mode: every key describes itself without doing anything |
| Escape | Pause |

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
with the dramatic evade.

## Files

- `index.html` is the game. It loads `audio_assets.js` (the sound bank),
  `audio_engine.js` (the Web Audio primitives), and `audio_cues.js` (the
  named sound-effect registry) beside it, in that order.
- `space_sim_demo.html` is the same game with all three of those inlined,
  for sharing as one file.
- `audio/` holds the source recordings.
- `CLAUDE.md` is the design and working notes.

All tuning numbers live in the `CFG` table and the data tables near the top
of `index.html`.
