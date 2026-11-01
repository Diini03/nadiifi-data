# Nadiifi: a simpler workflow with trustworthy cleaning and analysis

## Goal
Make the purpose clear: turn messy tables into reliable findings and useful reports, without silently changing real data. Keep the familiar **Data → Clean → Analyze → Visualize → Export** flow, guest access, and existing dashboard styles.

## What the review found
- Lovable Cloud is already connected and active. Email/password and Google controls, encrypted dataset storage, column understanding, AI briefings, and report templates already exist; extend them rather than replace them.
- The issue-selection panel is hidden on small screens, and moving between steps currently looks like completing them.
- Duplicate review still marks rows for deletion by default, including groups not displayed. Repeated order numbers need their own review; matching IDs are not proof that rows should be deleted.
- Blank fills require approval, but their confidence scores are heuristics, not probabilities of correctness. Approved estimates are not tracked separately in findings.
- Undo does not save to the cloud. Signing in can interrupt the current table, and there is no persistent saving/retry indicator.
- Chart rules need corrections: average-based charts can be called “shares,” date buckets depend on local time, and aggregation relies partly on column names.

## 1. Make the next decision obvious
- Keep upload, typed dataset creation, and sample data as the three entry choices. Show the table name, row count, and current stage together.
- Use one primary next action per stage: review changes, examine findings, create charts, then export. Allow going back without losing decisions.
- Track actual work and outstanding review separately from the selected tab; never imply a dataset is clean merely because the user opened Analyze.
- Make issue selection and review accessible on small screens. Group Clean into **format fixes**, **decisions to review**, and **changes already applied**, instead of stacking competing AI cards and review tools.
- Consolidate the two Clean AI cards into one on-demand prioritized explanation; keep deterministic previews authoritative.
- Use truthful privacy wording: processing stays in the browser; signed-in cloud saves contain encrypted rows; AI receives a limited summary, not the complete table.

## 2. Connect sign-in and reliable private saves
- Verify hosted email/password and provider settings; enable email, managed Google, and Sign in with Lovable where workspace policy permits. Keep confirmation emails and disable anonymous account creation.
- Preserve the active local dataset, chosen step, and intended same-origin destination through sign-in. Restore only after the session is ready.
- Add a visible **Local only / Saving / Saved / Save failed** status with retry. Guests can finish the entire workflow without signing in.
- Centralize and serialize automatic encrypted saves for creation, approved cleaning, edits, and undo so older saves cannot overwrite newer work. Restore the active dataset after a fresh reload.
- Preserve browser encryption, existing keys, insert-if-absent/read-winning-key creation, and timestamp-guarded legacy upgrades. Never create a replacement key while unlocking data.
- Verify owner-only access and explain the limit accurately: this is not encryption that prevents the platform itself from decrypting; metadata such as dataset names remains readable.

## 3. Make cleaning previewable and reversible
- Generate previews using the same operations that will be applied: affected rows, original values, proposed values, reason, and risk. Require confirmation before applying the proposed batch.
- Offer conservative formatting fixes together. Ambiguous spelling merges, invalid/ambiguous dates, blanks, duplicate rows, repeated keys, and any destructive operation remain explicit review decisions.
- Default every duplicate row to **Keep**. Show all columns, highlight differences, and paginate every group; undisplayed rows must never be marked for deletion. Reset selections safely when data changes.
- Compare repeated IDs separately from exact/normalized duplicates. Do not assume order numbers are unique: line items can legitimately repeat an order number.
- Keep blank-fill previews and approval; add **Leave blank**. Label numerical fills as estimates and confidence as a heuristic reliability indicator. Never fill identifier columns automatically.
- Let users choose day-first/month-first for ambiguous dates. Preserve unparseable originals, show failures, and never treat a column-level score as proof that every date parsed.
- Revalidate after each operation. Keep a reversible change history with affected row identities, operations, user approvals, and before/after quality; unresolved issues remain visible.

## 4. Build a trustworthy analytical model
- Separate physical types from meaning: ID, measure, category, and date. Let users correct inferred roles and select aggregation rules.
- Define sum, average, count, distinct count, and date grain explicitly. Never sum IDs, averages, scores, rates, or prices without a suitable rule.
- Carry cleaning provenance into Analyze: how many values were estimated, which rows were removed, unresolved dates, exclusions, and sample size.
- Calculate findings locally from the current approved dataset. Ground AI summaries in those calculations and column roles; distinguish verified findings from suggestions and avoid unsupported causal claims.

## 5. Make charts and dashboards genuinely useful
- Fix correctness first: part-to-whole charts require additive, nonnegative totals; averages use comparison charts and accurate labels. Use stable date buckets with an explicit timezone policy.
- Add chart controls for dimension, measure, aggregation, date grain, sorting, top categories, and filters with semantic guardrails.
- Show aggregation, included/excluded row counts, units, and rationale beside each chart. High-cardinality categories use intentional top-N handling with a clearly defined remainder rather than misleading clutter.
- Compose dashboards around the dataset's available measures and dimensions, not assumed business facts. Provide a useful fallback for text-only or tiny datasets.
- Preserve Executive, Analytical, Data story, Minimal, and the custom template builder. Apply filters consistently to charts, KPIs, findings, and PDF/PNG output.

## 6. Prove the complete workflow
- Create regression fixtures with `Male / male / M / FEMALE / F`, category spelling variants, mixed numbers, missing cells, invalid and ambiguous dates, exact duplicates, and legitimate repeated order IDs.
- Assert concrete outcomes: no deletion or filling without approval; previews match applied edits; undo restores exact rows; invalid dates stay flagged; identifiers never become summed measures; average charts never become shares; date buckets stay stable.
- Walk typed data and Excel-first-sheet import through Clean, Analyze, Visualize, and export as a guest.
- Walk a signed-in dataset through encrypted save, edits, undo, and fresh reload; compare the actual rows, not just row counts. Test save failures and rapid edits.
- Run existing encryption tests plus new cleaning/chart tests, inspect the automatic build result, and check keyboard access and desktop/mobile layouts in the preview.
- Your own Excel/CSV walkthrough remains separate until you supply a spreadsheet; use clearly labeled test data meanwhile.

## Technical approach
- Retain React/Vite, existing semantic design tokens and UI components, Zustand/IndexedDB, SheetJS/PapaParse, Recharts, and Lovable Cloud.
- Keep profiling, transformation, validation, and chart calculations in the browser. Move heavy browser work to a Web Worker where profiling shows it is necessary; do not add a data-processing server.
- Introduce focused modules for operation previews/history, analytical measures, and serialized cloud persistence instead of growing `Home.tsx` further. Record structural rules in `AGENTS.md`.
- Preserve the selected AI model. Improve summaries through structured, validated statistics, privacy-conscious digests, and explicit uncertainty—not a model change.
- Reuse the existing private storage schema where possible; inspect deployed permissions before any schema change.

## Delivery order
Implement phases 1–3 first so the workflow is clear and safe, then phases 4–5 for advanced analysis. Add and run relevant tests alongside each phase, followed by the full phase-6 walkthrough. No billing, new marketing pages, or unrelated redesign is included.