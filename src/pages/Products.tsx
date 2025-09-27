// src/pages/Products.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";

type Product = {
  _id: string;
  name: string;
  price: number;
  thumbnail?: string;
  isActive: boolean;
  approvalStatus: string;
  createdAt: string;
  vendorId: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [vendorNames, setVendorNames] = useState<Record<string, string>>({});

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/products?page=${page}&limit=5`);

        if (Array.isArray(res.data.data)) {
          setProducts(res.data.data);
          setPagination({
            total: res.data.total,
            page: res.data.page,
            limit: res.data.limit,
            totalPages: Math.ceil(res.data.total / res.data.limit),
          });
        } else {
          console.error("Unexpected response format:", res.data);
          setProducts([]);
          setPagination(null);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  // Fetch vendor names for all products on page
  useEffect(() => {
    const fetchVendors = async () => {
      const missingVendorIds = products
        .map((p) => p.vendorId)
        .filter((id) => !vendorNames[id]);

      if (missingVendorIds.length === 0) return;

      await Promise.all(
        missingVendorIds.map(async (id) => {
          try {
            const res = await api.get(`/admin/vendors/${id}`);
            const name = res.data.data?.businessName || id;
            setVendorNames((prev) => ({ ...prev, [id]: name }));
          } catch {
            setVendorNames((prev) => ({ ...prev, [id]: id }));
          }
        })
      );
    };

    if (products.length > 0) {
      fetchVendors();
    }
  }, [products]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Products</h1>

      {loading ? (    
          <Loader/>      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2">Image</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Vendor</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Active</th>
                  <th className="px-4 py-2">Approval</th>
                  <th className="px-4 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <Link
                          to={`/admin/products/${product._id}`}
                          className="text-primary font-medium hover:underline"
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2">
                        <Link
                          to={`/admin/vendors/${product.vendorId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {vendorNames[product.vendorId] || "Loading..."}
                        </Link>
                      </td>
                      <td className="px-4 py-2">
                        ₦{product.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        {product.isActive ? "✅" : "❌"}
                      </td>
                      <td className="px-4 py-2">{product.approvalStatus}</td>
                      <td className="px-4 py-2">
                        {new Date(product.createdAt).toLocaleDateString()}
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
