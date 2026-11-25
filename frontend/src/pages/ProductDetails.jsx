
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { API, useAuth } from "../context/AuthContext";

import {
  Heart,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Truck,
  CheckCircle2,
  Sparkles,
  CalendarDays,
  Clock3,
  Tag,
  Wrench,
  Camera,
  FileText,
  Star,
  Pencil,
  Trash2,
  MessageSquare,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const [reviewsData, setReviewsData] = useState({
    average_rating: 0,
    total_reviews: 0,
    reviews: [],
    can_review: false,
    has_purchased: false,
    has_reviewed: false,
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Load products from Django
  useEffect(() => {
    const fetchProducts = async () => {
      setProductLoading(true);
      setProduct(null);
      setSelectedImage("");
      setAddedToCart(false);

      try {
        const response = await API.get("products/");

        const backendProducts = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];

        const mappedProducts = backendProducts.map((item) => ({
          ...item,
          id: item.id,
          price: Number(item.price),
          original: Number(item.original),
          stock: Number(item.stock ?? 0),
          note:
            item.note ||
            item.description ||
            "Carefully checked and ready for a new chapter.",
          gallery: item.gallery || [],
          specifications: item.specifications || [],
          features: item.features || [],
          inspection: item.inspection || [],
          usageDuration: item.usageDuration || "",
          purchaseYear: item.purchaseYear || "",
          sellingReason: item.sellingReason || "",
          warrantyStatus: item.warrantyStatus || "",
          warrantyExpiry: item.warrantyExpiry || "",
          reloopGuarantee: item.reloopGuarantee || "",
        }));

        setAllProducts(mappedProducts);

        const selectedProduct = mappedProducts.find(
          (item) => String(item.id) === String(id)
        );

        setProduct(selectedProduct || null);
      } catch (error) {
        console.error("Failed to load products:", error);
        setProduct(null);
      } finally {
        setProductLoading(false);
      }
    };

    fetchProducts();
  }, [id]);

  // Load signed-in user's wishlist
  useEffect(() => {
    if (authLoading || !user) {
      if (!authLoading && !user) {
        setWishlist([]);
      }
      return;
    }

    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("reloop-access");

        const response = await API.get("wishlist/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setWishlist(
          response.data.map((item) => item.frontend_id)
        );
      } catch (error) {
        console.error("Failed to load wishlist:", error);
      }
    };

    fetchWishlist();
  }, [user, authLoading]);

  const fetchReviews = async (currentProductId = id) => {
    try {
      setReviewsLoading(true);
      setReviewError("");
      const token = localStorage.getItem("reloop-access");
      const response = await API.get(`reviews/product/${currentProductId}/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = response.data || {};
      setReviewsData({
        average_rating: Number(data.average_rating || 0),
        total_reviews: Number(data.total_reviews || 0),
        reviews: Array.isArray(data.reviews) ? data.reviews : [],
        can_review: Boolean(data.can_review),
        has_purchased: Boolean(data.has_purchased),
        has_reviewed: Boolean(data.has_reviewed),
      });
    } catch (error) {
      console.error("Failed to load reviews:", error);
      setReviewError("Unable to load reviews right now.");
      setReviewsData({
        average_rating: 0,
        total_reviews: 0,
        reviews: [],
        can_review: false,
        has_purchased: false,
        has_reviewed: false,
      });
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchReviews(id);
  }, [id]);

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  // Loading screen
  if (productLoading) {
    return (
      <div className="min-h-screen bg-[#F3F2EC]">
        <Navbar
          search={search}
          setSearch={setSearch}
          wishlist={wishlist}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />

        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#E4E5DC] border-t-[#A7833D]" />
            <p className="mt-5 text-sm font-medium text-[#647A73]">
              Loading product details...
            </p>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-[#F3F2EC]">
        <Navbar
          search={search}
          setSearch={setSearch}
          wishlist={wishlist}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />

        <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
          <ShoppingBag size={45} className="text-[#A7833D]" />

          <h1 className="mt-5 font-heading text-3xl font-semibold text-[#092F33]">
            Product not found
          </h1>

          <p className="mt-3 text-sm text-[#84948C]">
            This product may no longer be available.
          </p>

          <Link
            to="/shop"
            className="mt-6 rounded-xl bg-[#092F33] px-6 py-3 text-xs font-bold text-[#E8C77F] transition hover:bg-[#174B50]"
          >
            Back to Shop
          </Link>
        </div>

        <Footer />
      </div>
    );
  }

  const savings = product.original - product.price;

  const discount =
    product.original > 0
      ? Math.round((savings / product.original) * 100)
      : 0;

  const isWishlisted = wishlist.includes(product.id);

  // Wishlist functionality
  const toggleWishlist = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (wishlistLoading) return;

    const isAlreadyWishlisted = wishlist.includes(product.id);
    const token = localStorage.getItem("reloop-access");

    try {
      setWishlistLoading(true);

      if (isAlreadyWishlisted) {
        await API.delete(`wishlist/${product.id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setWishlist((previous) =>
          previous.filter((item) => item !== product.id)
        );
      } else {
        await API.post(
          "wishlist/",
          { product_id: product.id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setWishlist((previous) => [...previous, product.id]);
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

  const ownReview =
    user && reviewsData.reviews.find((review) => review.is_owner);

  const getFallbackRating = (productId) => {
    const raw = String(productId ?? "0");
    let hash = 0;
    for (let i = 0; i < raw.length; i += 1) {
      hash = (hash * 31 + raw.charCodeAt(i)) % 1000;
    }
    const options = [4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9];
    return options[hash % options.length];
  };

  const fallbackRating = getFallbackRating(product?.id ?? id);
  const hasRealReviews = reviewsData.total_reviews > 0;
  const displayAverageRating = hasRealReviews
    ? reviewsData.average_rating
    : fallbackRating;
  const displayReviewCountLabel = hasRealReviews
    ? `${reviewsData.total_reviews} ${reviewsData.total_reviews === 1 ? "review" : "reviews"}`
    : "Quality rating";

  const renderStars = (value, size = 14) =>
    [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={size}
        className={star <= Math.round(value) ? "text-[#D7AE59]" : "text-[#D8D8CF]"}
        fill={star <= Math.round(value) ? "currentColor" : "none"}
      />
    ));

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    setReviewSaving(true);
    setReviewError("");
    setReviewMessage("");

    const token = localStorage.getItem("reloop-access");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const payload = {
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment,
    };

    try {
      if (editingReviewId) {
        await API.patch(`reviews/${editingReviewId}/`, payload, { headers });
        setReviewMessage("Your review has been updated.");
      } else {
        await API.post(`reviews/product/${product.id}/`, payload, { headers });
        setReviewMessage("Your review has been submitted.");
      }
      setReviewForm({ rating: 5, comment: "" });
      setEditingReviewId(null);
      await fetchReviews(product.id);
    } catch (error) {
      const data = error.response?.data;
      let message = "Unable to save your review. Please try again.";
      if (data?.error) {
        message = Array.isArray(data.error) ? data.error.join(" ") : data.error;
      } else if (data?.comment) {
        message = Array.isArray(data.comment) ? data.comment.join(" ") : data.comment;
      } else if (data?.rating) {
        message = Array.isArray(data.rating) ? data.rating.join(" ") : data.rating;
      } else if (data?.detail) {
        message = data.detail;
      }
      setReviewError(message);
    } finally {
      setReviewSaving(false);
    }
  };

  const startEditReview = (review) => {
    setEditingReviewId(review.id);
    setReviewForm({ rating: review.rating, comment: review.comment || "" });
    setReviewError("");
    setReviewMessage("");
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setReviewForm({ rating: 5, comment: "" });
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Delete your review?")) return;
    setReviewError("");
    setReviewMessage("");
    try {
      const token = localStorage.getItem("reloop-access");
      await API.delete(`reviews/${reviewId}/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setReviewMessage("Your review has been deleted.");
      if (editingReviewId === reviewId) cancelEditReview();
      await fetchReviews(product.id);
    } catch (error) {
      const data = error.response?.data;
      setReviewError(
        data?.error || data?.detail || "Unable to delete your review. Please try again."
      );
    }
  };

  // Related products from Django
  const relatedProducts = allProducts
    .filter(
      (item) =>
        item.category === product.category &&
        item.id !== product.id
    )
    .slice(0, 4);

  // Product gallery
  const galleryImages = [
    product.image,
    ...(product.gallery || []),
  ].filter(
    (image, index, images) =>
      image && images.indexOf(image) === index
  );

  const activeImage = selectedImage || galleryImages[0];

  const specifications = product.specifications || [];
  const features = product.features || [];
  const inspection =
    product.inspection && product.inspection.length > 0
      ? product.inspection
      : [
          `Overall condition reviewed as ${product.condition || "pre-owned"} and listed with clear product details.`,
          "Basic functionality and key components checked before adding to the RELOOP collection.",
          "Visible wear, included essentials, and listing information verified for transparency.",
          "Cleaned and prepared for resale; any notable observations are reflected in the product description.",
        ];

  const ownershipDetails = {
    usageDuration:
      product.usageDuration ||
      `Previously used ${String(product.category || "item").toLowerCase()}; exact usage duration not specified by the seller.`,
    purchaseYear:
      product.purchaseYear ||
      "Purchase year not specified by the seller.",
    sellingReason:
      product.sellingReason ||
      "Seller is passing it on after regular use or an upgrade; specific reason not provided.",
    warrantyStatus:
      product.warrantyStatus ||
      "Manufacturer warranty details not specified; please refer to the listing condition and inspection notes.",
    warrantyExpiry:
      product.warrantyExpiry ||
      "Warranty expiry not available or not applicable for this pre-owned listing.",
    reloopGuarantee:
      product.reloopGuarantee ||
      "RELOOP quality check completed for listing accuracy, condition visibility, and a smoother pre-owned buying experience.",
  };

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 border-b border-[#EAECE5] py-4 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3F2EC] text-[#A7833D]">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-medium text-[#84948C]">
          {label}
        </p>
        <p className="mt-1 text-xs font-semibold text-[#174B50]">
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F2EC] text-[#092F33]">
      <Navbar
        search={search}
        setSearch={setSearch}
        wishlist={wishlist}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-5 pt-7 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#84948C]">
          <Link to="/" className="transition hover:text-[#A7833D]">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="transition hover:text-[#A7833D]">
            Shop
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#174B50]">
            {product.name}
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        {/* Main Product Section */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Product Gallery */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-[#E4E5DC] bg-white p-4 sm:p-7">
              <div className="absolute left-7 top-7 z-10 rounded-full bg-[#092F33] px-4 py-2 text-[10px] font-bold tracking-wide text-[#E8C77F]">
                {discount}% OFF
              </div>

              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                aria-label={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                className={`absolute right-7 top-7 z-10 flex h-11 w-11 items-center justify-center rounded-full shadow-md transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isWishlisted
                    ? "bg-[#D7AE59] text-[#092F33]"
                    : "bg-[#F3F2EC] text-[#174B50] hover:bg-[#D7AE59]"
                }`}
              >
                <Heart
                  size={19}
                  fill={isWishlisted ? "currentColor" : "none"}
                />
              </button>

              <div className="flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-[#F3F2EC] sm:min-h-[480px]">
                {activeImage ? (
                  <div className="product-image-container h-full w-full">
                    <img
                      key={activeImage}
                      src={activeImage}
                      alt={product.name}
                      className="product-main-image h-full max-h-[500px] w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-[#84948C]">
                    <Camera size={40} />
                    <p className="text-xs">
                      Product image unavailable
                    </p>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {galleryImages.length > 1 && (
                <div className="mt-5">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[#84948C]">
                    Product views
                  </p>

                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {galleryImages.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        onClick={() => setSelectedImage(image)}
                        aria-label={`View product image ${index + 1}`}
                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition ${
                          activeImage === image
                            ? "border-[#D7AE59] shadow-md"
                            : "border-[#E4E5DC] hover:border-[#A7833D]"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} view ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[10px] font-semibold text-[#647A73]">
                  <ShieldCheck size={15} className="text-[#3D8171]" />
                  Quality checked product
                </span>

                <span className="text-[10px] font-semibold text-[#A7833D]">
                  RELOOP COLLECTION
                </span>
              </div>
            </div>

            {/* Reassurance */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#E4E5DC] bg-white p-3 text-center">
                <ShieldCheck className="mx-auto text-[#A7833D]" size={20} />
                <p className="mt-2 text-[9px] font-semibold text-[#174B50]">
                  Quality checked
                </p>
              </div>

              <div className="rounded-xl border border-[#E4E5DC] bg-white p-3 text-center">
                <RefreshCw className="mx-auto text-[#A7833D]" size={20} />
                <p className="mt-2 text-[9px] font-semibold text-[#174B50]">
                  Second life
                </p>
              </div>

              <div className="rounded-xl border border-[#E4E5DC] bg-white p-3 text-center">
                <Truck className="mx-auto text-[#A7833D]" size={20} />
                <p className="mt-2 text-[9px] font-semibold text-[#174B50]">
                  Delivery support
                </p>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#A7833D]">
              {product.category}
            </p>

            <h1 className="mt-2 font-heading text-xl font-bold leading-tight text-[#092F33] sm:text-4xl lg:text-4xl">
              {product.name}
            </h1>

            <p className="mt-2 text-sm leading-7 text-[#84948C]">
              {product.note}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">{renderStars(displayAverageRating, 16)}</div>
              <p className="text-sm font-semibold text-[#092F33]">
                {displayAverageRating.toFixed(1)} / 5
              </p>
              <p className="text-sm text-[#71817B]">
                {hasRealReviews
                  ? `(${reviewsData.total_reviews} ${reviewsData.total_reviews === 1 ? "review" : "reviews"})`
                  : "(RELOOP quality rating)"}
              </p>
            </div>

            {/* Price */}
            <div className="mt-8 rounded-2xl border border-[#E4E5DC] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-3xl font-bold text-[#092F33] sm:text-4xl">
                  {money(product.price)}
                </span>

                <span className="pb-1 text-sm text-[#9AA69E] line-through">
                  {money(product.original)}
                </span>

                <span className="mb-1 rounded-md bg-[#E7F0EA] px-2.5 py-1 text-[10px] font-bold text-[#286B56]">
                  Save {discount}%
                </span>
              </div>

              <p className="mt-2 text-xs font-medium text-[#3D8171]">
                You save {money(savings)} with RELOOP
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                    product.stock > 5
                      ? "bg-[#E7F0EA] text-[#286B56]"
                      : product.stock > 0
                      ? "bg-[#FFF4D8] text-[#8A6517]"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {product.stock > 5
                    ? `In stock (${product.stock} available)`
                    : product.stock > 0
                    ? `Only ${product.stock} left in stock`
                    : "Out of stock"}
                </span>
                {product.stock > 0 && (
                  <span className="text-[11px] text-[#71817B]">
                    Availability updated from current inventory
                  </span>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    addToCart(product);
                    setAddedToCart(true);
                  }}
                  disabled={product.stock <= 0}
                  className={`flex items-center justify-center gap-2 rounded-xl px-4 py-4 text-xs font-bold transition disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 ${
                    addedToCart
                      ? "bg-[#3D8171] text-white"
                      : "bg-[#092F33] text-[#E8C77F] hover:bg-[#174B50]"
                  }`}
                >
                  {product.stock <= 0 ? (
                    "Out of stock"
                  ) : addedToCart ? (
                    <>
                      <CheckCircle2 size={16} />
                      Added to cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      Add to cart
                    </>
                  )}
                </button>

                <button
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#174B50] px-4 py-4 text-xs font-bold text-[#174B50] transition hover:bg-[#F3F2EC] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Heart
                    size={16}
                    fill={isWishlisted ? "currentColor" : "none"}
                  />
                  {isWishlisted ? "Wishlisted" : "Wishlist"}
                </button>
              </div>
            </div>

            {/* Owner and Warranty Summary */}
            <div className="mt-6 rounded-2xl border border-[#E4E5DC] bg-white p-5">
              <h3 className="mb-2 text-md font-bold text-[#092F33]">
                Previous ownership & warranty
              </h3>

              <InfoItem
                icon={Clock3}
                label="Previous owner usage"
                value={ownershipDetails.usageDuration}
              />

              <InfoItem
                icon={CalendarDays}
                label="Purchase year"
                value={ownershipDetails.purchaseYear}
              />

              <InfoItem
                icon={Tag}
                label="Reason for selling"
                value={ownershipDetails.sellingReason}
              />

              <InfoItem
                icon={ShieldCheck}
                label="Manufacturer warranty"
                value={ownershipDetails.warrantyStatus}
              />

              <InfoItem
                icon={CalendarDays}
                label="Warranty expiry"
                value={ownershipDetails.warrantyExpiry}
              />

              <InfoItem
                icon={Sparkles}
                label="RELOOP guarantee"
                value={ownershipDetails.reloopGuarantee}
              />
            </div>
          </div>
        </div>

        {/* Condition Passport */}
        <section className="mt-20 overflow-hidden rounded-3xl bg-[#092F33] text-white">
          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:p-14">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D7AE59]/15 text-[#E8C77F]">
                <ShieldCheck size={25} />
              </div>

              <p className="mt-6 text-[10px] font-bold tracking-[0.25em] text-[#D7AE59]">
                THE RELOOP DIFFERENCE
              </p>

              <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight sm:text-4xl">
                Meet the
                <span className="italic text-[#E8C77F]">
                  {" "}Condition Passport.
                </span>
              </h2>

              <p className="mt-4 max-w-md text-sm leading-7 text-[#B9C9C3]">
                Every product at RELOOP is reviewed before it
                becomes part of our collection. Explore the
                inspection details recorded for this product.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                <CheckCircle2 className="text-[#E8C77F]" size={22} />
                <h3 className="mt-4 text-sm font-bold">
                  Quality Inspection
                </h3>
                <p className="mt-2 text-xs leading-6 text-[#B9C9C3]">
                  Product checks help identify its working
                  condition and visible wear.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                <Sparkles className="text-[#E8C77F]" size={22} />
                <h3 className="mt-4 text-sm font-bold">
                  Condition Grading
                </h3>
                <p className="mt-2 text-xs leading-6 text-[#B9C9C3]">
                  Each listing displays its assigned condition
                  grade for clarity.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 sm:col-span-2">
                <ShieldCheck className="text-[#E8C77F]" size={22} />
                <h3 className="mt-4 text-sm font-bold">
                  Transparent Product Information
                </h3>
                <p className="mt-2 text-xs leading-6 text-[#B9C9C3]">
                  Review the available inspection records and
                  product history before making your decision.
                </p>
              </div>
            </div>
          </div>
        </section>
          {/* Inspection Report */}
<div className="border-t border-white/10 px-7 py-8 sm:px-10 lg:px-14">
  <h3 className="flex items-center gap-2 text-lg font-semibold">
    <Wrench size={19} className="text-[#E8C77F]" />
    Inspection report
  </h3>

  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {inspection.map((item, index) => (
      <div
        key={index}
        className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-4"
      >
        <CheckCircle2
          size={17}
          className="mt-0.5 shrink-0 text-[#E8C77F]"
        />
        <p className="text-xs leading-6 text-[#D5E0DA]">
          {item}
        </p>
      </div>
    ))}
  </div>
</div>

        {/* Detailed Description */}
        <section className="mt-20 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#A7833D]">
              PRODUCT INFORMATION
            </p>

            <h2 className="mt-3 font-heading text-3xl font-semibold">
              A little more about this product.
            </h2>

            <p className="mt-5 whitespace-pre-line text-sm leading-8 text-[#647A73]">
              {product.description ||
                `${product.note} This pre-owned ${String(
                  product.category || "product"
                ).toLowerCase()} product is part of the RELOOP collection. Detailed product information will be updated as it becomes available.`}
            </p>

            {/* Features */}
            {features.length > 0 && (
              <div className="mt-9">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#092F33]">
                  <Sparkles size={18} className="text-[#A7833D]" />
                  Key features
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-xl border border-[#E4E5DC] bg-white p-4"
                    >
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-[#3D8171]"
                      />
                      <span className="text-xs leading-5 text-[#647A73]">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Specifications */}
          <div className="h-fit rounded-2xl border border-[#E4E5DC] bg-white p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#092F33]">
              <FileText size={18} className="text-[#A7833D]" />
              Technical specifications
            </h3>

            <div className="mt-5 divide-y divide-[#EAECE5]">
              <div className="flex justify-between gap-4 py-4 text-xs">
                <span className="text-[#84948C]">Product name</span>
                <span className="text-right font-semibold">
                  {product.name}
                </span>
              </div>

              <div className="flex justify-between gap-4 py-4 text-xs">
                <span className="text-[#84948C]">Category</span>
                <span className="font-semibold">
                  {product.category}
                </span>
              </div>

              <div className="flex justify-between gap-4 py-4 text-xs">
                <span className="text-[#84948C]">Condition</span>
                <span className="font-semibold">
                  {product.condition}
                </span>
              </div>

              <div className="flex justify-between gap-4 py-4 text-xs">
                <span className="text-[#84948C]">Product type</span>
                <span className="font-semibold">Pre-owned</span>
              </div>

              {specifications.map((spec, index) => (
                <div
                  key={index}
                  className="flex justify-between gap-4 py-4 text-xs"
                >
                  <span className="text-[#84948C]">
                    {spec.label}
                  </span>
                  <span className="max-w-[60%] text-right font-semibold">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Customer Reviews */}
        <section className="mt-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.22em] text-[#A7833D]">
                CUSTOMER REVIEWS
              </p>
              <h2 className="mt-2 font-heading text-3xl font-semibold">
                Ratings and reviews
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">{renderStars(displayAverageRating, 16)}</div>
                <p className="text-sm font-semibold text-[#092F33]">
                  {displayAverageRating.toFixed(1)} average
                </p>
                <p className="text-sm text-[#71817B]">
                  {hasRealReviews
                    ? `${reviewsData.total_reviews} ${reviewsData.total_reviews === 1 ? "review" : "reviews"}`
                    : "RELOOP quality rating (no customer reviews yet)"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-[#E4E5DC] bg-white p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-[#092F33]">
                <MessageSquare size={18} className="text-[#A7833D]" />
                Customer feedback
              </h3>

              {reviewMessage && (
                <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  {reviewMessage}
                </div>
              )}
              {reviewError && (
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {reviewError}
                </div>
              )}

              {reviewsLoading ? (
                <p className="mt-5 text-sm text-[#71817B]">Loading reviews...</p>
              ) : reviewsData.reviews.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-[#D8D8CF] bg-[#FAFAF7] p-5 text-sm text-[#71817B]">
                  No reviews yet. Be the first to share your experience with this product.
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {reviewsData.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-[#EAECE5] bg-[#FCFCFA] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating, 14)}
                            </div>
                            <span className="text-xs font-semibold text-[#092F33]">
                              {review.rating}/5
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-semibold text-[#092F33]">
                            {review.user?.name || review.user?.username || "Customer"}
                          </p>
                          <p className="mt-1 text-[11px] text-[#84948C]">
                            {review.updated_at
                              ? new Date(review.updated_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : ""}
                          </p>
                        </div>

                        {review.is_owner && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEditReview(review)}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#D8D8CF] px-2.5 py-1.5 text-xs font-semibold text-[#092F33] hover:bg-white"
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteReview(review.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#647A73]">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-fit rounded-2xl border border-[#E4E5DC] bg-white p-6">
              <h3 className="text-lg font-semibold text-[#092F33]">
                {ownReview && !editingReviewId ? "Your review" : editingReviewId ? "Edit your review" : "Write a review"}
              </h3>
              <p className="mt-1 text-sm text-[#71817B]">
                Share your experience to help other customers make informed decisions.
              </p>

              {!user ? (
                <div className="mt-5 rounded-xl bg-[#FAFAF7] p-4 text-sm text-[#647A73]">
                  <p>Please sign in to submit a review.</p>
                  <Link
                    to="/login"
                    className="mt-3 inline-flex rounded-lg bg-[#092F33] px-4 py-2 text-xs font-semibold text-white hover:bg-[#174B50]"
                  >
                    Sign in
                  </Link>
                </div>
              ) : ownReview && !editingReviewId ? (
                <div className="mt-5 rounded-xl border border-[#E4E5DC] bg-[#FAFAF7] p-4">
                  <p className="text-sm font-semibold text-[#092F33]">You have already reviewed this product.</p>
                  <p className="mt-2 text-sm text-[#647A73]">
                    You can edit or delete your existing review from the list.
                  </p>
                  <button
                    type="button"
                    onClick={() => startEditReview(ownReview)}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#092F33] px-4 py-2 text-xs font-semibold text-white hover:bg-[#174B50]"
                  >
                    <Pencil size={14} /> Edit your review
                  </button>
                </div>
              ) : !reviewsData.has_purchased && !editingReviewId ? (
                <div className="mt-5 rounded-xl border border-[#E4E5DC] bg-[#FAFAF7] p-4">
                  <p className="text-sm font-semibold text-[#092F33]">Purchase required to review</p>
                  <p className="mt-2 text-sm text-[#647A73]">
                    Only customers who have successfully purchased this product can submit a review. You can still read reviews from other buyers.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#092F33]">Rating</label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setReviewForm((prev) => ({ ...prev, rating: value }))}
                          className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                            Number(reviewForm.rating) === value
                              ? "border-[#A7833D] bg-[#FBF8F0] text-[#092F33]"
                              : "border-[#E4E5DC] text-[#647A73] hover:border-[#A7833D]"
                          }`}
                        >
                          <Star
                            size={14}
                            className={Number(reviewForm.rating) >= value ? "text-[#D7AE59]" : "text-[#D8D8CF]"}
                            fill={Number(reviewForm.rating) >= value ? "currentColor" : "none"}
                          />
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#092F33]">Review</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                      }
                      required
                      rows={5}
                      placeholder="Share details about quality, condition, and your experience..."
                      className="w-full rounded-xl border border-[#E4E5DC] px-4 py-3 text-sm outline-none transition focus:border-[#A7833D]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={reviewSaving}
                      className="rounded-xl bg-[#092F33] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#174B50] disabled:opacity-60"
                    >
                      {reviewSaving
                        ? "Saving..."
                        : editingReviewId
                        ? "Update review"
                        : "Submit review"}
                    </button>
                    {editingReviewId && (
                      <button
                        type="button"
                        onClick={cancelEditReview}
                        className="rounded-xl border border-[#D8D8CF] px-5 py-2.5 text-sm font-semibold text-[#092F33] hover:bg-[#F3F2EC]"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-[#A7833D]">
                  YOU MAY ALSO LIKE
                </p>

                <h2 className="mt-2 font-heading text-3xl font-semibold">
                  More to discover.
                </h2>
              </div>

              <Link
                to="/shop"
                className="flex items-center gap-2 text-xs font-bold text-[#174B50] transition hover:text-[#A7833D]"
              >
                View all
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="group overflow-hidden rounded-2xl border border-[#E4E5DC] bg-white transition duration-500 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="m-3 overflow-hidden rounded-xl bg-[#F3F2EC]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-48 w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center text-[#84948C]">
                        <Camera size={30} />
                      </div>
                    )}
                  </div>

                  <div className="px-4 pb-5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#A7833D]">
                      {item.category}
                    </p>

                    <h3 className="mt-2 text-sm font-semibold text-[#092F33]">
                      {item.name}
                    </h3>

                    <p className="mt-2 text-sm font-bold text-[#174B50]">
                      {money(item.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back to Shop */}
        <div className="mt-16 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-xl border border-[#174B50] px-6 py-3 text-xs font-bold text-[#174B50] transition hover:bg-[#092F33] hover:text-white"
          >
            <ArrowLeft size={15} />
            Continue Shopping
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ProductDetails;
