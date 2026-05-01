# Chingu Brand Guidelines

> Chingu (친구) means "friend" in Korean.
> Chingu is the friend who watches you work and quietly hands you a finished SOP.
> Cappy the capybara is the face of that friend — calm, capable, unbothered.

**Version 2.0** — Warm rebrand · Cappy mascot system

---

## 1. Brand Concept

### The one-liner
The world's chillest friend captures your workflow, so you don't have to.

### Why a capybara
Capybaras are the internet's favorite "everything is fine" animal. They're warm, round, alarmingly calm, and famously friends with everyone. That's Chingu's job: take the most stressful part of your work (writing the doc, capturing the screenshots, formatting the steps) and absorb it without drama.

The mascot does three things at once:
- **Conveys the product promise.** Capybara = relaxed. Using Chingu = relaxed.
- **Owns "친구" literally.** A friendly animal companion, not just a typeface choice.
- **Differentiates from competitors.** Scribe, Tango, MagicHow are all sterile abstract logos. Cappy is a face you remember.

### Personality
| Trait | What that means |
|-------|-----------------|
| **Calm** | Never urgent. Never breathless. Never "🚀". |
| **Helpful** | Solves the problem in front of you, doesn't pitch the next one. |
| **Plainspoken** | "4 steps captured" — not "Your AI-powered workflow has been synthesized." |
| **Quietly clever** | The work is good. We don't need to say so. |
| **Unbothered** | Errors get a shrug, not an alarm. Failures are recoverable. |

---

## 2. Cappy — The Mascot

### Anatomy

Cappy is built from primitive shapes so the silhouette holds at any size.

```
      ◜◝   ◜◝       ← ears (rounded nubs, slight outward tilt)
   ╭───────╮
   │ •   • │        ← eye dots (always solid black, with one sparkle)
   │   ⬬   │        ← nose (horizontal pill)
   │   ‿   │        ← mouth (gentle 'u' smile by default)
   ╰───────╯
```

- **Body color:** Capy Tan `#C8956D`
- **Belly / snout patch:** Sand `#E8B98E`
- **Ear interior:** Soft Peach `#FFD4A8`
- **Ear shadow:** Cocoa `#A6754F`
- **Eyes & nose:** Ink `#0F172A`
- **Cheek blush:** Pink `#FF8FA3` at 42% opacity (use sparingly)

### Expressions

Cappy has exactly five expressions. No more.

| Expression | Eyes | Mouth | Use for |
|------------|------|-------|---------|
| **Default (chill)** | • • | gentle smile `‿` | All marketing, idle states, default avatar |
| **Working** | ◑ ◑ (focused) | small line `─` | Recording state, autopilot running |
| **Happy (win)** | ^ ^ (closed arcs) | wide smile `⌣` | Success states, completion, exports |
| **Confused (oops)** | • ○ (one dot, one circle) | small "o" | Errors, empty states with humor |
| **Sleepy (idle)** | ‿ ‿ (closed) | flat line | Long idle, "no recordings yet" |

Never draw Cappy: angry, sad, crying, frowning. The product never blames the user. If something failed, Cappy is confused — never disappointed.

### Accessories (optional)

Cappy is rarely empty-handed in illustrations. Pick one accessory per scene:

- 📋 **Clipboard** — recording / capturing
- 🎬 **Director's slate** — autopilot mode
- 📄 **PDF page** — export complete
- 🔍 **Magnifying glass** — search / lookup
- 💤 **Z bubble** — idle / no recordings
- 🍊 **Tangerine** — happy / Korean cultural wink

Don't pile accessories. One. Cappy is a minimalist.

### Sizing rules

| Size | What survives |
|------|---------------|
| **128px+** | Full mark with badge, full expression set |
| **48–96px** | Full mark, drop the cheek blush |
| **32px** | Drop the badge, drop blush, keep snout patch |
| **16px** | Silhouette + 2 eye dots + nose only (use `favicon.svg`) |

Never scale `logo.svg` below 32px. Use `favicon.svg` instead.

