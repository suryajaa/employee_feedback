"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Shield, Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) throw new Error("Invalid credentials");
            const data = await res.json();
            login({
                token: data.access_token,
                role: data.role,
                department: data.department,
                submitted_form_1: data.submitted_form_1,
                submitted_form_2: data.submitted_form_2,
                submitted_form_3: data.submitted_form_3,
            });
            if (data.role === "manager") {
                router.push("/manager/dashboard");
            } else if (data.role === "admin") {
                router.push("/admin/register");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Ambient glow blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/8 blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-md">

                {/* Brand header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-5">
                        <Shield className="w-7 h-7 text-indigo-400" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Secu<span className="text-indigo-400">Review</span>
                    </h1>
                    <p className="mt-2 text-sm text-slate-400 tracking-wide">
                        Anonymous feedback. Real insights.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-lg font-semibold text-white mb-1">Welcome back</h2>
                    <p className="text-sm text-slate-400 mb-7">Sign in to your account to continue</p>

                    {error && (
                        <div className="mb-5 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
                            <Lock className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-10 pr-11 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg text-sm transition-all duration-200 mt-2 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-slate-600 mt-6">
                    All feedback is anonymous and privacy-preserving
                </p>
            </div>
        </div>
    );
}