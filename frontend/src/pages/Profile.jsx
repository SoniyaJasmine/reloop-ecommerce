import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  Mail,
  Package,
  Heart,
  ArrowLeft,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
} from "lucide-react";
import { API, useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const emptyAddressForm = {
  full_name: "",
  phone_number: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  is_default: false,
};

function Profile() {
  const { user } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [addressMessage, setAddressMessage] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem("reloop-access");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      setAddressError("");
      const response = await API.get("accounts/addresses/", { headers: authHeaders });
      setAddresses(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setAddressError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Unable to load saved addresses."
      );
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const resetAddressForm = () => {
    setAddressForm(emptyAddressForm);
    setEditingAddressId(null);
    setShowAddressForm(false);
  };

  const startAddAddress = () => {
    setAddressError("");
    setAddressMessage("");
    setEditingAddressId(null);
    setAddressForm({
      ...emptyAddressForm,
      full_name:
        [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
        user?.username ||
        "",
    });
    setShowAddressForm(true);
  };

  const startEditAddress = (address) => {
    setAddressError("");
    setAddressMessage("");
    setEditingAddressId(address.id);
    setAddressForm({
      full_name: address.full_name || "",
      phone_number: address.phone_number || "",
      address_line_1: address.address_line_1 || "",
      address_line_2: address.address_line_2 || "",
      city: address.city || "",
      state: address.state || "",
      postal_code: address.postal_code || "",
      country: address.country || "India",
      is_default: Boolean(address.is_default),
    });
    setShowAddressForm(true);
  };

  const onAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const formatApiErrors = (data, fallback) => {
    if (!data) return fallback;
    if (typeof data === "string") {
      const trimmed = data.trim();
      if (
        trimmed.startsWith("<!DOCTYPE") ||
        trimmed.startsWith("<html") ||
        trimmed.startsWith("<")
      ) {
        return `${fallback} (Server returned an unexpected error page. If this is a new feature, run backend migrations and check the Django server logs.)`;
      }
      return data;
    }
    if (data.error) return Array.isArray(data.error) ? data.error.join(" ") : data.error;
    if (data.detail) return data.detail;
    const parts = [];
    Object.entries(data).forEach(([key, value]) => {
      const label = key.replaceAll("_", " ");
      if (Array.isArray(value)) parts.push(`${label}: ${value.join(" ")}`);
      else if (typeof value === "string") parts.push(`${label}: ${value}`);
    });
    return parts.length ? parts.join(" ") : fallback;
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressError("");
    setAddressMessage("");

    try {
      if (editingAddressId) {
        await API.put(`accounts/addresses/${editingAddressId}/`, addressForm, {
          headers: authHeaders,
        });
        setAddressMessage("Address updated successfully.");
      } else {
        await API.post("accounts/addresses/", addressForm, {
          headers: authHeaders,
        });
        setAddressMessage("Address added successfully.");
      }
      await fetchAddresses();
      resetAddressForm();
    } catch (err) {
      setAddressError(
        formatApiErrors(err.response?.data, "Unable to save address. Please try again.")
      );
    } finally {
      setAddressSaving(false);
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    setAddressError("");
    setAddressMessage("");
    try {
      await API.delete(`accounts/addresses/${id}/`, { headers: authHeaders });
      setAddressMessage("Address deleted successfully.");
      await fetchAddresses();
      if (editingAddressId === id) resetAddressForm();
    } catch (err) {
      setAddressError(
        formatApiErrors(err.response?.data, "Unable to delete address. Please try again.")
      );
    }
  };

  const markDefault = async (address) => {
    setAddressError("");
    setAddressMessage("");
    try {
      await API.patch(
        `accounts/addresses/${address.id}/`,
        { is_default: true },
        { headers: authHeaders }
      );
      setAddressMessage("Default address updated.");
      await fetchAddresses();
    } catch (err) {
      setAddressError(
        formatApiErrors(
          err.response?.data,
          "Unable to update default address. Please try again."
        )
      );
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-[65vh] bg-[#F3F2EC] px-5 py-14 text-[#092F33]">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-[#71817B] hover:text-[#A7833D]"
          >
            <ArrowLeft size={17} /> Back to shopping
          </Link>

          <p className="text-xs font-bold tracking-[0.2em] text-[#A7833D]">
            YOUR RELOOP ACCOUNT
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold">My Profile</h1>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
            <section className="h-fit rounded-2xl bg-[#092F33] p-8 text-white">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D7AE59] text-[#092F33]">
                <UserRound size={30} />
              </div>

              <h2 className="mt-5 font-heading text-2xl">
                {user?.first_name || user?.username}
              </h2>
              <p className="mt-1 text-sm text-[#B9C9C3]">RELOOP customer</p>

              <div className="mt-8 space-y-5 border-t border-white/10 pt-6">
                <div className="flex items-center gap-4">
                  <UserRound className="text-[#D7AE59]" />
                  <div>
                    <p className="text-xs text-[#AFC3BC]">Full name</p>
                    <p className="mt-1 text-sm font-semibold">
                      {[user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
                        user?.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Mail className="text-[#D7AE59]" />
                  <div>
                    <p className="text-xs text-[#AFC3BC]">Email address</p>
                    <p className="mt-1 text-sm font-semibold">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Link
                  to="/my-orders"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
                >
                  <Package size={17} /> My Orders
                </Link>

                <Link
                  to="/wishlist"
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#D7AE59]/60 px-4 py-3 text-sm font-semibold text-[#F6E7BF] hover:bg-white/5"
                >
                  <Heart size={17} /> My Wishlist
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-[#E4E5DC] bg-white p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#A7833D]">
                    <MapPin size={18} />
                    <span className="text-xs font-bold tracking-[0.2em]">ADDRESSES</span>
                  </div>
                  <h2 className="mt-2 font-heading text-2xl font-semibold">
                    Saved addresses
                  </h2>
                  <p className="mt-1 text-sm text-[#71817B]">
                    Manage delivery addresses and choose a default for faster checkout.
                  </p>
                </div>

                {!showAddressForm && (
                  <button
                    type="button"
                    onClick={startAddAddress}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#092F33] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#174B50]"
                  >
                    <Plus size={16} /> Add address
                  </button>
                )}
              </div>

              {addressMessage && (
                <div className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  {addressMessage}
                </div>
              )}
              {addressError && (
                <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {addressError}
                </div>
              )}

              {showAddressForm && (
                <form
                  onSubmit={saveAddress}
                  className="mt-6 rounded-2xl border border-[#E4E5DC] bg-[#FAFAF7] p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-[#092F33]">
                      {editingAddressId ? "Edit address" : "Add new address"}
                    </h3>
                    <button
                      type="button"
                      onClick={resetAddressForm}
                      className="rounded-lg p-1 text-[#71817B] hover:bg-white hover:text-[#092F33]"
                      aria-label="Close address form"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-semibold">Full name</label>
                      <input
                        name="full_name"
                        value={addressForm.full_name}
                        onChange={onAddressChange}
                        required
                        className="w-full rounded-xl border border-[#E4E5DC] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#A7833D]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold">Phone number</label>
                      <input
                        name="phone_number"
                        value={addressForm.phone_number}
                        onChange={onAddressChange}
                        required
                        placeholder="10-15 digits"
                        className="w-full rounded-xl border border-[#E4E5DC] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#A7833D]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold">Postal code</label>
                      <input
                        name="postal_code"
                        value={addressForm.postal_code}
                        onChange={onAddressChange}
                        required
                        className="w-full rounded-xl border border-[#E4E5DC] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#A7833D]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-semibold">Address line 1</label>
                      <input
                        name="address_line_1"
                        value={addressForm.address_line_1}
                        onChange={onAddressChange}
                        required
                        placeholder="House number, street, area"
                        className="w-full rounded-xl border border-[#E4E5DC] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#A7833D]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-semibold">
                        Address line 2 <span className="font-normal text-[#71817B]">(optional)</span>
                      </label>
                      <input
                        name="address_line_2"
                        value={addressForm.address_line_2}
                        onChange={onAddressChange}
                        placeholder="Apartment, landmark, etc."
                        className="w-full rounded-xl border border-[#E4E5DC] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#A7833D]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold">City</label>
                      <input
                        name="city"
                        value={addressForm.city}
                        onChange={onAddressChange}
                        required
                        className="w-full rounded-xl border border-[#E4E5DC] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#A7833D]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold">State</label>
                      <input
                        name="state"
                        value={addressForm.state}
                        onChange={onAddressChange}
                        required
                        className="w-full rounded-xl border border-[#E4E5DC] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#A7833D]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-semibold">Country</label>
                      <input
                        name="country"
                        value={addressForm.country}
                        onChange={onAddressChange}
                        required
                        className="w-full rounded-xl border border-[#E4E5DC] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#A7833D]"
                      />
                    </div>
                  </div>

                  <label className="mt-4 flex items-center gap-2 text-sm text-[#092F33]">
                    <input
                      type="checkbox"
                      name="is_default"
                      checked={addressForm.is_default}
                      onChange={onAddressChange}
                      className="h-4 w-4 accent-[#092F33]"
                    />
                    Set as default address
                  </label>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={addressSaving}
                      className="rounded-xl bg-[#092F33] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#174B50] disabled:opacity-60"
                    >
                      {addressSaving
                        ? "Saving..."
                        : editingAddressId
                        ? "Update address"
                        : "Save address"}
                    </button>
                    <button
                      type="button"
                      onClick={resetAddressForm}
                      className="rounded-xl border border-[#D8D8CF] px-5 py-2.5 text-sm font-semibold text-[#092F33] hover:bg-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 space-y-4">
                {addressLoading ? (
                  <div className="rounded-xl border border-[#E4E5DC] bg-[#FAFAF7] p-5 text-sm text-[#71817B]">
                    Loading saved addresses...
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#D8D8CF] bg-[#FAFAF7] p-6 text-sm text-[#71817B]">
                    You haven&apos;t saved any addresses yet. Add one to speed up checkout.
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`rounded-xl border p-5 ${
                        address.is_default
                          ? "border-[#A7833D] bg-[#FFFDF8]"
                          : "border-[#E4E5DC] bg-white"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-[#092F33]">
                              {address.full_name}
                            </p>
                            {address.is_default && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F0EA] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#286B56]">
                                <CheckCircle2 size={12} /> Default
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-[#71817B]">{address.phone_number}</p>
                          <p className="mt-2 text-sm leading-6 text-[#4E625C]">
                            {address.address_line_1}
                            {address.address_line_2 ? `, ${address.address_line_2}` : ""}
                            <br />
                            {address.city}, {address.state} - {address.postal_code}
                            <br />
                            {address.country}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {!address.is_default && (
                            <button
                              type="button"
                              onClick={() => markDefault(address)}
                              className="rounded-lg border border-[#D8D8CF] px-3 py-1.5 text-xs font-semibold text-[#092F33] hover:bg-[#F3F2EC]"
                            >
                              Set default
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => startEditAddress(address)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#D8D8CF] px-3 py-1.5 text-xs font-semibold text-[#092F33] hover:bg-[#F3F2EC]"
                          >
                            <Pencil size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAddress(address.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Profile;
