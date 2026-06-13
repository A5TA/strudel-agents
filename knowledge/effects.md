# Effects and Audio Controls

All effects are chainable controls applied per event (except the "global"
delay/reverb/duck sends, which live on **orbits** — shared effect buses).
Every numeric argument accepts a pattern: `.lpf("<400 2000>")`.

## Levels, dynamics, stereo

| Control | Alias | Range / meaning |
| --- | --- | --- |
| `.gain(x)` | — | Volume (exponential feel); 1 = unity, 0 = silent. |
| `.velocity(x)` | `vel` | 0–1, multiplied with gain (MIDI-ish accents). |
| `.postgain(x)` | — | Gain applied **after** all effects (e.g. after compression). |
| `.compressor("thr:ratio:knee:att:rel")` | — | Per-chain compressor. |
| `.pan(x)` | — | 0 = left, 1 = right, .5 = center. |
| `.jux(fn)` | — | Original left, transformed copy right. |
| `.juxBy(amt, fn)` | — | Same with stereo width 0–1. |
| `.xfade(pat)` | — | Crossfade against another pattern. |

```js
s("hh*8").gain("[.3 1]*4")                    // accent pattern
s("bd*2, ~ cp").compressor("-20:8:6:.002:.05").postgain(1.2)
n("0 2 4 6").scale("C:minor").pan(sine.slow(2))
s("bd sd").jux(x => x.rev().speed(1.5))
```

## Filters

| Control | Aliases | Meaning |
| --- | --- | --- |
| `.lpf(hz)` | `cutoff`, `ctf`, `lp` | Low-pass cutoff (0–20000). |
| `.lpq(x)` | `resonance` | Low-pass resonance/Q (0–50; high values scream). |
| `.hpf(hz)` | `hp`, `hcutoff` | High-pass cutoff. |
| `.hpq(x)` | `hresonance` | High-pass Q. |
| `.bpf(hz)` | `bp`, `bandf` | Band-pass center frequency. |
| `.bpq(x)` | `bandq` | Band-pass Q. |
| `.ftype(t)` | — | Filter model: `12db` (default), `ladder`, `24db`. |
| `.vowel(v)` | — | Formant filter: `a e i o u` (and variants). |

```js
note("c2*8").s("sawtooth").lpf(sine.slow(4).rangex(150, 6000)).lpq(8)
s("hh*16").hpf("<4000 8000>")
note("e2 g2 a2 b2").s("sawtooth").vowel("<a e i o>")
note("c1*4").s("sawtooth").ftype("ladder").lpf(500).lpq(12)
```

### Filter envelopes

Each filter has its own ADSR plus an envelope **depth**. Low-pass versions
shown; swap the `lp` prefix for `hp` or `bp`.

| Control | Alias | Meaning |
| --- | --- | --- |
| `.lpenv(x)` | `lpe` | Envelope depth (semitone-ish exponent; negative sweeps down). |
| `.lpattack(s)` | `lpa` | Filter envelope attack. |
| `.lpdecay(s)` | `lpd` | Filter envelope decay. |
| `.lpsustain(x)` | `lps` | Filter envelope sustain. |
| `.lprelease(s)` | `lpr` | Filter envelope release. |

```js
// acid-style pluck
note("c2 c2 eb2 g1".fast(2)).s("sawtooth")
  .lpf(300).lpenv(5).lpdecay(.12).lpq(10).decay(.18).sustain(0)
```

## Pitch envelope

`.penv(semitones)` with `.pattack`/`.pdecay`/`.prelease`, `.pcurve`
(0 linear, 1 exponential) and `.panchor`. Great for kick drums and laser
sweeps.

```js
note("c1*4").s("sine").penv(24).pdecay(.08).decay(.25).sustain(0)  // synth kick
```

## Time-based sends: delay and reverb

Delay and reverb are **global per orbit**: `delaytime`, `delayfeedback`,
`roomsize` etc. configure the shared bus, while `delay`/`room` set how much
each event sends to it. Patterns sharing an orbit share these settings — use
`.orbit(n)` to separate them.

