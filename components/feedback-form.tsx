"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Check, Save, AlertCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"

interface FeedbackFormProps {
  taskId: string
  taskTitle: string
  questions: Array<{
    id: string
    text: string
    placeholder?: string
  }>
  onSubmit: (responses: Record<string, string>) => Promise<void>
}

/* ---------------- LOCAL STORAGE HELPERS ---------------- */

const storage = {
  async get(key: string) {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  },
  async set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  async delete(key: string) {
    localStorage.removeItem(key)
  },
}

/* ---------------- COMPONENT ---------------- */

export function FeedbackForm({
  taskId,
  taskTitle,
  questions,
  onSubmit,
}: FeedbackFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [storageError, setStorageError] = useState<string | null>(null)

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)
  const storageKey = `feedback_draft_${taskId}`

  const currentQuestion = questions[currentQuestionIndex]
  const isFirst = currentQuestionIndex === 0
  const isLast = currentQuestionIndex === questions.length - 1
  const currentResponse = responses[currentQuestion.id] || ""

  const answeredCount = Object.values(responses).filter(v => v.trim()).length
  const progress = (answeredCount / questions.length) * 100
  const allAnswered = answeredCount === questions.length

  /* ---------------- LOAD DRAFT ---------------- */

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await storage.get(storageKey)
        if (draft) {
          setResponses(draft.responses ?? {})
          setCurrentQuestionIndex(draft.index ?? 0)
          setLastSaved(draft.savedAt ? new Date(draft.savedAt) : null)
        }
      } catch (err) {
        console.error("Failed to load draft:", err)
        setStorageError("Failed to load saved draft")
      }
    }
    loadDraft()
  }, [storageKey])

  /* ---------------- AUTO SAVE ---------------- */

  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)

    autoSaveTimer.current = setTimeout(async () => {
      if (Object.keys(responses).length > 0) {
        setIsSaving(true)
        setStorageError(null)
        try {
          await storage.set(storageKey, {
            responses,
            index: currentQuestionIndex,
            savedAt: new Date().toISOString(),
          })
          setLastSaved(new Date())
        } catch (err) {
          setStorageError("Failed to auto-save")
        } finally {
          setIsSaving(false)
        }
      }
    }, 1500)

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [responses, currentQuestionIndex, storageKey])

  /* ---------------- NAVIGATION ---------------- */

  const navigateTo = (index: number) => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentQuestionIndex(index)
      setIsAnimating(false)
    }, 300)
  }

  /* ---------------- SUBMIT ---------------- */

  const handleConfirmSubmit = async () => {
    setShowSubmitDialog(false)
    setIsSubmitting(true)
    try {
      await onSubmit(responses)
      await storage.delete(storageKey)
      setIsSubmitted(true)
    } catch (err) {
      console.error("Submit failed", err)
      setStorageError("Failed to submit feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ---------------- SUCCESS STATE ---------------- */

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-12 pb-12">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-foreground">Thank You!</h2>
                <p className="mb-8 text-muted-foreground">
                  Your feedback has been successfully submitted. We truly appreciate you taking the time to share your
                  valuable insights.
                </p>
                <Button asChild className="w-full">
                  <a href="/dashboard">Return to Dashboard</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  /* ---------------- MAIN UI ---------------- */

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">

        {/* Progress Header */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <h1 className="mb-2 text-3xl font-bold text-foreground">{taskTitle}</h1>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                {answeredCount} of {questions.length} answered
              </span>
              <span className="font-medium text-primary">
                {Math.round(progress)}% complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Auto-save indicator */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {isSaving ? (
                <>
                  <Save className="h-3 w-3 animate-pulse text-muted-foreground" />
                  <span className="text-muted-foreground">Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <Check className="h-3 w-3 text-green-600" />
                  <span className="text-muted-foreground">Saved just now</span>
                </>
              ) : null}
            </div>
            {storageError && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="h-3 w-3" />
                <span>{storageError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Question Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{currentQuestion.text}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className={`transition-all duration-300 ${isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
              <Textarea
                placeholder={currentQuestion.placeholder || "Share your thoughts here..."}
                value={currentResponse}
                onChange={(e) =>
                  setResponses(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))
                }
                className="min-h-40 resize-none rounded-lg border border-input bg-card p-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {currentResponse.length} characters
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => navigateTo(currentQuestionIndex - 1)}
                disabled={isFirst}
                className="flex-1 bg-transparent"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {!isLast ? (
                <Button
                  onClick={() => navigateTo(currentQuestionIndex + 1)}
                  disabled={!currentResponse.trim()}
                  className="flex-1"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  disabled={!allAnswered || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dot Navigation */}
        <div className="mt-8 rounded-lg bg-secondary/50 p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => navigateTo(index)}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all ${index === currentQuestionIndex
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                    : responses[q.id]?.trim()
                      ? "bg-primary/20 text-primary hover:bg-primary/30"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                title={`Question ${index + 1}${responses[q.id]?.trim() ? " (answered)" : ""}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Feedback?</AlertDialogTitle>
            <AlertDialogDescription>
              You've answered all {questions.length} questions. Once submitted, you won't be able to make changes. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Yes, Submit Feedback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}