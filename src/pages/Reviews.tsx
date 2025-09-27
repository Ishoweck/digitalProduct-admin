// src/pages/Reviews.tsx
import  { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";

type Review = {
  _id: string;
  userId: { _id: string; firstName: string; lastName: string; email: string };
  productId: { _id: string; name: string };
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
};

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/reviews/moderation");
      setReviews(res.data.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModeration = async (reviewId: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(reviewId);
    try {
      await api.patch(`/admin/reviews/${reviewId}/moderate`, { status });
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, status } : r))
      );
    } catch (err) {
      console.error("Moderation failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Loader/>;
  if (reviews.length === 0) return <p>No reviews for moderation.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">
        Reviews Moderation
      </h1>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Rating</th>
              <th className="px-4 py-2">Comment</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">
                  <Link
                    to={`/users/${review.userId._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {review.userId.firstName} {review.userId.lastName}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <Link
                    to={`/products/${review.productId._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {review.productId.name}
                  </Link>
                </td>
                <td className="px-4 py-2">{review.rating}</td>
                <td className="px-4 py-2">{review.comment}</td>
                <td className="px-4 py-2">{review.status}</td>
                <td className="px-4 py-2 flex gap-2">
                  {review.status === "PENDING" && (
                    <>
                      <button
                        disabled={actionLoading === review._id}
                        onClick={() => handleModeration(review._id, "APPROVED")}
                        className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        disabled={actionLoading === review._id}
                        onClick={() => handleModeration(review._id, "REJECTED")}
                        className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {review.status !== "PENDING" && <span>Done</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
