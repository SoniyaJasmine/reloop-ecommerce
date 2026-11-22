
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  PackageCheck,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API, useAuth } from "../context/AuthContext";

const initialForm = {
  seller_name: "",
  email: "",
  phone: "",
  product_name: "",
  category: "",
  description: "",
  condition: "",
  expected_price: "",
};

function SellWithReloop() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    ...initialForm,
    seller_name: user?.first_name || "",
    email: user?.email || "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview);

    setImage(null);
    setPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!image) {
        throw new Error("Please upload a product image.");
      }

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      formData.append("image", image);

      const response = await API.post(
        "submissions/",
        formData
      );

      setSuccess(true);
      setForm(initialForm);
      removeImage();

    } catch (err) {
      const data = err.response?.data;

      const message =
        typeof data === "object" && data !== null
          ? Object.entries(data)
              .map(([key, value]) =>
                `${key}: ${
                  Array.isArray(value) ? value.join(", ") : value
                }`
              )
              .join(" | ")
          : err.message || "Something went wrong.";

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F3F2EC]">

        <section className="bg-[#092F33] px-5 py-20 text-white md:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#E8C77F]">
              Give your products a second life
            </p>

            <h1 className="max-w-3xl font-heading text-5xl leading-tight md:text-7xl">
              Your pre-loved products deserve a new home.
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/70 md:text-base">
              Submit your pre-owned products to RELOOP.
              Our team will inspect them and help give them
              a second life.
            </p>
          </div>
        </section>

        <section className="px-5 py-16 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A7833D]">
                Sell with RELOOP
              </p>

              <h2 className="mt-4 font-heading text-4xl text-[#092F33] md:text-5xl">
                Start with a simple submission.
              </h2>

              <p className="mt-5 text-sm leading-7 text-[#66736E]">
                Tell us about your product and upload a clear
                photograph. Our team will review your submission
                before deciding whether it can be listed.
              </p>

              <div className="mt-10 space-y-7">

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DDEBE3] text-[#092F33]">
                    <Upload size={21} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#092F33]">
                      Submit your product
                    </h3>
                    <p className="mt-1 text-sm text-[#66736E]">
                      Share product details and photographs.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DDEBE3] text-[#092F33]">
                    <ShieldCheck size={21} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#092F33]">
                      Inspection and review
                    </h3>
                    <p className="mt-1 text-sm text-[#66736E]">
                      Our team checks the product's condition.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DDEBE3] text-[#092F33]">
                    <PackageCheck size={21} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#092F33]">
                      Get it listed
                    </h3>
                    <p className="mt-1 text-sm text-[#66736E]">
                      Approved products are added to our store.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <div className="rounded-2xl border border-[#E4E5DC] bg-white p-6 shadow-sm md:p-9">

              {success ? (
                <div className="py-12 text-center">
                  <CheckCircle2
                    size={58}
                    className="mx-auto text-[#3D8171]"
                  />

                  <h2 className="mt-6 font-heading text-3xl text-[#092F33]">
                    Submission received!
                  </h2>

                  <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#66736E]">
                    Thank you for choosing RELOOP. Your product
                    is now awaiting inspection by our team.
                  </p>

                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-8 rounded-full bg-[#092F33] px-8 py-3 text-sm font-semibold text-white"
                  >
                    Submit another product
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-heading text-3xl text-[#092F33]">
                    Product details
                  </h2>

                  <p className="mt-2 text-sm text-[#84948C]">
                    All fields are required unless marked optional.
                  </p>

                  <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-6"
                  >

                    <div>
                      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#A7833D]">
                        Your information
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2">

                        <input
                          name="seller_name"
                          value={form.seller_name}
                          onChange={handleChange}
                          placeholder="Your full name"
                          required
                          className="form-input"
                        />

                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="Email address"
                          required
                          className="form-input"
                        />

                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="Phone number"
                          required
                          className="form-input sm:col-span-2"
                        />

                      </div>
                    </div>

                    <div className="border-t border-[#E4E5DC] pt-6">
                      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#A7833D]">
                        Product information
                      </h3>

                      <div className="space-y-4">

                        <input
                          name="product_name"
                          value={form.product_name}
                          onChange={handleChange}
                          placeholder="Product name"
                          required
                          className="form-input"
                        />

                        <select
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          required
                          className="form-input"
                        >
                          <option value="">Select category</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Furniture">Furniture</option>
                          <option value="Fashion">Fashion</option>
                          <option value="Books">Books</option>
                          <option value="Home & Living">Home & Living</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Others">Others</option>
                        </select>

                        <select
                          name="condition"
                          value={form.condition}
                          onChange={handleChange}
                          required
                          className="form-input"
                        >
                          <option value="">Select condition</option>
                          <option value="Like New">Like New</option>
                          <option value="Excellent">Excellent</option>
                          <option value="Very Good">Very Good</option>
                          <option value="Good">Good</option>
                        </select>

                        <textarea
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          placeholder="Describe your product, its age, usage and any defects..."
                          rows={4}
                          required
                          className="form-input resize-none"
                        />

                        <input
                          type="number"
                          name="expected_price"
                          value={form.expected_price}
                          onChange={handleChange}
                          placeholder="Your expected price (₹)"
                          min="1"
                          step="0.01"
                          required
                          className="form-input"
                        />

                      </div>
                    </div>

                    <div className="border-t border-[#E4E5DC] pt-6">
                      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#A7833D]">
                        Product photograph
                      </h3>

                      {preview ? (
                        <div className="relative overflow-hidden rounded-xl border border-[#E4E5DC]">
                          <img
                            src={preview}
                            alt="Product preview"
                            className="h-64 w-full object-contain bg-[#F3F2EC]"
                          />

                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute right-3 top-3 rounded-full bg-[#092F33] p-2 text-white"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C8D2CC] bg-[#F8F8F4] px-5 py-12 text-center transition hover:border-[#A7833D]">
                          <ImagePlus
                            size={35}
                            className="text-[#A7833D]"
                          />

                          <span className="mt-4 text-sm font-semibold text-[#092F33]">
                            Choose a product photo
                          </span>

                          <span className="mt-2 text-xs text-[#84948C]">
                            Phone gallery or computer · JPG, PNG, WEBP · Max 5 MB
                          </span>

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImage}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {error && (
                      <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-3 rounded-full bg-[#092F33] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#174B50] disabled:opacity-60"
                    >
                      {loading ? "Submitting..." : "Submit your product"}
                      {!loading && <ArrowRight size={18} />}
                    </button>

                    <p className="text-center text-xs leading-6 text-[#84948C]">
                      Submitting a product does not guarantee acceptance.
                      RELOOP will inspect it before listing.
                    </p>

                  </form>
                </>
              )}

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}

export default SellWithReloop;
