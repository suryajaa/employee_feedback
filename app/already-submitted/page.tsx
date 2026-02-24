"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function AlreadySubmitted() {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.replace("/login");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4 max-w-md">
                <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold">You've already submitted</h1>
                <p className="text-muted-foreground">
                    You have already submitted your feedback for this cycle.
                    You'll be able to submit again when the next cycle begins.
                </p>
                <button
                    onClick={handleLogout}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}