#!/usr/bin/env bash
# install.sh — install strudel-agents subagents and skills for Claude Code.
#
# Usage:
#   ./install.sh                  # install to ~/.claude (user-level)
#   ./install.sh --project [dir]  # install to <dir>/.claude (default: cwd)
#   ./install.sh --uninstall      # remove previously installed files
#   ./install.sh --force          # overwrite existing files
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="$HOME/.claude"
MODE="install"
FORCE=0

while [ $# -gt 0 ]; do
  case "$1" in
    --user) TARGET="$HOME/.claude" ;;
    --project)
      shift_dir="${2:-$PWD}"
      case "$shift_dir" in --*|"") shift_dir="$PWD" ;; *) shift ;; esac
      TARGET="$shift_dir/.claude"
      ;;
    --uninstall) MODE="uninstall" ;;
    --force) FORCE=1 ;;
    -h|--help)
      sed -n '2,8p' "$0"; exit 0 ;;
    *) echo "Unknown option: $1 (try --help)" >&2; exit 1 ;;
  esac
  shift
done

AGENTS_SRC="$REPO_DIR/agents"
SKILLS_SRC="$REPO_DIR/skills"

if [ "$MODE" = "uninstall" ]; then
  removed=0
  if [ -d "$AGENTS_SRC" ]; then
    for f in "$AGENTS_SRC"/*.md; do
      [ -e "$f" ] || continue
      dest="$TARGET/agents/$(basename "$f")"
      if [ -e "$dest" ]; then rm "$dest"; echo "removed $dest"; removed=$((removed+1)); fi
    done
  fi
  if [ -d "$SKILLS_SRC" ]; then
    for d in "$SKILLS_SRC"/*/; do
      [ -d "$d" ] || continue
      dest="$TARGET/skills/$(basename "$d")"
      if [ -d "$dest" ]; then rm -r "$dest"; echo "removed $dest"; removed=$((removed+1)); fi
    done
  fi
  echo "Uninstalled $removed item(s) from $TARGET."
  exit 0
fi

mkdir -p "$TARGET/agents" "$TARGET/skills"
installed=0
skipped=0

if [ -d "$AGENTS_SRC" ]; then
  for f in "$AGENTS_SRC"/*.md; do
    [ -e "$f" ] || continue
    dest="$TARGET/agents/$(basename "$f")"
    if [ -e "$dest" ] && [ "$FORCE" -ne 1 ]; then
      echo "skip (exists): $dest  — use --force to overwrite"
      skipped=$((skipped+1))
      continue
    fi
    cp "$f" "$dest"
    echo "installed agent: $dest"
    installed=$((installed+1))
  done
fi

if [ -d "$SKILLS_SRC" ]; then
  for d in "$SKILLS_SRC"/*/; do
    [ -d "$d" ] || continue
    name="$(basename "$d")"
    dest="$TARGET/skills/$name"
    if [ -d "$dest" ] && [ "$FORCE" -ne 1 ]; then
      echo "skip (exists): $dest  — use --force to overwrite"
      skipped=$((skipped+1))
      continue
    fi
    rm -rf "$dest"
    cp -r "$d" "$dest"
    echo "installed skill: $dest"
    installed=$((installed+1))
  done
fi

echo
echo "Done: $installed installed, $skipped skipped → $TARGET"
echo "Restart Claude Code (or run /agents and /skills) to pick up the new tools."
