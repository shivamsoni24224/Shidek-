# Frontend Spec Document
## SHIDEK 2.0 — 3D Visual Refresh + AI Chat UI

### 1. Visual Direction

Goal: keep the existing orange (#FF6B00) SHIDEK brand color, but give cards, buttons and the
chat panel a sense of depth — layered, slightly tilted on interaction, soft elevated shadows —
rather than a flat Material-style list. Think "floating glass cards," not heavy skeuomorphism.

### 2. Core 3D Techniques (CSS-only, no heavy library needed)

**a) Tilt-on-hover/touch cards** (Tool cards, College cards, Predictor cards)
```css
.card-3d {
  perspective: 800px;
}
.card-3d-inner {
  transition: transform 0.15s ease-out;
  transform-style: preserve-3d;
  box-shadow: 0 10px 30px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.10);
  border-radius: 16px;
}
```
JS on `mousemove`/`touchmove` over `.card-3d` computes rotateX/rotateY (max ±8deg) based on
pointer position relative to card center, applied to `.card-3d-inner`. Reset to 0 on
mouseleave/touchend. (Keep the rotation small — large tilts feel gimmicky on a counseling app.)

**b) Layered depth via shadow + scale, not just rotation**
- Resting state: `box-shadow: 0 6px 16px rgba(0,0,0,0.12)`, `scale(1)`
- Active/pressed state: shadow shrinks, `scale(0.97)` — feels like the card is pressed into
  the page.
- Raised state (on hover for non-touch): shadow grows, `scale(1.02)`.

**c) Glassmorphism for the chat panel and modals**
```css
.glass-panel {
  background: rgba(255,255,255,0.65);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 20px;
}
```

**d) Subtle parallax background (optional, hero/profile screen only)**
Two background layers (gradient blob shapes) moving at different speeds on scroll/gyroscope
tilt — pure CSS `transform: translate3d()`, no Three.js needed for this scale of app. Avoid a
full Three.js particle scene; it adds load time and battery drain for a mobile-first
student audience on average Android phones.

### 3. Component Specs

| Component | 3D treatment |
|---|---|
| Tool cards (Rank Predictor, College Predictor, etc.) | Tilt-on-touch + raised shadow on press |
| Profile setup card | Glass panel, soft floating shadow, no tilt (form needs to feel stable) |
| AI Chat bubbles | Assistant bubble has a subtle 3D "pop" entrance animation (translateY + scale from 0.95→1, 200ms) |
| Predictor result cards | Flip animation (`rotateY(180deg)`) to reveal result, front = "Predicting…", back = result |
| Bottom nav / tab bar | Active tab lifts slightly (`translateY(-2px)` + shadow) instead of just color change |
| 🔎 Verified / 🤖 AI-suggested badges | Small embossed pill badge, inset shadow for "Verified", flat for "AI-suggested" — reinforces the trust signal from the PRD |

### 4. Performance & Accessibility Rules

- Respect `prefers-reduced-motion: reduce` — disable tilt/parallax entirely for those users.
- All 3D effects must be CSS transform/opacity only (GPU-accelerated) — never animate
  `width`/`height`/`top`/`left` directly, to keep 60fps on budget Android devices.
- Tilt listeners use `requestAnimationFrame` throttling, not raw mousemove handlers.
- Minimum tap target size unchanged (44×44px) even with 3D hover effects layered on top.

### 5. Implementation Note

This spec assumes edits go directly into the existing `index.html`'s `<style>`/`<script>`
sections (the app appears to be a single-file PWA). To implement this precisely against the
*current* file, share the current `index.html`/CSS/JS so the classes above can be wired into
the real DOM structure rather than a generic mockup.
