# Repository Guidelines

- Repo: https://github.com/openclaw/openclaw
- GitHub issues/comments/PR comments: use literal multiline strings or `-F - <<'EOF'` (or $'...') for real newlines; never embed "\\n".

## Core Architecture

**OpenClaw** is a personal AI assistant that runs on your own devices. The architecture consists of:

- **Gateway**: Control plane that manages agents, channels, and message routing. Not the product itself—just the infrastructure.
- **Channels**: Multi-platform messaging integrations (WhatsApp, Telegram, Slack, Discord, Google Chat, Signal, iMessage, Microsoft Teams, WebChat, plus extensions like BlueBubbles, Matrix, Zalo).
- **Agents**: Individual AI instances with configurable models, tools, workspaces, and identities. Each agent can have its own workspace directory and tool access policy.
- **Skills**: Extensible functionality system with workspace-specific, built-in, and installed skills.
- **Canvas/A2UI**: Live interactive UI rendering system for rich agent responses.
- **Plugin SDK**: Extension system for custom channels, tools, and integrations.

**Key Concepts:**
**OpenClaw** is a personal AI assistant that runs on your own devices. The architecture consists of:

- **Gateway**: Control plane that manages agents, channels, and message routing. Not the product itself—just the infrastructure.
- **Channels**: Multi-platform messaging integrations (WhatsApp, Telegram, Slack, Discord, Google Chat, Signal, iMessage, Microsoft Teams, WebChat, plus extensions like BlueBubbles, Matrix, Zalo).
- **Agents**: Individual AI instances with configurable models, tools, workspaces, and identities. Each agent can have its own workspace directory and tool access policy.
- **Skills**: Extensible functionality system with workspace-specific, built-in, and installed skills.
- **Canvas/A2UI**: Live interactive UI rendering system for rich agent responses.
- **Plugin SDK**: Extension system for custom channels, tools, and integrations.

**Key Concepts:**

- Gateway runs as a daemon (launchd/systemd) and exposes an HTTP API
- Agents route messages through channels and can spawn sub-sessions
- Workspaces isolate agent files (persona, identity, tools, memory)
- Tools are grouped by profiles (minimal/coding/messaging/full) with per-agent overrides
- Models support primary + fallback chains with OAuth or API key auth

## Project Structure

- Source code: `src/` (CLI in `src/cli`, commands in `src/commands`, infra in `src/infra`).
- Tests: colocated `*.test.ts` next to source files.
- Docs: `docs/` (Mintlify-hosted at docs.openclaw.ai).
- Built output: `dist/`.
- Plugins/extensions: `extensions/*` (workspace packages).
- Native apps: `apps/` (macOS in `apps/macos`, iOS in `apps/ios`, Android in `apps/android`).
- Web UI: `ui/` (Vite + Lit control panel for gateway management).
- Skills: `skills/` (bundled skills shipped with OpenClaw).
- Canvas renderer: `vendor/a2ui/` (A2UI specification and Lit renderer).
- Shared Swift code: `apps/shared/OpenClawKit/` (cross-platform iOS/macOS framework).
>>>>>>> 35bdd97da (chore: save local changes before sync)

## Docs Linking (Mintlify)

- Docs are hosted on Mintlify (docs.openclaw.ai).
- Internal doc links in `docs/**/*.md`: root-relative, no `.md`/`.mdx` (example: `[Config](/configuration)`).
- Section cross-references: use anchors on root-relative paths (example: `[Hooks](/configuration#hooks)`).
- Doc headings and anchors: avoid em dashes and apostrophes in headings because they break Mintlify anchor links.
- When Peter asks for links, reply with full `https://docs.openclaw.ai/...` URLs (not root-relative).
- When you touch docs, end the reply with the `https://docs.openclaw.ai/...` URLs you referenced.
- README (GitHub): keep absolute docs URLs (`https://docs.openclaw.ai/...`) so links work on GitHub.
- Docs content must be generic: no personal device names/hostnames/paths; use placeholders like `user@gateway-host` and “gateway host”.

## Docs i18n (zh-CN)

- `docs/zh-CN/**` is generated; do not edit unless the user explicitly asks.
- Pipeline: update English docs → adjust glossary (`docs/.i18n/glossary.zh-CN.json`) → run `scripts/docs-i18n` → apply targeted fixes only if instructed.
- Translation memory: `docs/.i18n/zh-CN.tm.jsonl` (generated).
- See `docs/.i18n/README.md`.
- The pipeline can be slow/inefficient; if it’s dragging, ping @jospalmbier on Discord instead of hacking around it.

## exe.dev VM ops (general)

