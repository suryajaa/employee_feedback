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

interface Question {
  id: string
  text: string
  placeholder?: string
}

interface FeedbackFormProps {
  taskId: string
  taskTitle: string
  questions: Question[]
  onSubmit: (responses: Record<string, string>) => Promise<void>
}

// Storage wrapper that uses localStorage as fallback
const storage = {
  async get(key: string) {
    try {
      // Try window.storage first (for production)
      if (typeof window !== 'undefined' && (window as any).storage) {
        return await (window as any).storage.get(key)
      }
      // Fallback to localStorage for local development
      const value = localStorage.getItem(key)
      return value ? { key, value, shared: false } : null
    } catch (error) {
      console.error('Storage get error:', error)
      return null
    }
  },
  async set(key: string, value: string) {
    try {
      // Try window.storage first (for production)
      if (typeof window !== 'undefined' && (window as any).storage) {
        return await (window as any).storage.set(key, value)
      }
      // Fallback to localStorage for local development
      localStorage.setItem(key, value)
      return { key, value, shared: false }
    } catch (error) {
      console.error('Storage set error:', error)
      return null
    }
  },
  async delete(key: string) {
    try {
      // Try window.storage first (for production)
      if (typeof window !== 'undefined' && (window as any).storage) {
        return await (window as any).storage.delete(key)
      }
      // Fallback to localStorage for local development
      localStorage.removeItem(key)
      return { key, deleted: true, shared: false }
    } catch (error) {
      console.error('Storage delete error:', error)
      return null
    }
  }
}

export function FeedbackForm({ taskId, taskTitle, questions, onSubmit }: FeedbackFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [storageError, setStorageError] = useState<string | null>(null)

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const storageKey = `feedback_draft_${taskId}`

  const currentQuestion = questions[currentQuestionIndex]
  const isFirstQuestion = currentQuestionIndex === 0
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const currentResponse = responses[currentQuestion.id] || ""
  const hasInput = currentResponse.trim().length > 0

  // Calculate progress percentage
  const answeredCount = Object.keys(responses).filter(key => responses[key]?.trim().length > 0).length
  const progressPercentage = (answeredCount / questions.length) * 100
  const allQuestionsAnswered = answeredCount === questions.length

  // Load saved draft from persistent storage on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const result = await storage.get(storageKey)
        if (result?.value) {
          const savedData = JSON.parse(result.value)
          setResponses(savedData.responses || {})
          setCurrentQuestionIndex(savedData.currentQuestionIndex || 0)
          setLastSaved(savedData.lastSaved ? new Date(savedData.lastSaved) : null)
        }
      } catch (error) {
        console.error("Failed to load draft:", error)
        setStorageError("Failed to load saved draft")
      }
    }
    loadDraft()
  }, [taskId, storageKey])

  // Auto-save function
  const saveDraft = async (currentResponses: Record<string, string>, questionIndex: number) => {
    setIsSaving(true)
    setStorageError(null)

    try {
      const draftData = {
        responses: currentResponses,
        currentQuestionIndex: questionIndex,
        lastSaved: new Date().toISOString(),
      }

      await storage.set(storageKey, JSON.stringify(draftData))
      setLastSaved(new Date())
    } catch (error) {
      console.error("Failed to save draft:", error)
      setStorageError("Failed to auto-save")
    } finally {
      setIsSaving(false)
    }
  }

  // Debounced auto-save when responses change
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(() => {
      if (Object.keys(responses).length > 0) {
        saveDraft(responses, currentQuestionIndex)
      }
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [responses, currentQuestionIndex])

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex - 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  const handleResponseChange = (value: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }))
  }

  const handleSubmitClick = () => {
    if (allQuestionsAnswered) {
      setShowSubmitDialog(true)
    }
  }

  const handleConfirmSubmit = async () => {
    setShowSubmitDialog(false)
    setIsSubmitting(true)

    try {
      await onSubmit(responses)

      // Clear saved draft after successful submission
      try {
        await storage.delete(storageKey)
      } catch (error) {
        console.error("Failed to clear draft:", error)
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
      setStorageError("Failed to submit feedback. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatLastSaved = (date: Date | null) => {
    if (!date) return ""
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return "Saved just now"
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)} min ago`
    return `Saved ${Math.floor(diff / 3600)} hour ago`
  }

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

          {/* Enhanced Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                {answeredCount} of {questions.length} answered
              </span>
              <span className="font-medium text-primary">
                {Math.round(progressPercentage)}% complete
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
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
                  <span className="text-muted-foreground">{formatLastSaved(lastSaved)}</span>
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
            {/* Animated Textarea */}
            <div className={`transition-all duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}>
              <Textarea
                placeholder={currentQuestion.placeholder || "Share your thoughts here..."}
                value={currentResponse}
                onChange={(e) => handleResponseChange(e.target.value)}
                className="min-h-40 resize-none rounded-lg border border-input bg-card p-4 text-base text-card-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {currentResponse.length} characters
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isFirstQuestion}
                className="flex-1 bg-transparent"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {!isLastQuestion ? (
                <Button onClick={handleNext} disabled={!hasInput} className="flex-1">
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmitClick} disabled={!allQuestionsAnswered || isSubmitting} className="flex-1">
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Summary with visual indicators */}
        <div className="mt-8 rounded-lg bg-secondary/50 p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => {
                  setIsAnimating(true)
                  setTimeout(() => {
                    setCurrentQuestionIndex(index)
                    setIsAnimating(false)
                  }, 300)
                }}
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
              You've answered all {questions.length} questions. Once submitted, you won't be able to make changes to your responses. Are you sure you want to submit your feedback?
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