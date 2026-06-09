---
name: strudel-sound-design
description: Choosing and shaping sounds in Strudel — drum banks with .bank(), sample selection with :n/.n(), synth waveform choice per musical role, ADSR envelope shaping, FM for bells and metallic tones, filter+envelope recipes, delay/reverb sends and orbits, gain staging a mix, and sidechain-style ducking. Use when picking instruments, designing timbres, building effect chains, or balancing levels in a Strudel pattern.
---

# Strudel sound design

## Picking drum sounds

Default drum names: `bd` (kick), `sd` (snare), `cp` (clap), `rim`, `hh`
(closed hat), `oh` (open hat), `cr` (crash), `rd` (ride), `lt`/`mt`/`ht`
(toms), `cb` (cowbell), `sh` (shaker), `tb` (tambourine), `perc`.

`.bank()` switches the whole kit (exact CamelCase names):

```js
s("bd*4, ~ cp, hh*8").bank("RolandTR909")          // house/techno staple
s("bd*2, ~ sd, hh*8").bank("RolandTR808")          // hip-hop/electro
s("bd sd, hh*16").bank("<RolandTR808 RolandTR909>") // alternate kits per cycle
```

Other attested banks: `RolandTR707`, `AkaiLinn`, `RhythmAce`,
`ViscoSpaceDrum`, `CasioRZ1`. Each name is a folder of samples — pick
variants with `:n` or `.n()` (indexes wrap):

```js
s("hh*8").n("<0 1 2 3>")     // cycle through hat samples
s("bd:3*2 sd:1")
```

Pitched defaults include `piano`, `casio`, plus `gm_`-prefixed soundfonts
(e.g. `gm_acoustic_bass`, `gm_epiano1`) — never invent GM names.

## Waveform choice by role

| Role | Source | Why |
| --- | --- | --- |
| Sub bass | `sine` or `triangle` | Pure fundamental, no fizz to filter out |
| Acid / aggressive bass | `sawtooth` + `lpf` + high `lpq` | Harmonics for the filter to bite into |
| Pads | detuned `sawtooth` layers, slow attack | Width and motion |
| Leads / plucks | `square` or `triangle`, short decay | Cuts through without mud |
| Bells / metallic | `sine` + FM | Inharmonic sidebands |
| Noise percussion | `white`/`pink`/`brown`, no sustain | Instant hats/snares |

```js
note("c1*4").s("sine").decay(.3).sustain(.4)              // sub
note("g2 g2 bb2 c3").s("sawtooth").lpf(400).lpq(12)       // acid-ish
s("white*2").decay(.12).sustain(0).lpf(6000)              // noise snare
```

## ADSR shaping

`.attack/.decay/.sustain/.release`, or all at once: `.adsr("a:d:s:r")`.

```js
note("c2*8").s("square").decay(.1).sustain(0)             // plucky stab
note("[d3,a3,e4]@4").s("sawtooth").attack(.6).release(1.2) // pad swell
note("e3 g3 b3 d4").s("sawtooth").adsr(".05:.2:.3:.4")
```

For sustained notes, event length matters — combine with `.clip()`/`.legato()`.

Detuned "super-saw" pad (fractional notes = cents):

```js
note("[c3,g3]@4").s("sawtooth")
  .superimpose(x => x.add(note(.1)), x => x.sub(note(.1)))
  .attack(.4).release(.8).lpf(1500).gain(.4)
```

## FM for bells and metal

`.fm(index)` = brightness, `.fmh(ratio)` = harmonicity. Low integer ratios
sound harmonic; non-integers clang. Shape with `fmattack/fmdecay/fmsustain`.

```js
note("e5 ~ b4 ~").s("sine").fm(8).fmh(3.01).fmdecay(.3).fmsustain(0) // bell
note("c2 c2 g1 bb1").s("sine").fm(4).fmh(2)                          // metallic bass
```

## Filter + envelope recipes

Filters: `.lpf(hz)`/`.lpq(q)`, `.hpf`/`.hpq`, `.bpf`/`.bpq`,
`.ftype("ladder")` for a steeper model, `.vowel("a e i o")` for formants.
Each filter has its own envelope: `lpenv` (depth, negative = downward),
`lpattack/lpdecay/lpsustain/lprelease`.

```js
// acid pluck: closed filter, envelope kicks it open per note
note("a1 a1 c2 g1".fast(2)).s("sawtooth")
  .lpf(300).lpenv(5).lpdecay(.12).lpq(10).decay(.18).sustain(0)

// synth kick from a pitch envelope
note("c1*4").s("sine").penv(24).pdecay(.08).decay(.25).sustain(0)

// slow opening sweep over 8 cycles
note("<e2 c2>*4").s("sawtooth").lpf(sine.slow(8).rangex(200, 5000))
```

## Sends: delay, reverb, orbits

`delay`/`room` are **send levels**; the bus settings (`delaytime`,
`delayfeedback`, `roomsize`, `roomfade`, `roomlp`) are **shared per orbit**.
Give voices with different reverb/delay needs their own `.orbit(n)`.
`delaytime` is in **seconds** — compute from tempo for synced echoes.

```js
s("~ cp").delay(.5).delaytime(.125).delayfeedback(.55)
note("[f3,a3,c4]@4").s("sawtooth").room(.6).roomsize(7).orbit(2)
s("rim*4").room(.8).dry(.5)         // keep some dry signal
```

Dirt and texture: `.distort("2:.6")` (amount:postgain), `.crush(4–16)`,
`.coarse(n)`, `.shape(0–1)`.

## Gain staging a mix

Rough targets that leave headroom (1 = unity; later `gain` calls override
earlier ones; `velocity` multiplies into gain):

| Element | Gain |
| --- | --- |
| Kick | .9–1 |
| Snare/clap | .7–.9 |
| Bass | .7–.9 |
| Hats/percs | .3–.5 |
| Pads/chords | .4–.5 |
| Leads | .5–.7 |

```js
$: s("bd*4").gain(.95)
$: s("hh*8").gain("[.3 .5]*4").hpf(5000)   // accents + de-mudded
$: note("<c2 eb2>*4").s("sawtooth").lpf(600).gain(.8)
$: chord("<Cm7 Ab^7>").voicing().s("sawtooth").gain(.45).orbit(2)
```

`.hpf()` non-bass elements (hats 4000+, pads 200–300) so only one voice
owns the low end.

## Sidechain-style ducking

The duck controls: the trigger pattern targets a victim orbit.

```js
$: note("[c3,eb3,g3]@4").s("sawtooth").orbit(2).gain(.5)   // pad
$: s("bd*4").duckorbit(2).duckattack(.3).duckdepth(.8)     // kick ducks it
```

Manual fallback that always works — pump the pad's gain with an inverted
ramp synced to the kick rate:

```js
note("[c3,eb3,g3]@4").s("sawtooth").gain(isaw.fast(4).range(.2, .6))
```

Note: chain order does not change signal routing — each control just sets a
parameter. Full control lists: `knowledge/effects.md`, `knowledge/synths.md`,
`knowledge/sounds-and-samples.md`.
