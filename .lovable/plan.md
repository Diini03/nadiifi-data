## Plan: Redesign NadiifiData as a Focused Data-Cleaning Workspace

### Vision
Turn NadiifiData from a multi-page SaaS-style app into a single focused workspace tool. Users land directly inside the app; no marketing/landing pages. One workflow only: **Upload → Inspect → Fix → Clean → Download / Continue to XogArag.**

---

### 1. Routing & Structure

- Remove the marketing `Landing.tsx` route. `/` now renders the workspace directly.
- Collapse the current multi-page app (Dashboard, Upload, DatasetDetail with tabs, History, Settings) into **one workspace** at `/`.
- Keep a lightweight `/history` and `/settings` reachable from the left icon rail, but the "home" is the workspace itself.
- No FAQ, pricing, blog, testimonials, hero. Remove `Landing.tsx` entirely.

### 2. New Desktop-Style Layout

Figma/Linear/Notion feel. Five regions:

```text
┌─────────────────── Top Command Bar ──────────────────────┐
│ Logo · Dataset name · Language switch · Theme · Actions  │
├──────┬──────────────────────────────────────┬────────────┤
│ Icon │                                      │ Inspection │
│ Rail │        Central Workspace             │  Panel     │
│      │  (Upload / Table / Diff / Export)    │  (Issues)  │
│      │                                      │            │
├──────┴──────────────────────────────────────┴────────────┤
│ Status Bar: rows · cols · quality score · last action    │
└──────────────────────────────────────────────────────────┘
```

- Left rail: vertical icon nav (Workspace, History, Settings). Tooltips on hover.
- Right inspection panel: collapsible, shows detected issues grouped by severity.
- Bottom status bar: dataset size, quality score, currently selected column, last cleaning action.

### 3. Primary Workflow (single screen, stepper-driven)

The central workspace switches state based on progress, not routes:

1. **Empty state** — full-bleed dropzone with sample dataset link.
2. **Inspecting** — animated scan overlay while profiler runs.
3. **Issues found** — data table on the left, categorized issue list on the right. Each issue chip shows: severity dot, title, rows affected, columns affected, recommendation, and a "Preview fix" action.
4. **Preview changes** — split before/after view for the selected fix.
5. **Clean Dataset** — single prominent primary CTA in the top bar. On click, applies all selected fixes and displays a summary card: rows removed, cells edited, columns normalized, quality score delta.
6. **Export** — two equal-weight cards:
   - **Download Clean Dataset** (CSV / Excel / JSON dropdown)
   - **Visualize in XogArag** → opens `https://xog-arag.vercel.app` in a new tab with a short explanatory blurb.

### 4. Inspection Engine (extend `src/lib/cleanlab/`)

Add detectors on top of existing profile/issues code:

- Missing values, duplicate rows, duplicate columns, empty rows, empty columns.
- Whitespace: leading, trailing, multi-space.
- Casing: wrong capitalization, mixed text formatting.
- Validators: invalid dates, emails, phone numbers.
- Inconsistency: cluster near-duplicates ("USA" / "United States" / "U.S.A").
- Type checks: numeric-as-text, mixed dtypes.
- Encoding artefacts (mojibake heuristics).

Each detected issue exposes: `severity` (info/warn/critical), `title`, `description`, `recommendation`, `rowsAffected`, `columnsAffected`, `apply()`.

### 5. "Clean Dataset" Action

- Single prominent button in top command bar.
- Applies every currently-selected fix in one atomic operation.
- After running, shows a Before / After panel: row count, cell edits, per-issue-type change counts, quality score before → after.
- All operations remain reversible via the existing history stack.

### 6. XogArag Handoff

- Export step includes a dedicated "Continue with XogArag" card.
- Copy explains the split: **NadiifiData prepares the data. XogArag analyzes it.**
- Button opens `https://xog-arag.vercel.app` in a new tab.

### 7. Bilingual UI (English / Somali)

- Lightweight i18n layer (small dictionary + `useI18n()` hook, no external lib needed).
- Language switch in the top command bar. Persist in `localStorage`, apply instantly without reload.
- Translate all interface strings (buttons, labels, issue titles, status bar, empty states, tooltips).
- Sample mappings: Upload Dataset → Soo Geli Xogta, Clean Dataset → Nadiifi Xogta, Download → Soo Dejiso, Issues Found → Dhibaatooyin La Helay, Missing Values → Qiimeyaal Maqan, Duplicate Rows → Safaf Isku Mid Ah.

### 8. Visual Design

Distinctive utility-software look — not another SaaS dashboard:

- Neutral off-white workspace (`#F7F7F5`) with charcoal ink; deep-emerald accent (`#0F5B4A`) as the single action color; amber/red for issue severity.
- Rounded 14–18px panels, ultra-soft shadows, thin 1px hairlines.
- Typography: keep Inter for body; use a tighter display face for headings (e.g. Instrument Serif or Space Grotesk) — one direction only.
- Micro-animations ≤200ms; scan/inspection uses a subtle shimmer, not spinners.
- Beautiful empty state for the dropzone with a minimal line illustration.

### 9. Responsiveness & Accessibility

- Desktop: full 3-column layout.
- Tablet: right inspection panel becomes a slide-over.
- Mobile: single column, stepper-based; issues panel opens as a sheet. No horizontal overflow anywhere.
- Full keyboard nav, focus rings, ARIA labels on every icon-only button, semantic landmarks (`<main>`, `<aside>`, `<nav>`).

### 10. README Update

Update root `README.md`:

- Add the live website link `https://nadiifi-data.vercel.app/` (Preview section + a new "Live Demo" line near the top).
- Adjust description to reflect the new single-workspace focus and XogArag handoff.

---

### Technical Notes

- Files to add:
  - `src/pages/Workspace.tsx` (new home)
  - `src/components/workspace/{TopBar,IconRail,InspectionPanel,StatusBar,EmptyState,IssueList,IssueCard,ExportPanel,LanguageSwitch}.tsx`
  - `src/lib/i18n/{index.ts,en.ts,so.ts}` + `useI18n` hook, `LanguageProvider`
  - Extend `src/lib/cleanlab/issues.ts` with the new detectors listed above.
- Files to remove:
  - `src/pages/Landing.tsx`
  - `src/pages/app/{Layout,Dashboard,Upload,DatasetDetail}.tsx` (folded into Workspace); keep `History.tsx` and `Settings.tsx` but reachable inside the new shell.
- Routes in `src/App.tsx` become: `/` (Workspace), `/history`, `/settings`, `*` (NotFound).
- Reuse existing `useDatasetStore`, parsers, exporters, and profile logic.

### Out of Scope

- Backend changes, auth, cloud storage, team workspaces (roadmap only).
- AI cleaning suggestions (keep existing edge function as-is; no new AI features this pass).
- Any XogArag-side changes — we only link out.

### Deliverable

A single-workspace NadiifiData that feels like professional desktop software: upload a messy dataset, see issues in the right panel, click **Clean Dataset**, then download or hand off to XogArag — with full English/Somali switching and an updated README pointing to the live site.
