// src/pages/PaymentDetails.tsx
import  { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

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
  updatedAt: string;
  metadata?: {
    orderId?: string;
    userId?: string;
    orderNumber?: string;
  };
};

export default function PaymentDetails() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchPayment = async () => {
      if (!paymentId) return;
      setLoading(true);
      try {
        const res = await api.get(`/admin/payments/${paymentId}`);
        setPayment(res.data.data);
      } catch (err) {
        console.error("Error fetching payment:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [paymentId]);

  const handleUpdateStatus = async (status: "SUCCESS" | "FAILED") => {
    if (!payment) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/payments/${payment._id}/status`, { status });
      setPayment({ ...payment, status });
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!payment) return <p>Payment not found</p>;

  return (
    <div>
      <button
        className="text-gray-500 mb-4 underline"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-primary mb-6">
        Payment {payment.reference}
      </h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <p>
          <strong>Reference:</strong> {payment.reference}
        </p>
        <p>
          <strong>Order:</strong>{" "}
          <Link
            to={`/admin/orders/${payment.orderId}`}
            className="text-blue-600 hover:underline"
          >
            {payment.metadata?.orderNumber || payment.orderId}
          </Link>
        </p>
        <p>
          <strong>User:</strong>{" "}
          <Link
            to={`/admin/users/${payment.userId}`}
            className="text-blue-600 hover:underline"
          >
            {payment.userId}
          </Link>
        </p>
        <p>
          <strong>Gateway:</strong> {payment.gateway}
        </p>
        <p>
          <strong>Status:</strong>{" "}
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
        </p>
        <p>
          <strong>Amount:</strong> {payment.currency}{" "}
          {payment.amount.toLocaleString()}
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {new Date(payment.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Updated At:</strong>{" "}
          {new Date(payment.updatedAt).toLocaleString()}
        </p>

        {payment.metadata && (
          <div className="mt-4 bg-gray-50 p-4 rounded">
            <h2 className="font-semibold mb-2">Metadata</h2>
            {Object.entries(payment.metadata).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {value}
              </p>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {payment.status === "PENDING" && (
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => handleUpdateStatus("SUCCESS")}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
            >
              Mark as SUCCESS
            </button>
            <button
              onClick={() => handleUpdateStatus("FAILED")}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
            >
              Mark as FAILED
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
