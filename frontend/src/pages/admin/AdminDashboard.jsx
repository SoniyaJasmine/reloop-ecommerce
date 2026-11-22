import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { API } from "../../context/AuthContext";

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-[#E4E5DC] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#84948C]">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#092F33]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[#6C817B]">{hint}</p>}
    </div>
  );
}

function SalesChart({ data }) {
  const maxSales = useMemo(() => Math.max(1, ...(data || []).map((d) => Number(d.sales || 0))), [data]);
  const points = useMemo(() => {
    if (!data || data.length === 0) return "";
    return data.map((d, i) => {
      const x = data.length === 1 ? 0 : (i / (data.length - 1)) * 100;
      const y = 40 - (Number(d.sales || 0) / maxSales) * 40;
      return `${x},${y}`;
    }).join(" ");
  }, [data, maxSales]);

  return (
    <div className="rounded-2xl border border-[#E4E5DC] bg-white p-5">
      <h2 className="text-lg font-semibold text-[#092F33]">Sales Chart</h2>
      <p className="text-xs text-[#84948C]">Real database sales (successful orders)</p>
      <div className="mt-4 rounded-xl border border-[#EDF0E8] bg-[#FAFAF7] p-3">
        {data && data.length > 0 ? (
          <>
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-44 w-full">
              <polyline fill="none" stroke="#A7833D" strokeWidth="1.5" points={points} />
              {data.map((d, i) => {
                const x = data.length === 1 ? 0 : (i / (data.length - 1)) * 100;
                const y = 40 - (Number(d.sales || 0) / maxSales) * 40;
                return <circle key={d.date || i} cx={x} cy={y} r="1.2" fill="#092F33" />;
              })}
            </svg>
            <div className="mt-2 flex justify-between text-[10px] text-[#84948C]">
              <span>{data[0]?.label}</span>
              <span>{data[data.length - 1]?.label}</span>
            </div>
          </>
        ) : <p className="py-10 text-center text-sm text-[#84948C]">No sales data available.</p>}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("reloop-access");
        const res = await API.get("orders/admin/dashboard/", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || err.response?.data?.detail || "Failed to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = data?.stats || {};
  const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Real-time database statistics and store performance.">
      {loading && <div className="rounded-2xl border border-[#E4E5DC] bg-white p-6 text-sm text-[#84948C]">Loading dashboard...</div>}
      {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {!loading && !error && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Sales" value={money(stats.total_sales)} />
            <StatCard label="Total Orders" value={stats.total_orders || 0} />
            <StatCard label="Total Products" value={stats.total_products || 0} />
            <StatCard label="Registered Users" value={stats.total_registered_users || 0} />
            <StatCard label="Pending Orders" value={stats.pending_orders || 0} />
            <StatCard label="Delivered Orders" value={stats.delivered_orders || 0} />
            <StatCard label="Pending Submissions" value={stats.pending_product_submissions || 0} />
            <StatCard label="Approved Submissions" value={stats.approved_product_submissions || 0} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            <SalesChart data={data?.sales_chart || []} />
            <div className="rounded-2xl border border-[#E4E5DC] bg-white p-5">
              <h2 className="text-lg font-semibold text-[#092F33]">Best-Selling Products</h2>
              <div className="mt-4 space-y-3">
                {(data?.best_selling_products || []).length === 0 && <p className="text-sm text-[#84948C]">No sales data yet.</p>}
                {(data?.best_selling_products || []).map((p) => (
                  <div key={`${p.product_id}-${p.product_name}`} className="rounded-xl border border-[#EDF0E8] p-3">
                    <p className="text-sm font-semibold text-[#092F33]">{p.product_name}</p>
                    <p className="mt-1 text-xs text-[#6C817B]">Sold: {p.total_quantity} · Revenue: {money(p.total_revenue)} · Orders: {p.order_count}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-[#F8F8F3] p-3 text-xs text-[#4E6862]">
                Low stock: <strong>{stats.low_stock_products || 0}</strong> · Out of stock: <strong>{stats.out_of_stock_products || 0}</strong>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E4E5DC] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#092F33]">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm font-semibold text-[#A7833D] hover:underline">View all</Link>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#EDF0E8] text-xs uppercase tracking-wide text-[#84948C]">
                    <th className="px-2 py-2">Order</th><th className="px-2 py-2">Customer</th><th className="px-2 py-2">Total</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recent_orders || []).map((o) => (
                    <tr key={o.order_number} className="border-b border-[#F1F2EC]">
                      <td className="px-2 py-2 font-medium">{o.order_number}</td>
                      <td className="px-2 py-2">{o.full_name}<div className="text-xs text-[#84948C]">{o.email}</div></td>
                      <td className="px-2 py-2">{money(o.total_amount)}</td>
                      <td className="px-2 py-2 capitalize">{o.order_status}</td>
                      <td className="px-2 py-2 capitalize">{o.payment_status}</td>
                    </tr>
                  ))}
                  {(data?.recent_orders || []).length === 0 && <tr><td colSpan={5} className="px-2 py-6 text-center text-[#84948C]">No orders found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;
