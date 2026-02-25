"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import BarChart from "@/components/charts/BarChart";
import RadarChart from "@/components/charts/RadarChart";
import InsightsSummary from "@/components/charts/InsightsSummary";
import ExplainabilityOverlay from "@/components/charts/ExplainabilityOverlay";
import { Shield, LogOut, ArrowLeft, BarChart2, Clock } from "lucide-react";

const FORM_NAMES: Record<string, string> = {
    "1": "Manager Leadership Feedback",
    "2": "Team Collaboration Survey",
    "3": "Company Culture Assessment",
};

export default function FormInsights() {
    const { auth, logout } = useAuth();
    const router = useRouter();
    const params = useParams();
    const form_id = params?.form_id as string;

    const [insights, setInsights] = useState<Record<string, { score: number; confidence: string; explanation: string }> | null>(null);
    const [numEmployees, setNumEmployees] = useState(0);
    const [maxEmployees, setMaxEmployees] = useState(0);
    const [status, setStatus] = useState<"OPEN" | "CLOSED">("OPEN");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.token) { router.push("/login"); return; }
        if (auth.role !== "manager") { router.push("/unauthorized"); return; }

        const fetchInsights = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/manager/insights/${auth.department}/${form_id}`,
                    { headers: { Authorization: `Bearer ${auth.token}` } }
                );
                if (res.status === 404) { setLoading(false); return; }
                if (!res.ok) throw new Error("Failed to fetch insights");
                const data = await res.json();
                setInsights(data.insights.dimensions);
                setNumEmployees(data.num_employees);
                setMaxEmployees(data.max_employees);
                setStatus(data.status);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [auth, router, form_id]);

    const handleLogout = () => { logout(); router.replace("/login"); };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                    <p className="text-slate-400 text-sm">Loading insights…</p>
                </div>
            </div>
        );
    }

    if (!insights) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col">
                <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <Shield className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="text-white font-bold">Secure<span className="text-indigo-400">View</span></span>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors border border-slate-700 px-3 py-1.5 rounded-lg">
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
                <div className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center max-w-md">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                    <BarChart2 className="w-10 h-10 text-indigo-400" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                </div>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">No Submissions Yet</h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                            No feedback has been submitted for <span className="text-indigo-400 font-medium">{FORM_NAMES[form_id]}</span> yet.
                        </p>
                        <div className="flex flex-col items-center gap-3">
                            <button onClick={() => router.push("/manager/dashboard")} className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg text-sm transition-all">
                                Back to Dashboard
                            </button>
                            <button onClick={handleLogout} className="w-full max-w-xs border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 font-medium py-2.5 rounded-lg text-sm transition-all">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-10 space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => router.push("/manager/dashboard")}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold">{FORM_NAMES[form_id]}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-muted-foreground">
                            Submissions: {numEmployees}/{maxEmployees}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${status === "OPEN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                            {status}
                        </span>
                    </div>
                </div>
                <button onClick={handleLogout} className="px-4 py-2 rounded-lg border text-sm hover:bg-muted transition-colors">
                    Logout
                </button>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-8">
                <BarChart insights={insights} />
                <RadarChart insights={insights} />
            </div>

            <InsightsSummary insights={insights} />
            <ExplainabilityOverlay insights={insights} />

            {/* Reset button */}
            {status === "CLOSED" && (
                <div className="pt-6">
                    <button
                        onClick={async () => {
                            await fetch(
                                `${process.env.NEXT_PUBLIC_API_URL}/admin/reset/${auth.department}/${form_id}`,
                                { method: "POST", headers: { Authorization: `Bearer ${auth.token}` } }
                            );
                            window.location.reload();
                        }}
                        className="bg-primary text-white px-4 py-2 rounded-lg"
                    >
                        Start New Cycle for This Form
                    </button>
                </div>
            )}
        </div>
    );
}