---

## 3. Color System

Chingu now runs **two palettes** that play in harmony: a warm one (mascot, marketing, friendliness) and a cool one (work, focus, capture). The pairing is the brand.

### Warm palette — "the friend"

| Name | Hex | Usage |
|------|-----|-------|
| **Cappy Tan** | `#C8956D` | Mascot body, warm primary accents |
| **Cocoa** | `#A6754F` | Mascot shadow, dark warm text on cream |
| **Sunrise** | `#FFB07A` | Gradient mid-stop, hover warm CTAs |
| **Soft Peach** | `#FFD4A8` | Light warm surfaces, ear interiors |
| **Cream** | `#FFF5E4` | Marketing backgrounds, illustration canvas |

### Cool palette — "the work"

| Name | Hex | Usage |
|------|-----|-------|
| **Chingu Indigo** | `#6366F1` | Primary buttons, links, focus rings |
| **Chingu Violet** | `#8B5CF6` | Accents, hover states |
| **Chingu Purple** | `#7C3AED` | Autopilot mode, secondary actions |
| **Lavender** | `#A78BFA` | Gradient endpoint, soft cool surfaces |

### Neutrals

| Name | Hex | Usage |
|------|-----|-------|
| **Ink** | `#0F172A` | Primary text, headings, mascot eyes |
| **Slate** | `#334155` | Body text, descriptions |
| **Grey** | `#94A3B8` | Secondary text, labels |
| **Silver** | `#E2E8F0` | Borders, dividers |
| **Snow** | `#F8FAFC` | App backgrounds |
| **White** | `#FFFFFF` | Cards, inputs |

### Semantic colors

| Name | Hex | Usage |
|------|-----|-------|
| **Recording Red** | `#EF4444` | The record dot, only the record dot |
| **Success Mint** | `#10B981` | Completion, exports, "yes that worked" |
| **Warning Honey** | `#F59E0B` | Caution, soft warnings |
| **Info Sky** | `#3B82F6` | Informational, neutral notices |

### Gradients

```css
/* Warm Hug — for marketing, mascot frames, hero panels */
background: linear-gradient(135deg, #FFE4C4 0%, #FFB07A 55%, #C8956D 100%);

/* Cool Focus — for primary CTAs, recording UI, focus moments */
background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%);

/* Capybara Sunset — bridges warm and cool. Use rarely (hero only) */
background: linear-gradient(135deg, #FFD4A8 0%, #C8956D 40%, #8B5CF6 100%);
```

### Pairing rules

1. **Warm and cool can coexist** but don't mix in the same component. Either a button is warm or it's cool.
2. **Cool palette owns work.** Recording, capture, autopilot, primary action buttons.
3. **Warm palette owns feeling.** Mascot, illustrations, marketing surfaces, empty states, success.
4. **Cream backgrounds** for marketing pages. **Snow backgrounds** for the app UI.

---

## 4. Typography

### Font stack

```css
/* Default — UI and body */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Display — marketing headlines only */
font-family: 'Fraunces', 'Inter', serif;
```

Inter remains the workhorse. Fraunces (Google Fonts, free) is added for marketing display headlines — its softer terminals match the rounded mascot. Don't use Fraunces inside the extension UI.

### Type scale

| Name | Size | Weight | Family | Usage |
|------|------|--------|--------|-------|
| **Display** | 48px | 700 | Fraunces | Marketing hero only |
| **Display Sub** | 32px | 700 | Inter | App-level hero (popup, viewer) |
| **Heading 1** | 24px | 700 | Inter | Guide titles |
| **Heading 2** | 18px | 600 | Inter | Section headers |
| **Heading 3** | 15px | 600 | Inter | Step descriptions |
| **Body** | 14px | 400 | Inter | General text |
| **Caption** | 12px | 400 | Inter | URLs, metadata |
| **Micro** | 11px | 500 | Inter | Badges, tags |

### Letter spacing

