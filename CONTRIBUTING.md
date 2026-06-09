# Contributing to strudel-agents

Thanks for your interest in making Claude Code a better Strudel collaborator! Contributions of all kinds are welcome: new example patterns, agent and skill improvements, knowledge-base corrections, validation harness fixes, and new genre coverage.

Please read the [originality and copyright policy](#originality-and-copyright-policy) before contributing — it applies to everything in this repo.

## Adding a new example pattern

Examples live in `examples/<genre>/` as `.strudel` files (plain text Strudel code). To add one:

1. **Pick a genre directory** — one of the existing ones (`house/`, `techno/`, `drum-and-bass/`, `ambient/`, `hip-hop/`, `jungle/`, `acid/`, `downtempo/`), or propose a new genre in your PR description.
2. **Write an original pattern.** It must be your own composition — see the [originality policy](#originality-and-copyright-policy).
3. **Follow the style guide** below (one pattern per file, comment header, `setcpm` at the top).
4. **Verify it evaluates.** Every example must pass the validation harness:

   ```bash
   cd validation
   npm install
   node validate.mjs
   ```

   CI runs the same check on every PR; a pattern that fails validation will not be merged.
5. **Listen to it.** Paste it into [strudel.cc](https://strudel.cc) and make sure it actually sounds like the genre it claims to be. Validation proves the code runs; your ears prove it grooves.

### Style guide for Strudel code

- **One pattern per file.** Each `.strudel` file is a self-contained, paste-and-play piece.
- **`setcpm(...)` at the top** of the pattern, immediately after the header, so the tempo is explicit and easy to find.
- **Comment header block** at the top of every file:

  ```
  // Title: Midnight Conveyor
  // Genre: minimal techno
  // BPM: 132
  // Author: your-github-handle
  // Description: four-on-the-floor with off-beat stabs and a slow filter sweep

  setcpm(132/4)
  // ... pattern ...
  ```

- **Only use sounds that ship with Strudel** (the default sample banks and built-in synths) so patterns work for everyone without extra setup.
- **Prefer readable over clever.** These examples double as teaching material for the agents — name things clearly, keep lines short, and add brief comments where a technique is non-obvious.
- **No dead code.** Don't leave muted experiments or commented-out alternatives in the final file.

## Adding or improving an agent

Agents live in `agents/` as single Markdown files with YAML frontmatter:

```markdown
---
name: strudel-rhythm-architect
description: Drum programming, euclidean rhythms, swing, and groove construction in Strudel. Use for beats, breaks, and polyrhythms.
tools: Read, Glob, Grep
---

You are a rhythm specialist for Strudel...
```

Conventions:

- `name` must match the filename (without `.md`), be lowercase, hyphen-separated, and prefixed `strudel-` unless there's a strong reason not to.
- `description` should say both *what the agent does* and *when to invoke it* — Claude Code uses it to decide when to delegate.
- The body is the system prompt. Be specific about the agent's scope, point it at the relevant `knowledge/` files and skills, and tell it what *not* to do (e.g., the rhythm architect shouldn't write chord progressions).
- Keep agents focused. If a prompt is trying to cover two roles, it probably wants to be two agents — or a note in the composer's delegation logic.
- Update the agent table in `README.md` if you add or rename an agent.

## Adding or improving a skill

Skills live in `skills/<skill-name>/SKILL.md`, with YAML frontmatter:

```markdown
---
name: strudel-mini-notation
description: The mini-notation string language — sequences, subdivision, rests, polymeter, euclidean rhythms. Use when writing or debugging pattern strings.
---

# Strudel mini-notation
...
```

Conventions:

- The directory name and the frontmatter `name` must match.
- `description` should make it obvious when the skill applies, since it's what triggers loading.
- Skills are *lessons*, not dumps: distill, show small correct examples, and call out common mistakes. Cross-reference `knowledge/` files for the exhaustive details rather than duplicating them.
- A skill directory may include supporting files (referenced from `SKILL.md`) if the material genuinely needs them.
- Verify every code snippet in a skill actually evaluates — wrong examples are worse than no examples.
- Update the skill table in `README.md` if you add or rename a skill.

## Improving the knowledge base

`knowledge/*.md` files are distilled reference material the agents rely on. Corrections are especially valuable: if you find a function signature, parameter name, or behavior that doesn't match current Strudel, please fix it. Rewrite in your own words — never paste from the official docs (see below).

## PR checklist

Before opening a pull request, confirm:

- [ ] `node validation/validate.mjs` passes (run from `validation/` after `npm install`)
- [ ] New examples are original work with a complete comment header (title, genre, BPM, author) and `setcpm` at the top
- [ ] New examples were play-tested in [strudel.cc](https://strudel.cc)
- [ ] Agent/skill frontmatter follows the conventions above, and names match filenames/directories
- [ ] README catalog tables updated if you added or renamed an agent, skill, or genre
- [ ] No copyrighted material: no song transcriptions, no verbatim documentation text
- [ ] Commit messages and PR description explain *why*, not just *what*

## Originality and copyright policy

This repo is MIT-licensed, and we keep it that way by being strict about provenance:

- **No transcriptions or recreations of existing songs.** Don't contribute a pattern that reproduces the melody, bassline, chord progression *as a recognizable whole*, or arrangement of a copyrighted work — not even "inspired by X" patterns that a listener would identify as X. Genre conventions (a four-on-the-floor kick, a 12-bar blues, an amen-style break programmed from scratch) are fine; specific songs are not.
- **No verbatim copying from documentation.** Knowledge-base and skill content must be rewritten and distilled in your own words. Strudel's docs and source are AGPL-3.0; this repo contains only original prose and original patterns, which is what allows it to be MIT.
- **You own what you contribute.** By submitting a PR you affirm the contribution is your own original work and you license it under the MIT license.

If you're unsure whether something crosses a line, ask in the PR or open an issue first.

## Code of conduct

Be kind. This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md); by participating you agree to uphold it.
