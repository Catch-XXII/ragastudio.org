# Mobile Hamburger Menu Overlap Fix — Implementation Plan

## Executive summary

- **Objective:** Fix the hamburger menu button overlapping page headings ("Chess", "The Giants of Russian Literature", etc.) on mobile viewports (<1024px)
- **Non-goals:** Redesign the overall navigation architecture, change desktop layout, add new navigation features
- **Constraints:** Must maintain existing responsive breakpoint strategy (Tailwind `lg:` at 1024px), preserve dark/light theme support, keep existing slide-out drawer behavior
- **Proposed approach:** Create a fixed mobile top header bar that contains the hamburger button + branding, replacing the floating button, and add content offset padding to clear it
- **Estimated time:** 0.5 days
- **Total phases:** 2
- **Total commits:** 3

## Current state (evidence)

### Layout architecture

| Component | File | Behavior |
|---|---|---|
| Desktop TopNav | `src/components/TopNav.astro:14` | `hidden lg:flex fixed top-0 h-12 z-50` — visible ≥1024px |
| Mobile hamburger button | `src/components/Sidebar.astro:51-65` | `lg:hidden fixed top-4 left-4 z-50` — visible <1024px |
| Mobile overlay | `src/components/Sidebar.astro:68` | `lg:hidden fixed inset-0 z-40 hidden` |
| Mobile slide-out drawer | `src/components/Sidebar.astro:71` | `lg:hidden fixed left-0 top-0 w-64 z-40 -translate-x-full` |
| Breadcrumbs | `src/components/Breadcrumbs.astro:14` | `hidden lg:block` — **invisible on mobile** |
| Content wrapper | `src/layouts/BaseLayout.astro:29` | `lg:pt-12` — **no mobile top padding** |
| Main content | `src/layouts/BaseLayout.astro:30` | `py-10 px-6 max-w-[680px] mx-auto` |

### Positioning & z-index stack

| Element | Position | Z-index | Top offset |
|---|---|---|---|
| TopNav (desktop) | `fixed top-0` | `z-50` | 0px |
| Hamburger button (mobile) | `fixed top-4 left-4` | `z-50` | 16px |
| Mobile overlay | `fixed inset-0` | `z-40` | 0px |
| Slide-out drawer | `fixed left-0 top-0` | `z-40` | 0px |

### The overlap problem

On mobile (<1024px):

1. **TopNav is hidden** (`hidden lg:flex`) — no visible header bar
2. **Breadcrumbs are hidden** (`hidden lg:block`) — no secondary nav
3. **Content wrapper has NO mobile top padding** — `lg:pt-12` only applies at ≥1024px
4. **Main content starts at 40px from viewport top** — `py-10` (2.5rem = 40px)
5. **Hamburger button occupies ~16px to ~52px vertically** — `top-4` (16px) + `p-2` (8px) + icon (20px) + `p-2` (8px)
6. **Hamburger button occupies ~16px to ~52px horizontally** — `left-4` (16px) + same width

**Vertical overlap zone:** Headings starting at 40px from top overlap with hamburger extending to 52px — a **12px overlap**.

**Horizontal overlap zone:** Heading text at 24px (`px-6`) overlaps with hamburger extending to ~52px — a **28px overlap**.

### Affected pages

| Page | Heading | Classes | Approx Y position |
|---|---|---|---|
| Category (`/categories/chess`) | `♟ Chess` | `text-4xl font-semibold` | ~40px |
| Post (`/posts/...`) | `The Giants of Russian Literature` | `text-5xl font-semibold mt-2` | ~60px (after date row) |
| Search (`/search`) | `Search Articles` | `text-4xl font-semibold` | ~40px |
| Index (`/`) | Tagline paragraph | `text-2xl` | ~40px |

## Requirements

### Functional
- Hamburger button must NOT overlap page headings or content on initial page load
- Hamburger button must remain accessible and clickable on all mobile viewports
- Slide-out drawer and overlay must continue to work as before
- Desktop TopNav layout must be unchanged

