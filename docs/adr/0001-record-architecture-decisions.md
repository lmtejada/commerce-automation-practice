# 1. Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-10-20

## Context

- Decisions about architecture, tooling and conventions get made in chats and PR threads, then
  forgotten.
- New contributors (and future us) can't tell why things are the way they are.

## Decision

- We will record significant decisions as short ADRs in `docs/adr/`, based on
  [Michael Nygard's format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).
- Write one when a choice is hard to reverse, affects the whole codebase, or would surprise a
  newcomer.
- One decision per file: `NNNN-short-title.md`, numbered in order.
- Keep each one skimmable in about 10 seconds: short bullets, plain words.
- Don't edit an accepted ADR, except its status. To reverse a decision, write a new ADR and mark
  the old one `Replaced by ADR-NNNN`.

## Consequences

- The reasons behind decisions live next to the code and get reviewed in PRs.
- Writing one takes a few minutes per decision.
