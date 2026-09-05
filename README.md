# AI Payment Recovery Engine

An AI-driven revenue recovery simulator. When a customer's payment fails, the
system diagnoses the likely reason using an LLM, opens a conversation with the
customer, interprets their replies, and drives a recovery workflow (retry /
escalate / stop) — with an admin able to short-circuit the whole thing via a
manual "Resolve Issue" action.

Built for a hackathon demo: no real payment provider calls are required end to
end (a mock provider + Groq LLM stand in for Razorpay and a support agent).

---

## Tech Stack

| Layer          | Technology                                   |
|----------------|-----------------------------------------------|
| Runtime        | Node.js, Express, TypeScript                  |
| Database       | MongoDB via Mongoose                          |
| AI             | Groq API (`openai/gpt-oss-120b`)              |
| Queues (planned) | BullMQ + Redis (not required to run the demo) |
| Frontend       | React + TypeScript                            |
| Payment provider | Razorpay (mock provider used for the demo)  |

---

## Architecture

```
src/
├── models/          Mongoose schemas
├── controllers/     Extract from req, call services, shape response
├── services/         Application/business logic, talk to models
├── core/            Orchestration engines (recovery, policy, workflow, action)
├── ai/               Groq-backed diagnosis, intent interpretation, message generation
├── integrations/     Payment + notification providers (mock + real, behind interfaces)
├── workers/          Re-check-then-execute job handlers (not currently scheduled — see Known Limitations)
├── queues/           BullMQ queue/worker definitions (not wired to Redis yet)
├── middlewares/       Error handling, request logging, validation
├── utils/             Error classes, logger, validation helpers, date/id helpers
└── routes/v1/        Express route definitions
```

### Models

`Customer`, `Payment`, `RecoveryCase`, `Workflow`, `WorkflowStep`, `Policy`,
`Event`, `AuditLog`, `Notification`, `Settings`, `Message`.

### Core engine (`src/core/`)

- **`recoveryEngine.ts`** — the main orchestrator. Given an `Event`, it:
  1. Checks whether the recovery engine is enabled (`Settings`)
  2. Loads the related `Payment`
  3. Runs real AI diagnosis on the failure (`ai/diagnosis/diagnosisService.ts`)
  4. Finds or creates a `RecoveryCase`
  5. **On first creation only**, auto-generates and sends the AI's opening
     recovery message into the conversation
  6. Evaluates policy (retry limits, cooldowns, allowed actions)
  7. Creates a `Workflow` and schedules the first step
- **`policyEngine.ts`** — determines the applicable `Policy` for a problem
  type (falls back to a permissive default if none is configured), checks
  retry count, cooldown, and stopping conditions.
- **`workflowEngine.ts`** — create / start / advance / complete / stop a
  `Workflow`, and read its step history.
- **`actionEngine.ts`** — the bounded action set the AI/workflow can invoke:
  `RETRY_PAYMENT`, `SEND_EMAIL`, `SEND_WHATSAPP`, `CREATE_PAYMENT_LINK`,
  `CHECK_PAYMENT_STATUS`, `ESCALATE_TO_HUMAN`, `WAIT`, `STOP`.

### AI layer (`src/ai/`)

All AI calls go through `aiService.ts`, which sends a system+user prompt to
Groq, strips markdown fences, parses JSON, and validates the shape before
returning it to the caller — so a malformed model response throws a clear
error instead of silently corrupting data.

- **`diagnosisService.ts`** — `analyzePaymentFailure()` → `{ reason, confidence }`
- **`responseInterpreter.ts`** — `interpretCustomerMessage()` → `{ intent, promisedDate }`,
  where `intent` is one of `promise_to_pay`, `dispute`, `request_help`,
  `refusal`, `unclear`
- **`messageGenerator.ts`** — generates recovery / reminder / payment-link /
  follow-up messages in natural language

### Integrations (`src/integrations/`)

Core code never calls a provider SDK directly — it always calls the interface
(`paymentProvider.retryPayment()`, `emailProvider.sendEmail()`, etc.), and the
concrete implementation (mock vs. real) is chosen in one place
(`paymentProvider.ts`, driven by `PAYMENT_PROVIDER_MODE` in `.env`). Only
Razorpay is implemented as a real adapter (Stripe was deliberately left out
since this is being built for a Razorpay-judged hackathon).

---

## Feature Flow

### 1. Creating a customer with a payment issue

`POST /api/v1/create-democustomer-wi`

