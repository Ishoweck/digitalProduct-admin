import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

type DeletionRequest = {
  _id: string
  accountId: string
  accountType: 'User' | 'Vendor'
  requestedBy: {
    _id: string
    firstName?: string
    lastName?: string
    email?: string
  }
  reason?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELETED'
  decisionReason?: string
  decidedBy?: {
    _id: string
    firstName?: string
    lastName?: string
    email?: string
  }
  requestedAt: string
  decidedAt?: string
  deletedAt?: string
}

const getStatusColor = (status: DeletionRequest['status']) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'APPROVED':
      return 'bg-green-100 text-green-800'
    case 'REJECTED':
      return 'bg-red-100 text-red-800'
    case 'DELETED':
      return 'bg-gray-200 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

// Simple reusable modal
const Modal: React.FC<{
  title: string
  show: boolean
  onClose: () => void
  onConfirm?: () => void
  confirmText?: string
  loading?: boolean
  children?: React.ReactNode
}> = ({ title, show, onClose, onConfirm, confirmText = 'Confirm', loading = false, children }) => {
  if (!show) return null

  return (
<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/10">
<div className="bg-white/60 backdrop-blur-md border border-white/20 rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div>{children}</div>
        <div className="flex justify-end mt-6 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            disabled={loading}
          >
            Cancel
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const DeleteAcct = () => {
  const [requests, setRequests] = useState<DeletionRequest[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const navigate = useNavigate()

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'APPROVE' | 'REJECT' | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<DeletionRequest | null>(null)
  const [decisionReason, setDecisionReason] = useState('')
  const [feedbackModal, setFeedbackModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  })

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await api.get('/deletion')
      setRequests(res.data.data)
    } catch (err) {
      console.error('Error fetching deletion requests:', err)
      setFeedbackModal({ show: true, message: 'Failed to load deletion requests.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAction = async () => {
    if (!selectedRequest || !modalType) return

    if (modalType === 'REJECT' && (!decisionReason || decisionReason.trim() === '')) {
      setFeedbackModal({ show: true, message: 'Rejection must have a reason.' })
      return
    }

    setActionLoading(selectedRequest._id)
    try {
      await api.post(`/deletion/${selectedRequest._id}/handle`, {
        action: modalType,
        decisionReason,
      })
      setModalOpen(false)
      setFeedbackModal({ show: true, message: `Request ${modalType}ED successfully.` })
      fetchRequests()
    } catch (err: any) {
      console.error('Error handling deletion request:', err)
      setFeedbackModal({
        show: true,
        message: err?.response?.data?.message || `Failed to ${modalType.toLowerCase()} request.`,
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Loading deletion requests...</p>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-primary">Account Deletion Requests</h1>

      {requests.length === 0 ? (
        <p className="text-gray-600">No deletion requests found.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white shadow-md rounded-lg p-6 flex flex-col md:flex-row justify-between gap-4"
            >
              <div className="flex-1 space-y-1 text-sm text-gray-700">
                <div>
                  <span className="font-semibold">Account Type:</span> {req.accountType}
                </div>
                <div>
                  <span className="font-semibold">Account ID:</span> {req.accountId}
                </div>
                <div>
                  <span className="font-semibold">Requested By:</span>{' '}
                  {req.requestedBy?.firstName ?? ''} {req.requestedBy?.lastName ?? ''} (
                  {req.requestedBy?.email})
                </div>
                <div>
                  <span className="font-semibold">Reason:</span> {req.reason || '-'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Status:</span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                      req.status
                    )}`}
                  >
                    {req.status}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Requested At:</span>{' '}
                  {new Date(req.requestedAt).toLocaleString()}
                </div>

                {req.status !== 'PENDING' && (
                  <>
                    <div>
                      <span className="font-semibold">Decision Reason:</span>{' '}
                      {req.decisionReason || '-'}
                    </div>
                    <div>
                      <span className="font-semibold">Decided By:</span>{' '}
                      {req.decidedBy?.firstName ?? ''} {req.decidedBy?.lastName ?? ''} (
                      {req.decidedBy?.email})
                    </div>
                    {req.deletedAt && (
                      <div>
                        <span className="font-semibold">Deleted At:</span>{' '}
                        {new Date(req.deletedAt).toLocaleString()}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex md:flex-col gap-2 items-start">
                {req.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        setModalType('APPROVE')
                        setSelectedRequest(req)
                        setModalOpen(true)
                        setDecisionReason('')
                      }}
                      disabled={actionLoading === req._id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setModalType('REJECT')
                        setSelectedRequest(req)
                        setModalOpen(true)
                        setDecisionReason('')
                      }}
                      disabled={actionLoading === req._id}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    if (req.accountType === 'User') {
                      navigate(`/admin/users/${req.accountId}`)
                    } else {
                      navigate(`/admin/vendors/${req.accountId}`)
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                  View Account
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for approve/reject input */}
      <Modal
        title={`${modalType === 'APPROVE' ? 'Approve' : 'Reject'} Request`}
        show={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleSubmitAction}
        confirmText={modalType === 'APPROVE' ? 'Approve' : 'Reject'}
        loading={actionLoading === selectedRequest?._id}
      >
        <label className="block text-sm font-medium mb-1 text-gray-700">Reason:</label>
        <textarea
          value={decisionReason}
          onChange={(e) => setDecisionReason(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 text-sm"
          rows={4}
          placeholder={`Enter ${modalType?.toLowerCase()} reason`}
        />
      </Modal>

      {/* Feedback Modal */}
      <Modal
        title="Notification"
        show={feedbackModal.show}
        onClose={() => setFeedbackModal({ show: false, message: '' })}
      >
        <p className="text-sm text-gray-700">{feedbackModal.message}</p>
      </Modal>
    </div>
  )
}

export default DeleteAcct
