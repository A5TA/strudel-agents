---
name: genre-styles
description: Genre conventions for composing in Strudel — BPM, drum skeletons, bassline and harmony approaches, and signature effects for house, techno, drum-and-bass, ambient, lo-fi hip-hop, acid, jungle, and downtempo/trip-hop, each as a compact ready-to-adapt snippet. Use when the user asks for music in a specific genre or style, or wants a track to sound more authentically like one.
---

# Genre cheat-sheets

Each entry: tempo line, drum skeleton, bass, harmony, signature moves —
as compact original snippets. Adapt, don't paste verbatim. One cycle = one
4/4 bar, so `setcpm(bpm/4)`.

## House — 124 BPM

Four-on-the-floor kick, claps on 2 & 4, **open hats on the offbeats**,
warm 7th-chord stabs.

```js
setcpm(124/4)
$: s("bd*4").bank("RolandTR909").gain(.95)
$: s("~ cp ~ cp, [~ oh]*4").bank("RolandTR909").gain(.6).cut(1)
$: s("hh*8").bank("RolandTR909").gain("[.4 .7]*4").swingBy(.1, 4)
$: note("<c2 c2 eb2 f2>(5,8)").s("sawtooth").lpf(600).decay(.15).sustain(.2).gain(.8)
$: chord("<Cm7 ~ Fm7 ~>").voicing().s("sawtooth")
  .struct("~ x ~ [~ x]").decay(.2).sustain(0).lpf(2000).gain(.45).room(.3)
```

Signature: offbeat `oh` with `.cut(1)`, plucky stab envelopes
(`decay` short, `sustain` 0), light hat swing.

## Techno — 130–135 BPM

Rumbling kick, minimal stabs, hypnotic modulated percussion. Less harmony,
more texture; let slow signals do the arranging.

```js
setcpm(132/4)
$: s("bd*4").bank("RolandTR909").gain(.95).shape(.3)        // rumble via drive
$: s("hh*16").gain("[.5 .25]*8").hpf(7000).pan(sine.slow(3).range(.3,.7))
$: s("rim(3,8,2)").gain(.4).delay(".4:.17:.5").orbit(2)
$: note("<c2 c2 c2 eb2>*8").s("sawtooth").ftype("ladder")
  .lpf(perlin.slow(8).rangex(200, 1500)).lpq(8)
  .decay(.1).sustain(0).gain(.75)
```

Signature: one or two notes only, `ftype("ladder")` + slow `perlin`/`sine`
filter drift, percs through a delay on their own orbit.

## Drum & bass — 172–176 BPM

Broken two-step break (kick 1, snare 3, displaced kick), heavy sub.
If break samples are loaded, chop with `slice`/`splice`; otherwise
synthesize the break from drum hits.

```js
setcpm(174/4)
// synthesized two-step break
$: s("bd ~ ~ ~ sd ~ ~ bd ~ ~ bd ~ sd ~ ~ ~").gain(.9)
$: s("hh*16").gain("[.5 .3]*8").hpf(8000).degradeBy(.1)
$: note("<c1 c1 eb1 g1>").s("sine").gain(.85).clip(.9)       // sustained sub, one note/bar
$: chord("<Cm9 Ab^7>/2").voicing().s("sawtooth")
  .attack(.3).release(.5).lpf(1200).gain(.3).room(.5).orbit(2)
```

With samples loaded (`samples('github:tidalcycles/dirt-samples')`):

```js
$: s("breaks165").fit().slice(8, "0 1 2 3 <4 0> 5 [6 3] 7")
  .every(4, x => x.rev())
```

Signature: sub from `sine` an octave below everything, snare locked to
beat 3, chopped/resequenced break for variation.

## Ambient — 60–80 BPM (or unmetered feel)

Slow attacks, huge rooms, lydian or major-pentatonic calm. Often no drums;
let `<>` alternation and long `slow` arcs supply the form.

```js
setcpm(70/4)
$: chord("<F^7 G7 Em7 Am7>/4").voicing().s("sawtooth")
  .attack(1.5).release(2.5).gain(.35)
  .lpf(sine.slow(16).rangex(400, 2500)).room(.8).roomsize(8)
$: n("<0 4 ~ 2 ~ 6 ~ ~>/2").scale("F:lydian")
  .s("triangle").attack(.4).release(1.5)
  .gain(.4).delay(".5:.4:.6").pan(perlin.slow(6).range(.2,.8))
$: s("crackle*4").density(.03).gain(.3)                      // air
```

