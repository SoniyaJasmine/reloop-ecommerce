
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ArrowLeft,
  LoaderCircle,
  PackageOpen,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useAuth, API } from "../context/AuthContext";

function Wishlist() {
  const { addToCart } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);


const fetchWishlist = async () => {
  try {
    setFetching(true);
    setError("");

    const token = localStorage.getItem("reloop-access");

    if (!token) {
      setWishlist([]);
      setError("Please log in to view your wishlist.");
      return;
    }

    const response = await API.get("wishlist/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setWishlist(response.data);
  } catch (err) {
    console.error("Wishlist fetch error:", err);
    setError(
      err.response?.data?.detail ||
      "Unable to load your wishlist. Please try again."
    );
  } finally {
    setFetching(false);
  }
};

useEffect(() => {
  if (loading) return;

  if (!user) {
    setFetching(false);
    navigate("/login");
    return;
  }

  fetchWishlist();
}, [user, loading]);


  const removeFromWishlist = async (frontendId) => {
    try {
      setRemovingId(frontendId);

      const token = localStorage.getItem("reloop-access");

      await API.delete(`wishlist/${frontendId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWishlist((previous) =>
        previous.filter((item) => item.frontend_id !== frontendId)
      );
    } catch (err) {
      console.error("Remove wishlist error:", err);
      setError("Unable to remove this product. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const moveToCart = async (item) => {
    if (item.stock < 1) return;

    addToCart({
      id: item.frontend_id,
      name: item.product_name,
      image: item.product_image,
      price: Number(item.product_price),
      original: Number(item.original_price),
      condition: item.condition,
      category: item.category,
      stock: item.stock,
    });

    await removeFromWishlist(item.frontend_id);
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-[#F3F2EC]">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoaderCircle
            size={32}
            className="animate-spin text-[#174B50]"
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2EC]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <Link
          to="/shop"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#64716C] transition hover:text-[#092F33]"
        >
          <ArrowLeft size={16} />
          Continue Shopping
        </Link>

        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#A7833D]">
            Your Saved Collection
          </p>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-4xl text-[#092F33] md:text-5xl">
                My Wishlist
              </h1>
              <p className="mt-3 text-sm text-[#64716C]">
                Keep the pieces you love close until you're ready.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#64716C]">
              <Heart size={17} className="text-[#A7833D]" />
              {wishlist.length} Saved{" "}
              {wishlist.length === 1 ? "Item" : "Items"}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button
              onClick={fetchWishlist}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {wishlist.length === 0 && !error ? (
          <div className="rounded-2xl border border-[#E4E5DC] bg-white px-6 py-20 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F3F2EC] text-[#174B50]">
              <PackageOpen size={34} />
            </div>

            <h2 className="font-heading text-3xl text-[#092F33]">
              Your wishlist is waiting
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#64716C]">
              You haven't saved anything yet. Explore our curated collection
              and keep the pieces you love in one place.
            </p>

            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#092F33] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-[#174B50]"
            >
              Explore Collection
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-[#E4E5DC] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[4/4.2] overflow-hidden bg-[#F3F2EC]">
                  <Link to={`/product/${item.frontend_id}`}>
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#84948C]">
                        <ShoppingBag size={36} />
                      </div>
                    )}
                  </Link>

                  <button
                    onClick={() => removeFromWishlist(item.frontend_id)}
                    disabled={removingId === item.frontend_id}
                    aria-label="Remove from wishlist"
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
                  >
                    {removingId === item.frontend_id ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>

                  <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#174B50]">
                    {item.condition}
                  </span>
                </div>

                <div className="p-5">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A7833D]">
                    {item.category}
                  </p>

                  <Link to={`/product/${item.frontend_id}`}>
                    <h3 className="line-clamp-1 text-base font-semibold text-[#092F33] transition hover:text-[#A7833D]">
                      {item.product_name}
                    </h3>
                  </Link>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-lg font-semibold text-[#092F33]">
                      ₹{Number(item.product_price).toLocaleString("en-IN")}
                    </span>

                    <span className="text-sm text-[#9AA39E] line-through">
                      ₹{Number(item.original_price).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <button
                    onClick={() => moveToCart(item)}
                    disabled={item.stock < 1 || removingId === item.frontend_id}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#092F33] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#174B50] disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    <ShoppingBag size={15} />
                    {item.stock < 1 ? "Out of Stock" : "Move to Cart"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Wishlist;
