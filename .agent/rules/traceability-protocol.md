# Traceability Protocol
# v4.0 | .agent/rules/traceability-protocol.md
# Universal — works with any project type, any stack, any model
# Standards: OWASP · 12-Factor App · Semantic Versioning · Conventional Commits

---

## 0. HARD CONSTRAINTS

Security and commits are non-negotiable. Everything else is balanced.

- NEVER hardcode secrets, API keys, or credentials — use environment variables or a secret manager
- NEVER commit directly to `main` or `master` — always via branch + PR
- NEVER skip a step declaration before writing code or modifying files
- NEVER retry a failed step without logging the failure first
- NEVER batch unrelated changes in one commit
- NEVER read raw files before querying graphify
- ALWAYS link every commit to a ticket, issue, or task ID
- ALWAYS validate and sanitize all external inputs (OWASP A03)
- ALWAYS keep dev, staging, and production configs strictly separate (12-Factor III)
- ALWAYS pin dependency versions in production — no floating `latest`

---

## 1. FILE SEARCH — graphify first, always

Before reading any file or searching the codebase:

| Task | Action |
|---|---|
| Understand project structure | Read `graphify-out/GRAPH_REPORT.md` |
| Find a file, function, or module | `/graphify search <term>` |
| First session or outdated graph | `/graphify .` to rebuild |
| Read a specific file | Only after graphify confirms it is the right one |

Direct file reads are only permitted when graphify explicitly cannot answer the question.

---

## 2. STEP DECLARATION

Emit this JSON block before every action — one format, no exceptions.

```json
{
  "step_id": "step-001",
  "ticket_id": "ISSUE-123",
  "weight": "trivial | standard | major",
  "change_type": "bugfix | refactor | feature | test | chore | docs | security",
  "intent": "one sentence — what you are achieving",
  "reasoning": "one sentence — why this change is needed",
  "files_touched": ["path/to/file"],
  "diff_summary": "what changes in the code",
  "security_impact": "none | low | medium | high",
  "owasp_relevant": false,
  "context_used": { "graphify_queried": true, "files_read": [] },
  "expected_outcome": "what the system does after this step",
  "emit_to_trace": true
}
```

Missing declaration before code = protocol violation. Stop, emit, then continue.

---

## 3. OUTPUT BY WEIGHT

| Weight | When | Required output |
|---|---|---|
| TRIVIAL | Formatting, renaming, comments | Declaration + commit |
| STANDARD | Bugfix, test, config, dependency update | Declaration + commit + JSON log |
| MAJOR | New feature, refactor, architecture change, security fix | Plan approval + declaration + JSON log + commit + file list |

---

## 4. STEP BUDGET

Tasks requiring > 10 steps — emit plan first, wait for approval, then proceed:

```
PLAN | Ticket: <id> | Task: <description> | Estimated steps: <N>
1. <action> → <file(s)>
2. <action> → <file(s)>
...
Awaiting approval before writing any code.
```

If scope grows mid-run → pause, log the reason, emit a revised plan, then continue.

---

## 5. GIT & VERSIONING STANDARDS

### Commit format — Conventional Commits
```
<type>(<scope>): <short summary>

Agent-Intent: <intent>
Agent-Reasoning: <reasoning>
Files-Modified: <comma-separated list>
Step-ID: <step_id>
Ticket: <ticket_id>
Security-Impact: none | low | medium | high
```

Types: `feat` `fix` `refactor` `test` `chore` `docs` `security`

### Versioning — Semantic Versioning (semver.org)
- `MAJOR` bump — breaking change
- `MINOR` bump — new backward-compatible feature
- `PATCH` bump — backward-compatible bugfix
- Pre-release: `1.0.0-alpha.1`, `1.0.0-rc.1`
- Never manually edit version — use the project's versioning tool

### Branch strategy
- `main` / `master` — production only, protected
- `develop` — integration branch
- `feature/<ticket-id>-short-desc` — new features
- `fix/<ticket-id>-short-desc` — bugfixes
- `chore/<desc>` — maintenance, dependency updates

---

## 6. SECURITY STANDARDS — OWASP Top 10

Flag steps with `"owasp_relevant": true` and `"security_impact": "medium | high"` when any of the following apply:

| OWASP Risk | Rule |
|---|---|
| A01 — Broken Access Control | Enforce least-privilege; never expose admin routes without auth |
| A02 — Cryptographic Failures | Use TLS 1.2+; never store plaintext passwords; use bcrypt/argon2 |
| A03 — Injection | Validate and sanitize all external inputs; use parameterized queries only |
| A04 — Insecure Design | Threat-model new features before implementation |
| A05 — Security Misconfiguration | No default credentials; disable unused endpoints and debug modes |
| A06 — Vulnerable Components | Pin dependencies; run `npm audit` / `pip audit` / equivalent before merge |
| A07 — Auth Failures | Enforce MFA for admin; use short-lived tokens; invalidate on logout |
| A09 — Logging Failures | Log security events; never log passwords, tokens, or PII |

Security-impacting steps with `"security_impact": "high"` must be reviewed before merging.

---

## 7. 12-FACTOR APP COMPLIANCE

Apply these to every project regardless of stack:

| Factor | Rule |
|---|---|
| III — Config | All config via environment variables. No config in code. |
| IV — Backing services | Treat DBs, queues, caches as attached resources via URL/env var |
| V — Build/release/run | Strict separation of build, release, and run stages |
| VI — Processes | App must be stateless — no local session storage |
| IX — Disposability | Fast startup, graceful shutdown, crash-only design |
| X — Dev/prod parity | Keep dev, staging, prod as similar as possible |
| XI — Logs | Emit logs as event streams to stdout — never write log files in app code |
| XII — Admin processes | Run admin tasks as one-off processes, not baked into the app |

