import React, { useState, useEffect } from "react";
import {
  Transaction,
  Budget,
  SavingGoal,
  Subscription,
  EmergencyFund,
  UserProfile,
  SmartNotification,
  TransactionCategory
} from "./types";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import AddTransactionTab from "./components/AddTransactionTab";
import TransactionsTab from "./components/TransactionsTab";
import BudgetPlanner from "./components/BudgetPlanner";
import CalendarTab from "./components/CalendarTab";
import AiInsightsTab from "./components/AiInsightsTab";
import AssistantChatTab from "./components/AssistantChatTab";
import ReportsTab from "./components/ReportsTab";
import ProfileSettingsTab from "./components/ProfileSettingsTab";
import GoalsTab from "./components/GoalsTab";
import BrandLogo from "./components/BrandLogo";

import {
  auth,
  db,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  onSnapshot,
  deleteUser
} from "./lib/firebase";

import {
  LayoutDashboard,
  PlusCircle,
  FileSpreadsheet,
  Sliders,
  Calendar as CalendarIcon,
  Sparkles,
  Bot,
  Settings,
  Bell,
  LogOut,
  X,
  Menu,
  AlertTriangle,
  Target
} from "lucide-react";

import {
  convertAmount,
  DEFAULT_CATEGORY_LIMITS_USD,
  CURRENCY_RATES
} from "./lib/budgetBenchmarks";

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [emergencyFund, setEmergencyFund] = useState<EmergencyFund>({ current: 0, target: 0 });
  
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [financialHealthScore, setFinancialHealthScore] = useState(80);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // 1. Firebase Auth & Firestore Realtime Sync
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsDemoMode(false);
        const uid = firebaseUser.uid;

        // Fetch User Profile
        const userDocRef = doc(db, "users", uid);
        const userSnap = await getDoc(userDocRef);
        let userProf: UserProfile;
        if (userSnap.exists()) {
          userProf = userSnap.data() as UserProfile;
        } else {
          userProf = {
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
            email: firebaseUser.email || "",
            currency: "$",
            joinedAt: new Date().toISOString().split("T")[0]
          };
          await setDoc(userDocRef, userProf);
        }
        setProfile(userProf);

        // Realtime Transactions Listener
        const txsQuery = query(collection(db, "transactions"), where("userId", "==", uid));
        const unsubTxs = onSnapshot(txsQuery, (snapshot) => {
          const list: Transaction[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              type: data.type,
              category: data.category,
              amount: Number(data.amount) || 0,
              date: data.date,
              paymentMethod: data.paymentMethod || "UPI/Bank",
              notes: data.notes || "",
              receiptImage: data.receiptImage,
              isRecurring: data.isRecurring,
              recurringPeriod: data.recurringPeriod
            });
          });
          // Sort descending by date
          list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setTransactions(list);
          runNotificationAudit(list, budgets, subscriptions, savingGoals, userProf.currency);
        });

        // Realtime Budgets Listener
        const bdsQuery = query(collection(db, "budgets"), where("userId", "==", uid));
        const unsubBudgets = onSnapshot(bdsQuery, (snapshot) => {
          const list: Budget[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              category: data.category,
              limit: Number(data.limit) || 0
            });
          });

          if (list.length > 0) {
            setBudgets(list);
          } else {
            // Seed default proportional USD benchmark category limits for new user
            const defaultCats: TransactionCategory[] = ["Food", "Shopping", "Bills", "Transport", "Entertainment", "Healthcare", "Education", "Others"];
            const curr = userProf.currency || "$";
            const defaults: Budget[] = defaultCats.map((cat) => ({
              category: cat,
              limit: convertAmount(DEFAULT_CATEGORY_LIMITS_USD[cat] || 100, "$", curr)
            }));

            defaults.forEach(async (b) => {
              const ref = doc(collection(db, "budgets"));
              await setDoc(ref, { ...b, userId: uid });
            });
            setBudgets(defaults);
          }
        });

        // Realtime Goals Listener
        const goalsQuery = query(collection(db, "goals"), where("userId", "==", uid));
        const unsubGoals = onSnapshot(goalsQuery, (snapshot) => {
          const list: SavingGoal[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              name: data.name || data.title || "Goal",
              targetAmount: Number(data.targetAmount) || 0,
              currentAmount: Number(data.currentAmount) || 0,
              deadline: data.deadline || data.targetDate || new Date().toISOString().split("T")[0]
            });
          });
          setSavingGoals(list);
        });

        // Realtime Subscriptions Listener
        const subsQuery = query(collection(db, "subscriptions"), where("userId", "==", uid));
        const unsubSubs = onSnapshot(subsQuery, (snapshot) => {
          const list: Subscription[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              name: data.name,
              amount: Number(data.amount) || 0,
              category: data.category || "Bills",
              billingCycle: data.billingCycle || "monthly",
              nextBillingDate: data.nextBillingDate || new Date().toISOString().split("T")[0]
            });
          });
          setSubscriptions(list);
        });

        return () => {
          unsubTxs();
          unsubBudgets();
          unsubGoals();
          unsubSubs();
        };
      } else {
        // No Auth User - clear or check local state
        const savedProf = localStorage.getItem("bb_profile");
        if (savedProf) {
          setProfile(JSON.parse(savedProf));
          const savedTx = localStorage.getItem("bb_transactions");
          if (savedTx) setTransactions(JSON.parse(savedTx));
          const savedBds = localStorage.getItem("bb_budgets");
          if (savedBds) setBudgets(JSON.parse(savedBds));
          const savedGoals = localStorage.getItem("bb_goals");
          if (savedGoals) setSavingGoals(JSON.parse(savedGoals));
          const savedSubs = localStorage.getItem("bb_subs");
          if (savedSubs) setSubscriptions(JSON.parse(savedSubs));
        } else {
          setProfile(null);
        }
      }
    });

    // Check system preference dark mode
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
    }

    return () => unsubscribeAuth();
  }, []);

  // Update HTML class on theme change
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Smart Notification Engine Audit
  const runNotificationAudit = (
    txs: Transaction[],
    bds: Budget[],
    subs: Subscription[],
    goals: SavingGoal[],
    userCurr: string = "$"
  ) => {
    const list: SmartNotification[] = [];

    // 1. Budget Warnings
    const categoryExpenses: Record<string, number> = {};
    txs
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
      });

    bds.forEach((b) => {
      const spent = categoryExpenses[b.category] || 0;
      if (b.limit > 0) {
        const pct = (spent / b.limit) * 100;
        if (pct >= 100) {
          list.push({
            id: `alert-over-${b.category}`,
            title: `Overspent: ${b.category} Cap Exceeded!`,
            message: `You spent ${pct.toFixed(0)}% of your ${b.category} budget limit (${userCurr}${spent.toLocaleString()} spent).`,
            type: "alert",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: false
          });
        } else if (pct >= 80) {
          list.push({
            id: `warn-near-${b.category}`,
            title: `${b.category} Budget Alert`,
            message: `You've utilized ${pct.toFixed(0)}% of your ${b.category} limit.`,
            type: "warning",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: false
          });
        }
      }
    });

    // 2. Subscriptions Due
    const today = new Date();
    subs.forEach((s) => {
      const nextDue = new Date(s.nextBillingDate);
      const diffDays = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays <= 4) {
        list.push({
          id: `reminder-due-${s.id}`,
          title: `Upcoming Renewal: ${s.name}`,
          message: `${s.name} (${userCurr}${s.amount}) due in ${diffDays === 0 ? "today" : diffDays + " days"}.`,
          type: "info",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false
        });
      }
    });

    setNotifications(list);
  };

  // Auth Callbacks
  const handleAuthSuccess = (userProfile: UserProfile, isNewUser?: boolean) => {
    setProfile(userProfile);
    if (isNewUser) {
      // Seed initial default budget using proportional USD benchmarks
      const defaultCats: TransactionCategory[] = ["Food", "Shopping", "Bills", "Transport", "Entertainment", "Healthcare", "Education", "Others"];
      const curr = userProfile.currency || "$";
      const defaults: Budget[] = defaultCats.map((cat) => ({
        category: cat,
        limit: convertAmount(DEFAULT_CATEGORY_LIMITS_USD[cat] || 100, "$", curr)
      }));
      setBudgets(defaults);
    }
  };

  // Quick Demo Environment Mode
  const handleQuickDemo = () => {
    setIsDemoMode(true);
    const demoProf: UserProfile = {
      name: "Demo User",
      email: "demo@budgetbuddy.app",
      currency: "$",
      joinedAt: new Date().toISOString().split("T")[0]
    };
    setProfile(demoProf);
    loadSampleDemoData(demoProf);
  };

  // Populate sample entries for demo or testing
  const loadSampleDemoData = async (activeProf?: UserProfile) => {
    const targetProf = activeProf || profile;
    const curr = targetProf?.currency || "$";

    const sampleTxs: Transaction[] = [
      {
        id: "tx-demo-1",
        type: "income",
        category: "Income",
        amount: convertAmount(4500, "$", curr),
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "UPI/Bank",
        notes: "Monthly Payday Salary Deposit",
        isRecurring: true,
        recurringPeriod: "monthly"
      },
      {
        id: "tx-demo-2",
        type: "expense",
        category: "Food",
        amount: convertAmount(120.50, "$", curr),
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "Card",
        notes: "Whole Foods Organic Groceries"
      },
      {
        id: "tx-demo-3",
        type: "expense",
        category: "Bills",
        amount: convertAmount(85.00, "$", curr),
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "UPI/Bank",
        notes: "High-speed Internet & Utility Broadband"
      },
      {
        id: "tx-demo-4",
        type: "expense",
        category: "Shopping",
        amount: convertAmount(110.00, "$", curr),
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "Card",
        notes: "Workplace Apparel purchase"
      }
    ];

    const sampleBudgets: Budget[] = [
      { category: "Food", limit: convertAmount(DEFAULT_CATEGORY_LIMITS_USD.Food, "$", curr) },
      { category: "Shopping", limit: convertAmount(DEFAULT_CATEGORY_LIMITS_USD.Shopping, "$", curr) },
      { category: "Bills", limit: convertAmount(DEFAULT_CATEGORY_LIMITS_USD.Bills, "$", curr) },
      { category: "Transport", limit: convertAmount(DEFAULT_CATEGORY_LIMITS_USD.Transport, "$", curr) },
      { category: "Entertainment", limit: convertAmount(DEFAULT_CATEGORY_LIMITS_USD.Entertainment, "$", curr) },
      { category: "Healthcare", limit: convertAmount(DEFAULT_CATEGORY_LIMITS_USD.Healthcare, "$", curr) },
      { category: "Education", limit: convertAmount(DEFAULT_CATEGORY_LIMITS_USD.Education, "$", curr) },
      { category: "Others", limit: convertAmount(DEFAULT_CATEGORY_LIMITS_USD.Others, "$", curr) }
    ];

    const sampleGoals: SavingGoal[] = [
      {
        id: "goal-demo-1",
        name: "Emergency Reserve",
        targetAmount: convertAmount(3000, "$", curr),
        currentAmount: convertAmount(1200, "$", curr),
        deadline: "2026-12-31"
      }
    ];

    const sampleSubs: Subscription[] = [
      {
        id: "sub-demo-1",
        name: "Netflix Premium",
        amount: convertAmount(15.49, "$", curr),
        category: "Bills",
        billingCycle: "monthly",
        nextBillingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      }
    ];

    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      // Write sample transactions to Firestore
      for (const t of sampleTxs) {
        await setDoc(doc(db, "transactions", t.id), { ...t, userId: uid });
      }
      for (const b of sampleBudgets) {
        const q = query(collection(db, "budgets"), where("userId", "==", uid), where("category", "==", b.category));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await setDoc(doc(db, "budgets", snap.docs[0].id), { ...b, userId: uid });
        } else {
          await setDoc(doc(collection(db, "budgets")), { ...b, userId: uid });
        }
      }
      for (const g of sampleGoals) {
        await setDoc(doc(db, "goals", g.id), { ...g, userId: uid });
      }
      for (const s of sampleSubs) {
        await setDoc(doc(db, "subscriptions", s.id), { ...s, userId: uid });
      }
    } else {
      setTransactions(sampleTxs);
      setBudgets(sampleBudgets);
      setSavingGoals(sampleGoals);
      setSubscriptions(sampleSubs);
      localStorage.setItem("bb_transactions", JSON.stringify(sampleTxs));
      localStorage.setItem("bb_budgets", JSON.stringify(sampleBudgets));
      localStorage.setItem("bb_goals", JSON.stringify(sampleGoals));
      localStorage.setItem("bb_subs", JSON.stringify(sampleSubs));
    }
  };

  // Logout Session
  const handleLogout = async () => {
    if (auth.currentUser) {
      await signOut(auth);
    }
    localStorage.clear();
    setProfile(null);
    setTransactions([]);
    setSavingGoals([]);
    setSubscriptions([]);
    setEmergencyFund({ current: 0, target: 0 });
    setActiveTab("dashboard");
    setNotifications([]);
  };

  // Delete Account & Erase Cloud Data
  const handleDeleteAccountAndData = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const uid = currentUser.uid;
        const txsSnap = await getDocs(query(collection(db, "transactions"), where("userId", "==", uid)));
        txsSnap.forEach(async (d) => await deleteDoc(d.ref));

        const bdsSnap = await getDocs(query(collection(db, "budgets"), where("userId", "==", uid)));
        bdsSnap.forEach(async (d) => await deleteDoc(d.ref));

        const goalsSnap = await getDocs(query(collection(db, "goals"), where("userId", "==", uid)));
        goalsSnap.forEach(async (d) => await deleteDoc(d.ref));

        const subsSnap = await getDocs(query(collection(db, "subscriptions"), where("userId", "==", uid)));
        subsSnap.forEach(async (d) => await deleteDoc(d.ref));

        await deleteDoc(doc(db, "users", uid));
        await deleteUser(currentUser);
      } catch (e) {
        console.error("Account deletion failed:", e);
      }
    }
    handleLogout();
  };

  // Data Mutators
  const handleAddTransaction = async (newTx: Transaction) => {
    if (auth.currentUser) {
      const txDocRef = doc(collection(db, "transactions"));
      const txData = {
        ...newTx,
        id: txDocRef.id,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      };
      await setDoc(txDocRef, txData);
    } else {
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      localStorage.setItem("bb_transactions", JSON.stringify(updated));
    }
    setActiveTab("dashboard");
  };

  const handleQuickAdd = (tx: Partial<Transaction>) => {
    const fullTx: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      type: tx.type || "expense",
      category: tx.category || "Food",
      amount: tx.amount || 0,
      date: tx.date || new Date().toISOString().split("T")[0],
      paymentMethod: tx.paymentMethod || "UPI/Bank",
      notes: tx.notes || "Quick log entry"
    };
    handleAddTransaction(fullTx);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (auth.currentUser) {
      await deleteDoc(doc(db, "transactions", id));
    } else {
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      localStorage.setItem("bb_transactions", JSON.stringify(updated));
    }
  };

  const handleEditTransaction = async (updatedTx: Transaction) => {
    if (auth.currentUser) {
      await setDoc(doc(db, "transactions", updatedTx.id), {
        ...updatedTx,
        userId: auth.currentUser.uid
      });
    } else {
      const updated = transactions.map((t) => t.id === updatedTx.id ? updatedTx : t);
      setTransactions(updated);
      localStorage.setItem("bb_transactions", JSON.stringify(updated));
    }
  };

  const handleUpdateBudget = async (cat: TransactionCategory, limit: number) => {
    if (auth.currentUser) {
      const q = query(collection(db, "budgets"), where("userId", "==", auth.currentUser.uid), where("category", "==", cat));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docId = snap.docs[0].id;
        await setDoc(doc(db, "budgets", docId), { category: cat, limit, userId: auth.currentUser.uid });
      } else {
        const newRef = doc(collection(db, "budgets"));
        await setDoc(newRef, { category: cat, limit, userId: auth.currentUser.uid });
      }
    } else {
      const updated = budgets.map((b) => b.category === cat ? { ...b, limit } : b);
      setBudgets(updated);
      localStorage.setItem("bb_budgets", JSON.stringify(updated));
    }
  };

  const handleApplyAllBenchmarks = async () => {
    const curr = profile?.currency || "$";
    const defaultCats: TransactionCategory[] = ["Food", "Shopping", "Bills", "Transport", "Entertainment", "Healthcare", "Education", "Others"];
    const benchmarkBudgets: Budget[] = defaultCats.map((cat) => ({
      category: cat,
      limit: convertAmount(DEFAULT_CATEGORY_LIMITS_USD[cat] || 100, "$", curr)
    }));

    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      for (const b of benchmarkBudgets) {
        const q = query(collection(db, "budgets"), where("userId", "==", uid), where("category", "==", b.category));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await setDoc(doc(db, "budgets", snap.docs[0].id), { ...b, userId: uid });
        } else {
          await setDoc(doc(collection(db, "budgets")), { ...b, userId: uid });
        }
      }
    } else {
      setBudgets(benchmarkBudgets);
      localStorage.setItem("bb_budgets", JSON.stringify(benchmarkBudgets));
    }
  };

  const handleAddGoal = async (goal: SavingGoal) => {
    if (auth.currentUser) {
      await setDoc(doc(db, "goals", goal.id), {
        ...goal,
        userId: auth.currentUser.uid
      });
    } else {
      const updated = [...savingGoals, goal];
      setSavingGoals(updated);
      localStorage.setItem("bb_goals", JSON.stringify(updated));
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (auth.currentUser) {
      await deleteDoc(doc(db, "goals", id));
    } else {
      const updated = savingGoals.filter((g) => g.id !== id);
      setSavingGoals(updated);
      localStorage.setItem("bb_goals", JSON.stringify(updated));
    }
  };

  const handleUpdateGoalAmount = async (id: string, depAmt: number) => {
    const currentG = savingGoals.find((g) => g.id === id);
    if (!currentG) return;
    const newAmount = currentG.currentAmount + depAmt;

    if (auth.currentUser) {
      await setDoc(doc(db, "goals", id), {
        ...currentG,
        currentAmount: newAmount,
        userId: auth.currentUser.uid
      });
    } else {
      const updated = savingGoals.map((g) => g.id === id ? { ...g, currentAmount: newAmount } : g);
      setSavingGoals(updated);
      localStorage.setItem("bb_goals", JSON.stringify(updated));
    }
  };

  const handleAddSubscription = async (sub: Subscription) => {
    if (auth.currentUser) {
      await setDoc(doc(db, "subscriptions", sub.id), {
        ...sub,
        userId: auth.currentUser.uid
      });
    } else {
      const updated = [...subscriptions, sub];
      setSubscriptions(updated);
      localStorage.setItem("bb_subs", JSON.stringify(updated));
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (auth.currentUser) {
      await deleteDoc(doc(db, "subscriptions", id));
    } else {
      const updated = subscriptions.filter((s) => s.id !== id);
      setSubscriptions(updated);
      localStorage.setItem("bb_subs", JSON.stringify(updated));
    }
  };

  const handleUpdateEmergencyFund = (current: number, target: number) => {
    const fund = { current, target };
    setEmergencyFund(fund);
    localStorage.setItem("bb_fund", JSON.stringify(fund));
  };

  const handleRestoreBackup = async (txs: Transaction[], bds: Budget[]) => {
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      for (const t of txs) {
        await setDoc(doc(db, "transactions", t.id), { ...t, userId: uid });
      }
      for (const b of bds) {
        const q = query(collection(db, "budgets"), where("userId", "==", uid), where("category", "==", b.category));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await setDoc(doc(db, "budgets", snap.docs[0].id), { ...b, userId: uid });
        } else {
          await setDoc(doc(collection(db, "budgets")), { ...b, userId: uid });
        }
      }
    } else {
      setTransactions(txs);
      if (bds.length > 0) setBudgets(bds);
      localStorage.setItem("bb_transactions", JSON.stringify(txs));
      localStorage.setItem("bb_budgets", JSON.stringify(bds));
    }
  };

  const handleUpdateProfile = async (newProf: UserProfile) => {
    const oldCurr = profile?.currency || "$";
    const newCurr = newProf.currency;

    if (profile && oldCurr !== newCurr) {
      const convertedTxs = transactions.map((t) => ({
        ...t,
        amount: convertAmount(t.amount, oldCurr, newCurr)
      }));
      const convertedBudgets = budgets.map((b) => ({
        ...b,
        limit: convertAmount(b.limit, oldCurr, newCurr)
      }));
      const convertedGoals = savingGoals.map((g) => ({
        ...g,
        targetAmount: convertAmount(g.targetAmount, oldCurr, newCurr),
        currentAmount: convertAmount(g.currentAmount, oldCurr, newCurr)
      }));
      const convertedSubs = subscriptions.map((s) => ({
        ...s,
        amount: convertAmount(s.amount, oldCurr, newCurr)
      }));

      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        for (const t of convertedTxs) {
          await setDoc(doc(db, "transactions", t.id), { ...t, userId: uid });
        }
        for (const b of convertedBudgets) {
          const q = query(collection(db, "budgets"), where("userId", "==", uid), where("category", "==", b.category));
          const snap = await getDocs(q);
          if (!snap.empty) {
            await setDoc(doc(db, "budgets", snap.docs[0].id), { ...b, userId: uid });
          }
        }
        for (const g of convertedGoals) {
          await setDoc(doc(db, "goals", g.id), { ...g, userId: uid });
        }
        for (const s of convertedSubs) {
          await setDoc(doc(db, "subscriptions", s.id), { ...s, userId: uid });
        }
      } else {
        setTransactions(convertedTxs);
        setBudgets(convertedBudgets);
        setSavingGoals(convertedGoals);
        setSubscriptions(convertedSubs);
        localStorage.setItem("bb_transactions", JSON.stringify(convertedTxs));
        localStorage.setItem("bb_budgets", JSON.stringify(convertedBudgets));
        localStorage.setItem("bb_goals", JSON.stringify(convertedGoals));
        localStorage.setItem("bb_subs", JSON.stringify(convertedSubs));
      }
    }

    if (auth.currentUser) {
      await setDoc(doc(db, "users", auth.currentUser.uid), newProf);
    }
    setProfile(newProf);
    localStorage.setItem("bb_profile", JSON.stringify(newProf));
  };

  // If no user profile loaded, render AuthScreen
  if (!profile) {
    return <AuthScreen onLoginSuccess={handleAuthSuccess} onQuickDemo={handleQuickDemo} />;
  }

  // Grouped Navigation Items
  const navMain = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "transactions", label: "Transactions", icon: FileSpreadsheet },
    { id: "budget", label: "Budgets", icon: Sliders },
    { id: "goals", label: "Goals & Safety Net", icon: Target },
    { id: "insights", label: "Insights & Health", icon: Sparkles }
  ];

  const navTools = [
    { id: "calendar", label: "Calendar", icon: CalendarIcon },
    { id: "assistant", label: "Ask Buddy AI", icon: Bot },
    { id: "reports", label: "Reports & Export", icon: FileSpreadsheet }
  ];

  const navAccount = [
    { id: "settings", label: "Profile & Settings", icon: Settings }
  ];

  const unreadCount = notifications.length;

  return (
    <div id="app-root" className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <aside className={`w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between fixed lg:sticky top-0 h-screen z-50 transform ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } transition-transform duration-300 ease-in-out shrink-0`}>
        <div className="flex flex-col flex-1 overflow-y-auto">
          
          {/* Logo brand */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <BrandLogo size="md" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Top Quick CTA in Sidebar */}
          <div className="p-4 border-b border-slate-800/80">
            <button
              onClick={() => {
                setActiveTab("add-transaction");
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              + Add Expense
            </button>
          </div>

          {/* Navigation Groups */}
          <nav className="p-4 space-y-6 flex-1">
            
            {/* MAIN GROUP */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-1">
                Main
              </span>
              {navMain.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TOOLS GROUP */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-1">
                Tools & AI
              </span>
              {navTools.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ACCOUNT GROUP */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-1">
                Account
              </span>
              {navAccount.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

          </nav>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3 shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white font-bold text-xs rounded-full flex items-center justify-center shrink-0 shadow-sm">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate flex-1">
              <h5 className="text-xs font-bold text-white truncate">{profile.name}</h5>
              <span className="text-[10px] text-blue-400 font-medium block truncate">
                {profile.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            id="logout-btn"
            className="w-full py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-500/20"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200/60 dark:border-slate-800/80 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 z-40 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Budget Buddy / <span className="text-slate-900 dark:text-white font-extrabold capitalize">{activeTab.replace("-", " ")}</span>
            </h1>
          </div>

          {/* Top Bar Right actions */}
          <div className="flex items-center gap-3">
            
            {/* Smart Reminders notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/80 rounded-xl relative hover:shadow-sm transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification drop panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 animate-fadeIn">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Smart Reminders ({unreadCount})
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white uppercase"
                    >
                      Close
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No pending alerts or warnings found.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-all flex items-start gap-2.5">
                          <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                            n.type === "alert" ? "text-rose-500" : "text-amber-500"
                          }`} />
                          <div className="space-y-0.5">
                            <h5 className="text-[11px] font-bold text-slate-800 dark:text-white leading-tight">
                              {n.title}
                            </h5>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar trigger */}
            <div
              onClick={() => setActiveTab("settings")}
              className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800 p-1.5 pr-3 border border-slate-200/60 dark:border-slate-700/80 rounded-2xl cursor-pointer hover:shadow-xs transition-all"
            >
              <div className="w-6 h-6 bg-blue-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[80px]">
                {profile.name.split(" ")[0]}
              </span>
            </div>

          </div>
        </header>

        {/* Dynamic View Frame */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto animate-fadeIn">
            
            {activeTab === "dashboard" && (
              <Dashboard
                transactions={transactions}
                budgets={budgets}
                profile={profile}
                onQuickAdd={handleQuickAdd}
                currency={profile.currency}
                onSetTab={setActiveTab}
                financialHealthScore={financialHealthScore}
              />
            )}

            {activeTab === "add-transaction" && (
              <AddTransactionTab
                onAddTransaction={handleAddTransaction}
                currency={profile.currency}
              />
            )}

            {activeTab === "transactions" && (
              <TransactionsTab
                transactions={transactions}
                onDeleteTransaction={handleDeleteTransaction}
                onEditTransaction={handleEditTransaction}
                currency={profile.currency}
              />
            )}

            {activeTab === "budget" && (
              <BudgetPlanner
                budgets={budgets}
                transactions={transactions}
                onUpdateBudget={handleUpdateBudget}
                onApplyAllBenchmarks={handleApplyAllBenchmarks}
                currency={profile.currency}
              />
            )}

            {activeTab === "goals" && (
              <GoalsTab
                savingGoals={savingGoals}
                onAddGoal={handleAddGoal}
                onDeleteGoal={handleDeleteGoal}
                onUpdateGoalAmount={handleUpdateGoalAmount}
                subscriptions={subscriptions}
                onAddSubscription={handleAddSubscription}
                onDeleteSubscription={handleDeleteSubscription}
                emergencyFund={emergencyFund}
                onUpdateEmergencyFund={handleUpdateEmergencyFund}
                currency={profile.currency}
              />
            )}

            {activeTab === "calendar" && (
              <CalendarTab
                transactions={transactions}
                currency={profile.currency}
              />
            )}

            {activeTab === "insights" && (
              <AiInsightsTab
                transactions={transactions}
                budgets={budgets}
                savingGoals={savingGoals}
                emergencyFund={emergencyFund}
                currency={profile.currency}
                onRefreshHealthScore={setFinancialHealthScore}
              />
            )}

            {activeTab === "assistant" && (
              <AssistantChatTab
                transactions={transactions}
                budgets={budgets}
                savingGoals={savingGoals}
                emergencyFund={emergencyFund}
                profile={profile}
                currency={profile.currency}
              />
            )}

            {activeTab === "reports" && (
              <ReportsTab
                transactions={transactions}
                budgets={budgets}
                currency={profile.currency}
                onRestoreBackup={handleRestoreBackup}
              />
            )}

            {activeTab === "settings" && (
              <ProfileSettingsTab
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                savingGoals={savingGoals}
                onAddGoal={handleAddGoal}
                onDeleteGoal={handleDeleteGoal}
                onUpdateGoalAmount={handleUpdateGoalAmount}
                subscriptions={subscriptions}
                onAddSubscription={handleAddSubscription}
                onDeleteSubscription={handleDeleteSubscription}
                emergencyFund={emergencyFund}
                onUpdateEmergencyFund={handleUpdateEmergencyFund}
                currency={profile.currency}
                onDeleteAccountAndData={handleDeleteAccountAndData}
                onLoadDemoData={() => loadSampleDemoData()}
              />
            )}

          </div>
        </main>
      </div>

    </div>
  );
}
