"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import BarChart from "@/components/charts/BarChart";
import RadarChart from "@/components/charts/RadarChart";
import InsightsSummary from "@/components/charts/InsightsSummary";
import ExplainabilityOverlay from "@/components/charts/ExplainabilityOverlay";

export default function ManagerDashboard() {
    const { auth } = useAuth();
    const router = useRouter();

    const [insights, setInsights] = useState<Record<string, { score: number; confidence: string; explanation: string }> | null>(null);
    const [numEmployees, setNumEmployees] = useState<number>(0);
    const [maxEmployees, setMaxEmployees] = useState<number>(0);
    const [status, setStatus] = useState<"OPEN" | "CLOSED">("OPEN");
    const [loading, setLoading] = useState(true);

    // 🔐 MANAGER GUARD + FETCH INSIGHTS
    useEffect(() => {
        if (!auth.token) {
            router.push("/login");
            return;
        }

        if (auth.role !== "manager") {
            router.push("/unauthorized");
            return;
        }

        const fetchInsights = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8000/manager/insights/${auth.department}`,
                    {
                        headers: {
                            Authorization: `Bearer ${auth.token}`,
                        },
                    }
                );

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
    }, [auth, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">Loading insights…</p>
            </div>
        );
    }

    if (!insights) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">
                    No feedback submitted yet for your department.
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-10 space-y-10">
            {/* HEADER */}
            <div>
                <h1 className="text-3xl font-bold">Department Feedback Insights</h1>

                <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-muted-foreground">
                        Submissions: {numEmployees}/{maxEmployees}
                    </span>

                    <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${status === "OPEN"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                    >
                        {status}
                    </span>
                </div>
            </div>

            {/* CHARTS */}
            <div className="grid md:grid-cols-2 gap-8">
                <BarChart insights={insights} />
                <RadarChart insights={insights} />
            </div>

            {/* SUMMARY */}
            <InsightsSummary insights={insights} />

            {/* EXPLAINABILITY */}
            <ExplainabilityOverlay insights={insights} />

            {/* RESET BUTTON (ONLY WHEN CLOSED) */}
            {status === "CLOSED" && (
                <div className="pt-6">
                    <button
                        onClick={async () => {
                            await fetch(
                                `http://localhost:8000/admin/reset/${auth.department}`,
                                {
                                    method: "POST",
                                    headers: {
                                        Authorization: `Bearer ${auth.token}`,
                                    },
                                }
                            );
                            window.location.reload();
                        }}
                        className="bg-primary text-white px-4 py-2 rounded-lg"
                    >
                        Start New Feedback Cycle
                    </button>
                </div>
            )}
        </div>
    );
}
