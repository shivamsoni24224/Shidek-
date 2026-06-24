# Security & Access Document
## SHIDEK 2.0 — Self-Improving AI Assistant

### 1. Principle

No student-identifying data ever reaches a third-party AI provider, and no AI provider API
key ever reaches the browser. These two rules are non-negotiable for this feature.

### 2. API Key Handling

- API keys for Gemini / OpenAI / Perplexity / Claude live **only** as environment
  variables/secrets on the edge function (Cloudflare/Vercel secret store).
- Keys are never committed to the GitHub repo, never present in `index.html` or any JS file
  shipped to the browser, and never logged in plaintext.
- Rotate keys immediately if a repo, zip, or commit history is found to contain one.

### 3. What counts as PII here (must always be stripped before any external AI call)

- Full name, phone number, email address
- NEET/GUJCET roll number, application/form number
- Exact NEET/GUJCET score (round to nearest 10, e.g. "around 580" not "583")
- Exact rank (round to nearest 100)
- Any free-text the student typed that looks like an address, Aadhaar-style number, or other
  ID (basic pattern match: digit sequences of 8+, "@" + domain, etc.)

### 4. Anonymization Enforcement (defense in depth)

1. **Client-side pass** — before the request leaves the browser, redact known fields the app
   itself collected (name/score/rank/category from the profile form) and run a PII regex over
   free-text input.
2. **Server-side pass** — the edge function repeats the regex check independently. If PII is
   detected, the function blocks the call and asks the student to rephrase, rather than
   silently forwarding it.
3. Only after both passes succeed does the question go to the KB lookup / external AI call.

### 5. Consent

- First time a student uses AI chat, show a one-line notice: "Your question may be checked
  against an AI service to get you an answer. We remove your name, score and contact details
  first." Simple accept-once, stored locally (not on a server).

### 6. Data Retention

- KB entries: kept indefinitely (they're anonymized, low-risk, and useful long-term).
- Raw per-session chat logs (if logged at all for debugging): auto-delete after 30 days.
- No backups of raw logs containing pre-redaction text.

### 7. Admin Access

- Admin panel (approve/reject KB entries, edit official cutoffs) is password-protected, single
  admin user (Shivam) to start.
- Use a real auth provider (Supabase Auth, Firebase Auth) rather than a hardcoded password in
  client code.
- No public write access to the KB — students can only submit feedback (👍/👎), never edit
  KB content directly.

### 8. Rate Limiting & Abuse Prevention

- Edge function caps requests per IP/session (e.g. 20 AI calls/hour) to control cost and
  prevent scraping/abuse.
- Any request exceeding the cap gets a KB-only or cached response, not a fresh AI call.

### 9. Third-Party Terms of Service

- Each AI provider (Google/Gemini, OpenAI, Perplexity, Anthropic/Claude) has its own API terms
  for automated use, data handling, and rate limits. Review the current terms for whichever
  provider(s) you actually wire up before launch — this doc doesn't substitute for that.

### 10. Incident Response

- If a PII leak to a third party is ever discovered: rotate keys, purge the affected KB/log
  entries, and note the incident + fix in the repo's CHANGELOG before re-enabling the feature.
