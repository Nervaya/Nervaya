# Nervaya Design System Overhaul — Spec

## Context

Nervaya's current CSS has design values (shadows, radii, font sizes, spacing) hardcoded across 50+ component `.module.css` files. This causes inconsistency and makes global changes painful. We're adopting Stripe-inspired structural design practices while keeping Nervaya's purple identity locked.

**Primary inspiration:** Stripe (precision typography, multi-layer shadows, component specs)
**What stays:** Purple accent (#7c3aed), gradients, dark hero backgrounds (#09021d)
**What changes:** Typography rules, shadow system, spacing scale, border system, component patterns, responsiveness

## Approach

**Single source of truth.** All design tokens live in global CSS variable files under `src/styles/`. Components reference `var(--token-name)` — never hardcode values. This means:

- `colors.css` — all colors, semantic roles, borders, shadows
- `spacing.css` — spacing scale, font sizes, line heights, letter spacing, radii, breakpoints, container widths
- Components use ONLY `var()` references for these values

## 1. Color System (colors.css)

### Primary Brand (Locked)

| Token                      | Value                      | Role                      |
| -------------------------- | -------------------------- | ------------------------- |
| `--color-accent`           | `#7c3aed`                  | Primary CTA, brand        |
| `--color-accent-hover`     | `#6d28d9`                  | Hover states              |
| `--color-accent-light`     | `#8b5cf6`                  | Gradient start            |
| `--color-accent-soft`      | `#a78bfa`                  | Links on dark surfaces    |
| `--color-accent-dim`       | `rgba(124, 58, 237, 0.1)`  | Tinted surfaces, badge bg |
| `--color-accent-dim-hover` | `rgba(124, 58, 237, 0.06)` | Secondary btn hover bg    |

### Gradients (Locked)

| Token                     | Value                                                            |
| ------------------------- | ---------------------------------------------------------------- |
| `--gradient-accent`       | `linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)` |
| `--gradient-accent-hover` | `linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)` |
| `--gradient-dark`         | `linear-gradient(135deg, #09021d 0%, #1a0a3e 50%, #2d1566 100%)` |

### Surfaces & Backgrounds

| Token                          | Value     | Role                          |
| ------------------------------ | --------- | ----------------------------- |
| `--color-background`           | `#ffffff` | Card surfaces                 |
| `--color-background-page`      | `#f8f9fc` | Page background (was #ffffff) |
| `--color-background-alt`       | `#f1f5f9` | Alternating sections          |
| `--color-background-dark`      | `#09021d` | Hero / dark sections          |
| `--color-background-dark-card` | `#1a0a3e` | Cards on dark surfaces        |

### Text & Neutrals

| Token                        | Value                      | Role                                  |
| ---------------------------- | -------------------------- | ------------------------------------- |
| `--color-text-primary`       | `#0f172a`                  | Headings                              |
| `--color-text-body`          | `#334155`                  | Body text (NEW — was same as primary) |
| `--color-text-secondary`     | `#64748b`                  | Secondary / muted                     |
| `--color-text-tertiary`      | `#94a3b8`                  | Placeholder, disabled                 |
| `--color-text-disabled`      | `#cbd5e1`                  | Disabled text                         |
| `--color-text-on-dark`       | `#ffffff`                  | Text on dark surfaces                 |
| `--color-text-on-dark-muted` | `rgba(255, 255, 255, 0.6)` | Secondary text on dark                |
| `--color-text-on-dark-dim`   | `rgba(255, 255, 255, 0.3)` | Labels on dark                        |

### Semantic

| Token                 | Value                     | Role                |
| --------------------- | ------------------------- | ------------------- |
| `--color-success`     | `#10b981`                 | Success states      |
| `--color-success-dim` | `rgba(16, 185, 129, 0.1)` | Success badge bg    |
| `--color-error`       | `#ef4444`                 | Error / destructive |
| `--color-error-dim`   | `rgba(239, 68, 68, 0.1)`  | Error badge bg      |
| `--color-warning`     | `#f59e0b`                 | Warning states      |
| `--color-warning-dim` | `rgba(245, 158, 11, 0.1)` | Warning badge bg    |
| `--color-info`        | `#3b82f6`                 | Info / focus ring   |
| `--color-info-dim`    | `rgba(59, 130, 246, 0.1)` | Info badge bg       |

### Borders (Stripe-inspired — rgba-based whisper borders)

| Token                         | Value                      | Role                     |
| ----------------------------- | -------------------------- | ------------------------ |
| `--color-border`              | `rgba(0, 0, 0, 0.06)`      | Default whisper border   |
| `--color-border-subtle`       | `rgba(0, 0, 0, 0.1)`       | Card borders, dividers   |
| `--color-border-accent`       | `rgba(124, 58, 237, 0.2)`  | Focus / active borders   |
| `--color-border-accent-hover` | `rgba(124, 58, 237, 0.15)` | Hover borders            |
| `--color-border-dark`         | `rgba(124, 58, 237, 0.1)`  | Borders on dark surfaces |

### Shadows (Purple-tinted multi-layer — Stripe technique)

| Token                        | Value                                                                                                                             | Use                        |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `--shadow-sm`                | `rgba(124,58,237,0.04) 0px 1px 3px, rgba(0,0,0,0.02) 0px 1px 2px`                                                                 | Resting cards              |
| `--shadow-md`                | `rgba(124,58,237,0.08) 0px 4px 18px, rgba(0,0,0,0.04) 0px 2px 8px, rgba(0,0,0,0.02) 0px 0.8px 3px`                                | Interactive cards, buttons |
| `--shadow-lg`                | `rgba(124,58,237,0.1) 0px 8px 32px, rgba(0,0,0,0.05) 0px 4px 12px, rgba(0,0,0,0.03) 0px 2px 6px, rgba(0,0,0,0.01) 0px 0.5px 2px`  | Dropdowns, popovers        |
| `--shadow-xl`                | `rgba(124,58,237,0.12) 0px 16px 48px, rgba(0,0,0,0.06) 0px 8px 24px, rgba(0,0,0,0.04) 0px 4px 10px, rgba(0,0,0,0.02) 0px 1px 4px` | Modals, dialogs            |
| `--shadow-btn-primary`       | `rgba(124,58,237,0.25) 0px 4px 18px, rgba(0,0,0,0.04) 0px 2px 8px`                                                                | Primary button             |
| `--shadow-btn-primary-hover` | `rgba(124,58,237,0.35) 0px 8px 28px, rgba(0,0,0,0.06) 0px 4px 12px`                                                               | Primary button hover       |
| `--shadow-focus`             | `0 0 0 3px rgba(124, 58, 237, 0.1)`                                                                                               | Input focus ring           |

## 2. Typography System (spacing.css)

### Font Families

| Token            | Value                                    |
| ---------------- | ---------------------------------------- |
| `--font-heading` | `'Outfit', system-ui, sans-serif`        |
| `--font-body`    | `'Inter', system-ui, sans-serif`         |
| `--font-mono`    | `'Geist Mono', 'Courier New', monospace` |

### Font Sizes — Stripe-inspired scale

| Token            | Desktop            | Mobile (<768px)    | Role                |
| ---------------- | ------------------ | ------------------ | ------------------- |
| `--text-display` | `3.5rem` (56px)    | `2rem` (32px)      | Hero headlines      |
| `--text-h1`      | `2.75rem` (44px)   | `1.75rem` (28px)   | Section headings    |
| `--text-h2`      | `2rem` (32px)      | `1.5rem` (24px)    | Sub-heading large   |
| `--text-h3`      | `1.5rem` (24px)    | `1.25rem` (20px)   | Sub-heading         |
| `--text-h4`      | `1.25rem` (20px)   | `1.125rem` (18px)  | Card titles         |
| `--text-body-lg` | `1.0625rem` (17px) | `1rem` (16px)      | Large body          |
| `--text-body`    | `0.9375rem` (15px) | `0.875rem` (14px)  | Standard body / nav |
| `--text-caption` | `0.875rem` (14px)  | `0.8125rem` (13px) | Metadata, captions  |
| `--text-label`   | `0.75rem` (12px)   | `0.75rem` (12px)   | Badges, labels      |

### Line Heights

| Token               | Value  | Use                               |
| ------------------- | ------ | --------------------------------- |
| `--leading-tight`   | `1.05` | Display headings                  |
| `--leading-snug`    | `1.1`  | H1 headings                       |
| `--leading-heading` | `1.2`  | H2–H3 headings                    |
| `--leading-title`   | `1.25` | H3–H4 headings                    |
| `--leading-compact` | `1.35` | Badges, labels                    |
| `--leading-normal`  | `1.45` | Captions, nav                     |
| `--leading-relaxed` | `1.6`  | Body text (wellness reading pace) |

### Letter Spacing — Negative at display sizes (Stripe signature)

| Token                | Value    | Use                        |
| -------------------- | -------- | -------------------------- |
| `--tracking-display` | `-1.8px` | Display (56px)             |
| `--tracking-h1`      | `-1.4px` | H1 (44px)                  |
| `--tracking-h2`      | `-0.8px` | H2 (32px)                  |
| `--tracking-h3`      | `-0.4px` | H3 (24px)                  |
| `--tracking-h4`      | `-0.2px` | H4 (20px)                  |
| `--tracking-normal`  | `normal` | Body text                  |
| `--tracking-wide`    | `0.3px`  | Labels, badges             |
| `--tracking-wider`   | `1px`    | Section labels (uppercase) |

### Font Weights

| Token               | Value | Use                              |
| ------------------- | ----- | -------------------------------- |
| `--weight-light`    | `300` | Display hero (Stripe confidence) |
| `--weight-normal`   | `400` | Body text                        |
| `--weight-medium`   | `500` | Nav, UI text, H2                 |
| `--weight-semibold` | `600` | H3, H4, card titles, buttons     |
| `--weight-bold`     | `700` | H1, brand emphasis               |

## 3. Spacing Scale (spacing.css)

| Token        | Value   | Use                          |
| ------------ | ------- | ---------------------------- |
| `--space-1`  | `2px`   | Micro gaps                   |
| `--space-2`  | `4px`   | Tight gaps, badge padding-y  |
| `--space-3`  | `8px`   | Small gaps, btn padding-y    |
| `--space-4`  | `12px`  | Input padding, card gaps     |
| `--space-5`  | `16px`  | Standard gaps, btn padding-x |
| `--space-6`  | `24px`  | Card padding, section gaps   |
| `--space-7`  | `32px`  | Large gaps                   |
| `--space-8`  | `48px`  | Section padding              |
| `--space-9`  | `64px`  | Large section padding        |
| `--space-10` | `80px`  | Page section margins         |
| `--space-11` | `96px`  | Section vertical spacing     |
| `--space-12` | `120px` | Hero padding                 |

## 4. Border Radius Scale

| Token           | Value    | Use                    |
| --------------- | -------- | ---------------------- |
| `--radius-sm`   | `4px`    | Tags, small elements   |
| `--radius-md`   | `6px`    | Small buttons          |
| `--radius`      | `8px`    | Standard cards, inputs |
| `--radius-lg`   | `12px`   | Primary buttons, nav   |
| `--radius-xl`   | `16px`   | Featured cards         |
| `--radius-2xl`  | `24px`   | Hero containers        |
| `--radius-full` | `9999px` | Badges, pills          |

## 5. Container & Layout

| Token                       | Value    |
| --------------------------- | -------- |
| `--container-max`           | `1200px` |
| `--container-narrow`        | `800px`  |
| `--container-wide`          | `1400px` |
| `--navbar-height`           | `72px`   |
| `--navbar-height-mobile`    | `64px`   |
| `--sidebar-width`           | `240px`  |
| `--sidebar-width-collapsed` | `72px`   |

## 6. Breakpoints

| Name      | Value         | Key Changes                            |
| --------- | ------------- | -------------------------------------- |
| Mobile    | `< 480px`     | Stacked, hamburger nav, display → 32px |
| Tablet SM | `480–768px`   | 2-col grids begin, display → 40px      |
| Tablet    | `768–1024px`  | Sidebar visible, display → 48px        |
| Desktop   | `1024–1440px` | Full layout, display → 56px            |
| Wide      | `> 1440px`    | Centered, generous margins             |

## 7. Component Specs (referencing global tokens)

### Buttons — 5 variants only

- **Primary:** `background: var(--gradient-accent)`, `color: var(--color-text-on-dark)`, `padding: var(--space-3) var(--space-6)`, `border-radius: var(--radius-lg)`, `box-shadow: var(--shadow-btn-primary)`, hover: `var(--shadow-btn-primary-hover)` + `translateY(-1px)`
- **Secondary:** `background: transparent`, `border: 1px solid var(--color-border-subtle)`, hover: `background: var(--color-accent-dim-hover)` + `border-color: var(--color-border-accent)` + `color: var(--color-accent)`
- **Ghost:** `background: transparent`, `border: 1px solid var(--color-border-accent)`, `color: var(--color-accent)`, hover: `background: var(--color-accent-dim-hover)`
- **Text:** `background: none`, `border: none`, `color: var(--color-accent)`, hover: underline
- **Destructive:** `background: transparent`, `border: 1px solid rgba(239,68,68,0.15)`, `color: var(--color-error)`, hover: `background: var(--color-error-dim)`
- **No pill buttons. No dark variant.**

### Cards — 2 variants

- **Standard:** `background: var(--color-background)`, `border: 1px solid var(--color-border)`, `border-radius: var(--radius)`, `box-shadow: var(--shadow-sm)`, hover: `border-color: var(--color-border-accent-hover)` + `box-shadow: var(--shadow-md)` + `translateY(-2px)`
- **Featured:** same but `border-radius: var(--radius-xl)`, `border: 1px solid var(--color-border-accent-hover)`

### Inputs

- `padding: var(--space-3) var(--space-5)`, `border: 1px solid var(--color-border-subtle)`, `border-radius: var(--radius)`
- Focus: `border-color: var(--color-accent)` + `box-shadow: var(--shadow-focus)`
- Error: `border-color: var(--color-error)`
- Success: `border-color: var(--color-success)`

### Badges — Uniform size, display only

- `padding: 5px 14px`, `border-radius: var(--radius-full)`, `font-size: var(--text-label)`, `font-weight: var(--weight-semibold)`, `letter-spacing: var(--tracking-wide)`
- Colors: accent-dim, success-dim, error-dim, warning-dim, info-dim backgrounds with matching text

### Alerts

- `padding: var(--space-5) var(--space-6)`, `border-radius: 10px`, `border-left: 3px solid [semantic-color]`
- 4 variants: error, success, warning, info (purple accent)

## 8. Transition System

| Token               | Value                                | Use                       |
| ------------------- | ------------------------------------ | ------------------------- |
| `--transition-fast` | `0.15s cubic-bezier(0.4, 0, 0.2, 1)` | Interactive state changes |
| `--transition-base` | `0.2s cubic-bezier(0.4, 0, 0.2, 1)`  | Standard transitions      |
| `--transition-slow` | `0.3s cubic-bezier(0.4, 0, 0.2, 1)`  | Layout shifts             |

## 9. Do's and Don'ts

### Do

- Use CSS variables for ALL design values — colors, spacing, shadows, radii, font sizes
- Use `var(--shadow-md)` not hardcoded shadow strings
- Use `var(--radius-lg)` not hardcoded `12px`
- Use `var(--color-border)` not hardcoded `#e2e8f0`
- Use negative letter-spacing on headings (display: -1.8px, h1: -1.4px)
- Use generous body line-height (1.6) for wellness reading comfort
- Use Outfit weight-300 for display hero text (Stripe confidence)
- Place media queries directly under the selector they modify

### Don't

- Don't hardcode color hex values in component CSS — always use `var()`
- Don't create pill button variants
- Don't create dark button variants
- Don't use `!important` for styling
- Don't mix font families in headings (Outfit only)
- Don't use drop shadows heavier than 0.12 opacity per layer
- Don't duplicate design tokens across component files

## Verification

1. Run `npm run dev` and visually verify every page
2. Check responsive behavior at 480px, 768px, 1024px, 1440px
3. Run `npm run lint` — no errors
4. Verify no hardcoded shadow/color/radius values remain in component CSS (grep for common patterns)
5. Test in browser: buttons, cards, inputs, badges, alerts, navigation, sidebar all reference global tokens
