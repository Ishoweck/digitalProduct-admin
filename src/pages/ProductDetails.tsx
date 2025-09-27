import  { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  thumbnail?: string;
  images?: string[];
  isActive: boolean;
  approvalStatus: string;
  createdAt: string;
  updatedAt: string;
  vendorId: string;
  soldCount?: number;
  viewCount?: number;
};

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleApproval = async (status: "APPROVED" | "REJECTED") => {
    if (!product) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/products/${product._id}/approve`, {
        approvalStatus: status,
      });
      setProduct({ ...product, approvalStatus: status });
    } catch (err) {
      console.error("Approval failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div>
      <button
        className="text-gray-500 mb-4 underline"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-primary mb-6">{product.name}</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        {product.thumbnail && (
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-40 h-40 object-cover rounded"
          />
        )}

        {product.description && <p>{product.description}</p>}

        <p>
          <strong>Price:</strong> ₦{product.price.toLocaleString()}
        </p>
        {product.originalPrice && (
          <p>
            <strong>Original Price:</strong> ₦
            {product.originalPrice.toLocaleString()}
          </p>
        )}
        {product.discountPercentage && (
          <p>
            <strong>Discount:</strong> {product.discountPercentage}%
          </p>
        )}
        <p>
          <strong>Status:</strong> {product.isActive ? "Active ✅" : "Inactive ❌"}
        </p>
        <p>
          <strong>Approval:</strong> {product.approvalStatus}
        </p>
        <p>
          <strong>Vendor:</strong>{" "}
          <Link
            to={`/vendors/${product.vendorId}`}
            className="text-blue-600 hover:underline"
          >
            View Vendor
          </Link>
        </p>
        <p>
          <strong>Sold:</strong> {product.soldCount ?? 0}
        </p>
        <p>
          <strong>Views:</strong> {product.viewCount ?? 0}
        </p>
        <p>
          <strong>Created:</strong>{" "}
          {new Date(product.createdAt).toLocaleDateString()}
        </p>
        <p>
          <strong>Updated:</strong>{" "}
          {new Date(product.updatedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Approval Actions */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => handleApproval("APPROVED")}
          disabled={actionLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => handleApproval("REJECTED")}
          disabled={actionLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