| Control | Aliases | Meaning |
| --- | --- | --- |
| `.delay(x)` | — | Send level 0–1. Colon shorthand: `.delay(".5:.125:.7")` = level:time:feedback. |
| `.delaytime(s)` | `delayt`, `dt` | Delay time in seconds (use fractions of a cycle for synced echoes). |
| `.delayfeedback(x)` | `delayfb`, `dfb` | Feedback 0–1 (≥1 runs away). |
| `.room(x)` | — | Reverb send 0–1. |
| `.roomsize(x)` | `rsize`, `size`, `sz` | Reverb size 0–10. |
| `.roomfade(s)` | `rfade` | Reverb decay time. |
| `.roomlp(hz)` | `rlp` | Reverb low-pass. |
| `.roomdim(hz)` | `rdim` | Reverb damping frequency. |
| `.iresponse(s)` | `ir` | Convolution reverb impulse from a sample. |
| `.orbit(n)` | `o` | Which effect bus this pattern uses. |
| `.dry(x)` | — | How much unprocessed signal remains. |

```js
s("~ cp").delay(.6).delaytime(.125).delayfeedback(.6)
n("0 4 7").scale("F:lydian").s("piano").room(.5).roomsize(6)
s("hh*8").orbit(2).delay(.4)        // its own delay bus
s("rim*4").room(.8).dry(.5)
```

There is no single `wet()` control: balance `gain`/`dry` against the
`delay`/`room` send amounts.

## Distortion and degradation

| Control | Alias | Meaning |
| --- | --- | --- |
| `.distort(x)` | `dist` | Waveshaper; ~0–10+, `"3:.5"` = amount:postgain. |
| `.shape(x)` | — | Older waveshaper, 0–1 (gets loud fast). |
| `.crush(n)` | — | Bit-crush to n bits (16 subtle … 1 destroyed). |
| `.coarse(n)` | — | Sample-rate reduction by factor n. |

```js
note("c2 g1").s("sawtooth").distort("2:.6")
s("bd*4").shape(.4)
s("hh*8").crush("<16 8 4>")
n("0 3 7").scale("A:minor").s("piano").coarse("<1 4 16>")
```

## Modulation effects

### Phaser

`.phaser(speedHz)` (alias `ph`) with `.phaserdepth` (`phd`),
`.phasercenter` (`phc`), `.phasersweep` (`phs`).

```js
note("[c3,e3,g3,b3]@2 [d3,f3,a3,c4]@2").s("sawtooth").phaser(2).phaserdepth(.8)
```

### Tremolo

`.tremolosync(cycles)` (`tremsync`), `.tremolodepth` (`tremdepth`),
`.tremoloskew`, `.tremolophase`, `.tremoloshape` (`tri|square|sine|saw|ramp`).

```js
note("g2@4").s("sawtooth").tremolosync(8).tremolodepth(.9).tremoloshape("sine")
```

## Sidechain ducking

The duck controls let one orbit duck another (pumping/sidechain effect):
`.duckorbit(n)` (alias `duck`) on the *trigger* pattern targets orbit n;
`.duckattack(s)` (`duckatt`) sets recovery time; `.duckdepth(x)` sets amount
0–1.

```js
// pad on orbit 2, ducked by the kick
$: note("[c3,eb3,g3]@4").s("sawtooth").orbit(2).gain(.5)
$: s("bd*4").duckorbit(2).duckattack(.3).duckdepth(.8)
```

A manual alternative that always works: modulate the pad's gain with an
inverted ramp, e.g. `.gain(isaw.fast(4).range(.2, .7))`.

## Combining effects — order notes

- Signal flow is fixed by the engine, not by your chain order; calling
  `.lpf().gain()` vs `.gain().lpf()` does not change routing. Each control
  just sets a named parameter on the event.
- Setting the same control twice: the later call wins.
- `velocity` multiplies into `gain`; `postgain` is applied last.

```js
// a complete "mix-ready" hat line
s("hh*16")
  .gain(saw.range(.2, .7).fast(4))
  .pan(rand)
  .hpf(6000)
  .room(.15)
  .sometimesBy(.1, x => x.speed(2))
```
