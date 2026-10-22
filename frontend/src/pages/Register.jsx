import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../api/axios";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function Register() {
  const { register, isAuthenticated, loading } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Quick checks in the browser, the server validates again
    if (form.password.length < 8) return setError("Password must be at least 8 characters");
    if (form.password !== form.confirm) return setError("Passwords do not match");

    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-primary">Create your account</h1>
        <p className="mt-1 text-sm text-muted">Join KitabAura to read, save and share books.</p>

        {error && (
          <div role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Full name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              minLength={2}
              autoComplete="name"
              className={inputClass}
            />
          </label>

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
              autoComplete="new-password"
              className={inputClass}
            />
            <span className="mt-1 block text-xs text-muted">At least 8 characters</span>
          </label>

          <label className="block text-sm font-medium">
            Confirm password
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className={inputClass}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}