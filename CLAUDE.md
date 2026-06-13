# strudel-agents — instructions for Claude Code

This repo is a Claude Code toolkit (subagents + skills + knowledge base +
verified examples) for composing music in [Strudel](https://strudel.cc).

## Working in this repo

- **Validate before committing example changes.** Every `examples/**/*.strudel`
  file must pass the harness:
  ```sh
  cd validation && npm install && node validate.mjs
  ```
  Run `node validate.mjs --self-test` if you change the harness itself.
- **Originality policy.** All pattern code must be original. Never transcribe
  or approximate existing songs or copyrighted melodies. Knowledge-base prose
  is distilled and rewritten from the official Strudel docs — never copied
  verbatim.
- **Consult `knowledge/` before writing Strudel code**, especially
  `knowledge/gotchas.md` (pre-ship checklist) and
  `knowledge/functions-reference.md`. Don't invent functions or sound names.

## Generated songs go to `output/`

- **Always write a finished/composed song to `output/<song-title>/v<N>.strudel`**
  — never to `examples/`. `output/` is git-ignored (local user output, not part
  of the shipped toolkit).
- **One file per song, no remnants.** Deliver exactly one file; clean up any
  intermediate/scratch files a subagent may have written. Only create another
  file when the user asks for a rework — then add the next `v<N>.strudel` in that
  song's subfolder instead of overwriting the previous version.
- Specialist subagents should **return their code to the orchestrator**, which
  writes the single final file — they should not scatter files into the repo.
- Still validate the saved file:
  `cd validation && node validate.mjs ../output/<song-title>/v<N>.strudel`.

## File conventions

- `examples/<genre>/<name>.strudel` — **curated reference patterns shipped with
  the toolkit** (not generated user songs — those go to `output/`, see above);
  one pattern per file; comment header with `@title`, `@genre`, `@bpm`, `@by`,
  `@license`; `setcpm(bpm/4)` near the top.
- `agents/*.md` — Claude Code subagents: YAML frontmatter (`name`,
  `description`, optional `tools`), then the system prompt.
- `skills/<name>/SKILL.md` — Agent Skills: YAML frontmatter (`name`,
  `description`), then the skill body.
- `knowledge/*.md` — reference docs; keep accuracy over completeness, mark
  uncertain APIs with "verify in REPL".
