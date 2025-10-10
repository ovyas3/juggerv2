# Juggernaut Design System

> Visual design guidelines, color palette, typography, spacing, and component styling standards

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Elevation & Shadows](#elevation--shadows)
5. [Border Radius](#border-radius)
6. [Component Sizes](#component-sizes)
7. [Design Tokens](#design-tokens)
8. [Visual Examples](#visual-examples)

---

## Color Palette

### Primary Colors

**Global CSS Variables** (defined in `src/app/globals.css`):

```css
:root {
  --primary-color: #2a9d8f;      /* Teal - Primary brand color */
  --secondary-color: #e76f51;    /* Coral - Secondary accent */
  --tertiary-color: #264653;     /* Dark blue-gray - Tertiary */
  --background-color: #f8f9fa;   /* Light gray - Page background */
  --card-background: #ffffff;    /* White - Card backgrounds */
  --text-primary: #1a1a1a;       /* Almost black - Primary text */
  --text-secondary: #6c757d;     /* Gray - Secondary text */
  --border-color: #e9ecef;       /* Light gray - Borders */
}
```

#### PTPK Dashboard Colors (Primary Blue Theme)

The PTPK Dashboard uses a **blue-focused color scheme**:

| Color | Hex | Usage |
|-------|-----|-------|
| ![#2563eb](https://via.placeholder.com/20/2563eb/2563eb.png) | `#2563eb` | Primary Blue - Main CTA, active states, export button |
| ![#4f46e5](https://via.placeholder.com/20/4f46e5/4f46e5.png) | `#4f46e5` | Indigo - Gradient accent with primary blue |
| ![#3b82f6](https://via.placeholder.com/20/3b82f6/3b82f6.png) | `#3b82f6` | Bright Blue - Icons, focus states |
| ![#1d4ed8](https://via.placeholder.com/20/1d4ed8/1d4ed8.png) | `#1d4ed8` | Dark Blue - Selected text, active filters |
| ![#eff6ff](https://via.placeholder.com/20/eff6ff/eff6ff.png) | `#eff6ff` | Blue 50 - Active item backgrounds, light blue tint |
| ![#e0f2fe](https://via.placeholder.com/20/e0f2fe/e0f2fe.png) | `#e0f2fe` | Sky 100 - Selected backgrounds, gradient |
| ![#e0e7ff](https://via.placeholder.com/20/e0e7ff/e0e7ff.png) | `#e0e7ff` | Indigo 100 - Gradient background accent |

**PTPK Dashboard Header**:
```css
/* Blue gradient header from actual code */
.headerBar {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
}
```

**Page Background**:
```css
/* Multi-color gradient background */
.pageContainer {
  background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%);
}
```

#### Visual Reference - Global Colors

| Color | Hex | Variable | Usage |
|-------|-----|----------|-------|
| ![#2a9d8f](https://via.placeholder.com/20/2a9d8f/2a9d8f.png) | `#2a9d8f` | `--primary-color` | Global brand color (not used in PTPK) |
| ![#e76f51](https://via.placeholder.com/20/e76f51/e76f51.png) | `#e76f51` | `--secondary-color` | Secondary accent |
| ![#264653](https://via.placeholder.com/20/264653/264653.png) | `#264653` | `--tertiary-color` | Dark headers |
| ![#f8f9fa](https://via.placeholder.com/20/f8f9fa/f8f9fa.png) | `#f8f9fa` | `--background-color` | Page backgrounds |
| ![#ffffff](https://via.placeholder.com/20/ffffff/ffffff.png) | `#ffffff` | `--card-background` | Cards, panels |
| ![#111827](https://via.placeholder.com/20/111827/111827.png) | `#111827` | `--text-primary` | Headings, values |
| ![#6b7280](https://via.placeholder.com/20/6b7280/6b7280.png) | `#6b7280` | `--text-secondary` | Labels, descriptions |
| ![#e2e8f0](https://via.placeholder.com/20/e2e8f0/e2e8f0.png) | `#e2e8f0` | `--border-color` | Borders, dividers |

**CSS Usage**:
```css
.container {
  background-color: var(--background-color);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

/* PTPK Dashboard specific */
.ptpkButton {
  background: #2563eb;  /* Primary blue */
  color: #ffffff;
}

.ptpkCard {
  background: #f9fafb;
  border: 1px solid #e2e8f0;
}
```

---

### Dashboard Metric Card Colors

Based on the PTPK Dashboard metric cards in your screenshot:

| Card Type | Background | Border/Icon | Text | Usage |
|-----------|------------|-------------|------|-------|
| **Blue Card** (Shipments) | `#e3f2fd` / `#dbeafe` | `#2563eb` / `#3b82f6` | `#2563eb` | Number of shipments, info metrics |
| **Red/Pink Card** (Quantity) | `#fee2e2` / `#fce7f3` | `#dc2626` / `#ec4899` | `#dc2626` | Quantity billed, critical metrics |
| **Green Card** (Freight) | `#d1fae5` / `#dcfce7` | `#10b981` / `#22c55e` | `#059669` | Freight amount, success metrics |
| **Orange/Amber Card** (Cost) | `#fed7aa` / `#fef3c7` | `#f59e0b` / `#fb923c` | `#d97706` | Cost per ton, warning metrics |
| **Purple/Violet Card** (Distance) | `#e9d5ff` / `#f3e8ff` | `#8b5cf6` / `#a855f7` | `#7c3aed` | Average distance, secondary metrics |

**Example - Blue Metric Card**:
```css
.metricCardBlue {
  background: linear-gradient(135deg, #e3f2fd 0%, #dbeafe 100%);
  border: 2px solid #3b82f6;
  border-radius: 8px;
  padding: 20px;
}

.metricCardBlue .icon {
  color: #2563eb;
}

.metricCardBlue .value {
  font-size: 24px;
  font-weight: 700;
  color: #2563eb;
}

.metricCardBlue .label {
  font-size: 14px;
  color: #1e40af;
}
```

**Example - Red Metric Card**:
```css
.metricCardRed {
  background: linear-gradient(135deg, #fee2e2 0%, #fce7f3 100%);
  border: 2px solid #ec4899;
  border-radius: 8px;
  padding: 20px;
}

.metricCardRed .icon {
  color: #dc2626;
}

.metricCardRed .value {
  font-size: 24px;
  font-weight: 700;
  color: #dc2626;
}
```

**Example - Green Metric Card**:
```css
.metricCardGreen {
  background: linear-gradient(135deg, #d1fae5 0%, #dcfce7 100%);
  border: 2px solid #22c55e;
  border-radius: 8px;
  padding: 20px;
}

.metricCardGreen .icon {
  color: #10b981;
}

.metricCardGreen .value {
  font-size: 24px;
  font-weight: 700;
  color: #059669;
}
```

**TypeScript Usage**:
```typescript
const metricCardColors = {
  blue: {
    bg: 'linear-gradient(135deg, #e3f2fd 0%, #dbeafe 100%)',
    border: '#3b82f6',
    icon: '#2563eb',
    value: '#2563eb',
    label: '#1e40af'
  },
  red: {
    bg: 'linear-gradient(135deg, #fee2e2 0%, #fce7f3 100%)',
    border: '#ec4899',
    icon: '#dc2626',
    value: '#dc2626',
    label: '#991b1b'
  },
  green: {
    bg: 'linear-gradient(135deg, #d1fae5 0%, #dcfce7 100%)',
    border: '#22c55e',
    icon: '#10b981',
    value: '#059669',
    label: '#047857'
  },
  orange: {
    bg: 'linear-gradient(135deg, #fed7aa 0%, #fef3c7 100%)',
    border: '#fb923c',
    icon: '#f59e0b',
    value: '#d97706',
    label: '#b45309'
  },
  purple: {
    bg: 'linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 100%)',
    border: '#a855f7',
    icon: '#8b5cf6',
    value: '#7c3aed',
    label: '#6d28d9'
  }
}
```

---

### Semantic Colors

#### Success (Green)

| Shade | Hex | Usage |
|-------|-----|-------|
| Success Primary | `#16a34a` | Success icons, borders (green-600) |
| Success Light | `#22c55e` | Success buttons (green-500) |
| Success Alt | `#10B981` | Alt success (emerald-500) |
| Success Lighter | `#34D399` | Lighter variant (emerald-400) |
| Success BG | `#ECFDF5` | Success backgrounds (green-50) |
| Success BG Alt | `#F0FDF4` | Alt background (green-50) |

**Usage Example**:
```css
.successCard {
  background-color: #ECFDF5;
  border: 2px solid #16a34a;
  color: #16a34a;
}

.successButton {
  background: #22c55e;
  color: #ffffff;
}
```

#### Error/Danger (Red)

| Shade | Hex | Usage |
|-------|-----|-------|
| Error Primary | `#dc2626` | Error text, icons (red-600) |
| Error Light | `#ef4444` | Error buttons (red-500) |
| Error Dark | `#b91c1c` | Darker error (red-700) |
| Error BG | `#FEF2F2` | Error backgrounds (red-50) |

**Usage Example**:
```css
.errorCard {
  background-color: #FEF2F2;
  border: 2px solid #dc2626;
  color: #dc2626;
}
```

#### Warning (Orange)

| Shade | Hex | Usage |
|-------|-----|-------|
| Warning Primary | `#f97316` | Warning text (orange-500) |
| Warning Dark | `#ea580c` | Warning dark (orange-600) |
| Warning Alt | `#ffa826` | Alternative warning |
| Warning BG | `#FFFBEB` | Warning backgrounds (amber-50) |

#### Info (Blue)

| Shade | Hex | Usage |
|-------|-----|-------|
| Info Primary | `#3b82f6` | Info text (blue-500) |
| Info Alt | `#6280ff` | Alternative blue |
| Info Brand | `#3351FF` | Brand blue |
| Info BG | `#EFF6FF` | Info backgrounds (blue-50) |

---

### Neutral/Gray Scale

| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| White | `#ffffff` | - | Backgrounds |
| Gray 50 | `#f8fafc` | `gray-50` | Light backgrounds |
| Gray 100 | `#f1f5f9` | `gray-100` | Hover states |
| Gray 200 | `#e2e8f0` | `gray-200` | Borders |
| Gray 300 | `#cbd5e0` | `gray-300` | Disabled states |
| Gray 400 | `#9ca3af` | `gray-400` | Placeholder text |
| Gray 500 | `#6b7280` | `gray-500` | Secondary text |
| Gray 600 | `#475569` | `gray-600` | Body text |
| Gray 700 | `#374151` | `gray-700` | Headers |
| Gray 800 | `#1f2937` | `gray-800` | Dark text |
| Gray 900 | `#111827` | `gray-900` | Primary black |
| Almost Black | `#131722` | - | Darkest text |
| Black | `#1a1a1a` | - | Pure black text |

---

### Chart/Data Visualization Colors

Used in TAT Dashboard, trend charts, and analytics:

```javascript
const chartColors = {
  'PO-GI': '#ff4080',  // Pink - Plant Order to Gate In
  'GI-TW': '#6280ff',  // Blue - Gate In to Tare Weight
  'TW-GW': '#57ca9e',  // Teal - Tare Weight to Gross Weight
  'GW-PG': '#ffa826',  // Orange - Gross Weight to Packing
  'PG-TC': '#cf6780',  // Rose - Packing to Tally Check
  'TC-IV': '#7361c6',  // Purple - Tally Check to Invoice
  'IV-EW': '#feea3f',  // Yellow - Invoice to E-Way Bill
  'EW-GO': '#26c5da',  // Cyan - E-Way Bill to Gate Out
  'GI-GO': '#e75d7a',  // Pink-red - Gate In to Gate Out
}
```

**Usage in ECharts**:
```javascript
const chartOptions = {
  series: [
    {
      name: 'PO-GI',
      type: 'line',
      lineStyle: { color: '#ff4080' },
      itemStyle: { color: '#ff4080' }
    },
    // ... more series
  ]
}
```

---

### Status Colors

Pre-defined status color combinations:

```javascript
const statusColors = {
  inTransit: {
    color: '#3B82F6',        // Blue
    bgColor: '#EFF6FF',      // Light blue background
    borderColor: '#BFDBFE'   // Blue border
  },
  delayed: {
    color: '#EF4444',        // Red
    bgColor: '#FEF2F2',      // Light red background
    borderColor: '#FECACA'   // Red border
  },
  delivered: {
    color: '#10B981',        // Green
    bgColor: '#ECFDF5',      // Light green background
    borderColor: '#A7F3D0'   // Green border
  },
  pending: {
    color: '#F59E0B',        // Amber
    bgColor: '#FFFBEB',      // Light amber background
    borderColor: '#FDE68A'   // Amber border
  }
}
```

**TypeScript Usage**:
```typescript
<MetricCard
  title="In Transit"
  value="124"
  iconColor={statusColors.inTransit.color}
  bgColor={statusColors.inTransit.bgColor}
  borderColor={statusColors.inTransit.borderColor}
/>
```

---

### Color Usage Guidelines

#### ✅ Do:

- Use CSS variables for brand colors: `var(--primary-color)`
- Use semantic colors for status indicators
- Maintain WCAG AA contrast ratios (4.5:1 for normal text)
- Use lighter background variants for hover states
- Keep color combinations consistent across similar components
- Use neutral grays for most UI elements

#### ❌ Don't:

- Use hardcoded hex values for brand colors
- Mix different shades randomly without purpose
- Use low-contrast color combinations
- Override semantic colors for different purposes (e.g., red for success)
- Create new color variables without documenting them

---

## Typography

### Font Families

**Primary Font**: Inter (sans-serif)
```css
html, body {
  font-family: "Inter", sans-serif;
}
```

**Secondary Font**: Plus Jakarta Sans (display font, loaded from Google Fonts)
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200..800&display=swap" rel="stylesheet" />
```

---

### Font Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| **Display** | 32px | 700 | 1.2 | Hero sections, page titles |
| **Heading 1** | 24px | 700 | 1.2 | Section headings |
| **Heading 2** | 20px | 600 | 1.3 | Card titles, subsections |
| **Heading 3** | 18px | 600 | 1.3 | Component titles |
| **Body Large** | 16px | 400 | 1.5 | Emphasized content |
| **Body** | 14px | 400 | 1.5 | Standard text (most common) |
| **Body Small** | 12px | 400 | 1.5 | Secondary text, labels |
| **Caption** | 10px | 400 | 1.4 | Helper text, timestamps |

---

### Typography Classes

```css
/* Page Title */
.pageTitle {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary);
  margin-bottom: 24px;
}

/* Section Heading */
.sectionHeading {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-primary);
  margin-bottom: 16px;
}

/* Card Title */
.cardTitle {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: #374151;
}

/* Metric Value (large numbers) */
.metricValue {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: #111827;
}

/* Body Text */
.bodyText {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-secondary);
}

/* Caption/Helper Text */
.caption {
  font-size: 10px;
  font-weight: 400;
  line-height: 1.4;
  color: #9ca3af;
}
```

---

### Font Weights

| Weight | Value | CSS | Usage |
|--------|-------|-----|-------|
| Regular | 400 | `font-weight: 400` | Body text, paragraphs |
| Medium | 500 | `font-weight: 500` | Labels, card titles |
| Semi-Bold | 600 | `font-weight: 600` | Section headers, emphasized text |
| Bold | 700 | `font-weight: 700` | Headings, metrics, important values |

**Example**:
```css
.metricLabel {
  font-size: 14px;
  font-weight: 500; /* Medium */
  color: #374151;
}

.metricValue {
  font-size: 24px;
  font-weight: 700; /* Bold */
  color: #111827;
}
```

---

## Spacing & Layout

### Spacing Scale

Based on 4px/8px system:

| Token | Value | Rem | Usage |
|-------|-------|-----|-------|
| `xs` | 4px | 0.25rem | Icon gaps, very tight spacing |
| `sm` | 8px | 0.5rem | Between related elements |
| `md` | 12px | 0.75rem | Standard component spacing |
| `lg` | 16px | 1rem | Between sections, card padding (small) |
| `xl` | 20px | 1.25rem | Card padding (default) |
| `2xl` | 24px | 1.5rem | Page padding, large gaps |
| `3xl` | 32px | 2rem | Section margins |
| `4xl` | 48px | 3rem | Page-level spacing |
| `5xl` | 64px | 4rem | Major section breaks |

---

### Spacing Examples

**Card Padding**:
```css
.card {
  padding: 20px;          /* xl - standard card padding */
  margin-bottom: 16px;    /* lg - gap between cards */
}

.cardCompact {
  padding: 16px;          /* lg - compact cards */
}

.cardLarge {
  padding: 24px;          /* 2xl - large cards */
}
```

**Component Spacing**:
```css
.cardHeader {
  display: flex;
  align-items: center;
  gap: 8px;               /* sm - icon to text */
  margin-bottom: 4px;     /* xs - header to content */
}

.cardContent {
  display: flex;
  flex-direction: column;
  gap: 12px;              /* md - between elements */
}
```

**Tailwind Spacing**:
```typescript
<div className="p-4 mb-6 gap-2">
  {/*
    p-4 = padding: 16px (lg)
    mb-6 = margin-bottom: 24px (2xl)
    gap-2 = gap: 8px (sm)
  */}
</div>
```

---

### Layout Grid

**Container Widths**:
```css
/* Full width container */
.container {
  max-width: 100vw;
  padding: 0 24px;
  overflow-x: hidden;
}

/* Content container */
.contentContainer {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Narrow container (forms, content) */
.narrowContainer {
  max-width: 960px;
  margin: 0 auto;
}
```

**Material-UI Grid System**:
```typescript
<Container maxWidth="xl">  {/* 1536px max width */}
  <Grid container spacing={3}>  {/* 24px gap */}
    <Grid item xs={12} sm={6} md={4} lg={3}>
      {/* Responsive 12-column grid */}
    </Grid>
  </Grid>
</Container>
```

**Breakpoints**:
```css
/* Mobile first */
.element {
  padding: 16px;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .element {
    padding: 24px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .element {
    padding: 32px;
  }
}

/* Large Desktop (1440px+) */
@media (min-width: 1440px) {
  .element {
    padding: 48px;
  }
}
```

---

## Elevation & Shadows

### Shadow Scale

```css
/* Level 0 - No shadow (flat) */
.flat {
  box-shadow: none;
}

/* Level 1 - Subtle (cards, inputs) */
.shadow-sm {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Level 2 - Normal (default cards) */
.shadow-md {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Level 3 - Elevated (cards on hover, dropdowns) */
.shadow-lg {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Level 4 - High elevation (modals, popovers) */
.shadow-xl {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05), 0 6px 6px rgba(0, 0, 0, 0.1);
}

/* Level 5 - Maximum (top-level modals) */
.shadow-2xl {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1), 0 8px 8px rgba(0, 0, 0, 0.15);
}
```

---

### Shadow Usage Examples

**Metric Card** (from actual codebase):
```css
.metricCard {
  background-color: #f9fafb;
  border-left: 4px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);  /* shadow-sm */
  padding: 23px;
}
```

**Card Hover Effect**:
```css
.card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);  /* shadow-md */
  transition: all 0.2s ease-in-out;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);  /* shadow-lg */
  transform: translateY(-2px);
}
```

**Modal/Dialog**:
```css
.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05), 0 6px 6px rgba(0, 0, 0, 0.1);
}
```

---

## Border Radius

### Radius Scale

```css
/* No radius - Sharp corners */
.rounded-none {
  border-radius: 0;
}

/* Small - Tags, small buttons */
.rounded-sm {
  border-radius: 4px;
}

/* Medium - Inputs, buttons (most common) */
.rounded-md {
  border-radius: 6px;
}

/* Large - Cards (most common) */
.rounded-lg {
  border-radius: 8px;
}

/* Extra Large - Large panels */
.rounded-xl {
  border-radius: 12px;
}

/* Pills - Badges, status pills */
.rounded-full {
  border-radius: 9999px;
}
```

---

### Radius Usage

```css
/* Standard Card */
.card {
  border-radius: 8px;  /* rounded-lg */
}

/* Button */
.button {
  border-radius: 6px;  /* rounded-md */
}

/* Input Field */
.input {
  border-radius: 6px;  /* rounded-md */
}

/* Badge/Chip */
.badge {
  border-radius: 16px;  /* Pill shape */
}

/* Avatar */
.avatar {
  border-radius: 9999px;  /* Full circle */
}
```

---

## Component Sizes

### Buttons

```css
/* Small Button */
.btn-sm {
  height: 32px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  gap: 4px;
}

/* Medium Button (default) */
.btn-md {
  height: 40px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  gap: 6px;
}

/* Large Button */
.btn-lg {
  height: 48px;
  padding: 0 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 6px;
  gap: 8px;
}
```

---

### Input Fields

```css
.input {
  height: 40px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 400;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: #ffffff;
  color: #1a1a1a;
}

.input::placeholder {
  color: #9ca3af;
}

.input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input:disabled {
  background-color: #f1f5f9;
  color: #9ca3af;
  cursor: not-allowed;
}
```

---

### Icon Sizes

```css
.icon-xs {
  width: 12px;
  height: 12px;
}

.icon-sm {
  width: 14px;
  height: 14px;
}

.icon-md {
  width: 20px;
  height: 20px;
}

.icon-lg {
  width: 24px;
  height: 24px;
}

.icon-xl {
  width: 32px;
  height: 32px;
}
```

**Usage in Components**:
```typescript
// From MetricCard.tsx
.icon {
  height: 20px;  /* icon-md */
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## Design Tokens

Complete reference for copy-paste:

```css
/* design-tokens.css */
:root {
  /* ============================================
     COLORS
     ============================================ */

  /* Brand Colors */
  --color-primary: #2a9d8f;
  --color-secondary: #e76f51;
  --color-tertiary: #264653;

  /* Semantic Colors */
  --color-success: #16a34a;
  --color-success-light: #22c55e;
  --color-success-bg: #ECFDF5;

  --color-error: #dc2626;
  --color-error-light: #ef4444;
  --color-error-bg: #FEF2F2;

  --color-warning: #f97316;
  --color-warning-dark: #ea580c;
  --color-warning-bg: #FFFBEB;

  --color-info: #3b82f6;
  --color-info-brand: #3351FF;
  --color-info-bg: #EFF6FF;

  /* Neutral Colors */
  --color-white: #ffffff;
  --color-gray-50: #f8fafc;
  --color-gray-100: #f1f5f9;
  --color-gray-200: #e2e8f0;
  --color-gray-300: #cbd5e0;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #475569;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-black: #1a1a1a;

  /* Text Colors */
  --text-primary: #1a1a1a;
  --text-secondary: #6c757d;
  --text-muted: #9ca3af;

  /* Background Colors */
  --bg-page: #f8f9fa;
  --bg-card: #ffffff;
  --bg-hover: #f1f5f9;

  /* Border Colors */
  --border-color: #e9ecef;
  --border-light: #e2e8f0;
  --border-dark: #cbd5e0;

  /* ============================================
     SPACING
     ============================================ */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 24px;
  --spacing-3xl: 32px;
  --spacing-4xl: 48px;
  --spacing-5xl: 64px;

  /* ============================================
     TYPOGRAPHY
     ============================================ */
  --font-family-primary: "Inter", sans-serif;
  --font-family-secondary: "Plus Jakarta Sans", sans-serif;

  --font-size-display: 32px;
  --font-size-h1: 24px;
  --font-size-h2: 20px;
  --font-size-h3: 18px;
  --font-size-body-lg: 16px;
  --font-size-body: 14px;
  --font-size-body-sm: 12px;
  --font-size-caption: 10px;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* ============================================
     BORDER RADIUS
     ============================================ */
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;

  /* ============================================
     SHADOWS
     ============================================ */
  --shadow-none: none;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 10px 20px rgba(0, 0, 0, 0.05), 0 6px 6px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 15px 30px rgba(0, 0, 0, 0.1), 0 8px 8px rgba(0, 0, 0, 0.15);

  /* ============================================
     Z-INDEX SCALE
     ============================================ */
  --z-base: 1;
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-modal-backdrop: 1200;
  --z-modal: 1300;
  --z-popover: 1400;
  --z-tooltip: 1500;

  /* ============================================
     TRANSITIONS
     ============================================ */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
}
```

---

## Visual Examples

### Metric Card

Real implementation from codebase:

```css
.metricCard {
  background-color: #f9fafb;
  border-left: 4px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 23px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 4px 0;
}
```

---

### Button Variants

```css
/* Primary Button */
.btn-primary {
  background: #3351FF;
  color: #ffffff;
  border: none;
  padding: 0 16px;
  height: 40px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: #2a42d9;
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #3351FF;
  border: 1px solid #3351FF;
  padding: 0 16px;
  height: 40px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #EFF6FF;
}
```

---

### Status Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.badge-success {
  background-color: #ECFDF5;
  color: #16a34a;
  border: 1px solid #A7F3D0;
}

.badge-error {
  background-color: #FEF2F2;
  color: #dc2626;
  border: 1px solid #FECACA;
}

.badge-warning {
  background-color: #FFFBEB;
  color: #f97316;
  border: 1px solid #FDE68A;
}

.badge-info {
  background-color: #EFF6FF;
  color: #3b82f6;
  border: 1px solid #BFDBFE;
}
```

---

## Usage Guidelines

### Consistency Checklist

When creating new components:

- [ ] Use CSS variables for brand colors
- [ ] Follow the spacing scale (4px/8px system)
- [ ] Use standard border radius values
- [ ] Apply appropriate shadow levels
- [ ] Match existing typography scale
- [ ] Ensure color contrast meets WCAG AA
- [ ] Use semantic colors for status indicators
- [ ] Test on mobile and desktop breakpoints

### Quick Reference

**Most Common Values**:
- **Card padding**: `20px` (xl)
- **Card border radius**: `8px` (lg)
- **Card shadow**: `0 1px 2px rgba(0, 0, 0, 0.05)` (sm)
- **Button height**: `40px` (md)
- **Button border radius**: `6px` (md)
- **Input height**: `40px`
- **Input border**: `1px solid #e2e8f0`
- **Icon size**: `20px` (md)
- **Gap between elements**: `8px` (sm) or `12px` (md)
- **Font size**: `14px` (body)
- **Font weight**: `500` (medium for labels), `700` (bold for values)

---

**For implementation examples and component templates, see [STYLE_GUIDE.md](./STYLE_GUIDE.md)**
