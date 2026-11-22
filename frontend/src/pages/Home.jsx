
import { useMemo, useState, useEffect, useRef } from "react";
import {
  Search,
  Heart,
  ShoppingBag,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Leaf,
  Laptop,
  Armchair,
  BookOpen,
  Pencil,
  Smartphone,
  Headphones,
  SlidersHorizontal,
  Sparkles,
  BadgeCheck,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { API, useAuth } from "../context/AuthContext";

import { categories, products } from "../data/products";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const money = (value) =>
  `₹${Number(value).toLocaleString("en-IN")}`;

function App() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [menuOpen, setMenuOpen] = useState(false);

  // Hero animation
  const [showHeroAnimation, setShowHeroAnimation] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const section = heroRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowHeroAnimation(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Savings animation
  const [showSavingsAnimation, setShowSavingsAnimation] = useState(false);
  const savingsSectionRef = useRef(null);

  useEffect(() => {
    const section = savingsSectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowSavingsAnimation(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Condition and impact animations
  const [showConditionAnimation, setShowConditionAnimation] = useState(false);
  const [showImpactAnimation, setShowImpactAnimation] = useState(false);

  const conditionRef = useRef(null);
  const impactRef = useRef(null);

  useEffect(() => {
    const sections = [
      [conditionRef, setShowConditionAnimation],
      [impactRef, setShowImpactAnimation],
    ];

    const observers = sections.map(([ref, setVisible]) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setVisible(entry.isIntersecting);
        },
        { threshold: 0.15 }
      );

      if (ref.current) observer.observe(ref.current);
      return observer;
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  // Load wishlist from Django
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setWishlist([]);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("reloop-access");

        if (!token) {
          setWishlist([]);
          return;
        }

        const response = await API.get("wishlist/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setWishlist(
          response.data.map((item) => Number(item.frontend_id))
        );
      } catch (error) {
        console.error("Home wishlist loading error:", error);
      }
    };

    fetchWishlist();
  }, [user, authLoading]);

  // Add / remove wishlist item
  const toggleWishlist = async (id) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (wishlistLoading || authLoading) return;

    const token = localStorage.getItem("reloop-access");

    if (!token) {
      navigate("/login");
      return;
    }

    const alreadySaved = wishlist.includes(Number(id));

    try {
      setWishlistLoading(true);

      if (alreadySaved) {
        await API.delete(`wishlist/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setWishlist((current) =>
          current.filter((item) => item !== Number(id))
        );
      } else {
        await API.post(
          "wishlist/",
          { product_id: id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setWishlist((current) =>
          current.includes(Number(id))
            ? current
            : [...current, Number(id)]
        );
      }
    } catch (error) {
      console.error("Wishlist update error:", error);

      alert(
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Unable to update wishlist. Please try again."
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  // Product filtering and sorting
  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch = `${product.name} ${product.category}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "All" ||
        product.category === activeCategory;

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    }

    if (sortBy === "savings") {
      filtered.sort(
        (a, b) =>
          (b.original - b.price) - (a.original - a.price)
      );
    }

    return filtered;
  }, [search, activeCategory, sortBy]);

  // Savings calculator
  const [newPrice, setNewPrice] = useState(10000);

  const usedPrice = Math.round(newPrice * 0.6);
  const savings = newPrice - usedPrice;

  const savingsPercentage =
    newPrice > 0 ? (savings / newPrice) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#F3F2EC] text-[#192F30]">

      {/* Navigation */}
      <Navbar
        search={search}
        setSearch={setSearch}
        wishlist={wishlist}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {/* Hero */}
      <section
        ref={heroRef}
        className={`hero-section relative overflow-hidden bg-[#092F33] text-white ${
          showHeroAnimation ? "show-hero-animation" : ""
        }`}
      >
        <div className="hero-orb hero-orb-one absolute -right-20 top-0 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(215,174,89,0.30)_0%,rgba(215,174,89,0.12)_40%,transparent_72%)] blur-2xl" />

        <div className="hero-orb hero-orb-two absolute -bottom-40 left-1/4 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(45,130,119,0.45)_0%,rgba(23,75,80,0.25)_45%,transparent_72%)] blur-2xl" />

        <div className="hero-orb hero-orb-three absolute left-[35%] top-[20%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(215,174,89,0.18)_0%,transparent_70%)] blur-2xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-8 py-16 md:grid-cols-[1.02fr_0.98fr] md:py-24 lg:px-8">

          <div className="max-w-2xl">
            <div className="hero-reveal hero-delay-1 mb-6 inline-flex items-center gap-2 rounded-full border border-[#D7AE59]/35 bg-white/5 px-4 py-2 text-[10px] font-semibold tracking-[0.2em] text-[#E8CD8D]">
              <RefreshCw size={13} />
              PRE-LOVED. RE-VALUED.
            </div>

            <h1 className="hero-reveal hero-delay-2 font-heading text-4xl font-semibold leading-[0.98] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[4rem]">
              The things you love.
              <span className="mt-2 block italic text-[#D7AE59]">
                Loved all over again.
              </span>
            </h1>

            <p className="hero-reveal hero-delay-3 mt-7 max-w-lg text-sm leading-7 text-[#D5E1DE] sm:text-base sm:leading-8">
              Find quality-checked pre-owned products with a story worth continuing.
              Discover more, spend less and shop with confidence.
            </p>

            <div className="hero-reveal hero-delay-4 mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#products"
                className="inline-flex items-center gap-3 rounded-full bg-[#D7AE59] px-7 py-3.5 text-xs font-bold text-[#092F33] transition hover:-translate-y-1 hover:bg-[#E8C77F]"
              >
                Explore the collection <ArrowRight size={17} />
              </a>

              <a
                href="#story"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-xs font-semibold text-white transition hover:border-[#D7AE59] hover:text-[#D7AE59]"
              >
                Why RELOOP <ArrowUpRight size={15} />
              </a>
            </div>

            <div className="hero-reveal hero-delay-5 mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6">
              <div>
                <p className="font-heading text-3xl font-semibold text-[#D7AE59] sm:text-4xl">100%</p>
                <p className="mt-1 text-[10px] leading-4 text-white/65 sm:text-xs">
                  Condition transparency
                </p>
              </div>

              <div>
                <p className="font-heading text-3xl font-semibold text-[#D7AE59] sm:text-4xl">Smart</p>
                <p className="mt-1 text-[10px] leading-4 text-white/65 sm:text-xs">
                  Everyday savings
                </p>
              </div>

              <div>
                <p className="font-heading text-3xl font-semibold text-[#D7AE59] sm:text-4xl">Again</p>
                <p className="mt-1 text-[10px] leading-4 text-white/65 sm:text-xs">
                  Products with purpose
                </p>
              </div>
            </div>
          </div>

          <div className="hero-visual relative mx-auto w-full max-w-xl">
            <div className="hero-frame absolute -inset-3 rounded-[2rem] border border-[#D7AE59]/25" />

            <div className="relative grid grid-cols-2 gap-3 rounded-[1.8rem] bg-[#174B50] p-3 shadow-2xl shadow-black/25">
              <div className="col-span-2 overflow-hidden rounded-[1.3rem]">
                <img
                  src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1200&q=90"
                  alt="Thoughtfully arranged home and lifestyle finds"
                  className="hero-image hero-image-one h-52 w-full object-cover sm:h-64"
                />
              </div>

              <div className="overflow-hidden rounded-[1.2rem]">
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&q=85"
                  alt="Pre-owned laptop"
                  className="hero-image hero-image-two h-36 w-full object-cover sm:h-44"
                />
              </div>

              <div className="relative overflow-hidden rounded-[1.2rem]">
                <img
                  src="https://images.unsplash.com/photo-1503602642458-232111445657?w=700&q=85"
                  alt="Pre-owned chair"
                  className="hero-image hero-image-three h-36 w-full object-cover sm:h-44"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-[#D9DCD4] bg-[#E9E8DF]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-5 py-6 sm:grid-cols-4 lg:px-8">
          {[
            [ShieldCheck, "Quality checked", "Inspected before listing"],
            [BadgeCheck, "Honest condition", "Know what to expect"],
            [ShoppingBag, "Better value", "Spend less, choose well"],
            [RefreshCw, "A second life", "Keep good things in use"],
          ].map(([Icon, title, subtitle]) => (
            <div key={title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#174B50]">
                <Icon size={19} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#173B3D] sm:text-[11px]">{title}</p>
                <p className="mt-0.5 text-[10px] text-[#71807B]">{subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-bold tracking-[0.22em] text-[#9A7837]">
                A LITTLE SOMETHING FOR EVERYONE
              </p>
              <h2 className="mt-2 font-heading text-4xl font-semibold text-[#092F33] sm:text-5xl">
                Find your next favourite.
              </h2>
            </div>

            <a href="#products" className="flex items-center gap-2 text-[12px] font-bold text-[#174B50] hover:text-[#9A7837]">
              Browse all <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const active = activeCategory === category.name;

              return (
                <button
                  key={category.name}
                  onClick={() => {
                    setActiveCategory(category.name);
                    document.getElementById("products")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                  aria-pressed={active}
                  className={`group relative h-48 overflow-hidden rounded-2xl text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:h-56 ${
                    active
                      ? "ring-4 ring-[#D7AE59] ring-offset-2"
                      : "ring-1 ring-black/5"
                  }`}
                >
                  <img
                    src={category.image}
                    alt={`${category.name} category`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:-translate-x-5"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#092F33]/90 via-[#092F33]/25 to-black/5" />

                  <span className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#174B50] shadow-sm transition-transform duration-500 group-hover:-translate-x-2">
                    <Icon size={18} />
                  </span>

                  <span className="absolute inset-x-4 bottom-4 z-10 transition-all duration-500 group-hover:-translate-x-5 group-hover:opacity-0">
                    <span className="block text-base font-bold text-white sm:text-lg">
                      {category.name}
                    </span>
                    <span className="mt-1 block text-[10px] text-white/75 sm:text-xs">
                      {category.count}
                    </span>
                  </span>

                  <span className="absolute inset-y-0 right-0 z-20 flex w-[55%] translate-x-full flex-col justify-center bg-[#092F33]/95 px-3 transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-x-0">
                    <span className="text-[9px] font-bold tracking-[0.18em] text-[#D7AE59]">
                      {String(index + 1).padStart(2, "0")} / RELOOP PICKS
                    </span>

                    <span className="mt-3 block text-sm font-bold leading-5 text-white sm:text-base">
                      {category.name === "Electronics" && "Smart choices. Second lives."}
                      {category.name === "Mobiles" && "More life in every device."}
                      {category.name === "Furniture" && "Make room for something loved."}
                      {category.name === "Stationery" && "Fresh ideas, less waste."}
                      {category.name === "Books" && "Every book deserves another reader."}
                      {category.name === "Audio" && "Good sound. A second round."}
                      {category.name === "All" && "Discover something worth reusing."}
                    </span>

                    <span className="mt-2 block text-[10px] leading-4 text-[#A9C1BC]">
                      Explore quality-checked pre-owned finds.
                    </span>

                    <span className="mt-4 block text-[10px] font-bold uppercase tracking-wider text-[#D7AE59]">
                      Discover collection
                    </span>
                  </span>

                  {active && (
                    <span className="absolute left-3 top-3 z-30 rounded-full bg-[#D7AE59] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#092F33]">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product collection */}
      <section id="products" className="bg-[#F3F2EC] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[12px] font-bold tracking-[0.22em] text-[#9A7837]">
                HANDPICKED. CHECKED. READY FOR YOU.
              </p>
              <h2 className="mt-2 mb-5 font-heading text-4xl font-semibold text-[#092F33] sm:text-5xl">
                Good finds, waiting.
              </h2>
            </div>

            <div className="flex w-full flex-wrap items-center gap-4 sm:w-auto">
              <label className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-[#D9DDD5] bg-white px-4 py-2.5 sm:w-52 sm:flex-none">
                <Search size={15} className="text-[#55716E]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search collection"
                  className="w-full bg-transparent text-xs outline-none placeholder:text-[#9AA49E]"
                />
              </label>

              <label className="flex items-center gap-2 rounded-full border border-[#D9DDD5] bg-white px-4 py-2.5 text-xs text-[#365451]">
                <SlidersHorizontal size={14} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="savings">Biggest savings</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`rounded-full px-4 py-2 text-[12px] font-semibold transition ${
                  activeCategory === category.name
                    ? "bg-[#092F33] text-white"
                    : "border border-[#D9DDD5] bg-white text-[#5F716B] hover:border-[#174B50]"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {visibleProducts.map((product) => {
              const saved = product.original - product.price;
              const isSaved = wishlist.includes(Number(product.id));

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-[1.25rem] border border-[#E7E8E1] bg-white transition-colors duration-300 hover:border-[#D7AE59]/50"
                >
                  <div className="relative overflow-hidden bg-[#E8E9E3]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-60 w-full object-cover transition-transform duration-700 ease-out [transform:perspective(1000px)_translateZ(0)_rotateX(0deg)_rotateY(0deg)] group-hover:[transform:perspective(1000px)_translateZ(25px)_rotateX(3deg)_rotateY(-4deg)_scale(1.06)]"
                    />

                    <span className="pointer-events-none absolute left-0 top-0 z-10 h-[6px] w-full origin-center scale-x-0 bg-[rgba(107,114,128,0.4)] opacity-0 transition-all duration-300 ease-out group-hover:scale-x-100 group-hover:opacity-100" />

                    <span className="pointer-events-none absolute right-0 top-0 z-10 h-full w-[6px] origin-center scale-y-0 bg-[rgba(107,114,128,0.4)] opacity-0 transition-all duration-300 ease-out group-hover:scale-y-100 group-hover:opacity-100" />

                    <span className="pointer-events-none absolute bottom-0 left-0 z-10 h-[6px] w-full origin-center scale-x-0 bg-[rgba(107,114,128,0.4)] opacity-0 transition-all duration-300 ease-out group-hover:scale-x-100 group-hover:opacity-100" />

                    <span className="pointer-events-none absolute bottom-0 left-0 z-10 h-full w-[6px] origin-center scale-y-0 bg-[rgba(107,114,128,0.4)] opacity-0 transition-all duration-300 ease-out group-hover:scale-y-100 group-hover:opacity-100" />

                    <span className="absolute left-3 top-3 z-20 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-[#174B50]">
                      {product.condition}
                    </span>

                    <span className="absolute bottom-3 left-3 z-20 rounded-full bg-[#092F33]/90 px-3 py-1.5 text-[9px] font-semibold text-white">
                      Save {Math.round((saved / product.original) * 100)}%
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      disabled={wishlistLoading || authLoading}
                      aria-label={
                        isSaved
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      className="absolute right-3 top-3 z-20 rounded-full bg-white p-2.5 text-[#174B50] shadow-sm transition hover:bg-[#092F33] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Heart
                        size={16}
                        fill={isSaved ? "currentColor" : "none"}
                      />
                    </button>
                  </div>

                  <div className="p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#9A7837]">
                      {product.category}
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-[#173B3D]">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-[10px] text-[#87928C]">
                      {product.note}
                    </p>

                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-[#092F33]">
                        {money(product.price)}
                      </span>
                      <span className="text-[12px] text-[#9AA39D] line-through">
                        {money(product.original)}
                      </span>
                    </div>

                    <p className="mt-1 text-[12px] font-semibold text-[#39766B]">
                      You save {money(saved)}
                    </p>

                    <Link
                      to={`/product/${product.id}`}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#174B50] px-4 py-3 text-[10px] font-bold text-[#174B50] transition hover:bg-[#092F33] hover:text-white"
                    >
                      View details <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {visibleProducts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#C9D2CB] bg-white py-14 text-center">
              <Search size={25} className="mx-auto text-[#82958D]" />
              <p className="mt-3 text-sm font-semibold text-[#173B3D]">
                No matching finds just yet.
              </p>
              <p className="mt-1 text-xs text-[#87928C]">
                Try another search or category.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                className="mt-4 text-xs font-bold text-[#9A7837]"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Savings calculator */}
      <section
        ref={savingsSectionRef}
        className={`overflow-hidden bg-[#E9E8DF] py-16 sm:py-20 ${
          showSavingsAnimation ? "show-savings-animation" : ""
        }`}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="savings-reveal text-[10px] font-bold tracking-[0.22em] text-[#9A7837]">
              MAKE YOUR MONEY GO FURTHER
            </p>

            <h2 className="savings-reveal savings-delay-1 mt-3 font-heading text-4xl font-semibold leading-tight text-[#092F33] sm:text-5xl">
              A smarter price.
              <br />
              <span className="italic text-[#557A72]">
                A happier purchase.
              </span>
            </h2>

            <p className="savings-reveal savings-delay-2 mt-4 max-w-md text-sm leading-7 text-[#65736D]">
              See how much you could keep in your pocket when you choose
              pre-owned instead of buying new.
            </p>
          </div>

          <div className="rounded-[1.7rem] bg-white p-6 shadow-xl shadow-[#173B3D]/5 sm:p-8">
            <div className="savings-reveal savings-delay-1 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-[#9A7837]">
                  YOUR SAVINGS ESTIMATE
                </p>
                <p className="mt-1 text-xs text-[#71807A]">
                  Adjust the original price to compare
                </p>
              </div>

              <div className="rounded-full bg-[#EAF0EC] p-3 text-[#174B50]">
                <Sparkles size={20} />
              </div>
            </div>

            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              <label className="savings-reveal savings-delay-2 block">
                <span className="text-xs font-semibold text-[#425C56]">
                  Price of a new product
                </span>

                <div className="mt-2 flex items-center rounded-xl border border-[#DCE2DC] px-3 py-3 transition-colors focus-within:border-[#557A72]">
                  <span className="text-sm text-[#82918A]">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={newPrice}
                    onChange={(e) =>
                      setNewPrice(Math.max(0, Number(e.target.value)))
                    }
                    className="w-full bg-transparent pl-2 text-sm font-bold text-[#173B3D] outline-none"
                  />
                </div>
              </label>

              <label className="savings-reveal savings-delay-3 block">
                <span className="flex items-center gap-2 text-xs font-semibold text-[#425C56]">
                  RELOOP price
                  <span className="rounded-full bg-[#EAF0EC] px-2 py-1 text-[9px] font-bold text-[#39766B]">
                    40% OFF
                  </span>
                </span>

                <div className="mt-2 flex items-center rounded-xl border border-[#DCE2DC] bg-[#F5F7F3] px-3 py-3">
                  <span className="text-sm text-[#82918A]">₹</span>
                  <input
                    type="number"
                    value={usedPrice}
                    readOnly
                    className="w-full cursor-not-allowed bg-transparent pl-2 text-sm font-bold text-[#173B3D] outline-none"
                  />
                </div>
              </label>
            </div>

            <div className="savings-reveal savings-delay-4 mt-6 rounded-2xl bg-[#092F33] p-6 text-white">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[#D7AE59]">
                YOU COULD SAVE
              </p>

              <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
                <p className="font-heading text-5xl font-semibold text-[#E8C77F]">
                  {money(savings)}
                </p>

                <span className="rounded-full bg-[#D7AE59]/20 px-3 py-1.5 text-[10px] font-bold text-[#E8C77F]">
                  {Math.round(savingsPercentage)}% SAVED
                </span>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-[#D7AE59] transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.min(100, savingsPercentage)}%`,
                  }}
                />
              </div>

              <div className="savings-reveal savings-delay-5 mt-3 flex items-center justify-between text-[10px] text-white/65">
                <span>Original price</span>
                <span>40% savings</span>
              </div>

              <p className="savings-reveal savings-delay-6 mt-3 text-[10px] leading-5 text-white/55">
                Your actual savings depend on the product and its listed condition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Condition Passport */}
      <section
        ref={conditionRef}
        id="story"
        className={`relative overflow-hidden bg-[#092F33] py-12 text-white sm:py-20 ${
          showConditionAnimation ? "show-condition-animation" : ""
        }`}
      >
        <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-[#D7AE59]/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2 lg:px-8">
          <div className="condition-reveal condition-left">
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#D7AE59]">
              THE RELOOP PROMISE
            </p>

            <h2 className="mt-4 font-heading text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
              Second-hand shouldn't mean second-guessing.
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-8 text-[#C4D4CF]">
              Every listed product is checked and described clearly. Its Condition
              Passport brings the inspection details together, so you know more
              before you decide.
            </p>

            <a
              href="#products"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#D7AE59] px-6 py-3.5 text-xs font-bold text-[#092F33] transition hover:bg-[#E8C77F] hover:scale-105"
            >
              Shop with confidence <ArrowRight size={16} />
            </a>
          </div>

          <div className="condition-reveal condition-right rounded-[1.7rem] bg-white p-6 text-[#173B3D] shadow-2xl sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold tracking-[0.18em] text-[#9A7837]">
                  A CLEARER WAY TO BUY
                </p>
                <h3 className="mt-1 font-heading text-3xl font-semibold">
                  Condition Passport
                </h3>
              </div>

              <div className="rounded-2xl bg-[#EAF0EC] p-3 text-[#174B50]">
                <ShieldCheck size={28} />
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#F3F4EF] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold">Example inspection report</p>
                <span className="rounded-full bg-[#DCEBE3] px-3 py-1 text-[9px] font-bold text-[#326D5A]">
                  DEMO
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {[
                  "Physical condition",
                  "Display / surface quality",
                  "Core functionality",
                  "Included accessories",
                ].map((item, index) => (
                  <div
                    key={item}
                    style={{ "--item-index": index }}
                    className="condition-row flex items-center justify-between border-b border-[#E0E5DE] pb-3"
                  >
                    <span className="text-xs text-[#687A72]">{item}</span>
                    <span className="condition-check flex items-center gap-1.5 text-[10px] font-bold text-[#39766B]">
                      <BadgeCheck size={14} /> Checked
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-[10px] leading-5 text-[#87928C]">
              Illustrative preview. Actual inspection results will come from each
              product's saved inspection record.
            </p>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section
        ref={impactRef}
        id="impact"
        className={`overflow-hidden bg-white py-12 sm:py-20 ${
          showImpactAnimation ? "show-impact-animation" : ""
        }`}
      >
        <div className="mx-auto max-w-5xl px-5 text-center">
          <div className="impact-reveal mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E9EFEC] text-[#174B50]">
            <Leaf size={26} />
          </div>

          <p className="impact-reveal impact-delay-1 mt-5 text-[10px] font-bold tracking-[0.22em] text-[#9A7837]">
            KEEP GOOD THINGS IN USE
          </p>

          <h2 className="impact-reveal impact-delay-2 mt-2 font-heading text-4xl font-semibold text-[#092F33] sm:text-5xl">
            A second life makes sense.
          </h2>

          <p className="impact-reveal impact-delay-3 mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#71807A]">
            Choosing pre-owned can help extend a product's useful life. Every
            thoughtful purchase is a small step towards using what we already have
            more wisely.
          </p>

          <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
            {[
              ["01", "Choose better", "Find useful products at a price that works for you."],
              ["02", "Know the condition", "Use clear inspection information to buy confidently."],
              ["03", "Keep it going", "Give a good product another chapter of use."],
            ].map(([number, title, description], index) => (
              <div
                key={number}
                style={{ "--card-index": index }}
                className="impact-card rounded-2xl border border-[#E7EAE4] bg-[#F7F7F3] p-5 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#092F33]/10 hover:border-[#D7AE59]/60"
              >
                <p className="font-heading text-3xl font-semibold text-[#C29B4C]">
                  {number}
                </p>

                <h3 className="mt-3 text-xs font-bold text-[#173B3D]">
                  {title}
                </h3>

                <p className="mt-2 text-xs leading-6 text-[#78857F]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sell with RELOOP */}
      <section id="sell" className="bg-[#F3F2EC] px-5 py-16 sm:py-20">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#092F33] px-6 py-12 text-white shadow-2xl shadow-[#092F33]/15 sm:px-10 lg:px-14 lg:py-14">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-[#D7AE59]/20 motion-safe:animate-pulse" />

          <div className="pointer-events-none absolute right-24 top-8 h-5 w-5 rounded-full bg-[#D7AE59]/70 motion-safe:animate-bounce" />

          <div className="pointer-events-none absolute bottom-8 right-1/3 h-3 w-3 rounded-full bg-[#A9C1BC]/70 motion-safe:animate-pulse" />

          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-[#174B50]/80 blur-2xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#D7AE59]/40 bg-[#D7AE59]/10 px-4 py-2 text-[10px] font-bold tracking-[0.18em] text-[#E8C77F]">
                <Sparkles size={14} /> FOR PRODUCT OWNERS & RESELLERS
              </span>

              <h2 className="mt-5 max-w-2xl font-heading text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Have something good?
                <span className="mt-1 block italic text-[#D7AE59]">
                  Give it a new beginning.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[#C4D4CF] sm:text-base">
                Don't let useful products sit unused. Share them with RELOOP.
                We'll review, inspect and approve suitable items before they reach
                their next owner.
              </p>

              
<Link
  to="/sell-with-reloop"
  className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-[#D7AE59] via-[#F3D99F] to-[#D7AE59] bg-[length:200%_100%] px-5 py-2.5 text-[12px] font-extrabold tracking-wide text-[#092F33] shadow-[0_0_15px_rgba(215,174,89,0.3)] animate-[goldPulse_2s_ease-in-out_infinite] transition-transform duration-300 hover:scale-110"
>
  <span className="relative z-10">Sell with RELOOP</span>
  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[goldShine_2.5s_ease-in-out_infinite]" />
</Link>


              <p className="mt-3 text-[10px] text-white/50">
                Every submission is reviewed by the RELOOP team before listing.
              </p>
            </div>

            <div className="relative grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["01", "Share your product", "Tell us what you'd like to pass on."],
                ["02", "We inspect it", "Our team checks its condition and details."],
                ["03", "We list it", "Approved products get a Condition Passport."],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="group rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#D7AE59]/50 hover:bg-white/[0.11]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D7AE59] font-heading text-lg font-bold text-[#092F33]">
                      {number}
                    </span>

                    <div>
                      <h3 className="text-sm font-bold text-white">{title}</h3>
                      <p className="mt-1 text-[10px] leading-5 text-[#C4D4CF]">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
