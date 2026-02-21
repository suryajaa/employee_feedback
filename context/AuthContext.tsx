"use client";

import { createContext, useContext, useState, useEffect } from "react";

type AuthState = {
    token: string | null;
    role: "employee" | "manager" | null;
    department: string | null;
};

const AuthContext = createContext<{
    auth: AuthState;
    login: (data: AuthState) => void;
    logout: () => void;
}>({
    auth: { token: null, role: null, department: null },
    login: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [auth, setAuth] = useState<AuthState>({
        token: null,
        role: null,
        department: null,
    });

    useEffect(() => {
        const stored = localStorage.getItem("auth");
        if (stored) setAuth(JSON.parse(stored));
    }, []);

    const login = (data: AuthState) => {
        setAuth(data);
        localStorage.setItem("auth", JSON.stringify(data));
    };

    const logout = () => {
        setAuth({ token: null, role: null, department: null });
        localStorage.removeItem("auth");
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
