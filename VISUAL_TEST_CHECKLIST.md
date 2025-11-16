# Visual Test Checklist - 3D Hero Section

## Pre-flight Checks
- [x] Dependencies installed (`three`, `@react-three/fiber`, `@react-three/drei`)
- [x] Build completes successfully
- [x] Lint passes with no new errors
- [x] Package.json and package-lock.json updated

## Desktop Testing (1920x1080+)

### Hero Section Layout
- [ ] Split layout displays correctly (60/40 ratio)
- [ ] Left content takes 3 columns, right takes 2 columns
- [ ] Gradient background visible (black → dark navy → black)
- [ ] Grid overlay visible with green tint
- [ ] Animated gradient orbs floating in background

### Left Content
- [ ] Headline displays with proper line breaks
  - [ ] "Autonomous" in purple-green gradient
  - [ ] "AI Agents on" in white
  - [ ] "Solana" in green-purple gradient
- [ ] Subheadline text readable and properly spaced
- [ ] Two CTA buttons side by side
  - [ ] "Deploy Sentinel" button (purple-green gradient, rocket icon)
  - [ ] "Watch Demo" button (outlined, play icon)
- [ ] Live stats row shows three stats
  - [ ] Numbers animate on page load
  - [ ] Gradient colors on numbers
  - [ ] Labels beneath each stat

### Right Content (3D Scene)
- [ ] Loading skeleton appears first (gradient background, "Loading 3D Scene..." text)
- [ ] 3D scene loads after ~200-500ms
- [ ] AI agent visible (purple wireframe icosahedron, green sphere inside)
- [ ] Agent rotates smoothly
- [ ] Particles visible around the agent
- [ ] Particles rotate slowly
- [ ] 20 shimmering particles overlay the scene
- [ ] Mouse movement creates parallax effect
- [ ] Scene is contained in rounded container

### Header
- [ ] "Sentinel" logo text in Solana gradient (purple → green)
- [ ] Glassmorphism effect (backdrop blur, semi-transparent)
- [ ] "Sign In" button visible and styled
- [ ] "Sign Up" button with gradient background
- [ ] Header sticks to top on scroll

### Interactions
- [ ] "Deploy Sentinel" button glows on hover
- [ ] "Watch Demo" button shows gradient on hover
- [ ] Both buttons scale slightly on hover (1.05)
- [ ] Both buttons shrink on click (0.95)
- [ ] Mouse movement affects 3D scene parallax
- [ ] Scroll indicator visible at bottom (down arrow)

## Tablet Testing (768-1024px)

### Layout
- [ ] Split layout adjusts to 50/50
- [ ] Left and right content balanced
- [ ] Stats row remains readable
- [ ] CTA buttons stay side by side
- [ ] 3D scene height: 500px

### Behavior
- [ ] All desktop features work
- [ ] Touch gestures don't break parallax
- [ ] Performance remains smooth

## Mobile Testing (< 768px)

### Layout
- [ ] Layout stacks vertically (text on top, 3D below)
- [ ] Headline centered
- [ ] Stats row adjusts (3 columns, smaller text)
- [ ] CTA buttons stack or wrap
- [ ] 3D scene height: 400px
- [ ] Particle count reduced to 300

### Behavior
- [ ] Text is readable without zooming
- [ ] Buttons are easily tappable (44x44px minimum)
- [ ] 3D scene performs smoothly (30 FPS target)
- [ ] No horizontal scrolling
- [ ] Touch doesn't trigger unintended interactions

## Performance Testing

### Initial Load
- [ ] Skeleton/loading state appears immediately
- [ ] 3D scene loads within 1 second on good connection
- [ ] No layout shift (CLS < 0.1)
- [ ] LCP < 2.5 seconds

### Runtime Performance
- [ ] Desktop: 60 FPS maintained
- [ ] Mobile: 30+ FPS maintained
- [ ] No memory leaks after 5 minutes
- [ ] CPU usage reasonable (< 50% on mid-range devices)

### Optimization Features
- [ ] 3D scene pauses when scrolled out of view
- [ ] Frame loop switches to 'demand' when off-screen
- [ ] Particle count reduced on mobile
- [ ] Device pixel ratio adapts (1-2)

## Accessibility Testing

### Reduced Motion
- [ ] Enable "Reduce motion" in OS settings
- [ ] All 3D animations stop
- [ ] Mouse parallax disabled
- [ ] Particle count reduced to 300
- [ ] Frame loop switches to 'demand'
- [ ] Content remains accessible

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus indicators visible
- [ ] Skip links work (if present)
- [ ] No focus traps
- [ ] 3D scene doesn't interfere with keyboard nav

### Screen Reader
- [ ] Page structure makes sense
- [ ] Headings in correct order
- [ ] Buttons have proper labels
- [ ] Images have alt text (or are decorative)
- [ ] 3D scene doesn't cause confusion

## Cross-Browser Testing

### Chrome/Edge
- [ ] 3D scene renders correctly
- [ ] Animations smooth
- [ ] Gradient text displays properly
- [ ] Backdrop filter works

### Firefox
- [ ] 3D scene renders correctly
- [ ] Animations smooth
- [ ] Gradient text displays properly
- [ ] Backdrop filter works

### Safari (macOS/iOS)
- [ ] 3D scene renders correctly
- [ ] Animations smooth
- [ ] Gradient text displays properly
- [ ] Backdrop filter works
- [ ] Performance acceptable on iOS devices

## Error Handling

### WebGL Not Supported
- [ ] Fallback content displays
- [ ] Page doesn't break
- [ ] Error logged to console (if debugging)

### Slow Connection
- [ ] Loading skeleton displays appropriately
- [ ] Scene eventually loads or shows error
- [ ] Page remains usable during load

### JavaScript Disabled
- [ ] Page degrades gracefully
- [ ] Core content still accessible
- [ ] No critical errors

## Visual Regression

### Compare to Original
- [ ] All existing links still work
- [ ] Other sections unchanged
- [ ] Footer intact
- [ ] Features section below hero works
- [ ] Stats section works
- [ ] How It Works section works
- [ ] Comparison table works
- [ ] Tech stack grid works
- [ ] CTA block works

## Network Conditions

### Fast 3G
- [ ] Page loads acceptably
- [ ] 3D scene eventually appears
- [ ] Skeleton state appropriate

### Slow 3G
- [ ] Page loads acceptably
- [ ] Loading indicator helpful
- [ ] Core content accessible

### Offline
- [ ] Service worker handles (if implemented)
- [ ] Error message clear
- [ ] Page doesn't break

## Sign-off

**Tested by:** _________________
**Date:** _________________
**Environment:** _________________
**Issues Found:** _________________
**Overall Status:** [ ] Pass / [ ] Fail / [ ] Pass with Issues

## Notes

Add any additional observations, screenshots, or videos here:
