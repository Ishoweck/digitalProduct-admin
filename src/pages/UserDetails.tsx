// src/pages/UserDetails.tsx
import  { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api/axios"

type User = {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  country?: string
  role: string
  status: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
  createdAt: string
  lastLoginAt?: string
}

export default function UserDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/admin/users/${id}`)
        setUser(res.data.data)
      } catch (err) {
        console.error("Error fetching user:", err)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchUser()
  }, [id])

  const handleStatusChange = async (status: "ACTIVE" | "SUSPENDED") => {
    if (!user) return
    setActionLoading(true)
    try {
      await api.patch(`/admin/users/${user._id}/status`, { status })
      setUser({ ...user, status })
    } catch (err) {
      console.error("Failed to update user status:", err)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <p>Loading...</p>
  if (!user) return <p>User not found</p>

  return (
    <div>
      <button
        className="text-gray-500 mb-4 underline"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-primary mb-6">
        {user.firstName} {user.lastName}
      </h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-3">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone || "-"}</p>
        <p><strong>Country:</strong> {user.country || "-"}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Status:</strong> {user.status}</p>
        <p><strong>Email Verified:</strong> {user.isEmailVerified ? "✅" : "❌"}</p>
        <p><strong>Phone Verified:</strong> {user.isPhoneVerified ? "✅" : "❌"}</p>
        <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        <p><strong>Last Login:</strong> {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "-"}</p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => handleStatusChange("ACTIVE")}
          disabled={actionLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
        >
          Activate
        </button>
        <button
          onClick={() => handleStatusChange("SUSPENDED")}
          disabled={actionLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
        >
          Suspend
        </button>
      </div>
    </div>
  )
}
