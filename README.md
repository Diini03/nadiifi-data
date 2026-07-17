
# NadiifiData

**Clean data. Better decisions.**

NadiifiData is a focused, in-browser data-quality workspace. Upload a messy CSV or Excel file, review the issues automatically detected in it, apply cleaning fixes with one click, then download the cleaned dataset — or continue straight to [XogArag](https://xog-arag.vercel.app) for visualization and dashboards.

**Live app:** [https://nadiifi-data.vercel.app/](https://nadiifi-data.vercel.app/)

---

## Preview

![NadiifiData preview](https://cleanlab-ai.lovable.app/__l5e/assets-v1/5a051c07-f9b9-4bba-855c-8c5ab269cf7d/nadiifidata-preview.png)

---

## About the Project

Data preparation is one of the most time-consuming stages of any analytical workflow. Real-world datasets are rarely ready for analysis: they contain missing entries, inconsistent formatting, duplicated rows, unexpected outliers, and columns whose data types don't match their content. NadiifiData was built to compress that preparation phase into a fast, visual, browser-based workflow that anyone on a data team can use — not just engineers comfortable with pandas or SQL.

The application runs entirely in the browser, meaning uploaded data never leaves the user's machine. Files are parsed locally, profiled in memory, and cleaned through reversible operations. The result is a workflow that is both privacy-preserving and fast enough for interactive use on datasets containing tens of thousands of rows.

---

## Features

**Dataset ingestion.** Upload CSV and Excel files through drag-and-drop or a file picker. Files are parsed client-side using streaming parsers, so large datasets load without freezing the interface.

**Automatic profiling.** As soon as a dataset is loaded, NadiifiData generates a full profile: row and column counts, inferred data types, value distributions, unique-value counts, and per-column completeness scores.

**Missing value detection.** Empty cells, whitespace-only values, and common null placeholders (`NA`, `N/A`, `null`, `-`) are identified and surfaced with per-column impact metrics.

**Duplicate detection.** Exact and near-duplicate rows are flagged and can be reviewed before removal, so users always understand what will be deleted.

**Data type validation.** Columns are checked against inferred types. Values that don't fit — a string in a numeric column, an invalid email, a malformed date — are highlighted with a suggested fix.

**Outlier detection.** Numeric columns are analyzed using statistical methods (IQR and z-score) to surface unusual values that may warrant review.

**Column statistics.** Every column receives a detailed statistical summary: min, max, mean, median, standard deviation for numerics; top values and cardinality for categoricals; date ranges for temporal columns.

**Interactive charts.** Histograms, distributions, and correlation views are generated automatically so users can understand the shape of their data at a glance.

**Data quality score.** A single, composite score summarizes overall dataset health, combining completeness, validity, uniqueness, and consistency into a number that improves as cleaning operations are applied.

**Export cleaned datasets.** Once cleaning is complete, datasets can be exported to CSV or Excel, along with a printable report describing every operation applied.

**Responsive UI and dark mode.** The interface is designed for desktop analytical work but adapts to smaller screens, and includes a fully themed dark mode for extended sessions.

---

## Tech Stack

**Frontend.** The application is built with React and TypeScript, styled with Tailwind CSS, and uses shadcn/ui as its component foundation. Tables are powered by TanStack Table for virtualized rendering of large datasets, and charts are rendered with Recharts.

**Data layer.** CSV parsing uses Papaparse; Excel workbooks are read with SheetJS. Both run in the browser, streaming rows into memory without a server round-trip. Application state is managed with Zustand, and datasets are persisted locally through IndexedDB so sessions survive page reloads.

**Backend services.** For AI-powered cleaning suggestions, a lightweight edge function proxies requests to a language model gateway. No raw dataset content is sent — only anonymized column statistics.

**Deployment.** The project is deployed as a static single-page application on Vercel.

---

## Architecture

The processing pipeline is intentionally linear and easy to reason about. A user uploads a dataset, which enters the parsing layer. The parsed table is passed to the profiling engine, which produces a structured report of quality issues and column statistics. From there, the user works inside the cleaning engine, applying reversible operations that update both the dataset and its profile in real time. Interactive visualizations render alongside the table so the impact of each operation is visible immediately. When the user is satisfied, the export layer produces the final cleaned file along with a summary of every change applied.

```
Upload  →  Profiling  →  Cleaning  →  Visualization  →  Export
```

---

## Project Structure

The codebase is organized around a clear separation between the presentation layer and the data-processing layer. UI components live under a `components` directory, split between generic primitives and application-specific views. Pages and routing live under `pages`. All data-processing logic — parsing, profiling, cleaning operations, exporters, and type inference — lives under a dedicated `lib` folder so it can be tested and reasoned about independently of the UI. State stores, custom hooks, and shared utilities each have their own directories, and static assets are served from `public`.

---

## Installation

Clone the repository, install dependencies, and start the development server:

```bash
git clone https://github.com/Diini03/nadiifi-data.git
cd nadiifi-data
npm install
npm run dev
```

The application will be available at `http://localhost:8080`.

---

## Roadmap

Planned improvements focus on collaboration and automation. Upcoming work includes AI-powered cleaning suggestions that recommend operations based on detected issues, a persistent history view for tracking data quality over time across multiple uploads, team workspaces so analysts can share datasets and cleaning recipes, scheduled imports for recurring data feeds, and native integrations with common cloud storage providers.

---

## Security

Security is grounded in the fact that data processing happens on the client. Uploaded files are validated before parsing to reject malformed or oversized inputs. All user input is sanitized before being rendered or used in operations. Any network communication that does occur — for AI-assisted suggestions — is transmitted over authenticated, protected API routes and never includes raw dataset content.

---

## License

Released under the MIT License.

---

Built with care by Diini Kahiye.
