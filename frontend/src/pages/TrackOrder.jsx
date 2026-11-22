
import { useState } from "react";
import axios from "axios";
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_URL = "http://127.0.0.1:8000/api/orders";

const trackingSteps = [
  { key: "confirmed", label: "Order Confirmed", icon: CheckCircle2 },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

const statusOrder = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
};

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/track/`, {
        order_number: orderNumber.trim(),
        email: email.trim(),
      });

      setOrder(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to find your order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentStep = statusOrder[order?.order_status] ?? -1;
  const isCancelled = order?.order_status === "cancelled";

  return (
    <div className="min-h-screen bg-[#F3F2EC] text-[#092F33]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#84948C] transition hover:text-[#092F33]"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A7833D]">
            RELOOP CARE
          </span>

          <h1 className="mt-3 font-heading text-4xl md:text-5xl">
            Track Your Order
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#84948C]">
            Every second life deserves a little attention.
            Find out where your order is on its journey.
          </p>
        </div>

        <div className="mx-auto max-w-2xl rounded-2xl border border-[#E4E5DC] bg-white p-6 shadow-sm md:p-9">
          <form onSubmit={handleTrackOrder} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Order Number
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Example: RL8A92B31"
                required
                className="w-full rounded-lg border border-[#E4E5DC] px-4 py-3 text-sm outline-none transition focus:border-[#A7833D]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your checkout email"
                required
                className="w-full rounded-lg border border-[#E4E5DC] px-4 py-3 text-sm outline-none transition focus:border-[#A7833D]"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#092F33] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#174B50] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search size={17} />
              {loading ? "Searching..." : "Track Order"}
            </button>
          </form>
        </div>

        {order && (
          <div className="mx-auto mt-10 max-w-4xl">
            <div className="rounded-2xl border border-[#E4E5DC] bg-white p-6 md:p-9">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4E5DC] pb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#84948C]">
                    Order Number
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">
                    {order.order_number}
                  </h2>
                </div>

                <span className="rounded-full bg-[#DDEBE3] px-4 py-2 text-xs font-semibold capitalize text-[#3D8171]">
                  {order.order_status}
                </span>
              </div>

              {isCancelled ? (
                <div className="my-8 rounded-xl bg-red-50 p-5 text-sm text-red-700">
                  This order has been cancelled. Please contact RELOOP support
                  if you need assistance.
                </div>
              ) : (
                <div className="py-9">
                  <h3 className="mb-8 font-heading text-2xl">
                    Order Progress
                  </h3>

                  <div className="space-y-7">
                    {trackingSteps.map((step, index) => {
                      const completed = currentStep >= index + 1;
                      const Icon = step.icon;

                      return (
                        <div key={step.key} className="flex items-center gap-4">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                              completed
                                ? "bg-[#DDEBE3] text-[#3D8171]"
                                : "bg-[#F3F2EC] text-[#84948C]"
                            }`}
                          >
                            <Icon size={20} />
                          </div>

                          <div>
                            <p
                              className={`text-sm font-semibold ${
                                completed
                                  ? "text-[#092F33]"
                                  : "text-[#84948C]"
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="mt-1 text-xs text-[#84948C]">
                              {completed
                                ? "Completed"
                                : "Awaiting update"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-[#E4E5DC] pt-7">
                <h3 className="mb-5 font-heading text-2xl">
                  Order Items
                </h3>

                <div className="space-y-5">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4"
                    >
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="h-20 w-20 rounded-lg bg-[#F3F2EC] object-cover"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">
                          {item.product_name}
                        </p>
                        <p className="mt-1 text-xs text-[#84948C]">
                          {item.condition} · Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="text-sm font-semibold">
                        ₹{Number(item.item_total).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-7 space-y-3 border-t border-[#E4E5DC] pt-5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#84948C]">Subtotal</span>
                    <span>₹{Number(order.subtotal).toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#84948C]">Delivery</span>
                    <span>
                      ₹{Number(order.delivery_charge).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {Number(order.discount_amount || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#84948C]">
                        Coupon discount{order.coupon_code ? ` (${order.coupon_code})` : ""}
                      </span>
                      <span className="text-[#286B56]">
                        -₹{Number(order.discount_amount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-[#E4E5DC] pt-4 text-base font-bold">
                    <span>Total</span>
                    <span>
                      ₹{Number(order.total_amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-5 text-xs text-[#84948C]">
                  <span>
                    Payment: {order.payment_method.toUpperCase()}
                  </span>
                  <span>
                    Payment status: {order.payment_status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-[#84948C]">
          <ShieldCheck size={16} />
          Your order details are protected.
        </div>
      </main>

      <Footer />
    </div>
  );
}
