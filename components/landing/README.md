# Landing Page Components

Reusable, accessible, and animated landing page components built with Tailwind CSS, Framer Motion, and Solana brand colors.

## Components

### FeatureCard

A feature card with icon, title, description, and hover animations.

**Props:**
- `icon` (LucideIcon): Icon component from lucide-react
- `title` (string): Feature title
- `description` (string): Feature description
- `gradient` (string): CSS gradient for the icon background
- `index` (number, optional): Stagger delay multiplier for animations

**Features:**
- Hover lift effect (y: -8px)
- Icon rotation on hover (360 degrees)
- Radial gradient glow on hover
- Respects `prefers-reduced-motion`
- Fully accessible with semantic HTML

**Example:**
```tsx
<FeatureCard
  icon={Activity}
  title="Autonomous Monitoring"
  description="24/7 monitoring with real-time oracles"
  gradient={colors.gradients.primary}
  index={0}
/>
```

---

### HowItWorksStep

A timeline step component for "How It Works" sections with staggered animations.

**Props:**
- `step` (number): Step number (1-4)
- `icon` (LucideIcon): Step icon
- `title` (string): Step title
- `description` (string): Step description
- `gradient` (string): CSS gradient for the step badge
- `isLast` (boolean, optional): Hide connecting line for last step

**Features:**
- Staggered slide-in animations (delay based on step number)
- Animated step number badge with pulse effect
- Connecting line between steps (animated)
- Hover scale effect on badge
- Responsive typography

**Example:**
```tsx
<HowItWorksStep
  step={1}
  icon={Rocket}
  title="Create Your Sentinel"
  description="Configure in under 2 minutes"
  gradient={colors.gradients.primary}
/>
```

---

### ComparisonTable

A feature comparison table with parallax background and grid overlay.

**Features:**
- Parallax scrolling background orbs
- Subtle grid overlay (respects `prefers-reduced-motion`)
- Responsive layout (mobile shows Sentinel column only)
- Checkmarks/X icons for boolean features
- Text values for numeric/string comparisons
- Smooth scroll-triggered animations
- Semantic table structure for accessibility

**Example:**
```tsx
<ComparisonTable />
```

**Data:**
The comparison data is defined internally but can be customized by editing the `comparisonData` array:
```tsx
const comparisonData: ComparisonRow[] = [
  { feature: 'Setup Time', sentinel: '< 2 minutes', manual: '30+ minutes' },
  { feature: '24/7 Monitoring', sentinel: true, manual: false },
  // ...
];
```

---

### TechStackGrid

A grid showcasing Solana-native technologies with emoji icons and hover effects.

**Features:**
- 3-column responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- Hover lift and scale effects
- Icon scale and rotation on hover
- Radial gradient glow on hover
- Border glow effect
- Emoji icons for visual appeal

**Tech Stack:**
- Solana ◎ - High-performance blockchain
- SPL Tokens 💰 - USDC & CASH payments
- CoinMarketCap 📊 - Real-time price feeds
- DeepSeek AI 🧠 - Pattern analysis
- HTTP 402 ⚡ - Micropayment protocol
- Discord 💬 - Instant webhook alerts

**Example:**
```tsx
<TechStackGrid />
```

---

### CTABlock

An enhanced Call-to-Action block with gradient mesh background, floating particles, and dual buttons.

**Features:**
- Animated gradient mesh background (3 floating orbs)
- 20 floating particles (conditionally rendered based on `prefers-reduced-motion`)
- Glassmorphism effect (backdrop blur)
- Dual CTA buttons (primary + secondary)
- Sparkle icon with rotate animation
- Trust badge footer
- Fully responsive

**Example:**
```tsx
<CTABlock />
```

**CTA Buttons:**
- Primary: "Get Started Free" → `/auth/signup`
- Secondary: "View Dashboard" → `/dashboard`

---

## Accessibility Features

All components implement best practices for accessibility:

1. **Semantic HTML**: Proper heading hierarchy (`<h2>`, `<h3>`)
2. **ARIA Labels**: Icons marked with `aria-hidden="true"`, interactive elements have `aria-label`
3. **Focus States**: All interactive elements have visible focus states
4. **Keyboard Navigation**: All buttons and links are keyboard accessible
5. **Motion Preferences**: Respects `prefers-reduced-motion` CSS media query

---

## Animation System

### Reduced Motion Support

The components use a custom hook `useReducedMotion()` to detect the user's motion preferences:

```tsx
const prefersReducedMotion = useReducedMotion();

<motion.div
  whileHover={prefersReducedMotion ? {} : { y: -8 }}
/>
```

### Animation Types

1. **Scroll-triggered**: Uses `whileInView` with `viewport={{ once: true }}`
2. **Hover effects**: Lift, scale, rotate
3. **Staggered animations**: Delayed entry based on index
4. **Background animations**: Floating orbs, particles, parallax

---

## Responsive Design

All components are fully responsive with breakpoints:

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (sm-lg)
- **Desktop**: > 1024px (lg+)

Key responsive features:
- Grid columns adjust (1 → 2 → 3)
- Font sizes scale with viewport
- Padding/spacing reduces on mobile
- Comparison table hides "Manual" column on mobile
- Touch-friendly tap targets (minimum 44px)

---

## Usage in app/page.tsx

The landing page sections are arranged as follows:

1. **Hero** (existing)
2. **Features** - Six-feature grid using `FeatureCard`
3. **Stats** (existing, updated cost to $0.0003)
4. **How It Works** - Four-step timeline using `HowItWorksStep`
5. **Comparison** - Cost comparison using `ComparisonTable`
6. **Tech Stack** - Solana tools using `TechStackGrid`
7. **Roadmap** (existing)
8. **CTA** - Final call-to-action using `CTABlock`
9. **Footer** (existing)

---

## Design Tokens

Components use centralized design tokens from `@/lib/design-tokens`:

- `colors.gradients` - Gradient definitions
- `colors.background` - Dark theme backgrounds
- `colors.border` - Border colors
- `shadows` - Elevation and glow effects

---

## Performance Optimization

1. **Lazy Loading**: Heavy animations only render when in viewport
2. **Once Animations**: Most animations run only once (viewport: { once: true })
3. **Conditional Rendering**: Particles only render if motion is not reduced
4. **Optimized Re-renders**: Uses Framer Motion's optimized animation engine

---

## Browser Support

- Modern browsers with ES6+ support
- Safari 14+, Chrome 90+, Firefox 88+, Edge 90+
- Graceful degradation for older browsers (animations may not work)

---

## Contributing

When adding new landing components:

1. Follow existing patterns (props, animations, accessibility)
2. Add documentation to this README
3. Test on mobile, tablet, and desktop
4. Verify reduced motion support
5. Ensure semantic HTML and ARIA labels
