---
name: song-arrangement
description: Building full tracks in Strudel — section vocabulary (intro, build, drop, breakdown, outro), energy curves, arrange() for fixed structures vs stack() with $:/_$: muting for live performance, 4/8/16-cycle phrase lengths, transition techniques (filter sweeps, fills on lastOf, dropping the kick), and a complete 64-cycle arrangement skeleton. Use when turning loops into a complete piece, structuring sections over time, or adding builds, drops, and transitions to a Strudel composition.
---

# Song arrangement in Strudel

## Two ways to structure time

**`stack()` + `$:` voices — the live/jam mode.** Every voice loops; you
perform the arrangement by muting (`_$:`) and unmuting (`$:`) lines.
Best for iterating and live coding.

```js
setcpm(126/4)
$: s("bd*4").gain(.95)
$: s("[~ oh]*4").gain(.5)
_$: note("<c2 c2 ab1 bb1>*4").s("sawtooth").lpf(700)   // bring in later
_$: chord("<Cm7 Ab^7>").voicing().s("sawtooth").gain(.4)
```

**`arrange([cycles, pattern], ...)` — the fixed-composition mode.** Each
section lasts a stated number of cycles; the whole sequence loops when it
ends. Best for a finished, paste-and-play piece.

```js
arrange(
  [8,  intro],
  [16, groove],
  [8,  breakdown],
  [16, full]
)
```

Build sections from named `const` parts so layers can be reused and
recombined — the arrangement is then just a table of which parts play when.

## Phrase lengths and the energy curve

Dance-music listeners count in **4s**: change something every 4 cycles
(bars), make a bigger change every 8, restructure every 16. Sections of 4,
8, or 16 cycles feel intentional; 5 or 7 feel like mistakes (unless that's
the point).

A typical energy curve:

```
intro      build      drop/full     breakdown    build     drop      outro
low ─────▶ rising ──▶ HIGH ───────▶ low+pretty ─▶ rising ─▶ HIGH ───▶ fading
8          8          16            8             8         16        8
```

Energy levers, roughly in order of power: kick present/absent, low end
present/absent, number of layers, hat density, filter brightness, gain.

## Transition techniques

**Filter sweep into a section** — a slow signal timed to the phrase:

```js
// brightens over exactly 8 cycles, then the next section hits open
bass.lpf(saw.slow(8).rangex(200, 4000))
```

**Drum fill on the last cycle of a phrase:**

```js
drums.lastOf(8, x => x.ply(2))           // double-time fill
snare.lastOf(8, x => x.fast(4).gain(saw.range(.4, .9)))  // snare roll riser
```

**Drop an element just before the drop** — one cycle of absence makes the
return land harder. In `arrange`, give the pre-drop section its own
kick-less stack; live, flip the kick to `_$:` for a bar.

**Other risers:** `hh*16` entering with `gain(saw.slow(8).range(.1,.6))`;
`.hpf(saw.slow(8).rangex(40, 2000))` thinning everything before impact;
reverb send creeping up `.room(saw.slow(8).range(0,.7))`.

## Tension techniques (builds)

- **Rising lpf**: `.lpf(saw.slow(8).rangex(300, 6000))` on bass or chords.
- **Snare rolls via ply**: `s("sd*4").ply("<1 2 4 8>")` over 4 cycles.
- **Remove the kick** for the last 2–4 cycles of the build; everything
  floats, then the drop restores gravity.
- **Shrinking loops**: `.linger("<1 .5 .25 .125>")` chokes a phrase into a
  stutter as the build peaks.
- **Density**: hats `"hh*8"` → `"hh*16"`, or `.ply("<1 1 2 4>")`.

## Worked example — a 64-cycle skeleton

```js
// @title Circuit Garden  @by example
setcpm(126/4)

// ---- parts ----
const kick   = s("bd*4").bank("RolandTR909").gain(.95);
const clap   = s("~ cp").bank("RolandTR909").room(.2);
const hats   = s("hh*8").bank("RolandTR909").gain("[.4 .7]*4").hpf(5000);
const opens  = s("[~ oh]*4").bank("RolandTR909").gain(.45).cut(1);
const bass   = note("<c2 c2 eb2 g1>(5,8)")
  .s("sawtooth").lpf(700).lpq(6).decay(.15).sustain(.2).gain(.8);
const chords = chord("<Cm7 Ab^7 Bb7 Gm7>").voicing()
  .s("sawtooth").attack(.05).release(.3).gain(.4).lpf(1600).orbit(2);
const lead   = n("0 ~ 4 <7 9> ~ 4 ~ 2").scale("C:minor:pentatonic")
  .s("triangle").gain(.5).delay(.4)
  .off(1/8, x => x.add(note(12)).gain(.4));

// ---- sections ----
const intro = stack(hats.gain(.3), chords.lpf(600));
const build = stack(kick, hats, clap, chords,
  bass.lpf(saw.slow(8).rangex(250, 3000)))
  .lastOf(8, x => x.ply(2));                        // fill into the drop
const drop  = stack(kick, clap, hats, opens, bass, lead);
const breakdown = stack(chords.room(.6).roomsize(6), lead.slow(2),
  hats.gain(.25).degradeBy(.3));
const full  = stack(kick, clap, hats, opens, bass, chords, lead)
  .lastOf(16, x => x.degradeBy(.4));                // dropout fill at the end

// ---- 64-cycle arrangement ----
$: arrange(
  [8,  intro],      // cycles 0–7:   chords + ghost hats
  [8,  build],      //        8–15:  drums in, filter opening, fill at 15
  [16, drop],       //        16–31: full groove + lead
  [8,  breakdown],  //        32–39: kick out, wash of chords
  [8,  build],      //        40–47: rebuild
  [16, full]        //        48–63: everything, then fall apart
)
```

Notes on the pattern: every section length is a multiple of 4; the build
reuses the drop's parts (cheaper and more coherent than new material); the
breakdown removes the kick *and* low end; fills sit on `lastOf` so they
always point at the next section.

## Checklist for arrangements

- [ ] `setcpm` once at the top; parts as `const`; one `$: arrange(...)`
      (or clearly-labelled `$:` voices for live mode).
- [ ] Section lengths in 4/8/16-cycle units; total stated in a comment.
- [ ] Every section boundary has a transition: fill, sweep, or dropout.
- [ ] The drop is preceded by 1–2 cycles of reduced energy.
- [ ] Intro and outro mirror each other (strip layers in reverse).

See `knowledge/patterns-and-structure.md` for the arrange/stack templates
and REPL conventions.
