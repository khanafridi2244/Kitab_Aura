import { useState } from "react";
import api, { getErrorMessage } from "../api/axios";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | done
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status !== "idle") return; // blocks double submissions
    setError("");
    if (!consent) return setError("Please tick the box to agree to receive updates.");

    setStatus("sending");
    try {
      await api.post("/newsletter", { email, consent: true });
      setStatus("done");
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus("idle");
    }
  };

  return (
    <section id="newsletter" aria-labelledby="newsletter-heading" className="pb-16">
      <div className="rounded-3xl bg-[#0f4c3a] px-6 py-10 text-white shadow-lg sm:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="newsletter-heading" className="text-2xl font-semibold sm:text-3xl">
            Stay Connected to the World of Books.
          </h2>
          <p className="mt-2 text-sm text-white/85">
            Get occasional updates about new books and articles on KitabAura. You can unsubscribe at any time.
          </p>

          {status === "done" ? (
            <p role="status" className="mt-6 rounded-xl bg-white/15 px-4 py-4 font-medium">
              Thank you! You are subscribed.
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-6 text-left">
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="flex-1">
                  <span className="sr-only">Email address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="Your email address"
                    className="w-full rounded-full bg-[#fbf3e2] px-5 py-3 text-[#14201a] outline-none placeholder:text-[#5d6a63] focus:ring-2 focus:ring-accent"
                  />
                </label>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-on-accent hover:opacity-90 disabled:opacity-60"
                >
                  {status === "sending" ? "Subscribing..." : "Subscribe"}
                </button>
              </div>

              <label className="mt-3 flex items-start gap-2 text-xs text-white/85">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#d9a441]"
                />
                <span>
                  I agree to receive occasional email updates from KitabAura. We use your email only for these updates and
                  never share it.
                </span>
              </label>

              {error && (
                <p role="alert" className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}