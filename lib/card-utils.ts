// Card type detection based on BIN (Bank Identification Number)
export function detectCardType(cardNumber: string): string | null {
    const cleanNumber = cardNumber.replace(/\s/g, "")
  
    // Visa: starts with 4
    if (/^4/.test(cleanNumber)) {
      return "Visa"
    }
  
    // Mastercard: starts with 51-55 or 2221-2720
    if (/^5[1-5]/.test(cleanNumber) || /^2(22[1-9]|2[3-9]|[3-6]|7[01]|720)/.test(cleanNumber)) {
      return "Mastercard"
    }
  
    // American Express: starts with 34 or 37
    if (/^3[47]/.test(cleanNumber)) {
      return "Amex"
    }
  
    // Discover: starts with 6011, 622126-622925, 644-649, or 65
    if (/^6011|^622[1-9]|^64[4-9]|^65/.test(cleanNumber)) {
      return "Discover"
    }
  
    // Mada (Saudi Arabia): starts with specific BINs
    const madaBins = [
      "4", // Some Mada cards start with 4
      "5", // Some Mada cards start with 5
      "508160",
      "508161",
      "508162",
      "508163",
      "508164",
      "508165",
      "508166",
      "508167",
      "508168",
      "508169",
      "529415",
      "529416",
      "529417",
      "529418",
      "529419",
      "535825",
      "535826",
      "535827",
      "535828",
      "535829",
      "543357",
      "543358",
      "543359",
      "549760",
      "549761",
      "549762",
      "549763",
      "585265",
      "585266",
      "585267",
      "585268",
      "604906",
      "636120",
    ]
  
    for (const bin of madaBins) {
      if (cleanNumber.startsWith(bin) && bin.length > 2) {
        return "Mada"
      }
    }
  
    // JCB: starts with 3528-3589
    if (/^35[2-8]/.test(cleanNumber)) {
      return "JCB"
    }
  
    // Diners Club: starts with 36 or 38 or 300-305
    if (/^3[068]|^30[0-5]/.test(cleanNumber)) {
      return "Diners"
    }
  
    // UnionPay: starts with 62
    if (/^62/.test(cleanNumber)) {
      return "UnionPay"
    }
  
    return null
  }
  
  // Format card number with spaces
  export function formatCardNumber(value: string): string {
    const cleanValue = value.replace(/\s/g, "").replace(/\D/g, "")
    const groups = cleanValue.match(/.{1,4}/g)
    return groups ? groups.join(" ") : cleanValue
  }
  
  // Format expiry date as MM/YY
  export function formatExpiryDate(value: string): string {
    const cleanValue = value.replace(/\D/g, "")
  
    if (cleanValue.length >= 2) {
      let month = cleanValue.slice(0, 2)
      const year = cleanValue.slice(2, 4)
  
      // Validate month
      if (Number.parseInt(month) > 12) {
        month = "12"
      }
      if (Number.parseInt(month) === 0) {
        month = "01"
      }
  
      return year ? `${month}/${year}` : month
    }
  
    return cleanValue
  }
  
  // Get bank information based on BIN
  // This is a simplified version. In production, you would use a BIN lookup API
  export function getBankInfo(cardNumber: string): { name: string; country: string } | null {
    const bin = cardNumber.replace(/\s/g, "").slice(0, 6)
  
    // Sample BIN database (you would use a real API service in production)
    const binDatabase: Record<string, { name: string; country: string }> = {
      // Saudi Banks
      "508160": { name: "البنك الأهلي التجاري (NCB)", country: "المملكة العربية السعودية" },
      "529415": { name: "مصرف الراجحي", country: "المملكة العربية السعودية" },
      "535825": { name: "بنك الرياض", country: "المملكة العربية السعودية" },
      "543357": { name: "بنك ساب", country: "المملكة العربية السعودية" },
      "604906": { name: "بنك البلاد", country: "المملكة العربية السعودية" },
      "636120": { name: "بنك الجزيرة", country: "المملكة العربية السعودية" },
  
      // International Banks (examples)
      "422644": { name: "Chase Bank", country: "USA" },
      "411111": { name: "Visa Test Card", country: "International" },
      "543210": { name: "Mastercard Test", country: "International" },
      "400000": { name: "Visa Classic", country: "International" },
      "510000": { name: "Mastercard Standard", country: "International" },
    }
  
    // Check for exact BIN match
    if (binDatabase[bin]) {
      return binDatabase[bin]
    }
  
    // Check for partial matches (first 4 digits)
    const partialBin = bin.slice(0, 4)
    for (const key in binDatabase) {
      if (key.startsWith(partialBin)) {
        return binDatabase[key]
      }
    }
  
    // Default fallback based on card type
    const cardType = detectCardType(cardNumber)
    if (cardType === "Mada") {
      return { name: "بنك سعودي", country: "المملكة العربية السعودية" }
    } else if (cardType === "Visa") {
      return { name: "Visa", country: "دولي" }
    } else if (cardType === "Mastercard") {
      return { name: "Mastercard", country: "دولي" }
    }
  
    return null
  }
  
  // Validate CVV based on card type
  export function validateCVV(cvv: string, cardType: string | null): boolean {
    if (cardType === "Amex") {
      return cvv.length === 4
    }
    return cvv.length === 3
  }
  
// Luhn algorithm to validate card number
export function luhnCheck(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\s/g, "")
  
  if (!/^\d+$/.test(cleanNumber)) {
    return false
  }
  
  let sum = 0
  let isEven = false
  
  // Loop through values starting from the rightmost digit
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i])
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}
