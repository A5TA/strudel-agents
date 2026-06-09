# Sounds and Samples

## `sound` / `s`

`s(name)` selects what plays each event: either a **sample** (an audio file
from the loaded sample maps) or a **synth** (`sine`, `sawtooth`, `square`,
`triangle`, noise types, etc. — see `synths.md`).

```js
s("bd hh sd hh")
note("c3 e3 g3").s("sawtooth")
note("c3 e3 g3").s("piano")
```

If you use `note()`/`n()` without `s()`, the default triangle synth plays.

## Default drum names

The standard sample map (loaded by default in the REPL) uses TidalCycles-style
abbreviations. Each name is a folder of several samples.

| Name | Sound | Name | Sound |
| --- | --- | --- | --- |
| `bd` | bass/kick drum | `oh` | open hi-hat |
| `sd` | snare drum | `cr` | crash cymbal |
| `rim` | rimshot | `rd` | ride cymbal |
| `cp` | clap | `ht` | high tom |
| `hh` | closed hi-hat | `mt` | mid tom |
| `lt` | low tom | `cb` | cowbell |
| `sh` | shaker/maracas | `tb` | tambourine |
| `perc` | misc percussion | `misc` / `fx` | other one-shots |

Other default sounds include pitched/instrument samples such as `piano`,
`casio`, `metal`, `jazz`, `east`, `crow`, `space`, `wind`, `insect`,
`numbers`, plus instrument samples from the VCSL library and `gm_`-prefixed
General MIDI soundfont instruments (e.g. `gm_acoustic_bass`,
`gm_epiano1` — browse the REPL "sounds" tab for exact names; don't invent
GM names).

## Selecting samples in a folder: `:n` and `.n()`

Each sound name maps to a list of files; pick one by zero-based index. Indexes
beyond the list wrap around.

```js
s("hh:0 hh:1 hh:2 hh:3")              // colon syntax in mini-notation
s("hh*8").n("0 1 2 3 4 5 6 7")        // same idea via .n()
s("casio").n("<0 1 2>")
```

`n` is "cheap": `s("bd").n("<0 3 5>")` is tidier than `"bd:0 bd:3 bd:5"`.

## Drum machine banks: `.bank()`

`.bank(name)` prefixes the drum machine name onto sample names
(internally `bd` → `RolandTR808_bd`), so generic patterns can switch kits.
Bank names are case-sensitive strings and can be patterned.

```js
s("bd*2, ~ cp, hh*8").bank("RolandTR808")
s("bd sd, hh*16").bank("<RolandTR808 RolandTR909>")   // alternate kits per cycle
s("bd sd").bank("RolandTR909").n("<0 1>")
```

Banks available with the default drum-machine sample set include
`RolandTR808`, `RolandTR909`, `RolandTR707`, `AkaiLinn`, `RhythmAce`,
`ViscoSpaceDrum`, `CasioRZ1` (check the REPL sounds tab for the full list —
there are many more from the tidal-drum-machines collection).

## Loading custom samples: `samples()`

```js
// 1. Name → file map with a base URL as second argument
samples({
  kick: 'kicks/k1.wav',
  stab: ['stabs/a.wav', 'stabs/b.wav'],   // array = multiple via :n
}, 'https://example.com/mysamples/');

// 2. A strudel.json manifest URL (may contain a _base key)
samples('https://example.com/mysamples/strudel.json');

// 3. GitHub shortcut: github:user/repo[/branch], expects strudel.json in root
samples('github:tidalcycles/dirt-samples');

// 4. Local folder over the helper server
//    (run `npx @strudel/sampler` in your samples folder)
samples('http://localhost:5432/');

// 5. shabda: fetch sounds from freesound.org by word
samples('shabda:rain:4,thunder:2');
```

After loading, use the map keys with `s()`: `s("kick*4, stab:1")`.

### Pitched samples

Give a sample a base pitch (or several keyboard regions) so `note()`
repitches it correctly; the sampler picks the closest region.

```js
samples({
  flute: { c4: 'flute/c4.wav', c5: 'flute/c5.wav' },
}, 'https://example.com/inst/');
note("c4 e4 g4 c5").s("flute")
```

## Playback controls

| Control | Meaning |
| --- | --- |
| `.speed(x)` | Playback rate; 2 = octave up + half length, negative = reversed. |
| `.begin(x)` | Skip into the sample; 0–1 of its length. |
| `.end(x)` | Truncate the sample; 0–1 of its length. |
| `.loop(1)` | Loop the sample (not tempo-synced by itself). |
| `.loopBegin(x)` / `.loopb` | Loop start point 0–1. |
| `.loopEnd(x)` / `.loope` | Loop end point 0–1. |
| `.cut(group)` | Choke group: a new sound in the group stops the previous one. |
| `.clip(x)` / `.legato(x)` | Multiply event duration; sound is cut when it ends. |
| `.loopAt(n)` | Stretch sample over n cycles (adjusts speed to fit tempo). |
| `.fit()` | Fit sample length to its event duration. |

```js
s("bd*4").speed("<1 2 -1>")
s("breaks:0").loopAt(2)                  // play a loop in time over 2 cycles
s("[oh hh]*4").cut(1)                    // closed hat chokes open hat
note("c3 e3 g3").s("piano").clip("<.5 1 2>")
s("space").begin("<0 .25 .5>").end(.6)
```

## Slicing and granular tricks

| Function | What it does |
| --- | --- |
| `.chop(n)` | Cut each sample into n parts, played in order — granular feel. |
| `.striate(n)` | Cut into n parts, but interlace the parts across pattern events. |
| `.slice(n, pat)` | Cut into n equal slices, trigger them by index pattern. |
| `.slice([0,.25,.6], pat)` | Slice at explicit 0–1 positions. |
| `.splice(n, pat)` | Like `slice` but repitches each slice to fit its step. |
| `.scrub(pat)` | Pattern the playhead position (optionally `"pos:speed"`). |

```js
s("breaks:1").fit().chop(8).rev()             // reversed chopped loop
s("breaks:1").slice(8, "0 1 2 3 0 1 [4 5] 7") // rearranged break
s("breaks:1").splice(8, "0 1*2 2 3 ~ 5 6 7")  // resynced to the cycle
s("pad:0").striate(16).gain(.7)
```

A classic recipe — re-ordered breakbeat that stays in tempo:

```js
samples('github:tidalcycles/dirt-samples')
s("breaks165").fit()
  .slice(8, "<0 1 2 3 4 5 6 7> <6 2> 3 <1 7>")
  .every(4, x => x.rev())
```

## Practical notes

- Loud clicks at slice/clip boundaries can be tamed with a tiny
  `.release(.01)` or lower `.gain()`.
- `n` and `note` are different: for samples `n` picks the **file**, `note`
  repitches it (if a base pitch is known) — see `gotchas.md`.
- Sample loading is async; the first cycles after evaluating `samples()` may
  be silent while files download.
