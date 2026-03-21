import { API_URL } from "./config"

export const createPayment = async (bookingId, token) => {
  const res = await fetch(`${API_URL}/payment/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ booking_id: bookingId })
  })
  return res.json()
}

export const verifyPayment = async (paymentData, token) => {
  const res = await fetch(`${API_URL}/payment/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(paymentData)
  })
  return res.json()
}
