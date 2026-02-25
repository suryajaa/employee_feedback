"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MessageSquare, Clock, CheckCircle2, AlertCircle, LogOut } from "lucide-react";

const feedbackTasks = [
  {
    id: "1",
    title: "Manager Leadership Feedback",
    description: "Share your thoughts on your manager's leadership style and effectiveness",
    questionCount: 8,
  },
  {
    id: "2",
    title: "Team Collaboration Survey",
    description: "Help us understand how well your team collaborates and communicates",
    questionCount: 6,
  },
  {
    id: "3",
    title: "Company Culture Assessment",
    description: "Share your perspective on our company culture and values",
    questionCount: 5,
  },
];

export default function Dashboard() {
  const { auth, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.token) {
      router.replace("/login");
    } else if (auth.role === "admin") {
      router.replace("/admin/register");
    } else if (auth.role === "manager") {
      router.replace("/manager/dashboard");
    }
  }, [auth, router]);

  if (!auth.token || auth.role !== "employee") return null;

  const submittedMap: Record<string, boolean> = {
    "1": auth.submitted_form_1,
    "2": auth.submitted_form_2,
    "3": auth.submitted_form_3,
  };

  const handleFormClick = (id: string) => {
    if (submittedMap[id]) {
      router.push(`/already_submitted?form=${id}`);
    } else {
      router.push(`/feedback/${id}`);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 flex items-start justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Your Feedback Tasks</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Your voice matters. Share your valuable feedback to help us grow together.
            </p>
          </div>
          <button
            onClick={() => { logout(); router.replace("/login"); }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {feedbackTasks.map((task) => {
            const isSubmitted = submittedMap[task.id];
            return (
              <div
                key={task.id}
                onClick={() => handleFormClick(task.id)}
                className="cursor-pointer"
              >
                <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border">
                  <CardHeader className="pb-4">
                    <div className="mb-3 flex items-center gap-2">
                      {isSubmitted ? (
                        <div className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Submitted
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Pending
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{task.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{task.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col justify-between">
                    <div className="mb-6">
                      <div className="inline-block rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                        {task.questionCount} questions
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                      {isSubmitted ? "Already Submitted" : "Start Feedback"}
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="mt-16 rounded-lg bg-secondary/50 p-8 text-center border border-border">
          <h2 className="mb-2 text-xl font-semibold text-foreground">Why Your Feedback Matters</h2>
          <p className="text-muted-foreground">
            Your honest feedback helps us understand what's working well and where we can improve.
          </p>
        </div>
      </div>
    </main>
  );
}