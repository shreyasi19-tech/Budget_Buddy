import React, { useState } from "react";
import { Transaction, Budget, UserProfile, TransactionCategory } from "../types";
import SpendingOverviewArea from "./SpendingOverviewArea";
import QuickActionModal from "./QuickActionModal";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Sparkles,
  PlusCircle,
  FileSpreadsheet,
  Bot,
  PieChart,
  ShieldCheck,
  Search,
  Target,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from "lucide-react";

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  profile: UserProfile;
  onQuickAdd: (t: Partial<Transaction>) => void;
  currency: string;
  onSetTab: (tab: string) => void;
  financialHealthScore?: number;
}

export default function Dashboard({
  transactions,
  budgets,
  profile,
  onQuickAdd,
  currency,
  onSetTab,
  financialHealthScore = 82
}: DashboardProps) {
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<"expense" | "income" | "budget" | "goal">("expense");
  const [searchQuery, setSearchQuery] = useState("");

  // Determine Greeting based on hour
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening";

  // Financial Calculations
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;
  const totalSavings = Math.max(0, netBalance);
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  // Month over Month Calculations
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const currentMonthExpenses = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + t.amount, 0);

  const prevMonthExpenses = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(prevMonthStr))
    .reduce((sum, t) => sum + t.amount, 0);

  const momExpenseChangePct = prevMonthExpenses > 0
    ? ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100
    : 0;

  // Prepare Category Expense Data for SVG Donut Chart
  const categoryExpenses: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
    });

  const categoriesList = Object.keys(categoryExpenses)
    .map((cat) => ({
      name: cat as TransactionCategory,
      value: categoryExpenses[cat],
    }))
    .sort((a, b) => b.value - a.value);

  const grandTotalExpense = Object.values(categoryExpenses).reduce((a, b) => a + b, 0) || 1;

  let accumulatedAngle = 0;
  const donutData = categoriesList.map((item, idx) => {
    const percentage = item.value / grandTotalExpense;
    const angle = percentage * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;

    const colors = [
      "#2563eb", // Royal Blue
      "#38bdf8", // Sky Blue
      "#10b981", // Emerald
      "#8b5cf6", // Purple
      "#f59e0b", // Amber
      "#ec4899", // Pink
      "#6366f1", // Indigo
      "#64748b", // Slate
    ];

    return {
      ...item,
      color: colors[idx % colors.length],
      percentage,
      angle,
      startAngle,
    };
  });

  // Recent transactions list with search filter
  const filteredRecentTransactions = transactions
    .filter((t) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.notes.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.amount.toString().includes(q)
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  // Helper for Buddy AI Insights text on Dashboard
  const topExpenseCategory = categoriesList[0]?.name || "Food";
  const topExpensePct = categoriesList[0] ? ((categoriesList[0].value / grandTotalExpense) * 100).toFixed(0) : "0";

  const getBuddyObservation = () => {
    if (transactions.length === 0) {
      return "Welcome to Budget Buddy! Add your first transaction or load sample demo data to see personalized financial insights.";
    }
    if (momExpenseChangePct < 0) {
      return `Awesome job! Your spending is down ${Math.abs(momExpenseChangePct).toFixed(0)}% compared to last month. Your top category is ${topExpenseCategory} (${topExpensePct}%).`;
    }
    if (savingsRate > 20) {
      return `You're maintaining a solid ${savingsRate.toFixed(0)}% savings rate this month! Keep placing surplus cash into your Emergency Fund.`;
    }
    return `Your largest expenditure this month is ${topExpenseCategory}, accounting for ${topExpensePct}% of total spending. Consider reviewing your limit in Budget Planner.`;
  };

  const openActionModal = (type: "expense" | "income" | "budget" | "goal") => {
    setModalInitialType(type);
    setQuickModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. Header & Greeting Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            {greeting}, {profile.name}! <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Here's how your money is looking this month.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onSetTab("reports")}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Statements
          </button>

          <button
            onClick={() => openActionModal("expense")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </header>

      {/* 2. Large Financial Overview Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 text-white p-5 rounded-3xl border border-blue-800/50 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Available Balance</span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div>
            <p className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              {currency}{netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              {netBalance >= 0 ? (
                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Solvent
                </span>
              ) : (
                <span className="text-rose-400 font-bold flex items-center gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" /> Deficit
                </span>
              )}
              <span className="text-slate-400 text-[10px]">Net liquid status</span>
            </div>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Income</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div>
            <p className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              {currency}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Tracked inflows this month</p>
          </div>
        </div>

        {/* Total Spending */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Spending</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>

          <div>
            <p className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-600 dark:text-rose-400">
              {currency}{totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
              {momExpenseChangePct !== 0 && (
                <span className={momExpenseChangePct < 0 ? "text-emerald-500" : "text-rose-500"}>
                  {momExpenseChangePct < 0 ? `↓ ${Math.abs(momExpenseChangePct).toFixed(0)}%` : `↑ ${momExpenseChangePct.toFixed(0)}%`}
                </span>
              )}
              <span className="text-[10px] text-slate-400">vs. last month</span>
            </div>
          </div>
        </div>

        {/* Total Savings Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Savings Rate</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div>
            <p className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-purple-600 dark:text-purple-400">
              {savingsRate.toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              {currency}{totalSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })} surplus saved
            </p>
          </div>
        </div>

      </section>

      {/* 3. Visually Prominent Quick Actions Section */}
      <section className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900 p-4 sm:p-5 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-md shadow-blue-600/25">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Quick Actions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Perform instant entry or configure financial limits</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => openActionModal("expense")}
            className="px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Add Expense
          </button>

          <button
            onClick={() => openActionModal("income")}
            className="px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Add Income
          </button>

          <button
            onClick={() => openActionModal("budget")}
            className="px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" /> Create Budget
          </button>

          <button
            onClick={() => openActionModal("goal")}
            className="px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Target className="w-3.5 h-3.5" /> Add Goal
          </button>
        </div>
      </section>

      {/* 4. HERO FEATURE: BUDDY AI INSIGHTS CARD & FINANCIAL HEALTH SCORE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Buddy AI Insights Card (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 text-white p-6 sm:p-7 rounded-3xl border border-purple-500/30 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-lg shadow-inner">
                  🤖
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                    Buddy's Insights <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                  </h3>
                  <span className="text-[10px] text-purple-300 font-semibold uppercase tracking-wider block">
                    AI Personal Wealth Companion
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/30">
                Gemini Active
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-2">
              <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
                "{getBuddyObservation()}"
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-purple-800/40 flex items-center justify-between relative z-10">
            <span className="text-[11px] text-purple-300/80">Have a question about your budget?</span>
            <button
              onClick={() => onSetTab("assistant")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Bot className="w-4 h-4" /> Ask Buddy AI <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Financial Health Score Widget (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Financial Health</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Solvency & behavior diagnostic</p>
            </div>
            <button
              onClick={() => onSetTab("insights")}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
            >
              Full Diagnostics
            </button>
          </div>

          <div className="flex items-center gap-6">
            {/* Circular score gauge */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 transition-all duration-1000"
                  strokeDasharray={`${financialHealthScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
                  {financialHealthScore}
                </span>
                <span className="text-[9px] text-slate-400 font-sans font-bold">/ 100</span>
              </div>
            </div>

            <div className="space-y-1.5 flex-1">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 inline-block">
                {financialHealthScore >= 80 ? "Healthy Habits 🎉" : "Good Progress 👍"}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                You're building sustainable financial habits. Keep expense limits tight to reach 90+.
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* 5. Visual Analytics Section */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <SpendingOverviewArea
          transactions={transactions}
          currency={currency}
          onSetTab={onSetTab}
          categoriesList={categoriesList}
          grandTotalExpense={grandTotalExpense}
          donutData={donutData}
        />
      </section>

      {/* 6. Recent Transactions Section */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Activity</h3>
            <p className="text-xs text-slate-400">Latest expense and income records</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => onSetTab("transactions")}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 cursor-pointer"
            >
              View All →
            </button>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredRecentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="py-3.5 px-2 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 rounded-2xl transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  tx.type === "income"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}>
                  {tx.type === "income" ? "+" : "−"}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {tx.notes || tx.category}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <span>{tx.category}</span>
                    <span>•</span>
                    <span>{tx.date}</span>
                    <span>•</span>
                    <span>{tx.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-sm font-black font-mono ${
                  tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                }`}>
                  {tx.type === "income" ? "+" : "−"}{currency}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}

          {filteredRecentTransactions.length === 0 && (
            <div className="py-12 text-center space-y-2">
              <span className="text-2xl">🌱</span>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nothing here yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add your first expense or income, and Buddy will start helping you understand your spending patterns.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      <QuickActionModal
        isOpen={quickModalOpen}
        onClose={() => setQuickModalOpen(false)}
        initialType={modalInitialType}
        onAddTransaction={onQuickAdd}
        currency={currency}
      />

    </div>
  );
}
