import { TransactionCategory } from "../types";

export const CURRENCY_RATES: Record<string, number> = {
  "$": 1.0,
  "₹": 83.5,
  "€": 0.92,
  "£": 0.78,
  "¥": 155.0
};

export const convertAmount = (amount: number, oldCurr: string, newCurr: string): number => {
  const oldRate = CURRENCY_RATES[oldCurr] || 1.0;
  const newRate = CURRENCY_RATES[newCurr] || 1.0;
  if (oldRate === newRate) return amount;
  const inUSD = amount / oldRate;
  const converted = inUSD * newRate;
  if (newCurr === "¥") {
    return Math.round(converted);
  }
  return Number(converted.toFixed(2));
};

export interface CategoryBenchmark {
  id: string;
  categoryLabel: string;
  appCategory?: TransactionCategory;
  minUSD: number;
  maxUSD: number;
  defaultUSD: number;
  isSavings?: boolean;
}

export const CATEGORY_BENCHMARKS: CategoryBenchmark[] = [
  {
    id: "rent_emi",
    categoryLabel: "Rent / Home EMI",
    appCategory: "Bills",
    minUSD: 155,
    maxUSD: 259,
    defaultUSD: 207
  },
  {
    id: "groceries_food",
    categoryLabel: "Groceries & Food",
    appCategory: "Food",
    minUSD: 104,
    maxUSD: 155,
    defaultUSD: 130
  },
  {
    id: "shopping",
    categoryLabel: "Shopping",
    appCategory: "Shopping",
    minUSD: 31,
    maxUSD: 73,
    defaultUSD: 52
  },
  {
    id: "utilities",
    categoryLabel: "Utilities & Internet",
    appCategory: "Bills",
    minUSD: 31,
    maxUSD: 52,
    defaultUSD: 42
  },
  {
    id: "transport",
    categoryLabel: "Transport",
    appCategory: "Transport",
    minUSD: 41,
    maxUSD: 83,
    defaultUSD: 62
  },
  {
    id: "healthcare",
    categoryLabel: "Healthcare",
    appCategory: "Healthcare",
    minUSD: 21,
    maxUSD: 41,
    defaultUSD: 31
  },
  {
    id: "education",
    categoryLabel: "Education",
    appCategory: "Education",
    minUSD: 31,
    maxUSD: 104,
    defaultUSD: 68
  },
  {
    id: "entertainment",
    categoryLabel: "Subscriptions & Entertainment",
    appCategory: "Entertainment",
    minUSD: 10,
    maxUSD: 31,
    defaultUSD: 20
  },
  {
    id: "savings",
    categoryLabel: "Savings / Emergency Fund",
    isSavings: true,
    minUSD: 83,
    maxUSD: 155,
    defaultUSD: 120
  },
  {
    id: "miscellaneous",
    categoryLabel: "Miscellaneous",
    appCategory: "Others",
    minUSD: 21,
    maxUSD: 52,
    defaultUSD: 37
  }
];

export const DEFAULT_CATEGORY_LIMITS_USD: Record<TransactionCategory, number> = {
  Food: 130,        // Groceries & Food ($104-$155)
  Shopping: 52,     // Shopping ($31-$73)
  Bills: 249,       // Rent/Home EMI ($155-$259) + Utilities ($31-$52)
  Transport: 62,    // Transport ($41-$83)
  Entertainment: 20,// Subscriptions & Entertainment ($10-$31)
  Healthcare: 31,   // Healthcare ($21-$41)
  Education: 68,    // Education ($31-$104)
  Others: 37,       // Miscellaneous ($21-$52)
  Income: 0
};
