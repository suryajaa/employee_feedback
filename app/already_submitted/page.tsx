"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

const FORM_NAMES: Record<string, string> = {
    "1": "Manager Leadership Feedback",
    "2": "Team Collaboration Survey",
    "3": "Company Culture Assessment",
};

function AlreadySubmittedContent() {
    const { logout } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const formId = searchParams.get("form") || "";
    const formName = FORM_NAMES[formId] || "this form";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="absolute top-4 right-4">
                <button
                    onClick={() => { logout(); router.replace("/login"); }}
                    className="text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors"
                >
                    Logout
                </button>
            </div>
            <div className="text-center space-y-4 max-w-md px-4">
                <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold">Already Submitted</h1>
                <p className="text-muted-foreground">
                    You have already submitted <span className="font-medium text-foreground">{formName}</span> for this cycle.
                    You'll be able to submit again when the next cycle begins.
                </p>
                <button
                    onClick={() => router.replace("/dashboard")}
                    className="w-full bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
}

export default function AlreadySubmitted() {
    return (
        <Suspense>
            <AlreadySubmittedContent />
        </Suspense>
    );
}