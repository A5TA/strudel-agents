# Strudel Knowledge Base

Distilled reference material about [Strudel](https://strudel.cc) — the
browser live-coding language that ports TidalCycles to JavaScript — for use
by the agents and skills in this repo when composing Strudel code.

**Provenance:** distilled from the official Strudel documentation
(strudel.cc) and the Strudel source code, rewritten in our own words; all
code examples are original. No documentation prose is copied verbatim.

## Files

| File | Covers |
| --- | --- |
| `mini-notation.md` | The full mini-notation string syntax: sequences, rests, `[]` `<>` `*` `/` `!` `@` `,` `\|` `?`, euclidean `(p,s,r)`, polymeter `{}%`, ranges `..`, sample selection `:`, and cycle-based timing. |
| `functions-reference.md` | Core pattern functions by category: creation, signals, time, conditional/structural, randomness, accumulation/layering — signatures plus one-line examples. |
| `sounds-and-samples.md` | `s()`, default drum names, drum-machine banks, `:n`/`.n()` selection, `samples()` loading, slicing (`chop`, `slice`, `splice`, `striate`), playback controls (`speed`, `begin/end`, `cut`, `clip`, `loopAt`, `fit`). |
| `synths.md` | Built-in waveforms and noise, ADSR envelopes, vibrato, FM synthesis, wavetables (`wt_`), ZZFX, additive-synthesis notes. |
| `effects.md` | Gain/dynamics, panning, filters and filter envelopes, pitch envelope, delay/reverb sends and orbits, distortion/crush/coarse, phaser, tremolo, sidechain ducking. |
| `tonal-and-theory.md` | Note names and MIDI numbers, `scale()` + `n()` degrees, transposition, `chord()`/`voicing()` and voicing controls, `rootNotes`, arpeggios with `arp`. |
| `patterns-and-structure.md` | The cycle/FRP mental model, `setcpm` ↔ BPM, REPL conventions (`$:`, `_$:`, `hush`), style conventions, and full track skeletons with `stack()` and `arrange()`. |
| `gotchas.md` | Frequent mistakes (Tidal-vs-JS syntax, quoting, `n` vs `note`, euclid order, immutability, tempo) and a pre-ship checklist. |

## Usage notes for agents

- Accuracy beats completeness: anything marked "verify in REPL" is
  uncertain — prefer the well-attested API.
- When inventing music, write original material only; never reproduce
  existing songs or copyrighted melodies.
