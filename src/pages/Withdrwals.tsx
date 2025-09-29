import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import { Link } from "react-router-dom";

type Withdrawal = {
  _id: string;
  userId: string;
  reference: string;
  amount: number;
  status: string;
  currency: string;
  gateway: string;
  withdrawalDetails: {
    bankAccount: string;
    bankName: string;
    accountName: string; 

  };
  createdAt: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};


const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "APPROVED":
      return "text-green-600 font-semibold";
    case "REJECTED":
      return "text-red-600 font-semibold";
    case "PENDING":
      return "text-yellow-600 font-semibold";
    default:
      return "text-gray-600";
  }
};
export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // withdrawalId for loading action
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/admin/withdrawals?page=${page}&limit=5`);
        if (Array.isArray(res.data.data)) {
          setWithdrawals(res.data.data);
          setPagination({
            total: res.data.totalWithdrawals || res.data.total,
            page: res.data.page,
            limit: res.data.limit,
            totalPages: res.data.totalPages,
          });
        } else {
          setWithdrawals([]);
          setPagination(null);
          setError("Unexpected response format.");
          console.error("Unexpected response format:", res.data);
        }
      } catch (err) {
        console.error("Error fetching withdrawals:", err);
        setError("Failed to load withdrawals. Please try again.");
        setWithdrawals([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, [page]);

  const updateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(id);
    try {
      const res = await api.patch(`/admin/withdrawals/${id}/status`, { status });
      // Update local state
      setWithdrawals((prev) =>
        prev.map((w) => (w._id === id ? { ...w, status: res.data.data.status } : w))
      );
    } catch (err) {
      console.error(`Failed to update withdrawal status to ${status}`, err);
      alert("Failed to update status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const currencyFormatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Withdrawals</h1>

      {loading ? (
        <Loader />
      ) : error ? (
        <div className="text-red-600 text-center py-4">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2">Reference</th>
                 <th className="px-4 py-2">User ID</th>

                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Currency</th>
                  <th className="px-4 py-2">Gateway</th>
                  <th className="px-4 py-2">Bank Name</th>
                   <th className="px-4 py-2">Account Name</th> 
                  <th className="px-4 py-2">Bank Account</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Requested On</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-gray-500">
                      No withdrawals found
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((withdrawal) => {
                    const isPending = withdrawal.status === "PENDING";
                    const isLoading = actionLoading === withdrawal._id;

                    return (
                      <tr
                        key={withdrawal._id}
                        className="border-b hover:bg-gray-50"
                        aria-busy={isLoading}
                      >
                        <td className="px-4 py-2 font-mono">{withdrawal.reference}</td>
                        <td className="px-4 py-2 font-mono text-blue-500">
                            <Link to={`/admin/users/${withdrawal.userId}`}>
                            {withdrawal.userId}</Link></td>

                        <td className="px-4 py-2">{currencyFormatter.format(withdrawal.amount)}</td>
                        <td className="px-4 py-2">{withdrawal.currency}</td>
                        <td className="px-4 py-2">{withdrawal.gateway}</td>
                        <td className="px-4 py-2">{withdrawal.withdrawalDetails.bankName}</td>
                         <td className="px-4 py-2">{withdrawal.withdrawalDetails.accountName}</td>
                        <td className="px-4 py-2">{withdrawal.withdrawalDetails.bankAccount}</td>
                       <td className={`px-4 py-2 capitalize ${getStatusColor(withdrawal.status)}`}>
  {withdrawal.status.toLowerCase()}
</td>

                        <td className="px-4 py-2">
                          {new Date(withdrawal.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-2 space-x-2">
                          {isPending ? (
                            <>
                              <button
                                disabled={isLoading}
                                onClick={() => updateStatus(withdrawal._id, "APPROVED")}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-disabled={isLoading}
                              >
                                {isLoading ? "Approving..." : "Approve"}
                              </button>
                              {/* <button
                                disabled={isLoading}
                                onClick={() => updateStatus(withdrawal._id, "REJECTED")}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-disabled={isLoading}
                              >
                                {isLoading ? "Rejecting..." : "Reject"}
                              </button> */}
                            </>
                          ) : (
                            <span className="text-gray-500">No actions</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
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
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-disabled={page === 1}
              >
                Prev
              </button>

              <span>
                Page {pagination.page} of {pagination.totalPages} — Total: {pagination.total}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                disabled={page === pagination.totalPages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-disabled={page === pagination.totalPages}
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
