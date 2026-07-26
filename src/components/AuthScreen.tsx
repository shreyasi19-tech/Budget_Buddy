import React, { useState } from "react";
import { UserProfile } from "../types";
import {
  ShieldCheck,
  UserPlus,
  LogIn,
  Sparkles,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  TrendingUp,
  Bot,
  PieChart,
  ArrowRight
} from "lucide-react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  db,
  doc,
  setDoc,
  getDoc
} from "../lib/firebase";
import PrivacyPolicyModal from "./PrivacyPolicyModal";
import BrandLogo from "./BrandLogo";

interface AuthScreenProps {
  onLoginSuccess: (profile: UserProfile, isNewUser?: boolean) => void;
  onQuickDemo: () => void;
}

export default function AuthScreen({ onLoginSuccess, onQuickDemo }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState("$");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Email/Password submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setErrorMsg("Please enter your name.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = cred.user;

        const newProfile: UserProfile = {
          name: name.trim(),
          email: user.email || email.trim(),
          currency: currency,
          joinedAt: new Date().toISOString().split("T")[0]
        };

        await setDoc(doc(db, "users", user.uid), newProfile);

        setSuccessMsg("Account created successfully!");
        onLoginSuccess(newProfile, true);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const user = cred.user;

        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        let userProf: UserProfile;
        if (userSnap.exists()) {
          userProf = userSnap.data() as UserProfile;
        } else {
          userProf = {
            name: user.displayName || user.email?.split("@")[0] || "Budget Buddy User",
            email: user.email || email.trim(),
            currency: "$",
            joinedAt: new Date().toISOString().split("T")[0]
          };
          await setDoc(userDocRef, userProf);
        }

        setSuccessMsg("Signed in successfully!");
        onLoginSuccess(userProf, false);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      const isOpNotAllowed =
        err?.code === "auth/operation-not-allowed" ||
        (typeof err?.message === "string" && err.message.includes("operation-not-allowed"));

      if (isOpNotAllowed) {
        const fallbackName = name.trim() || (email ? email.split("@")[0] : "") || "Budget Buddy User";
        const fallbackProfile: UserProfile = {
          name: fallbackName,
          email: email.trim() || "user@budgetbuddy.app",
          currency: currency || "$",
          joinedAt: new Date().toISOString().split("T")[0]
        };
        localStorage.setItem("bb_profile", JSON.stringify(fallbackProfile));
        setLoading(false);
        onLoginSuccess(fallbackProfile, isSignUp);
        return;
      }

      let msg = err.message || "Authentication failed. Please check your details.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        msg = "Invalid email or password credentials.";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "An account with this email address already exists. Please sign in instead.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters long.";
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;

      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      let userProf: UserProfile;
      if (userSnap.exists()) {
        userProf = userSnap.data() as UserProfile;
      } else {
        userProf = {
          name: user.displayName || "Google User",
          email: user.email || "",
          currency: "$",
          avatar: user.photoURL || undefined,
          joinedAt: new Date().toISOString().split("T")[0]
        };
        await setDoc(userDocRef, userProf);
      }

      setSuccessMsg("Signed in with Google!");
      onLoginSuccess(userProf, !userSnap.exists());
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      const isOpNotAllowed =
        err?.code === "auth/operation-not-allowed" ||
        err?.code === "auth/popup-blocked" ||
        err?.code === "auth/unauthorized-domain" ||
        (typeof err?.message === "string" && err.message.includes("operation-not-allowed"));

      if (isOpNotAllowed) {
        const fallbackProfile: UserProfile = {
          name: "Google Account User",
          email: "googleuser@budgetbuddy.app",
          currency: "$",
          joinedAt: new Date().toISOString().split("T")[0]
        };
        localStorage.setItem("bb_profile", JSON.stringify(fallbackProfile));
        setLoading(false);
        onLoginSuccess(fallbackProfile, true);
        return;
      }
      setErrorMsg(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-container" className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-100 p-4 lg:p-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative z-10">
        
        {/* Left Hero Section (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
          <div className="space-y-6">
            <BrandLogo size="lg" />

            <div className="pt-4 space-y-4">
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Intelligent Money Companion.
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Take complete control of your finances with automated insights, smart budgeting, and Gemini AI wealth diagnostics.
              </p>
            </div>

            {/* Product Feature Highlights */}
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Buddy AI Assistant</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Personalized spending suggestions powered by Gemini Flash.</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Financial Health Score</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Real-time solvency diagnostics and savings rate analysis.</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Smart Goals & Budgets</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Category limits, savings targets, and subscription tracking.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Firebase Secured
            </span>
            <span>v2.5 Release</span>
          </div>
        </div>

        {/* Right Auth Form Section (lg:col-span-7) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-slate-900">
          
          <div className="max-w-md mx-auto w-full space-y-6">
            
            {/* Header & Switcher */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {isSignUp ? "Create Your Account" : "Welcome Back"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {isSignUp ? "Set up your personal workspace in seconds" : "Access your financial dashboard"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onQuickDemo}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Demo Sandbox
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    !isSignUp
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSignUp
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Notifications / Alerts */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-2xl text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Sterling"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xs"
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Preferred Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs cursor-pointer"
                  >
                    <option value="$">USD ($)</option>
                    <option value="₹">INR (₹)</option>
                    <option value="€">EUR (€)</option>
                    <option value="£">GBP (£)</option>
                    <option value="¥">JPY (¥)</option>
                    <option value="₩">KRW (₩)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-60"
              >
                {loading ? (
                  <span className="animate-pulse">Authenticating...</span>
                ) : isSignUp ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Register Account
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                OR SIGN IN WITH
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer text-xs shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Instant Access for Demo */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={() => {
                  const guestProf: UserProfile = {
                    name: name.trim() || "Budget Buddy User",
                    email: email.trim() || "user@budgetbuddy.app",
                    currency: currency || "$",
                    joinedAt: new Date().toISOString().split("T")[0]
                  };
                  localStorage.setItem("bb_profile", JSON.stringify(guestProf));
                  onLoginSuccess(guestProf, false);
                }}
                className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                Skip authentication <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="hover:underline text-slate-500 hover:text-slate-400"
              >
                Privacy Policy
              </button>
            </div>

          </div>

        </div>

      </div>

      <PrivacyPolicyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </div>
  );
}
