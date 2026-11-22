
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
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
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to log in. Please check your details."
      );
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
                WELCOME BACK
              </p>
              <h1 className="mt-4 font-heading text-4xl leading-tight sm:text-5xl">
                Good to see you <span className="italic text-[#E8C77F]">again.</span>
              </h1>
              <p className="mt-5 text-sm leading-7 text-[#B9C9C3]">
                Your next great find is just around the corner. Sign in to
                continue your RELOOP journey.
              </p>
            </div>

            <p className="mt-12 text-xs text-[#AFC3BC]">
              Give Products a Second Life.
            </p>
          </div>

          <div className="p-8 sm:p-12">
            <p className="text-xs font-bold tracking-[0.2em] text-[#A7833D]">
              YOUR ACCOUNT
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold">
              Sign in
            </h2>
            <p className="mt-2 text-sm text-[#71817B]">
              Enter your details to access your account.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold">Email address</label>
                <div className="flex items-center gap-3 rounded-xl border border-[#E4E5DC] px-4 py-3 focus-within:border-[#A7833D]">
                  <Mail size={17} className="text-[#A7833D]" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs font-semibold">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#A7833D] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-[#E4E5DC] px-4 py-3 focus-within:border-[#A7833D]">
                  <LockKeyhole size={17} className="text-[#A7833D]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
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

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#092F33] py-3.5 text-sm font-bold text-white transition hover:bg-[#174B50] disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#71817B]">
              New to RELOOP?{" "}
              <Link to="/register" className="font-bold text-[#A7833D] hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
