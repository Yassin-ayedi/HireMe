import { db } from "@/firebase/config";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

/**
 * Get all interviews for a specific user
 */
export async function getInterviewsByUserId(userId: string): Promise<Interview[]> {
  try {
    const q = query(
      collection(db, "interviews"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const interviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];

    return interviews;
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    return [];
  }
}