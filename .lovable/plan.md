# Plan: NadiifiData → Full Analytics Workspace

This is a large upgrade. I'll ship it in **five focused phases** so each stage lands stable and reviewable, rather than one massive rewrite. Every phase produces a working app.

---

## Guiding principles

- Keep the current desktop-style shell (icon rail · top command bar · main workspace · right panel · status bar). Extend it, don't replace it.
- Everything runs **in-browser** by default (Papaparse / SheetJS, Zustand, IndexedDB). Cloud/auth is additive — guest mode always works.
- Reuse existing detectors/operations/exporters/i18n. No re-writes where the current module is already correct.
- Design tokens only. No hardcoded colors. Full EN/SO translation for every new string.

---

## Phase 1 — Workspace shell & navigation upgrade

Turn the current single-screen workspace into a real multi-view desktop app.

- Left rail views: **Data · Clean · Analyze · Dashboard · Insights · Export · History · Settings** (icon + label on hover).
- Top command bar: dataset switcher, quick-actions (Undo/Redo, Clean, Export), language switch, theme, profile menu.
- Right properties panel becomes contextual (per-view content instead of always "Inspection").
- Bottom status bar upgraded: rows · cols · memory · health score · last action · sync state.
- Central workspace becomes a `<Outlet />`-style view switcher driven by rail state.

## Phase 2 — Profiling & Cleaning Studio (extend existing)

- Extend `src/lib/cleanlab/issues.ts` detectors already present with any missing ones from the spec (mixed dtypes, outliers by IQR/z-score, numeric-as-text, inconsistent values, invalid emails/dates/phones — most already exist; fill gaps).
- New **Dataset Overview** panel: row count, col count, column types, memory usage, missing summary, duplicate summary, health score (0–100 weighted).
- Cleaning Studio: checklist of fixes → **Preview diff** → **Apply**. Show before/after stats card. Reversible via existing history stack.

## Phase 3 — Visual Analytics + KPI Cards

- **Auto-charts** already present; extend catalog to: Bar, Line, Area, Pie, Donut, Histogram, Scatter, Box, Heatmap, Correlation Matrix, Treemap, Table.
- Chart customization drawer: column pickers, aggregation (sum/avg/count/min/max/median), sort, top-N filter, color, title.
- **KPI cards**: auto-suggest set (Rows, Cols, Missing %, Duplicates, per-numeric-col avg/sum/min/max/median/std, per-cat-col unique/mode). Editable title, icon, format (number/percent/currency/compact), size (S/M/L), tone.

## Phase 4 — Dashboard Builder & Insights

- **Dashboard canvas** using `react-grid-layout` (drag/resize/rearrange). Widget types: KPI, chart, table, text/insight.
- Widget actions: duplicate, delete, edit, resize. Layout auto-saves to workspace.
- **Insights view**: rule-based summaries — top/bottom category, distribution shape, strongest correlations, outlier counts, missing-value impact. Concise, factual bullets.
- **Export**: dataset (CSV/XLSX/JSON — done), dashboard PNG/PDF via `html2canvas` + `jspdf`, chart PNG/SVG, workspace config JSON.

## Phase 5 — Auth, Cloud persistence, Workspaces, polish

- Enable Lovable Cloud auth: email/password + Google. Guest mode is default; a "Save your work" banner appears after first meaningful action.
- Tables (with RLS + GRANTs): `profiles`, `workspaces`, `datasets_meta`, `dashboards`, `exports_log`. Row-level bytes for datasets stay in IndexedDB by default; Cloud stores metadata + layouts + KPI/chart configs. Large dataset blobs uploaded to Storage bucket `datasets` (private) on explicit "Sync to cloud".
- Pages: Sign In, Sign Up, Forgot Password, Reset Password (`/reset-password`), Profile, Account Settings. Email verification via existing Lovable auth defaults.
- Workspace CRUD: create / rename / duplicate / archive / delete. Switcher in top bar.
- Final QA pass: overflow, alignment, spacing, keyboard nav, focus rings, ARIA labels, mobile sheet variants of right panel, skeletons everywhere, empty states everywhere, toast-based error handling.

---

## Technical details

**New files (indicative):**
- `src/pages/app/{Data,Clean,Analyze,Dashboard,Insights,Export,History,Settings,Profile,Auth,ResetPassword}.tsx`
- `src/components/workspace/{TopBar (extend), IconRail (extend), PropertiesPanel, StatusBar (extend), WorkspaceSwitcher, HealthScore, DatasetOverview}.tsx`
- `src/components/kpi/{KpiCard, KpiEditor, KpiAutoBuilder}.tsx`
- `src/components/charts/{ChartRenderer, ChartEditor, chartTypes/*}.tsx`
- `src/components/dashboard/{DashboardCanvas, WidgetFrame, WidgetPicker}.tsx`
- `src/lib/analytics/{stats, correlations, insights, kpis}.ts`
- `src/lib/i18n/dict.ts` — extend keys for every new string (EN + SO)
- `src/store/{useWorkspaceStore, useDashboardStore, useKpiStore, useAuthStore}.ts`
- Cloud migration for `profiles`, `workspaces`, `dashboards`, `datasets_meta`, `exports_log` (with `GRANT` + RLS).

**Libraries to add:** `react-grid-layout`, `html2canvas`, `jspdf`, `simple-statistics` (small stats helpers).

**Reuse as-is:** existing parsers, operations, exporters, i18n provider, dataset store, Recharts, shadcn primitives, current index.css tokens.

---

## Out of scope (this pass)

- Team / multi-user workspaces (single-owner only).
- Scheduled imports, cloud storage integrations, SSO beyond Google.
- AI-generated cleaning suggestions beyond current `ai-assist` function.
- Somali translation of AI-generated free text (UI chrome only).

---

## Deliverable per phase

Each phase ends with: typecheck clean, working preview, updated `.lovable/plan.md`, and a short changelog line in the README.

---

## Questions before I start

1. **Scope confirmation:** OK to ship in 5 phases across separate turns, or do you want everything attempted in one turn (higher risk, some polish will slip)?
2. **Auth defaults:** Enable **Email/Password + Google** by default (Lovable Cloud managed)? Any restriction I should apply (e.g. no anonymous signups — already the default)?
3. **Cloud dataset storage:** OK with the hybrid model — metadata + configs in Postgres, raw rows in IndexedDB, opt-in "Sync to Cloud" that uploads the file to a private `datasets` bucket? Or do you want every uploaded dataset auto-uploaded on sign-in?
4. **Dashboard export fidelity:** `html2canvas` + `jspdf` is good enough for most B2B dashboards but isn't pixel-perfect for complex SVG. Acceptable, or do you want server-side rendering later?