- Display (Fraunces): `-0.01em`
- Headings (Inter): `-0.02em`
- Body: `0`
- Captions: `0.01em`
- All caps micro-labels: `0.05em`

---

## 5. Voice & Tone

### Personality on the page

Chingu sounds like a friend who already does this for a living and isn't precious about it.

**Do:**
- "Got it — 12 steps, screenshots are good."
- "Recording. Use the page like normal."
- "Hmm, that didn't capture cleanly. Try again?"
- "Done. Your guide is ready."

**Don't:**
- "Successfully captured your workflow!" (too breathless)
- "Oops! 😅 Something went wrong! Please try again!" (too apologetic, emoji overload)
- "Your AI-powered SOP has been synthesized." (jargon)
- "We're sorry for any inconvenience this may have caused." (corporate)

### The five rules

1. **Active voice always.** "Chingu captured 4 steps" — not "4 steps were captured."
2. **Specific over generic.** "Your guide is ready" beats "Operation complete."
3. **Contractions are fine.** "don't", "you'll", "it's". You're a friend, not a contract.
4. **No exclamation marks** unless something genuinely surprising happened. Reserve them.
5. **One emoji max per surface.** Use 🎬 ✓ 💾 ☕ as functional icons, never as decoration. Skip emoji entirely in error messages.

### Taglines

- **Primary:** "SOPs that actually work"
- **Mascot-led:** "Your chillest coworker"
- **Korean wink:** "친구 — your SOP friend"
- **Technical:** "Open source SOP capture for teams"

---

## 6. Iconography

