# Tonal Functions and Music Theory

Strudel's tonal layer (powered by tonal.js) handles note names, scales,
chord symbols and voicings.

## Note names and numbers

`note()` accepts:

- Letter names `a`–`g`, optional `#`/`s` (sharp) or `b` (flat), optional
  octave: `c3`, `eb4`, `f#2` (also writable `fs2`). Without an octave,
  octave 3 is assumed.
- MIDI numbers: `note(60)` = c4-ish middle C (`note("60 63 67")` works in
  mini-notation too). Fractional numbers detune in semitone fractions.

```js
note("c2 eb2 g2 bb2").s("sawtooth")
note("48 51 55 58")            // same chord as MIDI numbers
```

## Scales: `scale()` + `n()`

`n()` values are **zero-based scale degrees** when combined with
`.scale("Root:name")`. Degrees beyond the scale wrap into the next octave;
negative degrees go below the root. The root may include an octave
(`"A2:minor"`); without one, octave 3 is used. Scale names with spaces are
written with colons (`"C:melodic:minor"`) or as a plain spaced string
(`scale('C4 bebop major')` is also accepted).

```js
n("0 2 4 6").scale("C:major")
n("0 2 4 6").scale("A2:minor:pentatonic").s("sawtooth")
n("-3 0 3 7").scale("<D:dorian G:mixolydian>")   // patterned scale changes
n("0 .. 7").scale("E:phrygian")
```

Reliable scale names: `major`, `minor`, `dorian`, `phrygian`, `lydian`,
`mixolydian`, `locrian`, `harmonic minor`, `melodic minor`,
`major pentatonic`, `minor pentatonic`, plus many exotic ones from tonal.js
(`bebop major`, `whole tone`, `ritusen`, ...). If unsure a name exists,
test in the REPL — an unknown scale name fails silently or errors.

`scale()` also quantizes: applying it to `note` patterns snaps numbers into
the scale. Sharps/flats on degrees push notes outside the scale
(`n("0 2# 4")`).

## Transposition

- `.transpose(n)` — shift by semitones (or interval strings like `"5P"`).
  Works on `note` patterns.
- `.scaleTranspose(n)` — shift by **scale steps**, staying inside the
  current `scale()`.
- `.add(n(x))` applied **before** `.scale()` moves by scale degrees;
  `.add(note(12))` moves by semitones. The argument must be keyed: a plain
  `.add(12)` on a `note`/`n` control pattern warns "Can't do arithmetic on
  control pattern" and silently does nothing.

```js
note("c3 eb3 g3").transpose("<0 5 7>")          // I IV V in semitones
n("0 2 4").add(n("<0 2 4 3>")).scale("C:major") // diatonic progression
note("c3 e3 g3").scale("C:major").scaleTranspose("<0 -1 -2>")
```

## Chord symbols: `chord()` + `voicing()`

`chord()` takes jazz-style symbols (`C`, `Am`, `Dm7`, `G7`, `C^7` = maj7,
`A7b13`, `Bb^7`, ...) and `voicing()` renders them as concrete notes using a
voicing dictionary that picks smooth voice leadings between successive chords.

```js
chord("<C^7 A7b13 Dm7 G7>").voicing().s("piano")
chord("<Am7 D7 G^7>*2").voicing().struct("x ~ x x ~ x ~ ~")
```

### Voicing controls

| Control | Meaning |
| --- | --- |
| `.dict(name)` | Choose the voicing dictionary (a default is provided). |
| `.anchor(note)` | Reference pitch the voicing is aligned to. |
| `.mode(m)` | How to align to the anchor: `below`, `duck` (below, skipping the anchor note), `above`. |
| `.offset(n)` | Shift to the nth-next voicing alternative. |
| `n()` with voicings | Treat the voicing like a scale and pick degrees from it. |

```js
chord("<C^7 Fm9>").dict('default').anchor("e4").mode("below").voicing()
chord("<C^7 A7 Dm7 G7>").voicing().n("0 1 2 3")   // arpeggiate the voicing
```

### Root notes

`rootNotes(octave = 2)` extracts the root of each chord symbol — ideal for
bass lines that follow the harmony.

```js
const prog = chord("<C^7 A7b13 Dm7 G7>");
stack(
  prog.voicing().s("piano"),
  prog.rootNotes(1).struct("x ~ x ~").s("sawtooth").lpf(400)
)
```

## Arpeggios: `arp()`

`arp(pat)` plays the notes of stacked chords one at a time, selected by
index pattern (0 = lowest). `arpWith(fn)` gives full programmatic control.

```js
note("<[c3,e3,g3,b3] [a2,c3,e3,g3]>").arp("0 1 2 3 2 1")
chord("<Dm7 G7 C^7>").voicing().arp("0 [0,2] 1 3")
```

## Putting it together — original example

```js
setcpm(84/4)
const harmony = chord("<Am7 D7 G^7 C^7>");
stack(
  harmony.voicing().s("piano").room(.4).gain(.7),
  harmony.rootNotes(2).s("sawtooth").lpf(500).struct("x ~ ~ x ~ ~ x ~"),
  n("0 4 2 7".fast(2)).scale("A:minor:pentatonic").s("triangle")
    .delay(.3).gain(.5)
)
```

## Cautions

- Chord symbol parsing is broad but not unlimited; stick to common forms
  (`m`, `7`, `m7`, `^7`/`maj7`, `9`, `b13`, `sus4` etc.) and test exotic ones.
- `n()` without `scale()` means **sample index**, not pitch.
- There is no automatic key signature: `scale()` affects only patterns it is
  chained to.
- `voicings('lefthand')`-style legacy usage exists in older examples; prefer
  `chord(...).voicing()` with optional `.dict()` in current Strudel.
