import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import { API } from "../../context/AuthContext";

const emptyForm = { name: "", description: "", is_active: true };

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const token = useMemo(() => localStorage.getItem("reloop-access"), []);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("products/admin/categories/", { headers });
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      if (editingId) {
        const res = await API.patch(`products/admin/categories/${editingId}/`, form, { headers });
        setCategories((prev) => prev.map((c) => (c.id === editingId ? res.data : c)).sort((a,b)=>a.name.localeCompare(b.name)));
        setMessage("Category updated successfully.");
      } else {
        const res = await API.post("products/admin/categories/", form, { headers });
        setCategories((prev) => [...prev, res.data].sort((a,b)=>a.name.localeCompare(b.name)));
        setMessage("Category added successfully.");
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === "string" ? data : data?.error || data?.name?.[0] || JSON.stringify(data || "Failed to save category."));
    }
  };

  const edit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name || "", description: c.description || "", is_active: !!c.is_active });
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"? This is blocked if products depend on it.`)) return;
    setError(""); setMessage("");
    try {
      await API.delete(`products/admin/categories/${c.id}/`, { headers });
      setCategories((prev) => prev.filter((x) => x.id !== c.id));
      setMessage("Category deleted successfully.");
      if (editingId === c.id) { setEditingId(null); setForm(emptyForm); }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || "Failed to delete category.");
    }
  };

  return (
    <AdminLayout title="Category Management" subtitle="Add, edit, delete, and display categories. Products are assigned to categories and invalid deletion is prevented.">
      {message && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}
      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <form onSubmit={submit} className="rounded-2xl border border-[#E4E5DC] bg-white p-4 space-y-3 h-fit">
          <h2 className="text-lg font-semibold">{editingId ? "Edit Category" : "Add Category"}</h2>
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} required className="w-full rounded-lg border border-[#DDE2D8] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} rows={3} className="w-full rounded-lg border border-[#DDE2D8] px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.is_active} onChange={(e)=>setForm({...form, is_active: e.target.checked})} />
            Active (visible in shop)
          </label>
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-[#092F33] px-4 py-2 text-sm font-semibold text-[#E8C77F]">{editingId ? "Update" : "Add"}</button>
            {editingId && <button type="button" onClick={()=>{setEditingId(null); setForm(emptyForm);}} className="rounded-lg border border-[#DDE2D8] px-4 py-2 text-sm">Cancel</button>}
          </div>
        </form>

        <div className="rounded-2xl border border-[#E4E5DC] bg-white p-4">
          <h2 className="text-lg font-semibold">Categories</h2>
          {loading ? <p className="mt-3 text-sm text-[#84948C]">Loading...</p> : (
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#EDF0E8] text-xs uppercase tracking-wide text-[#84948C]">
                    <th className="px-2 py-2">Name</th><th className="px-2 py-2">Slug</th><th className="px-2 py-2">Products</th><th className="px-2 py-2">Active</th><th className="px-2 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id} className="border-b border-[#F1F2EC]">
                      <td className="px-2 py-2 font-medium">{c.name}<div className="text-xs text-[#84948C]">{c.description}</div></td>
                      <td className="px-2 py-2 text-xs text-[#6C817B]">{c.slug}</td>
                      <td className="px-2 py-2">{c.product_count ?? "-"}</td>
                      <td className="px-2 py-2">{c.is_active ? "Yes" : "No"}</td>
                      <td className="px-2 py-2 space-x-2">
                        <button type="button" onClick={()=>edit(c)} className="text-[#174B50] hover:underline">Edit</button>
                        <button type="button" onClick={()=>remove(c)} className="text-red-700 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && <tr><td colSpan={5} className="px-2 py-6 text-center text-[#84948C]">No categories found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-xs text-[#84948C]">Categories are displayed dynamically in the Shop. Deleting a category is prevented when products depend on it.</p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminCategories;
