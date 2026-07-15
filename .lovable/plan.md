
# CleanLab AI — Production Polish Plan

A full audit + systematic refinement pass. No new features; every change is UX/UI/frontend quality. Backend, cleaning engine, and store logic stay untouched.

## 1. Brand & Header

- Replace the "CleanLab AI" wordmark in the sidebar/header with a **custom SVG brand mark**: a minimalist "data cube + spark" glyph (rounded square, offset grid dots, single accent spark). Rendered as an inline `<Logo />` component in `src/components/brand/Logo.tsx` (works in light/dark via `currentColor` + accent token).
- Sidebar header: logo only when collapsed; logo + micro wordmark ("cleanlab") in a refined type treatment when expanded — set in tracking-tight, `text-[13px]`, medium weight. Proper 12px gap, 16px vertical padding.
- Top header: add left-side breadcrumbs (Home / Section / Dataset), keep search + theme toggle right. Height standardized to 56px, `border-b`, subtle `backdrop-blur`.

## 2. Design system (tokens)

Consolidated in `src/index.css` + `tailwind.config.ts`:

- **Radii**: `--radius-sm 8`, `--radius-md 10`, `--radius-lg 12`, `--radius-xl 16`. Cards use `lg`, inputs/buttons use `md`, chips use `sm`. Current `--radius: 1rem` is too round for a Linear/Vercel feel — drop base to `0.75rem`.
- **Spacing scale**: enforce 4/8/12/16/24/32 rhythm; remove ad-hoc `p-5`, `p-10` in favor of `p-6` / `p-8`.
- **Shadows**: keep `shadow-sm / -card / -elevated`, retune to be flatter (Linear-style). Remove `shadow-glow` from non-primary elements.
- **Typography scale**: `text-xs 12`, `sm 13`, base 14, `lg 16`, `xl 18`, `2xl 22`, `3xl 28`, `4xl 34` — page H1 becomes `text-2xl font-semibold tracking-tight` (not `text-3xl font-bold`). Body copy `text-sm`, helper `text-xs text-muted-foreground`.
- **Sizing primitives**: buttons `h-9` default / `h-8` sm / `h-10` lg; inputs `h-9`; icon buttons `h-9 w-9`; icon size 16px default, 14px in dense rows.
- **Color**: keep blue primary, but soften `--background` to `0 0% 100%` (light) and neutralize `--muted` slightly cooler. Add `--border-strong` for table dividers.
- Remove `src/App.css` (leftover Vite defaults, unused, conflicts with layout).

## 3. Reusable primitives

New small wrappers to enforce consistency:

- `PageHeader` — title, description, actions slot, optional breadcrumb.
- `SectionCard` — Card with standard padding (`p-6`), header row, optional action.
- `EmptyState` — icon, title, description, CTA.
- `DataTable` — wraps `@tanstack/react-table`: sticky header, sortable, filterable, resizable cols, pagination footer, skeleton rows, empty state, horizontal scroll container (`overflow-x-auto`) so tables never blow out layout.
- `Kbd`, `StatusDot`, `Chip` for consistent inline UI.

## 4. Page-by-page polish

**Landing** (`src/pages/Landing.tsx`): replace generic hero with tighter grid; brand mark + accent gradient behind, feature bento (3+2), single primary CTA, honest footer. Keep copy, retune spacing + type.

**AppLayout** (`src/pages/app/Layout.tsx`): breadcrumbs, constrain `main` to `max-w-[1400px] mx-auto w-full`, standard `px-6 py-6 md:px-8 md:py-8`. Header sticky, sidebar sticky, no double scroll.

**Sidebar** (`AppSidebar.tsx`): tighter groups, 4px between items, active state = `bg-accent text-accent-foreground` with 2px left accent bar, icon-only mode gets tooltips (already partly there), Recent datasets truncate with `max-w-[160px]`, dataset-workspace links disabled with tooltip when no dataset instead of silent 50% opacity.

**Dashboard**: shrink KPI cards (label 12px, value `text-2xl`, icon 16px in a `size-8` tile), 4-up on ≥lg, 2-up on md, 1-up on sm. Recent datasets → real table with columns (Name, Rows, Cols, Size, Updated). Quick actions become 2×2 grid on the right. Add "Needs attention" tile summarizing issue counts across datasets.

**Upload**: dropzone with proper hover/active/error states, animated dashed border (CSS, no bg image), progress bar during parse, success toast + inline preview (first 5 rows), file-size + type validation with friendly errors ("We couldn't read this file — try CSV or XLSX under 25 MB").

**DatasetDetail**: tab bar aligns with header, tab content uses SectionCard grid. Overview shows profile stats + AI summary card; Columns tab uses DataTable with search; Cleaning Studio: left ops list, right diff preview, sticky action bar; Visualize: responsive chart grid `grid-cols-1 md:grid-cols-2`, charts wrapped with `ResponsiveContainer` height 260, consistent legend + tooltip. Export tab: cards per format with size estimate.

**History**: DataTable with filters (type: cleaning/export, date range). Empty state.

**Settings**: sectioned form (Appearance / Data / About), Switch rows with description below label, danger zone at bottom.

**NotFound**: friendly, brand mark, back-to-app CTA.

## 5. Tables

