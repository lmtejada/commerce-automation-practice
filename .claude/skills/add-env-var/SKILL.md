---
name: add-env-var
description: Add (or rename or remove) an environment variable in this project and keep all the places that must agree in sync — `.env.example`, the zod schema in `src/config.ts`, GitHub Actions `env:` blocks, and repo secrets or variables. Use this whenever the user wants a new env var, config value, API key, secret, token, feature flag, port, URL, or setting read from the environment, or wants to rename or delete one — even if they just say "the app needs a DATABASE_URL" or "make the timeout configurable".
---

# Add an environment variable

One variable has to be declared in up to four places, and forgetting one either breaks
startup or leaves a variable that nobody can find. Do them all in one go, in this order, and
end with a verification and a short report of each place.

## 1. Gather the details

Ask for anything the user didn't say. Suggest sensible answers rather than asking open
questions:

- **Name:** `UPPER_SNAKE_CASE`. Check that it's not already in `src/config.ts`.
- **Purpose:** one line. It becomes the comment in `.env.example`.
- **Type:** string, number, boolean, enum (list the values), or URL.
- **Required, or optional with a default.** Secrets are never given defaults.
- **Secret or not:** API keys, tokens, passwords and connection strings with credentials are
  secrets.
- **Needed in CI?** Only if a workflow step runs code that reads it. `src/config.ts` validates
  at import time, so it matters for steps that start the app, run tests that import config,
  or deploy. Typecheck, lint and build don't read it.

## 2. `.env.example`

This file is the documentation for every variable (the README just points to it), so the
comment must be complete. Add a comment line and the variable, grouped with related ones:

```sh
# <Purpose>. <Required. | Optional, defaults to X.> <Values: a | b | c.> <Secret.>
NAME=<placeholder>
```

For a secret, use an obviously fake placeholder (`NAME=` or `NAME=replace-me`) and never a real
value: this file is committed. For non-secrets, use a value that works for local development.

## 3. The zod schema in `src/config.ts`

Add the field to `envSchema`. Every value in `process.env` is a string, so pick a schema that
parses strings correctly:

| Type     | Schema                                                                          |
| -------- | ------------------------------------------------------------------------------- |
| string   | `z.string().min(1)`                                                             |
| number   | `z.coerce.number().int().positive()`, adjusted to the real range                |
| boolean  | `z.stringbool()`, **not** `z.coerce.boolean()` (it turns `"false"` into `true`) |
| enum     | `z.enum(["a", "b"])`                                                            |
| URL      | `z.url()`                                                                       |
| optional | append `.default(<value>)`, or `.optional()` if there's no sensible default     |

Code reads it as `config.NAME`. It's typed from the schema, so nothing else needs declaring.
Don't read `process.env.NAME` anywhere else.

## 4. Workflows (only if CI needs it)

If step 1 found a workflow step that reads it, add it to that **job's** or **step's** `env:`
block, not the whole workflow, so it isn't exposed to steps that don't need it:

```yaml
env:
  NAME: ${{ secrets.NAME }} # secret
  OTHER: ${{ vars.OTHER }} # non-secret repo variable
```

If CI doesn't need it, skip this step and say so in the report.

## 5. Repo secrets and variables (only if CI needs it)

- **Secret:** don't handle the value yourself. Secrets must not pass through the
  conversation or shell history. Tell the user to run `gh secret set NAME` (it prompts for
  the value) or to use Settings → Secrets and variables → Actions.
- **Non-secret:** with the user's OK, `gh variable set NAME --body "<value>"`.
- Check with `gh secret list` or `gh variable list` that it exists. Only the name shows, never
  the value.

## 6. Verify

1. `npm run typecheck` and `npm run lint` pass.
2. **Required variable:** start the app once (not in watch mode, e.g.
   `npm run build && npm start`) without it, and confirm the startup error names it. `config.ts` loads `.env`
   itself, so `env -u NAME` isn't enough when `.env` defines it. Move `.env` aside
   (`mv .env .env.bak`) for the run and restore it afterwards.
3. **Default value:** confirm the app starts without it, the same way.
4. Don't edit the user's own `.env`. Tell them to add the variable there.

## Report

List the four places with ✓ (done), "skipped: <reason>" (e.g. "not needed in CI"), or "you
need to: <command>" for secrets the user must set themselves.

## Renaming or removing

Go through the same places in the same order. For a rename, also search the code for
`config.OLD_NAME`; the typecheck catches the rest. For a removal, also delete the repo secret
or variable (`gh secret delete NAME`), but ask first, because other branches or deployments
may still use it.
