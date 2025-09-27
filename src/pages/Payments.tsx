// src/pages/Payments.tsx
import  { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";

type Payment = {
  _id: string;
  orderId: string;
  userId: string;
  reference: string;
  gateway: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  amount: number;
  currency: string;
  createdAt: string;
  metadata?: {
    orderId?: string;
    userId?: string;
    orderNumber?: string;
  };
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/payments?page=${page}&limit=10`);

        if (Array.isArray(res.data.data)) {
          setPayments(res.data.data);
          setPagination({
            total: res.data.total,
            page: res.data.page,
            limit: res.data.limit,
            totalPages: Math.ceil(res.data.total / res.data.limit),
          });
        } else {
          setPayments([]);
          setPagination(null);
        }
      } catch (err) {
        console.error("Error fetching payments:", err);
        setPayments([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Payments</h1>

      {loading ? (
          <Loader/>
) : (
        <>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2">Reference</th>
                  <th className="px-4 py-2">Order</th>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Gateway</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">
                        <Link
                          to={`/admin/payments/${payment._id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {payment.reference}
                        </Link>
                      </td>
                      <td className="px-4 py-2">
                        <Link
                          to={`/admin/orders/${payment.orderId}`}
                          className="text-primary hover:underline"
                        >
                          {payment.metadata?.orderNumber || payment.orderId}
                        </Link>
                      </td>
                      <td className="px-4 py-2">
                        <Link
                          to={`/admin/users/${payment.userId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {payment.userId.slice(-6)}
                        </Link>
                      </td>
                      <td className="px-4 py-2">{payment.gateway}</td>
                      <td className="px-4 py-2">
                        {payment.currency} {payment.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            payment.status === "SUCCESS"
                              ? "bg-green-100 text-green-700"
                              : payment.status === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Prev
              </button>

              <span>
                Page {pagination.page} of {pagination.totalPages} — Total:{" "}
                {pagination.total}
              </span>

              <button
                onClick={() =>
                  setPage((p) => Math.min(p + 1, pagination.totalPages))
                }
                disabled={page === pagination.totalPages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