Signature: `/4`-stretched harmony (one chord over 4 cycles),
attack ≥ 1s, `room` near max, drifting pan, no transients.

## Lo-fi hip-hop — 70–90 BPM

Lazy swung hats, jazzy 7th/9th chords, dusty degradation
(`crush`/`coarse`), boom-bap kick/snare.

```js
setcpm(80/4)
$: s("bd ~ [~ bd] ~, ~ sd ~ sd").bank("RolandTR808").gain(.9)
$: s("hh*8").bank("RolandTR808").gain("[.6 .3]*4").swingBy(.25, 4)
$: chord("<Dm9 G7 C^7 Am7>").voicing().s("piano")
  .gain(.55).crush(8).coarse(2).room(.3)
$: chord("<Dm9 G7 C^7 Am7>").rootNotes(1)
  .s("sine").struct("x ~ ~ x ~ ~ ~ ~").gain(.8)
$: s("crackle*2").density(.1).gain(.25)                      // vinyl dust
```

Signature: heavy `swingBy(.2–.33, 4)`, `crush(8)`+`coarse(2)` on keys,
ii–V–I-flavoured changes, crackle bed.

## Acid — 125–140 BPM

The 303 recipe: sawtooth 16ths, closed low-pass with **high resonance**,
cutoff ridden by slow signals, occasional octave jumps and slides.

```js
setcpm(130/4)
$: s("bd*4").bank("RolandTR909").gain(.95)
$: s("~ cp, hh*8?0.1").bank("RolandTR909").gain(.5)
$: note("a1 a1 [a1 a2] a1 c2 a1 [g1 g2] a1")
  .s("sawtooth").ftype("ladder")
  .lpf(sine.slow(4).rangex(150, 2500)).lpq(18)
  .lpenv(4).lpdecay(.1).decay(.15).sustain(0)
  .gain(.75).rarely(x => x.add(note(12))).distort("1.5:.7")
```

Signature: `lpq` 15+, `lpenv`+`lpdecay` per-note squelch on top of a slow
cutoff LFO, one repeating note with neighbour-tone deviations, mild distort.

## Jungle — 160s BPM

Chopped, reshuffled breakbeats over deep reggae-leaning bass; sparser and
swungier than DnB, with ragga-style stabs and big reverb hits.

```js
setcpm(160/4)
// programmed amen-style chop (or use slice on a loaded break, as in DnB)
$: s("bd ~ [~ bd] sd ~ [sd ~] [~ bd] [~ sd]").gain(.9)
  .every(4, x => x.jux(rev)).sometimesBy(.15, x => x.ply(2))
$: s("hh(7,16)").gain(.4).hpf(8000)
$: note("<c1 c1 eb1 f1>").struct("x ~ ~ x ~ ~ x ~")
  .s("sine").gain(.85).clip(.8)                                // dub bass, lazy phrasing
$: chord("<Cm Cm Ab Bb>/2").voicing().s("sawtooth").struct("~ x ~ ~")
  .decay(.2).sustain(0).gain(.35).room(.6).orbit(2)            // offbeat skank
```

Signature: break chops mutated by `jux(rev)`/`ply`, bass with rests and
held notes (dub phrasing), offbeat minor stabs in reverb.

## Downtempo / trip-hop — 80–110 BPM

Heavy, dragging swung drums, dark minor harmony, cavernous space.

```js
setcpm(90/4)
$: s("bd ~ ~ bd ~ ~ sd ~").gain(.9).shape(.3)
$: s("~ sd ~ sd").gain(.75).room(.4).roomsize(5)
$: s("hh*8").gain("[.5 .25]*4").swingBy(.2, 4).crush(10)
$: note("<f1 f1 ab1 c2>").struct("x ~ ~ x ~ ~ ~ ~")
  .s("sawtooth").lpf(450).gain(.8)
$: chord("<Fm Fm Db^7 C7>/2").voicing().s("piano")
  .gain(.45).room(.5).coarse(3)
$: n("0 ~ ~ 3 ~ 2 ~ ~").scale("F:minor:pentatonic")
  .s("triangle").gain(.4).delay(".5:.3:.6").orbit(2)
```

Signature: half-time feel (snare late and heavy), minor key with a
dominant turn (`C7` back to `Fm`), degraded textures, long delays.

---

**General rules:** verify any genre snippet against the syntax checklist
(`strudel-syntax` skill); keep one sub-heavy voice at a time; tempo
always via `setcpm(bpm/4)` once. Sound names and controls here are all
attested in `knowledge/sounds-and-samples.md`, `knowledge/synths.md`, and
`knowledge/effects.md`.
