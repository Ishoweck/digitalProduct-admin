// src/pages/OrderDetails.tsx
import  { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

type ShippingAddress = {
  fullName: string;
  street: string;
  city: string;
  state: string;
  country: string;
};

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail?: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: ShippingAddress;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!order) return <p className="text-red-500">Order not found</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">
        Order {order.orderNumber}
      </h1>

      {/* Order Summary */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Info</h2>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Payment:</strong> {order.paymentMethod} (
          {order.paymentStatus})
        </p>
        <p>
          <strong>Total:</strong> {order.currency}{" "}
          {order.total.toLocaleString()}
        </p>
        <p>
          <strong>Created:</strong>{" "}
          {new Date(order.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Updated:</strong>{" "}
          {new Date(order.updatedAt).toLocaleString()}
        </p>
        <p>
          <strong>User:</strong>{" "}
          <Link
            to={`/admin/users/${order.userId}`}
            className="text-blue-600 hover:underline"
          >
            {order.userId}
          </Link>
        </p>
      </div>

      {/* Shipping Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
        <p>{order.shippingAddress.fullName}</p>
        <p>{order.shippingAddress.street}</p>
        <p>
          {order.shippingAddress.city}, {order.shippingAddress.state}
        </p>
        <p>{order.shippingAddress.country}</p>
      </div>

      {/* Items */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Items</h2>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Qty</th>
              <th className="px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="px-4 py-2">
                  <Link
                    to={`/admin/products/${item.productId}`}
                    className="text-primary hover:underline"
                  >
                    {item.name || item.productId}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  {order.currency} {item.price.toLocaleString()}
                </td>
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2">
                  {order.currency}{" "}
                  {(item.price * item.quantity).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
