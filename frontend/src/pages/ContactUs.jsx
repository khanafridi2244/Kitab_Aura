import { useState } from "react";
import { Link } from "react-router-dom";

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "contact@kitabaura.com";

const SOCIALS = [
    {
        label: "Facebook",
        color: "bg-[#1877F2]",
        url: import.meta.env.VITE_FACEBOOK_URL,
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99h-2.54V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
            </svg>
        ),
    },
    {
        label: "Instagram",
        color: "bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]",
        url: import.meta.env.VITE_INSTAGRAM_URL,
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.9 4.9 0 0 1 1.772 1.153 4.9 4.9 0 0 1 1.153 1.772c.163.46.35 1.26.403 2.43.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.43a4.9 4.9 0 0 1-1.153 1.772 4.9 4.9 0 0 1-1.772 1.153c-.46.163-1.26.35-2.43.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.43-.403a4.9 4.9 0 0 1-1.772-1.153A4.9 4.9 0 0 1 1.63 19.28c-.163-.46-.35-1.26-.403-2.43C1.17 15.584 1.158 15.204 1.158 12s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.43A4.9 4.9 0 0 1 2.784 2.95 4.9 4.9 0 0 1 4.556 1.8c.46-.163 1.26-.35 2.43-.403C8.252 1.34 8.632 1.328 12 1.328zm0 1.838c-3.145 0-3.504.012-4.754.069-1.147.052-1.77.242-2.184.402a3.06 3.06 0 0 0-1.138.74 3.06 3.06 0 0 0-.74 1.138c-.16.413-.35 1.037-.402 2.184-.057 1.25-.069 1.609-.069 4.754s.012 3.504.069 4.754c.052 1.147.242 1.77.402 2.184.19.489.44.929.74 1.138.21.3.65.55 1.138.74.413.16 1.037.35 2.184.402 1.25.057 1.609.069 4.754.069s3.504-.012 4.754-.069c1.147-.052 1.77-.242 2.184-.402a3.06 3.06 0 0 0 1.138-.74 3.06 3.06 0 0 0 .74-1.138c.16-.413.35-1.037.402-2.184.057-1.25.069-1.609.069-4.754s-.012-3.504-.069-4.754c-.052-1.147-.242-1.77-.402-2.184a3.06 3.06 0 0 0-.74-1.138 3.06 3.06 0 0 0-1.138-.74c-.413-.16-1.037-.35-2.184-.402-1.25-.057-1.609-.069-4.754-.069zM12 6.865a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 1.838a3.297 3.297 0 1 0 0 6.594 3.297 3.297 0 0 0 0-6.594zm5.338-3.205a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" />
            </svg>
        ),
    },
    {
        label: "YouTube",
        color: "bg-[#FF0000]",
        url: import.meta.env.VITE_YOUTUBE_URL,
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M23.5 6.2a3.01 3.01 0 0 0-2.12-2.13C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.57A3.01 3.01 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.01 3.01 0 0 0 2.12 2.13C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.57a3.01 3.01 0 0 0 2.12-2.13A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
            </svg>
        ),
    },
].filter((s) => s.url);

const INFO_CARDS = [
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        title: "Email Us",
        value: CONTACT_EMAIL,
        href: `mailto:${CONTACT_EMAIL}`,
        accent: "text-primary",
        bg: "bg-primary/10",
    },
    {
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            </svg>
        ),
        title: "Response Time",
        value: "1 – 2 business days",
        href: null,
        accent: "text-amber-700",
        bg: "bg-accent/15",
    },

];

const TOPICS = [
    "General enquiry",
    "Report an issue",
    "Book request",
    "Partnership",
    "Copyright / takedown",
    "Other",
];

