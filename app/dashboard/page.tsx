"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react"

const feedbackTasks = [
  {
    id: "1",
    title: "Manager Leadership Feedback",
    description: "Share your thoughts on your manager's leadership style and effectiveness",
    questionCount: 8,
    status: "pending",
    dueDate: "2025-12-20",
  },
  {
    id: "2",
    title: "Team Collaboration Survey",
    description: "Help us understand how well your team collaborates and communicates",
    questionCount: 6,
    status: "in-progress",
    dueDate: "2025-12-15",
  },
  {
    id: "3",
    title: "Company Culture Assessment",
    description: "Share your perspective on our company culture and values",
    questionCount: 5,
    status: "submitted",
    dueDate: "2025-12-10",
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return { icon: AlertCircle, label: "Pending", bgColor: "bg-yellow-50 dark:bg-yellow-950/30", textColor: "text-yellow-700 dark:text-yellow-300", borderColor: "border-yellow-200 dark:border-yellow-800" }
    case "in-progress":
      return { icon: Clock, label: "In Progress", bgColor: "bg-blue-50 dark:bg-blue-950/30", textColor: "text-blue-700 dark:text-blue-300", borderColor: "border-blue-200 dark:border-blue-800" }
    case "submitted":
      return { icon: CheckCircle2, label: "Submitted", bgColor: "bg-green-50 dark:bg-green-950/30", textColor: "text-green-700 dark:text-green-300", borderColor: "border-green-200 dark:border-green-800" }
    default:
      return { icon: AlertCircle, label: "Unknown", bgColor: "bg-gray-50", textColor: "text-gray-700", borderColor: "border-gray-200" }
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function Dashboard() {
  const { auth } = useAuth();
  const router = useRouter();

  console.log("auth state:", JSON.stringify(auth));

  useEffect(() => {
    if (!auth.token) {
      router.replace("/login");
    } else if (auth.role === "admin") {
      router.replace("/admin/register");
    } else if (auth.role === "manager") {
      router.replace("/manager/dashboard");
    } else if (auth.role === "employee" && auth.has_submitted) {
      router.replace("/already-submitted");
    }
  }, [auth, router]);

  // Don't render until auth resolves
  if (!auth.token || auth.role !== "employee") return null;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Your Feedback Tasks</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Your voice matters. Share your valuable feedback to help us grow together.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {feedbackTasks.map((task) => {
            const statusBadge = getStatusBadge(task.status)
            const StatusIcon = statusBadge.icon
            return (
              <Link key={task.id} href={`/feedback/${task.id}`}>
                <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border border-border">
                  <CardHeader className="pb-4">
                    <div className="mb-3 flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium ${statusBadge.bgColor} ${statusBadge.textColor} ${statusBadge.borderColor}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusBadge.label}
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{task.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{task.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col justify-between">
                    <div className="mb-6 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Due: {formatDate(task.dueDate)}
                      </div>
                      <div className="inline-block rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                        {task.questionCount} questions
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                      {task.status === "submitted" ? "View Response" : "Start Feedback"}
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
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
  )
}