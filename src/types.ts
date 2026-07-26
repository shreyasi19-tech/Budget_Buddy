export type TransactionCategory =
  | "Food"
  | "Shopping"
  | "Bills"
  | "Transport"
  | "Entertainment"
  | "Healthcare"
  | "Education"
  | "Income"
  | "Others";

export type PaymentMethod = "Cash" | "Card" | "UPI/Bank" | "Others";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes: string;
  receiptImage?: string; // Base64 string
  isRecurring?: boolean;
  recurringPeriod?: "daily" | "weekly" | "monthly" | "yearly";
}

export interface Budget {
  category: TransactionCategory;
  limit: number;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  category: TransactionCategory;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: string;
}

export interface EmergencyFund {
  target: number;
  current: number;
}

export interface UserProfile {
  name: string;
  email: string;
  currency: string; // $, €, ₹, £, etc.
  avatar?: string;
  joinedAt: string;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "alert";
  timestamp: string;
  isRead: boolean;
}
