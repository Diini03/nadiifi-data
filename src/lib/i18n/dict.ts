export type Lang = "en" | "so";

export const dict = {
  en: {
    // top bar
    "app.tagline": "Data quality workspace",
    "app.datasetPlaceholder": "No dataset loaded",
    "action.upload": "Upload Dataset",
    "action.clean": "Clean Dataset",
    "action.download": "Download",
    "action.reset": "Reset",
    "action.new": "New file",
    "action.sample": "Try a sample dataset",
    "action.preview": "Preview fix",
    "action.apply": "Apply fix",
    "action.selectAll": "Select all",
    "action.clearSelection": "Clear",
    "action.continueXogArag": "Visualize in XogArag",
    "action.openXogArag": "Open XogArag",

    // rail
    "rail.data": "Data",
    "rail.clean": "Clean",
    "rail.analyze": "Analyze",
    "rail.dashboard": "Dashboard",
    "rail.insights": "Insights",
    "rail.export": "Export",
    "rail.history": "History",
    "rail.settings": "Settings",

    // views
    "view.data.title": "Dataset",
    "view.data.subtitle": "Review columns, types, and raw values.",
    "view.clean.title": "Cleaning Studio",
    "view.clean.subtitle": "Review detected issues and apply fixes.",
    "view.analyze.title": "Analyze",
    "view.analyze.subtitle": "Auto-generated charts and key metrics.",
    "view.dashboard.title": "Dashboard",
    "view.dashboard.subtitle": "KPIs and visuals for at-a-glance reporting.",
    "view.insights.title": "Insights",
    "view.insights.subtitle": "Notable patterns detected in your dataset.",
    "view.export.title": "Export",
    "view.export.subtitle": "Download the cleaned dataset or continue.",

    // kpi
    "kpi.rows": "Rows",
    "kpi.columns": "Columns",
    "kpi.missing": "Missing cells",
    "kpi.duplicates": "Duplicate rows",
    "kpi.quality": "Quality score",
    "kpi.memory": "Memory",
    "kpi.numeric": "Numeric columns",
    "kpi.categorical": "Categorical columns",

    // insights
    "insights.empty": "Load a dataset to see insights.",
    "insights.correlation": "Strong correlation",
    "insights.topCategory": "Dominant category",
    "insights.outliers": "Outliers detected",
    "insights.missingImpact": "High-missing column",
    "insights.constant": "Non-informative column",
    "insights.balanced": "Balanced distribution",

    "empty.needDataset": "Upload a dataset from the Data tab to continue.",


    // empty state
    "empty.title": "Drop a messy dataset to begin",
    "empty.subtitle":
      "NadiifiData inspects your file locally, in your browser. Nothing is uploaded to a server.",
    "empty.cta": "Choose a file",
    "empty.formats": "CSV · TSV · XLSX · XLS",
    "empty.dragHere": "or drag and drop it here",

    // inspecting
    "inspect.title": "Inspecting your dataset",
    "inspect.subtitle": "Running quality checks…",

    // issues panel
    "issues.title": "Issues Found",
    "issues.none": "No issues detected. Your dataset looks clean.",
    "issues.rowsAffected": "rows affected",
    "issues.colsAffected": "cols affected",
    "issues.severity.critical": "Critical",
    "issues.severity.warning": "Warning",
    "issues.severity.info": "Info",
    "issues.recommendation": "Recommendation",
    "issues.selected": "selected",

    // status bar
    "status.rows": "rows",
    "status.cols": "columns",
    "status.score": "Quality",
    "status.lastAction": "Last action",
    "status.ready": "Ready",

    // clean summary
    "clean.title": "Clean-up summary",
    "clean.subtitle": "Here's exactly what changed in your dataset.",
    "clean.rowsBefore": "Rows before",
    "clean.rowsAfter": "Rows after",
    "clean.cellsEdited": "Cells edited",
    "clean.qualityDelta": "Quality change",
    "clean.dismiss": "Continue",

    // export
    "export.title": "Your dataset is ready",
    "export.subtitle":
      "Download the cleaned file or continue straight to visualization.",
    "export.downloadTitle": "Download clean dataset",
    "export.downloadDesc": "Export as CSV, Excel, or JSON.",
    "export.xogTitle": "Continue with XogArag",
    "export.xogDesc":
      "Your dataset is now ready for analysis. Open XogArag to build charts, dashboards, and business insights.",
    "export.split":
      "NadiifiData prepares the data. XogArag analyzes it.",

    // views
    "history.title": "History",
    "history.empty": "No cleaning operations have been recorded yet.",
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.theme": "Theme",
    "settings.clearAll": "Clear all datasets",
    "settings.clearAllDesc":
      "Permanently deletes every dataset and history entry stored locally in your browser.",

    // issue types
    "issue.duplicates": "Duplicate rows",
    "issue.duplicateColumns": "Duplicate columns",
    "issue.emptyRows": "Empty rows",
    "issue.emptyColumns": "Empty columns",
    "issue.missing": "Missing values",
    "issue.whitespace": "Whitespace",
    "issue.casing": "Inconsistent capitalization",
    "issue.email": "Invalid emails",
    "issue.phone": "Invalid phone numbers",
    "issue.date": "Invalid dates",
    "issue.outliers": "Outliers",
    "issue.constant": "Constant column",
    "issue.numericAsText": "Numeric stored as text",
    "issue.encoding": "Encoding issues",
    "issue.inconsistent": "Inconsistent values",
  },
  so: {
    "app.tagline": "Goobta Tayada Xogta",
    "app.datasetPlaceholder": "Xog lama shubin",
    "action.upload": "Soo Geli Xogta",
    "action.clean": "Nadiifi Xogta",
    "action.download": "Soo Dejiso",
    "action.reset": "Dib u dhig",
    "action.new": "Fayl cusub",
    "action.sample": "Tijaabi xog tusaale ah",
    "action.preview": "Fiiri isbedelka",
    "action.apply": "Codso hagaajin",
    "action.selectAll": "Dooro dhammaan",
    "action.clearSelection": "Nadiifi",
    "action.continueXogArag": "Muuji XogArag",
    "action.openXogArag": "Fur XogArag",

    "rail.workspace": "Goobta",
    "rail.history": "Taariikhda",
    "rail.settings": "Habaynta",

    "empty.title": "Soo dhig fayl xog qas ah si aad u bilowdo",
    "empty.subtitle":
      "NadiifiData waxay xogta kaaga baaraysaa gudaha browserkaaga. Waxba server looma dirin.",
    "empty.cta": "Dooro fayl",
    "empty.formats": "CSV · TSV · XLSX · XLS",
    "empty.dragHere": "ama halkan ku soo jiid",

    "inspect.title": "Waxaan baarayaa xogtaada",
    "inspect.subtitle": "Baaritaanka tayada waa socdaa…",

    "issues.title": "Dhibaatooyin La Helay",
    "issues.none": "Wax dhibaato ah lama helin. Xogtaadu waa nadiif.",
    "issues.rowsAffected": "safaf saameyn",
    "issues.colsAffected": "tiirar saameyn",
    "issues.severity.critical": "Halis",
    "issues.severity.warning": "Digniin",
    "issues.severity.info": "Ogeysiin",
    "issues.recommendation": "Talo",
    "issues.selected": "la doortay",

    "status.rows": "safaf",
    "status.cols": "tiirar",
    "status.score": "Tayada",
    "status.lastAction": "Ficilkii u dambeeyay",
    "status.ready": "Diyaar",

    "clean.title": "Warbixinta nadiifinta",
    "clean.subtitle": "Kani waa waxa xogtaada ku dhacay si sax ah.",
    "clean.rowsBefore": "Safaf hore",
    "clean.rowsAfter": "Safaf dambe",
    "clean.cellsEdited": "Unug la bedelay",
    "clean.qualityDelta": "Isbeddel tayo",
    "clean.dismiss": "Sii wad",

    "export.title": "Xogtaadu waa diyaar",
    "export.subtitle":
      "Soo deji faylka nadiif ah ama si toos ah ugu gudub falanqaynta.",
    "export.downloadTitle": "Soo deji xogta nadiif ah",
    "export.downloadDesc": "U dhoofi CSV, Excel, ama JSON.",
    "export.xogTitle": "Ku sii wad XogArag",
    "export.xogDesc":
      "Xogtaadu hadda waa diyaar u tahay falanqaynta. Fur XogArag si aad u dhisto jaantusyo iyo warbixin ganacsi.",
    "export.split":
      "NadiifiData waxay diyaarisaa xogta. XogArag ayaa falanqaynaya.",

    "history.title": "Taariikhda",
    "history.empty": "Wax hawlaha nadiifinta ah lama diiwaan gelin weli.",
    "settings.title": "Habaynta",
    "settings.language": "Luuqad",
    "settings.theme": "Muuqaal",
    "settings.clearAll": "Tirtir dhammaan xogaha",
    "settings.clearAllDesc":
      "Waxaa si joogto ah loo tirtirayaa dhammaan xogaha iyo taariikhda ku kaydsan browserkaaga.",

    "issue.duplicates": "Safaf isku mid ah",
    "issue.duplicateColumns": "Tiirar isku mid ah",
    "issue.emptyRows": "Safaf madhan",
    "issue.emptyColumns": "Tiirar madhan",
    "issue.missing": "Qiimeyaal maqan",
    "issue.whitespace": "Boos aan loo baahnayn",
    "issue.casing": "Xarfo aan is-mid ahayn",
    "issue.email": "Iimayl aan sax ahayn",
    "issue.phone": "Telefoon aan sax ahayn",
    "issue.date": "Taariikh aan sax ahayn",
    "issue.outliers": "Qiimeyaal ka baxsan",
    "issue.constant": "Tiir aan is-bedelin",
    "issue.numericAsText": "Nambaro qoraal ahaan loo kaydiyay",
    "issue.encoding": "Dhibaato xarfeed",
    "issue.inconsistent": "Qiimeyaal aan is-mid ahayn",
  },
} as const;

export type TranslationKey = keyof typeof dict["en"];
