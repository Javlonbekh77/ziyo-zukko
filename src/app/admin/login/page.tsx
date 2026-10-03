"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldAlert, ShieldCheck } from "lucide-react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [captchaToken, setCaptchaToken] = useState("");

  useEffect(() => {
    if (state?.success) {
      router.push("/admin/graduates");
    }
  }, [state, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-slate-700/50 z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Himoyalangan tizim</h1>
          <p className="text-slate-400 text-sm">Ziyo Zukko admin paneli</p>
        </div>

        {state?.error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{state.error}</p>
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="email"
                name="email"
                required
                disabled={state?.blocked || isPending}
                className="block w-full pl-11 pr-4 py-3 border border-slate-600/50 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                placeholder="admin@ziyozukko.uz"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Parol
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                name="password"
                required
                disabled={state?.blocked || isPending}
                className="block w-full pl-11 pr-4 py-3 border border-slate-600/50 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                placeholder="Kamida 8 belgi (Katta, kichik, raqam, belgi)"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              * Xavfsizlik talabi: A-Z, a-z, 0-9, @$!%*?&
            </p>
          </div>

          {state?.requireCaptcha && (
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-600/50 flex flex-col items-center justify-center gap-3">
              <p className="text-sm text-slate-300">Tasdiqlash (Cloudflare Turnstile o'rni)</p>
              {/* Mock Captcha widget */}
              <button
                type="button"
                onClick={() => setCaptchaToken("verified-token")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  captchaToken ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                {captchaToken ? 'Tasdiqlandi ✓' : 'Men robot emasman'}
              </button>
              <input type="hidden" name="captchaToken" value={captchaToken} />
            </div>
          )}

          <button
            type="submit"
            disabled={state?.blocked || isPending || (state?.requireCaptcha && !captchaToken)}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Kirilmoqda...
              </span>
            ) : state?.blocked ? (
              "Bloklangan"
            ) : (
              "Tizimga kirish"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