1. Creates a `Customer` (`status: "issue"`)
2. Creates a `Payment` for that customer
3. Immediately runs `simulatePaymentFailure`, which:
   - Marks the payment `failed`
   - Creates an `Event` (`payment.failed`)
   - Hands the event to `recoveryEngine.processEvent()`

### 2. AI diagnosis + auto-sent message

Inside `processEvent`:

- `analyzePaymentFailure()` calls Groq with the payment's provider, failure
  reason, amount, and currency, and gets back a diagnosed `problemType` +
  confidence score
- A `RecoveryCase` is created (or an existing open one for that payment is
  reused)
- **Only on first creation**, `generateRecoveryMessage()` is called and the
  result is saved as a `Message` with `sender: "AI"` — this is what appears
  as the opening line in the conversation thread
- If message generation fails (e.g. Groq rate limit), the error is logged and
  swallowed — it does **not** block recovery case / workflow creation

### 3. Policy evaluation + workflow scheduling

- `evaluatePolicy()` loads the applicable `Policy` for the diagnosed problem
  type (or a default: 3 retries, 5-minute cooldown, all actions allowed, if
  none is configured)
- Retry count and cooldown are checked against `WorkflowStep` history for the
  case's current workflow (skipped entirely if there's no workflow yet — a
  brand-new case can't have retry history)
- If the policy says to stop, the case is stopped. Otherwise a `Workflow` is
  created and a `RETRY_PAYMENT` step is scheduled

### 4. Conversation — customer replies drive the workflow

`GET  /api/v1/recovery-cases/:recoveryCaseId/conversation`
`POST /api/v1/recovery-cases/:recoveryCaseId/conversation/reply`

- Every message (AI, customer, system) is a `Message` document, sorted
  oldest→newest
- When a reply is posted:
  1. It's saved as `sender: "CUSTOMER"`
  2. `interpretCustomerMessage()` classifies intent
  3. `handleCustomerIntent()` reacts:
     - `promise_to_pay` → schedules a `RETRY_PAYMENT` step (on the promised
       date if one was given)
     - `dispute` / `request_help` → escalates to a human
       (`ESCALATE_TO_HUMAN` step + audit log)
     - `refusal` → stops the recovery case
     - `unclear` → no change, waits for a clearer reply

### 5. Manual resolution (admin override)

`POST /api/v1/recovery-cases/:recoveryCaseId/resolve-issue` — *(route not yet
registered, see Known Limitations)*

For the prototype, no real payment/provider call is required to "recover" a
case. An admin can just declare the underlying issue fixed:

1. `RecoveryCase.status` → `resolved`, `resolvedAt` set
2. The associated `Workflow` is marked complete
3. The `Customer` moves from `status: "issue"` back to `"active"`
4. An `AuditLog` entry records who resolved it and why
5. **No extra bookkeeping needed for analytics** — `getRevenueRecovered()`
   already sums `revenueAtRisk` across every `status: "resolved"` case, so
   resolving a case immediately reflects in Recovered Revenue

### 6. Analytics

- `getRevenueAtRisk()` — sum of `revenueAtRisk` across open/in-progress cases
- `getRevenueRecovered()` — sum of `revenueAtRisk` across resolved cases
- `getRecoveryRate()` — resolved ÷ total, as a percentage
- `getFailedRecoveries()` — cases with `status: "failed"` *(currently never
  set by any code path — see Known Limitations)*
- `getActiveRecoveries()` — cases with `status: "in_progress"`
- `getRecoveryActivity()` — per-case feed (customer, amount recovered, retry
  attempt count, resolved date) for an activity/history page *(service +
  controller exist; route not yet registered — see Known Limitations)*

---

## Setup

### Environment variables (`.env`)

```
PORT=5000
MONGO_URI=your_mongodb_connection_string

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

PAYMENT_PROVIDER_MODE=mock

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

ALLOWED_ORIGINS=http://localhost:5173
```

### Install & run

```bash
npm install
npm run dev
```

The recovery engine's enabled/disabled check currently defaults to enabled
(`isEngineEnabled()` is temporarily hardcoded to `true` for demo stability —
see Known Limitations).

---

## API Reference

> Paths below are exactly as registered in `src/routes/v1/`. Several are
> missing their leading `/` in the route definition (see Known Limitations) —
> confirm the actual working path against your running server if a call
> 404s.

**Demo**
- `POST /api/v1/create-democustomer` — create a plain customer + payment
- `POST /api/v1/create-democustomer-wi` — create a customer with an issue;
  auto-runs the full failure → AI diagnosis → recovery case → auto-message
  pipeline
