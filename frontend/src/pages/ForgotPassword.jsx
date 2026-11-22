import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { API } from "../context/AuthContext";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await API.post("accounts/forgot-password/", { email });
      setMessage(
        response.data?.message ||
          "If an account exists with this email, a password reset link has been sent."
      );
    } catch (err) {
      const data = err.response?.data;
      const apiError =
        data?.error ||
        data?.email?.[0] ||
        data?.detail ||
        "Unable to send reset link. Please try again.";
      setError(Array.isArray(apiError) ? apiError.join(" ") : apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2EC] px-5 py-10 text-[#092F33]">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-[#526C66] hover:text-[#A7833D]"
        >
          <ArrowLeft size={17} />
          Back to sign in
        </Link>

        <div className="mx-auto mt-10 grid max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
          <div className="flex flex-col justify-between bg-[#092F33] p-9 text-white sm:p-12">
            <div>
              <img src="/reloop-logo.png" alt="RELOOP" className="h-14 w-auto" />
              <p className="mt-12 text-xs font-bold tracking-[0.25em] text-[#E8C77F]">
                RESET ACCESS
              </p>
              <h1 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">
                Forgot your <span className="italic text-[#E8C77F]">password?</span>
              </h1>
              <p className="mt-5 text-sm leading-7 text-[#B9C9C3]">
                Enter the email address associated with your RELOOP account and we&apos;ll
                send you a secure link to create a new password.
              </p>
            </div>

            <p className="mt-12 text-xs text-[#AFC3BC]">
              Give Products a Second Life.
            </p>
          </div>

          <div className="p-8 sm:p-12">
            <p className="text-xs font-bold tracking-[0.2em] text-[#A7833D]">
              ACCOUNT RECOVERY
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold">
              Forgot password
            </h2>
            <p className="mt-2 text-sm text-[#71817B]">
              We&apos;ll email you a reset link if an account exists for this address.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold">Email address</label>
                <div className="flex items-center gap-3 rounded-xl border border-[#E4E5DC] px-4 py-3 focus-within:border-[#A7833D]">
                  <Mail size={17} className="text-[#A7833D]" />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              {message && (
                <p className="rounded-lg bg-green-50 p-3 text-xs leading-5 text-green-700">
                  {message}
                </p>
              )}

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#092F33] py-3.5 text-sm font-bold text-white transition hover:bg-[#174B50] disabled:opacity-60"
              >
                {loading ? "Sending reset link..." : "Send reset link"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#71817B]">
              Remembered your password?{" "}
              <Link to="/login" className="font-bold text-[#A7833D] hover:underline">
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
