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

## Docs Linking (Mintlify)

- Docs are hosted on Mintlify (docs.openclaw.ai).
- Internal doc links in `docs/**/*.md`: root-relative, no `.md`/`.mdx` (example: `[Config](/configuration)`).
- When working with documentation, read the mintlify skill.
- Section cross-references: use anchors on root-relative paths (example: `[Hooks](/configuration#hooks)`).
- Doc headings and anchors: avoid em dashes and apostrophes in headings because they break Mintlify anchor links.
- When Peter asks for links, reply with full `https://docs.openclaw.ai/...` URLs (not root-relative).
- When you touch docs, end the reply with the `https://docs.openclaw.ai/...` URLs you referenced.
- README (GitHub): keep absolute docs URLs (`https://docs.openclaw.ai/...`) so links work on GitHub.
- Docs content must be generic: no personal device names/hostnames/paths; use placeholders like `user@gateway-host` and "gateway host".

## Docs i18n (zh-CN)

- `docs/zh-CN/**` is generated; do not edit unless the user explicitly asks.
- Pipeline: update English docs → adjust glossary (`docs/.i18n/glossary.zh-CN.json`) → run `scripts/docs-i18n` → apply targeted fixes only if instructed.
- Translation memory: `docs/.i18n/zh-CN.tm.jsonl` (generated).
- See `docs/.i18n/README.md`.
- The pipeline can be slow/inefficient; if it's dragging, ping @jospalmbier on Discord instead of hacking around it.

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

- Framework: Vitest with V8 coverage thresholds (70% lines/branches/functions/statements).
- Naming: match source names with `*.test.ts`; e2e in `*.e2e.test.ts`.
- Run `pnpm test` (or `pnpm test:coverage`) before pushing when you touch logic.
- Do not set test workers above 16; tried already.
- Live tests (real keys): `CLAWDBOT_LIVE_TEST=1 pnpm test:live` (OpenClaw-only) or `LIVE=1 pnpm test:live` (includes provider live tests). Docker: `pnpm test:docker:live-models`, `pnpm test:docker:live-gateway`. Onboarding Docker E2E: `pnpm test:docker:onboard`.
- Full kit + what's covered: `docs/testing.md`.
- Changelog: user-facing changes only; no internal/meta notes (version alignment, appcast reminders, release process).
- Pure test additions/fixes generally do **not** need a changelog entry unless they alter user-facing behavior or the user asks for one.
- Mobile: before using a simulator, check for connected real devices (iOS + Android) and prefer them when available.

## Commit & Pull Request Guidelines

**Full maintainer PR workflow (optional):** If you want the repo's end-to-end maintainer workflow (triage order, quality bar, rebase rules, commit/changelog conventions, co-contributor policy, and the `review-pr` > `prepare-pr` > `merge-pr` pipeline), see `.agents/skills/PR_WORKFLOW.md`. Maintainers may use other workflows; when a maintainer specifies a workflow, follow that. If no workflow is specified, default to PR_WORKFLOW.

