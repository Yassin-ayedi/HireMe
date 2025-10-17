"use server";

/* 
// 🔒 Real logic — uncomment this when the platform authentication microservice is ready

export async function getCurrentUser() {
  try {
    const res = await fetch(`${process.env.PLATFORM_URL}/api/auth/me`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to fetch user data");
    const user = await res.json();

    return user; // expected: { id, name, email, role, ... }
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
*/

// ✅ Temporary mock version for standalone service development
export async function getCurrentUser() {
  console.log("🧩 Mock: fetching current user (service standalone mode)");
  await new Promise((resolve) => setTimeout(resolve, 300)); // simulate small delay

  // return simulated user data
  return {
  id: "user123",
  name: "yassin",
  email: "yassinayadi789@gmail.com"
}

}
