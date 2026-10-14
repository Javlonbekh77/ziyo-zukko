"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  Mail, 
  ShieldAlert, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  RotateCw, 
  Calculator,
  Shield,
  Clock
} from "lucide-react";
import { loginAction, getNewCaptchaAction, CaptchaChallenge } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaChallenge | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [remainingSecs, setRemainingSecs] = useState<number>(0);
  const [isRefreshingCaptcha, setIsRefreshingCaptcha] = useState(false);

  // Sync captcha challenge from server state
  useEffect(() => {
    if (state?.captchaChallenge) {
      setCaptcha(state.captchaChallenge);
      setCaptchaAnswer("");
    }
  }, [state?.captchaChallenge]);

  // Initial captcha fetch if required
  useEffect(() => {
    if (state?.requireCaptcha && !captcha) {
      getNewCaptchaAction().then((c) => setCaptcha(c));
    }
  }, [state?.requireCaptcha, captcha]);

  // Handle countdown timer when blocked
  useEffect(() => {
    if (state?.blocked && state.remainingSeconds) {
      setRemainingSecs(state.remainingSeconds);
    }
  }, [state?.blocked, state?.remainingSeconds]);

  useEffect(() => {
    if (remainingSecs <= 0) return;
    const interval = setInterval(() => {
      setRemainingSecs((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSecs]);

  // Redirect on successful authentication
  useEffect(() => {
    if (state?.success) {
      router.push("/admin");
      router.refresh();
    }
  }, [state?.success, router]);

  const handleRefreshCaptcha = async () => {
    try {
      setIsRefreshingCaptcha(true);
      const newCaptcha = await getNewCaptchaAction();
      setCaptcha(newCaptcha);
      setCaptchaAnswer("");
    } finally {
      setIsRefreshingCaptcha(false);
    }
  };

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins} daqiqa ${secs < 10 ? "0" : ""}${secs} soniya`;
  };

  const isBlocked = (state?.blocked && remainingSecs > 0) || remainingSecs > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden select-none">
      {/* High-tech security grid background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "28px 28px"
        }}
      />

      {/* Ambient gradient orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-slate-800/80 relative z-10 transition-all duration-300">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Boshqaruv Paneli</h1>
          <p className="text-slate-400 text-xs mt-1.5 font-medium tracking-wide">
            Ziyo Zukko ta&apos;lim muassasasi xavfsiz tizimi
          </p>
        </div>

        {/* Security Alert Messages */}
        {isBlocked ? (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 px-4 py-3.5 rounded-2xl mb-6 text-sm flex items-start gap-3 animate-in fade-in">
            <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">
              <p className="font-semibold text-rose-200">Xavfsizlik blokirovkasi faol!</p>
              <p className="text-xs text-rose-300/90 mt-1">
                Kiber-xavfsizlik choralari sababli tizimga kirish vaqtincha cheklandi.
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 font-mono text-xs font-bold text-rose-200">
                <span>Qolgan vaqt:</span>
                <span>{formatCountdown(remainingSecs)}</span>
              </div>
            </div>
          </div>
        ) : state?.error ? (
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 px-4 py-3.5 rounded-2xl mb-6 text-sm flex items-start gap-3 animate-in fade-in">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1">
              <p className="text-sm font-medium">{state.error}</p>
              {typeof state.remainingAttempts === "number" && state.remainingAttempts > 0 && (
                <p className="text-xs text-rose-400/80 mt-1">
                  Maksimal urinishlar: 5 ta. Qolgan urinishlar soni: {state.remainingAttempts} ta.
                </p>
              )}
            </div>
          </div>
        ) : null}

        {/* Login Form */}
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Elektron pochta
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                disabled={isBlocked || isPending}
                className="block w-full pl-10 pr-4 py-3 border border-slate-700/80 rounded-xl bg-slate-950/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="admin@ziyozukko.uz"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Maxfiy parol
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                autoComplete="current-password"
                disabled={isBlocked || isPending}
                className="block w-full pl-10 pr-11 py-3 border border-slate-700/80 rounded-xl bg-slate-950/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                disabled={isBlocked || isPending}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Dynamic Anti-Bot / Math Challenge widget when attempts >= 3 */}
          {(state?.requireCaptcha || captcha) && (
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-indigo-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Calculator className="w-4 h-4" />
                  <span className="text-xs font-semibold tracking-wide uppercase">Anti-Bot Himoyasi</span>
                </div>
                <button
                  type="button"
                  onClick={handleRefreshCaptcha}
                  disabled={isRefreshingCaptcha || isBlocked || isPending}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  title="Yangi misol olish"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRefreshingCaptcha ? "animate-spin" : ""}`} />
                  <span>Yangilash</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-2 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 font-mono font-bold text-sm tracking-wider">
                  {captcha?.question || "Misol yuklanmoqda..."}
                </div>
                <input
                  type="number"
                  name="captchaAnswer"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  placeholder="Javob"
                  required
                  disabled={isBlocked || isPending}
                  className="flex-1 px-3 py-2 border border-slate-700/80 rounded-xl bg-slate-950/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500 transition-all font-mono"
                />
              </div>
              <input type="hidden" name="captchaToken" value={captcha?.token || ""} />
              <p className="text-[11px] text-slate-500">
                Kiber xujumlar profilaktikasi uchun bot emasligingizni tasdiqlang.
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isBlocked || isPending || (state?.requireCaptcha && !captchaAnswer)}
              className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-600/20 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Xavfsiz tekshirilmoqda...</span>
                </span>
              ) : isBlocked ? (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Vaqtincha cheklangan</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Tizimga xavfsiz kirish</span>
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Security Footer Notice */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-2 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Brute-force va DDoS xujumlaridan himoyalangan</span>
        </div>
      </div>
    </div>
  );
}
