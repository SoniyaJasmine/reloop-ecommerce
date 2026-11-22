
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { API, useAuth } from "../context/AuthContext";

const API_URL = `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"}/orders`;
// Load Razorpay checkout script
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

function Checkout() {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("reloop-access");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [user]);

  useEffect(() => {
    if (!user) {
      setSavedAddresses([]);
      setSelectedAddressId("");
      return;
    }

    const fetchAddresses = async () => {
      try {
        setAddressesLoading(true);
        const response = await API.get("accounts/addresses/", { headers: authHeaders });
        const list = Array.isArray(response.data) ? response.data : [];
        setSavedAddresses(list);

        const preferred = list.find((a) => a.is_default) || list[0];
        if (preferred) {
          setSelectedAddressId(String(preferred.id));
        }
      } catch (err) {
        console.error("Failed to load saved addresses:", err);
      } finally {
        setAddressesLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  useEffect(() => {
    if (user?.email && !form.email) {
      setForm((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    if (!selectedAddressId || savedAddresses.length === 0) return;
    const selected = savedAddresses.find((a) => String(a.id) === String(selectedAddressId));
    if (!selected) return;

    const mergedAddress = [selected.address_line_1, selected.address_line_2]
      .filter(Boolean)
      .join(", ");

    setForm((prev) => ({
      ...prev,
      fullName: selected.full_name || prev.fullName,
      phone: selected.phone_number || prev.phone,
      address: mergedAddress || prev.address,
      city: selected.city || prev.city,
      state: selected.state || prev.state,
      pincode: selected.postal_code || prev.pincode,
    }));
  }, [selectedAddressId, savedAddresses]);

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

  const productSavings = originalTotal - subtotal;
  const savings = productSavings;
  const discountAmount = appliedCoupon ? Number(appliedCoupon.discount_amount || 0) : 0;
  const delivery = 0;
  const total = Math.max(0, subtotal + delivery - discountAmount);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      setCouponMessage("");
      return;
    }

    try {
      setCouponApplying(true);
      setCouponError("");
      setCouponMessage("");

      const response = await API.post("coupons/validate/", {
        code,
        subtotal: subtotal.toFixed(2),
      });

      setAppliedCoupon(response.data);
      setCouponCode(response.data.code || code.toUpperCase());
      setCouponMessage(response.data.message || "Coupon applied successfully.");
    } catch (err) {
      setAppliedCoupon(null);
      setCouponMessage("");
      setCouponError(
        err.response?.data?.error ||
          err.response?.data?.code?.[0] ||
          "Unable to apply this coupon."
      );
    } finally {
      setCouponApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setCouponMessage("Coupon removed.");
  };

  // Create order and process payment
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0 || loading) return;

    setLoading(true);
    setError("");

    try {
      // Step 1: Create order in Django
      const accessToken = localStorage.getItem("reloop-access");

const response = await fetch(`${API_URL}/create/`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(user && accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {}),
  },
        body: JSON.stringify({
          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          payment_method: paymentMethod,
          coupon_code: appliedCoupon?.code || "",
          items: cartItems.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create your order.");
      }

      // Step 2: Cash on Delivery
      if (paymentMethod === "cod") {
        setOrderNumber(data.order_number);
        setOrderPlaced(true);
        clearCart();
        setLoading(false);
        return;
      }

      // Step 3: Load Razorpay
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay. Please try again.");
      }

      // Step 4: Open Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "RELOOP",
        description: "Give Products a Second Life",
        order_id: data.razorpay_order_id,

        handler: async (paymentResponse) => {
          try {
            // Step 5: Verify payment with Django
            const verifyResponse = await fetch(`${API_URL}/verify/`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                order_number: data.order_number,
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,
                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,
                razorpay_signature:
                  paymentResponse.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.error || "Payment verification failed."
              );
            }

            // Step 6: Show success only after verification
            setOrderNumber(verifyData.order_number);
            setOrderPlaced(true);
            clearCart();

          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },

        theme: {
          color: "#092F33",
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", (response) => {
        setError(
          response.error?.description ||
            "Payment failed. Please try again."
        );

        setLoading(false);
      });

      paymentObject.open();

    } catch (err) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  // Empty cart screen
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-[#F3F2EC] text-[#092F33]">
        <Navbar
          search={search}
          setSearch={setSearch}
          wishlist={wishlist}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />

        <main className="flex min-h-[65vh] flex-col items-center justify-center px-5 text-center">
          <ShoppingBag size={48} className="text-[#A7833D]" />

          <h1 className="mt-6 font-heading text-4xl font-semibold">
            Your bag is empty.
          </h1>

          <p className="mt-3 text-sm text-[#84948C]">
            Add something special before checking out.
          </p>

          <Link
            to="/shop"
            className="mt-7 rounded-xl bg-[#092F33] px-7 py-4 text-xs font-bold text-[#E8C77F]"
          >
            Explore products
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  // Order success screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#F3F2EC] text-[#092F33]">
        <Navbar
          search={search}
          setSearch={setSearch}
          wishlist={wishlist}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />

        <main className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-16 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#DDEBE3]">
            <CheckCircle2 size={48} className="text-[#3D8171]" />
          </div>

          <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.25em] text-[#A7833D]">
            THANK YOU FOR CHOOSING RELOOP
          </p>

          <h1 className="mt-3 font-heading text-4xl font-semibold sm:text-5xl">
            Order confirmed!
          </h1>

          <p className="mt-4 max-w-md text-sm leading-7 text-[#84948C]">
            Your order has been successfully placed.
            Thank you for giving products a second life.
          </p>

          <div className="mt-8 rounded-2xl border border-[#E4E5DC] bg-white px-10 py-6">
            <p className="text-xs text-[#84948C]">
              Your order number
            </p>

            <p className="mt-2 text-xl font-bold tracking-wider">
              {orderNumber}
            </p>

            <p className="mt-3 text-xs text-[#3D8171]">
              Payment:{" "}
              {paymentMethod === "cod"
                ? "Cash on Delivery"
                : "Razorpay"}
            </p>
          </div>

          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-[#092F33] px-7 py-4 text-xs font-bold text-[#E8C77F] transition hover:bg-[#174B50]"
          >
            Continue shopping
            <ArrowRight size={16} />
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  // Main checkout page
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

        {/* Page heading */}
        <div className="mb-10">
          <Link
            to="/cart"
            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#84948C] transition hover:text-[#A7833D]"
          >
            <ArrowLeft size={15} />
            Back to shopping bag
          </Link>

          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#A7833D]">
            ALMOST YOURS
          </p>

          <h1 className="mt-3 font-heading text-4xl font-bold sm:text-5xl">
            Checkout.
          </h1>

          <p className="mt-3 text-sm text-[#84948C]">
            A few details and your next favourite find is yours.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">

            {/* Checkout form */}
            <div className="space-y-6">

              {/* Contact details */}
              <section className="rounded-2xl border border-[#E4E5DC] bg-white p-6 sm:p-8">
                <div className="mb-7 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F2EC]">
                    <CreditCard size={19} className="text-[#A7833D]" />
                  </div>

                  <div>
                    <h2 className="font-heading text-2xl font-bold">
                      Contact information
                    </h2>

                    <p className="mt-1 text-xs text-[#84948C]">
                      Your details for order updates
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-[14px] font-semibold">
                      Full name
                    </label>

                    <input
                      required
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-[#E4E5DC] bg-[#FAFAF7] px-4 py-3.5 text-sm outline-none transition focus:border-[#A7833D]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[14px] font-semibold">
                      Email address
                    </label>

                    <input
                      required
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-[#E4E5DC] bg-[#FAFAF7] px-4 py-3.5 text-sm outline-none transition focus:border-[#A7833D]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[14px] font-semibold">
                      Phone number
                    </label>

                    <input
                      required
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      pattern="[0-9]{10}"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl border border-[#E4E5DC] bg-[#FAFAF7] px-4 py-3.5 text-sm outline-none transition focus:border-[#A7833D]"
                    />
                  </div>
                </div>
              </section>

              {/* Delivery address */}
              <section className="rounded-2xl border border-[#E4E5DC] bg-white p-6 sm:p-8">
                <div className="mb-7 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F2EC]">
                    <MapPin size={19} className="text-[#A7833D]" />
                  </div>

                  <div>
                    <h2 className="font-heading text-2xl font-bold">
                      Delivery address
                    </h2>

                    <p className="mt-1 text-xs text-[#84948C]">
                      Where should we deliver your order?
                    </p>
                  </div>
                </div>

                {user && (
                  <div className="mb-6 rounded-xl border border-[#E4E5DC] bg-[#FAFAF7] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#092F33]">
                          Saved addresses
                        </p>
                        <p className="mt-1 text-xs text-[#84948C]">
                          Select a saved address to fill your delivery details.
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="text-xs font-semibold text-[#A7833D] hover:underline"
                      >
                        Manage addresses
                      </Link>
                    </div>

                    {addressesLoading ? (
                      <p className="mt-3 text-xs text-[#84948C]">Loading saved addresses...</p>
                    ) : savedAddresses.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {savedAddresses.map((addr) => (
                          <label
                            key={addr.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                              String(selectedAddressId) === String(addr.id)
                                ? "border-[#A7833D] bg-[#FBF8F0]"
                                : "border-[#E4E5DC] bg-white"
                            }`}
                          >
                            <input
                              type="radio"
                              name="saved-address"
                              value={addr.id}
                              checked={String(selectedAddressId) === String(addr.id)}
                              onChange={(e) => setSelectedAddressId(e.target.value)}
                              className="mt-1 accent-[#A7833D]"
                            />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-[#092F33]">
                                  {addr.full_name}
                                </p>
                                {addr.is_default && (
                                  <span className="rounded-full bg-[#E7F0EA] px-2 py-0.5 text-[10px] font-bold uppercase text-[#286B56]">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-xs leading-5 text-[#647A73]">
                                {addr.address_line_1}
                                {addr.address_line_2 ? `, ${addr.address_line_2}` : ""}, {addr.city},{" "}
                                {addr.state} - {addr.postal_code}, {addr.country}
                              </p>
                              <p className="mt-1 text-xs text-[#84948C]">{addr.phone_number}</p>
                            </div>
                          </label>
                        ))}
                        <button
                          type="button"
                          onClick={() => setSelectedAddressId("")}
                          className="text-xs font-semibold text-[#174B50] hover:text-[#A7833D]"
                        >
                          Use a different address
                        </button>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-[#84948C]">
                        No saved addresses yet. You can add one from your profile or enter details below.
                      </p>
                    )}
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-[14px] font-semibold">
                      House / Street address
                    </label>

                    <textarea
                      required
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="House number, street, area..."
                      className="w-full resize-none rounded-xl border border-[#E4E5DC] bg-[#FAFAF7] px-4 py-3.5 text-sm outline-none transition focus:border-[#A7833D]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[14px] font-semibold">
                      City
                    </label>

                    <input
                      required
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full rounded-xl border border-[#E4E5DC] bg-[#FAFAF7] px-4 py-3.5 text-sm outline-none transition focus:border-[#A7833D]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[14px] font-semibold">
                      State
                    </label>

                    <input
                      required
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="w-full rounded-xl border border-[#E4E5DC] bg-[#FAFAF7] px-4 py-3.5 text-sm outline-none transition focus:border-[#A7833D]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[14px] font-semibold">
                      PIN code
                    </label>

                    <input
                      required
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="6-digit PIN code"
                      className="w-full rounded-xl border border-[#E4E5DC] bg-[#FAFAF7] px-4 py-3.5 text-sm outline-none transition focus:border-[#A7833D]"
                    />
                  </div>
                </div>
              </section>

              {/* Payment method */}
              <section className="rounded-2xl border border-[#E4E5DC] bg-white p-6 sm:p-8">
                <div className="mb-7 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F2EC]">
                    <ShieldCheck size={19} className="text-[#A7833D]" />
                  </div>

                  <div>
                    <h2 className="font-heading text-2xl font-bold">
                      Payment method
                    </h2>

                    <p className="mt-1 text-xs text-[#84948C]">
                      Choose how you want to pay
                    </p>
                  </div>
                </div>

                <div className="space-y-4">

                  {/* COD */}
                  <label
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border p-5 transition ${
                      paymentMethod === "cod"
                        ? "border-[#A7833D] bg-[#FBF8F0]"
                        : "border-[#E4E5DC]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                      className="accent-[#A7833D]"
                    />

                    <Truck size={22} className="text-[#A7833D]" />

                    <div>
                      <p className="text-[14px] font-bold">
                        Cash on Delivery
                      </p>

                      <p className="mt-1 text-xs text-[#84948C]">
                        Pay when your order arrives
                      </p>
                    </div>
                  </label>

                  {/* Razorpay */}
                  <label
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border p-5 transition ${
                      paymentMethod === "razorpay"
                        ? "border-[#A7833D] bg-[#FBF8F0]"
                        : "border-[#E4E5DC]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                      className="accent-[#A7833D]"
                    />

                    <CreditCard size={22} className="text-[#A7833D]" />

                    <div>
                      <p className="text-[14px] font-bold">
                        Razorpay (Test Mode)
                      </p>

                      <p className="mt-1 text-xs text-[#84948C]">
                        Secure online demo payment
                      </p>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            {/* Order summary */}
            <aside className="rounded-2xl border border-[#E4E5DC] bg-white p-6 lg:sticky lg:top-28">
              <h2 className="font-heading text-2xl font-bold">
                Your order
              </h2>

              <div className="mt-6 max-h-64 space-y-4 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 rounded-lg bg-[#F3F2EC] p-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />

                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#092F33] px-1 text-[10px] font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold">
                        {item.name}
                      </p>

                      <p className="mt-1 text-[10px] text-[#84948C]">
                        {item.condition}
                      </p>

                      <p className="mt-2 text-sm font-bold">
                        {money(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-4 border-t border-[#EAECE5] pt-5">
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
                    -{money(productSavings)}
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
                    Free
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#84948C]">
                      Coupon discount {appliedCoupon?.code ? `(${appliedCoupon.code})` : ""}
                    </span>

                    <span className="font-semibold text-[#3D8171]">
                      -{money(discountAmount)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 border-t border-[#EAECE5] pt-5">
                <label className="mb-2 block text-[13px] font-semibold text-[#092F33]">
                  Coupon code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="w-full rounded-xl border border-[#E4E5DC] bg-[#FAFAF7] px-3 py-2.5 text-sm outline-none transition focus:border-[#A7833D]"
                    disabled={loading || couponApplying}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      disabled={loading || couponApplying}
                      className="rounded-xl border border-[#D9DDD7] px-4 py-2.5 text-xs font-semibold text-[#174B50] transition hover:bg-[#F3F2EC] disabled:opacity-60"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={loading || couponApplying}
                      className="rounded-xl bg-[#092F33] px-4 py-2.5 text-xs font-semibold text-[#E8C77F] transition hover:bg-[#174B50] disabled:opacity-60"
                    >
                      {couponApplying ? "Applying..." : "Apply"}
                    </button>
                  )}
                </div>
                {couponError && <p className="mt-2 text-xs text-red-600">{couponError}</p>}
                {couponMessage && !couponError && (
                  <p className="mt-2 text-xs text-[#286B56]">{couponMessage}</p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#EAECE5] pt-5">
                <span className="text-[14px] font-bold">
                  Total
                </span>

                <span className="text-2xl font-bold">
                  {money(total)}
                </span>
              </div>

              {/* Error message */}
              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-600">
                  {error}
                </div>
              )}

              {/* Place order */}
              <button
                type="submit"
                disabled={loading}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#092F33] px-5 py-4 text-[14px] font-bold text-[#E8C77F] transition hover:bg-[#174B50] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Processing..."
                  : paymentMethod === "cod"
                    ? "Place order"
                    : "Proceed to Payment"}

                {!loading && <ArrowRight size={16} />}
              </button>

              <p className="mt-4 text-center text-[10px] leading-5 text-[#84948C]">
                By placing your order, you agree to our order terms.
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-[#EAECE5] pt-5">
                <ShieldCheck size={20} className="text-[#A7833D]" />

                <p className="text-[10px] leading-5 text-[#84948C]">
                  Your order details are handled securely.
                </p>
              </div>
            </aside>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default Checkout;
