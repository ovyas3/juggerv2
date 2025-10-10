# Juggernaut Documentation

Welcome to the Juggernaut Next.js Dashboard documentation! This directory contains comprehensive guides for developing features in this project.

---

## 📚 Documentation Overview

### [Design System](./DESIGN_SYSTEM.md)
**Visual design standards and component styling**

Complete reference for:
- 🎨 **Color Palette** - Brand colors, semantic colors, status colors, chart colors
- ✍️ **Typography** - Font families, sizes, weights, line heights
- 📏 **Spacing & Layout** - Spacing scale, grid system, breakpoints
- 🌓 **Elevation & Shadows** - Shadow levels and usage
- 🔘 **Border Radius** - Radius scale and component standards
- 📐 **Component Sizes** - Buttons, inputs, icons
- 🎯 **Design Tokens** - Complete CSS variable reference

**Use this when**: You're styling components, choosing colors, setting spacing, or need visual design standards.

---

### [Style Guide](./STYLE_GUIDE.md)
**Development patterns and implementation examples**

Complete reference for:
- 🏗️ **Architecture** - Next.js App Router structure, data flow
- 🧩 **Component Guidelines** - Templates, patterns, best practices
- 🔄 **Data Fetching** - HTTP client usage, API patterns, error handling
- 🎨 **Styling** - CSS Modules, Tailwind, Material-UI patterns
- 📝 **TypeScript** - Type patterns, interfaces, prop typing
- 🛠️ **Helper Functions** - Utility organization and usage
- 🔁 **Common Patterns** - Snackbar, loading states, forms, modals
- ⚡ **Performance** - Dynamic imports, memoization, optimization
- 🔐 **Authentication** - Auth flows, role-based access
- 💡 **Examples** - Real-world component examples

**Use this when**: You're building features, writing components, or need code examples and patterns.

---

### [.cursorrules](../.cursorrules)
**AI-assisted development rules**

Quick reference for Cursor AI including:
- Project context and tech stack
- Directory structure conventions
- Next.js specific patterns
- Component templates
- Styling conventions
- Import organization
- Do's and Don'ts

**Use this when**: You're using Cursor AI or need a quick reference for project conventions.

---

## 🚀 Quick Start

### For New Developers

1. **Read the Architecture Overview** in [Style Guide](./STYLE_GUIDE.md#architecture-overview)
   - Understand the App Router structure
   - Learn the data flow patterns

2. **Review the Design System** in [Design System](./DESIGN_SYSTEM.md)
   - Familiarize yourself with color palette
   - Learn spacing and typography scales

3. **Study Component Templates** in [Style Guide](./STYLE_GUIDE.md#component-guidelines)
   - See how to structure components
   - Learn common patterns

4. **Browse Examples** in [Style Guide](./STYLE_GUIDE.md#examples)
   - See real-world implementations
   - Understand best practices

---

## 🎯 Common Tasks

### Creating a New Component

1. Check [Component Guidelines](./STYLE_GUIDE.md#component-guidelines) for templates
2. Use colors from [Color Palette](./DESIGN_SYSTEM.md#color-palette)
3. Apply spacing from [Spacing Scale](./DESIGN_SYSTEM.md#spacing--layout)
4. Follow [TypeScript patterns](./STYLE_GUIDE.md#typescript-guide)

### Styling a Component

1. Use CSS Modules (primary method) - see [Styling Guide](./STYLE_GUIDE.md#styling-guide)
2. Reference [Design Tokens](./DESIGN_SYSTEM.md#design-tokens) for CSS variables
3. Apply [Shadows](./DESIGN_SYSTEM.md#elevation--shadows) and [Border Radius](./DESIGN_SYSTEM.md#border-radius)
4. Ensure responsive design with [Layout Grid](./DESIGN_SYSTEM.md#layout-grid)

### Fetching Data

1. Follow [Data Fetching Patterns](./STYLE_GUIDE.md#data-fetching-patterns)
2. Use `httpsGet`, `httpsPost`, or `httpsPut` from `@/utils/Communication`
3. Handle errors with [Error Handling](./STYLE_GUIDE.md#error-handling) patterns
4. Show loading states - see [Loading States](./STYLE_GUIDE.md#loading-states)

### Adding Status Indicators

1. Use [Status Colors](./DESIGN_SYSTEM.md#status-colors) from design system
2. Apply semantic colors for consistency
3. Follow [Color Usage Guidelines](./DESIGN_SYSTEM.md#color-usage-guidelines)

---

## 📖 Documentation Structure

```
docs/
├── README.md           # This file - documentation overview
├── DESIGN_SYSTEM.md    # Visual design standards
└── STYLE_GUIDE.md      # Development patterns and examples
```

---

## 🎨 Design Principles

### Consistency
- Use CSS variables for all brand colors
- Follow the 4px/8px spacing system
- Apply standard shadow levels
- Use semantic colors for status indicators

### Accessibility
- Maintain WCAG AA contrast ratios (4.5:1)
- Use semantic HTML elements
- Include ARIA labels where needed
- Test with keyboard navigation

### Performance
- Use dynamic imports for heavy components
- Memoize expensive calculations
- Optimize images with next/image
- Code-split by route

### Maintainability
- Follow TypeScript strict mode
- Document utility functions with JSDoc
- Use descriptive variable names
- Keep components focused and small

---

## 🔍 Finding What You Need

| I want to... | Document | Section |
|--------------|----------|---------|
| Choose a color | Design System | [Color Palette](./DESIGN_SYSTEM.md#color-palette) |
| Set font size | Design System | [Typography](./DESIGN_SYSTEM.md#typography) |
| Add spacing | Design System | [Spacing Scale](./DESIGN_SYSTEM.md#spacing--layout) |
| Create a component | Style Guide | [Component Guidelines](./STYLE_GUIDE.md#component-guidelines) |
| Fetch API data | Style Guide | [Data Fetching](./STYLE_GUIDE.md#data-fetching-patterns) |
| Handle forms | Style Guide | [Form Example](./STYLE_GUIDE.md#form-with-validation-example) |
| Show notifications | Style Guide | [Snackbar Pattern](./STYLE_GUIDE.md#snackbar-notifications) |
| Authenticate users | Style Guide | [Authentication](./STYLE_GUIDE.md#authentication--authorization) |
| Copy design tokens | Design System | [Design Tokens](./DESIGN_SYSTEM.md#design-tokens) |
| See real examples | Style Guide | [Examples](./STYLE_GUIDE.md#examples) |

---

## 🤝 Contributing

When adding new patterns or updating documentation:

1. **Update Design System** for any new colors, spacing, or visual standards
2. **Update Style Guide** for new code patterns or examples
3. **Update .cursorrules** if project conventions change
4. Keep examples based on actual codebase implementations
5. Maintain consistency with existing documentation

---

## 💡 Tips

- **Use @/ path alias** for all imports from `src/`
- **All components use "use client"** directive (no Server Components)
- **CSS Modules are primary** styling method
- **Material-UI is primary** UI library
- **TypeScript strict mode** is enabled
- **dayjs is preferred** for new date handling code

---

## 📞 Need Help?

If you can't find what you're looking for:

1. Search the [Style Guide](./STYLE_GUIDE.md) for patterns
2. Check [Design System](./DESIGN_SYSTEM.md) for visual standards
3. Review existing components in `src/components/`
4. Ask the team for clarification

---

**Last Updated**: 2025-10-10
