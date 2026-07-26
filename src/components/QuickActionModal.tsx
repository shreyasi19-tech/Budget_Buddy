import React, { useState } from "react";
import { Transaction, TransactionCategory, PaymentMethod, SavingGoal, Budget } from "../types";
import {
  X,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Target,
  Sliders,
  DollarSign
} from "lucide-react";

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: "expense" | "income" | "budget" | "goal";
  onAddTransaction: (t: Partial<Transaction>) => void;
  onAddGoal?: (g: SavingGoal) => void;
  onUpdateBudget?: (b: Budget) => void;
  currency: string;
}

export default function QuickActionModal({
  isOpen,
  onClose,
  initialType = "expense",
  onAddTransaction,
  onAddGoal,
  onUpdateBudget,
  currency
}: QuickActionModalProps) {
  const [activeType, setActiveType] = useState<"expense" | "income" | "budget" | "goal">(initialType);

  // Transaction form states
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("Food");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI/Bank");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Goal form states
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  // Budget form states
  const [budgetLimit, setBudgetLimit] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeType === "expense" || activeType === "income") {
      if (!amount || isNaN(Number(amount))) return;
      onAddTransaction({
        type: activeType,
        category: activeType === "income" ? "Income" : category,
        amount: Math.abs(Number(amount)),
        date,
        paymentMethod,
        notes: notes.trim() || `${activeType === "income" ? "Income" : category} entry`
      });
    } else if (activeType === "goal" && onAddGoal) {
      if (!goalName || !goalTarget || isNaN(Number(goalTarget))) return;
      onAddGoal({
        id: Math.random().toString(36).substring(2, 9),
        name: goalName,
        targetAmount: Math.abs(Number(goalTarget)),
        currentAmount: 0,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      });
    } else if (activeType === "budget" && onUpdateBudget) {
      if (!budgetLimit || isNaN(Number(budgetLimit))) return;
      onUpdateBudget({
        category,
        limit: Math.abs(Number(budgetLimit))
      });
    }

    // Reset and close
    setAmount("");
    setNotes("");
    setGoalName("");
    setGoalTarget("");
    setBudgetLimit("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Quick Financial Action
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Action Tabs */}
          <div className="grid grid-cols-4 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveType("expense")}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                activeType === "expense"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Expense</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveType("income")}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                activeType === "income"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Income</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveType("budget")}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                activeType === "budget"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Budget</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveType("goal")}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                activeType === "goal"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Goal</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {(activeType === "expense" || activeType === "income") && (
              <>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Amount ({currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-mono font-bold text-slate-400 text-sm">
                      {currency}
                    </span>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {activeType === "expense" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Food">Food & Dining</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Bills">Bills & Utilities</option>
                      <option value="Transport">Transportation</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UPI/Bank">UPI / Bank Transfer</option>
                      <option value="Card">Credit/Debit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Notes / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grocery trip, Coffee"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {activeType === "budget" && (
              <>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Select Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Food">Food & Dining</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Bills">Bills & Utilities</option>
                    <option value="Transport">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Monthly Budget Cap ({currency})
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {activeType === "goal" && (
              <>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Laptop, Emergency Fund"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Target Savings Amount ({currency})
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1000"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className={`w-full py-3 px-4 font-bold text-xs text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeType === "expense"
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/25"
                  : activeType === "income"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25"
                  : activeType === "budget"
                  ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/25"
                  : "bg-purple-600 hover:bg-purple-500 shadow-purple-600/25"
              }`}
            >
              Confirm & Save
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}
