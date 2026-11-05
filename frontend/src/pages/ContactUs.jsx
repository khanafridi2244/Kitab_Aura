import { useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "contact@kitabaura.com";

const SOCIALS = [
  {
    label: "Facebook",
    url: import.meta.env.VITE_FACEBOOK_URL,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99h-2.54V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    url: import.meta.env.VITE_INSTAGRAM_URL,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.9 4.9 0 0 1 1.772 1.153 4.9 4.9 0 0 1 1.153 1.772c.163.46.35 1.26.403 2.43.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.43a4.9 4.9 0 0 1-1.153 1.772 4.9 4.9 0 0 1-1.772 1.153c-.46.163-1.26.35-2.43.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.43-.403a4.9 4.9 0 0 1-1.772-1.153A4.9 4.9 0 0 1 1.63 19.28c-.163-.46-.35-1.26-.403-2.43C1.17 15.584 1.158 15.204 1.158 12s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.43A4.9 4.9 0 0 1 2.784 2.95 4.9 4.9 0 0 1 4.556 1.8c.46-.163 1.26-.35 2.43-.403C8.252 1.34 8.632 1.328 12 1.328zm0 1.838c-3.145 0-3.504.012-4.754.069-1.147.052-1.77.242-2.184.402a3.06 3.06 0 0 0-1.138.74 3.06 3.06 0 0 0-.74 1.138c-.16.413-.35 1.037-.402 2.184-.057 1.25-.069 1.609-.069 4.754s.012 3.504.069 4.754c.052 1.147.242 1.77.402 2.184.19.489.44.929.74 1.138.21.3.65.55 1.138.74.413.16 1.037.35 2.184.402 1.25.057 1.609.069 4.754.069s3.504-.012 4.754-.069c1.147-.052 1.77-.242 2.184-.402a3.06 3.06 0 0 0 1.138-.74 3.06 3.06 0 0 0 .74-1.138c.16-.413.35-1.037.402-2.184.057-1.25.069-1.609.069-4.754s-.012-3.504-.069-4.754c-.052-1.147-.242-1.77-.402-2.184a3.06 3.06 0 0 0-.74-1.138 3.06 3.06 0 0 0-1.138-.74c-.413-.16-1.037-.35-2.184-.402-1.25-.057-1.609-.069-4.754-.069zM12 6.865a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 1.838a3.297 3.297 0 1 0 0 6.594 3.297 3.297 0 0 0 0-6.594zm5.338-3.205a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    url: import.meta.env.VITE_YOUTUBE_URL,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M23.5 6.2a3.01 3.01 0 0 0-2.12-2.13C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.57A3.01 3.01 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.01 3.01 0 0 0 2.12 2.13C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.57a3.01 3.01 0 0 0 2.12-2.13A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
      </svg>
    ),
  },
].filter((s) => s.url);

const TOPICS = [
  "General enquiry",
  "Report an issue",
  "Book request",
  "Partnership",
  "Copyright / takedown",
  "Other",
];

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [status, setStatus] = useState("idle");

  useDocumentMeta("Contact Us - KitabAura", "Get in touch with the KitabAura team for questions, feedback, or book requests.");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, topic, message } = form;
    const subject = encodeURIComponent(topic ? `[KitabAura] ${topic}` : "KitabAura enquiry");
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nTopic: ${topic || "General"}\n\n${message}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setStatus("sent");
  };

  return (
    <div className="mx-auto max-w-6xl min-h-[calc(100vh-4rem)] px-4 py-10">
      {/* ── Page Header ── */}
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">Get in touch</p>
      <h1 className="mt-1 text-3xl font-semibold text-primary sm:text-4xl">Contact Us</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Questions, feedback, or book requests — whatever is on your mind, drop us a message and we will get back to you promptly.
      </p>

      {/* ── Main Content Grid ── */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* ── Left Column: Contact info & quick links ── */}
        <div className="space-y-6 lg:col-span-5">
          {/* Email Us Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-soft text-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Email Us</p>
                <a href={`mailto:${CONTACT_EMAIL}`} className="mt-1 block truncate text-base font-semibold text-primary hover:underline">
                  {CONTACT_EMAIL}
                </a>
                <p className="mt-0.5 text-xs text-muted">Direct inbox for all enquiries</p>
              </div>
            </div>
          </div>

          {/* Response Time Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-soft text-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Response Time</p>
                <p className="mt-1 text-base font-semibold text-ink">1 – 2 business days</p>
                <p className="mt-0.5 text-xs text-muted">We read every message and reply promptly</p>
              </div>
            </div>
          </div>

          {/* FAQ Shortcut Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft text-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">Have a quick question?</h2>
                <p className="mt-1 text-xs text-muted">
                  Check our FAQ first — answers about reading online, downloads, and accounts may already be there.
                </p>
                <Link to="/#faq" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline hover:text-primary-dark">
                  View FAQ &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Book Request Shortcut Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-soft text-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink">Looking for a specific book?</h2>
                <p className="mt-1 text-xs text-muted">
                  Cannot find it in the library? Submit a request and we will try to add it.
                </p>
                <Link to="/requests" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline hover:text-primary-dark">
                  Request a book &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {SOCIALS.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Follow us</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-sm transition hover:bg-soft hover:text-primary"
                  >
                    {s.icon}
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: Message Form ── */}
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            {status === "sent" ? (
              <div className="py-8 text-center" role="status">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-700">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-8 w-8" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mt-4 text-xl font-bold text-ink">Message ready to send</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                  Your email client has been opened with your message addressed to{" "}
                  <span className="font-semibold text-ink">{CONTACT_EMAIL}</span>. We will reply within 1–2 business days.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setForm({ name: "", email: "", topic: "", message: "" });
                    }}
                    className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
                  >
                    Send another message
                  </button>
                  <Link
                    to="/"
                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:bg-soft"
                  >
                    Back to home
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-primary">Send us a message</h2>
                <p className="mt-1 text-sm text-muted">
                  Fill out the form below and we will get back to you as soon as possible.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {/* Name & Email */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-ink">
                      Your name *
                      <input
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Ahmad Khan"
                        maxLength={100}
                        className={inputClass}
                      />
                    </label>

                    <label className="block text-sm font-medium text-ink">
                      Email address *
                      <input
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        maxLength={100}
                        className={inputClass}
                      />
                    </label>
                  </div>

                  {/* Topic */}
                  <label className="block text-sm font-medium text-ink">
                    Topic *
                    <select
                      name="topic"
                      required
                      value={form.topic}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Select a topic…</option>
                      {TOPICS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Message */}
                  <label className="block text-sm font-medium text-ink">
                    Message *
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us what is on your mind…"
                      maxLength={2000}
                      className={`${inputClass} resize-y`}
                    />
                  </label>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark active:scale-[0.99]"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                      </svg>
                      Send message
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom note ── */}
      <p className="mt-12 text-center text-sm text-muted">
        Need assistance with something else? Explore our{" "}
        <Link to="/browse" className="font-semibold text-primary underline">
          library
        </Link>
        {" "}or check the{" "}
        <Link to="/#faq" className="font-semibold text-primary underline">
          FAQ
        </Link>
        .
      </p>
    </div>
  );
}
