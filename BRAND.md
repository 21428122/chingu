# Chingu Brand Guidelines

> Chingu (친구) means "friend" in Korean.
> The brand should feel like a smart, reliable friend who makes your work easier.

---

## Logo

The Chingu logo is a rounded square with a stylized "C" that forms a capture/record symbol.
The negative space creates a play button, representing both "recording" and "moving forward."

- **Primary:** Logo on dark/colored background (white mark)
- **Secondary:** Logo on light background (indigo mark)
- **Icon only:** For favicons, extension icons, app icons
- **Minimum size:** 16px (icon only), 24px (with wordmark)
- **Clear space:** 1x the height of the logo mark on all sides

---

## Colors

### Primary Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Chingu Indigo** | `#6366F1` | Primary brand, buttons, links, logo |
| **Chingu Violet** | `#8B5CF6` | Accents, gradients, hover states |
| **Chingu Purple** | `#7C3AED` | Autopilot mode, secondary actions |

### Gradient

```css
background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%);
```

Used on: header bars, hero sections, primary CTAs, logo backgrounds.

### Neutral Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Ink** | `#0F172A` | Primary text, headings |
| **Slate** | `#334155` | Body text, descriptions |
| **Grey** | `#94A3B8` | Secondary text, labels |
| **Silver** | `#E2E8F0` | Borders, dividers |
| **Snow** | `#F8FAFC` | Backgrounds, cards |
| **White** | `#FFFFFF` | Card backgrounds, inputs |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#10B981` | Completed steps, success states |
| **Error** | `#EF4444` | Recording dot, errors, stop buttons |
| **Warning** | `#F59E0B` | Caution states |
| **Info** | `#3B82F6` | Informational |

---

## Typography

### Font Stack

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

Inter is the primary typeface. Load weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold).

### Type Scale

| Name | Size | Weight | Usage |
|------|------|--------|-------|
| **Display** | 32px | 700 | Landing page hero |
| **Heading 1** | 24px | 700 | Guide titles |
| **Heading 2** | 18px | 600 | Section headers |
| **Heading 3** | 15px | 600 | Step descriptions |
| **Body** | 14px | 400 | General text |
| **Caption** | 12px | 400 | URLs, metadata, labels |
| **Micro** | 11px | 500 | Badges, tags |

### Letter Spacing

- Headings: `-0.02em` (slightly tighter)
- Body: `0` (default)
- Captions: `0.01em` (slightly looser)

---

## Spacing

Base unit: **4px**

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight gaps |
| `sm` | 8px | Related elements |
| `md` | 16px | Section padding |
| `lg` | 24px | Card padding |
| `xl` | 32px | Section gaps |
| `2xl` | 48px | Major sections |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 6px | Buttons, inputs |
| `md` | 10px | Cards, dropdowns |
| `lg` | 16px | Modals, large cards |
| `xl` | 20px | Hero cards |
| `full` | 9999px | Pills, avatars, step numbers |

---

## Shadows

```css
/* Subtle — cards, inputs */
box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.06);

/* Medium — dropdowns, popovers */
box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04);

/* Strong — modals, lightbox */
box-shadow: 0 20px 60px rgba(15, 23, 42, 0.15), 0 8px 20px rgba(15, 23, 42, 0.08);
```

---

## Voice & Tone

### Personality

Chingu is:
- **Friendly but not silly.** Like a smart coworker, not a chatbot.
- **Confident but not arrogant.** We know we're good. We don't need to brag.
- **Direct but not cold.** Say what you mean. Skip the fluff.
- **Helpful but not patronizing.** Respect the user's intelligence.

### Writing Rules

- Use active voice: "Chingu captures your workflow" not "Your workflow is captured by Chingu"
- Be specific: "4 steps captured" not "Your guide is ready"
- Use contractions: "don't", "you'll", "it's" — sounds human
- No jargon: "screenshot" not "screen capture artifact"
- No exclamation marks unless something genuinely exciting happened

### Taglines

- Primary: **"SOPs that actually work"**
- Secondary: **"Your workflow, documented in clicks"**
- Technical: **"Open source SOP capture for teams"**

---

## Iconography

- Style: Outline, 1.5px stroke, rounded caps
- Size: 20x20 default, 16x16 compact
- Color: Inherit from text color (currentColor)
- Source: Lucide Icons (https://lucide.dev) — open source, consistent with brand

---

## Motion

- **Duration:** 150ms for micro-interactions, 300ms for transitions, 500ms for page changes
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out for entrances, ease-in for exits)
- **Recording pulse:** `animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite`
- **No bouncy animations.** Chingu is professional, not playful.

---

## Do's and Don'ts

**Do:**
- Use the gradient sparingly — headers, hero, primary CTA only
- Maintain generous whitespace
- Use the step number circles consistently (indigo background, white text)
- Keep the UI minimal — every pixel earns its place

**Don't:**
- Use the gradient on body text or small elements
- Add decorative elements that don't serve a function
- Use more than 2 colors in any single view
- Make the UI "fun" — it should feel trustworthy and competent
