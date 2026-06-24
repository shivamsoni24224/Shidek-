# Technical Architecture Document
## SHIDEK 2.0 — Self-Improving AI Assistant

### 1. Current State

- 100% static site hosted on GitHub Pages (`index.html`, `sw.js`, `manifest.json` — a PWA).
- No backend, no database, no server-held secrets.
- **Important constraint:** any API key placed directly in `index.html`/JS is visible to
  anyone who views page source or opens devtools. This is why "auto-call Gemini/ChatGPT/
  Perplexity/Claude" cannot be done safely from the current static site alone — it needs one
  small backend piece.

### 2. Proposed Architecture (minimal addition, keeps the rest static)

```
┌─────────────┐      1. question (anonymized)      ┌──────────────────────┐
│  Browser     │ ───────────────────────────────▶  │  Edge Function       │
│  (index.html)│                                    │  (Cloudflare Worker  │
│              │ ◀───────────────────────────────  │   or Vercel Function)│
└─────────────┘      4. answer + source label       └──────────┬───────────┘
                                                                 │
                                      2. check KB first          │ 3. if no KB match,
                                      (fast, free, private)      │    call AI provider(s)
                                                                 ▼
                                                     ┌───────────────────────┐
                                                     │ Knowledge Base (KB)    │
                                                     │ e.g. Supabase/Firebase │
                                                     └───────────────────────┘
                                                                 │
                                                                 ▼
                                                 ┌─────────────────────────────┐
                                                 │ AI Provider(s) — server-side │
                                                 │ keys only: Gemini / OpenAI / │
                                                 │ Perplexity / Claude          │
                                                 └─────────────────────────────┘
```

### 3. Components

| Component | Purpose | Suggested tech |
|---|---|---|
| Static frontend | Existing UI, unchanged hosting | GitHub Pages (keep as-is) |
| Edge function | Single secure entry point; holds all API keys; does anonymization check #2 | Cloudflare Worker (free tier) or Vercel Serverless Function |
| Knowledge Base | Stores anonymized Q&A + approval status | Supabase (Postgres, free tier) or Firebase Firestore |
| Admin panel | Approve/reject KB entries, edit official cutoffs | Simple password-protected page, or Supabase's built-in table editor initially |
| Anonymizer | Regex/rule-based PII stripper, runs client-side AND server-side | Plain JS function, shared between both |

### 4. Request Flow

1. Student types a question in chat.
2. Client-side anonymizer redacts name/phone/email/roll-no/exact score before sending.
3. Edge function re-checks for PII (defense in depth) and rejects/redacts anything missed.
4. Edge function searches KB for a similar, approved question (simple keyword or embedding
   similarity search).
   - **Match found →** return KB answer, label "🔎 Verified", done. No external AI call, no cost.
   - **No match →** call one configured AI provider (start with just one, e.g. Claude or
     Gemini, to control cost) with the anonymized question only.
5. Response returned to student, labeled "🤖 AI-suggested".
6. Student's 👍/👎 feedback is sent back to the edge function and logged against that Q&A pair.
7. Pairs with 👍 feedback (and no PII flags) enter the **pending** queue in the KB for admin
   approval before becoming "🔎 Verified".

### 5. Why not call all 4 providers (Gemini/ChatGPT/Perplexity/Claude) on every message?

- Cost multiplies by 4x for no proportional quality gain on most questions.
- Recommended: start with **one** primary provider + the KB. Add a second provider only as a
  "verifier" for a narrow, high-stakes category (e.g. cutoff/eligibility questions), not for
  every message.

### 6. Data Storage

- KB row example: `{id, question_anonymized, answer, status: pending|approved|rejected,
  source: "ai"|"admin", positive_votes, negative_votes, created_at}`
- No row ever contains a name, phone, email, or roll number — anonymization happens before
  storage, not after.

### 7. Hosting / Cost Notes

- Cloudflare Workers free tier and Supabase free tier are enough to start (low traffic).
- Any AI provider call costs per token — set a daily budget cap in the edge function to avoid
  surprise bills.

### 8. Migration Plan

1. Keep current static site live, unchanged.
2. Stand up edge function + KB as a separate, small project.
3. Point the existing chat's "fetch" call at the new edge function endpoint instead of (or in
   addition to) whatever it currently calls.
4. Ship with one AI provider first; add KB-first lookup; add admin approval queue last.
