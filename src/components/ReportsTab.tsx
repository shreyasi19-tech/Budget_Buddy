import React, { useRef, useState } from "react";
import { Transaction, Budget } from "../types";
import {
  FileSpreadsheet,
  Download,
  Upload,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

interface ReportsTabProps {
  transactions: Transaction[];
  budgets: Budget[];
  currency: string;
  onRestoreBackup: (transactions: Transaction[], budgets: Budget[]) => void;
}

export default function ReportsTab({
  transactions,
  budgets,
  currency,
  onRestoreBackup
}: ReportsTabProps) {
  const [statementPeriod, setStatementPeriod] = useState<"all" | "month" | "30days">("all");
  const [restoreFeedback, setRestoreFeedback] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter transactions based on selected statement period
  const filteredTransactions = transactions.filter((t) => {
    if (statementPeriod === "all") return true;
    const txDate = new Date(t.date);
    const now = new Date();
    if (statementPeriod === "month") {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    if (statementPeriod === "30days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return txDate >= thirtyDaysAgo;
    }
    return true;
  });

  // 1. Export Financial Statement as CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const periodLabel = statementPeriod === "month" ? "Current_Month" : statementPeriod === "30days" ? "Last_30_Days" : "All_Time";
    const totalInc = filteredTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExp = filteredTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    // Metadata Statement Header
    const statementMeta = [
      `"FINANCIAL STATEMENT REPORT"`,
      `"Statement Period: ${periodLabel.replace(/_/g, " ")}"`,
      `"Generated On: ${new Date().toLocaleString()}"`,
      `"Total Inflow: ${currency}${totalInc.toFixed(2)}"`,
      `"Total Outflow: ${currency}${totalExp.toFixed(2)}"`,
      `"Net Savings Balance: ${currency}${(totalInc - totalExp).toFixed(2)}"`,
      `""`
    ].join("\n");

    // Headers
    const headers = ["ID", "Type", "Category", "Amount", "Currency", "Date", "Payment Method", "Notes", "Recurring"];
    
    // Rows
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.type.toUpperCase(),
      t.category,
      t.amount.toFixed(2),
      currency,
      t.date,
      t.paymentMethod,
      `"${t.notes.replace(/"/g, '""')}"`,
      t.isRecurring ? `Yes (${t.recurringPeriod})` : "No"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + encodeURIComponent(statementMeta + "\n" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n"));

    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `Statement_${periodLabel}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Export as JSON Local Backup
  const handleExportJSON = () => {
    const backupData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      transactions,
      budgets
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `Budget_Buddy_Backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  // 3. Import / Restore from JSON Backup File
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.transactions || !Array.isArray(parsed.transactions)) {
          throw new Error("Missing transactions list in backup file");
        }
        
        onRestoreBackup(parsed.transactions, parsed.budgets || []);
        setRestoreError(null);
        setRestoreFeedback("Account backup successfully restored! All transaction registers have been synced.");
        
        setTimeout(() => setRestoreFeedback(null), 5000);
      } catch (err: any) {
        setRestoreFeedback(null);
        setOcrErrorState(err.message || "Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const setOcrErrorState = (msg: string) => {
    setRestoreError(msg);
    setTimeout(() => setRestoreError(null), 5000);
  };

  // 4. Generate printer friendly HTML PDF Report
  const handlePrintReport = () => {
    window.print();
  };

  // Summary figures
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Overview Block */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Financial Audit Reports & Backups
          </h3>
          <p className="text-xs text-slate-400 mt-1">Export transaction databases to standard formats or perform secure snapshot recoveries.</p>
        </div>

        {/* Quick Audit Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Aggregate Inflows</span>
              <span className="text-sm font-black text-slate-850 dark:text-white">{currency}{totalIncome.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Aggregate Outflows</span>
              <span className="text-sm font-black text-slate-850 dark:text-white">{currency}{totalExpense.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Net Saved Reserves</span>
              <span className={`text-sm font-black ${netSavings >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {currency}{netSavings.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Formats */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Export Financial Documents
            </h4>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[10px] font-bold">
              <button
                onClick={() => setStatementPeriod("all")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  statementPeriod === "all" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatementPeriod("month")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  statementPeriod === "month" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setStatementPeriod("30days")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  statementPeriod === "30days" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                30 Days
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Generate formatted account statement exports ({filteredTransactions.length} records selected).
          </p>

          <div className="space-y-3 pt-2">
            {/* CSV */}
            <button
              onClick={handleExportCSV}
              disabled={filteredTransactions.length === 0}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 hover:bg-emerald-500/5 hover:border-emerald-500/30 border border-slate-150 dark:border-slate-800 transition-all flex items-center justify-between cursor-pointer group disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white">Export Account Statement (CSV / Excel)</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Includes metadata summary & line items ({statementPeriod})</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
            </button>

            {/* JSON */}
            <button
              onClick={handleExportJSON}
              disabled={transactions.length === 0}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 hover:bg-emerald-500/5 hover:border-emerald-500/30 border border-slate-150 dark:border-slate-800 transition-all flex items-center justify-between cursor-pointer group disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white">Export Full JSON Ledger</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Complete application backup containing budgets & goals</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </button>

            {/* Print Friendly */}
            <button
              onClick={handlePrintReport}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 hover:bg-emerald-500/5 hover:border-emerald-500/30 border border-slate-150 dark:border-slate-800 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white">Print Audit Report (PDF)</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">Generates printer friendly statement of accounts</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </button>
          </div>
        </div>

        {/* Import & Restore / Backup File */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Backup & Snapshot Recovery
          </h4>
          <p className="text-xs text-slate-400">Restore your financial profiles using previous JSON ledgers.</p>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-950 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 rounded-2xl h-44 flex flex-col items-center justify-center text-center p-4 transition-all cursor-pointer group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJSON}
              accept=".json"
              className="hidden"
            />
            <Upload className="w-8 h-8 text-slate-400 dark:text-slate-600 group-hover:text-emerald-500 transition-colors mb-3" />
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Backup File (.json)</h5>
            <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Upload a Budget Buddy JSON statement to overwrite current state instantly.</p>
          </div>

          {/* Feedback */}
          {restoreFeedback && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold leading-relaxed flex items-start gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{restoreFeedback}</span>
            </div>
          )}

          {restoreError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-[11px] text-rose-750 dark:text-rose-400 font-semibold leading-relaxed flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{restoreError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
