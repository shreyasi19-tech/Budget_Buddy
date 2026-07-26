import React, { useState } from "react";
import { Transaction, TransactionCategory, PaymentMethod } from "../types";
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit3,
  Calendar,
  Layers,
  CreditCard,
  X,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";

interface TransactionsTabProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (updated: Transaction) => void;
  currency: string;
}

export default function TransactionsTab({
  transactions,
  onDeleteTransaction,
  onEditTransaction,
  currency,
}: TransactionsTabProps) {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [methodFilter, setMethodFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  
  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState<TransactionCategory>("Food");
  const [editMethod, setEditMethod] = useState<PaymentMethod>("UPI/Bank");

  // Filter Categories list
  const categories: string[] = ["All", "Food", "Shopping", "Bills", "Transport", "Entertainment", "Healthcare", "Education", "Income", "Others"];
  const paymentMethods: string[] = ["All", "Cash", "Card", "UPI/Bank", "Others"];

  // Filter & Sort Logic
  const filteredTransactions = transactions
    .filter((tx) => {
      const matchSearch = tx.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === "All" || tx.category === categoryFilter;
      const matchMethod = methodFilter === "All" || tx.paymentMethod === methodFilter;
      const matchType = typeFilter === "All" || tx.type === typeFilter;
      return matchSearch && matchCategory && matchMethod && matchType;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
      if (sortBy === "oldest") return a.date.localeCompare(b.date) || a.id.localeCompare(b.id);
      if (sortBy === "highest") return b.amount - a.amount;
      if (sortBy === "lowest") return a.amount - b.amount;
      return 0;
    });

  // Handle Edit Action
  const startEditing = (tx: Transaction) => {
    setEditingId(tx.id);
    setEditNotes(tx.notes);
    setEditAmount(tx.amount.toString());
    setEditCategory(tx.category);
    setEditMethod(tx.paymentMethod);
  };

  const saveEdit = (id: string) => {
    if (!editAmount || isNaN(Number(editAmount))) return;
    const originalTx = transactions.find((t) => t.id === id);
    if (!originalTx) return;

    const updated: Transaction = {
      ...originalTx,
      notes: editNotes || originalTx.notes,
      amount: Math.abs(Number(editAmount)),
      category: editCategory,
      paymentMethod: editMethod,
    };

    onEditTransaction(updated);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-5 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
          Filter & Query Logs
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search note memos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
          >
            <option value="All">All Types (Income & Expense)</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
          >
            {paymentMethods.map((meth) => (
              <option key={meth} value={meth}>
                {meth === "All" ? "All Payment Channels" : meth}
              </option>
            ))}
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-medium"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="highest">Sort: Highest Amount</option>
            <option value="lowest">Sort: Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Results logs table/list card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-850 dark:text-white">
              Financial Registry Journals
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Showing {filteredTransactions.length} filtered entries</p>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center space-y-3 text-slate-400">
            <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-sm font-semibold">No journal matching your criteria</p>
            <p className="text-xs text-slate-400">Try adjusting your filters, searching other words, or adding transaction logs.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredTransactions.map((tx) => {
              const isEditing = editingId === tx.id;
              
              return (
                <div key={tx.id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-950/10 transition-colors">
                  {isEditing ? (
                    /* EDIT MODE INLINE FORM */
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Notes</label>
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Amount ({currency})</label>
                        <input
                          type="number"
                          step="any"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Category</label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as TransactionCategory)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                        >
                          <option value="Food">Food</option>
                          <option value="Shopping">Shopping</option>
                          <option value="Bills">Bills</option>
                          <option value="Transport">Transport</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Education">Education</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                      <div className="space-y-1 flex items-end gap-2">
                        <button
                          onClick={() => saveEdit(tx.id)}
                          className="px-3.5 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* VIEW MODE CARD */
                    <>
                      <div className="flex items-start gap-3.5">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black shrink-0 ${
                          tx.type === "income"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-rose-500/10 text-rose-500"
                        }`}>
                          {tx.type === "income" ? "IN" : "OUT"}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 dark:text-white text-sm">
                            {tx.notes}
                          </h5>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400 font-medium">
                            <span className="bg-slate-150 dark:bg-slate-800 text-[10px] px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold">
                              {tx.category}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-slate-450">
                              <CreditCard className="w-3.5 h-3.5" /> {tx.paymentMethod}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-slate-450">
                              <Calendar className="w-3.5 h-3.5" /> {tx.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-3 md:pt-0 border-slate-100 dark:border-slate-800/50">
                        {tx.isRecurring && (
                          <span className="text-[9px] font-bold text-indigo-500 uppercase bg-indigo-50 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded">
                            Recurring
                          </span>
                        )}
                        <div className="text-left md:text-right">
                          <span className={`text-base font-black ${
                            tx.type === "income" ? "text-emerald-500" : "text-slate-900 dark:text-white"
                          }`}>
                            {tx.type === "income" ? "+" : "-"}{currency}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Edit/Delete control trigger */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => startEditing(tx)}
                            title="Edit transaction log"
                            className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            title="Delete transaction log"
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
