
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Recycle,
  ArrowUpRight,
  UserRound,
  Package,
  LogOut,
  ChevronDown,
} from "lucide-react";

const SplitText = ({ text }) => (
  <span className="nav-split-text" aria-hidden="true">
    {Array.from(text).map((char, index) => (
      <span
        key={`${char}-${index}`}
        className="nav-split-char"
        style={{ "--char-index": index }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ))}
  </span>
);

function Navbar({
  search = "",
  setSearch = () => {},
  wishlist = [],
  menuOpen = false,
  setMenuOpen = () => {},
}) {
  const { cartCount } = useCart();
  const { user, logout, loading } = useAuth();
  const location = useLocation();

  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  const isActivePath = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const desktopLinkClass = (active) =>
    `nav-split-link transition hover:text-[#D7AE59] ${active ? "text-[#D7AE59]" : "text-white/75"}`;

  const mobileLinkClass = (active) =>
    `nav-split-link transition hover:text-[#D7AE59] ${active ? "text-[#D7AE59]" : "text-white/85"}`;

  const ProfileMenu = () => (
    <div className="absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-[#D7AE59]/20 bg-white py-2 text-[#092F33] shadow-xl">
      <div className="border-b border-[#E4E5DC] px-4 py-3">
        <p className="text-sm font-bold">
          {user?.first_name || user?.username}
        </p>
        <p className="mt-1 truncate text-xs text-[#71817B]">
          {user?.email}
        </p>
      </div>

      <Link
        to="/profile"
        onClick={() => setProfileOpen(false)}
        className="flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-[#F3F2EC]"
      >
        <UserRound size={17} /> My Profile
      </Link>

      <Link
        to="/my-orders"
        onClick={() => setProfileOpen(false)}
        className="flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-[#F3F2EC]"
      >
        <Package size={17} /> My Orders
      </Link>

      {user?.is_staff && (
        <Link
          to="/admin"
          onClick={() => setProfileOpen(false)}
          className="flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-[#F3F2EC]"
        >
          <UserRound size={17} /> Admin Dashboard
        </Link>
      )}

      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 border-t border-[#E4E5DC] px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
      >
        <LogOut size={17} /> Logout
      </button>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#092F33]/95 text-white shadow-lg shadow-[#092F33]/10 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-none items-center justify-between gap-5 px-8 py-6 lg:px-2">
        <Link to="/" className="flex shrink-0 items-center">
          <img
            src="/reloop-logo.png"
            alt="RELOOP - Give Products a Second Life"
            className="h-15 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-7 text-[14px] font-medium lg:flex">
          <Link to="/" className={desktopLinkClass(isActivePath("/"))}>
            <SplitText text="Home" />
          </Link>
          <a href="/#categories" className={desktopLinkClass(false)}>
            <SplitText text="Categories" />
          </a>
          <Link to="/shop" className={desktopLinkClass(isActivePath("/shop"))}>
            <SplitText text="Shop" />
          </Link>
          <a href="/#story" className={desktopLinkClass(false)}>
            <SplitText text="Our promise" />
          </a>
          <a href="/#impact" className={desktopLinkClass(false)}>
            <SplitText text="Our impact" />
          </a>
          <Link to="/enquiry" className={desktopLinkClass(isActivePath("/enquiry"))}>
            <SplitText text="Enquiry" />
          </Link>

          <a
            href="/#sell"
            className="group relative inline-flex items-center overflow-hidden rounded-lg bg-gradient-to-r from-[#D7AE59] via-[#F3D99F] to-[#D7AE59] bg-[length:200%_100%] px-5 py-2.5 text-[12px] font-extrabold tracking-wide text-[#092F33] shadow-[0_0_15px_rgba(215,174,89,0.25)] transition-all duration-300 animate-[goldShimmer_2.5s_linear_infinite] hover:scale-105 hover:shadow-[0_0_25px_rgba(215,174,89,0.6)]"
          >
            <span className="relative z-10 nav-split-link">
              <SplitText text="Sell with RELOOP" />
            </span>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shine_2.5s_ease-in-out_infinite]" />
          </a>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <label className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 focus-within:border-[#D7AE59]/70">
            <Search size={16} className="text-[#D7AE59]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find something..."
              className="w-32 bg-transparent text-xs text-white outline-none placeholder:text-white/50 lg:w-40"
            />
          </label>

          <Link
            to="/wishlist"
            className="relative"
            aria-label="My Wishlist"
          >
            <Heart size={20} />
          </Link>

          <Link
            to="/cart"
            aria-label={`Shopping cart with ${cartCount} items`}
            className={`relative transition hover:text-[#D7AE59] ${isActivePath("/cart") ? "text-[#D7AE59]" : "text-white/90"}`}
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D7AE59] px-1 text-[9px] font-bold text-[#092F33]">
                {cartCount}
              </span>
            )}
          </Link>

          {!loading && (
            user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-full bg-[#D7AE59] px-4 py-2.5 text-xs font-bold text-[#092F33] transition hover:bg-[#E8C77F]"
                >
                  <UserRound size={16} />
                  {user.first_name || user.username}
                  <ChevronDown size={14} />
                </button>
                {profileOpen && <ProfileMenu />}
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-[#D7AE59] px-5 py-2.5 text-xs font-bold text-[#092F33] transition hover:bg-[#E8C77F]"
              >
                Sign In
              </Link>
            )
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white md:hidden"
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-4 border-t border-white/10 bg-[#092F33] px-6 py-5 text-sm md:hidden">
          <Link onClick={() => setMenuOpen(false)} to="/" className={mobileLinkClass(isActivePath("/"))}>
            <SplitText text="Home" />
          </Link>
          <a onClick={() => setMenuOpen(false)} href="/#categories" className={mobileLinkClass(false)}>
            <SplitText text="Categories" />
          </a>
          <Link onClick={() => setMenuOpen(false)} to="/shop" className={mobileLinkClass(isActivePath("/shop"))}>
            <SplitText text="Shop" />
          </Link>
          <a onClick={() => setMenuOpen(false)} href="/#story" className={mobileLinkClass(false)}>
            <SplitText text="Our promise" />
          </a>
          <a onClick={() => setMenuOpen(false)} href="/#impact" className={mobileLinkClass(false)}>
            <SplitText text="Our impact" />
          </a>
          <Link onClick={() => setMenuOpen(false)} to="/enquiry" className={mobileLinkClass(isActivePath("/enquiry"))}>
            <SplitText text="Enquiry" />
          </Link>

          <Link
            to="/sell-with-reloop"
            onClick={() => setMenuOpen(false)}
            className="nav-split-link group flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-[#D7AE59] to-[#E8C77F] px-5 py-3 font-extrabold text-[#092F33] shadow-lg shadow-[#D7AE59]/20"
          >
            <Recycle size={16} className="animate-pulse" />
            <SplitText text="Sell with RELOOP" />
            <ArrowUpRight size={15} />
          </Link>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products"
            className="rounded-full bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/50"
          />

          <Link
            to="/cart"
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-3 transition hover:text-[#D7AE59] ${isActivePath("/cart") ? "text-[#D7AE59]" : "text-white/85"}`}
          >
            <ShoppingBag size={19} />
            Shopping Cart
            {cartCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D7AE59] px-1 text-xs font-bold text-[#092F33]">
                {cartCount}
              </span>
            )}
          </Link>

          {!loading && (
            user ? (
              <>
                <div className="border-t border-white/10 pt-4">
                  <p className="font-bold text-[#E8C77F]">
                    {user.first_name || user.username}
                  </p>
                  <p className="mt-1 text-xs text-white/60">{user.email}</p>
                </div>

                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3">
                  <UserRound size={18} /> My Profile
                </Link>

                <Link to="/my-orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3">
                  <Package size={18} /> My Orders
                </Link>
                {user?.is_staff && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 text-[#A7833D]">
                    <UserRound size={18} /> Admin Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-left text-red-300"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="w-fit rounded-full bg-[#D7AE59] px-5 py-3 font-bold text-[#092F33]"
              >
                Sign In
              </Link>
            )
          )}
        </nav>
      )}
    </header>
  );
}

export default Navbar;
