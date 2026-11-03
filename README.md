# NadiifiData

**Clean data. See clearly.**

NadiifiData (Nadiifi) is a guest-first data cleaning and analysis workspace built by Diini Kahiye. Upload a spreadsheet or type a dataset yourself, review proposed changes, understand your columns, and create meaningful charts and exportable dashboards—all in one workflow.

## Preview

![NadiifiData preview](https://cleanlab-ai.lovable.app/__l5e/assets-v1/5a051c07-f9b9-4bba-855c-8c5ab269cf7d/nadiifidata-preview.png)

## About the Project

This started as a side project by a data analyst and computer science graduate exploring how to build a practical analytical tool through AI-assisted development. Its focus is not simply making messy data look tidy: it is helping users understand what changes, approve consequential decisions, and avoid misleading analysis.

Parsing, profiling, cleaning, and analytical calculations run in the browser. Lovable Cloud handles sign-in, private saved datasets, and AI assistance. Charts and dashboards are built into the workspace; a separate visualization application is not required.

## The Workflow

```text
Data → Clean → Analyze → Visualize → Export
```

### Data

- Upload CSV, TSV, Excel, JSON, or NDJSON files.
- Open the first Excel worksheet with its headers.
- Build a dataset by entering column names and rows yourself, or start with a sample.
- Work without an account; sign in when you want private cloud saves.

### Clean

- Profile missing values, category inconsistencies, numeric issues, mixed or invalid dates, and duplicate rows.
- Apply safe formatting fixes such as trimming whitespace; review proposed changes before approval.
- Normalize suitable categorical columns using casing, known aliases, and conservative spelling rules. Custom mappings let users choose their own labels.
- Review blank-cell fills with a before-and-after preview, a heuristic confidence score, and an explanation. Leave cells blank or explicitly approve a fill; numeric fills remain estimates.
- Review duplicate groups with full-row comparisons and individual **Keep** or **Delete** choices. Rows default to Keep; repeated business IDs are distinguished from identical rows because they may represent legitimate line items.
- Choose date order explicitly when needed. Unparseable dates remain unchanged rather than being silently guessed.
- Use AI suggestions to prioritize fixes, not to execute unapproved edits.
- Track approved operations and affected cells in an audit record. Undo snapshots support recovery of exact previous rows.

### Analyze

- Inspect column types, completeness, cardinality, statistics, and data quality issues.
- Understand semantic roles such as identifier, measure, dimension, and date, with confidence and reasoning.
- Override inferred roles and supported aggregation choices when domain knowledge matters.
- Read calculated findings and an AI-written plain-English briefing backed by column understanding and approval provenance.
- See approved fills identified as estimates instead of treating them as observed values.

### Visualize

- Generate recommended charts with reasons, confidence, coverage counts, and explanations for excluded chart choices.
- Explore dimensions, measures, aggregation, date grain, sorting, and top-N categories.
- Use UTC calendar buckets for date grouping. Share charts are restricted to counts or suitable nonnegative additive totals—not averages.
- Generate dataset-specific dashboard KPIs and findings, with a column/value filter for dashboard content.
- Choose **Executive**, **Analytical**, **Data story**, or **Minimal** layouts.
- Customize fonts, accent colors, column count, spacing, and corners; edit dashboard titles and remove chart cards.

### Export

- Download cleaned data as CSV or Excel.
- Export dashboard reports as PDF or PNG.

## Workspace and Sign-In

Email/password, Google, and Sign in with Lovable are connected through Lovable Cloud. Password recovery and a saved-datasets workspace are available.

Active workflow drafts and undo snapshots are stored locally in IndexedDB. Encrypted cloud writes use a shared serialized save queue so rapid edits do not race one another. The workspace shows save status and offers retry after failed saves.

Local recovery is tied to the browser: clearing site data can remove local drafts. Cloud saves provide account-based persistence, but cloud history is not a replacement for the local undo stack.

## Privacy and Security

**Local processing.** File parsing and deterministic transformations happen in the browser. Guest use does not require uploading the dataset to cloud storage.

**Private cloud saves.** Saved dataset payloads are encrypted in the browser with AES-GCM before storage. Owner-scoped access rules protect datasets and their encryption keys.

**Encryption boundary.** This is not zero-knowledge encryption. Nadiifi can retrieve the account's key and decrypt datasets for the signed-in user; the platform can therefore decrypt stored data. Encryption protects against casual exposure, not against the platform itself.

**Key safety.** Concurrent first saves insert a key only if one does not exist and then read the winning key. Decryption never creates a replacement key. Legacy plaintext saves are upgraded on authenticated load with a timestamp guard to avoid overwriting newer edits.

**AI requests.** AI assistance sends a derived digest such as column names, semantic roles, statistics, detected issues, calculated findings, and change provenance through an edge function to Lovable AI Gateway. It does not send the entire raw table, but derived metadata can still be sensitive. AI output should be reviewed rather than treated as verified fact.

## What Actually Powers the Data Work

| Responsibility | Implementation |
| --- | --- |
| CSV and TSV parsing | PapaParse |
| Excel reading and writing | SheetJS (`xlsx`) |
| JSON and NDJSON ingestion | Browser-side parsing |
| Profiling and cleaning | Custom TypeScript engine: type inference, statistics, issue detection, category canonicalization, date parsing, and reversible operations |
| Column understanding | Deterministic semantic classification with user overrides |
| Chart recommendations | Custom ranking and aggregation rules |
| Dashboard composition | Dataset-specific KPIs, calculated findings, and layout templates |
| Chart rendering | Recharts |
| Dashboard PDF and image export | jsPDF and browser image-capture utilities |
| Application state | Zustand |
| Local persistence | IndexedDB via idb-keyval |
| Cloud persistence | Lovable Cloud with browser encryption and owner-scoped access |
| AI assistance | `ai-assist` edge function through Lovable AI Gateway |

The interface uses React, TypeScript, Vite, Tailwind CSS, shadcn/ui, and Framer Motion. The deterministic engine—not the language model—performs cleaning and analytical calculations.

## Architecture

```text
Profiler → Semantic model → Cleaning engine → Validation
         → Analytical model → Visualization ranking → Dashboard composer
```

Dataset mutations pass through operation previews and explicit approval records. User semantic roles are applied before analytical calculations. Local drafts preserve active work, while cloud writes serialize encrypted dataset snapshots.

### Project Structure

- `src/pages/` — workflow, workspace, sign-in, recovery, and informational pages.
- `src/components/workspace/` — cleaning reviews, column understanding, AI briefings, dashboards, and template controls.
- `src/components/charts/` — recommended charts and chart rendering.
- `src/lib/cleanlab/` — parsing, profiling, semantic roles, cleaning operations, previews, analytical calculations, recommendations, and dashboard composition.
- `src/lib/cloud/` — encrypted persistence, save ordering, and workflow recovery.
- `supabase/functions/ai-assist/` — AI Gateway integration.

## Local Development

With the repository checked out:

```bash
bun install
bun run dev
```

The development server is available at `http://localhost:8080`.

```bash
bun run test       # Focused workflow and encryption regressions
bun run lint       # Lint checks
bun run build      # Production frontend build
```

Cloud sign-in, private saves, and AI assistance also require the project's Lovable Cloud integration. Never commit private service credentials.

## Verification and Current Limits

The latest update passed 15 focused regression tests covering approval safety, duplicate selection, estimated-fill provenance, date handling, aggregation rules, UTC buckets, filters, save ordering, encryption round trips, and concurrent key creation. The preview's automatic build passed.

Browser checks exercised typed datasets and a deliberately messy first-sheet Excel workbook through cleaning approvals, duplicate decisions, undo, Analyze, visualization, filtering, PDF export, and local reload recovery without browser errors.

Remaining verification:

- Authenticated edits, undo, reload, and failed-save retry against live private cloud saves still need a signed-in preview session for the latest workflow changes.
- A walkthrough using the user's own Excel or CSV file is pending an actual spreadsheet upload.

Known boundaries:

- Category normalization is conservative, not a guarantee of correct domain terminology; inspect proposed merges.
- Blank-fill confidence is heuristic, not a calibrated probability.
- Ambiguous dates require a date-order choice; invalid dates can remain unresolved.
- AI briefings can be wrong and do not replace calculated checks or human review.

---

Built with care by Diini Kahiye.
