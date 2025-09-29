import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

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
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modal visibility state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleDeleteConfirmed = async () => {
    if (!product) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/products/${product._id}`);
      toast.success("Product deleted successfully");
      navigate(-1);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete product");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
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
            to={`/admin/vendors/${product.vendorId}`}
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

      {/* Approval & Delete Actions */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => handleApproval("APPROVED")}
          disabled={actionLoading || deleteLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => handleApproval("REJECTED")}
          disabled={actionLoading || deleteLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
        >
          Reject
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={actionLoading || deleteLoading}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50"
        >
          {deleteLoading ? "Deleting..." : "Delete"}
        </button>
      </div>


     {/* Delete Confirmation Modal */}
{showDeleteModal && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-10 backdrop-blur-md"
    style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
  >
    <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-lg p-6 max-w-sm w-full mx-4 border border-white border-opacity-30">
      <h2 className="text-xl font-bold mb-4 text-black">Confirm Delete</h2>
      <p className="mb-6 text-black">
        Are you sure you want to delete the product{" "}
        <strong>{product.name}</strong>? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-4">
        <button
          onClick={() => setShowDeleteModal(false)}
          disabled={deleteLoading}
          className="px-4 py-2 rounded border border-white border-opacity-50 hover:bg-white hover:bg-opacity-20 text-black"
        >
          Cancel
        </button>
        <button
          onClick={handleDeleteConfirmed}
          disabled={deleteLoading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {deleteLoading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
