import React, { useState, useEffect } from "react";
import { Transaction, Budget, SavingGoal, EmergencyFund } from "../types";
import {
  Sparkles,
  TrendingUp,
  Percent,
  Compass,
  AlertTriangle,
  Lightbulb,
  Cpu,
  RefreshCw,
  Heart,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Target
} from "lucide-react";

interface AiInsightsTabProps {
  transactions: Transaction[];
  budgets: Budget[];
  savingGoals?: SavingGoal[];
  emergencyFund?: EmergencyFund;
  currency: string;
  onRefreshHealthScore: (score: number) => void;
}

interface InsightsData {
  insights: string[];
  savingTips: { tip: string; amount: number }[];
  categoryRisks?: { category: string; risk: string; advice: string }[];
  predictedSpending: number;
  healthScore: number;
  healthRationale: string;
  warning?: string;
}

export default function AiInsightsTab({
  transactions,
  budgets,
  savingGoals = [],
  emergencyFund = { current: 0, target: 0 },
  currency,
  onRefreshHealthScore
}: AiInsightsTabProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InsightsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch insights from Express backend API
  const fetchInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions,
          budgets,
          savingGoals,
          emergencyFund
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to consult Gemini advisor. Please try again.");
      }

      const resData: InsightsData = await response.json();
      setData(resData);
      
      // Update global health score in App.tsx
      if (resData.healthScore !== undefined) {
        onRefreshHealthScore(resData.healthScore);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during AI analysis.");
    } finally {
      setLoading(false);
    }
  };

  // Initial trigger
  useEffect(() => {
    fetchInsights();
  }, [transactions.length]); // Re-fetch only when transactions size changes or manual trigger

  return (
    <div className="space-y-6">
      {/* Upper dynamic header card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-teal-900 to-emerald-950 text-white rounded-3xl shadow-xl relative overflow-hidden">
        {/* Floating background mesh blur */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Personalized AI Advisor
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Gemini Spend Diagnostics & Insights
          </h2>
          <p className="text-teal-100 text-xs max-w-xl leading-relaxed">
            Budget Buddy uses advanced Google Gemini 3.6 Flash models to synthesize spending habits, check budget limits, and forecast next month's outflow cash flow.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="relative z-10 px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-50 disabled:bg-slate-100 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer border border-transparent select-none disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 text-slate-800 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 text-slate-800" />
          )}
          {loading ? "Analyzing..." : "Re-Analyze Profile"}
        </button>
      </div>

      {/* Warning check if API key is in simulation mode */}
      {data?.warning && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl flex items-start gap-3 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-amber-850 dark:text-amber-400 uppercase tracking-wider">
              Gemini Simulation Fallback
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {data.warning} Budget Buddy is showing custom, rule-backed finance simulation logs. Setup your genuine API key to connect to Gemini instantly.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 rounded-2xl text-xs text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !data ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Evaluating Financial Ledger...</p>
            <p className="text-xs text-slate-400 max-w-xs">Checking category limits, computing savings rates, and structuring smart recommendations.</p>
          </div>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Insights list - takes 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Spending Diagnostics */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4.5 h-4.5 text-emerald-500" /> Spend Diagnostics & Observations
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.insights.map((insight, idx) => (
                  <div key={idx} className="py-3.5 flex items-start gap-3 first:pt-0 last:pb-0">
                    <span className="w-5 h-5 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs font-semibold text-slate-750 dark:text-slate-300 leading-relaxed">
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Savings Suggestions */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4.5 h-4.5 text-teal-500" /> Smart Savings Suggestions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.savingTips.map((tipObj, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 rounded-2xl flex flex-col justify-between hover:shadow-sm transition-all space-y-3">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                      {tipObj.tip}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Potential Monthly Savings</span>
                      <span className="text-xs font-extrabold text-teal-500">
                        +{currency}{tipObj.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Predictive Forecast + Health Score detail */}
          <div className="space-y-6">
            {/* Health Score Gauge detail */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Financial Health Diagnosis
                </h4>
              </div>

              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg width="120" height="120" className="transform -rotate-90">
                  <circle cx="60" cy="60" r="45" fill="transparent" stroke="#f1f5f9" strokeWidth="8" className="dark:stroke-slate-800" />
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * data.healthScore) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-850 dark:text-white leading-none">
                    {data.healthScore}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">/ 100 rating</span>
                </div>
              </div>

              <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800/80 text-left">
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Diagnostic Rationale</span>
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-350 leading-relaxed mt-1">
                  {data.healthRationale}
                </p>
              </div>
            </div>

            {/* AI Cash Outflow Predictive Forecast */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4.5 h-4.5 text-emerald-500 animate-pulse" /> Outflow Prediction
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Estimated next-month expenditure forecasting</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 rounded-2xl text-center space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Predicted Next Month Outflow</span>
                <h3 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
                  {currency}{data.predictedSpending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider block mt-1 bg-emerald-50 dark:bg-emerald-950/20 py-0.5 rounded">
                  Calculated based on historic velocity
                </span>
              </div>

              <p className="text-[10px] text-slate-400/80 leading-relaxed">
                Prediction uses linear trend regressions on your previous spending speed. Control category budgets to push the forecasted spending downwards.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
