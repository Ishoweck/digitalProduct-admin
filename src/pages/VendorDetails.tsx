// src/pages/VendorDetails.tsx

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import "../index.css"

type VerificationDocument = {
  name?: string
  url: string
  type?: string
}

type Vendor = {
  _id: string
  businessName: string
  commissionRate: number
  isActive: boolean
  isSponsored: boolean
  rating: number
  totalProducts: number
  totalSales: number
  verificationStatus: 'NOT_VERIFIED' | 'APPROVED' | 'REJECTED' | "PENDING"
  verificationDocuments?: VerificationDocument[]
  createdAt: string
  updatedAt: string
  rejectionReason?: string
  userId: {
    _id: string
    email: string
    phone?: string
    firstName: string
    lastName: string
  }
}

export default function VendorDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')

  useEffect(() => {
    const fetchVendor = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/admin/vendors/${id}`)
        const rawVendor = res.data.data

        const documents = rawVendor.verificationDocuments || []
        rawVendor.verificationDocuments = documents.map((doc: any) => {
          if (typeof doc === 'string') {
            return { url: doc }
          }
          return doc
        })

        setVendor(rawVendor)
      } catch (err) {
        console.error('Error fetching vendor:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchVendor()
  }, [id])

  const handleVerification = async (
    status: 'APPROVED' | 'REJECTED',
    reason?: string
  ) => {
    if (!vendor) return
    setActionLoading(true)

    try {
      await api.patch(`/vendors/${vendor._id}/verify`, {
        verificationStatus: status,
        rejectionReason: reason,
      })
      setVendor({ ...vendor, verificationStatus: status, rejectionReason: reason })
    } catch (err) {
      console.error('Verification failed:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleVendorDeleteRequest = async () => {
    if (!vendor || !deleteReason.trim()) {
      alert("Please provide a reason for deletion.")
      return
    }

    setActionLoading(true)

    try {
      await api.post("/deletion/admin-submit", {
        accountId: vendor._id,
        accountType: "Vendor",
        reason: deleteReason,
      })

      alert("Vendor deletion request submitted successfully.")
      setShowDeleteModal(false)
      setDeleteReason("")
      navigate("/admin/vendors") // or stay on page
    } catch (err: any) {
      console.error("Deletion request failed:", err)
      alert(err?.response?.data?.message || "Failed to submit deletion request.")
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (previewIndex === null || !vendor?.verificationDocuments) return

      if (e.key === 'Escape') {
        setPreviewIndex(null)
      } else if (e.key === 'ArrowRight') {
        setPreviewIndex((prev) =>
          prev !== null && prev < vendor.verificationDocuments!.length - 1
            ? prev + 1
            : prev
        )
      } else if (e.key === 'ArrowLeft') {
        setPreviewIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : prev
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [previewIndex, vendor])

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading...</p>
  if (!vendor) return <p className="text-center mt-10 text-red-500">Vendor not found</p>

  const renderDocument = (doc: VerificationDocument, idx: number) => {
    const fileType = doc.type || doc.url.split('.').pop()?.toLowerCase()

    if (fileType?.match(/jpg|jpeg|png|webp|gif/)) {
      return (
        <div
          key={idx}
          className="border rounded-lg p-2 flex flex-col items-center cursor-pointer hover:shadow-md transition"
          onClick={() => setPreviewIndex(idx)}
        >
          <img
            src={doc.url}
            alt={doc.name || `Document ${idx + 1}`}
            className="h-32 w-auto object-cover rounded"
          />
          <p className="mt-2 text-sm text-gray-600 truncate w-full text-center">
            {doc.name || `Document ${idx + 1}`}
          </p>
        </div>
      )
    }

    if (fileType === 'pdf') {
      return (
        <div
          key={idx}
          className="border rounded-lg p-4 flex flex-col items-center bg-gray-50"
        >
          <span className="text-red-600 font-bold text-lg">📄 PDF</span>
          <p className="mt-2 text-sm">{doc.name || `Document ${idx + 1}`}</p>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline mt-2 text-sm"
          >
            Open
          </a>
        </div>
      )
    }

    return (
      <div
        key={idx}
        className="border rounded-lg p-4 flex flex-col items-center bg-gray-50"
      >
        <span className="text-gray-600">📎 {doc.name || `Document ${idx + 1}`}</span>
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline mt-2 text-sm"
        >
          Download
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <button
        className="text-gray-600 hover:text-black mb-4 inline-block"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold text-primary mb-6">
        Business Name: {vendor.businessName}
      </h1>

      <div className="bg-white shadow rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p><strong>Owner:</strong> {vendor.userId.firstName} {vendor.userId.lastName}</p>
          <p><strong>Email:</strong> {vendor.userId.email}</p>
          <p><strong>Phone:</strong> {vendor.userId.phone || '-'}</p>
          <p><strong>Status:</strong> {vendor.isActive ? 'Active' : 'Inactive'}</p>
          <p>
            <strong>Verification:</strong>{' '}
            <span
              className={`px-2 py-1 rounded text-white text-xs ${
                vendor.verificationStatus === 'APPROVED'
                  ? 'bg-green-600'
                  : vendor.verificationStatus === 'REJECTED'
                  ? 'bg-red-600'
                  : 'bg-yellow-500'
              }`}
            >
              {vendor.verificationStatus}
            </span>
          </p>

          {vendor.verificationStatus === 'REJECTED' && vendor.rejectionReason && (
            <p className="text-sm text-red-500 mt-2">
              <strong>Reason:</strong> {vendor.rejectionReason}
            </p>
          )}
        </div>

        <div>
          <p><strong>Commission Rate:</strong> {(vendor.commissionRate * 100).toFixed(0)}%</p>
          <p><strong>Products:</strong> {vendor.totalProducts}</p>
          <p><strong>Sales:</strong> {vendor.totalSales}</p>
          <p><strong>Rating:</strong> {vendor.rating}</p>
          <p><strong>Joined:</strong> {new Date(vendor.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {vendor.verificationDocuments && vendor.verificationDocuments.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6 mt-8">
          <h2 className="text-lg font-semibold mb-4">Verification Documents</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {vendor.verificationDocuments.map((doc, idx) => renderDocument(doc, idx))}
          </div>
        </div>
      )}

      {(vendor.verificationStatus === 'NOT_VERIFIED' || vendor.verificationStatus === 'PENDING') && (
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={() => handleVerification('APPROVED')}
            disabled={actionLoading}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition"
          >
            Approve
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={actionLoading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition"
          >
            Reject
          </button>
        </div>
      )}

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

      {/* Rejection Modal */}
      {showRejectModal && (
<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/10">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-red-600">Reject Vendor</h2>
            <textarea
              rows={4}
              className="w-full border rounded p-2"
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!rejectionReason.trim()) {
                    alert("Please provide a reason for rejection.")
                    return
                  }
                  handleVerification('REJECTED', rejectionReason)
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deletion Modal */}
      {showDeleteModal && (
<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/10">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-red-700">Request Vendor Deletion</h2>
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
                  setDeleteReason('')
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleVendorDeleteRequest}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Preview */}
      {previewIndex !== null && vendor.verificationDocuments && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setPreviewIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-white text-2xl"
              onClick={() => setPreviewIndex(null)}
            >
              ✕
            </button>

            <img
              src={vendor.verificationDocuments[previewIndex].url}
              alt={vendor.verificationDocuments[previewIndex].name}
              className="max-h-[80vh] mx-auto rounded-lg"
            />
            <p className="text-center text-white mt-4">
              {vendor.verificationDocuments[previewIndex].name}
            </p>

            {previewIndex > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl"
                onClick={() => setPreviewIndex(previewIndex - 1)}
              >
                ‹
              </button>
            )}
            {previewIndex < vendor.verificationDocuments.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl mt-2"
                onClick={() => setPreviewIndex(previewIndex + 1)}
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
