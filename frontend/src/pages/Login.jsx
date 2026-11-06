import { useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api, { getErrorMessage } from "../api/axios";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = location.state?.from || "/"; // where to go after login

  // "login" | "forgot" | "reset"
  const tokenFromUrl = searchParams.get("resetToken") || "";
  const [view, setView] = useState(tokenFromUrl ? "reset" : "login");

  const [form, setForm] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetForm, setResetForm] = useState({ token: tokenFromUrl, password: "", confirmPassword: "" });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle normal log in
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      // the redirect happens below once the user is set
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  // Handle forgot password submission
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const emailToSend = forgotEmail || form.email;
      const { data } = await api.post("/auth/forgot-password", { email: emailToSend });
      setSuccess(data.message || "Password reset instructions have been sent to your email.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle setting new password with token
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (resetForm.password !== resetForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", {
        token: resetForm.token,
        password: resetForm.password,
      });
      // Log in with new credentials or notify user
      setSuccess("Your password has been reset successfully! Logging you in...");
      await login(form.email || forgotEmail, resetForm.password).catch(() => {
        // If auto-login fails, switch to login view
        setView("login");
      });
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  if (loading) return null; // still checking for an existing session
  if (isAuthenticated) return <Navigate to={from} replace />;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-xl border border-line bg-surface p-8 shadow-sm">
        {/* ===================== VIEW: FORGOT PASSWORD ===================== */}
        {view === "forgot" ? (
          <div>
            <h1 className="text-2xl font-bold text-primary">Forgot password?</h1>
            <p className="mt-1 text-sm text-muted">
              Enter your account's email address and we'll send you instructions to reset your password.
            </p>

            {error && (
              <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success ? (
              <div className="mt-4 space-y-4">
                <div role="status" className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-800 border border-green-200">
                  <p className="font-bold">✓ Email Sent</p>
                  <p className="mt-1">{success}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark"
                >
                  Back to Log in
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-6 space-y-4">
                <label className="block text-sm font-medium text-ink">
                  Email address
                  <input
                    type="email"
                    name="email"
                    value={forgotEmail || form.email}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-60 transition-colors"
                >
                  {submitting ? "Sending reset link..." : "Send Reset Instructions"}
                </button>

                <div className="pt-2 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setView("login");
                      setError("");
                      setSuccess("");
                    }}
                    className="font-semibold text-primary underline"
                  >
                    &larr; Back to Log in
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : view === "reset" ? (
          /* ===================== VIEW: SET NEW PASSWORD ===================== */
          <div>
            <h1 className="text-2xl font-bold text-primary">Set new password</h1>
            <p className="mt-1 text-sm text-muted">Create a new secure password for your account.</p>

            {error && (
              <div role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                {success}
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-ink">
                Reset Token
                <input
                  type="text"
                  value={resetForm.token}
                  onChange={(e) => setResetForm({ ...resetForm, token: e.target.value })}
                  required
                  placeholder="Paste reset token from email"
                  className={inputClass}
                />
              </label>

              <label className="block text-sm font-medium text-ink">
                New Password (min 8 characters)
                <input
                  type="password"
                  value={resetForm.password}
                  onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })}
                  required
                  minLength={8}
                  className={inputClass}
                />
              </label>

              <label className="block text-sm font-medium text-ink">
                Confirm New Password
                <input
                  type="password"
                  value={resetForm.confirmPassword}
                  onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                  className={inputClass}
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {submitting ? "Updating password..." : "Set New Password"}
              </button>

              <div className="pt-2 text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setError("");
                    setSuccess("");
                  }}
                  className="font-semibold text-primary underline"
                >
                  &larr; Back to Log in
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ===================== VIEW: NORMAL LOGIN ===================== */
          <div>
            <h1 className="text-2xl font-bold text-primary">Welcome back</h1>
            <p className="mt-1 text-sm text-muted">Log in to save favorites, track reading and upload books.</p>

            {error && (
              <div role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-ink">
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

              <div>
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor="password-input" className="font-medium text-ink">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(form.email);
                      setView("forgot");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password-input"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-60 transition-colors"
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
        )}
      </div>
    </div>
  );
}