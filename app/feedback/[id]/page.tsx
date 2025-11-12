"use client"

import { FeedbackForm } from "@/components/feedback-form"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"

interface FeedbackPageProps {
  params: Promise<{ id: string }>
}

// Mock data for feedback questions
const feedbackQuestionsData: Record<
  string,
  { title: string; questions: Array<{ id: string; text: string; placeholder?: string }> }
> = {
  "1": {
    title: "Manager Leadership Feedback",
    questions: [
      {
        id: "q1",
        text: "What do you appreciate most about your manager's leadership?",
        placeholder: "Share specific qualities or actions that stand out...",
      },
      {
        id: "q2",
        text: "How well does your manager provide constructive feedback?",
        placeholder: "Describe your experience with feedback and guidance...",
      },
      {
        id: "q3",
        text: "What areas could your manager improve in?",
        placeholder: "Be honest about areas where improvement would help...",
      },
      {
        id: "q4",
        text: "How does your manager support your professional development?",
        placeholder: "Share your experience with growth opportunities...",
      },
      {
        id: "q5",
        text: "How accessible and approachable is your manager?",
        placeholder: "Describe how easy it is to communicate with your manager...",
      },
      {
        id: "q6",
        text: "How well does your manager communicate company goals?",
        placeholder: "Share your thoughts on clarity of direction and purpose...",
      },
      {
        id: "q7",
        text: "What would most improve your relationship with your manager?",
        placeholder: "Suggest specific changes that would be meaningful...",
      },
      {
        id: "q8",
        text: "Any additional feedback or comments?",
        placeholder: "Feel free to add any other thoughts or suggestions...",
      },
    ],
  },
  "2": {
    title: "Team Collaboration Survey",
    questions: [
      {
        id: "q1",
        text: "How effectively does your team collaborate on projects?",
        placeholder: "Describe the level of teamwork and cooperation...",
      },
      {
        id: "q2",
        text: "How clear is communication within your team?",
        placeholder: "Share your experience with team communication...",
      },
      {
        id: "q3",
        text: "What are the strongest aspects of your team?",
        placeholder: "Highlight what makes your team successful...",
      },
      {
        id: "q4",
        text: "Where could your team improve collaboration?",
        placeholder: "Share areas for improvement with honesty...",
      },
      {
        id: "q5",
        text: "How well does your team support one another?",
        placeholder: "Describe the supportive culture within your team...",
      },
      {
        id: "q6",
        text: "Any suggestions for better team dynamics?",
        placeholder: "Share ideas for enhancing team collaboration...",
      },
    ],
  },
  "3": {
    title: "Company Culture Assessment",
    questions: [
      {
        id: "q1",
        text: "How would you describe our company culture?",
        placeholder: "Share your perspective on our workplace environment...",
      },
      {
        id: "q2",
        text: "Do you feel aligned with our company values?",
        placeholder: "Describe how our values resonate with you...",
      },
      {
        id: "q3",
        text: "What aspects of our culture do you value most?",
        placeholder: "Highlight what makes working here special...",
      },
      {
        id: "q4",
        text: "What could improve our company culture?",
        placeholder: "Share constructive feedback for improvement...",
      },
      {
        id: "q5",
        text: "Any final thoughts on our workplace?",
        placeholder: "Feel free to add any other observations or suggestions...",
      },
    ],
  },
}

export default function FeedbackPage() {
  const params = useParams()
  const id = params?.id as string
  const [isLoading, setIsLoading] = useState(true)

  const feedbackData = feedbackQuestionsData[id]

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-secondary border-t-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading feedback form...</p>
        </div>
      </div>
    )
  }

  if (!feedbackData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Feedback not found</h1>
          <p className="text-muted-foreground mb-6">The feedback survey you're looking for doesn't exist.</p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    )
  }

  const handleSubmit = async (responses: Record<string, string>) => {
    // Simulate API call
    console.log("Submitting feedback:", { taskId: id, responses })
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(undefined)
      }, 1000)
    })
  }

  return (
    <FeedbackForm
      taskId={id}
      taskTitle={feedbackData.title}
      questions={feedbackData.questions}
      onSubmit={handleSubmit}
    />
  )
}