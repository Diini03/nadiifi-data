
## CleanLab AI — build plan

Replace the current Get In Touch page and repurpose the project into **CleanLab AI**, a premium in-browser data cleaning SaaS. All decisions were left to me — here's the direction:

- **Backend**: All in-browser. CSV/Excel parsing, profiling, cleaning, and charts run client-side. No FastAPI/SQLite (not possible on Lovable); datasets persist in `localStorage` + IndexedDB for large files.
- **Auth & persistence**: No sign-in. Single-session with local persistence. Fastest to ship, matches "Upload → Clean → Download" flow.
- **AI**: Wired to Lovable AI Gateway (`google/gemini-2.5-flash`) for dataset summary, cleaning suggestions, and issue explanations.
- **Scope**: Full UI on every sidebar page, real logic on the core cleaning path. PDF reports, command palette, and Excel export are wired but light on polish; can iterate.

### Pages / routes

```text
/                    Landing (hero, features, FAQ, footer)
/app                 Layout with sidebar + topbar
  /dashboard         KPI cards, recent datasets, quick actions
  /upload            Drag-and-drop CSV/Excel, preview first 20 rows
  /datasets/:id      Overview + tabs: Profile · Columns · Cleaning · Visualize · Export
  /history           Cleaning + export history
  /settings          Theme, autosave, language stub
```

The single dataset detail route uses tabs so users stay in flow. Sidebar links map to routes above; `Cleaning Studio` / `Visualization` / `Reports` open the last-active dataset.

### Design system

- Primary `#2563EB`, background `#FAFAFA`, cards white, radius 16px, Inter, subtle shadows, 8-pt spacing.
- Dark mode via `next-themes`.
- All colors go through `index.css` HSL tokens + `tailwind.config.ts` — no hardcoded hex in components.
- Framer Motion for page transitions, success ticks, and card entrances. Skeletons for loading.

### Core engine (client-side, `src/lib/cleanlab/`)

- `parse.ts` — CSV via `papaparse`, XLSX via `xlsx` (SheetJS). Auto-detect delimiter, header row, encoding.
- `types.ts` — `Dataset`, `Column`, `Issue`, `Operation`, `HistoryEntry`.
- `infer.ts` — infer column types: number, integer, float, boolean, date, email, phone, url, categorical, text.
- `profile.ts` — per-column stats: missing %, unique count, mode, min/max/mean/median/std, top values, histogram bins, IQR outliers, z-score outliers.
- `issues.ts` — detects duplicates, missing values, mixed types, invalid emails/phones, whitespace, inconsistent casing, outliers, constant columns, high-cardinality IDs.
- `operations.ts` — pure functions for each op below, each returns `{ dataset, diff }`.
- `history.ts` — undo/redo stack with immutable snapshots (structural sharing per column).
- `store.ts` — Zustand store: current dataset, history, selected column, autosave to IndexedDB via `idb-keyval`.

**Cleaning operations shipped**: remove duplicates, fill nulls (mean/median/mode/constant), drop null rows, rename columns, trim, lowercase, uppercase, title-case, convert dtype, replace values, standardize text, detect invalid emails/phones, remove extra spaces, parse dates, IQR/z-score outlier removal, manual row filter. Each op is one click with preview + undo.

### AI features (Lovable AI, streaming)

Edge function `ai-assist` proxies chat completions with `LOVABLE_API_KEY`. Client sends a compact profile digest (no raw PII beyond column names + stats). Handles 429/402. Surfaces:

- Dataset summary card on Overview
- "Suggest cleaning" button in Cleaning Studio → returns ordered ops with one-click apply
- "Explain this issue" tooltip on each detected issue
- Insights panel with 3–5 business observations

### Visualization

- Recharts: histogram, bar, scatter, line, pie, correlation heatmap (custom SVG grid), box plot (custom).
- PNG download via `html-to-image`; SVG via native serialization.

### Export

- CSV via papaparse, JSON via `JSON.stringify`, Excel via SheetJS.
- Cleaning report: HTML → print-to-PDF using `window.print` with a dedicated print stylesheet (no server needed).

### Sidebar / shell

- `shadcn/ui` `Sidebar` with `collapsible="icon"`, keyboard-navigable, ARIA labels.
- Topbar: global search (`⌘K` command palette via `cmdk` — jumps to datasets, columns, ops), dataset switcher, theme toggle, notifications popover.

### State & persistence

- Zustand store, autosaved to IndexedDB on every op.
- Datasets index in `localStorage` for quick listing.
- Recent activity, favorites, pinned datasets stored alongside.

### Files to add (high level)

```text
src/pages/Landing.tsx
src/pages/app/Layout.tsx
src/pages/app/Dashboard.tsx
src/pages/app/Upload.tsx
src/pages/app/DatasetDetail.tsx      (+ Profile/Columns/Cleaning/Visualize/Export tabs)
src/pages/app/History.tsx
src/pages/app/Settings.tsx
src/components/app/AppSidebar.tsx
src/components/app/CommandPalette.tsx
src/components/app/DatasetTable.tsx  (TanStack Table)
src/components/app/StatCard.tsx
src/components/app/IssueCard.tsx
src/components/app/ColumnDrawer.tsx
src/components/charts/*.tsx
src/lib/cleanlab/*.ts
src/store/useDatasetStore.ts
supabase/functions/ai-assist/index.ts
```

### Files removed / repurposed

- Delete `src/components/ContactForm.tsx`.
- Replace `src/pages/Index.tsx` content with the new Landing page.
- Keep `src/integrations/supabase/client.ts` (auto-generated, untouched).

### Dependencies to install

`papaparse`, `xlsx`, `zustand`, `idb-keyval`, `cmdk` (already via shadcn), `html-to-image`, `next-themes`, `date-fns`, `@tanstack/react-table`, `recharts` (already), `framer-motion` (already).

### Out of scope for this pass

- Real accounts / multi-device sync (single-session by design).
- Server-side large-file streaming (files > ~50MB may be slow in-browser; we'll warn).
- Localization beyond an English UI with the Settings language toggle stubbed.

### What you'll see when it's done

A polished landing page, a proper app shell with sidebar + `⌘K`, drag-and-drop upload that instantly profiles the file, a Cleaning Studio with detected issues + one-click fixes + undo/redo, auto-generated charts, and CSV/Excel/JSON/PDF export — with AI summaries and cleaning suggestions available on every dataset.
