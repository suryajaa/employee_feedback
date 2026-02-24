"use client";
import { createContext, useContext, useState, useEffect } from "react";

type AuthState = {
    token: string | null;
    role: "employee" | "manager" | "admin" | null;
    department: string | null;
    has_submitted: boolean;
};

const AuthContext = createContext<{
    auth: AuthState;
    login: (data: AuthState) => void;
    logout: () => void;
}>({
    auth: { token: null, role: null, department: null, has_submitted: false },
    login: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [auth, setAuth] = useState<AuthState>({
        token: null,
        role: null,
        department: null,
        has_submitted: false,
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
        setAuth({ token: null, role: null, department: null, has_submitted: false });
        localStorage.removeItem("auth");
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);