Single `DataTable` used everywhere. `overflow-x-auto` wrapper, `min-w-full`, sticky `thead` with `bg-card/95 backdrop-blur`, zebra off, row hover `bg-muted/40`, cell padding `px-3 py-2`, header `text-xs uppercase tracking-wide text-muted-foreground`. Truncate long filenames with `title` tooltip.

## 6. Forms & inputs

Consistent label (`text-xs font-medium mb-1.5`), helper (`text-xs text-muted-foreground mt-1`), error (`text-xs text-destructive mt-1` + red ring). All inputs `h-9 rounded-md`. Focus ring uses `--ring` token.

## 7. Charts (`AutoCharts.tsx`)

Uniform card wrapper, height 260, `ResponsiveContainer`, muted gridlines (`stroke="hsl(var(--border))"`), tooltip uses card token, legend at top-right in `text-xs`, empty state when series is empty, skeleton on load.

## 8. Interactions & motion

- Global transition tokens: `transition-colors duration-150`, `transition-transform duration-200`.
- Cards: `hover:shadow-card hover:-translate-y-0.5` (only clickable ones).
- Buttons: press scale `active:scale-[0.98]`.
- Page transitions kept subtle (framer `fade + 4px y`, 180ms).
- Skeletons for datasets, tables, charts, KPI on first render.
- Toast for every mutation (save, undo, export, delete) — use existing `use-toast`.

## 9. Accessibility

- Every icon-only button gets `aria-label` (sidebar trigger, theme toggle, close, upload remove).
- Single `<main>` in layout only.
- Landmarks: `<header>`, `<aside>` (sidebar wrapper already handles), `<nav aria-label="Primary">`, `<main>`.
- Focus-visible ring on all interactive elements via a global utility.
- Contrast pass: replace `text-muted-foreground/50` and `text-gray-*` occurrences with tokens.
- Keyboard: Command palette (⌘K) already wired; ensure Escape closes, arrow keys navigate. Tab order verified per page.
- Touch targets ≥ 40×40 on mobile (bump icon buttons via `min-h-10 min-w-10` on primary tap targets).
- `h-screen` → `h-dvh` for full-height layouts.

## 10. Responsive

- Sidebar auto-collapses < md; header shows menu trigger.
- Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` KPI; `lg:grid-cols-3` main dashboard split.
- Tables inside `overflow-x-auto` with `min-w-[720px]` fallback.
- Dialogs `max-h-[90dvh] overflow-y-auto`, `w-[calc(100%-2rem)]` on mobile.
- No `h-screen`, no fixed pixel widths outside sidebar.
- Test breakpoints: 360, 768, 1024, 1280, 1536.

## 11. Error handling

- Replace raw error strings with `{ title, description, hint }` pattern via toast.
- Parse failures → "This file couldn't be read. Please check the format and try again."
- AI failures → "The assistant is unavailable right now. You can still clean manually."
- Route errors → NotFound with helpful links.

## 12. Performance

- `React.lazy` + `Suspense` around every route in `App.tsx`.
- Memoize heavy table rows, chart data derivations (`useMemo`).
- Virtualize preview table (>500 rows) via `@tanstack/react-virtual` if already installed; otherwise cap preview to 200 rows with "load more".
- Debounce column search (150ms).

## 13. Cleanup

- Delete `src/App.css` (unused, conflicts).
- Delete `supabase/functions/send-contact-email/` (leftover from prior project).
- Remove unused imports flagged during pass.

## Files touched (approx.)

```
src/index.css                        (tokens retune)
tailwind.config.ts                   (radius, fontSize, keyframes)
src/App.tsx                          (lazy routes)
src/components/brand/Logo.tsx        NEW
src/components/app/AppSidebar.tsx    (logo, spacing, active state)
src/components/app/PageHeader.tsx    NEW
src/components/app/SectionCard.tsx   NEW
src/components/app/EmptyState.tsx    NEW
src/components/app/DataTable.tsx     NEW (generic)
src/components/app/DatasetTable.tsx  (migrate to DataTable)
src/components/app/StatCard.tsx      (retune)
src/components/app/CommandPalette.tsx (a11y polish)
src/components/app/ThemeToggle.tsx   (aria-label, size)
src/components/charts/AutoCharts.tsx (uniform wrapper)
src/pages/Landing.tsx                (redesign)
src/pages/NotFound.tsx               (rebrand)
src/pages/app/Layout.tsx             (header, breadcrumbs, main container)
src/pages/app/Dashboard.tsx          (polish)
src/pages/app/Upload.tsx             (dropzone polish)
src/pages/app/DatasetDetail.tsx     (tabs, sticky action bar)
src/pages/app/History.tsx            (DataTable)
src/pages/app/Settings.tsx           (sections)
src/App.css                          DELETE
supabase/functions/send-contact-email/  DELETE
```

## Out of scope

- No changes to `src/lib/cleanlab/*` (engine untouched).
- No changes to `useDatasetStore` shape.
- No new backend endpoints; `ai-assist` edge function unchanged.
- No dependency additions beyond what's already installed.

## Acceptance

- No horizontal page scroll at 360/768/1024/1280.
- One H1 per page, consistent type scale.
- Every icon-only control has an accessible name.
- Tables scroll internally, never break layout.
- All routes lazy-loaded; initial JS shrinks measurably.
- Sidebar shows brand mark, not "CleanLab AI" wordmark.
- Visual language reads closer to Linear/Vercel/Supabase than a stock template.
