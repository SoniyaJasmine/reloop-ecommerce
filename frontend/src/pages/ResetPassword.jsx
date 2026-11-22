import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { API } from "../context/AuthContext";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";
  const hasLinkParams = useMemo(() => Boolean(uid && token), [uid, token]);

  const [form, setForm] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!hasLinkParams) {
      setError("This reset link is invalid or incomplete. Please request a new one.");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("accounts/reset-password/", {
        uid,
        token,
        new_password: form.new_password,
        confirm_password: form.confirm_password,
      });
      setMessage(
        response.data?.message ||
          "Your password has been reset successfully. Please log in."
      );
      setForm({ new_password: "", confirm_password: "" });
    } catch (err) {
      const data = err.response?.data;
      let apiError = "Unable to reset password. Please try again.";
      if (data?.error) {
        apiError = Array.isArray(data.error) ? data.error.join(" ") : data.error;
      } else if (data?.detail) {
        apiError = data.detail;
      } else if (data) {
        const first = Object.values(data)[0];
        if (Array.isArray(first)) apiError = first.join(" ");
        else if (typeof first === "string") apiError = first;
      }
      setError(apiError);
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
                CREATE A NEW PASSWORD
              </p>
              <h1 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">
                Reset your <span className="italic text-[#E8C77F]">password.</span>
              </h1>
              <p className="mt-5 text-sm leading-7 text-[#B9C9C3]">
                Choose a strong password for your account. After resetting, you&apos;ll be
                able to sign in with your new password.
              </p>
            </div>

            <p className="mt-12 text-xs text-[#AFC3BC]">
              Give Products a Second Life.
            </p>
          </div>

          <div className="p-8 sm:p-12">
            <p className="text-xs font-bold tracking-[0.2em] text-[#A7833D]">
              SECURE YOUR ACCOUNT
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold">
              Set a new password
            </h2>
            <p className="mt-2 text-sm text-[#71817B]">
              Enter and confirm your new password below.
            </p>

            {!hasLinkParams && !message && (
              <p className="mt-6 rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-700">
                This reset link is invalid or incomplete. Please request a new password
                reset link.
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold">New password</label>
                <div className="flex items-center gap-3 rounded-xl border border-[#E4E5DC] px-4 py-3 focus-within:border-[#A7833D]">
                  <LockKeyhole size={17} className="text-[#A7833D]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="new_password"
                    value={form.new_password}
                    onChange={handleChange}
                    placeholder="Enter a new password"
                    required
                    minLength={8}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="text-[#71817B]"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold">Confirm new password</label>
                <div className="flex items-center gap-3 rounded-xl border border-[#E4E5DC] px-4 py-3 focus-within:border-[#A7833D]">
                  <LockKeyhole size={17} className="text-[#A7833D]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirm_password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="Re-enter your new password"
                    required
                    minLength={8}
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              {message && (
                <div className="rounded-lg bg-green-50 p-3 text-xs leading-5 text-green-700">
                  <p>{message}</p>
                  <Link
                    to="/login"
                    className="mt-2 inline-block font-bold text-green-800 underline"
                  >
                    Go to sign in
                  </Link>
                </div>
              )}

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !hasLinkParams || Boolean(message)}
                className="w-full rounded-xl bg-[#092F33] py-3.5 text-sm font-bold text-white transition hover:bg-[#174B50] disabled:opacity-60"
              >
                {loading ? "Resetting password..." : "Reset password"}
              </button>
            </form>

            <div className="mt-7 space-y-2 text-center text-sm text-[#71817B]">
              <p>
                Need a new link?{" "}
                <Link to="/forgot-password" className="font-bold text-[#A7833D] hover:underline">
                  Request password reset
                </Link>
              </p>
              <p>
                Remembered your password?{" "}
                <Link to="/login" className="font-bold text-[#A7833D] hover:underline">
                  Back to sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
