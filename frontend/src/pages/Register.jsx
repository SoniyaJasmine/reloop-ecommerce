
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, UserRound, Mail, LockKeyhole } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      navigate("/");
    } catch (err) {
      const data = err.response?.data;
      const message = data
        ? Object.entries(data)
            .map(([field, messages]) =>
              `${field.replaceAll("_", " ")}: ${
                Array.isArray(messages) ? messages.join(" ") : messages
              }`
            )
            .join(" ")
        : "Unable to create your account. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2EC] px-5 py-10 text-[#092F33]">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#526C66] hover:text-[#A7833D]">
          <ArrowLeft size={17} />
          Back to RELOOP
        </Link>

        <div className="mx-auto mt-10 grid max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
          <div className="flex flex-col justify-between bg-[#092F33] p-9 text-white sm:p-12">
            <div>
              <img src="/reloop-logo.png" alt="RELOOP" className="h-14 w-auto" />
              <p className="mt-12 text-xs font-bold tracking-[0.25em] text-[#E8C77F]">
                JOIN THE CIRCLE
              </p>
              <h1 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">
                Discover more. <span className="italic text-[#E8C77F]">Waste less.</span>
              </h1>
              <p className="mt-5 text-sm leading-7 text-[#B9C9C3]">
                Create your RELOOP account and discover quality-checked
                pre-owned products at thoughtful prices.
              </p>
            </div>

            <p className="mt-12 text-xs text-[#AFC3BC]">
              Give Products a Second Life.
            </p>
          </div>

          <div className="p-8 sm:p-12">
            <p className="text-xs font-bold tracking-[0.2em] text-[#A7833D]">
              GET STARTED
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold">
              Create account
            </h2>
            <p className="mt-2 text-sm text-[#71817B]">
              Join RELOOP in just a few steps.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold">First name</label>
                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                    placeholder="First name"
                    className="w-full rounded-xl border border-[#E4E5DC] px-3 py-3 text-sm outline-none focus:border-[#A7833D]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold">Last name</label>
                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Last name"
                    className="w-full rounded-xl border border-[#E4E5DC] px-3 py-3 text-sm outline-none focus:border-[#A7833D]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold">Username</label>
                <div className="flex items-center gap-3 rounded-xl border border-[#E4E5DC] px-4 py-3 focus-within:border-[#A7833D]">
                  <UserRound size={17} className="text-[#A7833D]" />
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    placeholder="Choose a username"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold">Email address</label>
                <div className="flex items-center gap-3 rounded-xl border border-[#E4E5DC] px-4 py-3 focus-within:border-[#A7833D]">
                  <Mail size={17} className="text-[#A7833D]" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold">Password</label>
                <div className="flex items-center gap-3 rounded-xl border border-[#E4E5DC] px-4 py-3 focus-within:border-[#A7833D]">
                  <LockKeyhole size={17} className="text-[#A7833D]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
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
                <label className="mb-2 block text-xs font-semibold">Confirm password</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl border border-[#E4E5DC] px-4 py-3 text-sm outline-none focus:border-[#A7833D]"
                />
              </div>

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
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#71817B]">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-[#A7833D] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
