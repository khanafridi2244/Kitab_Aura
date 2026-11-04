import { useState } from "react";
import { Link } from "react-router-dom";

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;
const linkClass = "font-semibold text-primary underline";

const ITEMS = [
  {
    q: "What is KitabAura?",
    a: <>KitabAura is a multilingual digital library where readers can discover books in Pashto, Urdu and English.</>,
  },
  {
    q: "Is KitabAura free to use?",
    a: (
      <>
        Yes. Anyone can browse the library. A free account lets you read online, download books, save favorites and track
        your reading. There are no paid features at the moment.
      </>
    ),
  },
  {
    q: "How can I find a book?",
    a: (
      <>
        Use the search box, or go to <Link to="/browse" className={linkClass}>Explore Books</Link> to filter by language,
        category and rating, and to sort by newest, most downloaded or top rated.
      </>
    ),
  },
  {
    q: "Can I submit my own book?",
    a: (
      <>
        Yes. Create a free account and choose <strong>Upload a book</strong>. Every submission is checked by an admin
        before it is published, so please share only books you have the right to share, such as public-domain works or
        your own writing. Cannot find a book you want? You can <Link to="/requests" className={linkClass}>request it</Link>.
      </>
    ),
  },
  {
    q: "Can I read books online?",
    a: <>Yes. Once you are logged in, open any book and choose <strong>Read online</strong>. The reader remembers the page you stopped on.</>,
  },
  {
    q: "Can I download books?",
    a: (
      <>
        Yes. Logged-in readers can download published books as PDF files.
        {CONTACT_EMAIL && (
          <>
            {" "}If you hold the rights to a book and want it removed, please <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>contact us</a>.
          </>
        )}
      </>
    ),
  },
  {
    q: "Which languages are supported?",
    a: <>Pashto, Urdu and English are our main languages. Arabic and Persian books can also be added.</>,
  },
  // Only shown when a real contact address is set in frontend/.env
  ...(CONTACT_EMAIL
    ? [
        {
          q: "How can I contact KitabAura?",
          a: <>Write to us at <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>{CONTACT_EMAIL}</a>.</>,
        },
      ]
    : []),
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null); // one answer open at a time

  return (
    <section id="faq" aria-labelledby="faq-heading" className="py-12">
      <h2 id="faq-heading" className="text-2xl font-semibold text-primary sm:text-3xl">
        Frequently Asked Questions
      </h2>
      <p className="mt-1 text-sm text-muted">Quick answers about using KitabAura.</p>

      <div className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {ITEMS.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.q}>
              <h3>
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-expanded={open}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-ink hover:bg-soft"
                >
                  <span>{item.q}</span>
                  <svg
                    className={`shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </h3>
              <div
                id={`faq-a-${i}`}
                role="region"
                aria-labelledby={`faq-q-${i}`}
                hidden={!open}
                className="px-5 pb-5 text-sm leading-relaxed text-muted"
              >
                {item.a}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}