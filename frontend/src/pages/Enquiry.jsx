import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, UserRound, MessageSquare, Send } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API } from "../context/AuthContext";

function Enquiry() {
  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    mobile_number: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};
    const name = form.customer_name.trim();
    const email = form.email.trim();
    const mobile = form.mobile_number.replace(/\D/g, "");
    const subject = form.subject.trim();
    const message = form.message.trim();

    if (name.length < 2) nextErrors.customer_name = "Customer name must be at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (mobile.length < 10 || mobile.length > 15) nextErrors.mobile_number = "Enter a valid mobile number (10-15 digits).";
    if (subject.length < 3) nextErrors.subject = "Subject must be at least 3 characters.";
    if (message.length < 10) nextErrors.message = "Message must be at least 10 characters.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await API.post("enquiries/", {
        customer_name: form.customer_name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile_number: form.mobile_number.replace(/\D/g, ""),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setStatus({
        type: "success",
        text: response.data?.message || "Your enquiry has been submitted successfully.",
      });
      setForm({ customer_name: "", email: "", mobile_number: "", subject: "", message: "" });
      setErrors({});
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object" && !data.error && !data.detail) {
        const fieldErrors = {};
        for (const [key, value] of Object.entries(data)) {
          if (Array.isArray(value)) fieldErrors[key] = value.join(" ");
          else if (typeof value === "string") fieldErrors[key] = value;
        }
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          setStatus({ type: "error", text: "Please correct the highlighted fields." });
        } else {
          setStatus({ type: "error", text: "Unable to submit enquiry. Please try again." });
        }
      } else {
        setStatus({
          type: "error",
          text: data?.error || data?.detail || "Unable to submit enquiry. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2EC] text-[#092F33]">
      <Navbar />
      <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#526C66] hover:text-[#A7833D]">
          <ArrowLeft size={17} /> Back to RELOOP
        </Link>

        <div className="mx-auto mt-10 grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
          <div className="flex flex-col justify-between bg-[#092F33] p-9 text-white sm:p-12">
            <div>
              <img src="/reloop-logo.png" alt="RELOOP" className="h-14 w-auto" />
              <p className="mt-12 text-xs font-bold tracking-[0.25em] text-[#E8C77F]">GET IN TOUCH</p>
              <h1 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">
                We&apos;re here to <span className="italic text-[#E8C77F]">help.</span>
              </h1>
              <p className="mt-5 text-sm leading-7 text-[#B9C9C3]">
                Have a question about a product, order, or selling with RELOOP? Send us an enquiry and our team will respond as soon as possible.
              </p>
            </div>
            <div className="mt-12 space-y-4 text-sm text-[#B9C9C3]">
              <div className="flex items-center gap-3"><Mail size={16} className="text-[#E8C77F]" /> reloopproducts@gmail.com</div>
              <div className="flex items-center gap-3"><Phone size={16} className="text-[#E8C77F]" /> +91 12345 67890</div>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            <p className="text-xs font-bold tracking-[0.2em] text-[#A7833D]">ENQUIRY FORM</p>
            <h2 className="mt-3 font-heading text-3xl font-semibold">Send an enquiry</h2>
            <p className="mt-2 text-sm text-[#71817B]">Fill in the details below and we&apos;ll get back to you.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold">Customer name</label>
                <div className="flex items-center gap-3 rounded-xl border border-[#E4E5DC] px-4 py-3 focus-within:border-[#A7833D]">
                  <UserRound size={17} className="text-[#A7833D]" />
                  <input name="customer_name" value={form.customer_name} onChange={handleChange} placeholder="Your full name" className="w-full bg-transparent text-sm outline-none" />
                </div>
                {errors.customer_name && <p className="mt-1 text-xs text-red-600">{errors.customer_name}</p>}
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold">Email address</label>
                <div className="flex items-center gap-3 rounded-xl border border-[#E4E5DC] px-4 py-3 focus-within:border-[#A7833D]">
                  <Mail size={17} className="text-[#A7833D]" />
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="w-full bg-transparent text-sm outline-none" />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold">Mobile number</label>
                <div className="flex items-center gap-3 rounded-xl border border-[#E4E5DC] px-4 py-3 focus-within:border-[#A7833D]">
                  <Phone size={17} className="text-[#A7833D]" />
                  <input name="mobile_number" value={form.mobile_number} onChange={handleChange} placeholder="Enter your mobile number" className="w-full bg-transparent text-sm outline-none" />
                </div>
                {errors.mobile_number && <p className="mt-1 text-xs text-red-600">{errors.mobile_number}</p>}
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold">Enquiry subject</label>
                <div className="flex items-center gap-3 rounded-xl border border-[#E4E5DC] px-4 py-3 focus-within:border-[#A7833D]">
                  <MessageSquare size={17} className="text-[#A7833D]" />
                  <input name="subject" value={form.subject} onChange={handleChange} placeholder="What is your enquiry about?" className="w-full bg-transparent text-sm outline-none" />
                </div>
                {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold">Enquiry message</label>
                <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Tell us how we can help..." className="w-full rounded-xl border border-[#E4E5DC] px-4 py-3 text-sm outline-none focus:border-[#A7833D]" />
                {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
              </div>

              {status.text && (
                <p className={`rounded-lg p-3 text-xs ${status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {status.text}
                </p>
              )}

              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#092F33] py-3.5 text-sm font-bold text-white transition hover:bg-[#174B50] disabled:opacity-60">
                <Send size={16} /> {loading ? "Submitting..." : "Submit Enquiry"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Enquiry;
