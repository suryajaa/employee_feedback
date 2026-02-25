"use client";
import { createContext, useContext, useState, useEffect } from "react";

type AuthState = {
    token: string | null;
    role: "employee" | "manager" | "admin" | null;
    department: string | null;
    submitted_form_1: boolean;
    submitted_form_2: boolean;
    submitted_form_3: boolean;
};

const AuthContext = createContext<{
    auth: AuthState;
    login: (data: AuthState) => void;
    logout: () => void;
}>({
    auth: { token: null, role: null, department: null, submitted_form_1: false, submitted_form_2: false, submitted_form_3: false },
    login: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [auth, setAuth] = useState<AuthState>({
        token: null,
        role: null,
        department: null,
        submitted_form_1: false,
        submitted_form_2: false,
        submitted_form_3: false,
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
        setAuth({ token: null, role: null, department: null, submitted_form_1: false, submitted_form_2: false, submitted_form_3: false });
        localStorage.removeItem("auth");
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);