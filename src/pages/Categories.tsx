// src/pages/Categories.tsx
import  { useEffect, useState } from "react";
import api from "../api/axios";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/categories", {
        params: { page, limit: 5, search },
      });

      const data = res.data.data || res.data; // depends if backend wraps with data
      const total = res.data.total || data.length;

      setCategories(data);
      setPagination({
        total,
        page: res.data.page || 1,
        limit: 5,
        totalPages: Math.ceil(total / 5),
      });
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  const handleSave = async () => {
    if (!formData.name || !formData.slug) return;
    setActionLoading(true);
    try {
      if (editingId) {
        await api.patch(`/admin/categories/${editingId}`, formData);
      } else {
        await api.post("/admin/categories", formData);
      }
      setFormData({});
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      console.error("Error saving category:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category._id);
    setFormData(category);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Categories</h1>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      {/* Form for Create/Edit */}
      <div className="mb-6 bg-white shadow p-4 rounded-lg space-y-2">
        <input
          type="text"
          placeholder="Name"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border px-2 py-1 rounded w-full"
        />
        <input
          type="text"
          placeholder="Slug"
          value={formData.slug || ""}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className="border px-2 py-1 rounded w-full"
        />
        <textarea
          placeholder="Description"
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="border px-2 py-1 rounded w-full"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive ?? true}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          Active
        </label>
        <div className="flex gap-2">
          <button
            disabled={actionLoading}
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {editingId ? "Update" : "Create"}
          </button>
          {editingId && (
            <button
              onClick={() => { setEditingId(null); setFormData({}); }}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Categories Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{cat.name}</td>
                  <td className="px-4 py-2">{cat.slug}</td>
                  <td className="px-4 py-2">{cat.description || "-"}</td>
                  <td className="px-4 py-2">{cat.isActive ? "✅" : "❌"}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      disabled={actionLoading === true}
                      className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
                    >
                      Delete
                    </button>
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
            Page {pagination.page} of {pagination.totalPages} — Total: {pagination.total}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
            disabled={page === pagination.totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
