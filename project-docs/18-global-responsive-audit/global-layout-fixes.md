# Asteria — Global Responsive Layout Fixes & Architectural Implementations

**Document:** Engineering Implementation Log  
**Phase:** Task 3 — Global Responsive Audit  
**Author:** Senior Responsive Web Architect & UI/UX Engineer  
**Date:** November 2026  

---

## 1. Architectural Issues Identified During Audit

Prior to this global audit, the core gameplay screens had been optimized for mobile card flips, but several site-wide layout and navigational components contained subtle responsive defects:

1. **Mobile Header Navigational Deficit:**
   - Desktop navigation links (`/games`, `/blog`, `/questions`, `/custom`) were hidden with `hidden lg:flex`.
   - On screens `< 1024px`, mobile users had no header menu or drawer to reach the Question Library, Party Guides, About, Contact, or Admin pages without scrolling down to the footer.
   - Header action items crowded the logo on 320px screens when all buttons were shown.

2. **Footer Content Obscured by Fixed Mobile Dock:**
   - `<MobileDock />` is fixed at the bottom with `h-16` (64px) + `env(safe-area-inset-bottom)`.
   - `<AppFooter />` had only `pb-16`. When scrolled to the bottom, the copyright line and legal links sat directly underneath the fixed mobile navigation bar.

3. **Active State Failures on Localized URLs:**
   - In both `AppHeader.tsx` and `MobileDock.tsx`, tab active states were checked using `pathname === link.href || pathname.startsWith(link.href)`.
   - On localized routes (e.g. `/es/games`, `/hi/games`), `pathname` began with `/es/` or `/hi/`, causing the active highlight ring and glow to fail completely.

4. **Modal Dialog Stacking Context & Max Height Clipping:**
   - `AgeGateModal.tsx` did not use a React Portal, risking stacking context deformation if parent elements used CSS transforms.
   - Modals lacked `max-h-[calc(100dvh-2rem)] overflow-y-auto`, risking clipping affirmative buttons outside the viewport in landscape orientation.
   - Background body scrolling was not locked when modals opened.

5. **RTL Directional Arrows in Breadcrumbs:**
   - Breadcrumb navigation (`Breadcrumbs.tsx`) used static `ChevronRight` icons without RTL awareness, pointing rightwards even in Arabic (`dir="rtl"`).

6. **Admin Dashboard Metric Card Compression:**
   - On 320px screens, the 8-language metrics grid (`grid-cols-2`) experienced tight text bounds that could wrap numbers awkwardly.

---

## 2. Comprehensive Code Fixes Implemented