### Non-functional
- **Accessibility:** Proper ARIA landmarks, focusable button, clear visual hierarchy
- **Performance:** No JavaScript layout shifts; CSS-only spacing solution
- **Responsiveness:** Works on all mobile viewports (320px–1023px)

### Acceptance criteria
- On mobile viewports, no visual overlap between hamburger button and any page heading
- Hamburger button remains visible and functional
- Desktop layout is pixel-identical to current state
- Dark/light theme support preserved
- All existing pages render correctly

## Proposed design

### Approach: Mobile header bar + content offset

Replace the floating hamburger button with a **fixed mobile header bar** (mirroring the desktop TopNav pattern) that:
1. Contains the hamburger button on the left
2. Shows "ragastudio" branding in the center
3. Includes theme toggle on the right
4. Creates natural content clearance via a fixed height

This is preferred over just adding top padding because:
- It provides **consistent UX** between mobile and desktop (both have a top bar)
- It solves the overlap **permanently** (the bar creates its own space)
- It adds **mobile branding** (currently missing — no "ragastudio" text visible on mobile)
- It improves **accessibility** (proper `<nav>` landmark on mobile)

### Mobile header bar specs

- **Height:** `h-12` (48px) — same as desktop TopNav for consistency
- **Position:** `fixed top-0 left-0 right-0 z-50`
- **Visibility:** `lg:hidden` (mobile only)
- **Background:** Same as TopNav — `bg-[var(--color-bg)]/95 backdrop-blur`
- **Border:** `border-b border-[var(--color-border)]`
- **Contents:** hamburger button (left) | "ragastudio" logo (center) | theme toggle (right)

### Content offset change

In `BaseLayout.astro`, change the wrapper from:
```
<div class="lg:pt-12 flex flex-col min-h-screen">
```
to:
```
<div class="pt-12 flex flex-col min-h-screen">
```

This applies `pt-12` (48px) at ALL breakpoints — matching the fixed header height on both mobile (new mobile bar) and desktop (existing TopNav). Both bars are `h-12`.

### Visual before/after

**Before (mobile):**
```
┌──────────────────────┐
│ [☰]                  │  ← floating button at 16px,16px
│                      │
│  ♟ Chess             │  ← heading at 40px (OVERLAP!)
│  Description text... │
```

**After (mobile):**
```
┌──────────────────────┐
│ [☰]  ragastudio  [☀]│  ← fixed header bar, h-12 (48px)
├──────────────────────┤
│                      │  ← pt-12 clearance (48px)
│  ♟ Chess             │  ← heading at 88px (NO overlap)
│  Description text... │
```

### Failure modes & edge cases

1. **Very small viewports (320px):** Logo text may need truncation — use `truncate` class
2. **Landscape mobile:** Same behavior, header stays at top
3. **Theme toggle duplication:** Both TopNav and Sidebar currently have theme toggles; need to ensure mobile bar shares the same toggle logic
4. **Scroll behavior:** Fixed header stays at top (intentional, same as desktop)
5. **Slide-out z-index:** Drawer at z-40 must remain below mobile header at z-50

## Implementation plan (phased)

### Phase 1: Create mobile header bar and extract hamburger from floating position (estimated 0.25 days)

**Commits in this phase: 2**

#### Commit 1: Add mobile header bar to Sidebar.astro

- **Steps:**
  1. In `src/components/Sidebar.astro`, replace the floating hamburger button (lines 51-65) with a fixed mobile header bar containing:
     - The hamburger button (left-aligned, no longer `fixed` — now in flow within the bar)
     - "ragastudio" link/text (centered)
     - Theme toggle button (right-aligned)
  2. The mobile header bar itself gets the positioning: `lg:hidden fixed top-0 left-0 right-0 h-12 z-50 bg-[var(--color-bg)]/95 backdrop-blur border-b border-[var(--color-border)]`
  3. Use flexbox internally: `flex items-center justify-between px-4`
  4. The hamburger button becomes a child element (no longer needs `fixed top-4 left-4`)
  5. Add `aria-label="Mobile navigation"` to the header bar
  6. Add theme toggle with same `id="mobile-theme-toggle"` pattern (shared script)
  
