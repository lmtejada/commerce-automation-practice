---
name: prepare-pr
description: Get the current branch ready for a pull request in this project — run `npm run check`, review the diff against `main`, make sure every commit follows Conventional Commits and is meaningful on its own (PRs land with merge commits, so every commit reaches `main`), and draft the PR title and description from `.github/pull_request_template.md`. Use this whenever the user says they're done with a change, wants to open, create, prep, or ready a PR, asks "is this ready to merge", or wants a PR description written — even if they only say "let's ship this".
---

# Prepare a PR

Gets a branch into a state where CI and the `main` ruleset will accept it, and a reviewer
can follow it. This skill **drafts**; it doesn't push or open the PR unless the user says so,
since they often want to add more changes to the same PR first.

Work from the repo root. Use `origin/main` as the base (`git fetch` first).

## 1. Branch state

- **Uncommitted changes:** list them and ask whether they belong in this PR. Don't commit the
  user's work unasked, and never stage `.env` or other ignored secrets.
- **Branch name** should be `<type>/<short-description>` (README → Contributing). If it isn't,
  mention it. Renaming is optional.
- **Behind `main`:** the ruleset requires branches to be up to date. If the branch is behind,
  offer `git rebase origin/main`, or a merge if the branch is already shared and the user
  prefers that.
- **Empty:** if there are no commits ahead of `origin/main`, there's nothing to prepare. Say so.

## 2. Run the checks

Run `npm run check`, which is exactly what CI runs. If it fails, fix what's mechanical
(`npm run format`, `npm run lint:fix`) and report the rest with the error output. Don't
disable rules or lower thresholds to get it green. Fix the cause, or ask.

## 3. Review the diff

Read `git diff origin/main...HEAD` in full, not just the stat. Look for:

- **Bugs and risks:** logic errors, unhandled errors or promises, unsafe `any`, edge cases.
- **Leftovers:** `console.log` debugging, commented-out code, `TODO`s added without context,
  focused or skipped tests, stray files.
- **Secrets:** keys, tokens or real `.env` values in any file.
- **Project conventions** (CLAUDE.md):
  - imports through `#/` only, with `.js` extensions
  - `import type` for types
  - env vars read only through `config`
- **Things that must change together:**
  - **New or changed env var:** `.env.example` and `src/config.ts` (the
    `add-env-var` skill does all of them).
  - **New or renamed script:** the README scripts table and CLAUDE.md.
  - **Renamed CI job:** the `main` ruleset's required check.
  - **Architectural decision:** an ADR in `docs/adr/`.
- **Scope:** changes unrelated to the PR's purpose belong in a separate PR.

Report findings as a short list, most important first, with `file:line`. Fix only what the
user approves; some findings are judgment calls.

## 4. Commits

PRs merge with a **merge commit**, so each commit lands on `main` as it is.

1. **Lint them:** `node_modules/.bin/commitlint --from origin/main --to HEAD`.
2. **Read them** (`git log --oneline origin/main..HEAD`). Look for:
   - commits that don't stand on their own: "wip", "fix typo", "address review", "oops"
   - one commit mixing unrelated changes
   - a type that doesn't match the change, e.g. `feat` for a refactor
3. **Propose a cleanup** if needed: which commits to fold together, and the new messages.
   Rewriting history is the user's call, so ask first. Then do it without interactive rebase:
   - **Folding into the previous commit:** `git reset --soft HEAD~N` and recommit.
   - **Regrouping:** `git reset --soft origin/main`, then stage and commit each group.
   - **If the branch was already pushed:** it then needs `git push --force-with-lease`, which
     only happens when the user asks to push.

## 5. Draft the PR

**Title:** Conventional Commits format, because `pr-title.yml` validates it. Take the type
and scope from the most significant commit, and summarize the whole PR in the subject.
Mark it breaking (`!`) if any commit is.

**Body:** fill in `.github/pull_request_template.md`, reading it fresh because it may have
changed:

- **Summary:** what changed and why, in a few bullets. Link issues (`Closes #123`) if the
  user mentioned any.
- **How to verify:** short numbered steps a reviewer can follow (command, then the expected
  result), not "run the tests".
- **Checklist:** tick only what you actually verified in this session. Leave the rest
  unticked, and say why if it's not obvious (e.g. "no env changes" still counts as ticked
  for the env item).

End the body with the attribution line the session's instructions require, if any.

### Writing style

A reviewer should be able to skim the description in a few seconds and know what changed, why,
and how to check it.

- **Bullets over paragraphs.** Use one idea per bullet, and keep most bullets to one line.
  Use a short paragraph only when bullets would lose the reasoning.
- **Lead with the point.** Each Summary bullet starts with what changed, then a short "so
  that…" or "because…" if the reason isn't obvious.
- **Plain words first.** Use a technical term only when no plain word is as precise, e.g.
  "safe to re-run" rather than "idempotent". Exact file names, commands, versions and error
  messages are precision, not jargon, so keep them.
- **Cut filler.** Skip openings like "This PR…", repeating the title, explaining the
  obvious, and hedging.
- **Group, don't list everything.** For many similar changes, such as dependency bumps,
  write one bullet or a small table rather than a bullet per file.
- **Check before handing off:** could a reviewer skim it in about 10 seconds and get it? If
  not, shorten it.

Example Summary:

```markdown
- Move the lint-staged config from `.lintstagedrc.json` into `package.json`, so there's one
  less root file
- Remove the shared `.vscode/` settings; editor setup is now up to each developer
- Ignore `.vscode/` entirely in `.gitignore`
```

## 6. Hand off

Show the title and body, plus a one-line status: checks passed or failed, number of commits,
and up to date or behind. Then ask whether to:

- **push and open it:** `git push -u origin <branch>` (the pre-push hook runs typecheck),
  then `gh pr create --base main --title … --body …`, then `gh pr checks --watch`
- **save the draft** to a file for later
- **leave it**, so the user can keep adding commits

If an open PR already exists for the branch (`gh pr view`), offer to update its title and
body (`gh pr edit`) instead.
