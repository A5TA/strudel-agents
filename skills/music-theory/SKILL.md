---
name: music-theory
description: Practical music theory applied in Strudel — choosing keys and scales by mood (dorian, phrygian, lydian, mixolydian, pentatonics), diatonic chord progressions as scale degrees and chord symbols rendered with chord()/voicing() or n().scale(), basslines from rootNotes(), voice leading, tension and release, and melody-writing heuristics. Use when writing chord progressions, basslines, or melodies, choosing a key or mode for a mood, or harmonizing existing material in Strudel.
---

# Music theory for Strudel

## Scale choice by mood

Set the mode first; it does more for mood than any effect.

| Scale | Mood | Strudel |
| --- | --- | --- |
| minor (aeolian) | dark, serious | `.scale("A:minor")` |
| dorian | dark but cool, groovy (minor with a bright 6th) | `.scale("D:dorian")` |
| phrygian | tense, menacing (b2 against the root) | `.scale("E:phrygian")` |
| lydian | dreamy, floating (#4) | `.scale("F:lydian")` |
| mixolydian | warm, bluesy major (b7) | `.scale("G:mixolydian")` |
| major | bright, plain | `.scale("C:major")` |
| minor pentatonic | safe melodic minor palette — no wrong notes | `.scale("A:minor:pentatonic")` |
| major pentatonic | safe sunny palette | `.scale("C:major:pentatonic")` |
| harmonic minor | dramatic, exotic | `.scale("A:harmonic:minor")` |

`n()` values are **zero-based scale degrees** with `.scale()` (degree 0 =
root, 7 = root an octave up; negatives go below). The root may carry an
octave: `"A2:minor"`.

```js
n("0 2 4 7").scale("D:dorian")
n("0 .. 7").scale("E:phrygian").s("sawtooth")
```

## Progressions: two renderings

### As chord symbols — `chord()` + `voicing()`

`voicing()` turns symbols into concrete notes **with smooth voice leading**
between successive chords — this is your voice-leading engine; prefer it
over hand-stacked chords for progressions.

```js
// minor i–VI–III–VII (epic/pop-dark), in A minor
chord("<Am F C G>").voicing().s("piano")

// jazz ii–V–I with 7ths, in C
chord("<Dm7 G7 C^7 C^7>").voicing().s("piano").room(.3)

// major I–V–vi–IV (the big-pop loop), in F
chord("<F C Dm Bb>").voicing().s("sawtooth").attack(.1).gain(.45)

// dorian two-chord vamp (i7–IV7), in D
chord("<Dm7 G7>").voicing().struct("x ~ x ~ ~ x ~ ~")
```

Stick to common symbol forms: `m`, `7`, `m7`, `^7` (maj7), `9`, `m9`,
`sus4`, `b13`. Steer the register with `.anchor("e4").mode("below")`;
arpeggiate a voicing with `.n("0 1 2 3")` or `.arp("0 2 1 3")`.

### As scale degrees — `n().add(n(...)).scale()`

Move a chord shape diatonically by adding degrees — terse and always in key.
The add must be keyed (`n(...)`) and come **before** `.scale()`; a plain
`.add("<...>")` on a control pattern silently does nothing:

```js
// triads on degrees 0, 5, 3, 4 of A minor (i–VI–iv–v)
n("[0,2,4]").add(n("<0 5 3 4>")).scale("A:minor").s("sawtooth").gain(.4)
```

## Bass follows the roots

`rootNotes(octave)` extracts each chord's root — the reliable way to keep
bass and harmony locked. Share one progression `const` between voices.

```js
setcpm(96/4)
const prog = chord("<Am7 F^7 C^7 G7>");
$: prog.voicing().s("piano").gain(.6).room(.3)
$: prog.rootNotes(2).s("sawtooth").lpf(500)
  .struct("x ~ ~ x ~ ~ x ~")          // tresillo-ish bass rhythm
```

For non-symbol harmony, write the bass as alternating roots:
`note("<a1 f1 c2 g1>*2")`.

## Tension and release

- **Tension**: dominant chords (`G7` in C), the v or VII in minor, b2 in
  phrygian, leaving melodies on non-chord tones, rising filter/register.
- **Release**: land on i/I, return the melody to a chord tone, drop the
  register back down.
- Place tension at phrase ends so the loop pulls back to its start —
  `<Am F G E7>` resolves home harder than `<Am F G C>`.

```js
chord("<Am Am F E7>").voicing()   // E7 makes the loop "lean" back to Am
```

## Melody-writing heuristics

1. **Mostly stepwise** — adjacent scale degrees; melodies are lines, not dice.
2. **Leap, then resolve** — after a jump (4+ degrees), step back the other way.
3. **End phrases on chord tones** (root/3rd/5th of the current chord).
4. **One rhythmic motif, repeated with variation** — change pitch, keep rhythm.
5. **Leave rests** — phrases need breath; `~` is a note choice.

```js
// motif (cycle A) and varied answer (cycle B): same rhythm, new contour
n("<[0 1 2 ~ 4 ~ 2 0] [0 1 2 ~ 5 ~ 4 2]>")
  .scale("D:dorian").s("triangle").gain(.55)
```

Pentatonic + `off` echo is a near-foolproof lead:

```js
n("0 ~ 2 4 ~ 4 7 ~").scale("A:minor:pentatonic")
  .off(1/8, x => x.add(note(7)).gain(.5))
```

## Call-and-response

Two shapes:

```js
// A) alternate phrases per cycle: call, then answer
n("<[0 2 4 ~] [4 2 1 0]>").scale("G:mixolydian").s("piano")

// B) off() answers automatically, transposed and panned
n("0 ~ 3 ~ 2 ~ ~ ~").scale("E:minor:pentatonic")
  .off(1/2, x => x.add(note(7)).pan(.8).gain(.6))
```

## Quick cautions

- `n()` without `.scale()` selects **samples**, not pitches.
- `note("0 2 4")` is MIDI 0/2/4 — inaudibly low. Use `n()+scale` or note names.
- Transpose by semitones with `.transpose(n)`, by scale steps with
  `.scaleTranspose(n)`; `.add(n)` on `n()` patterns moves by degrees.
- Test exotic scale/chord names in the REPL — unknown names fail silently.

Deep reference: `knowledge/tonal-and-theory.md`.