- **Files:**
  - `src/components/Sidebar.astro` — restructure lines 50-65 (hamburger → mobile header bar)

- **New/modified lines:** ~25 lines modified

- **Specific code change (Sidebar.astro lines 50-65):**

  Replace:
  ```html
  <!-- Mobile hamburger button -->
  <button
    id="sidebar-toggle"
    aria-label="Open menu"
    class="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer"
  >
    ...SVGs...
  </button>
  ```

  With:
  ```html
  <!-- Mobile header bar -->
  <header class="lg:hidden fixed top-0 left-0 right-0 h-12 bg-[var(--color-bg)]/95 backdrop-blur border-b border-[var(--color-border)] z-50 flex items-center justify-between px-4" aria-label="Mobile navigation">
    <!-- Hamburger toggle (left) -->
    <button
      id="sidebar-toggle"
      aria-label="Open menu"
      class="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer"
    >
      ...SVGs (unchanged)...
    </button>

    <!-- Logo (center) -->
    <a href="/" class="text-lg font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors truncate">
      ragastudio
    </a>

    <!-- Theme toggle (right) -->
    <button
      id="mobile-theme-toggle"
      aria-label="Toggle theme"
      class="p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors text-lg"
    >
      <span id="mobile-theme-icon">🌙</span>
    </button>
  </header>
  ```

- **Script update (Sidebar.astro, after line 121):** Add mobile theme toggle event listener, or refactor to share logic with TopNav's theme toggle. Simplest: duplicate the 3-line toggle handler for `mobile-theme-toggle` and keep both icon IDs in sync.

- **Tests/validation:**
  - Build site: `pnpm build` succeeds
  - Visual check: mobile viewport shows header bar with hamburger/logo/theme toggle
  - Hamburger click still opens slide-out drawer
  - Theme toggle works on mobile
  - Desktop layout unchanged (header bar has `lg:hidden`)

- **Value delivered:** Hamburger is no longer floating over content; it lives in a proper header bar
- **Independently committable:** Yes
- **Dependencies:** None

#### Commit 2: Add content offset padding for mobile

- **Steps:**
  1. In `src/layouts/BaseLayout.astro`, change line 29 from `lg:pt-12` to `pt-12`
  2. This ensures the content wrapper clears the fixed header on BOTH mobile and desktop

- **Files:**
  - `src/layouts/BaseLayout.astro` — line 29 (one class change)

- **Specific code change (BaseLayout.astro line 29):**

  Replace:
  ```html
  <div class="lg:pt-12 flex flex-col min-h-screen">
  ```
  With:
  ```html
  <div class="pt-12 flex flex-col min-h-screen">
  ```

- **New/modified lines:** 1 line

- **Tests/validation:**
  - Build: `pnpm build` succeeds
  - Mobile: content starts below the header bar (no overlap)
  - Desktop: content still starts below TopNav (behavior unchanged since both headers are h-12)
  - Check category pages, post pages, index, search page on mobile viewport

- **Value delivered:** Content is offset correctly on all viewports
- **Independently committable:** Yes (though best paired with Commit 1)
- **Dependencies:** Commit 1

### Phase 2: Sync theme toggle state and polish (estimated 0.25 days)

**Commits in this phase: 1**

#### Commit 3: Unify theme toggle logic between desktop and mobile

