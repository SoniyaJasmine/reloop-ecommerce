import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import { API } from "../../context/AuthContext";

const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");

  const token = useMemo(() => localStorage.getItem("reloop-access"), []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("orders/admin/list/", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderNumber, orderStatus) => {
    try {
      setSaving(orderNumber);
      setMessage("");
      const res = await API.patch(
        `orders/admin/status/${orderNumber}/`,
        { order_status: orderStatus },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setOrders((prev) => prev.map((o) => (o.order_number === orderNumber ? res.data : o)));
      setSelected((prev) => (prev?.order_number === orderNumber ? res.data : prev));
      setMessage(`Order ${orderNumber} updated to ${orderStatus}.`);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.detail || "Failed to update order status.";
      setError(errMsg);
    } finally {
      setSaving("");
    }
  };

  const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

  return (
    <AdminLayout title="Admin Order Management" subtitle="View orders, details, and update statuses with validation and inventory handling.">
      {message && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}
      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-[#E4E5DC] bg-white p-4">
          <h2 className="text-lg font-semibold">All Orders</h2>
          {loading ? <p className="mt-3 text-sm text-[#84948C]">Loading orders...</p> : (
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#EDF0E8] text-xs uppercase tracking-wide text-[#84948C]">
                    <th className="px-2 py-2">Order</th><th className="px-2 py-2">Customer</th><th className="px-2 py-2">Total</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Payment</th><th className="px-2 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.order_number} className="border-b border-[#F1F2EC] align-top">
                      <td className="px-2 py-2 font-medium">
                        <button type="button" onClick={() => setSelected(o)} className="text-[#174B50] hover:underline">{o.order_number}</button>
                        <div className="text-xs text-[#84948C]">{o.created_at ? new Date(o.created_at).toLocaleString() : ""}</div>
                      </td>
                      <td className="px-2 py-2">
                        <div>{o.full_name}</div>
                        <div className="text-xs text-[#84948C]">{o.email}</div>
                        <div className="text-xs text-[#84948C]">{o.phone}</div>
                      </td>
                      <td className="px-2 py-2">{money(o.total_amount)}</td>
                      <td className="px-2 py-2 capitalize">{o.order_status}</td>
                      <td className="px-2 py-2 capitalize">{o.payment_status}<div className="text-xs text-[#84948C]">{o.payment_method}</div></td>
                      <td className="px-2 py-2">
                        <select
                          value={o.order_status}
                          onChange={(e) => updateStatus(o.order_number, e.target.value)}
                          disabled={saving === o.order_number}
                          className="rounded-lg border border-[#DDE2D8] px-2 py-1 text-xs"
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan={6} className="px-2 py-6 text-center text-[#84948C]">No orders found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#E4E5DC] bg-white p-4">
          <h2 className="text-lg font-semibold">Order Details</h2>
          {!selected ? <p className="mt-3 text-sm text-[#84948C]">Select an order to view customer, items, payment, and totals.</p> : (
            <div className="mt-3 space-y-3 text-sm">
              <div className="rounded-xl border border-[#EDF0E8] p-3">
                <p><strong>Order:</strong> {selected.order_number}</p>
                <p><strong>Status:</strong> <span className="capitalize">{selected.order_status}</span></p>
                <p><strong>Payment:</strong> <span className="capitalize">{selected.payment_status}</span> ({selected.payment_method})</p>
                {selected.razorpay_payment_id && <p><strong>Razorpay Payment ID:</strong> {selected.razorpay_payment_id}</p>}
              </div>
              <div className="rounded-xl border border-[#EDF0E8] p-3">
                <p className="font-semibold">Customer</p>
                <p>{selected.full_name} {selected.customer_username ? `(@${selected.customer_username})` : ""}</p>
                <p>{selected.email}</p>
                <p>{selected.phone}</p>
                <p className="mt-1 text-[#4E6862]">{selected.address}, {selected.city}, {selected.state} - {selected.pincode}</p>
              </div>
              <div className="rounded-xl border border-[#EDF0E8] p-3">
                <p className="font-semibold">Items</p>
                <div className="mt-2 space-y-2">
                  {(selected.items || []).map((item, idx) => (
                    <div key={`${item.product_id}-${idx}`} className="flex items-center justify-between gap-3 border-b border-[#F1F2EC] pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-xs text-[#84948C]">Qty: {item.quantity} · {item.condition || "N/A"}</p>
                      </div>
                      <div className="text-right">
                        <p>{money(item.price)}</p>
                        <p className="text-xs text-[#84948C]">Total: {money(item.item_total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-[#EDF0E8] p-3 space-y-1">
                <p>Subtotal: {money(selected.subtotal)}</p>
                <p>Delivery: {money(selected.delivery_charge)}</p>
                {Number(selected.discount_amount || 0) > 0 && <p className="text-[#286B56]">Discount {selected.coupon_code ? `(${selected.coupon_code})` : ""}: -{money(selected.discount_amount)}</p>}
                <p className="font-semibold">Total: {money(selected.total_amount)}</p>
              </div>
              <p className="text-xs text-[#84948C]">Note: Cancelling an eligible order restores stock automatically. Invalid status transitions are blocked by the server.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminOrders;