- **Style:** Outline, 1.5px stroke, rounded caps and joins
- **Default size:** 20×20, compact 16×16
- **Color:** Inherit from `currentColor`
- **Source:** [Lucide Icons](https://lucide.dev) — open source, MIT, matches the rounded mascot vocabulary
- **Don't mix sets.** Lucide only.
- **Don't fill.** Outlines only, except for status pills and the record dot.

---

## 7. Motion

The old rule was "no bouncy animations." That rule is replaced.

**New rule:** Motion has weight. Cappy is a chill capybara, not a hyperactive rabbit. Animations breathe — they don't bounce sharply.

### Motion tokens

| Token | Duration | Easing | Use for |
|-------|----------|--------|---------|
| `motion-instant` | 100ms | `ease-out` | Hover tints, focus rings |
| `motion-quick` | 180ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Button states, tab switches |
| `motion-default` | 320ms | `cubic-bezier(0.34, 1.4, 0.64, 1)` | Mascot reactions, modal entries (gentle overshoot) |
| `motion-soft` | 500ms | `cubic-bezier(0.22, 0.61, 0.36, 1)` | Page transitions, illustration enters |
| `motion-breathe` | 2400ms | `ease-in-out` | Idle blink, ambient float |

### Named animations

```css
/* Recording pulse — Cappy's record dot. Calm heartbeat, not panic. */
@keyframes record-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(0.78); opacity: 0.55; }
}
animation: record-pulse 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;

/* Idle blink — Cappy blinks every 4s, slowly. */
@keyframes blink {
  0%, 92%, 100% { transform: scaleY(1); }
  95%, 98%      { transform: scaleY(0.1); }
}
animation: blink 4s ease-in-out infinite;

/* Float — used on mascot in empty states. Subtle. */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
animation: float 3.6s ease-in-out infinite;

/* Success wiggle — one-shot, gentle overshoot, no spring */
@keyframes success-wiggle {
  0%   { transform: scale(1) rotate(0deg); }
  35%  { transform: scale(1.08) rotate(-3deg); }
  70%  { transform: scale(0.98) rotate(2deg); }
  100% { transform: scale(1) rotate(0deg); }
}
animation: success-wiggle 600ms cubic-bezier(0.34, 1.4, 0.64, 1) 1;
```

### Reduced motion

Always respect `prefers-reduced-motion: reduce`. Replace all loops with a single instant transition. The mascot stops moving — it does not get replaced.

---

## 8. Spacing & radius (unchanged)

Base unit is still **4px**.

| Token | Value | Usage |
|-------|-------|-------|
| `xs` / 4 | 4px | Tight gaps |
| `sm` / 8 | 8px | Related elements |
| `md` / 16 | 16px | Section padding |
| `lg` / 24 | 24px | Card padding |
| `xl` / 32 | 32px | Section gaps |
| `2xl` / 48 | 48px | Major sections |

Border radius:

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 6px | Buttons, inputs |
| `md` | 10px | Cards, dropdowns |
| `lg` | 16px | Modals, large cards |
| `xl` | 22px | Hero cards, mascot frames |
| `full` | 9999px | Pills, avatars, step numbers |

---

## 9. Shadows (refreshed for warm palette)

```css
/* Subtle — cards, inputs */
box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.06);

/* Medium — dropdowns, popovers */
box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04);

/* Strong — modals, lightbox */
box-shadow: 0 20px 60px rgba(15, 23, 42, 0.15), 0 8px 20px rgba(15, 23, 42, 0.08);

/* Warm — under mascot illustrations only */
box-shadow: 0 12px 32px rgba(200, 149, 109, 0.22), 0 4px 8px rgba(166, 117, 79, 0.12);
```

---

## 10. Do's and Don'ts

### Cappy himself

**Do:**
- Keep Cappy round, calm, and slightly tilted (live, not static)
- Use the five expression set — pick the right one, don't invent new ones
- Pair Cappy with a single accessory when context calls for one
- Let Cappy own white space — don't crowd him

**Don't:**
- Anthropomorphize beyond the face. No standing capybara, no clothes, no human poses.
- Draw Cappy crying, angry, or scared — Chingu doesn't blame the user
- Use Cappy as a "loading" decoration on every screen — he's a friend, not a screensaver
- Recolor Cappy. Tan is tan. Don't ship a "blue Cappy" or "rainbow Cappy" without a written reason.

### The system

**Do:**
- Use the gradient as a frame, not as body text
- Pair warm and cool palettes deliberately (warm = feel, cool = work)
- Maintain generous whitespace — Cappy needs room to breathe
- Keep the extension UI minimal — Cappy lives in marketing and empty states, not in every popup

**Don't:**
- Add decorative elements that don't serve a function
- Use more than 2 hues in any single component
- Make every screen "fun" — the recording UI should still feel competent and quiet
- Mix Lucide with another icon set

---

## 11. Asset map

```
/icons
  logo.svg              # Master mark, 512x512, full Cappy + indigo badge
  logo-wordmark.svg     # Horizontal lockup, mini Cappy + "chingu" + 친구
  logo-mono.svg         # Single-color silhouette stamp
  favicon.svg           # 32x32 source, optimized for tiny rendering
  icon16.png            # Generated from favicon.svg
  icon32.png            # Generated from favicon.svg
  icon48.png            # Generated from logo.svg
  icon128.png           # Generated from logo.svg

/illustrations
  empty-no-recordings.svg
  recording-active.svg
  success-export.svg
  error-confused.svg
  onboarding-wave.svg
  autopilot-running.svg

brand-demo.html         # Live motion demo, pop it open in a browser
```

---

## 12. Rebrand notes (Chingu v1 → v2)

For anyone reviewing this against the previous brand:

- **Replaced** the abstract "C-with-record-dot" mark with Cappy the capybara. Indigo badge with red dot is preserved as a corner accessory on the master logo, anchoring continuity.
- **Added** a warm palette (Cappy Tan, Soft Peach, Cream). Indigo/violet system is unchanged — its role narrowed to "work surfaces" while warm owns "feeling surfaces."
- **Reversed** the "no bouncy animations" rule. Soft overshoot easings are now allowed, with explicit motion tokens. The recording pulse stays calm.
- **Added** Fraunces for marketing display headlines. UI stays Inter.
- **Added** mascot expression rules, accessory rules, and sizing rules.
- **Kept** spacing, radius, neutral palette, and Lucide iconography.

---

*"Cappy doesn't hustle. Cappy just gets it done."*
