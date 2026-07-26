import React, { useState } from "react";
import { UserProfile, SavingGoal, Subscription, EmergencyFund } from "../types";
import {
  User,
  Target,
  CreditCard,
  Plus,
  Trash2,
  TrendingUp,
  AlertCircle,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
  CheckCircle2,
  Calendar,
  Zap,
  ArrowUpRight,
  Shield,
  Layers,
  Check
} from "lucide-react";
import PrivacyPolicyModal from "./PrivacyPolicyModal";

interface ProfileSettingsTabProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
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
  onDeleteAccountAndData?: () => void;
  onLoadDemoData?: () => void;
}

export default function ProfileSettingsTab({
  profile,
  onUpdateProfile,
  savingGoals,
  onAddGoal,
  onDeleteGoal,
  onUpdateGoalAmount,
  subscriptions,
  onAddSubscription,
  onDeleteSubscription,
  emergencyFund,
  onUpdateEmergencyFund,
  currency,
  onDeleteAccountAndData,
  onLoadDemoData
}: ProfileSettingsTabProps) {
  // Navigation sub-tab inside settings
  const [activeTab, setActiveTab] = useState<"overview" | "account" | "goals" | "subscriptions" | "emergency">("overview");

  // 1. Profile States
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [selCurrency, setSelCurrency] = useState(profile.currency);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // 2. Goal States
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [goalDepositAmount, setGoalDepositAmount] = useState<Record<string, string>>({});

  // 3. Subscription States
  const [subName, setSubName] = useState("");
  const [subAmount, setSubAmount] = useState("");
  const [subCycle, setSubCycle] = useState<"monthly" | "yearly">("monthly");
  const [subBillingDate, setSubBillingDate] = useState("");

  // 4. Emergency Fund States
  const [fundTarget, setFundTarget] = useState(emergencyFund.target.toString());
  const [fundCurrent, setFundCurrent] = useState(emergencyFund.current.toString());

  // 5. Privacy & Deletion States
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync state when props change
  React.useEffect(() => {
    setFundTarget(emergencyFund.target.toString());
    setFundCurrent(emergencyFund.current.toString());
  }, [emergencyFund.target, emergencyFund.current]);

  React.useEffect(() => {
    setSelCurrency(profile.currency);
    setName(profile.name);
    setEmail(profile.email);
  }, [profile]);

  // Submits
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name,
      email,
      currency: selCurrency
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !goalTarget) return;

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

  const handleGoalDeposit = (id: string) => {
    const depAmt = Number(goalDepositAmount[id] || 0);
    if (isNaN(depAmt) || depAmt <= 0) return;
    onUpdateGoalAmount(id, depAmt);
    setGoalDepositAmount((prev) => ({ ...prev, [id]: "" }));
  };

  const handleAddSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName || !subAmount) return;

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

  // Derived calculations
  const totalSubMonthlyCost = subscriptions.reduce((acc, s) => {
    return acc + (s.billingCycle === "yearly" ? s.amount / 12 : s.amount);
  }, 0);

  const totalGoalsProgress = savingGoals.length > 0
    ? savingGoals.reduce((acc, g) => acc + (g.currentAmount / (g.targetAmount || 1)), 0) / savingGoals.length * 100
    : 0;

  const emergencyFundPercent = Math.min(100, (Number(fundCurrent) / (Number(fundTarget) || 1)) * 100);

  return (
    <div className="space-y-6">

      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Avatar Circle with Badge */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 p-1 shadow-lg">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white text-2xl font-black uppercase font-mono">
                  {profile.name ? profile.name.charAt(0) : "U"}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] text-slate-950 font-bold" title="Active Account">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  {profile.name || "Budget Buddy User"}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                  Pro Member
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                {profile.email || "user@example.com"}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Cloud Sync Active
                </span>
                <span>•</span>
                <span>Base Currency: <strong className="text-indigo-300">{currency}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 bg-slate-900/60 backdrop-blur-md p-3 rounded-2xl border border-slate-800/80">
            <div className="px-3 py-2 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Savings Goals</span>
              <span className="text-base font-extrabold text-white font-mono">{savingGoals.length}</span>
            </div>
            <div className="px-3 py-2 text-center border-x border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Subscriptions</span>
              <span className="text-base font-extrabold text-white font-mono">{subscriptions.length}</span>
            </div>
            <div className="px-3 py-2 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Emergency</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">{emergencyFundPercent.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          {[
            { id: "overview", label: "Overview & Controls", icon: Layers },
            { id: "account", label: "Account Profile", icon: User },
            { id: "goals", label: "Savings Goals", icon: Target },
            { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
            { id: "emergency", label: "Emergency Reserves", icon: PiggyBank },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? "bg-white text-slate-900 shadow-md font-extrabold"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic View Sections */}

      {/* OVERVIEW / ALL CONTROLS VIEW */}
      {(activeTab === "overview" || activeTab === "account") && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Account & Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your display name, account email, and base transaction currency.
              </p>
            </div>
            {isSavedNotice && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 animate-fadeIn">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Base Currency Symbol
                </label>
                <select
                  value={selCurrency}
                  onChange={(e) => setSelCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="$">USD ($)</option>
                  <option value="₹">INR (₹)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                  <option value="¥">JPY (¥)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  ⚡ Auto-converts existing transactions and budget limits when changed.
                </p>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  id="save-account-btn"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Save Profile Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* EMERGENCY FUND SECTION */}
      {(activeTab === "overview" || activeTab === "emergency") && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-emerald-500" />
                Emergency Reserve Tracker
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set aside emergency liquidity for unforeseen expenses.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-extrabold self-start sm:self-auto font-mono">
              {emergencyFundPercent.toFixed(0)}% Funded
            </span>
          </div>

          <form onSubmit={handleSaveFund} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Saved Reserves ({currency})
              </label>
              <input
                type="number"
                required
                value={fundCurrent}
                onChange={(e) => setFundCurrent(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Reserve Target ({currency})
              </label>
              <input
                type="number"
                required
                value={fundTarget}
                onChange={(e) => setFundTarget(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Update Reserves
            </button>
          </form>

          {/* Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${emergencyFundPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
              <span>{currency}{Number(fundCurrent).toLocaleString()} Saved</span>
              <span>Target: {currency}{Number(fundTarget).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* SAVINGS GOALS SECTION */}
      {(activeTab === "overview" || activeTab === "goals") && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                Active Savings Goals
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Plan major purchases and deposit funds toward deadlines.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30">
              {savingGoals.length} Goals
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Create Goal Form (4 cols) */}
            <form onSubmit={handleAddGoal} className="lg:col-span-4 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3.5">
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider block">
                + Create Savings Goal
              </span>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vacation Trip to Japan"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Target Amount ({currency})
                </label>
                <input
                  type="number"
                  required
                  placeholder="2500"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Target Deadline
                </label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" /> Save Goal
              </button>
            </form>

            {/* Goals List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {savingGoals.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
                  No active savings goals registered yet. Use the form to add one!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savingGoals.map((g) => {
                    const percent = Math.min(100, (g.currentAmount / (g.targetAmount || 1)) * 100);

                    return (
                      <div
                        key={g.id}
                        className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-extrabold text-slate-900 dark:text-white text-xs">
                              {g.name}
                            </h5>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Target: {currency}{g.targetAmount.toLocaleString()}
                            </span>
                          </div>
                          <button
                            onClick={() => onDeleteGoal(g.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Delete Goal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                            <span>{percent.toFixed(0)}% Saved ({currency}{g.currentAmount.toLocaleString()})</span>
                            <span>Due: {g.deadline}</span>
                          </div>
                        </div>

                        {/* Deposit Control */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                          <input
                            type="number"
                            placeholder="Deposit Amount"
                            value={goalDepositAmount[g.id] || ""}
                            onChange={(e) => setGoalDepositAmount((prev) => ({ ...prev, [g.id]: e.target.value }))}
                            className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:outline-none"
                          />
                          <button
                            onClick={() => handleGoalDeposit(g.id)}
                            className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 cursor-pointer shrink-0"
                          >
                            + Deposit
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBSCRIPTION TRACKER SECTION */}
      {(activeTab === "overview" || activeTab === "subscriptions") && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-500" />
                Active Subscriptions & Recurring Bills
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Track recurring software, streaming services, and utility bills.
              </p>
            </div>
            <div className="px-3.5 py-1.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-bold font-mono self-start sm:self-auto">
              Est. Monthly: {currency}{totalSubMonthlyCost.toFixed(2)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Subscription Form (4 cols) */}
            <form onSubmit={handleAddSub} className="lg:col-span-4 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3.5">
              <span className="text-xs font-bold text-purple-500 uppercase tracking-wider block">
                + Register Subscription
              </span>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Service / Provider
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Spotify, Gym"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Billing Amount ({currency})
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="14.99"
                  value={subAmount}
                  onChange={(e) => setSubAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Billing Cycle
                </label>
                <select
                  value={subCycle}
                  onChange={(e) => setSubCycle(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold cursor-pointer"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Next Due Date
                </label>
                <input
                  type="date"
                  value={subBillingDate}
                  onChange={(e) => setSubBillingDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20"
              >
                <Plus className="w-4 h-4" /> Save Tracker
              </button>
            </form>

            {/* Subscriptions List (8 cols) */}
            <div className="lg:col-span-8 space-y-3">
              {subscriptions.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
                  No subscriptions or recurring bill trackers registered yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/30 dark:bg-slate-950/40">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm font-mono shrink-0">
                          {sub.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-extrabold text-slate-900 dark:text-white text-xs">
                            {sub.name}
                          </h5>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="font-bold uppercase tracking-wider text-purple-500">
                              {sub.billingCycle}
                            </span>
                            <span>•</span>
                            <span>Next: {sub.nextBillingDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                          {currency}{sub.amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => onDeleteSubscription(sub.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECURITY, DATA PRIVACY & ACTION TILES */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
          Security, Data & System Tools
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Privacy Policy Launcher */}
          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-all cursor-pointer group"
          >
            <Lock className="w-5 h-5 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
            <h5 className="font-bold text-xs text-slate-900 dark:text-white">Privacy Policy</h5>
            <p className="text-[11px] text-slate-400 mt-1">Review encryption & cloud security guarantees.</p>
          </button>

          {/* Load Sample Demo Data */}
          {onLoadDemoData && (
            <button
              type="button"
              onClick={onLoadDemoData}
              className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-all cursor-pointer group"
            >
              <Sparkles className="w-5 h-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <h5 className="font-bold text-xs text-slate-900 dark:text-white">Load Demo Entries</h5>
              <p className="text-[11px] text-slate-400 mt-1">Populate realistic test transactions and goals.</p>
            </button>
          )}

          {/* Delete Account */}
          {onDeleteAccountAndData && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-left transition-all cursor-pointer group"
            >
              <Trash2 className="w-5 h-5 text-rose-500 mb-2 group-hover:scale-110 transition-transform" />
              <h5 className="font-bold text-xs text-rose-600 dark:text-rose-400">Delete Account & Data</h5>
              <p className="text-[11px] text-rose-400 mt-1">Permanently erase all user cloud records.</p>
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <PrivacyPolicyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />

      {/* Account Deletion Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Account & Data?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete your account and all associated transaction journals, budgets, and savings goals from Firestore? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteAccountAndData?.();
                }}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md transition-colors"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
