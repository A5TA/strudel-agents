# Synths

Strudel ships several real-time synthesis engines selected through
`s()/sound()`, plus per-event envelope and modulation controls.

## Basic waveforms

```js
note("c2 eb2 g2 bb2").s("sawtooth")
note("c4 e4 g4").s("square")
note("c5*4").s("sine")
note("c3 g3").s("triangle")
```

- Available: `sine`, `sawtooth`, `square`, `triangle`.
- **Default**: if you set `note()`/`n()`/`freq()` without `s()`, you get
  `triangle`.
- Pitch can come from `note` (names or MIDI numbers) or `freq` (Hz):
  `freq("110 165 220").s("sawtooth")`.

## Noise

- Noise sources, hardest to softest: `white`, `pink`, `brown`.
- `crackle` is a sparse noise-crackle source; shape its density with
  `.density(x)`.
- Add pink noise *onto* any oscillator with `.noise(amount)` — good for
  breathy or gritty tones.

```js
s("white pink brown").decay(.15).sustain(0)        // noise hats/percussion
note("c3 e3 g3").s("sawtooth").noise(.2)
s("crackle*4").density("<.01 .05 .2>")
```

A snare-ish hit from noise:

```js
s("white*2").decay(.12).sustain(0).lpf(6000)
```

## Amplitude envelope (ADSR)

| Control | Alias | Meaning |
| --- | --- | --- |
| `.attack(s)` | `att` | Seconds to reach full level. |
| `.decay(s)` | `dec` | Seconds to fall to sustain level. |
| `.sustain(x)` | `sus` | Level held while the note lasts (0–1). |
| `.release(s)` | `rel` | Seconds to fade after the note ends. |
| `.adsr("a:d:s:r")` | — | All four at once, colon-separated. |

```js
note("c3 e3 g3 b3").s("sawtooth").attack(.05).decay(.2).sustain(.3).release(.4)
note("c3 e3 g3 b3").s("sawtooth").adsr(".05:.2:.3:.4")   // identical
note("c2*8").s("square").decay(.1).sustain(0)            // plucky stab
```

For sustained synth notes, event length matters: combine with
`.clip()`/`.legato()` to control how long notes hold before release.

## Vibrato

- `.vib(freq)` — vibrato rate in Hz (aliases `vibrato`, `v`).
- `.vibmod(depth)` — vibrato depth in semitones (alias `vmod`).
- Colon shorthand carries the second parameter: `.vib("6:0.3")`
  (rate:depth) or `.vibmod("0.5:8")` (depth:rate).

```js
note("a3@2 e4@2").s("sawtooth").vib(5).vibmod(.4)
note("c4").s("triangle").vib("<2 4 8>:0.5")
```

## FM synthesis

Two-operator FM on top of the basic waveforms.

| Control | Alias | Meaning |
| --- | --- | --- |
| `.fm(x)` | — | Modulation index (brightness/sidebands); 0 = off. |
| `.fmh(x)` | — | Harmonicity: modulator/carrier frequency ratio. |
| `.fmattack(s)` | `fmatt` | Attack of the modulation envelope. |
| `.fmdecay(s)` | `fmdec` | Decay of the modulation envelope. |
| `.fmsustain(x)` | `fmsus` | Sustain level of the modulation envelope. |
| `.fmenv(type)` | — | Envelope ramp type: `lin` or `exp`. |

```js
note("c2 c2 g1 bb1").s("sine").fm(4).fmh(2)             // metallic bass
note("c4 e4 g4").s("sine").fm("<1 2 8>").fmdecay(.2).fmsustain(0)
note("c3").s("sine").fm(6).fmh("<1 1.5 2 3>")           // scan timbres
```

Low integer `fmh` ratios sound harmonic; non-integers sound clangorous.

## Additive synthesis

Current builds expose harmonic control for the basic waveforms via
`.partials(...)` (magnitudes of each harmonic relative to the fundamental)
and `.phases(...)`. This is a newer/experimental area of the API — verify in
the REPL before relying on it, and prefer plain waveforms + filters when
unsure.

```js
// verify in REPL: custom harmonic recipe on a sawtooth source
note("c3 g3").s("sawtooth").partials([1, .5, .33, .25])
```

## Wavetable synthesis

Any loaded sample whose name starts with `wt_` is treated as a wavetable
(single-cycle waveform, auto-looped). Scan through it with
`loopBegin`/`loopEnd`. A large bank of AKWF wavetables is available:

```js
samples('bubo:waveforms');   // ~1000 AKWF single-cycle waves
note("c2 eb2 g2").s("wt_flute").release(.1)
note("c2*4").s("wt_vox").loopBegin(sine.slow(4).range(0, .5))
```

## ZZFX

The "Zuper Zmall Zound Zynth" (retro game-sound generator) is built in.
Select its sources with a `z_` prefix: `z_sine`, `z_sawtooth`, `z_square`,
`z_triangle`, `z_tan`, `z_noise`.

ZZFX-specific params: `zrand`, `curve`, `slide`, `deltaSlide`, `noise`,
`zmod` (FM speed), `zcrush` (bit crush), `zdelay`, `pitchJump`,
`pitchJumpTime`, `lfo`, `tremolo`, `duration`. Standard
`attack/decay/sustain/release` also apply.

```js
note("c4 e4 g4 b4").s("z_square").zmod(4).zcrush(6)
note("c5").s("z_sawtooth").slide(2).pitchJump(12).pitchJumpTime(.1)
```

## Useful synth idioms

```js
// Super-saw style: detuned layered copies
note("c2 g1").s("sawtooth")
  .superimpose(x => x.add(.1), x => x.sub(.1))   // add cents via fractional notes
  .lpf(1200)

// Sub bass + click
stack(
  note("c1*4").s("sine").decay(.3).sustain(.4),
  s("hh*4").gain(.2)
)

// Filter-enveloped pluck (see effects.md for lpenv)
note("c2 eb2 g2 bb2").s("sawtooth").lpf(400).lpenv(4).lpdecay(.15).decay(.2).sustain(0)
```
