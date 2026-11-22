import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import { API } from "../../context/AuthContext";

function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [savingId, setSavingId] = useState(null);
  const token = useMemo(() => localStorage.getItem("reloop-access"), []);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [prodRes, catRes] = await Promise.all([
        API.get("products/admin/products/", { headers }),
        API.get("products/admin/categories/", { headers }),
      ]);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || "Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) => {
    if (filter === "low") return Number(p.stock) > 0 && Number(p.stock) <= 5;
    if (filter === "out") return Number(p.stock) <= 0;
    return true;
  });

  const updateProduct = async (frontendId, payload) => {
    try {
      setSavingId(frontendId);
      setMessage("");
      const res = await API.patch(`products/admin/products/${frontendId}/`, payload, { headers });
      setProducts((prev) => prev.map((p) => (p.frontend_id === frontendId ? res.data : p)));
      setMessage("Product updated successfully.");
    } catch (err) {
      const errData = err.response?.data;
      const errMsg = typeof errData === "string" ? errData : errData?.error || JSON.stringify(errData || "Failed to update product.");
      setError(errMsg);
    } finally {
      setSavingId(null);
    }
  };

  const lowCount = products.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 5).length;
  const outCount = products.filter((p) => Number(p.stock) <= 0).length;

  return (
    <AdminLayout title="Inventory Management" subtitle="View and update stock, identify low/out-of-stock products, and manage product availability.">
      {message && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}
      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E4E5DC] bg-white p-4"><p className="text-xs text-[#84948C]">Total Products</p><p className="text-xl font-bold">{products.length}</p></div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs text-amber-800">Low Stock (≤ 5)</p><p className="text-xl font-bold text-amber-900">{lowCount}</p></div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4"><p className="text-xs text-red-800">Out of Stock</p><p className="text-xl font-bold text-red-900">{outCount}</p></div>
      </div>

      <div className="rounded-2xl border border-[#E4E5DC] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Products & Stock</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-[#DDE2D8] px-3 py-2 text-sm">
            <option value="all">All products</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>

        {loading ? <p className="mt-3 text-sm text-[#84948C]">Loading inventory...</p> : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#EDF0E8] text-xs uppercase tracking-wide text-[#84948C]">
                  <th className="px-2 py-2">ID</th><th className="px-2 py-2">Product</th><th className="px-2 py-2">Category</th><th className="px-2 py-2">Stock</th><th className="px-2 py-2">Active</th><th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.frontend_id} className="border-b border-[#F1F2EC] align-top">
                    <td className="px-2 py-2">{p.frontend_id}</td>
                    <td className="px-2 py-2 font-medium">{p.name}<div className="text-xs text-[#84948C]">₹{Number(p.price).toLocaleString("en-IN")}</div></td>
                    <td className="px-2 py-2">{p.category}</td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        defaultValue={p.stock}
                        key={`${p.frontend_id}-${p.stock}`}
                        id={`stock-${p.frontend_id}`}
                        className="w-24 rounded-lg border border-[#DDE2D8] px-2 py-1"
                      />
                      <div className="mt-1 text-xs">
                        {Number(p.stock) <= 0 ? <span className="text-red-700">Out of stock</span> : Number(p.stock) <= 5 ? <span className="text-amber-700">Low stock</span> : <span className="text-emerald-700">In stock</span>}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        defaultValue={String(!!p.is_active)}
                        id={`active-${p.frontend_id}`}
                        key={`${p.frontend_id}-active-${p.is_active}`}
                        className="rounded-lg border border-[#DDE2D8] px-2 py-1"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        disabled={savingId === p.frontend_id}
                        onClick={() => {
                          const stock = document.getElementById(`stock-${p.frontend_id}`).value;
                          const is_active = document.getElementById(`active-${p.frontend_id}`).value === "true";
                          updateProduct(p.frontend_id, { stock: Number(stock), is_active });
                        }}
                        className="rounded-lg bg-[#092F33] px-3 py-1.5 text-xs font-semibold text-[#E8C77F] disabled:opacity-60"
                      >
                        {savingId === p.frontend_id ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="px-2 py-6 text-center text-[#84948C]">No products found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-[#84948C]">Stock is reduced on successful order placement and restored on eligible cancellations. Orders exceeding available stock are prevented by the backend.</p>
      </div>
    </AdminLayout>
  );
}

export default AdminInventory;
