"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Shield, UserPlus, CheckCircle2, AlertCircle, Users, RefreshCw } from "lucide-react";

const DEPARTMENTS = ["engineering", "sales", "hr", "design"];
const ROLES = ["employee", "manager"];

type User = {
    email: string;
    role: string;
    department: string;
    has_submitted: boolean;
};

export default function AdminRegister() {
    const { auth, logout } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("employee");
    const [department, setDepartment] = useState("engineering");
    const [loading, setLoading] = useState(false);
    const [fetchingUsers, setFetchingUsers] = useState(true);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    useEffect(() => {
        if (!auth.token || auth.role !== "admin") {
            router.replace("/login");
            return;
        }
        fetchUsers();
    }, [auth, router]);

    const fetchUsers = async () => {
        setFetchingUsers(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`, {
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setAllUsers(data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setFetchingUsers(false);
        }
    };

    if (!auth.token || auth.role !== "admin") return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const duplicate = allUsers.find(u => u.email === email);
        if (duplicate) {
            setError(`${email} is already registered.`);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({ email, password, role, department }),
            });

            if (res.status === 400) {
                setError("A user with this email already exists.");
                return;
            }
            if (!res.ok) throw new Error("Registration failed");

            setSuccess(`Successfully registered ${email} as ${role} in ${department}.`);
            setEmail("");
            setPassword("");
            setRole("employee");
            setDepartment("engineering");
            fetchUsers(); // refresh the list
        } catch (err) {
            setError("Failed to register user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const roleColors: Record<string, string> = {
        employee: "bg-indigo-500/20 text-indigo-300",
        manager: "bg-purple-500/20 text-purple-300",
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                            <Shield className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Secure<span className="text-indigo-400">View</span></h1>
                            <p className="text-xs text-slate-400">Admin Panel</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); router.replace("/login"); }}
                        className="text-sm text-slate-400 hover:text-white transition-colors border border-slate-700 px-3 py-1.5 rounded-lg"
                    >
                        Logout
                    </button>
                </div>

                {/* Registration Form */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 mb-6">
                    <div className="flex items-center gap-2 mb-6">
                        <UserPlus className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-lg font-semibold text-white">Register New User</h2>
                    </div>

                    {success && (
                        <div className="mb-5 flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            {success}
                        </div>
                    )}
                    {error && (
                        <div className="mb-5 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="user@company.com"
                                className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Role</label>
                                <select
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                    className="w-full bg-slate-800/60 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                >
                                    {ROLES.map(r => (
                                        <option key={r} value={r} className="bg-slate-800">
                                            {r.charAt(0).toUpperCase() + r.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Department</label>
                                <select
                                    value={department}
                                    onChange={e => setDepartment(e.target.value)}
                                    className="w-full bg-slate-800/60 border border-slate-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                >
                                    {DEPARTMENTS.map(d => (
                                        <option key={d} value={d} className="bg-slate-800">
                                            {d.charAt(0).toUpperCase() + d.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Registering...
                                </>
                            ) : "Register User"}
                        </button>
                    </form>
                </div>

                {/* All Registered Users */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-sm font-semibold text-slate-300">
                                All Registered Users ({allUsers.length})
                            </h3>
                        </div>
                        <button
                            onClick={fetchUsers}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    {fetchingUsers ? (
                        <p className="text-sm text-slate-500 text-center py-4">Loading users...</p>
                    ) : allUsers.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">No users registered yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {allUsers.map((u, i) => (
                                <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-3">
                                    <span className="text-sm text-white">{u.email}</span>
                                    <div className="flex items-center gap-2">
                                        {u.role === "employee" && (
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${u.has_submitted ? "bg-green-500/20 text-green-300" : "bg-slate-700 text-slate-400"}`}>
                                                {u.has_submitted ? "submitted" : "pending"}
                                            </span>
                                        )}
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[u.role] ?? "bg-slate-700 text-slate-300"}`}>
                                            {u.role}
                                        </span>
                                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                                            {u.department}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}