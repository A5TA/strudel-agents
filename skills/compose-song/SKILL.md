---
name: compose-song
description: Orchestrate the full strudel-* agent team to compose one complete, runnable Strudel track from a genre plus a description of how it should feel. Locks a shared brief (BPM, key/mode, kit), fans out to the genre, rhythm, harmony, and sound-design specialists, assembles the parts with the arranger, runs the groove critic, and delivers a single paste-and-play code block. Use when the user wants a whole song/beat/track made end-to-end ("make me a dark melodic techno track that feels like driving at night"), not just one layer.
---

# Compose a song — multi-agent orchestrator

You are the **conductor**. The user gives a genre and a feeling; you drive the
`strudel-*` specialist subagents to produce one finished, paste-and-play
Strudel track. You run in the main conversation, so **you** own the Agent tool —
the specialists cannot call each other, so all fan-out and all integration
happen here, in you.

Read `CLAUDE.md`'s rules first. They are non-negotiable and carry through every
step: **original music only**, **only verified Strudel API** (attested in
`knowledge/`), **one runnable code block**, and **run the pre-ship checklist**
from `knowledge/gotchas.md` before declaring done.

## Inputs

Invoked as `/compose-song <genre> — <how it should feel>` (the `args` string).
Examples: `acid — anxious, late-night, building to a frenzy`;
`lo-fi hip-hop — rainy Sunday, nostalgic, unhurried`.

- **Missing the feel?** Ask one short question — mood/energy is what
  differentiates the track; don't guess it.
- **Missing the genre but the feel is vivid?** Propose the closest genre and
  proceed, stating the choice.
- **"Surprise me" / both vague?** Pick a genre+mood you can execute well, say so
  in one line, and go. Don't stall.

## The pipeline

```
brief → [genre-specialist] → lock spec
      → [rhythm-architect ∥ harmony-theorist]   (parallel — independent)
      → integrate (you)
      → [sound-designer] → patch & mix
      → [arranger] → structure
      → [groove-critic] → review → you apply blocking fixes
      → deliver one code block + save to output/<song>/vN.strudel & validate
```

Spawn each specialist with the Agent tool. Their registered `subagent_type`
names are the bare roles below; when this repo is installed as a plugin they may
be namespaced (e.g. `strudel-agents:strudel-rhythm-architect`) — use whichever
form the environment exposes. **If the specialists aren't available at all**,
fall back to the single `strudel-composer` agent, or do every step yourself
using `knowledge/` and the `genre-styles` / `music-theory` / `rhythm-and-groove`
/ `strudel-sound-design` / `song-arrangement` skills. You are fully capable
solo; the team just makes each layer better.

### 1. Lock the spec (sequential — everything downstream depends on it)

Interpret the brief, then call **`strudel-genre-specialist`** with the genre and
feel to get conventions (BPM range, kit, drum skeleton, harmony habits,
signature FX). Optionally read `examples/<genre>/` for verified reference
patterns. Then **commit to concrete values** and write them down as the *shared
spec* — one block you will paste verbatim into every later agent so their layers
interlock:

```
SHARED SPEC (every layer must obey this)
- Genre: <genre>            Feel: <2–4 adjectives from the brief>
- BPM: <one number>         → setcpm(<bpm>/4)   [the orchestrator sets this once]
- Key/mode: <root>:<mode>   (e.g. C:minor, F:dorian) — every pitched voice uses it
- Kit / bank: <RolandTR909 | RolandTR808 | breaks | perc ...>
- Energy curve: <e.g. 3→5→8→4→9→2>   Form: <full arrange() | live $: loop>
- Register map: bass <oct 1–2>, chords <3–4>, lead <4–5>
```

Translate the *feel* into music decisions and say why in one line each:
brightness → mode (minor/phrygian dark, lydian/major bright, dorian cool-jazzy,
mixolydian warm); energy → BPM within the genre range + drum density; space →
reverb/delay amount and how sparse the arrangement is.

### 2. Build the layers (parallel)

In **one message**, spawn two agents at once (independent work):

- **`strudel-rhythm-architect`** — the drum section only.
- **`strudel-harmony-theorist`** — bass + chords/pads + a short original lead
  motif, all in the locked key.

Give each the **full shared spec** verbatim, and tell them:
*"Return ONLY your section as a runnable Strudel snippet, one `$:` voice per
line with a one-line role comment. **Omit `setcpm`** — the orchestrator sets
tempo once. Stay in `<root>:<mode>`, kit `<bank>`, and your register band."*

### 3. Integrate (you)

Combine the returned voices into one draft. This is your job, not a subagent's:

