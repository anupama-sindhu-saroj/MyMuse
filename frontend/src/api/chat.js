import { API_URL } from "./config"

export const sendMessage = async (userId, message) => {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, message })
  })
  return res.json()
}