import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../api/axios";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from || "/"; // where to go after login

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      // the redirect happens below once the user is set
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  if (loading) return null; // still checking for an existing session
  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-primary">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Log in to save favorites and upload books.</p>

        {error && (
          <div role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          New here?{" "}
          <Link to="/register" className="font-semibold text-primary underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}