- Access: stable path is `ssh exe.dev` then `ssh vm-name` (assume SSH key already set).
- SSH flaky: use exe.dev web terminal or Shelley (web agent); keep a tmux session for long ops.
- Update: `sudo npm i -g openclaw@latest` (global install needs root on `/usr/lib/node_modules`).
- Config: use `openclaw config set ...`; ensure `gateway.mode=local` is set.
- Discord: store raw token only (no `DISCORD_BOT_TOKEN=` prefix).
- Restart: stop old gateway and run:
  `pkill -9 -f openclaw-gateway || true; nohup openclaw gateway run --bind loopback --port 18789 --force > /tmp/openclaw-gateway.log 2>&1 &`
- Verify: `openclaw channels status --probe`, `ss -ltnp | rg 18789`, `tail -n 120 /tmp/openclaw-gateway.log`.

## Build, Test, and Development Commands

- Runtime baseline: Node **22+** (keep Node + Bun paths working).
- Install deps: `pnpm install`
- Pre-commit hooks: `prek install` (runs same checks as CI)
- Also supported: `bun install` (keep `pnpm-lock.yaml` + Bun patching in sync when touching deps/patches).
- Prefer Bun for TypeScript execution (scripts, dev, tests): `bun <file.ts>` / `bunx <tool>`.
- Run CLI in dev: `pnpm openclaw ...` (bun) or `pnpm dev`.
- Node remains supported for running built output (`dist/*`) and production installs.
- Mac packaging (dev): `scripts/package-mac-app.sh` defaults to current arch. Release checklist: `docs/platforms/mac/release.md`.

### Build Commands

```bash
pnpm build              # Full build: bundles A2UI, compiles TS, builds plugin SDK, copies assets
pnpm tsgo               # TypeScript type checking only
pnpm ui:build           # Build UI components
```

### Test Commands

```bash
pnpm test               # Run all tests in parallel (unit + extensions + gateway)
pnpm test:coverage      # Run tests with V8 coverage (70% thresholds)
pnpm test:watch         # Watch mode for development (vitest)
pnpm test:e2e           # End-to-end tests
pnpm test:live          # Live tests with real API keys
```

### Running Single Tests

```bash
# Run specific test file:
pnpm vitest run src/path/to/file.test.ts

# Run test matching a pattern:
pnpm vitest run --testNamePattern="test name" src/path/to/file.test.ts

# Watch mode for single test:
pnpm vitest src/path/to/file.test.ts

# Pass args via test script:
pnpm test -- src/path/to/file.test.ts
```

### Lint and Format Commands

```bash
pnpm check              # Run all checks: tsgo + lint + format
pnpm lint               # Run oxlint with type awareness
pnpm lint:fix           # Auto-fix lint issues + format
pnpm format             # Check formatting (oxfmt --check)
pnpm format:fix         # Auto-fix formatting
```

## Coding Style & Naming Conventions

- **Language**: TypeScript (ESM, strict mode). Avoid `any` — lint enforces `typescript/no-explicit-any: error`.
- **Formatter**: Oxfmt (`.oxfmtrc.jsonc`). **Linter**: Oxlint (`.oxlintrc.json`).
- Run `pnpm check` before commits.
- Keep files under ~500-700 LOC; extract helpers instead of "V2" copies.
- Naming: use **OpenClaw** for product/app/docs headings; use `openclaw` for CLI command, package/binary, paths, and config keys.

### Imports

```typescript
// 1. Node.js built-ins (use node: protocol)
import fs from "node:fs";
import path from "node:path";

// 2. External dependencies
import { defineConfig } from "vitest/config";

// 3. Local modules (use .js extension even in .ts files)
import { resolveOAuthDir } from "./config/paths.js";
import { logVerbose } from "./globals.js";
```

### Naming Conventions

| Category            | Convention              | Example                            |
| ------------------- | ----------------------- | ---------------------------------- |
| Variables/functions | camelCase               | `resolveUserPath`, `normalizeE164` |
| Constants           | SCREAMING_SNAKE_CASE    | `HELP_FLAGS`, `CONFIG_DIR`         |
| Types/interfaces    | PascalCase              | `WebChannel`, `AgentEntry`         |
| Test files          | `*.test.ts` (colocated) | `agents.test.ts`                   |

### Types

- Prefer `interface` for object shapes, `type` for unions/primitives.
- Use strict typing — no implicit `any`.
- Use optional chaining (`?.`) and nullish coalescing (`??`).

### Error Handling

