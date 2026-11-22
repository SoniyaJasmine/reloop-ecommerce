
import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Search,
  Heart,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  RotateCcw,
  ShoppingBag,
  ArrowRight,
  Check,
  SlidersHorizontal as FilterIcon,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { categories as staticCategories, products as staticProducts } from "../data/products";
import { API, useAuth } from "../context/AuthContext";

function Shop() {
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [allProducts, setAllProducts] = useState(staticProducts);
  const [productsLoading, setProductsLoading] = useState(true);
  const [shopCategories, setShopCategories] = useState(staticCategories);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [maxPrice, setMaxPrice] = useState(60000);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const productsSectionRef = useRef(null);
  const conditions = ["Like New", "Excellent", "Very Good", "Good"];

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  // Fetch all active products from Django
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get("products/");

        const backendProducts = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        const mappedProducts = backendProducts.map((product) => {
          const staticProduct = staticProducts.find(
            (item) => item.id === product.id
          );

          return {
            id: product.id,
            name: product.name,
            category: product.category,
            description: product.description || "",
            price: Number(product.price),
            original: Number(product.original),
            condition: product.condition,
            image: product.image,
            stock: Number(product.stock ?? 0),
            note:
              staticProduct?.note ||
              product.description ||
              "Carefully checked and ready for a new chapter.",
          };
        });

        setAllProducts(mappedProducts);
      } catch (error) {
        console.error("Failed to fetch Django products:", error);

        // Keep the original products visible if the API is unavailable
        setAllProducts(staticProducts);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch categories dynamically for shop filters
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get("products/categories/");
        const backendCategories = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        if (!Array.isArray(backendCategories) || backendCategories.length === 0) {
          setShopCategories(staticCategories);
          return;
        }

        const allMeta = staticCategories.find((c) => c.name === "All") || staticCategories[0];
        const merged = [
          allMeta,
          ...backendCategories
            .filter((c) => c && c.name && c.name !== "All")
            .map((c) => {
              const staticMatch = staticCategories.find((sc) => sc.name === c.name);
              return (
                staticMatch || {
                  name: c.name,
                  icon: Sparkles,
                  count: c.description || "Category",
                  image:
                    "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=900&q=85",
                }
              );
            }),
        ];

        // de-duplicate by name while preserving order
        const seen = new Set();
        setShopCategories(merged.filter((c) => c && c.name && !seen.has(c.name) && seen.add(c.name)));
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setShopCategories(staticCategories);
      }
    };

    fetchCategories();
  }, []);

  // Load the signed-in user's wishlist from Django
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setWishlist([]);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("reloop-access");

        const response = await API.get("wishlist/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setWishlist(response.data.map((item) => item.frontend_id));
      } catch (error) {
        console.error("Failed to load wishlist:", error);
      }
    };

    fetchWishlist();
  }, [user, authLoading]);

  // Add or remove a product using the Django wishlist API
  const toggleWishlist = async (id) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (wishlistLoading) return;

    const isWishlisted = wishlist.includes(id);
    const token = localStorage.getItem("reloop-access");

    try {
      setWishlistLoading(true);

      if (isWishlisted) {
        await API.delete(`wishlist/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setWishlist((previous) =>
          previous.filter((item) => item !== id)
        );
      } else {
        await API.post(
          "wishlist/",
          { product_id: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setWishlist((previous) =>
          previous.includes(id) ? previous : [...previous, id]
        );
      }
    } catch (error) {
      console.error("Wishlist update failed:", error);

      alert(
        error.response?.data?.error ||
          "Unable to update wishlist. Please try again."
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  // Condition filters
  const toggleCondition = (condition) => {
    setSelectedConditions((previous) =>
      previous.includes(condition)
        ? previous.filter((item) => item !== condition)
        : [...previous, condition]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveCategory("All");
    setSelectedConditions([]);
    setMaxPrice(60000);
    setSearch("");
    setSortBy("featured");
  };

  // Filter and sort products
  const visibleProducts = useMemo(() => {
    let result = [...allProducts];

    if (activeCategory !== "All") {
      result = result.filter(
        (product) => product.category === activeCategory
      );
    }

    if (selectedConditions.length > 0) {
      result = result.filter((product) =>
        selectedConditions.includes(product.condition)
      );
    }

    result = result.filter(
      (product) => product.price <= maxPrice
    );

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.condition.toLowerCase().includes(query)
      );
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "savings") {
      result.sort(
        (a, b) =>
          (b.original - b.price) - (a.original - a.price)
      );
    }

    return result;
  }, [
    allProducts,
    activeCategory,
    selectedConditions,
    maxPrice,
    search,
    sortBy,
  ]);

  useEffect(() => {
    if (selectedConditions.length > 0) {
      productsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedConditions]);

  return (
    <div className="min-h-screen bg-[#F3F2EC] text-[#092F33]">

      {/* Navbar */}
      <Navbar
        search={search}
        setSearch={setSearch}
        wishlist={wishlist}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {/* Shop Hero */}
      <section className="shop-hero relative isolate overflow-hidden bg-[#092F33] px-5 py-16 text-white sm:py-24">

        <div className="shop-hero-glow pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#D7AE59]/15 blur-3xl" />

        <div className="shop-hero-glow shop-hero-glow-secondary pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-[#2D8277]/20 blur-3xl" />

        <div className="shop-orb shop-orb-one" />
        <div className="shop-orb shop-orb-two" />
        <div className="shop-orb shop-orb-three" />
        <div className="shop-orb shop-orb-four" />
        <div className="shop-orb shop-orb-five" />

        <div className="shop-ring shop-ring-one" />
        <div className="shop-ring shop-ring-two" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center text-center">

          <p className="shop-hero-title mb-4 text-[10px] font-bold tracking-[0.28em] text-[#D7AE59]">
            THE RELOOP COLLECTION
          </p>

          <h1 className="shop-hero-title max-w-3xl font-heading text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Find Your Next
            <span className="italic text-[#E8C77F]"> Favourite.</span>
          </h1>

          <p className="shop-hero-description mx-auto mt-5 max-w-xl text-sm leading-7 text-[#B9C9C3]">
            Thoughtfully selected pre-owned products, carefully
            checked and ready for their next chapter.
          </p>

          <div className="shop-hero-breadcrumb mt-8 flex flex-wrap items-center justify-center gap-3 text-[13px] text-white/70">
            <Link to="/" className="transition hover:text-[#E8C77F]">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#E8C77F]">Shop</span>
          </div>

        </div>
      </section>

      {/* Shop Content */}
      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">

        {/* Page heading */}
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#A7833D]">
              DISCOVER SOMETHING GOOD
            </p>

            <h2 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">
              Shop thoughtfully.
            </h2>

            <p className="mt-2 text-sm text-[#6C817B]">
              Every product deserves another story.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-xl border border-[#D5D9D0] bg-white px-4 py-3 text-xs font-semibold text-[#174B50] transition hover:border-[#D7AE59] lg:hidden"
            >
              <SlidersHorizontal size={15} />
              Filters
            </button>

            <div className="flex items-center gap-2 rounded-xl border border-[#D5D9D0] bg-white px-3 py-2.5">
              <ArrowUpDown size={15} className="text-[#A7833D]" />

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="max-w-[150px] bg-transparent text-xs font-medium text-[#174B50] outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="savings">Biggest Savings</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product listing layout */}
        <div className="grid gap-9 lg:grid-cols-[245px_1fr]">

          {/* Sidebar Filters */}
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } lg:sticky lg:top-28 lg:block lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:overscroll-contain lg:self-start shop-filter-scroll`}
          >
            <div className="rounded-2xl border border-[#E1E2D9] bg-white p-5 shadow-sm">

              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FilterIcon size={17} className="text-[#A7833D]" />
                  <h3 className="text-sm font-bold">Filters</h3>
                </div>

                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-[10px] font-semibold text-[#A7833D] transition hover:text-[#092F33]"
                >
                  <RotateCcw size={12} />
                  Clear all
                </button>
              </div>

              {/* Categories */}
              <div className="border-b border-[#EAECE5] pb-6">
                <h4 className="mb-4 text-xs font-bold tracking-wide">
                  CATEGORIES
                </h4>

                <div className="flex flex-col gap-3">
                  {shopCategories.map((category) => {
                    const Icon = category.icon || Sparkles;

                    return (
                      <button
                        key={category.name}
                        onClick={() => {
                          setActiveCategory(category.name);
                          setShowFilters(false);
                        }}
                        className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs transition ${
                          activeCategory === category.name
                            ? "bg-[#092F33] font-semibold text-[#E8C77F]"
                            : "text-[#647A73] hover:bg-[#F3F2EC] hover:text-[#092F33]"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon size={15} />
                          {category.name}
                        </span>

                        {activeCategory === category.name && (
                          <Check size={14} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price filter */}
              <div className="border-b border-[#EAECE5] py-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-xs font-bold tracking-wide">
                    PRICE RANGE
                  </h4>

                  <span className="text-[10px] text-[#A7833D]">
                    INR
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="60000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(Number(e.target.value))
                  }
                  className="w-full cursor-pointer accent-[#A7833D]"
                />

                <div className="mt-3 flex items-center justify-between text-[11px] text-[#647A73]">
                  <span>₹0</span>
                  <span className="font-bold text-[#092F33]">
                    Up to {money(maxPrice)}
                  </span>
                </div>
              </div>

              {/* Condition filter */}
              <div className="pt-6">
                <h4 className="mb-4 text-xs font-bold tracking-wide">
                  CONDITION
                </h4>

                <div className="flex flex-col gap-4">
                  {conditions.map((condition) => (
                    <label
                      key={condition}
                      className="flex cursor-pointer items-center gap-3 text-xs text-[#647A73]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedConditions.includes(condition)}
                        onChange={() => toggleCondition(condition)}
                        className="h-4 w-4 cursor-pointer accent-[#174B50]"
                      />

                      {condition}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-7 rounded-xl bg-[#F3F2EC] p-4">
                <div className="flex items-center gap-2 text-[#A7833D]">
                  <ShoppingBag size={16} />
                  <span className="text-[10px] font-bold tracking-wide">
                    SHOP WITH CONFIDENCE
                  </span>
                </div>

                <p className="mt-2 text-[11px] leading-5 text-[#647A73]">
                  Every listed product goes through our quality
                  checking process.
                </p>
              </div>
            </div>
          </aside>

          {/* Products Area */}
          <section
            ref={productsSectionRef}
            className="min-w-0 scroll-mt-24"
          >

            {/* Product toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[#647A73]">
                Showing{" "}
                <span className="font-bold text-[#092F33]">
                  {visibleProducts.length}
                </span>{" "}
                of {allProducts.length} products
              </p>

              <div className="flex flex-wrap gap-2">
                {activeCategory !== "All" && (
                  <button
                    onClick={() => setActiveCategory("All")}
                    className="flex items-center gap-1 rounded-full bg-[#E5E8DF] px-3 py-1.5 text-[10px] font-semibold text-[#174B50]"
                  >
                    {activeCategory}
                    <X size={12} />
                  </button>
                )}

                {selectedConditions.map((condition) => (
                  <button
                    key={condition}
                    onClick={() => toggleCondition(condition)}
                    className="flex items-center gap-1 rounded-full bg-[#E5E8DF] px-3 py-1.5 text-[10px] font-semibold text-[#174B50]"
                  >
                    {condition}
                    <X size={12} />
                  </button>
                ))}
              </div>
            </div>

            {/* Loading */}
            {productsLoading ? (
              <div className="flex min-h-[350px] items-center justify-center rounded-2xl bg-white">
                <p className="text-sm font-medium text-[#647A73]">
                  Loading RELOOP products...
                </p>
              </div>
            ) : visibleProducts.length > 0 ? (

              /* Product Grid */
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">

                {visibleProducts.map((product) => {
                  const isWishlisted = wishlist.includes(product.id);
                  const savings = product.original - product.price;

                  const discount =
                    product.original > 0
                      ? Math.round(
                          (savings / product.original) * 100
                        )
                      : 0;

                  return (
                    <article
                      key={product.id}
                      className="shop-product-card group overflow-hidden rounded-2xl border border-[#E4E5DC] bg-white transition-all duration-500 hover:-translate-y-2 hover:border-[#D7AE59]/60 hover:shadow-xl hover:shadow-[#092F33]/[0.10]"
                    >

                      {/* Product Image */}
                      <div className="relative m-3 overflow-hidden rounded-xl bg-[#F3F2EC]">
                        <Link to={`/product/${product.id}`}>
                          <img
                            src={product.image}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.style.opacity = "0.3";
                            }}
                            className="h-56 w-full object-cover transition duration-700 group-hover:scale-110"
                          />
                        </Link>

                        <span className="absolute left-3 top-3 rounded-full bg-[#092F33] px-3 py-1.5 text-[9px] font-bold text-[#E8C77F]">
                          {discount}% OFF
                        </span>

                        <button
                          onClick={() => toggleWishlist(product.id)}
                          disabled={wishlistLoading || authLoading}
                          aria-label={
                            isWishlisted
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition ${
                            isWishlisted
                              ? "bg-[#D7AE59] text-[#092F33]"
                              : "bg-white/95 text-[#174B50] hover:bg-[#D7AE59]"
                          }`}
                        >
                          <Heart
                            size={17}
                            fill={isWishlisted ? "currentColor" : "none"}
                          />
                        </button>

                        <span className="absolute bottom-3 left-3 rounded-md border border-white/70 bg-white/90 px-2.5 py-1 text-[9px] font-semibold text-[#174B50] backdrop-blur">
                          {product.condition} condition
                        </span>
                      </div>

                      {/* Product Information */}
                      <div className="px-4 pb-4 pt-1">
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#A7833D]">
                          {product.category}
                        </p>

                        <Link to={`/product/${product.id}`}>
                          <h3 className="mt-2 line-clamp-1 text-[18px] font-bold text-[#092F33] transition hover:text-[#A7833D]">
                            {product.name}
                          </h3>
                        </Link>

                        <p className="mt-1 line-clamp-1 text-[12px] text-[#84948C]">
                          {product.note}
                        </p>

                        <div className="mt-4 flex items-end justify-between gap-2">
                          <div>
                            <p className="text-lg font-bold text-[#092F33]">
                              {money(product.price)}
                            </p>

                            <p className="mt-0.5 text-[12px] text-[#9AA69E] line-through">
                              {money(product.original)}
                            </p>
                          </div>

                          <p className="text-[12px] font-semibold text-[#3D8171]">
                            Save {money(savings)}
                          </p>
                        </div>

                        <p
                          className={`mt-3 text-[11px] font-semibold ${
                            product.stock > 5
                              ? "text-[#286B56]"
                              : product.stock > 0
                              ? "text-[#8A6517]"
                              : "text-red-600"
                          }`}
                        >
                          {product.stock > 5
                            ? `In stock (${product.stock} available)`
                            : product.stock > 0
                            ? `Only ${product.stock} left`
                            : "Out of stock"}
                        </p>

                        <Link
                          to={`/product/${product.id}`}
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#174B50] py-3 text-[12px] font-bold text-[#174B50] transition duration-300 hover:bg-[#092F33] hover:text-white"
                        >
                          View details
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (

              /* Empty State */
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#C9D0C5] bg-white px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F2EC] text-[#A7833D]">
                  <Search size={25} />
                </div>

                <h3 className="mt-5 font-heading text-2xl font-semibold">
                  No products found
                </h3>

                <p className="mt-2 max-w-sm text-xs leading-6 text-[#84948C]">
                  We couldn't find products matching your current
                  filters. Try changing your search or exploring
                  another category.
                </p>

                <button
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-[#092F33] px-6 py-3 text-xs font-bold text-[#E8C77F] transition hover:bg-[#174B50]"
                >
                  Clear all filters
                </button>
              </div>
            )}

          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Shop;
