import  { useEffect, useState } from 'react'
import api from '../api/axios'
import { Link } from 'react-router-dom'
// import FullScreenLoader from '../components/Loader'
import Loader from '../components/Loader'

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

type Pagination = {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/admin/users?page=${page}`)
        if (Array.isArray(res.data.data)) {
          setUsers(res.data.data)
          setPagination(res.data.pagination)
        } else {
          console.error('Unexpected response format:', res.data)
          setUsers([])
          setPagination(null)
        }
      } catch (err) {
        console.error('Error fetching users:', err)
        setUsers([])
        setPagination(null)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [page])

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      <h1 className="text-3xl font-bold text-[#D7195B] mb-8">Users</h1>

      {loading ? (
       <Loader/>
      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Country</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Email ✓</th>
                  <th className="px-6 py-4">Phone ✓</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-6 text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-medium">
                        <Link
                          to={`/admin/users/${user._id}`}
                          className="text-[#D7195B] hover:underline"
                        >
                          {user.firstName} {user.lastName}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{user.phone || '—'}</td>
                      <td className="px-6 py-4">{user.country || '—'}</td>
                      <td className="px-6 py-4">{user.role}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-[#D7195B] text-white text-xs px-2 py-1 rounded-full">
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isEmailVerified ? '✅' : '❌'}
                      </td>
                      <td className="px-6 py-4">
                        {user.isPhoneVerified ? '✅' : '❌'}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleString()
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-4 items-center mt-6">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-[#D7195B] text-white rounded disabled:opacity-50"
              >
                ← Prev
              </button>

              <span className="text-sm text-gray-700">
                Page <strong>{pagination.page}</strong> of{' '}
                <strong>{pagination.totalPages}</strong> — {pagination.total} users
              </span>

              <button
                onClick={() =>
                  setPage((p) => Math.min(p + 1, pagination.totalPages))
                }
                disabled={page === pagination.totalPages}
                className="px-4 py-2 bg-[#D7195B] text-white rounded disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
