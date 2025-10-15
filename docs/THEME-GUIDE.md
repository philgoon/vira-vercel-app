# ViRA Professional Blue Theme Guide

**Theme**: Professional Blue  
**Version**: 1.0  
**Status**: Active

---

## Overview

The Professional Blue theme provides a consistent, professional design system using your existing brand colors (#1A5276, #6B8F71). It's built on shadcn/ui's theming system with CSS variables, making it easy to maintain and extend.

---

## Color Palette

### Primary Colors

**Primary (Deep Blue)** - `#1A5276`
- Use for: Main CTAs, headers, primary actions
- Tailwind: `bg-primary`, `text-primary`, `border-primary`
- Variable: `hsl(var(--primary))`

**Secondary (Sage Green)** - `#6B8F71`
- Use for: Secondary actions, accents, success states
- Tailwind: `bg-secondary`, `text-secondary`
- Variable: `hsl(var(--secondary))`

**Accent (Bright Blue)** - `#0080FF`
- Use for: Highlights, interactive elements
- Tailwind: `bg-accent`, `text-accent`
- Variable: `hsl(var(--accent))`

### Status Colors

**Success** - Green `#059669`
- Use for: Success messages, completed states
- Tailwind: `bg-success`, `text-success`

**Warning** - Orange `#F59E0B`
- Use for: Warnings, pending states
- Tailwind: `bg-warning`, `text-warning`

**Destructive/Error** - Red `#DC2626`
- Use for: Errors, delete actions
- Tailwind: `bg-destructive`, `text-destructive`

### Neutral Colors

**Background** - White `#FFFFFF`
**Card** - White `#FFFFFF`  
**Border** - Light Gray `#E5E7EB`  
**Muted** - Light Gray `#F3F4F6`

---

## Usage Examples

### Buttons

```tsx
// Primary Button
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click Me
</button>

// Secondary Button
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
  Secondary Action
</button>

// Outline Button
<button className="border border-primary text-primary hover:bg-primary/10">
  Outline
</button>
```

### Cards

```tsx
<div className="bg-card text-card-foreground border rounded-lg p-6">
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="text-muted-foreground">Card description</p>
</div>
```

### Badges/Status

```tsx
// Success Badge
<span className="bg-success/20 text-success px-3 py-1 rounded-full text-sm">
  ✓ Complete
</span>

// Warning Badge
<span className="bg-warning/20 text-warning px-3 py-1 rounded-full text-sm">
  ⚠ Pending
</span>

// Error Badge
<span className="bg-destructive/20 text-destructive px-3 py-1 rounded-full text-sm">
  ✗ Failed
</span>
```

### Form Inputs

```tsx
<input
  type="text"
  className="w-full px-4 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-primary"
  placeholder="Enter text..."
/>
```

### Text Hierarchy

```tsx
// Primary Text
<h1 className="text-foreground font-bold text-2xl">Heading</h1>

// Muted Text
<p className="text-muted-foreground">Secondary information</p>

// Link
<a href="#" className="text-primary hover:underline">Learn more</a>
```

---

## Chart Colors

For analytics dashboards, use the predefined chart colors:

```tsx
const chartData = [
  { name: 'Series 1', value: 100, fill: 'hsl(var(--chart-1))' }, // Blue
  { name: 'Series 2', value: 80, fill: 'hsl(var(--chart-2))' },  // Green
  { name: 'Series 3', value: 60, fill: 'hsl(var(--chart-3))' },  // Orange
  { name: 'Series 4', value: 40, fill: 'hsl(var(--chart-4))' },  // Purple
  { name: 'Series 5', value: 20, fill: 'hsl(var(--chart-5))' },  // Teal
];
```

---

## Component Patterns

### Stats Card

```tsx
<div className="bg-card border rounded-lg p-6 shadow-sm">
  <div className="flex items-center gap-2 mb-2">
    <Users className="w-4 h-4 text-primary" />
    <span className="text-sm text-muted-foreground">Total Users</span>
  </div>
  <div className="text-3xl font-bold text-foreground">1,234</div>
  <div className="text-sm text-success mt-1">
    ↑ 12% from last month
  </div>
</div>
```

### Alert/Notification

```tsx
<div className="bg-primary/10 border-l-4 border-primary rounded-r-lg p-4">
  <h4 className="font-semibold text-foreground">Important Notice</h4>
  <p className="text-sm text-muted-foreground mt-1">
    Your attention is required for this item.
  </p>
</div>
```

### List Item with Action

```tsx
<div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="font-semibold text-foreground">Item Title</h3>
      <p className="text-sm text-muted-foreground">Description</p>
    </div>
    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
      Action
    </button>
  </div>
</div>
```

---

## Migration from Inline Styles

### Before (Inline)
```tsx
<button style={{ backgroundColor: '#1A5276', color: '#FFFFFF' }}>
  Click
</button>
```

### After (Themed)
```tsx
<button className="bg-primary text-primary-foreground">
  Click
</button>
```

### Benefits
- ✅ Single source of truth for colors
- ✅ Easy theme switching
- ✅ Better maintainability
- ✅ Consistent across app
- ✅ Reduced code

---

## Customization

To change colors, update `src/app/globals.css`:

```css
:root {
  --primary: 203 89% 29%;  /* Change this HSL value */
  --secondary: 155 26% 49%;
  /* etc... */
}
```

HSL values can be generated from hex:
- Use: https://www.rapidtables.com/convert/color/hex-to-hsl.html
- Format: `hue saturation% lightness%` (no commas, no "hsl()")

---

## Best Practices

### DO ✅
- Use theme colors: `bg-primary`, `text-secondary`
- Use semantic colors: `bg-success`, `bg-destructive`
- Use opacity modifiers: `bg-primary/10` for 10% opacity
- Use foreground pairs: `bg-primary text-primary-foreground`

### DON'T ❌
- Hardcode hex colors: `bg-[#1A5276]`
- Mix inline styles with Tailwind
- Use arbitrary colors without theme variables
- Ignore foreground color pairings

---

## Dark Mode (Future)

The theme is dark mode ready. To enable:

1. Add dark mode variants to `globals.css`:
```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 0 0% 98%;
  --primary: 217 91% 60%;
  /* ... dark variants */
}
```

2. Add Tailwind dark mode support:
```tsx
<button className="bg-primary dark:bg-primary-dark">
  Button
</button>
```

---

## Support

For questions or theme customization requests, refer to:
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Theming Guide](https://ui.shadcn.com/docs/theming)
- Project docs: `/docs`
