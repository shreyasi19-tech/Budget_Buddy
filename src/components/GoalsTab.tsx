import React, { useState } from "react";
import { SavingGoal, Subscription, EmergencyFund } from "../types";
import {
  Target,
  Plus,
  Trash2,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  PiggyBank,
  AlertCircle
} from "lucide-react";

interface GoalsTabProps {
  savingGoals: SavingGoal[];
  onAddGoal: (g: SavingGoal) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateGoalAmount: (id: string, amount: number) => void;
  subscriptions: Subscription[];
  onAddSubscription: (s: Subscription) => void;
  onDeleteSubscription: (id: string) => void;
  emergencyFund: EmergencyFund;
  onUpdateEmergencyFund: (current: number, target: number) => void;
  currency: string;
}

export default function GoalsTab({
  savingGoals,
  onAddGoal,
  onDeleteGoal,
  onUpdateGoalAmount,
  subscriptions,
  onAddSubscription,
  onDeleteSubscription,
  emergencyFund,
  onUpdateEmergencyFund,
  currency
}: GoalsTabProps) {
  // Goal States
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [goalDepositAmount, setGoalDepositAmount] = useState<Record<string, string>>({});

  // Subscription States
  const [subName, setSubName] = useState("");
  const [subAmount, setSubAmount] = useState("");
  const [subCycle, setSubCycle] = useState<"monthly" | "yearly">("monthly");
  const [subBillingDate, setSubBillingDate] = useState("");

  // Emergency Fund States
  const [fundTarget, setFundTarget] = useState(emergencyFund.target.toString());
  const [fundCurrent, setFundCurrent] = useState(emergencyFund.current.toString());

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTarget || isNaN(Number(goalTarget))) return;

    onAddGoal({
      id: Math.random().toString(36).substring(2, 9),
      name: goalName,
      targetAmount: Math.abs(Number(goalTarget)),
      currentAmount: 0,
      deadline: goalDeadline || new Date().toISOString().split("T")[0]
    });

    setGoalName("");
    setGoalTarget("");
    setGoalDeadline("");
  };

  const handleDeposit = (id: string) => {
    const amt = Number(goalDepositAmount[id] || 0);
    if (isNaN(amt) || amt <= 0) return;
    onUpdateGoalAmount(id, amt);
    setGoalDepositAmount((prev) => ({ ...prev, [id]: "" }));
  };

  const handleAddSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName || !subAmount || isNaN(Number(subAmount))) return;

    onAddSubscription({
      id: Math.random().toString(36).substring(2, 9),
      name: subName,
      amount: Math.abs(Number(subAmount)),
      category: "Bills",
      billingCycle: subCycle,
      nextBillingDate: subBillingDate || new Date().toISOString().split("T")[0]
    });

    setSubName("");
    setSubAmount("");
    setSubBillingDate("");
  };

  const handleSaveFund = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEmergencyFund(Number(fundCurrent) || 0, Number(fundTarget) || 0);
  };

  // Calculations
  const totalGoalTarget = savingGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalCurrent = savingGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalMonthlySubs = subscriptions.reduce((sum, s) => {
    return sum + (s.billingCycle === "monthly" ? s.amount : s.amount / 12);
  }, 0);

  const emergencyPct = emergencyFund.target > 0 ? (emergencyFund.current / emergencyFund.target) * 100 : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
              Wealth Milestones & Safety Nets
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Savings Goals & Emergency Fund
          </h2>
          <p className="text-xs text-blue-200 max-w-xl">
            Track future purchases, build a 3-6 month safety buffer, and audit recurring subscriptions in one centralized hub.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">Total Goal Progress</span>
            <span className="text-base font-extrabold font-mono text-white">
              {currency}{totalGoalCurrent.toLocaleString()} / {currency}{totalGoalTarget.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Section 1: Emergency Fund Safety Net */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Emergency Fund & Safety Net
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recommended 3-6 months of essential living expenses saved.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-500/20">
              {emergencyPct >= 100 ? "Fully Funded 🎉" : `${emergencyPct.toFixed(0)}% Saved`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-7 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Buffer</span>
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {currency}{emergencyFund.current.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ {currency}{emergencyFund.target.toLocaleString()}</span>
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min(100, emergencyPct)}%` }}
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              💡 <span className="font-semibold text-slate-700 dark:text-slate-300">Buddy's Tip:</span> Keep your emergency fund in a high-yield savings account for quick access during unforeseen events.
            </p>
          </div>

          {/* Fund Edit Form */}
          <form onSubmit={handleSaveFund} className="md:col-span-5 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Update Emergency Buffer
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Current ({currency})</label>
                <input
                  type="number"
                  value={fundCurrent}
                  onChange={(e) => setFundCurrent(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Target ({currency})</label>
                <input
                  type="number"
                  value={fundTarget}
                  onChange={(e) => setFundTarget(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Update Safety Net
            </button>
          </form>

        </div>
      </section>

      {/* Grid Section 2: Savings Goals Cards & Form */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Goals List (col-span-2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-blue-600" /> Savings Goals
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {savingGoals.length} Active Goals
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savingGoals.map((g) => {
              const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
              const remaining = Math.max(0, g.targetAmount - g.currentAmount);

              return (
                <div
                  key={g.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          🎯 {g.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Deadline: {g.deadline || "Ongoing"}
                        </span>
                      </div>

                      <button
                        onClick={() => onDeleteGoal(g.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex justify-between items-baseline font-mono">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {currency}{g.currentAmount.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400">
                        / {currency}{g.targetAmount.toLocaleString()}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                        <span>{pct.toFixed(0)}% Complete</span>
                        <span>{currency}{remaining.toLocaleString()} left</span>
                      </div>
                    </div>
                  </div>

                  {/* Add Deposit Control */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <input
                      type="number"
                      placeholder={`Deposit (${currency})`}
                      value={goalDepositAmount[g.id] || ""}
                      onChange={(e) => setGoalDepositAmount({ ...goalDepositAmount, [g.id]: e.target.value })}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleDeposit(g.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                    >
                      + Deposit
                    </button>
                  </div>
                </div>
              );
            })}

            {savingGoals.length === 0 && (
              <div className="col-span-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                <Target className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Savings Goals Set Yet 🌱</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Create your first goal (e.g., Laptop, Travel, Emergency Fund) using the form on the right.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Goal Form */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 h-fit">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Plus className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Create New Savings Goal
            </h3>
          </div>

          <form onSubmit={handleAddGoalSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Goal Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. New Laptop, Vacation"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Target Amount ({currency})
              </label>
              <input
                type="number"
                required
                placeholder="1000"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              + Save Goal
            </button>
          </form>
        </div>

      </section>

      {/* Grid Section 3: Subscriptions Tracker */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Recurring Subscriptions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track monthly recurring services (Netflix, Spotify, Cloud Storage).
              </p>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-500/20 px-4 py-2 rounded-2xl text-right">
            <span className="text-[10px] font-bold text-purple-400 uppercase block">Total Monthly Cost</span>
            <span className="text-sm font-black font-mono text-purple-600 dark:text-purple-300">
              {currency}{totalMonthlySubs.toFixed(2)} / mo
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Subscriptions List */}
          <div className="lg:col-span-2 space-y-3">
            {subscriptions.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between hover:border-slate-200 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 font-bold flex items-center justify-center text-sm">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {s.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Next billing: {s.nextBillingDate} ({s.billingCycle})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-extrabold font-mono text-purple-600 dark:text-purple-400">
                    {currency}{s.amount}
                  </span>
                  <button
                    onClick={() => onDeleteSubscription(s.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {subscriptions.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                No active subscriptions tracked yet. Add your Netflix, Spotify, or Cloud services.
              </div>
            )}
          </div>

          {/* Add Subscription Form */}
          <form onSubmit={handleAddSubSubmit} className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Add New Subscription
            </h4>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Service Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Netflix, iCloud"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Amount ({currency})</label>
                <input
                  type="number"
                  required
                  placeholder="15"
                  value={subAmount}
                  onChange={(e) => setSubAmount(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cycle</label>
                <select
                  value={subCycle}
                  onChange={(e) => setSubCycle(e.target.value as "monthly" | "yearly")}
                  className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Next Billing Date</label>
              <input
                type="date"
                value={subBillingDate}
                onChange={(e) => setSubBillingDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              + Track Subscription
            </button>
          </form>

        </div>
      </section>

    </div>
  );
}