export default function ContactUs() {
    const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
    const [status, setStatus] = useState("idle");

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const { name, email, topic, message } = form;
        const subject = encodeURIComponent(topic || "KitabAura enquiry");
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
        setStatus("sent");
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] pt-12">
            {/* ── Hero banner ── */}
            <div className="relative overflow-hidden bg-[#0b2e23] py-16 text-white">
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />

                <div className="relative mx-auto max-w-3xl px-4 text-center">
                    <span className="inline-block rounded-full border border-accent/40 bg-accent/10 px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
                        Get in touch
                    </span>
                    <h1 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
                        We'd love to <span className="text-accent">hear</span> from you
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-sm text-white/75 sm:text-base">
                        Questions, feedback, book requests — whatever's on your mind, drop us a message and we'll get back to you promptly.
                    </p>
                </div>
            </div>

            {/* ── Info cards strip ── */}
            <div className="bg-soft">
                <div className="mx-auto grid max-w-3xl grid-cols-1 gap-px sm:grid-cols-2">
                    {INFO_CARDS.map((c) => (
                        <div key={c.title} className="bg-white p-6 text-center sm:p-8">
                            <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${c.bg} ${c.accent}`}>
                                {c.icon}
                            </div>
                            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-muted">{c.title}</p>
                            {c.href ? (
                                <a href={c.href} className={`mt-1 block text-sm font-semibold break-all hover:underline ${c.accent}`}>
                                    {c.value}
                                </a>
                            ) : (
                                <p className={`mt-1 text-sm font-semibold ${c.accent}`}>{c.value}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="mx-auto max-w-5xl px-4 py-16">
                <div className="grid gap-10 lg:grid-cols-5">

                    {/* ── Left column ── */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Intro text */}
                        <div>
                            <h2 className="text-2xl font-bold text-ink">Let's talk</h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted">
                                KitabAura is a multilingual library built for readers of Pashto, Urdu and English. Your feedback directly shapes how we grow.
                            </p>
                        </div>

                        {/* FAQ shortcut */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-amber-800">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-ink">Have a common question?</p>
                                    <p className="text-xs text-muted">Check our FAQ first — it might already be answered.</p>
                                </div>
                            </div>
                            <Link
                                to="/#faq"
                                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                            >
                                View FAQ
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        {/* Socials */}
                        {SOCIALS.length > 0 && (
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-muted">Follow us</p>
                                <div className="mt-3 flex flex-wrap gap-3">
                                    {SOCIALS.map((s) => (
                                        <a
                                            key={s.label}
                                            href={s.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-2 rounded-xl ${s.color} px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90`}
                                        >
                                            {s.icon}
                                            {s.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right column: form ── */}
                    <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-md sm:p-10 lg:col-span-3">
                        {status === "sent" ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="relative flex h-20 w-20 items-center justify-center">
                                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-10 w-10 text-primary">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <h2 className="mt-6 text-2xl font-bold text-primary">Message sent!</h2>
                                <p className="mt-2 max-w-xs text-sm text-muted">
                                    Your email client should have opened. We'll reply within 1–2 business days.
                                </p>
                                <button
                                    onClick={() => { setStatus("idle"); setForm({ name: "", email: "", topic: "", message: "" }); }}
                                    className="mt-7 rounded-xl bg-soft px-6 py-2.5 text-sm font-semibold text-primary transition hover:bg-line"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold text-ink">Send us a message</h2>
                                <p className="mt-1 text-sm text-muted">We read every message and typically reply within two business days.</p>

                                <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                                    {/* Name + Email */}
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <label className="block space-y-1.5">
                                            <span className="text-sm font-semibold text-ink">Your name</span>
                                            <input
                                                name="name"
                                                type="text"
                                                required
                                                value={form.name}
                                                onChange={handleChange}
                                                placeholder="e.g. Sikandar Khan"
                                                className="w-full rounded-xl border border-gray-200 bg-soft px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted/60"
                                            />
                                        </label>
                                        <label className="block space-y-1.5">
                                            <span className="text-sm font-semibold text-ink">Email address</span>
                                            <input
                                                name="email"
                                                type="email"
                                                required
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="you@example.com"
                                                className="w-full rounded-xl border border-gray-200 bg-soft px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted/60"
                                            />
                                        </label>
                                    </div>

                                    {/* Topic */}
                                    <label className="block space-y-1.5">
                                        <span className="text-sm font-semibold text-ink">Topic</span>
                                        <select
                                            name="topic"
                                            required
                                            value={form.topic}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-gray-200 bg-soft px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="" disabled>Select a topic…</option>
                                            {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </label>

                                    {/* Message */}
                                    <label className="block space-y-1.5">
                                        <span className="text-sm font-semibold text-ink">Message</span>
                                        <textarea
                                            name="message"
                                            required
                                            rows={5}
                                            value={form.message}
                                            onChange={handleChange}
                                            placeholder="Tell us what's on your mind…"
                                            className="w-full resize-none rounded-xl border border-gray-200 bg-soft px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted/60"
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-primary-dark active:scale-[0.98]"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                                        </svg>
                                        Send message
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