- `POST /api/v1/create-democustomer-woi` — create a customer without an issue

**Customer**
- `GET /api/v1/get-customers`
- `GET /api/v1/get-customer-detail`
- `DELETE /api/v1/delete-customer`

**Recovery**
- `GET /api/v1/recovery-cases`
- `GET /api/v1/recovery-cases/:recoveryCaseId`
- `POST /api/v1/recovery-cases/:recoveryCaseId/trigger`
- `POST /api/v1/recovery-cases/:recoveryCaseId/stop`
- `POST /api/v1/recovery-cases/:recoveryCaseId/resume`

**Conversation**
- `GET /api/v1/recovery-cases/:recoveryCaseId/conversation`
- `POST /api/v1/recovery-cases/:recoveryCaseId/conversation/reply`

**Workflow**
- `GET /api/v1/get-active-wfs`
- `GET /api/v1/get-active-wf-detail`
- `GET /api/v1/get-active-wf-history`
- `PATCH /api/v1/stop-workflow`
- `PATCH /api/v1/resume-workflow` *(currently bound to the wrong handler —
  see Known Limitations)*

**Policy**
- `GET /api/v1/get-policy`
- `POST /api/v1/create-policy`
- `PATCH /api/v1/update-policy`
- `POST /api/v1/set-policy`
- `DELETE /api/v1/delete-policy`

**Analytics**
- `GET /api/v1/get-risked-rev`
- `GET /api/v1/get-recovery-rate`
- `GET /api/v1/get-failed-recovery`
- `GET /api/v1/get-rev-recovered`
- `GET /api/v1/get-active-recovery`

**Settings**
- `POST /api/v1/set-engine-status`
- `POST /api/v1/set-ai-status`

**Webhook**
- `POST /api/v1/razorpayhook-process`

---

## Known Limitations / TODO

These are real, identified gaps — not hidden — worth fixing before demo day
or a real submission:

1. **Recovery engine enabled-check is hardcoded to `true`.** The original
   `Settings`-backed check crashed on the disabled path (tried to write an
   `AuditLog` with empty ObjectIds); it was hardcoded on rather than properly
   fixed, to unblock testing under time pressure.
2. **No scheduler actually runs the workers.** `recoveryWorker.ts` /
   `workflowWorker.ts` contain correct re-check-before-execute logic, but
   nothing (`cron`, `setInterval`, or a running BullMQ consumer) ever invokes
   them. A scheduled `WorkflowStep` is created but nothing currently advances
   it automatically — retry-with-cooldown behavior only gets evaluated once,
   at initial case creation.
3. **BullMQ/Redis queues are written but not connected.** `redisConnection.ts`
   was never confirmed against a running Redis instance; the queue files are
   unused in the current run path.
4. **Several routes are missing their leading `/`** (e.g.
   `analyticsRouter.get('get-risked-rev', ...)` instead of
   `'/get-risked-rev'`). Depending on Express version behavior this may or
   may not resolve correctly when mounted — verify against your installed
   Express version.
5. **`resume-workflow` route is bound to `StopWorkflow`, not
   `ResumeWorkflow`** — copy-paste bug in `workflow.route.ts`.
6. **`resolve-issue` and `recovery-activity` routes were never registered**,
   despite the controller + service functions existing
   (`ResolveIssue`, `GetRecoveryActivity`). Add them to `recovery.route.ts`
   and `analytics.route.ts` respectively.
7. **No `RecoveryCase` status ever becomes `"failed"`** — `getFailedRecoveries()`
   queries for it, but no code path sets it. Currently `refusal` intent and
   exhausted retries both map to `"stopped"` instead. Decide whether these
   should be distinct statuses.
8. **Proposed action in `recoveryEngine.ts` is hardcoded to `RETRY_PAYMENT`**
   rather than being derived from the AI's diagnosis + the policy's
   `allowedActions`.
9. **`recoveryWorker.ts` sends a hardcoded placeholder message** for
   `SEND_EMAIL`/`SEND_WHATSAPP` steps instead of calling `messageGenerator.ts`.
10. **`notificationService.ts` / `paymentService.ts`'s provider calls** were
    written against the integration interfaces but never confirmed wired
    end-to-end with real customer email/phone lookups.
11. **Razorpay webhook signature verification is a stub** (`TODO` in
    `webhookService.ts`) — not implemented, only mock-validated.
12. **`resetScenario`** doesn't cascade-delete related `RecoveryCase` /
    `Workflow` / `WorkflowStep` / `Event` / `AuditLog` — only removes the
    `Payment`.