# Example patterns

Original, paste-and-play [Strudel](https://strudel.cc) pieces, organised by
genre. Every file uses only sounds that ship with the Strudel REPL (default
drum kits, drum-machine banks, `piano`, and the built-in synths), so nothing
needs to load from the network.

## Catalog

| File | Genre | BPM | Description |
| --- | --- | --- | --- |
| [`house/glasshouse-stomp.strudel`](house/glasshouse-stomp.strudel) | house | 124 | Four-on-the-floor with offbeat open hats and syncopated 7th-chord stabs over a ii-V-I-vi in F major. |
| [`house/cellar-organ.strudel`](house/cellar-organ.strudel) | house | 122 | Deep house: organ-ish square chords on an i-IV dorian vamp with a rolling root-and-fifth bassline. |
| [`techno/rust-conveyor.strudel`](techno/rust-conveyor.strudel) | techno | 132 | Driving techno: rumble kick (909 + reverbed sine boom), perlin-warped percs, dark F-minor stab riff. |
| [`techno/grey-loop.strudel`](techno/grey-loop.strudel) | techno | 132 | Hypnotic minimal: one G-minor 16th pulse carved by perlin/sine filter motion over a skeleton kit. |
| [`drum-and-bass/skyline-two-step.strudel`](drum-and-bass/skyline-two-step.strudel) | drum and bass | 174 | Two-step with a walking E-minor sine sub, airy minor-9 pad and skipping 16th hats. |
| [`drum-and-bass/black-circuit.strudel`](drum-and-bass/black-circuit.strudel) | drum and bass | 174 | Dark roller: ghost-snare 16ths and a detuned reese prowling i-bIII-v in F minor. |
| [`ambient/lydian-overpass.strudel`](ambient/lydian-overpass.strudel) | ambient | 60 | Slow F-lydian pad cycle with glacial attacks, a huge room and a floating #4-flavoured line. |
| [`ambient/rain-on-glass.strudel`](ambient/rain-on-glass.strudel) | ambient | 70 | Generative Eb-pentatonic droplets from `irand` + `degrade` over a perlin-filtered quartal pad. |
| [`lo-fi-hip-hop/attic-dust.strudel`](lo-fi-hip-hop/attic-dust.strudel) | lo-fi hip hop | 80 | Swung boom-bap: m9/maj7 piano voicings on a ii-V-I-VI in C, crushed hats, crackle dust. |
| [`lo-fi-hip-hop/window-seat.strudel`](lo-fi-hip-hop/window-seat.strudel) | lo-fi hip hop | 76 | Lazy head-nodder: a sparse pentatonic melody trailed by `off()` echoes over ii-V-I keys in G. |
| [`acid/citrus-press.strudel`](acid/citrus-press.strudel) | acid | 130 | 303-style C-minor 16th sawtooth line, ladder filter swept by a slow sine, gain-pattern accents. |
| [`acid/night-greenhouse.strudel`](acid/night-greenhouse.strudel) | acid | 128 | Swampier acid in A minor: velocity-accented 16ths under a slow filter wobble, 808 kit. |
| [`jungle/vine-runner.strudel`](jungle/vine-runner.strudel) | jungle | 160 | A break programmed from the stock 909 kit (ghost chops, bar flips) over a deep C-minor reggae bass. |
| [`jungle/concrete-canopy.strudel`](jungle/concrete-canopy.strudel) | jungle | 160 | Darker jungle: tom-driven euclid breaks with snare drags, a tresillo sub in F minor, foghorn stabs. |
| [`downtempo/slate-and-smoke.strudel`](downtempo/slate-and-smoke.strudel) | downtempo | 90 | Trip-hop: heavy swung kit, dark Rhodes-ish piano on i-iv-VI-V7 in D minor, dub rim echoes. |
| [`downtempo/harbor-fog.strudel`](downtempo/harbor-fog.strudel) | downtempo | 86 | Half-time sway in G minor: sleepy perlin-filtered sawtooth chords, long dub delay tails. |

## How to play one

1. Open the file and copy its entire contents.
2. Go to [strudel.cc](https://strudel.cc) and paste it into the editor.
3. Press **Ctrl+Enter** to evaluate (Ctrl+. stops playback).

Each voice is prefixed with `$:`; change any prefix to `_$:` to mute that
layer while it plays.

## Originality

Every pattern here is an original composition written for this repository.
None reproduces the melody, bassline, chord progression or arrangement of an
existing song — only genre conventions (four-on-the-floor kicks, two-step
drum placement, euclidean rhythms, ii-V-I progressions) are used. All files
are MIT-licensed, like the rest of the repo.

## Validation

CI validates every file in this directory on each push and pull request: the
[validation harness](../validation/README.md) transpiles and evaluates each
pattern headlessly and asserts it produces events. A file that fails
validation will not be merged. To check locally:

```sh
cd validation
npm install
node validate.mjs "../examples/**/*.strudel"
```
