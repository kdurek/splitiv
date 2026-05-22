---
name: sync-upstream
description: Sync fork with upstream template using GitHub compare diff. Reads base SHA from UPSTREAM.md, fetches aggregate diff between base and upstream main, ports viable file changes into local fork, reports skipped files. Use when user says "sync upstream", "pull upstream changes", "update from upstream", or invokes /sync-upstream.
---

# Upstream Sync

Port upstream template changes into fork via single compare diff. No per-commit walk. No git ops.

## Inputs

`UPSTREAM.md` at repo root with:

- `Repository: <github-url>` — upstream repo URL.
- `Base: <sha>` — fork-point SHA (or last-synced SHA). Skill updates this after run.
- `Updated: <date>` — last sync date. Skill updates this after run.

Example:

```
Repository: https://github.com/owner/template-repo
Base: abc123def456

Updated: 2026-01-01
```

## Steps

### 1. Parse UPSTREAM.md

- Extract `owner/repo` from `Repository:`.
- Extract `Base:` SHA.
- Abort with message if either missing.

### 2. Fetch compare diff

```bash
gh api "repos/<owner>/<repo>/compare/<base>...main" --paginate
```

Yields:

- `commits[]` — all commits in range.
- `files[]` — aggregate file diff (`filename`, `status`, `patch`, `previous_filename` for renames).

Capture `commits[-1].sha` → new base SHA for post-run bump.

### 3. Per-file walk

For each entry in `files[]`:

| Condition                                                                            | Action                                                              |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `status=added`, local file missing                                                   | Create file from patch                                              |
| `status=added`, local file exists                                                    | Skip, reason "already exists locally"                               |
| `status=removed`, local file exists                                                  | Delete local file                                                   |
| `status=removed`, local file missing                                                 | No-op                                                               |
| `status=renamed`                                                                     | Move local from `previous_filename` to `filename`, then apply patch |
| `status=modified`, local file missing                                                | Skip, reason "path not found locally"                               |
| Binary (no `patch` field)                                                            | Skip, reason "binary"                                               |
| Matches `*.lock` or `**/migrations/**`                                               | Skip, reason "regenerate manually"                                  |
| Dependency manifest (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, etc.) | Apply patch, flag "deps-changed"                                    |
| Patch context matches local                                                          | Apply via Read+Edit                                                 |
| Patch context doesn't match (fork diverged)                                          | Skip, reason "context mismatch / fork diverged"                     |

### 4. Apply rules

- Always Read local file before Edit. Never blind-write existing files.
- `Write` only for net-new files (status=added).
- Skipped files: record `filename` + reason. Move on.
- Never run git, build, test, lint, or install commands.

### 5. Bump UPSTREAM.md

After loop:

- Set `Base:` to upstream main HEAD SHA captured in step 2.
- Set `Updated:` to today's date (`YYYY-MM-DD`).
- Only bump if at least one file applied OR all files cleanly classified (no crashes).

### 6. Report

```
Compare: <base>...main  (<N> commits, <M> files)

Applied (A):
  <filename>

Skipped (S):
  <filename> — <reason>

Flags:
  - deps-changed: yes/no

Review skipped: https://github.com/<owner>/<repo>/compare/<base>...main
```

Skipped list = stdout only. Never persisted.

## Edge cases

- **Empty diff.** `files[]` empty → "already up to date" + still bump `Base:` to current main HEAD.
- **Pagination.** `--paginate` flag on `gh api` handles it.
- **Force-pushed upstream.** Out of scope. If base SHA gone from upstream, `gh api` errors → abort.
- **Rename + edit combined.** GitHub returns single `files[]` entry with `previous_filename` + `patch`. Move first, patch second.
- **Auth.** `gh` CLI must be authed. 401 → abort with message.

## Allowed commands

- `gh api repos/<owner>/<repo>/compare/...` — fetch diff only.

## Don't

- Don't add git remotes.
- Don't run `git commit`, `git add`, `git push`, `git cherry-pick`. File edits only.
- Don't run install, build, lint, or test commands. User runs those after.
- Don't write skipped list to any file.
- Don't walk commits one-by-one. Single aggregate diff via compare endpoint.
