import { useEffect, useState } from "react"
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

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteReason, setDeleteReason] = useState("")

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

  const handleUserDeleteRequest = async () => {
    if (!user || !deleteReason.trim()) {
      alert("Please provide a reason for deletion.")
      return
    }

    setActionLoading(true)

    try {
      await api.post("/deletion/admin-submit", {
        accountId: user._id,
        accountType: "User",
        reason: deleteReason,
      })

      alert("User deletion request submitted successfully.")
      setShowDeleteModal(false)
      setDeleteReason("")
      navigate("/admin/users") // or stay on page
    } catch (err: any) {
      console.error("Deletion request failed:", err)
      alert(err?.response?.data?.message || "Failed to submit deletion request.")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading...</p>
  if (!user) return <p className="text-center mt-10 text-red-500">User not found</p>

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button
        className="text-gray-600 hover:text-black mb-4 inline-block"
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

      {/* Status Buttons */}
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={() => handleStatusChange("ACTIVE")}
          disabled={actionLoading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition"
        >
          Activate
        </button>
        <button
          onClick={() => handleStatusChange("SUSPENDED")}
          disabled={actionLoading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition"
        >
          Suspend
        </button>
      </div>

      {/* Delete Button */}
      <div className="mt-6">
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={actionLoading}
          className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg disabled:opacity-50 transition"
        >
          Request Deletion
        </button>
      </div>

      {/* Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/10">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-red-700">Request User Deletion</h2>
            <textarea
              rows={4}
              className="w-full border rounded p-2"
              placeholder="Enter reason for deletion..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteReason("")
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUserDeleteRequest}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
