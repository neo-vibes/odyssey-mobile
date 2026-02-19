# Odyssey Mobile — Design System

## Brand

**Logo:** `assets/odyssey-logo.png`
**Style:** Elegant, minimal, dark mode only

---

## Colors

```typescript
const colors = {
  // Backgrounds
  bg: {
    primary: '#0D0D0F',    // Nearly black
    card: '#1A1A1D',       // Card/surface
    elevated: '#2A2A2E',   // Elevated surfaces
  },
  
  // Accent (Gold)
  accent: {
    primary: '#F5A623',    // Main gold
    light: '#FFB84D',      // Hover/highlight
    dark: '#D4920A',       // Pressed
  },
  
  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',  // Gray-400
    muted: '#6B7280',      // Gray-500
  },
  
  // Status
  status: {
    success: '#22C55E',    // Green-500
    error: '#EF4444',      // Red-500
    warning: '#F59E0B',    // Amber-500
    info: '#3B82F6',       // Blue-500
  },
  
  // Border
  border: {
    default: '#2A2A2E',
    accent: '#F5A623',
  },
};
```

---

## Typography

**Font Family:**
- Primary: `Space Grotesk` (install via expo-google-fonts)
- Mono: `JetBrains Mono`

**Sizes:**
```typescript
const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};
```

**Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## Spacing & Radius

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
```

---

## Components

### Buttons

**Primary (Gold):**
- Background: `accent.primary`
- Text: `#000000` (black)
- Rounded: `borderRadius.md`
- Padding: `spacing.md` vertical, `spacing.lg` horizontal

**Secondary (Outline):**
- Background: transparent
- Border: `border.accent`
- Text: `accent.primary`

**Danger:**
- Background: `status.error`
- Text: white

---

### Cards

- Background: `bg.card`
- Border: 1px `border.default`
- Rounded: `borderRadius.lg`
- Padding: `spacing.md`

---

### Inputs

- Background: `bg.elevated`
- Border: 1px `border.default`
- Rounded: `borderRadius.md`
- Focus border: `accent.primary`
- Placeholder: `text.muted`

---

## Splash Screen

- Background: `bg.primary` (#0D0D0F)
- Centered logo (200x200)
- Circular progress around logo (gold, `accent.primary`)
- Animated: ring rotates or fills

---

## Icons

Style: **Outlined, rounded**
Library: `@expo/vector-icons` (Feather or Ionicons)

Common icons:
- Wallet: `wallet-outline`
- Agents: `people-outline`
- Bell: `notifications-outline`
- Settings: `settings-outline`
- Send: `send-outline`
- Copy: `copy-outline`
- Check: `checkmark-circle`
- Close: `close-circle`

---

## Shadows

Minimal shadows (dark mode doesn't need much):
```typescript
const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
};
```

---

## Gold Glow Effect

For buttons/highlights:
```typescript
const goldGlow = {
  shadowColor: '#F5A623',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.3,
  shadowRadius: 15,
  elevation: 8,
};
```

---

*Design version: 1.0 — 2026-02-19*
