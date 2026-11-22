import { Link, NavLink, useNavigate } from "react-router-dom";
import { BarChart3, Boxes, FolderTree, LogOut, Package, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: BarChart3, end: true },
  { to: "/admin/orders", label: "Orders", icon: Package },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/users", label: "Users", icon: Users },
];

function AdminLayout({ title, subtitle, children }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2EC] text-[#092F33]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[240px_1fr] lg:px-6">
        <aside className="rounded-2xl border border-[#E4E5DC] bg-white p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <div className="border-b border-[#EAECE5] pb-4">
            <Link to="/" className="font-heading text-2xl font-bold text-[#092F33]">
              RELOOP <span className="text-[#A7833D]">Admin</span>
            </Link>
            <p className="mt-2 text-xs text-[#84948C]">{user?.email || "Administrator"}</p>
          </div>
          <nav className="mt-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive ? "bg-[#092F33] text-[#E8C77F]" : "text-[#4E6862] hover:bg-[#F3F2EC] hover:text-[#092F33]"
                    }`
                  }
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="mt-6 border-t border-[#EAECE5] pt-4">
            <Link to="/" className="block rounded-xl px-3 py-2 text-sm text-[#4E6862] hover:bg-[#F3F2EC]">Back to store</Link>
            <button type="button" onClick={handleLogout} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#8B3A3A] hover:bg-red-50">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </aside>
        <main className="min-w-0">
          <div className="mb-5 rounded-2xl border border-[#E4E5DC] bg-white px-5 py-5 sm:px-6">
            <h1 className="font-heading text-3xl font-semibold text-[#092F33]">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-[#84948C]">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