- Exactly **one** `setcpm(bpm/4)` at the top; strip any the agents included.
- Every voice prefixed `$:` (or all inside one `stack()`/`arrange()`).
- Resolve clashes the specialists couldn't see across the boundary:
  rhythm collisions (bass and kick fighting → push bass off-beat), and
  frequency masking (note it for the sound designer to carve).
- Confirm all pitched voices actually share the declared scale.

### 4. Patch & mix

Call **`strudel-sound-designer`** with the integrated draft + shared spec:
*"Patch each voice's timbre, set ADSR/filters, route delay/reverb sends to
orbits, gain-stage to the targets, and carve masking with filters. Preserve the
notes and rhythms — change only how it sounds. Return the full patched stack."*
Gain targets: kick .9–1, snare/clap .7–.9, hats .3–.6, bass .7–.9, pads
.35–.55, leads .5–.7, FX/texture .2–.4.

### 5. Arrange

Call **`strudel-arranger`** with the patched loops + shared spec's energy curve
and form choice:
*"Turn these loops into a <full track via arrange() | live $: performance
script>. Section lengths 4/8/16 cycles, build the stated energy curve, put a
transition (fill / filter sweep / dropout) at every boundary. Derive section
variants from the loops with transforms — don't rewrite the material."*
Default to `arrange()` for "make me a track", a `$:`/`_$:` live script if the
brief says loop/jam/perform.

### 6. Review and fix

Call **`strudel-groove-critic`** (read-only) on the arranged track. Then **you**
apply its **blocking** fixes (it never edits). If it returns blocking issues,
fix and, if substantial, re-run the critic once — don't loop forever. Pick the
highest-value non-blocking improvements; skip the rest. When the critic says
SHIP, ship.

### 7. Deliver

Run the **pre-ship checklist** from `knowledge/gotchas.md` yourself one last time
(it's the contract — see the condensed version below). Then respond with:

1. A **3–6 line plan**: tempo, key/mode + why it fits the feel, palette, form.
2. The **complete code block** — one fenced block, paste-and-play, header
   comment `// @title <original> @by compose-song @genre <genre>`.
3. **2–4 live-tweak bullets**: what to unmute, push, or sweep to take it further.

**Always save the finished song** to `output/<kebab-title>/v1.strudel` — this
folder is git-ignored; generated songs never go in `examples/` (that's reserved
for the toolkit's curated reference patterns). Use the header
`@title @genre @bpm @by @license`, then validate:
`cd validation && node validate.mjs ../output/<kebab-title>/v1.strudel`.

- **Reworks/versions:** when the user asks for changes to a song you already
  made, add the next `v<N>.strudel` in that same `output/<kebab-title>/`
  subfolder — don't overwrite the prior version.
- **No remnants:** deliver exactly the one file (plus any prior versions). The
  specialist subagents return code to *you*; only the orchestrator writes the
  final file. Clean up any scratch files a subagent wrote into the repo.

## Pre-ship checklist (condensed — full list in knowledge/gotchas.md)

- Every mini-notation string is **double-quoted**; function args are **not**
  (`.every(4, x => x.rev())`, never `"rev"`). No Tidal-isms (`$`, `#`,
  `sound "bd"`).
- Exactly **one** `setcpm(bpm/4)` at the top.
- Every top-level voice has `$:` (or lives in one `stack()`/`arrange()`) —
  bare consecutive expressions silently drop all but the last.
- `n()` used as **pitch always has `.scale()`**; `note("0 2 4")` = inaudible
  low MIDI — use real notes/MIDI.
- Euclid is `(hits, slots, rotation?)` — `bd(8,3)` is almost certainly swapped.
- `every/sometimes/off/jux/when/superimpose` take **functions**, `(n, fn)` order.
  Adds on control patterns must be keyed (`.add(note(12))`, not `.add(12)`).
- Only **attested** sound/bank names (exact CamelCase banks); misspellings fail
  **silently**. `delaytime` is **seconds** (compute from BPM); `delayfeedback` < 1.
- Gains ≤ ~1 (and the **sum** across layers stays sane); `lpf` 20–20000; `pan` 0–1.
- Mentally play **one cycle of every voice** and count events against the intent.

## Scaling the effort

- **Quick beat / one genre, clear vibe:** you may skip the genre-specialist
  (use the `genre-styles` skill inline) and the arranger (deliver a tight live
  `$:` loop), but still run the critic and the checklist.
- **"Make it a full track" / ambitious or unusual brief:** run the whole
  pipeline, and consider a second harmony or rhythm pass if the critic flags the
  core material rather than the polish.

Always keep layers interlocked through the **one shared spec** — that single
source of truth (same BPM, key, kit, registers) is what makes independently
generated parts sound like one song instead of four.
