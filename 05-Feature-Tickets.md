# Feature Ticket List
## SHIDEK 2.0 — Self-Learning AI + 3D Refresh

Format: `ID | Title | Description | Acceptance Criteria | Priority`

---

### Epic A — Secure AI Backend

**A1 | Stand up edge function** | Create a Cloudflare Worker (or Vercel function) as the single
entry point for AI chat requests. | Deployed endpoint responds to a test POST; no API keys in
client code. | P0

**A2 | Move API keys server-side** | Store any AI provider key as an encrypted environment
secret on the edge function. | `grep`-ing the repo and browser network tab for the key string
returns nothing. | P0

**A3 | Client-side PII redaction** | Implement regex-based stripping of name/phone/email/roll
no/exact score/rank before sending any chat request. | Manual test: typing a phone number or
roll number in chat results in it being redacted before the network call fires (check
devtools). | P0

**A4 | Server-side PII re-check** | Edge function re-validates incoming text for PII patterns
and blocks/redacts before forwarding to any AI provider. | Same PII test passes even if
client-side check is bypassed (e.g. via direct API call). | P0

### Epic B — Knowledge Base & Learning Loop

**B1 | Create KB schema** | Set up Supabase/Firestore table: question, answer, status,
votes, source, timestamps. | Table exists, can insert/query a row via the edge function. | P0

**B2 | KB-first lookup** | Before calling an AI provider, search KB for a similar approved
question (keyword match to start; embedding similarity later). | A repeated question is
answered from KB without a new AI provider call (verify via logs). | P0

**B3 | 👍/👎 feedback UI** | Add feedback buttons under every AI chat answer. | Tapping
👍/👎 sends a vote to the edge function, visually confirms ("Thanks!"). | P1

**B4 | Pending → Approved workflow** | 👍-voted, PII-clean Q&A pairs enter a "pending" KB
row; admin can approve/reject. | Admin panel lists pending rows; approving makes the entry
show up in future KB-first lookups. | P1

**B5 | "🔎 Verified" vs "🤖 AI-suggested" badges** | Tag every chat answer with its source. |
Badge renders correctly for both KB-sourced and live-AI-sourced answers. | P1

**B6 | Admin override for official data** | Admin-entered cutoffs/dates always outrank AI/KB
answers on the same topic. | Conflicting AI answer is suppressed in favor of admin entry. | P1

### Epic C — 3D Visual Refresh

**C1 | Tilt-on-touch tool cards** | Implement the `.card-3d` pattern from the Frontend Spec on
the 8 tool cards. | Cards tilt up to ±8° on touch/drag, reset smoothly on release, 60fps on a
mid-range Android. | P1

**C2 | Glass panel for chat & modals** | Apply `backdrop-filter` glass style to chat panel,
profile modal, compare modal. | Visual QA matches spec; fallback flat background on browsers
without `backdrop-filter` support. | P2

**C3 | Predictor result flip animation** | Result cards flip from "Predicting…" to result. |
Animation runs once per prediction, respects `prefers-reduced-motion`. | P2

**C4 | Bottom nav lift effect** | Active tab lifts with shadow instead of plain color swap. |
Visual QA; no layout shift on tab switch. | P2

**C5 | Reduced-motion fallback pass** | Audit all new animations for `prefers-reduced-motion`
support. | With the OS setting enabled, no tilt/parallax/flip animations play; content still
fully usable. | P1

### Epic D — Docs & Repo Hygiene

**D1 | Add these 5 docs to repo** | Commit PRD, Tech Architecture, Security & Access, Frontend
Spec, and this ticket list under `/docs`. | Files present in repo, linked from README. | P2

**D2 | .gitignore secrets** | Ensure no `.env` or key files are ever committed. | Repo history
scanned, no secrets found. | P0
