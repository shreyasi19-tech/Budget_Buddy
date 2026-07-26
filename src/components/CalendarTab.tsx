import React, { useState } from "react";
import { Transaction } from "../types";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  DollarSign,
  AlertCircle,
  Clock,
  X
} from "lucide-react";

interface CalendarTabProps {
  transactions: Transaction[];
  currency: string;
}

export default function CalendarTab({ transactions, currency }: CalendarTabProps) {
  // Use current system date or let user toggle month
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayLog, setSelectedDayLog] = useState<{ date: string; logs: Transaction[] } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Days calculations
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // Day of week (0-6)
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // Total days

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyPads = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Toggle months helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get expenses aggregated per day
  const getDayExpenseSum = (dayNum: number): number => {
    const formattedDay = dayNum.toString().padStart(2, "0");
    const formattedMonth = (month + 1).toString().padStart(2, "0");
    const targetDateStr = `${year}-${formattedMonth}-${formattedDay}`;

    return transactions
      .filter((t) => t.type === "expense" && t.date === targetDateStr)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // View logs for a specific day
  const handleDayClick = (dayNum: number) => {
    const formattedDay = dayNum.toString().padStart(2, "0");
    const formattedMonth = (month + 1).toString().padStart(2, "0");
    const targetDateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const logs = transactions.filter((t) => t.date === targetDateStr);
    setSelectedDayLog({
      date: targetDateStr,
      logs: logs
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid - takes 2 cols */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-5 md:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Financial Calendar view
            </h3>
            <p className="text-xs text-slate-400">Map and aggregate daily transactions visually</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/40 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-white dark:hover:bg-slate-850 rounded-lg transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-3 text-slate-800 dark:text-slate-250">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-white dark:hover:bg-slate-850 rounded-lg transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-1.5 min-h-[300px]">
          {/* Empty placeholders for offset */}
          {emptyPads.map((idx) => (
            <div key={`pad-${idx}`} className="p-1 bg-slate-50/20 dark:bg-slate-950/5 rounded-xl border border-transparent" />
          ))}

          {/* Actual days */}
          {daysArray.map((day) => {
            const expenseSum = getDayExpenseSum(day);
            const hasExpense = expenseSum > 0;
            
            return (
              <button
                key={`day-${day}`}
                onClick={() => handleDayClick(day)}
                className="p-1.5 min-h-[50px] bg-slate-50/40 dark:bg-slate-950/10 hover:bg-emerald-500/10 border border-slate-100/50 dark:border-slate-800/40 rounded-xl transition-all flex flex-col justify-between items-start cursor-pointer group text-left"
              >
                <span className="text-xs font-bold text-slate-500 group-hover:text-emerald-500">
                  {day}
                </span>

                {hasExpense && (
                  <span className="text-[9px] font-extrabold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-1 py-0.5 rounded w-full truncate text-center">
                    -{currency}{expenseSum >= 1000 ? `${(expenseSum / 1000).toFixed(1)}k` : expenseSum.toFixed(0)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Slide/Card: Selected Day Logs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm flex flex-col justify-between">
        {selectedDayLog ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Logs for {selectedDayLog.date}
                </h4>
              </div>
              <button
                onClick={() => setSelectedDayLog(null)}
                className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-950"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedDayLog.logs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">
                No transactions registered on this day.
              </p>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {selectedDayLog.logs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        log.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      }`}>
                        {log.category}
                      </span>
                      <span className={`text-xs font-black ${
                        log.type === "income" ? "text-emerald-500" : "text-slate-850 dark:text-white"
                      }`}>
                        {log.type === "income" ? "+" : "-"}{currency}{log.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {log.notes}
                    </p>
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium">
                      <span>Method: {log.paymentMethod}</span>
                      {log.isRecurring && <span>(Recurring)</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
            <Info className="w-10 h-10 text-slate-300 dark:text-slate-700 animate-pulse" />
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">No Day Selected</h5>
            <p className="text-[10px] text-slate-400 max-w-[200px]">
              Click on any day in the calendar grid to expand details of that day's financial transactions.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-6 space-y-1.5">
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Sandbox Calendar Period:</span>
          </div>
          <p className="text-[10px] text-slate-400/80 leading-relaxed">
            The calendar automatically matches the current year and system month. Switch months to view historic logging records.
          </p>
        </div>
      </div>
    </div>
  );
}
