"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Shield, LogOut, BarChart2, Users, ChevronRight } from "lucide-react";

type FormOverview = {
    form_id: string;
    form_name: string;
    num_submissions: number;
    max_employees: number;
    status: "OPEN" | "CLOSED";
};

export default function ManagerDashboard() {
    const { auth, logout } = useAuth();
    const router = useRouter();
    const [forms, setForms] = useState<FormOverview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth.token) { router.push("/login"); return; }
        if (auth.role !== "manager") { router.push("/unauthorized"); return; }

        const fetchForms = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/manager/forms/${auth.department}`,
                    { headers: { Authorization: `Bearer ${auth.token}` } }
                );
                if (!res.ok) throw new Error("Failed to fetch forms");
                const data = await res.json();
                setForms(data.forms);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchForms();
    }, [auth, router]);

    const handleLogout = () => { logout(); router.replace("/login"); };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                    <p className="text-slate-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <Shield className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-white font-bold">Secure<span className="text-indigo-400">View</span></span>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors border border-slate-700 px-3 py-1.5 rounded-lg"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">Feedback Overview</h1>
                    <p className="text-slate-400 text-sm mt-1 capitalize">{auth.department} department</p>
                </div>

                <div className="space-y-4">
                    {forms.map((form) => (
                        <div
                            key={form.form_id}
                            onClick={() => router.push(`/manager/forms/${form.form_id}`)}
                            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex items-center justify-between cursor-pointer hover:border-indigo-500/40 hover:bg-slate-900 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                                    <BarChart2 className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{form.form_name}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1 text-xs text-slate-400">
                                            <Users className="w-3 h-3" />
                                            {form.num_submissions}/{form.max_employees} submissions
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${form.status === "OPEN"
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-red-500/20 text-red-400"
                                            }`}>
                                            {form.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}