# Mmhs OAuth Design System

## 1. Atmosphere & Identity

Mmhs OAuth is a quiet school-service command center. It should feel reliable, compact, and operational rather than promotional. The signature is restrained Mirim green on layered neutral surfaces.

## 2. Color

### Palette

| Role             | Token                          | Light     | Dark      | Usage                          |
| ---------------- | ------------------------------ | --------- | --------- | ------------------------------ |
| Accent/primary   | `theme.colors.primary`         | `#008156` | `#00a06b` | CTAs, focus, active navigation |
| Accent/hover     | `theme.colors.primaryDark`     | `#006348` | `#00bc7d` | CTA hover                      |
| Accent/subtle    | `theme.colors.primaryLight`    | `#e7f3ee` | `#1b3229` | Selected states, subtle panels |
| Surface/base     | `theme.colors.background`      | `#f3f6f8` | `#0b1017` | Page background                |
| Surface/card     | `theme.colors.surface`         | `#ffffff` | `#131a24` | Cards, shell surfaces          |
| Surface/elevated | `theme.colors.surfaceElevated` | `#fbfdff` | `#1a2330` | Inputs, dropdowns              |
| Text/primary     | `theme.colors.text`            | `#0f172a` | `#e7edf5` | Main text                      |
| Text/secondary   | `theme.colors.secondaryText`   | `#475569` | `#acb8c8` | Supporting text                |
| Text/muted       | `theme.colors.mutedText`       | `#64748b` | `#7e8da1` | Metadata, placeholders         |
| Border/default   | `theme.colors.border`          | `#d5dce5` | `#2a3340` | Dividers, inputs               |
| Border/card      | `theme.colors.cardBorder`      | `#d7dee7` | `#2f3a49` | Cards, dropdowns               |
| Status/error     | `theme.colors.error`           | `#c32f3e` | `#ef5a67` | Errors                         |
| Status/success   | `theme.colors.success`         | `#1f9d63` | `#44d08f` | Success feedback               |
| Status/warning   | `theme.colors.warning`         | `#b7791f` | `#f6b447` | Cautions                       |

### Rules

- Use only `theme.colors.*` tokens in components.
- Green is for actions and confirmed state, not decoration.
- Error, success, and warning colors are reserved for status feedback.

## 3. Typography

### Scale

| Level   | Size      | Weight  | Line Height | Tracking | Usage                      |
| ------- | --------- | ------- | ----------- | -------- | -------------------------- |
| H1      | `1.5rem`  | 700     | 1.2         | 0        | Page titles                |
| H2      | `1rem`    | 700     | 1.2         | 0        | Shell titles, panel titles |
| Body    | `0.95rem` | 400     | 1.5         | 0        | Forms and default text     |
| Body/sm | `0.82rem` | 400-600 | 1.45        | 0        | Dropdowns, labels          |
| Caption | `0.73rem` | 400     | 1.3         | 0        | Metadata                   |

### Font Stack

- Primary: system UI via the app global style.
- Mono: browser/system monospace where code is rendered.

### Rules

- Keep operational screens dense but readable.
- Body text must not drop below `0.73rem`.

## 4. Spacing & Layout

### Base Unit

All spacing follows a 4px base.

| Token | Value  | Usage             |
| ----- | ------ | ----------------- |
| xs    | `4px`  | Tight inline gaps |
| sm    | `8px`  | Compact controls  |
| md    | `12px` | Form spacing      |
| lg    | `16px` | Default groups    |
| xl    | `20px` | Card internals    |
| 2xl   | `24px` | Page padding      |

### Grid

- Dashboard content max width: `1080px` on profile surfaces.
- Shell desktop sidebar: `248px`.
- Mobile breakpoint: `1024px` for drawer/sidebar switch.

### Rules

- Keep spacing multiples of 4px.
- Page sections are full-width within the shell; cards frame individual tools only.

## 5. Components

### Card

- Structure: bordered `div` on `theme.colors.surface`.
- Spacing: `1.25rem` padding.
- States: static container only.
- Accessibility: content must keep semantic headings/labels.

### Input

- Structure: native input with visible label.
- States: default, focus, disabled, invalid.
- Accessibility: labels use `htmlFor`; focus ring uses primary token.

### Button

- Variants: primary, secondary, danger.
- States: default, hover, disabled, loading text.
- Accessibility: use real `button`, not clickable `div`.

## 6. Motion & Interaction

### Timing

| Type  | Duration  | Easing | Usage        |
| ----- | --------- | ------ | ------------ |
| Micro | 150-200ms | ease   | hover, focus |

### Rules

- Animate color and opacity only for this dashboard.
- Every input and button has visible focus.

## 7. Depth & Surface

### Strategy

Mixed, but restrained: bordered surfaces first, small shadows only for floating menus.

| Type            | Value                               | Usage                 |
| --------------- | ----------------------------------- | --------------------- |
| Border/default  | `1px solid theme.colors.border`     | Inputs, rows          |
| Border/card     | `1px solid theme.colors.cardBorder` | Cards, dropdowns      |
| Shadow/floating | `0 12px 24px rgba(0, 0, 0, 0.24)`   | Profile dropdown only |
