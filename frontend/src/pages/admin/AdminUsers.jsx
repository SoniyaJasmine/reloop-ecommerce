import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import { API } from "../../context/AuthContext";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const token = useMemo(() => localStorage.getItem("reloop-access"), []);

  const load = async (params = {}) => {
    try {
      setLoading(true);
      setError("");
      const query = new URLSearchParams();
      if (params.search ?? search) query.set("search", params.search ?? search);
      const af = params.is_active ?? activeFilter;
      if (af !== "") query.set("is_active", af);
      const res = await API.get(`accounts/admin/users/${query.toString() ? `?${query.toString()}` : ""}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load({ search: "", is_active: "" }); }, []);

  const toggleActive = async (u) => {
    setError(""); setMessage("");
    try {
      const res = await API.patch(
        `accounts/admin/users/${u.id}/`,
        { is_active: !u.is_active },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setUsers((prev) => prev.map((x) => (x.id === u.id ? res.data : x)));
      setMessage(`User ${u.email || u.username} ${res.data.is_active ? "activated" : "deactivated"}.`);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || "Failed to update user.");
    }
  };

  return (
    <AdminLayout title="Admin User Management" subtitle="List, view, search, filter, and activate/deactivate registered users.">
      {message && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}
      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-2xl border border-[#E4E5DC] bg-white p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); load(); }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Search users</label>
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Name, username, email" className="w-full rounded-lg border border-[#DDE2D8] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select value={activeFilter} onChange={(e)=>setActiveFilter(e.target.value)} className="rounded-lg border border-[#DDE2D8] px-3 py-2 text-sm">
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <button type="submit" className="rounded-lg bg-[#092F33] px-4 py-2 text-sm font-semibold text-[#E8C77F]">Search / Filter</button>
        </form>

        {loading ? <p className="mt-4 text-sm text-[#84948C]">Loading users...</p> : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#EDF0E8] text-xs uppercase tracking-wide text-[#84948C]">
                  <th className="px-2 py-2">User</th><th className="px-2 py-2">Email</th><th className="px-2 py-2">Role</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Joined</th><th className="px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[#F1F2EC]">
                    <td className="px-2 py-2 font-medium">{u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : u.username}<div className="text-xs text-[#84948C]">@{u.username}</div></td>
                    <td className="px-2 py-2">{u.email}</td>
                    <td className="px-2 py-2">{u.is_staff ? "Admin/Staff" : "Customer"}</td>
                    <td className="px-2 py-2">{u.is_active ? <span className="text-emerald-700">Active</span> : <span className="text-red-700">Inactive</span>}</td>
                    <td className="px-2 py-2 text-xs text-[#6C817B]">{u.date_joined ? new Date(u.date_joined).toLocaleDateString() : "-"}</td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => toggleActive(u)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${u.is_active ? "border border-red-200 text-red-700 hover:bg-red-50" : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={6} className="px-2 py-6 text-center text-[#84948C]">No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-[#84948C]">Admin APIs are protected with admin permissions. Unauthorized users cannot access these endpoints/pages.</p>
      </div>
    </AdminLayout>
  );
}

export default AdminUsers;
