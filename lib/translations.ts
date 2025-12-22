// Translation file for Arabic and English
export const translations = {
  ar: {
    // Insurance types
    vehicles: "مركبات",
    medical: "طبي",
    medicalErrors: "أخطاء طبية",
    travel: "سفر",
    
    // Service types
    newInsurance: "تأمين جديد",
    ownershipTransfer: "نقل ملكية",
    
    // Document types
    form: "استمارة",
    customsCard: "بطاقة جمركية",
    
    // Form fields
    identityNumber: "رقم الهوية / الإقامة",
    ownerName: "اسم مالك الوثيقة كاملاً",
    phoneNumber: "رقم الهاتف",
    serialNumber: "الرقم التسلسلي",
    customsDeclarationNumber: "رقم البيان الجمركي",
    verificationCode: "رمز التحقق",
    
    // Ownership transfer fields
    buyerName: "اسم المشتري",
    buyerIdNumber: "رقم هوية المشتري",
    
    // Buttons
    showOffers: "إظهار العروض",
    refresh: "تحديث",
    
    // Steps
    payment: "الدفع",
    availableOffers: "العروض المتاحة",
    insuranceData: "بيانات التأمين",
    
    // Errors
    identityMust10Digits: "رقم الهوية يجب أن يكون 10 أرقام",
    identityMustStartWith12: "رقم الهوية يجب أن يبدأ بـ 1 أو 2",
    invalidIdentityNumber: "رقم الهوية غير صالح",
    incorrectCaptcha: "رمز التحقق غير صحيح",
  },
  en: {
    // Insurance types
    vehicles: "Vehicles",
    medical: "Medical",
    medicalErrors: "Medical Errors",
    travel: "Travel",
    
    // Service types
    newInsurance: "New Insurance",
    ownershipTransfer: "Ownership Transfer",
    
    // Document types
    form: "Form",
    customsCard: "Customs Card",
    
    // Form fields
    identityNumber: "ID / Iqama Number",
    ownerName: "Full Policy Owner Name",
    phoneNumber: "Phone Number",
    serialNumber: "Serial Number",
    customsDeclarationNumber: "Customs Declaration Number",
    verificationCode: "Verification Code",
    
    // Ownership transfer fields
    buyerName: "Buyer Name",
    buyerIdNumber: "Buyer ID Number",
    
    // Buttons
    showOffers: "Show Offers",
    refresh: "Refresh",
    
    // Steps
    payment: "Payment",
    availableOffers: "Available Offers",
    insuranceData: "Insurance Data",
    
    // Errors
    identityMust10Digits: "ID number must be 10 digits",
    identityMustStartWith12: "ID number must start with 1 or 2",
    invalidIdentityNumber: "Invalid ID number",
    incorrectCaptcha: "Incorrect verification code",
  },
}

export type Language = "ar" | "en"

export const getTranslation = (key: keyof typeof translations.ar, lang: Language) => {
  return translations[lang][key] || key
}
