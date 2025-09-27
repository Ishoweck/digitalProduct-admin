// src/pages/Orders.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";

type ShippingAddress = {
  fullName: string;
  street: string;
  city: string;
  state: string;
  country: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  userId: string;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: ShippingAddress;
  status: string;
  createdAt: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/orders?page=${page}&limit=10`);
        if (Array.isArray(res.data.data)) {
          setOrders(res.data.data);
          setPagination({
            total: res.data.total,
            page: res.data.page,
            limit: res.data.limit,
            totalPages: Math.ceil(res.data.total / res.data.limit),
          });
        } else {
          console.error("Unexpected response:", res.data);
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Orders</h1>

      {loading ? (
          <Loader/>
) : (
        <>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2">Order #</th>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Payment</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="text-primary font-medium hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-2">
                        <Link
                          to={`/admin/users/${order.userId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {order.userId}
                        </Link>
                      </td>
                      <td className="px-4 py-2">
                        {order.currency} {order.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        {order.paymentMethod} ({order.paymentStatus})
                      </td>
                      <td className="px-4 py-2">{order.status}</td>
                      <td className="px-4 py-2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
