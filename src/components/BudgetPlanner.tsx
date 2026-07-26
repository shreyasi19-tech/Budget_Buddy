import React, { useState } from "react";
import { Budget, Transaction, TransactionCategory } from "../types";
import {
  Sliders,
  RefreshCw,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Utensils,
  ShoppingBag,
  Receipt,
  Car,
  Film,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  DollarSign,
  TrendingDown,
  ShieldAlert,
  Edit2
} from "lucide-react";

interface BudgetPlannerProps {
  budgets: Budget[];
  transactions: Transaction[];
  onUpdateBudget: (category: TransactionCategory, limit: number) => void;
  onApplyAllBenchmarks?: () => void;
  currency: string;
}

export default function BudgetPlanner({
  budgets,
  transactions,
  onUpdateBudget,
  currency
}: BudgetPlannerProps) {
  const categories: TransactionCategory[] = [
    "Food",
    "Shopping",
    "Bills",
    "Transport",
    "Entertainment",
    "Healthcare",
    "Education",
    "Others"
  ];

  const categoryIcons: Record<TransactionCategory, any> = {
    Food: Utensils,
    Shopping: ShoppingBag,
    Bills: Receipt,
    Transport: Car,
    Entertainment: Film,
    Healthcare: HeartPulse,
    Education: GraduationCap,
    Income: DollarSign,
    Others: MoreHorizontal
  };

  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>("Food");
  const [newLimit, setNewLimit] = useState("");
  const [filter, setFilter] = useState<"all" | "alert" | "warning" | "healthy">("all");

  // Calculate actual spending per category for transactions
  const categorySpending: Record<TransactionCategory, number> = {} as any;
  categories.forEach((cat) => {
    categorySpending[cat] = 0;
  });

  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      if (categorySpending[t.category] !== undefined) {
        categorySpending[t.category] += Number(t.amount) || 0;
      }
    });

  // Helper to get limit for a category
  const getCategoryLimit = (cat: TransactionCategory): number => {
    const b = budgets.find((item) => item.category === cat);
    return b ? b.limit : 0;
  };

  // Status calculator
  const getCategoryStatus = (spent: number, limit: number) => {
    if (limit <= 0) {
      return {
        type: "none",
        label: "No Budget Set",
        badgeBg: "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700",
        barBg: "bg-slate-300 dark:bg-slate-700",
        remaining: 0,
        percent: 0,
        cardBorder: "border-slate-200/80 dark:border-slate-800"
      };
    }

    const remaining = limit - spent;
    const percent = Math.min(Math.round((spent / limit) * 100), 999);

    if (spent > limit) {
      return {
        type: "alert", // RED
        label: `Exceeded by ${currency}${(spent - limit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
        barBg: "bg-rose-500",
        remaining,
        percent,
        cardBorder: "border-rose-500/40 dark:border-rose-500/40 shadow-rose-500/5"
      };
    } else if (spent >= limit * 0.8) {
      return {
        type: "warning", // YELLOW / AMBER
        label: `Close to Limit (${percent}% spent)`,
        badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
        barBg: "bg-amber-500",
        remaining,
        percent,
        cardBorder: "border-amber-500/40 dark:border-amber-500/40 shadow-amber-500/5"
      };
    } else {
      return {
        type: "healthy", // GREEN
        label: `On Track (${percent}% spent)`,
        badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        barBg: "bg-emerald-500",
        remaining,
        percent,
        cardBorder: "border-slate-200/80 dark:border-slate-800"
      };
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLimit || isNaN(Number(newLimit))) return;

    onUpdateBudget(selectedCategory, Math.abs(Number(newLimit)));
    setNewLimit("");
  };

  const selectForEdit = (cat: TransactionCategory) => {
    setSelectedCategory(cat);
    const currLimit = getCategoryLimit(cat);
    if (currLimit > 0) {
      setNewLimit(currLimit.toString());
    } else {
      setNewLimit("");
    }
    // Scroll to form smoothly
    document.getElementById("budget-form-card")?.scrollIntoView({ behavior: "smooth" });
  };

  // Calculate high-level summary metrics
  let totalBudget = 0;
  let totalSpentInBudgeted = 0;
  let overBudgetCount = 0;
  let warningCount = 0;

  categories.forEach((cat) => {
    const limit = getCategoryLimit(cat);
    const spent = categorySpending[cat] || 0;
    if (limit > 0) {
      totalBudget += limit;
      totalSpentInBudgeted += spent;
      if (spent > limit) overBudgetCount++;
      else if (spent >= limit * 0.8) warningCount++;
    }
  });

  const totalRemaining = totalBudget - totalSpentInBudgeted;

  // Selected category state for live spotlight
  const selectedLimit = getCategoryLimit(selectedCategory);
  const selectedSpent = categorySpending[selectedCategory] || 0;
  const selectedStatus = getCategoryStatus(selectedSpent, selectedLimit);

  // Filtered categories grid
  const filteredCategories = categories.filter((cat) => {
    const limit = getCategoryLimit(cat);
    const spent = categorySpending[cat] || 0;
    const status = getCategoryStatus(spent, limit);

    if (filter === "all") return true;
    if (filter === "alert") return status.type === "alert";
    if (filter === "warning") return status.type === "warning";
    if (filter === "healthy") return status.type === "healthy";
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Budget Management Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Set category limits. Track remaining balances and get color-coded alerts in real-time.
          </p>
        </div>

        {/* Global Summary Stats */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Budget Cap</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
              {currency}{totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Spent</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
              {currency}{totalSpentInBudgeted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className={`px-4 py-2 rounded-2xl border text-right ${
            totalRemaining < 0
              ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
              : totalSpentInBudgeted >= totalBudget * 0.8 && totalBudget > 0
              ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">Total Remaining</span>
            <span className="text-sm font-extrabold font-mono">
              {currency}{totalRemaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form & Category Spotlight */}
      <div id="budget-form-card" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Configure Budget Form (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Sliders className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Set Category Budget
                </h4>
                <p className="text-[11px] text-slate-400">Choose category and assign a monthly cap limit</p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  1. Select Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as TransactionCategory)}
                  className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-semibold"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  2. Monthly Budget Cap ({currency})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 500"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                    {currency}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                id="update-budget-btn"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Save Budget Cap
              </button>
            </form>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>
              Transactions added in this category will automatically update the remaining budget balance in real-time.
            </span>
          </div>
        </div>

        {/* Selected Category Spotlight Portal (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Selected Category Live Portal
              </span>
              <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${selectedStatus.badgeBg}`}>
                {selectedStatus.type === "alert" && <AlertTriangle className="w-3.5 h-3.5" />}
                {selectedStatus.type === "warning" && <ShieldAlert className="w-3.5 h-3.5" />}
                {selectedStatus.type === "healthy" && <CheckCircle2 className="w-3.5 h-3.5" />}
                {selectedStatus.label}
              </span>
            </div>

            {/* Spotlight Header */}
            <div className="flex items-center gap-3.5 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl shrink-0">
                {React.createElement(categoryIcons[selectedCategory] || MoreHorizontal, { className: "w-6 h-6" })}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedCategory} Budget
                </h3>
                <p className="text-xs text-slate-400">
                  {transactions.filter((t) => t.type === "expense" && t.category === selectedCategory).length} transactions recorded
                </p>
              </div>
            </div>

            {/* 3 Metric Cards for Selected Category */}
            <div className="grid grid-cols-3 gap-3 my-5">
              
              {/* Budget Cap */}
              <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950/80 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Budget Cap
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono block">
                  {currency}{selectedLimit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Total Spent */}
              <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950/80 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Total Spent
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono block">
                  {currency}{selectedSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Budget Left */}
              <div className={`p-3.5 rounded-2xl border ${
                selectedLimit <= 0
                  ? "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500"
                  : selectedSpent > selectedLimit
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                  : selectedSpent >= selectedLimit * 0.8
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block mb-1">
                  Budget Left
                </span>
                <span className="text-sm font-extrabold font-mono block">
                  {selectedLimit > 0
                    ? `${currency}${(selectedLimit - selectedSpent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "Not Set"}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            {selectedLimit > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>Usage Progress</span>
                  <span>{selectedStatus.percent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${selectedStatus.barBg}`}
                    style={{ width: `${Math.min(selectedStatus.percent, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Color legend guide */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-semibold text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> &lt;80% (Safe - Green)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> 80%-100% (Near Limit - Yellow)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> &gt;100% (Crossed Limit - Red)
            </span>
          </div>
        </div>

      </div>

      {/* Filter Tabs for All Category Portals */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          Category Portals ({filteredCategories.length})
        </h3>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filter === "all" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setFilter("alert")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filter === "alert" ? "bg-rose-500 text-white shadow-xs" : "text-rose-500 hover:bg-rose-500/10"
            }`}
          >
            🚨 Red ({overBudgetCount})
          </button>
          <button
            onClick={() => setFilter("warning")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filter === "warning" ? "bg-amber-500 text-white shadow-xs" : "text-amber-500 hover:bg-amber-500/10"
            }`}
          >
            ⚠️ Yellow ({warningCount})
          </button>
          <button
            onClick={() => setFilter("healthy")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filter === "healthy" ? "bg-emerald-500 text-white shadow-xs" : "text-emerald-500 hover:bg-emerald-500/10"
            }`}
          >
            ✅ Green
          </button>
        </div>
      </div>

      {/* Grid of All Category Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.map((cat) => {
          const limit = getCategoryLimit(cat);
          const spent = categorySpending[cat] || 0;
          const status = getCategoryStatus(spent, limit);
          const Icon = categoryIcons[cat] || MoreHorizontal;
          const remaining = limit - spent;
          const isSelected = selectedCategory === cat;

          return (
            <div
              key={cat}
              className={`bg-white dark:bg-slate-900 rounded-3xl border p-5 transition-all shadow-xs flex flex-col justify-between space-y-4 ${status.cardBorder} ${
                isSelected ? "ring-2 ring-blue-500" : ""
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {cat}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Budget Cap: {limit > 0 ? `${currency}${limit.toLocaleString()}` : "Not set"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => selectForEdit(cat)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  title="Adjust Budget Cap"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Budget Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${status.badgeBg}`}>
                  {status.type === "alert" && <AlertTriangle className="w-3.5 h-3.5" />}
                  {status.type === "warning" && <ShieldAlert className="w-3.5 h-3.5" />}
                  {status.type === "healthy" && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {status.label}
                </span>

                <span className="text-[11px] font-bold text-slate-400 font-mono">
                  {status.percent}% used
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${status.barBg}`}
                  style={{ width: `${Math.min(status.percent, 100)}%` }}
                />
              </div>

              {/* Financial Metrics Row */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Spent</span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">
                    {currency}{spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    {remaining < 0 ? "Over Budget" : "Budget Left"}
                  </span>
                  <span className={`text-xs font-extrabold font-mono ${
                    limit <= 0
                      ? "text-slate-400"
                      : remaining < 0
                      ? "text-rose-500"
                      : status.type === "warning"
                      ? "text-amber-500"
                      : "text-emerald-500"
                  }`}>
                    {limit > 0
                      ? `${currency}${Math.abs(remaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : "Set cap above"}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => selectForEdit(cat)}
                className="w-full py-2 bg-slate-50 hover:bg-blue-50 dark:bg-slate-950 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                {limit > 0 ? "Edit Budget Limit" : "+ Set Budget Limit"}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}

