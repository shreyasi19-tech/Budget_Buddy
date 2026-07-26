import React, { useState, useRef, useEffect } from "react";
import { Transaction, TransactionCategory, PaymentMethod } from "../types";
import {
  Upload,
  Camera,
  Trash2,
  Sparkles,
  RefreshCw,
  FileText,
  AlertCircle,
  X,
  Plus,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Zap,
  ClipboardCheck,
  Check
} from "lucide-react";

interface AddTransactionTabProps {
  onAddTransaction: (t: Transaction) => void;
  currency: string;
}

interface ExtractedBillData {
  merchant?: string;
  date?: string;
  amount?: number;
  category?: TransactionCategory;
  notes?: string;
  confidence?: string;
}

export default function AddTransactionTab({ onAddTransaction, currency }: AddTransactionTabProps) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState<TransactionCategory>("Food");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI/Bank");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPeriod, setRecurringPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  
  // OCR Scan states
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [extractedDetails, setExtractedDetails] = useState<ExtractedBillData | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global paste handler for pasting screenshots directly (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result as string;
              setUploadedImage(base64String);
              triggerOcrScan(base64String, file.type || "image/png");
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Handle local submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    const newTx: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      category: type === "income" ? "Income" : category,
      amount: Math.abs(Number(amount)),
      date,
      paymentMethod,
      notes: notes || `${type === "income" ? "Income Log" : category + " Expense"}`,
      isRecurring,
      recurringPeriod: isRecurring ? recurringPeriod : undefined,
      receiptImage: uploadedImage || undefined
    };

    onAddTransaction(newTx);

    // Reset Form
    setAmount("");
    setNotes("");
    setUploadedImage(null);
    setScanResult(null);
    setExtractedDetails(null);
    setIsRecurring(false);
  };

  // Convert file to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setUploadedImage(base64String);
      triggerOcrScan(base64String, file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);
  };

  // Generate a sample synthetic receipt canvas for quick testing
  const handleTrySampleBill = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 520;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw receipt background
    ctx.fillStyle = "#faf9f6";
    ctx.fillRect(0, 0, 400, 520);

    ctx.fillStyle = "#10b981";
    ctx.fillRect(0, 0, 400, 10);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "center";
    ctx.fillText("ORGANIC FOOD MARKET", 200, 50);

    ctx.font = "12px monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText("123 Green Street, Suite 400", 200, 72);
    ctx.fillText("TEL: (555) 019-2834", 200, 88);

    ctx.strokeStyle = "#cbd5e1";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(30, 105);
    ctx.lineTo(370, 105);
    ctx.stroke();

    const todayStr = new Date().toISOString().split("T")[0];
    ctx.textAlign = "left";
    ctx.fillStyle = "#334155";
    ctx.font = "12px monospace";
    ctx.fillText(`DATE: ${todayStr}`, 30, 128);
    ctx.fillText("INV #: INV-8829", 250, 128);

    ctx.fillText("ITEM", 30, 160);
    ctx.fillText("QTY", 250, 160);
    ctx.fillText("PRICE", 320, 160);

    ctx.beginPath();
    ctx.moveTo(30, 170);
    ctx.lineTo(370, 170);
    ctx.stroke();

    ctx.fillText("Fresh Organic Apples", 30, 200);
    ctx.fillText("2", 250, 200);
    ctx.fillText("$8.50", 320, 200);

    ctx.fillText("Almond Milk 1L", 30, 225);
    ctx.fillText("1", 250, 225);
    ctx.fillText("$4.99", 320, 225);

    ctx.fillText("Whole Wheat Bread", 30, 250);
    ctx.fillText("1", 250, 250);
    ctx.fillText("$3.80", 320, 250);

    ctx.fillText("Greek Yogurt 500g", 30, 275);
    ctx.fillText("2", 250, 275);
    ctx.fillText("$7.20", 320, 275);

    ctx.fillText("Avocado Bag 4ct", 30, 300);
    ctx.fillText("1", 250, 300);
    ctx.fillText("$5.50", 320, 300);

    ctx.setLineDash([]);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, 330);
    ctx.lineTo(370, 330);
    ctx.stroke();

    ctx.font = "bold 14px monospace";
    ctx.fillText("SUBTOTAL:", 30, 360);
    ctx.fillText("$29.99", 320, 360);

    ctx.fillText("TAX (8%):", 30, 385);
    ctx.fillText("$2.40", 320, 385);

    ctx.font = "bold 18px monospace";
    ctx.fillStyle = "#047857";
    ctx.fillText("GRAND TOTAL:", 30, 425);
    ctx.fillText("$32.39", 310, 425);

    ctx.fillStyle = "#64748b";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Thank you for shopping green!", 200, 470);

    const sampleBase64 = canvas.toDataURL("image/jpeg");
    setUploadedImage(sampleBase64);
    triggerOcrScan(sampleBase64, "image/jpeg");
  };

  // Trigger server-side OCR Receipt Scanner
  const triggerOcrScan = async (base64DataUrl: string, mimeType: string) => {
    setScanning(true);
    setOcrError(null);
    setScanResult(null);
    setExtractedDetails(null);

    try {
      const base64Raw = base64DataUrl.includes(",") ? base64DataUrl.split(",")[1] : base64DataUrl;
      
      const response = await fetch("/api/ai/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64: base64Raw,
          mimeType: mimeType || "image/jpeg"
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to scan image. Please try another file.");
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const details: ExtractedBillData = {
        merchant: data.merchant,
        date: data.date,
        amount: data.amount,
        category: data.category as TransactionCategory,
        notes: data.notes,
        confidence: data.confidence || "High"
      };
      setExtractedDetails(details);

      if (data.amount !== undefined && !isNaN(Number(data.amount))) {
        setAmount(Number(data.amount).toString());
      }
      if (data.date) setDate(data.date);
      if (data.category) setCategory(data.category as TransactionCategory);
      if (data.merchant || data.notes) {
        const memo = data.merchant ? `Paid to ${data.merchant}${data.notes ? ' - ' + data.notes : ''}` : data.notes;
        setNotes(memo || "");
      }
      
      setScanResult("High Precision Scan Complete! Form fields autofilled successfully.");
      
    } catch (err: any) {
      console.error("AI Scan Error:", err);
      setOcrError(err.message || "Failed to extract receipt text. Ensure file is readable or enter manually.");
    } finally {
      setScanning(false);
    }
  };

  // Drag and drop helper
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedImage(base64String);
        triggerOcrScan(base64String, file.type || "image/jpeg");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Main Manual Input Form */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Add Financial Log Entry
            </h3>
            <p className="text-xs text-slate-400 mt-1">Manual entry with support for recurring rules and receipt files</p>
          </div>
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> High Precision
          </span>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* Outflow/Inflow toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Log Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType("expense");
                  if (category === "Income") setCategory("Food");
                }}
                className={`py-3 rounded-xl text-sm font-bold uppercase tracking-wider border-2 transition-all cursor-pointer text-center ${
                  type === "expense"
                    ? "bg-rose-50/50 dark:bg-rose-950/25 border-rose-500 text-rose-500"
                    : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600"
                }`}
              >
                Expense (Outflow)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("income");
                  setCategory("Income");
                }}
                className={`py-3 rounded-xl text-sm font-bold uppercase tracking-wider border-2 transition-all cursor-pointer text-center ${
                  type === "income"
                    ? "bg-emerald-50/50 dark:bg-emerald-950/25 border-emerald-500 text-emerald-500"
                    : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600"
                }`}
              >
                Income (Inflow)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Transaction Amount ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                  {currency}
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Budget Category
              </label>
              <select
                disabled={type === "income"}
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all cursor-pointer"
              >
                {type === "income" ? (
                  <option value="Income">Income / Salary</option>
                ) : (
                  <>
                    <option value="Food">Food & Dining</option>
                    <option value="Shopping">Shopping & Fashion</option>
                    <option value="Bills">Bills & Utilities</option>
                    <option value="Transport">Transport & Auto</option>
                    <option value="Entertainment">Entertainment & Travel</option>
                    <option value="Healthcare">Healthcare & Fitness</option>
                    <option value="Education">Education & Courses</option>
                    <option value="Others">Others / Misc</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Transaction Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all cursor-pointer"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all cursor-pointer"
              >
                <option value="UPI/Bank">UPI / Net Banking</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="Cash">Cash Account</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Payment Memo / Notes
            </label>
            <textarea
              placeholder="e.g. Weekly grocery check at Whole Foods"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-sm"
            />
          </div>

          {/* Recurring rule block */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Recurring Transaction Rule
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5">Automate logging of repeating income or bill subscriptions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="sr-only peer cursor-pointer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {isRecurring && (
              <div className="mt-3 grid grid-cols-2 gap-4 animate-fadeIn">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Repeat Cycle
                  </label>
                  <select
                    value={recurringPeriod}
                    onChange={(e) => setRecurringPeriod(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            id="manual-add-submit-btn"
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-sm"
          >
            <Plus className="w-5 h-5" /> Save Log Entry
          </button>
        </form>
      </div>

      {/* Right Column: AI Receipt Scanner (OCR) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                AI Receipt Scanner
              </h4>
              <p className="text-[10px] text-slate-400">Scan physical receipts with real-time OCR</p>
            </div>
          </div>

          {/* Drag & Drop Canvas */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-4 transition-all cursor-pointer relative group ${
              scanning
                ? "border-emerald-500 bg-emerald-500/5"
                : "border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-950 hover:bg-slate-50/50 dark:hover:bg-slate-950/20"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {scanning ? (
              <div className="space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 animate-pulse">Scanning Receipt Image...</p>
                  <p className="text-[10px] text-slate-400">Gemini AI is extracting merchant, totals, dates & categories.</p>
                </div>
              </div>
            ) : uploadedImage ? (
              <div className="absolute inset-0 p-2">
                <img
                  src={uploadedImage}
                  alt="Receipt Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl opacity-70 group-hover:opacity-40 transition-opacity"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedImage(null);
                    setScanResult(null);
                    setOcrError(null);
                  }}
                  className="absolute top-4 right-4 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-rose-500 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <RefreshCw className="w-8 h-8 text-emerald-500 bg-white/80 p-1.5 rounded-full shadow-lg" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-8 h-8 text-slate-400 dark:text-slate-600 group-hover:text-emerald-500 transition-colors mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Drag & drop your receipt here</p>
                  <p className="text-[10px] text-slate-400">Or click to search folders (PNG, JPG supported)</p>
                </div>
              </div>
            )}
          </div>

          {/* OCR Feedback Boxes */}
          {scanResult && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold leading-relaxed flex items-start gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{scanResult}</span>
            </div>
          )}

          {ocrError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-[11px] text-rose-750 dark:text-rose-400 font-semibold leading-relaxed flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{ocrError}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-6 space-y-2">
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <AlertCircle className="w-3 h-3 text-amber-500" />
            <span>OCR Tips:</span>
          </div>
          <p className="text-[10px] text-slate-400/80 leading-relaxed">
            Ensure receipt images are taken from a top-down angle under clear lighting. Blurred images might cause extraction faults.
          </p>
        </div>
      </div>
    </div>
  );
}
