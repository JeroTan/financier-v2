---
name: Liquid Gold Ledger
colors:
  surface: "#f8fafb"
  surface-dim: "#d8dadb"
  surface-bright: "#f8fafb"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f2f4f5"
  surface-container: "#eceeef"
  surface-container-high: "#e6e8e9"
  surface-container-highest: "#e1e3e4"
  on-surface: "#191c1d"
  on-surface-variant: "#504532"
  inverse-surface: "#2e3132"
  inverse-on-surface: "#eff1f2"
  outline: "#827660"
  outline-variant: "#d4c5ab"
  surface-tint: "#795900"
  primary: "#795900"
  on-primary: "#ffffff"
  primary-container: "#ffbf00"
  on-primary-container: "#6d5000"
  inverse-primary: "#fbbc00"
  secondary: "#5d5e61"
  on-secondary: "#ffffff"
  secondary-container: "#e2e2e5"
  on-secondary-container: "#636467"
  tertiary: "#006879"
  on-tertiary: "#ffffff"
  tertiary-container: "#04dcff"
  on-tertiary-container: "#005d6d"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#ffdfa0"
  primary-fixed-dim: "#fbbc00"
  on-primary-fixed: "#261a00"
  on-primary-fixed-variant: "#5c4300"
  secondary-fixed: "#e2e2e5"
  secondary-fixed-dim: "#c6c6c9"
  on-secondary-fixed: "#1a1c1e"
  on-secondary-fixed-variant: "#454749"
  tertiary-fixed: "#aaedff"
  tertiary-fixed-dim: "#00d9fc"
  on-tertiary-fixed: "#001f26"
  on-tertiary-fixed-variant: "#004e5c"
  background: "#f8fafb"
  on-background: "#191c1d"
  surface-variant: "#e1e3e4"
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: "700"
    lineHeight: "1.2"
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: "700"
    lineHeight: "1.2"
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: "600"
    lineHeight: "1.4"
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.6"
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: "400"
    lineHeight: "1.5"
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: "600"
    lineHeight: "1"
    letterSpacing: 0.05em
  data-display:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: "700"
    lineHeight: "1"
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  chat-gap: 16px
  container-max: 1200px
---

## Brand & Style

The design system is anchored in a **Modern Corporate** aesthetic that balances the precision of financial data with the accessibility of a conversational interface. It evokes a sense of high-trust transparency through a "clean-room" approach: expansive white space, precise alignment, and a focused color palette.

The target audience consists of modern professionals and individuals who require immediate, clear insights into their finances without the friction of traditional banking interfaces. The emotional response is one of **clarity and confidence**. By stripping away unnecessary ornamentation and utilizing a vibrant gold accent, the design system signals both "wealth" and "action," ensuring the user feels in control of their financial narrative.

## Colors

The palette is intentionally restrained to prioritize legibility and focus.

- **Primary (Amber/Gold):** Used exclusively for primary calls to action, active states, and highlighting key financial wins. It provides a "vibrant spark" against the neutral background.
- **Secondary (Deep Navy/Gray):** Used for primary text and iconography to ensure high contrast and a grounded, professional feel.
- **Surface & Neutrals:** A range of ultra-light grays (Cool Grays) are used to differentiate chat bubbles and background sections without introducing visual noise.
- **Semantic Colors:** Emerald green for income/gains and Rose red for expenses/losses are used with low-saturation backgrounds to maintain the clean aesthetic.

## Typography

This design system utilizes **Hanken Grotesk** across all roles to maintain a sharp, contemporary, and engineered feel.

- **Headlines:** Use tighter letter spacing and bold weights to create clear entry points.
- **Data Display:** A specific role for monetary values, utilizing a bold weight and slightly condensed spacing to emphasize numerical importance.
- **Body Text:** Standardized on a 16px base for optimal readability in chat threads, ensuring that even long financial explanations remain approachable.
- **Labels:** Small, uppercase, and slightly tracked out to act as metadata markers without distracting from the primary conversation.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a hard 8px rhythmic base.

- **Desktop:** A three-pane architecture. Left for navigation/history, Center for the primary chat stream, and Right for contextual data widgets (Total Wealth, Expense Breakdown).
- **Mobile:** A single-pane focus. Navigation is moved to a bottom bar, and data widgets are accessible via "Snap Cards" that can be pulled down from the header.
- **Chat Rhythm:** Message clusters use a 4px "sibling" gap and a 16px "sender" gap to visually group thoughts. Content is inset from the screen edges by 24px on desktop and 16px on mobile to create a "contained" and safe feeling.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Soft Ambient Shadows**.

- **Level 0 (Background):** Pure white or `#F8F9FA`.
- **Level 1 (Chat Bubbles/Input):** Soft gray surfaces with a subtle 1px border (`#EDEFF2`). No shadows are used here to keep the feed flat and readable.
- **Level 2 (Financial Cards/Widgets):** These use a very soft, diffused shadow (Offset: 0, 4px; Blur: 20px; Opacity: 4%) to "lift" them from the chat thread, signaling they are interactive objects.
- **Floating Actions:** The primary send button or "New Entry" button uses a slightly more aggressive shadow with a hint of the primary color tint to draw the eye.

## Shapes

The shape language is **Rounded**, favoring 0.5rem (8px) as the standard corner radius.

- **Chat Bubbles:** Use a 12px radius for the outer corners. For user messages, the tail corner is sharper (4px) to indicate directionality.
- **Financial Cards:** Use a 16px (1rem) radius to feel more like physical cards or "containers" of value.
- **Buttons:** Fully pill-shaped (32px+) to distinguish them as actionable touchpoints compared to static data containers.

## Components

### Chat Bubbles

- **User:** Primary Gold background with Secondary Navy text. Right-aligned.
- **System/Bot:** Light Gray (`#F1F3F4`) background with Secondary Navy text. Left-aligned.
- **Status:** Integrated "Read" or "Processing" indicators in `body-sm` typography below the bubble.

### Financial Entry Cards

- **Structure:** Vertical stack. Top row: Category icon + Name. Middle: `data-display` amount. Bottom: Date and payment method.
- **Visual Cues:** A 4px vertical accent bar on the left edge (Green for income, Red for expense) provides instant scanning capability.

### Data Visualization Widgets

- **Sparklines:** Minimalist lines without axes, using the Primary Gold color to show trends within the chat flow.
- **Progress Bars:** Thick 8px bars with rounded ends. The track is a light gray, and the progress is the Primary Gold.

### Input Field

- **Design:** A "borderless" style floating at the bottom. A subtle top border separates it from the chat. It contains a leading "Plus" icon for attachments and a trailing "Send" icon inside a pill-shaped Gold button.

### Chips

- **Usage:** Suggesting common queries (e.g., "Monthly Report," "Last Expense").
- **Style:** 1px border, no fill, high roundedness. On hover/active, they fill with a very light tint of the Primary color.
