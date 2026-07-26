import React from "react";
import { ShieldCheck, Lock, EyeOff, Trash2, X, CheckCircle2 } from "lucide-react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Privacy Policy & Data Security</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">BudgetBuddy Commitment to Data Isolation and Trust</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300 pr-1">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl flex items-start gap-3 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              Your financial data is private, user-isolated, and strictly stored under your authenticated account in Firebase Cloud Firestore. We never sell or share user financial data with third parties.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-blue-500" /> 1. Real Authentication & Cloud Database
            </h4>
            <p>
              Authentication is managed via Google Firebase Authentication (Email/Password or OAuth Google Sign-In). All database reads and writes are governed by server-enforced Firestore Security Rules, ensuring strict user data isolation so only you can read or edit your transaction journals, budgets, and savings goals.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <EyeOff className="w-3.5 h-3.5 text-emerald-500" /> 2. Gemini AI Security & Proxy Protection
            </h4>
            <p>
              All AI interactions (receipt scanning, financial health scoring, and chatbot queries) pass through secure server-side proxy routes. API credentials remain hidden from client browsers, and transaction data sent to the AI engine is processed in transient memory solely for response generation.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Trash2 className="w-3.5 h-3.5 text-rose-500" /> 3. Data Control & Account Deletion
            </h4>
            <p>
              You retain total ownership of your records. You can export your financial data to CSV / PDF at any time, or permanently delete your account and all associated Firestore records directly from your Profile & Settings panel.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition-all text-xs"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
