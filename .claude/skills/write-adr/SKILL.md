---
name: write-adr
description: Turn a decision made in the conversation into a numbered Architecture Decision Record in `docs/adr/`, using this project's ADR format (Nygard style — Status, Date, Context, Decision, Consequences). Handles numbering, file naming, and replacing older ADRs. Use this whenever the user asks to record, document, write up, or "ADR" a decision, says "let's capture why we did this", or has just settled a significant choice (a library, an architecture pattern, a tooling or workflow change, a trade-off) that a future contributor would otherwise wonder about — even if they don't say "ADR".
---

# Write an ADR

Records why a decision was made, so a newcomer (or a future you) doesn't have to dig through
chats and PR threads. The ADR is written from what was actually discussed: the real context,
the options that were weighed, and the trade-offs accepted. Never invent rationale. A
plausible-sounding reason nobody gave is worse than no ADR, because people will trust it.

## 1. Read the format and the existing records

- Read `docs/adr/0. template.md`, the structure to fill in, and
  `docs/adr/0001-record-architecture-decisions.md`, which states the rules and shows a finished
  ADR in the house style. Use them as they are today; don't rely on a remembered version.
  `0. template.md` isn't an ADR, so skip it when numbering.
- List `docs/adr/` and skim the titles, to find:
  - **the next number:** highest existing number + 1, zero-padded to four digits
  - **related ADRs:** if this decision reverses or replaces one, see step 4

## 2. Pull the decision out of the conversation

Find these in what was said:

- **Context:** the problem or need, and the forces at play: constraints, requirements,
  incidents, things that went wrong. Include concrete facts from the conversation, such as
  version numbers, error messages and advisory IDs.
- **Options considered:** what else was on the table, and why each one lost.
- **Decision:** what was chosen, stated as "We will …".
- **Consequences:** what gets easier, what gets harder, and the downsides knowingly
  accepted, plus any follow-up work it creates.

If the conversation doesn't say why, or doesn't name the alternatives, ask one short question
for the missing piece instead of filling it in. If the decision hasn't actually been made yet,
offer to write it with status **Proposed**.

If several decisions were made, write one ADR per decision (the format's rule), and confirm the
list with the user first.

## 3. Write the file

- **Path:** `docs/adr/NNNN-short-title.md`, with a kebab-case title of a few words.
- **Heading:** `# N. Title`, without leading zeros, matching 0001's style.
- **Status:** `Accepted`, unless the user says it's still a proposal.
- **Date:** today.
- **Options:** go in **Decision** as "We considered … and rejected it because …", as the
  template shows. Keep them, because they're often the most useful part later. Leave the
  bullet out if no alternatives were discussed; don't invent one.
- **Length:** as short as it can be while still answering "why?". Usually 10–20 bullets in
  total. Link to the PR, issue, release notes or advisory when the conversation mentions one.
- **Style:** follow [Writing style](#writing-style) below.
- **Template comment:** drop the HTML comment block from the template.

Run `npm run format` (or `prettier --write` on the file) afterwards so it passes
`format:check`.

## Writing style

Someone should be able to skim an ADR in a few seconds and know what was decided and why.

- **Bullets over paragraphs.** Give each section a short bullet list, with one idea per bullet,
  and keep most bullets to one line.
- **Lead with the point.** Start Decision with "We will …". Under each option, say what it
  was and why it lost.
- **Plain words first.** Use a technical term only when no plain word is as precise, e.g.
  "safe to re-run" rather than "idempotent". Exact file names, commands, versions and error
  messages are precision, not jargon, so keep them.
- **Cut filler.** Skip openings like "This ADR describes…", repeating the title, and hedging.
- **Check before handing off:** could someone skim it in about 10 seconds and get it? If not,
  shorten it.

Example of the target style:

```markdown
## Context

- `tsc` doesn't rewrite path aliases, so `@/x` imports break in `dist/`.
- `tsc-alias` fixes that, but pulls in `braces`, which has a high-severity advisory with no
  fix (GHSA-vfj7-8cjw-p6xm).
- CI fails on high-severity advisories, and we don't want to lower that bar.

## Decision

- We will use Node's built-in subpath imports: `#/*` → `src/*` in `package.json` `"imports"`.
- We considered keeping `@/*` and auditing production dependencies only, but rejected it
  because it weakens the security check.

## Consequences

- No extra dependency, and nothing is rewritten at build time.
- Imports start with `#/` instead of `@/`.
- A custom `template-source` condition is needed so TypeScript, ESLint and tsx resolve to `src/`.
```

## 4. Replacing an older ADR

ADRs are never rewritten after they're accepted, except for their status. If the new decision
replaces an existing one:

- In the old ADR, change only the status line to `Replaced by ADR-NNNN`.
- In the new ADR's Context, mention which ADR it replaces and what changed since then.

## 5. Hand off

Show the ADR, or a short summary and the path if it's long, and point out anything you weren't
sure about. Don't commit unless the user asks. They may want it in the same PR as the change
it describes, which is usually the right place.