- **Steps:**
  1. Refactor the theme toggle script so both `theme-toggle` (TopNav) and `mobile-theme-toggle` (Sidebar) use the same handler
  2. When either is clicked, update BOTH icons so they stay in sync
  3. Options:
     - **Option A (simplest):** In Sidebar.astro's `<script>`, query both toggle buttons and both icons, wire them together
     - **Option B (cleaner):** Extract theme toggle into a shared utility or use `document.querySelectorAll('[data-theme-toggle]')` pattern with a data attribute on both buttons
  4. Recommended: Option B — replace `id="theme-toggle"` and `id="mobile-theme-toggle"` with `data-theme-toggle` attribute on both, and have a single script that handles all theme toggle buttons

- **Files:**
  - `src/components/TopNav.astro` — change button from `id="theme-toggle"` to `data-theme-toggle`, update script
  - `src/components/Sidebar.astro` — add `data-theme-toggle` to mobile button, add/update script

- **New/modified lines:** ~20 lines

- **Tests/validation:**
  - Click mobile theme toggle → theme changes, both icons update
  - Click desktop theme toggle → theme changes, both icons update
  - Theme persists in localStorage across page loads
  - Both dark and light modes render correctly

- **Value delivered:** Consistent theme toggle behavior across breakpoints
- **Independently committable:** Yes
- **Dependencies:** Commit 1

## Summary

- **Total commits:** 3
- **Total new code:** ~50 lines
- **Total removed:** ~10 lines
- **Net change:** ~+40 lines
- **Total estimated time:** 0.5 days

### Benefits achieved

- [ ] No hamburger/content overlap on any mobile page
- [ ] Mobile users see branding ("ragastudio") — parity with desktop
- [ ] Proper mobile header bar with accessibility landmarks
- [ ] Theme toggle available on mobile without opening the drawer
- [ ] Desktop layout unchanged

### Backward compatibility

- [ ] Desktop TopNav untouched (only `id` → `data-theme-toggle` change)
- [ ] Slide-out drawer behavior preserved
- [ ] All page layouts render correctly
- [ ] Dark/light theme preserved
- [ ] No JavaScript behavior changes for menu open/close

## Progress tracking

- [ ] Phase 1 (0/2 commits)
  - [ ] Commit 1: Mobile header bar in Sidebar.astro
  - [ ] Commit 2: Content offset padding in BaseLayout.astro
- [ ] Phase 2 (0/1 commits)
  - [ ] Commit 3: Unified theme toggle logic

## Questions/decisions needed

1. **Logo text on mobile:** Should the mobile bar show "ragastudio" or an abbreviated version / icon? (Recommendation: full text with `truncate` for safety)
2. **Theme toggle placement:** The current mobile slide-out drawer doesn't have a theme toggle — only TopNav does. Should the drawer also keep a theme toggle, or is the header bar one sufficient? (Recommendation: header bar only, remove from drawer if one exists later)
3. **Header bar background:** Should it match TopNav exactly (`bg-[var(--color-bg)]/95 backdrop-blur`) or be fully opaque? (Recommendation: match TopNav for consistency)

## Testing strategy

- **Unit tests:** N/A (purely presentational change)
- **Visual testing:**
  - Mobile viewport (375px, 390px, 414px): verify no heading overlap on all page types
  - Desktop viewport (1024px+): verify no visual changes
  - Theme toggle: verify both dark↔light transitions on mobile and desktop
- **Accessibility checks:**
  - Tab through mobile header bar elements
  - Screen reader: verify `aria-label` on header and buttons
  - Color contrast in both themes

## Rollout & rollback

- **Rollout:** Direct deploy — CSS-only layout change + minor HTML restructure, low risk
- **Rollback:** Revert the 3 commits; floating hamburger button returns to previous state

## Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Theme toggle icon desync between mobile/desktop | Medium | Low | Commit 3 unifies the logic; test both toggles |
| Very narrow viewports (320px) may truncate logo | Low | Low | `truncate` class on logo text |
| Slide-out drawer z-index conflict with new header | Low | Medium | Both use existing z-index values (header z-50, drawer z-40) |
| Existing pages have custom top spacing assumptions | Low | Low | Only `pt-12` change; `py-10` on main is internal padding, unaffected |
