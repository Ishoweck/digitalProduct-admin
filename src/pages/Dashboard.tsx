// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  // LineChart,
  // Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Loader from "../components/Loader";

type DashboardStats = {
  users: { total: number; active: number; inactive: number };
  vendors: { total: number; verified: number; pending: number };
  products: { total: number; approved: number; pending: number; rejected: number };
  orders: {
    total: number;
    revenue: number;
    byStatus: Record<string, number>;
    revenueOverTime?: { date: string; revenue: number }[];
  };
  payments: { total: number };
  reviews: { total: number; pending: number; approved: number; rejected: number };
  categories: { total: number };
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/dashboard/stats");
        console.log(res.data);
        setStats(res.data.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!stats) return null;

  const ordersStatusData = Object.entries(stats.orders.byStatus).map(([status, count]) => ({
    status: capitalize(status),
    count,
  }));

  // const revenueTimeData = stats.orders.revenueOverTime ?? [];

  const productStatusData = [
    { name: "Approved", value: stats.products.approved },
    { name: "Pending", value: stats.products.pending },
    { name: "Rejected", value: stats.products.rejected },
  ];

  const reviewStatusData = [
    { name: "Approved", value: stats.reviews.approved },
    { name: "Pending", value: stats.reviews.pending },
    { name: "Rejected", value: stats.reviews.rejected },
  ];

  const COLORS = ["#34d399", "#facc15", "#f87171"];

  // Format revenue with NGN symbol and commas
  const currencySymbol = "₦";
  const formattedRevenue = stats.orders.revenue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-6">Overview of platform statistics.</p>

      {/* Charts First */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Orders by Status */}
        <ChartCard title="Orders by Status">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ordersStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Orders" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue Over Time */}
        {/* <ChartCard title="Revenue Over Time">
          {revenueTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#10b981"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No revenue time data available</p>
          )}
        </ChartCard> */}

        {/* Product Status */}
        <ChartCard title="Product Status Breakdown">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={productStatusData} dataKey="value" nameKey="name" outerRadius={80} label>
                {productStatusData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Review Status */}
        <ChartCard title="Review Status Breakdown">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={reviewStatusData} dataKey="value" nameKey="name" outerRadius={80} label>
                {reviewStatusData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Stat Cards Below */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue & Total */}
        <StatCard title="Revenue" value={`${currencySymbol}${formattedRevenue}`} />
        <StatCard title="Total Orders" value={stats.orders.total} />
        <StatCard title="Total Products" value={stats.products.total} />
        <StatCard title="Total Users" value={stats.users.total} />

        {/* Status Cards with Colored Backgrounds */}
        <StatCard title="Approved Products" value={stats.products.approved} status="approved" />
        <StatCard title="Pending Products" value={stats.products.pending} status="pending" />
        <StatCard title="Rejected Products" value={stats.products.rejected} status="rejected" />

        <StatCard title="Verified Vendors" value={stats.vendors.verified} status="approved" />
        <StatCard title="Pending Vendors" value={stats.vendors.pending} status="pending" />

        <StatCard title="Approved Reviews" value={stats.reviews.approved} status="approved" />
        <StatCard title="Pending Reviews" value={stats.reviews.pending} status="pending" />
        <StatCard title="Rejected Reviews" value={stats.reviews.rejected} status="rejected" />

        <StatCard title="Active Users" value={stats.users.active} status="approved" />
        <StatCard title="Inactive Users" value={stats.users.inactive} status="inactive" />

        <StatCard title="Total Categories" value={stats.categories.total} />
        <StatCard title="Total Payments" value={stats.payments.total} />
      </div>
    </div>
  );
}

// Card components

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function StatCard({
  title,
  value,
  status,
}: {
  title: string;
  value: string | number;
  status?: string;
}) {
  const bgClass = getBgColor(status);
  const textClass = getTextColor();
  return (
    <div className={`${bgClass} p-5 rounded-lg shadow`}>
      <h2 className="text-sm font-medium text-white mb-1">{title}</h2>
      <p className={`text-xl font-bold ${textClass}`}>{value}</p>
    </div>
  );
}

// Color utilities

function getBgColor(status?: string): string {
  switch (status) {
    case "approved":
    case "verified":
    case "active":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "rejected":
    case "failed":
      return "bg-red-500";
    case "inactive":
      return "bg-gray-500";
    default:
      return "bg-primary text-white";
  }
}

function getTextColor(): string {
  return "text-white";
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
