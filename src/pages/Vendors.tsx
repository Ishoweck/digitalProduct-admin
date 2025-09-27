import  { useEffect, useState } from 'react'
import api from '../api/axios'
import { Link } from 'react-router-dom'
import Loader from '../components/Loader'

type Vendor = {
  _id: string
  businessName: string
  commissionRate: number
  isActive: boolean
  isSponsored: boolean
  rating: number
  totalProducts: number
  totalSales: number
  verificationStatus: string
  createdAt: string
  updatedAt: string
  userId: {
    _id: string
    email: string
    phone?: string
    firstName: string
    lastName: string
  }
}

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true)
      try {
        const res = await api.get('/admin/vendors')

        if (Array.isArray(res.data.data)) {
          setVendors(res.data.data)
        } else {
          console.error('Unexpected response format:', res.data)
          setVendors([])
        }
      } catch (err) {
        console.error('Error fetching vendors:', err)
        setVendors([])
      } finally {
        setLoading(false)
      }
    }
    fetchVendors()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Vendors</h1>

      {loading ? (
       <Loader/>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Business</th>
                <th className="px-4 py-2">Owner</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Verification</th>
                <th className="px-4 py-2">Joined</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    No vendors found
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor._id} className="border-b">
                    <td className="px-4 py-2">{vendor.businessName}</td>
                    <td className="px-4 py-2">
                      {vendor.userId.firstName} {vendor.userId.lastName}
                    </td>
                    <td className="px-4 py-2">{vendor.userId.email}</td>
                    <td className="px-4 py-2">
                      {vendor.userId.phone || '-'}
                    </td>
                    <td className="px-4 py-2">
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </td>
                    <td className="px-4 py-2">{vendor.verificationStatus}</td>
                    <td className="px-4 py-2">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">

                      <Link to={`/admin/vendors/${vendor._id}`}>
                      <button
                        className="text-primary underline"
                       
                      >
                        View
                      </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
