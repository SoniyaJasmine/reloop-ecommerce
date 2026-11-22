import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  PackageCheck,
  RefreshCw,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    cartCount,
  } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const originalTotal = cartItems.reduce(
    (total, item) => total + item.original * item.quantity,
    0
  );

  const totalSavings = originalTotal - subtotal;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F3F2EC] text-[#092F33]">
        <Navbar
          search={search}
          setSearch={setSearch}
          wishlist={wishlist}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />

        <main className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-5 py-20 text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#E9E8DF]">
            <ShoppingBag size={45} className="text-[#A7833D]" />
          </div>

          <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.25em] text-[#A7833D]">
            YOUR RELOOP BAG
          </p>

          <h1 className="mt-3 font-heading text-4xl font-semibold">
            Your cart is waiting.
          </h1>

          <p className="mt-4 max-w-md text-sm leading-7 text-[#84948C]">
            Looks like you haven't added anything yet.
            Discover thoughtfully selected pre-owned products
            and give something a second life.
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-[#092F33] px-7 py-4 text-xs font-bold text-[#E8C77F] transition hover:bg-[#174B50]"
          >
            Explore the collection
            <ArrowRight size={16} />
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2EC] text-[#092F33]">
      <Navbar
        search={search}
        setSearch={setSearch}
        wishlist={wishlist}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#A7833D]">
            YOUR RELOOP COLLECTION
          </p>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-4xl font-semibold sm:text-5xl">
                Shopping bag.
              </h1>

              <p className="mt-3 text-[14px] text-[#84948C]">
                {cartCount} {cartCount === 1 ? "item" : "items"} in your bag
              </p>
            </div>

            <Link
              to="/shop"
              className="flex items-center gap-2 text-xs font-bold text-[#174B50] transition hover:text-[#A7833D]"
            >
              <ArrowLeft size={15} />
              Continue shopping
            </Link>
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">

          {/* Cart Products */}
          <section className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-5 rounded-2xl border border-[#E4E5DC] bg-white p-4 transition hover:shadow-md sm:flex-row sm:p-5"
              >
                {/* Product Image */}
                <Link
                  to={`/product/${item.id}`}
                  className="h-40 shrink-0 overflow-hidden rounded-xl bg-[#F3F2EC] sm:w-40"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-contain p-3 transition duration-500 hover:scale-105"
                  />
                </Link>

                {/* Product Information */}
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-wider text-[#A7833D]">
                      {item.category}
                    </p>

                    <Link
                      to={`/product/${item.id}`}
                      className="mt-2 inline-block text-base font-semibold text-[#092F33] transition hover:text-[#A7833D]"
                    >
                      {item.name}
                    </Link>

                    <p className="mt-2 text-xs text-[#84948C]">
                      Condition: {item.condition}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-lg font-bold text-[#174B50]">
                        {money(item.price)}
                      </span>

                      <span className="text-xs text-[#9AA69E] line-through">
                        {money(item.original)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    {/* Quantity */}
                    <div className="flex items-center overflow-hidden rounded-lg border border-[#E4E5DC]">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="p-2.5 text-[#174B50] transition hover:bg-[#F3F2EC] disabled:opacity-30"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="min-w-9 text-center text-xs font-bold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-2.5 text-[#174B50] transition hover:bg-[#F3F2EC]"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="flex items-center gap-2 text-[11px] font-semibold text-[#9A6C62] transition hover:text-red-600"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="flex items-end justify-between border-t border-[#EAECE5] pt-4 sm:min-w-24 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                  <p className="text-[10px] text-[#84948C]">
                    Item total
                  </p>

                  <p className="text-lg font-bold text-[#092F33]">
                    {money(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </section>

          {/* Order Summary */}
          <aside className="rounded-2xl border border-[#E4E5DC] bg-white p-6 lg:sticky lg:top-28">
            <h2 className="font-heading text-2xl font-bold">
              Order summary
            </h2>

            <div className="mt-7 space-y-5 border-b border-[#EAECE5] pb-6">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#84948C]">
                  Original price
                </span>
                <span className="font-semibold">
                  {money(originalTotal)}
                </span>
              </div>

              <div className="flex justify-between text-[14px]">
                <span className="text-[#84948C]">
                  Your savings
                </span>
                <span className="font-semibold text-[#3D8171]">
                  -{money(totalSavings)}
                </span>
              </div>

              <div className="flex justify-between text-[14px]">
                <span className="text-[#84948C]">
                  Subtotal
                </span>
                <span className="font-semibold">
                  {money(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-[14px]">
                <span className="text-[#84948C]">
                  Delivery
                </span>
                <span className="font-semibold text-[#3D8171]">
                  Calculated at checkout
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-6">
              <span className="text-sm font-bold">
                Estimated total
              </span>

              <span className="text-2xl font-bold text-[#092F33]">
                {money(subtotal)}
              </span>
            </div>

            <button
            onClick={() => navigate("/checkout")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#092F33] px-5 py-4 text-xs font-bold text-[#E8C77F] transition hover:bg-[#174B50]"
            >
            Proceed to checkout
            <ArrowRight size={16} />
            </button>

            <p className="mt-3 text-center text-[10px] text-[#84948C]">
              Checkout will be available in the next step.
            </p>

            {/* Trust Details */}
            <div className="mt-7 space-y-4 border-t border-[#EAECE5] pt-6">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-[#A7833D]" />
                <span className="text-[11px] text-[#647A73]">
                  Carefully reviewed products
                </span>
              </div>

              <div className="flex items-center gap-3">
                <PackageCheck size={18} className="text-[#A7833D]" />
                <span className="text-[11px] text-[#647A73]">
                  Secure order processing
                </span>
              </div>

              <div className="flex items-center gap-3">
                <RefreshCw size={18} className="text-[#A7833D]" />
                <span className="text-[11px] text-[#647A73]">
                  Give products a second life
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Cart;