```typescript
// Silent catch with comment when gracefully degrading:
try {
  const data = fs.readFileSync(path, "utf8");
  return JSON.parse(data);
} catch {
  // Try the next location.
}

// Async with logging:
try {
  const result = await someAsyncOp();
  return result;
} catch (err) {
  if (shouldLogVerbose()) {
    logVerbose(`Operation failed: ${String(err)}`);
  }
  return null;
}
```

### Comments

- Brief comments for non-obvious logic.
- JSDoc for public APIs.
- Comments on separate lines, not inline.

```typescript
/**
 * Converts a WhatsApp JID to E.164 format.
 * Handles device suffixes like 1234:1@s.whatsapp.net.
 */
function jidToE164(jid: string): string | null {
  // Strip device suffix before parsing.
  const match = jid.match(/^(\d+)(?::\d+)?@(s\.whatsapp\.net|hosted)$/);
  return match ? `+${match[1]}` : null;
}
```

## Release Channels (Naming)

- stable: tagged releases only (e.g. `vYYYY.M.D`), npm dist-tag `latest`.
- beta: prerelease tags `vYYYY.M.D-beta.N`, npm dist-tag `beta` (may ship without macOS app).
- dev: moving head on `main` (no tag; git checkout main).

## Testing Guidelines

- **Framework**: Vitest with V8 coverage.
- **Coverage thresholds**: 70% lines/functions/statements, 55% branches.
- **Naming**: match source names with `*.test.ts`; e2e in `*.e2e.test.ts`.
- **Test timeout**: 120s (180s on Windows).
- Do not set test workers above 16.
- Live tests (real keys): `CLAWDBOT_LIVE_TEST=1 pnpm test:live`.
- Pure test additions/fixes generally do **not** need a changelog entry.

## Commit & Pull Request Guidelines

- Create commits with `scripts/committer "<msg>" <file...>`; avoid manual `git add`/`git commit`.
- Concise, action-oriented commit messages (e.g., `CLI: add verbose flag to send`).
- Group related changes; avoid bundling unrelated refactors.
- Changelog: keep latest released version at top (no `Unreleased`).
- PR review: use `gh pr view --json ...` to batch metadata; `gh pr diff` only when needed.
- Goal: merge PRs. Prefer **rebase** when commits are clean; **squash** when messy.
- When merging: add changelog entry with PR # and thank the contributor.

## Shorthand Commands

- `sync`: if working tree is dirty, commit all changes, then `git pull --rebase`; if rebase conflicts, stop; otherwise `git push`.

### PR Workflow (Review vs Land)

- **Review mode (PR link only):** read `gh pr view/diff`; **do not** switch branches; **do not** change code.
- **Landing mode:** create integration branch from `main`, bring in PR commits (**prefer rebase**), apply fixes, add changelog (+ thanks + PR #), run full gate (`pnpm build && pnpm check && pnpm test`), commit, merge back to `main`, `git switch main`.

## Security & Configuration

- Web provider stores creds at `~/.openclaw/credentials/`.
- Pi sessions live under `~/.openclaw/sessions/` by default.
- Never commit real phone numbers, videos, or live configuration values.
- Use obviously fake placeholders in docs, tests, and examples.

## Troubleshooting

- Rebrand/migration issues or legacy config/service warnings: run `openclaw doctor` (see `docs/gateway/doctor.md`).

## Key Conventions

<<<<<<< HEAD
- Vocabulary: "makeup" = "mac app".
- Never edit `node_modules` (global/Homebrew/npm/git installs too). Updates overwrite. Skill notes go in `tools.md` or `AGENTS.md`.
- When adding a new `AGENTS.md` anywhere in the repo, also add a `CLAUDE.md` symlink pointing to it (example: `ln -s AGENTS.md CLAUDE.md`).
- Signal: "update fly" => `fly ssh console -a flawd-bot -C "bash -lc 'cd /data/clawd/openclaw && git pull --rebase origin main'"` then `fly machines restart e825232f34d058 -a flawd-bot`.
- Use **OpenClaw** for product/app/docs headings; use `openclaw` for CLI command, package/binary, paths, and config keys.
- Docs links: root-relative without `.md`/`.mdx` (e.g., `[Config](/configuration)`).
- Avoid em dashes and apostrophes in doc headings (breaks Mintlify anchors).
- Keep files under ~500-700 LOC; extract helpers instead of "V2" copies.
- Use shared CLI palette in `src/terminal/palette.ts` (no hardcoded colors).
- CLI progress: use `src/cli/progress.ts` (`osc-progress` + `@clack/prompts`).
- **Multi-agent safety:** do not create/apply/drop `git stash` entries unless explicitly requested.
- **Multi-agent safety:** do not switch branches unless explicitly requested.
- When working on a GitHub Issue or PR, print the full URL at the end of the task.
