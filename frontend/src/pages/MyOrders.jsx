
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  ArrowLeft,
  ShoppingBag,
  Truck,
  CalendarDays,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API, useAuth } from "../context/AuthContext";

function MyOrders() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("reloop-access");

        const response = await API.get("orders/my-orders/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(response.data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Unable to load your orders. Please try again.");
      } finally {
        setFetching(false);
      }
    };

    fetchOrders();
  }, [user, loading, navigate]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-amber-50 text-amber-700",
      confirmed: "bg-blue-50 text-blue-700",
      processing: "bg-purple-50 text-purple-700",
      shipped: "bg-indigo-50 text-indigo-700",
      delivered: "bg-green-50 text-green-700",
      cancelled: "bg-red-50 text-red-700",
    };

    return styles[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const getPaymentStyle = (status) => {
    return status === "paid"
      ? "bg-green-50 text-green-700"
      : status === "failed"
      ? "bg-red-50 text-red-700"
      : "bg-amber-50 text-amber-700";
  };

  const canCancelOrder = (orderStatus) =>
    ["pending", "confirmed", "processing"].includes((orderStatus || "").toLowerCase());

  const handleCancelOrder = async (orderNumber) => {
    const confirmed = window.confirm(
      `Cancel order ${orderNumber}? If this order has reserved stock, it will be restored.`
    );
    if (!confirmed) return;

    try {
      setCancellingOrder(orderNumber);
      setActionError("");
      setActionMessage("");

      const token = localStorage.getItem("reloop-access");
      const response = await API.post(
        `orders/cancel/${orderNumber}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedOrder = response.data?.order;
      if (updatedOrder) {
        setOrders((prev) =>
          prev.map((o) => (o.order_number === updatedOrder.order_number ? updatedOrder : o))
        );
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.order_number === orderNumber ? { ...o, order_status: "cancelled" } : o
          )
        );
      }

      setActionMessage(response.data?.message || "Order cancelled successfully.");
    } catch (err) {
      setActionError(
        err.response?.data?.error || "Unable to cancel this order. Please try again."
      );
    } finally {
      setCancellingOrder("");
    }
  };

  if (loading || fetching) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoaderCircle className="animate-spin text-[#174B50]" size={32} />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2EC]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-12 md:px-8">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#64716C] transition hover:text-[#092F33]"
        >
          <ArrowLeft size={16} />
          Continue Shopping
        </Link>

        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#A7833D]">
            Your RELOOP Account
          </p>

          <h1 className="font-heading text-4xl text-[#092F33] md:text-5xl">
            My Orders
          </h1>

          <p className="mt-3 text-sm text-[#64716C]">
            Welcome back, {user?.first_name || user?.username}. Here is your
            order history.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {actionError && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {actionError}
          </div>
        )}
        {actionMessage && !actionError && (
          <div className="mb-6 rounded-lg border border-[#CFE3D7] bg-[#EEF7F1] p-4 text-sm text-[#286B56]">
            {actionMessage}
          </div>
        )}

        {orders.length === 0 && !error ? (
          <div className="rounded-2xl border border-[#E4E5DC] bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E9E8DF] text-[#174B50]">
              <ShoppingBag size={28} />
            </div>

            <h2 className="font-heading text-2xl text-[#092F33]">
              No orders yet
            </h2>

            <p className="mt-3 text-sm text-[#64716C]">
              Your orders will appear here once you make your first purchase.
            </p>

            <Link
              to="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#092F33] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#174B50]"
            >
              Explore Products
              <ChevronRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.order_number}
                className="overflow-hidden rounded-2xl border border-[#E4E5DC] bg-white"
              >
                <div className="flex flex-col gap-5 border-b border-[#EAEAE4] p-5 md:flex-row md:items-center md:justify-between md:px-7">
                  <div className="grid grid-cols-2 gap-5 md:flex md:gap-12">
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#84948C]">
                        Order Number
                      </p>
                      <p className="text-sm font-semibold text-[#092F33]">
                        {order.order_number}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#84948C]">
                        Order Date
                      </p>
                      <p className="flex items-center gap-2 text-sm text-[#192F30]">
                        <CalendarDays size={14} />
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#84948C]">
                        Total Amount
                      </p>
                      <p className="text-sm font-semibold text-[#092F33]">
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </p>
                      {Number(order.discount_amount || 0) > 0 && (
                        <p className="mt-1 text-[11px] text-[#286B56]">
                          Coupon {order.coupon_code ? `${order.coupon_code} ` : ""}saved ₹{Number(order.discount_amount).toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${getStatusStyle(
                        order.order_status
                      )}`}
                    >
                      {order.order_status}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${getPaymentStyle(
                        order.payment_status
                      )}`}
                    >
                      Payment: {order.payment_status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-5 md:px-7 md:py-6">
                  {order.items?.map((item, index) => (
                    <div
                      key={`${order.order_number}-${item.product_id}-${index}`}
                      className="flex items-center gap-4"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F3F2EC]">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[#84948C]">
                            <Package size={25} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-[#092F33]">
                          {item.product_name}
                        </h3>

                        {item.condition && (
                          <p className="mt-1 text-xs text-[#84948C]">
                            Condition: {item.condition}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-[#64716C]">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-semibold text-[#092F33]">
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-[#EAEAE4] bg-[#FAFAF7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-7">
                  <div className="text-xs text-[#64716C]">
                    Payment method:{" "}
                    <span className="font-semibold uppercase text-[#092F33]">
                      {order.payment_method}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {canCancelOrder(order.order_status) && (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order.order_number)}
                        disabled={cancellingOrder === order.order_number}
                        className="inline-flex items-center justify-center rounded-full border border-red-200 px-5 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {cancellingOrder === order.order_number ? "Cancelling..." : "Cancel order"}
                      </button>
                    )}
                    <Link
                      to="/track-order"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#174B50] px-5 py-2.5 text-xs font-semibold text-[#174B50] transition hover:bg-[#092F33] hover:text-white"
                    >
                      <Truck size={15} />
                      Track Order
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default MyOrders;
