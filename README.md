# commerce-automation-practice

AI agent harness that audits a mock beauty-commerce catalog for pricing and stock anomalies.
A Gemini model, driven by the [AI SDK](https://ai-sdk.dev/), calls tools to read the catalog and
log anomalies, with hooks that report each step.

## Prerequisites

- [Node.js](https://nodejs.org/) 24 LTS (see [`.nvmrc`](.nvmrc); `nvm use` picks it up)
- npm 11+ (ships with Node 24)

## Setup

```sh
nvm use
npm ci
cp .env.example .env  # then set GOOGLE_GENERATIVE_AI_API_KEY
npm run dev
```

## Scripts

| Script                 | What it does                                                   |
| ---------------------- | -------------------------------------------------------------- |
| `npm run dev`          | Runs `src/index.ts` with tsx and restarts on changes           |
| `npm run build`        | Compiles `src/` to `dist/` with `tsc`                          |
| `npm start`            | Runs the compiled app from `dist/` (run `build` first)         |
| `npm run typecheck`    | Type-checks `src/` and the config files without emitting       |
| `npm run lint`         | Runs ESLint (type-aware)                                       |
| `npm run lint:fix`     | Runs ESLint and applies automatic fixes                        |
| `npm run format`       | Formats all files with Prettier                                |
| `npm run format:check` | Checks formatting without writing                              |
| `npm run check`        | Runs everything CI runs: format, lint, typecheck, build, audit |

## Environment variables

Every variable is listed and explained in [`.env.example`](.env.example), and validated at
startup by [`src/config.ts`](src/config.ts).

## Folder structure

```text
.
├── .claude/skills/         # Project skills: add-env-var, prepare-pr, write-adr
├── .github/
│   ├── ISSUE_TEMPLATE/      # Bug report and feature request forms
│   ├── workflows/           # ci, pr-title, codeql
│   ├── dependabot.yml
│   ├── pull_request_template.md
│   └── SECURITY.md
├── .husky/                  # pre-commit, commit-msg, pre-push hooks
├── docs/adr/                # Architecture decision records (start from `0. template.md`)
├── src/
│   ├── config.ts            # Loads and validates env vars (zod), exports `config`
│   ├── harness.ts           # AutomationHarness: runs a goal through the agent loop with hooks
│   ├── tools.ts             # Agent tools over the mock catalog
│   └── index.ts             # Entry point: runs the pricing audit
├── .env.example             # Every env variable, documented
├── eslint.config.ts
├── tsconfig.json            # Type-checking (editor, ESLint, `typecheck`)
└── tsconfig.build.json      # Emit to dist/ (`build`)
```

## Conventions

- **ES modules** throughout (`"type": "module"`). Imports of project files use `.js`
  extensions (`#/config.js` for `config.ts`), as Node requires for compiled ESM.
- **No relative imports:** import project files through the `#/` alias only. ESLint
  (`no-restricted-imports`) rejects `./` and `../` paths.
- **Path alias:** `#/*` maps to `src/*` (e.g. `import { config } from "#/config.js"`), using
  Node's native [subpath imports](https://nodejs.org/api/packages.html#subpath-imports) in
  `package.json` — no build-time rewriting. A custom `template-source` condition points
  TypeScript, ESLint and tsx at `src/`; plain `node` resolves the same import to `dist/`. Its
  name must stay unique: some dependencies publish a `source` export that points at their raw
  `.ts` files, which a generic `source` condition would follow. (`@/` isn't possible natively:
  Node requires subpath imports to start with `#`.)
- **Config:** read env vars only through `config` from `src/config.ts`. Add new variables with
  the `add-env-var` skill, which updates the zod schema and `.env.example`. `.env` is loaded with Node's built-in
  `process.loadEnvFile()` — no dotenv.

## Contributing

### Branch naming

Branch from `main` using `<type>/<short-description>`, with the same types as commits:
`feat/add-health-endpoint`, `fix/config-port-parsing`, `docs/update-readme`, `chore/bump-deps`.

### Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/), enforced by
commitlint in the `commit-msg` hook:

```text
<type>(<optional scope>): <subject>

feat(config): add PORT variable
fix: handle missing .env file
docs: explain path alias
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`.
Add `!` after the type (`feat!:`) or a `BREAKING CHANGE:` footer for breaking changes.

PRs are merged with a **merge commit**, so every commit in your branch lands on `main` as-is.
Keep them meaningful: squash fixups like "fix typo" or "address review" locally before opening
the PR. The PR title appears in the merge commit and is validated the same way.

### Before opening a PR

Run `npm run check`. It runs exactly what CI runs, and `npm run format` and `npm run lint:fix`
fix most issues automatically. The Git hooks also check your work along the way:

| Hook         | Runs                              |
| ------------ | --------------------------------- |
| `pre-commit` | ESLint + Prettier on staged files |
| `commit-msg` | commitlint                        |
| `pre-push`   | `npm run typecheck`               |

Fill in the PR template, keep PRs focused on one change, and make sure CI is green. For
significant architectural changes, add an ADR in `docs/adr/` (the `write-adr` skill writes one
from the discussion).

## License

[ISC](LICENSE)