Flag any step that violates a 12-Factor rule in `diff_summary`.

---

## 8. CODE QUALITY RULES

Flexible but expected:

- Functions do one thing — max ~20 lines; extract if longer
- No magic numbers or strings — use named constants
- Errors must be handled explicitly — no silent `catch` blocks
- Tests required for every new feature and bugfix (unit at minimum)
- Public interfaces must have docstrings / JSDoc / type annotations
- No commented-out code in commits — delete or create a ticket

---

## 9. ENVIRONMENT RULES

| Environment | Config source | Secrets | Deploy trigger |
|---|---|---|---|
| Development | `.env.local` (gitignored) | Local / dev vault | Manual |
| Staging | CI/CD injected | Staging vault | PR merge to `develop` |
| Production | CI/CD injected | Prod vault (restricted) | Release tag + approval |

`.env*` files are always gitignored. Secrets never travel between environments.

---

## 10. FAILURE HANDLING

```json
{
  "status": "failed",
  "failure_reason": "...",
  "attempted_fix": "...",
  "next_action": "...",
  "security_escalation_required": false
}
```

- Failed step → new `step_id` for the corrected retry
- If failure involves a security rule → set `"security_escalation_required": true` and stop until reviewed
- Never silently swallow a failure and move on

---

## 11. REPRODUCIBILITY

- All side effects declared in step JSON
- Non-deterministic steps: add `"non_deterministic": true, "reason": "..."`
- All dependency versions pinned in lockfile before merge to `main`
- Docker images tagged with explicit versions — never `latest` in production

---

## 12. MEMORY (skip entirely if no memory system is connected)

Log `"memory_read": []` and `"memory_written": {}` in step JSON. Never overwrite an existing memory entry without logging the reason.

---

## 13. WORKED EXAMPLES

**TRIVIAL — rename a variable**
```json
{
  "step_id": "step-001", "ticket_id": "PROJ-10", "weight": "trivial",
  "change_type": "chore", "security_impact": "none", "owasp_relevant": false,
  "intent": "Improve loop variable readability",
  "reasoning": "x is ambiguous; counter communicates purpose",
  "files_touched": ["src/utils/loop.ts"],
  "diff_summary": "Rename x → counter on line 42",
  "context_used": { "graphify_queried": false, "files_read": ["src/utils/loop.ts"] },
  "expected_outcome": "No logic change, improved readability",
  "emit_to_trace": true
}
```
```
chore(utils): rename loop variable x to counter
Agent-Intent: Improve loop variable readability
Agent-Reasoning: x is ambiguous; counter communicates purpose
Files-Modified: src/utils/loop.ts | Step-ID: step-001 | Ticket: PROJ-10 | Security-Impact: none
```

---

**STANDARD — fix a null pointer bug**
```json
{
  "step_id": "step-002", "ticket_id": "PROJ-42", "weight": "standard",
  "change_type": "bugfix", "security_impact": "low", "owasp_relevant": true,
  "intent": "Prevent crash when session token is undefined",
  "reasoning": "Unauthenticated requests arrive before token is set",
  "files_touched": ["src/middleware/auth.ts"],
  "diff_summary": "Add null check before token.userId access",
  "context_used": { "graphify_queried": true, "files_read": ["src/middleware/auth.ts"] },
  "expected_outcome": "Unauthenticated requests return 401 instead of crashing",
  "emit_to_trace": true
}
```
```
fix(auth): handle undefined token in session middleware
Agent-Intent: Prevent crash on missing token
Agent-Reasoning: Unauthenticated requests arrive before token is set
Files-Modified: src/middleware/auth.ts | Step-ID: step-002 | Ticket: PROJ-42 | Security-Impact: low
```

---

**MAJOR — new authenticated API endpoint**
```
PLAN | Ticket: PROJ-88 | Task: Add POST /api/users/profile | Estimated steps: 5
1. Add route → src/routes/users.ts
2. Add controller with input validation → src/controllers/users.ts  | OWASP A03
3. Add auth middleware check → src/middleware/auth.ts              | OWASP A01
4. Add unit tests → tests/users.test.ts
5. Update API docs → docs/api.md
Awaiting approval before writing any code.
```
```json
{
  "step_id": "step-003", "ticket_id": "PROJ-88", "weight": "major",
  "change_type": "feature", "security_impact": "high", "owasp_relevant": true,
  "intent": "Add authenticated POST /api/users/profile endpoint",
  "reasoning": "Users need to update their profile; endpoint requires auth and input validation",
  "files_touched": ["src/routes/users.ts", "src/controllers/users.ts", "src/middleware/auth.ts", "tests/users.test.ts"],
  "diff_summary": "New route, controller with sanitized input, auth middleware, unit tests",
  "context_used": { "graphify_queried": true, "files_read": ["src/routes/index.ts", "src/middleware/auth.ts"] },
  "expected_outcome": "POST /api/users/profile updates profile for authenticated users only",
  "emit_to_trace": true
}
```
```
feat(users): add authenticated POST /api/users/profile endpoint
Agent-Intent: Add profile update endpoint with auth and input validation
Agent-Reasoning: Users need profile updates; OWASP A01 and A03 compliance required
Files-Modified: src/routes/users.ts, src/controllers/users.ts, src/middleware/auth.ts, tests/users.test.ts
Step-ID: step-003 | Ticket: PROJ-88 | Security-Impact: high
```

---

Operate with full transparency, traceability, and no compromise on industry standards at all times.