### Fix 1: Mobile Header & Slide-Out Navigation Drawer
**File:** [`components/layout/AppHeader.tsx`](file:///Users/vaibhavborkar/truth&dare/components/layout/AppHeader.tsx)

- **Added Portaled Mobile Navigation Drawer:** Added responsive hamburger/close button (`Menu` / `X` from `lucide-react`) on screens `< lg`.
- **Drawer Contents:** 17 accessible links grouped into Party Game Engines, Studio & Vault, and Platform & Legal.
- **Body Scroll Locking:** Locks `document.body.style.overflow = 'hidden'` while the drawer is open.
- **Escape Key Listener:** Closes drawer when Escape is pressed.
- **Pathname Normalization:** Added `normalizedPathname` to strip locale prefixes (`/es/games` -> `/games`) so desktop navigation links highlight accurately.
- **Responsive Header Action Sizing:** Reduced button footprint on mobile (`w-9 h-9 sm:w-10 sm:h-10`) to provide 64px margin on 320px screens.

```tsx
// Key implementation excerpt from AppHeader.tsx
const normalizedPathname = useMemo(() => {
  const raw = pathname || '/';
  const segments = raw.split('/').filter(Boolean);
  if (segments.length > 0 && ['en', 'hi', 'es', 'pt', 'fr', 'id', 'ar', 'de'].includes(segments[0])) {
    const subpath = '/' + segments.slice(1).join('/');
    return subpath === '/' ? '/' : subpath;
  }
  return raw;
}, [pathname]);

// Drawer Portal
{mounted && isMobileMenuOpen &&
  createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
      className="lg:hidden fixed inset-0 z-50 flex flex-col bg-[#07070F]/95 backdrop-blur-2xl animate-in fade-in duration-200"
    >
      {/* Scrollable links container with iOS safe-area bottom clearance */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-[calc(6rem+env(safe-area-inset-bottom,0px))]">
        ...
      </div>
    </div>,
    document.body
  )}
```

---

### Fix 2: Mobile Dock i18n Path Normalization
**File:** [`components/layout/MobileDock.tsx`](file:///Users/vaibhavborkar/truth&dare/components/layout/MobileDock.tsx)

- **Problem:** Tapping tabs when browsing in Spanish (`/es`), Hindi (`/hi`), German (`/de`), etc., did not activate the neon glow or purple background pill.
- **Solution:** Integrated `normalizedPathname` using `React.useMemo`.

```tsx
// Normalized pathname logic
const normalizedPathname = React.useMemo(() => {
  const raw = pathname || '/';
  const segments = raw.split('/').filter(Boolean);
  if (segments.length > 0 && ['en', 'hi', 'es', 'pt', 'fr', 'id', 'ar', 'de'].includes(segments[0])) {
    const subpath = '/' + segments.slice(1).join('/');
    return subpath === '/' ? '/' : subpath;
  }
  return raw;
}, [pathname]);

const isActive = normalizedPathname === item.href || (item.href !== '/' && normalizedPathname.startsWith(item.href));
```

---

### Fix 3: Footer Safe-Area Clearance Buffer
**File:** [`components/layout/AppFooter.tsx`](file:///Users/vaibhavborkar/truth&dare/components/layout/AppFooter.tsx)

- **Problem:** `<AppFooter />` bottom padding was `pb-16` (64px), which placed copyright and language selector links directly beneath the 64px + safe-area mobile dock.
- **Solution:** Replaced with `pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-16`, guaranteeing 88px of clearance plus the device-specific safe-area bottom inset.

```tsx
// AppFooter.tsx
<footer className="w-full bg-canvas-deep border-t border-white/10 pt-12 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-16 px-4 md:px-8 text-slate-400 text-sm">
```

---

### Fix 4: AgeGateModal React 19 Portal & Scroll Protection
**File:** [`components/game/AgeGateModal.tsx`](file:///Users/vaibhavborkar/truth&dare/components/game/AgeGateModal.tsx)

- **Problem:** Rendered directly within parent component DOM tree without portal; lacked `max-h` containment for landscape viewports; did not lock body scroll.
- **Solution:** Upgraded to `createPortal(..., document.body)`, added `max-h-[calc(100dvh-2rem)] overflow-y-auto custom-scrollbar`, body scroll lock, and touch target optimization (`min-h-[48px]`).

```tsx
// AgeGateModal.tsx
export function AgeGateModal({ isOpen, onConfirm, onCancel }: AgeGateModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#07070F]/90 backdrop-blur-md pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-all animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md p-5 sm:p-6 md:p-8 rounded-3xl bg-surface-elevated border border-dare-400/30 shadow-elevation-3 text-center space-y-5 max-h-[calc(100dvh-2rem)] overflow-y-auto custom-scrollbar">
        ...
      </div>
    </div>,
    document.body
  );
}
```

---

### Fix 5: Summary Leaderboard & Spicy 18+ URL Trigger
**File:** [`components/games/TruthOrDareGameClient.tsx`](file:///Users/vaibhavborkar/truth&dare/components/games/TruthOrDareGameClient.tsx)

- **Summary Modal Scroll Container:** Wrapped player leaderboard in `max-h-48 overflow-y-auto custom-scrollbar` and outer modal in `max-h-[calc(100dvh-2rem)] overflow-y-auto custom-scrollbar` with responsive padding `p-5 sm:p-6`.
- **Direct 18+ URL Query Verification:** Added `useEffect` to verify whether an incoming link directly requesting `?category=spicy-18` has affirmative local storage consent; prompts `AgeGateModal` if unverified.

```tsx
// TruthOrDareGameClient.tsx
useEffect(() => {
  if (initialCategory === 'spicy-18') {
    if (typeof window !== 'undefined') {
      const isConfirmed = localStorage.getItem('asteria_age_verified') === 'true';
      if (!isConfirmed) {
        setShowAgeGate(true);
      }
    }
  }
}, [initialCategory]);
```

---

### Fix 6: Multiplayer QR Code Modal Landscape Fit
**File:** [`app/room/[code]/RoomClient.tsx`](file:///Users/vaibhavborkar/truth&dare/app/room/[code]/RoomClient.tsx)

- **Problem:** On mobile landscape orientation (e.g. 844×390px), the 224px QR code and close button exceeded viewport height.
- **Solution:** Added `max-h-[calc(100dvh-2rem)] overflow-y-auto custom-scrollbar` and responsive image scaling (`w-40 h-40 xs:w-48 xs:h-48 sm:w-56 sm:h-56`).

---

### Fix 7: Breadcrumbs RTL Inversion & Truncation
**File:** [`components/seo/Breadcrumbs.tsx`](file:///Users/vaibhavborkar/truth&dare/components/seo/Breadcrumbs.tsx)

- **Problem:** Chevrons pointed rightwards regardless of text direction, and long article titles could cause awkward line breaks on 320px screens.
- **Solution:** Added `rtl:rotate-180` to `ChevronRight` and responsive max width bounds:
  - Links: `max-w-[120px] xs:max-w-[160px] sm:max-w-[220px]`
  - Current Page: `max-w-[140px] xs:max-w-[190px] sm:max-w-[320px]`

---

### Fix 8: Admin Dashboard Responsive Metrics
**File:** [`app/admin/AdminDashboardClient.tsx`](file:///Users/vaibhavborkar/truth&dare/app/admin/AdminDashboardClient.tsx)

- Adjusted metrics card padding to `p-2.5 sm:p-3.5` with `min-w-0` and `truncate` text.
- Added `max-h-[calc(100dvh-2rem)] overflow-y-auto custom-scrollbar` to the Duplicate String Detection Audit modal.

---

### Fix 9: Global CSS Safe-Area Utilities & Scrollbar Styling
**File:** [`app/globals.css`](file:///Users/vaibhavborkar/truth&dare/app/globals.css)

- Added `.custom-scrollbar` rules with dark-purple party theme hover states.
- Added `.pb-safe`, `.pt-safe`, `.pl-safe`, and `.pr-safe` utilities mapping to CSS `env(safe-area-inset-*)`.

---

*Document compiled and verified by Senior Responsive Web Architect & UI/UX Engineer — Project Asteria*