- Create commits with `scripts/committer "<msg>" <file...>`; avoid manual `git add`/`git commit` so staging stays scoped.
- Follow concise, action-oriented commit messages (e.g., `CLI: add verbose flag to send`).
- Group related changes; avoid bundling unrelated refactors.
- Read this when submitting a PR: `docs/help/submitting-a-pr.md` ([Submitting a PR](https://docs.openclaw.ai/help/submitting-a-pr))
- Read this when submitting an issue: `docs/help/submitting-an-issue.md` ([Submitting an Issue](https://docs.openclaw.ai/help/submitting-an-issue))

### PR Workflow (Review vs Land)

- **Review mode (PR link only):** read `gh pr view/diff`; **do not** switch branches; **do not** change code.
- **Landing mode:** create integration branch from `main`, bring in PR commits (**prefer rebase**), apply fixes, add changelog (+ thanks + PR #), run full gate (`pnpm build && pnpm check && pnpm test`), commit, merge back to `main`, `git switch main`.

## Security & Configuration Tips

- Web provider stores creds at `~/.openclaw/credentials/`.
- Pi sessions live under `~/.openclaw/sessions/` by default.
- Never commit real phone numbers, videos, or live configuration values.
- Use obviously fake placeholders in docs, tests, and examples.

## Troubleshooting

- Rebrand/migration issues or legacy config/service warnings: run `openclaw doctor` (see `docs/gateway/doctor.md`).

## Key Conventions

- When answering questions, respond with high-confidence answers only: verify in code; do not guess.
- Never update the Carbon dependency.
- Any dependency with `pnpm.patchedDependencies` must use an exact version (no `^`/`~`).
- Patching dependencies (pnpm patches, overrides, or vendored changes) requires explicit approval; do not do this by default.
- CLI progress: use `src/cli/progress.ts` (`osc-progress` + `@clack/prompts` spinner); don't hand-roll spinners/bars.
- Status output: keep tables + ANSI-safe wrapping (`src/terminal/table.ts`); `status --all` = read-only/pasteable, `status --deep` = probes.
- Gateway currently runs only as the menubar app; there is no separate LaunchAgent/helper label installed. Restart via the OpenClaw Mac app or `scripts/restart-mac.sh`; to verify/kill use `launchctl print gui/$UID | grep openclaw` rather than assuming a fixed label. **When debugging on macOS, start/stop the gateway via the app, not ad-hoc tmux sessions; kill any temporary tunnels before handoff.**
- macOS logs: use `./scripts/clawlog.sh` to query unified logs for the OpenClaw subsystem; it supports follow/tail/category filters and expects passwordless sudo for `/usr/bin/log`.
- If shared guardrails are available locally, review them; otherwise follow this repo's guidance.
- SwiftUI state management (iOS/macOS): prefer the `Observation` framework (`@Observable`, `@Bindable`) over `ObservableObject`/`@StateObject`; don't introduce new `ObservableObject` unless required for compatibility, and migrate existing usages when touching related code.
- Connection providers: when adding a new connection, update every UI surface and docs (macOS app, web UI, mobile if applicable, onboarding/overview docs) and add matching status + configuration forms so provider lists and settings stay in sync.
- Version locations: `package.json` (CLI), `apps/android/app/build.gradle.kts` (versionName/versionCode), `apps/ios/Sources/Info.plist` + `apps/ios/Tests/Info.plist` (CFBundleShortVersionString/CFBundleVersion), `apps/macos/Sources/OpenClaw/Resources/Info.plist` (CFBundleShortVersionString/CFBundleVersion), `docs/install/updating.md` (pinned npm version), `docs/platforms/mac/release.md` (APP_VERSION/APP_BUILD examples), Peekaboo Xcode projects/Info.plists (MARKETING_VERSION/CURRENT_PROJECT_VERSION).
- "Bump version everywhere" means all version locations above **except** `appcast.xml` (only touch appcast when cutting a new macOS Sparkle release).
- **Restart apps:** "restart iOS/Android apps" means rebuild (recompile/install) and relaunch, not just kill/launch.
- **Device checks:** before testing, verify connected real devices (iOS/Android) before reaching for simulators/emulators.
- iOS Team ID lookup: `security find-identity -p codesigning -v` → use Apple Development (…) TEAMID. Fallback: `defaults read com.apple.dt.Xcode IDEProvisioningTeamIdentifiers`.
- A2UI bundle hash: `src/canvas-host/a2ui/.bundle.hash` is auto-generated; ignore unexpected changes, and only regenerate via `pnpm canvas:a2ui:bundle` (or `scripts/bundle-a2ui.sh`) when needed. Commit the hash as a separate commit.
- Release signing/notary keys are managed outside the repo; follow internal release docs.
- Notary auth env vars (`APP_STORE_CONNECT_ISSUER_ID`, `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_API_KEY_P8`) are expected in your environment (per internal release docs).
- **Multi-agent safety:** do **not** create/apply/drop `git stash` entries unless explicitly requested (this includes `git pull --rebase --autostash`). Assume other agents may be working; keep unrelated WIP untouched and avoid cross-cutting state changes.
- **Multi-agent safety:** when the user says "push", you may `git pull --rebase` to integrate latest changes (never discard other agents' work). When the user says "commit", scope to your changes only. When the user says "commit all", commit everything in grouped chunks.
- **Multi-agent safety:** do **not** create/remove/modify `git worktree` checkouts (or edit `.worktrees/*`) unless explicitly requested.
- **Multi-agent safety:** do **not** switch branches / check out a different branch unless explicitly requested.
- **Multi-agent safety:** running multiple agents is OK as long as each agent has its own session.
- **Multi-agent safety:** when you see unrecognized files, keep going; focus on your changes and commit only those.
- Lint/format churn:
  - If staged+unstaged diffs are formatting-only, auto-resolve without asking.
  - If commit/push already requested, auto-stage and include formatting-only follow-ups in the same commit (or a tiny follow-up commit if needed), no extra confirmation.
  - Only ask when changes are semantic (logic/data/behavior).
- Lobster seam: use the shared CLI palette in `src/terminal/palette.ts` (no hardcoded colors); apply palette to onboarding/config prompts and other TTY UI output as needed.
- **Multi-agent safety:** focus reports on your edits; avoid guard-rail disclaimers unless truly blocked; when multiple agents touch the same file, continue if safe; end with a brief "other files present" note only if relevant.
- Bug investigations: read source code of relevant npm dependencies and all related local code before concluding; aim for high-confidence root cause.
- Code style: add brief comments for tricky logic; keep files under ~500 LOC when feasible (split/refactor as needed).
- Tool schema guardrails (google-antigravity): avoid `Type.Union` in tool input schemas; no `anyOf`/`oneOf`/`allOf`. Use `stringEnum`/`optionalStringEnum` (Type.Unsafe enum) for string lists, and `Type.Optional(...)` instead of `... | null`. Keep top-level tool schema as `type: "object"` with `properties`.
- Tool schema guardrails: avoid raw `format` property names in tool schemas; some validators treat `format` as a reserved keyword and reject the schema.
- When asked to open a "session" file, open the Pi session logs under `~/.openclaw/agents/<agentId>/sessions/*.jsonl` (use the `agent=<id>` value in the Runtime line of the system prompt; newest unless a specific ID is given), not the default `sessions.json`. If logs are needed from another machine, SSH via Tailscale and read the same path there.
- Do not rebuild the macOS app over SSH; rebuilds must be run directly on the Mac.
- Never send streaming/partial replies to external messaging surfaces (WhatsApp, Telegram); only final replies should be delivered there. Streaming/tool events may still go to internal UIs/control channel.
- Voice wake forwarding tips:
  - Command template should stay `openclaw-mac agent --message "${text}" --thinking low`; `VoiceWakeForwarder` already shell-escapes `${text}`. Don't add extra quotes.
  - launchd PATH is minimal; ensure the app's launch agent PATH includes standard system paths plus your pnpm bin (typically `$HOME/Library/pnpm`) so `pnpm`/`openclaw` binaries resolve when invoked via `openclaw-mac`.
  - For manual `openclaw message send` messages that include `!`, use the heredoc pattern noted below to avoid the Bash tool's escaping.
  - Release guardrails: do not change version numbers without operator's explicit consent; always ask permission before running any npm publish/release step.

## NPM + 1Password (publish/verify)

- Use the 1password skill; all `op` commands must run inside a fresh tmux session.
- Sign in: `eval "$(op signin --account my.1password.com)"` (app unlocked + integration on).
- OTP: `op read 'op://Private/Npmjs/one-time password?attribute=otp'`.
- Publish: `npm publish --access public --otp="<otp>"` (run from the package dir).
- Verify without local npmrc side effects: `npm view <pkg> version --userconfig "$(mktemp)"`.
- Kill the tmux session after publish.
