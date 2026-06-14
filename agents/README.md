# Agents

Claude Code subagents for composing music in [Strudel](https://strudel.cc). Each agent is a single `.md` file: YAML frontmatter (`name`, `description`, optional `tools`) followed by its system prompt. All of them draw on the verified reference material in [`knowledge/`](../knowledge/) and follow the same ground rules: original music only, verified Strudel API only, runnable output, and the pre-ship checklist from `knowledge/gotchas.md`.

## Catalog

| Agent | Role | When to use |
|-------|------|-------------|
| [`strudel-composer`](strudel-composer.md) | Lead composer / orchestrator — brief in, complete track out | Any "write/make me a track" request; the default entry point |
| [`strudel-rhythm-architect`](strudel-rhythm-architect.md) | Drums and groove — euclids, swing, fills, polymeter, humanization | Beats, breaks, "make it groove harder", percussion-only layers |
| [`strudel-harmony-theorist`](strudel-harmony-theorist.md) | Keys, scales, chord progressions, basslines, motif-based melodies | Harmonic content, melodies, "make it jazzier/darker" |
| [`strudel-sound-designer`](strudel-sound-designer.md) | Timbre and mix — patches, ADSR, FM, filters, sends/orbits, gain staging | "Make it fatter/dirtier", FX chains, muddiness/masking problems |
| [`strudel-arranger`](strudel-arranger.md) | Structure — `arrange()` forms or `$:` performance scripts, energy curves, transitions | Turning loops into a track with intro, drops, breakdowns |
| [`strudel-groove-critic`](strudel-groove-critic.md) | Read-only reviewer — syntax gotchas, musicality, authenticity, originality | After any code is produced; "why does this sound stiff?" |
| [`strudel-genre-specialist`](strudel-genre-specialist.md) | Genre consultant — BPM, skeletons, palettes, signature moves per genre | Starting a genre-specific piece; "what makes it sound like X?" |

## How they collaborate

`strudel-composer` is the conductor: it interprets the brief, asks `strudel-genre-specialist` for conventions, then has `strudel-rhythm-architect`, `strudel-harmony-theorist`, and `strudel-sound-designer` generate and shape the layers (sharing one BPM, key, and kit so everything interlocks). `strudel-arranger` assembles the layers into a full structure, and `strudel-groove-critic` reviews the result — flagging blocking issues back to the composer before sign-off. Every agent also works standalone, and the composer can do the whole job alone when the specialists aren't installed.

The critic is deliberately read-only (`Read`, `Glob`, `Grep`): it reports issues with suggested fixes but never edits files itself.

## Installation

See the [repo root README](../README.md) for the two install options (the Claude Code plugin, or manually copying these files into `.claude/agents/`).
