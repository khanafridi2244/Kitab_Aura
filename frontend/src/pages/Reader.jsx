import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import api, { getErrorMessage } from "../api/axios";

// pdf.js does the heavy work in a background worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

const ZOOMS = [0.75, 1, 1.25, 1.5, 2];

function Viewer({ bookId, book, startPage }) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(startPage);
  const [zoomIndex, setZoomIndex] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [boxWidth, setBoxWidth] = useState(800);
  const [toast, setToast] = useState("");

  // Reading mode: "scroll" (continuous vertical scrolling) or "page" (page-by-page / next page flip)
  const savedMode = localStorage.getItem("kitab_aura_reader_mode");
  const isPreferenceSaved = localStorage.getItem("kitab_aura_reader_mode_saved") === "true";

  const [readingMode, setReadingMode] = useState(savedMode || "page");
  // Show the choice modal when user lands on reader if they haven't saved a preference
  const [showModeModal, setShowModeModal] = useState(!isPreferenceSaved);
  const [rememberPreference, setRememberPreference] = useState(isPreferenceSaved);

  const wrapRef = useRef(null);
  const lastSaved = useRef(startPage);
  const isProgrammaticScroll = useRef(false);
  const initialScrollDone = useRef(false);

  // Keep the page as wide as its container (up to 900px), so it fits phones and desktops
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Page stepping (handles both page-by-page flip and smooth scroll to next/prev page)
  const step = useCallback(
    (delta) => {
      const target = Math.min(Math.max(1, page + delta), numPages || 1);
      setPage(target);
      if (readingMode === "scroll") {
        isProgrammaticScroll.current = true;
        const targetEl = document.getElementById(`pdf-page-${target}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 700);
      }
    },
    [page, numPages, readingMode]
  );

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  // Track currently visible page in continuous scroll mode via IntersectionObserver
  useEffect(() => {
    if (readingMode !== "scroll" || !numPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;

        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;

        // Pick page with the largest visible portion
        visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const topPage = parseInt(visible[0].target.getAttribute("data-page-number"), 10);
        if (topPage && topPage !== page) {
          setPage(topPage);
        }
      },
      {
        root: null,
        rootMargin: "-15% 0px -35% 0px",
        threshold: [0.15, 0.4, 0.7],
      }
    );

    const elements = document.querySelectorAll("[data-page-number]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [readingMode, numPages, zoomIndex, boxWidth, page]);

  // When opening in scroll mode or loading with startPage > 1, scroll to initial page
  useEffect(() => {
    if (readingMode === "scroll" && numPages > 0 && !initialScrollDone.current) {
      if (startPage > 1) {
        const timer = setTimeout(() => {
          const el = document.getElementById(`pdf-page-${startPage}`);
          if (el) {
            el.scrollIntoView({ behavior: "auto", block: "start" });
            initialScrollDone.current = true;
          }
        }, 300);
        return () => clearTimeout(timer);
      } else {
        initialScrollDone.current = true;
      }
    }
  }, [readingMode, numPages, startPage]);

  // Save the page half a second after the reader stops flipping/scrolling
  useEffect(() => {
    if (!numPages || page === lastSaved.current) return;
    const timer = setTimeout(() => {
      api
        .put(`/reading/${bookId}`, { page })
        .then(({ data }) => {
          lastSaved.current = page;
          if (data.newBadges?.length) {
            setToast(`Badge earned: ${data.newBadges.map((b) => b.title).join(", ")}`);
          }
        })
        .catch(() => {}); // saving progress is a bonus, never interrupt the reader
    }, 500);
    return () => clearTimeout(timer);
  }, [page, numPages, bookId]);

  // The badge pop-up disappears by itself
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  const onLoadSuccess = ({ numPages: total }) => {
    setNumPages(total);
    setPage((p) => Math.min(p, total)); // in case the saved page is past the end
  };

  const jump = (e) => {
    e.preventDefault();
    const n = parseInt(new FormData(e.currentTarget).get("page"), 10);
    if (n && n >= 1 && n <= (numPages || 1)) {
      setPage(n);
      if (readingMode === "scroll") {
        isProgrammaticScroll.current = true;
        const targetEl = document.getElementById(`pdf-page-${n}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 700);
      }
    }
  };

  // Switch mode from toolbar or modal
  const handleSelectMode = (newMode, remember = rememberPreference) => {
    setReadingMode(newMode);
    localStorage.setItem("kitab_aura_reader_mode", newMode);
    if (remember) {
      localStorage.setItem("kitab_aura_reader_mode_saved", "true");
    } else {
      localStorage.removeItem("kitab_aura_reader_mode_saved");
    }
    setShowModeModal(false);

    if (newMode === "scroll") {
      setTimeout(() => {
        const el = document.getElementById(`pdf-page-${page}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 250);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const pageWidth = Math.floor(Math.min(boxWidth, 900) * ZOOMS[zoomIndex]);
  const btn =
    "rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-soft hover:text-primary disabled:opacity-40 transition-colors";

  return (
    <div className="min-h-screen bg-page text-ink">
      {/* Reading Mode Selection Modal (Shown when user enters the reader) */}
      {showModeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reader-mode-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-2xl sm:p-8 animate-in fade-in duration-200">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1 text-xs font-semibold text-primary">
                Kitab Aura Reader
              </span>
              <h2 id="reader-mode-title" className="mt-3 text-2xl font-bold font-display text-ink">
                How would you like to read?
              </h2>
              <p className="mt-2 text-sm text-muted">
                Choose your reading experience for <span className="font-semibold text-ink">"{book.title}"</span>
              </p>
            </div>

            {/* Two Options: Continuous Scroll vs Next Page */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Option 1: Continuous Scroll */}
              <button
                type="button"
                onClick={() => handleSelectMode("scroll")}
                className={`group flex flex-col items-center rounded-xl border-2 p-5 text-center transition-all ${
                  readingMode === "scroll"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-line hover:border-primary/60 hover:bg-soft/40"
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-soft text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="7" y="2" width="10" height="20" rx="5" />
                    <line x1="12" y1="6" x2="12" y2="10" />
                    <polyline points="9 15 12 18 15 15" />
                  </svg>
                </div>
                <h3 className="mt-3 font-bold text-ink group-hover:text-primary">Continuous Scroll</h3>
                <span className="mt-0.5 rounded-full bg-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
                  Scroll Mode
                </span>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Scroll down continuously through pages like a web document or article. Smooth and fast.
                </p>
                <div className="mt-4 w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-xs group-hover:bg-primary-dark">
                  Read with Scroll &darr;
                </div>
              </button>

              {/* Option 2: Page by Page (Next Page) */}
              <button
                type="button"
                onClick={() => handleSelectMode("page")}
                className={`group flex flex-col items-center rounded-xl border-2 p-5 text-center transition-all ${
                  readingMode === "page"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-line hover:border-primary/60 hover:bg-soft/40"
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-soft text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    <polyline points="10 9 13 12 10 15" />
                  </svg>
                </div>
                <h3 className="mt-3 font-bold text-ink group-hover:text-primary">Page by Page</h3>
                <span className="mt-0.5 rounded-full bg-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
                  Next Page Mode
                </span>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Turn pages one by one with Prev / Next buttons and arrow keys. Classic book experience.
                </p>
                <div className="mt-4 w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-xs group-hover:bg-primary-dark">
                  Read Page by Page &rarr;
                </div>
              </button>
            </div>

            {/* Remember Preference & Footer */}
            <div className="mt-6 flex flex-col items-center gap-3 border-t border-line pt-4 sm:flex-row sm:justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-muted hover:text-ink">
                <input
                  type="checkbox"
                  checked={rememberPreference}
                  onChange={(e) => setRememberPreference(e.target.checked)}
                  className="rounded border-line text-primary focus:ring-primary"
                />
                <span>Remember my choice for future books</span>
              </label>

              <button
                type="button"
                onClick={() => handleSelectMode(readingMode)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Use current default
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white shadow-lg"
        >
          <span className="text-accent">&#9733;</span>
          <span>{toast}</span>
          <Link to="/challenges" className="text-accent underline">
            View
          </Link>
        </div>
      )}

      {/* Toolbar */}
      <div className="sticky top-14 z-40 border-b border-line bg-surface/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <Link to={`/books/${bookId}`} className="text-sm font-medium text-primary hover:underline">
              &larr; Back
            </Link>
            <p className="truncate text-sm font-semibold text-ink max-w-[200px] sm:max-w-xs md:max-w-md">{book.title}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Reading Mode Switcher (Scroll vs Page-by-Page) */}
            <div className="flex items-center rounded-lg border border-line bg-soft/50 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleSelectMode("scroll", rememberPreference)}
                title="Continuous Scroll mode"
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                  readingMode === "scroll"
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted hover:text-ink hover:bg-surface/50"
                }`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="7" y="2" width="10" height="20" rx="5" />
                  <line x1="12" y1="6" x2="12" y2="10" />
                  <polyline points="9 15 12 18 15 15" />
                </svg>
                <span>Scroll</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode("page", rememberPreference)}
                title="Page by Page (Next page) mode"
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                  readingMode === "page"
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted hover:text-ink hover:bg-surface/50"
                }`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <span>Next Page</span>
              </button>

              <button
                type="button"
                onClick={() => setShowModeModal(true)}
                title="Change reading mode preferences"
                className="ml-1 text-muted hover:text-primary px-1 py-0.5 rounded transition-colors"
                aria-label="Reading mode options"
              >
                &#9881;
              </button>
            </div>

            {/* Page Navigation Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => step(-1)}
                disabled={page <= 1}
                className={btn}
                aria-label={readingMode === "scroll" ? "Scroll to previous page" : "Previous page"}
              >
                Prev
              </button>
              <form onSubmit={jump} className="flex items-center gap-1 text-sm">
                <input
                  key={page}
                  name="page"
                  type="number"
                  min="1"
                  max={numPages || 1}
                  defaultValue={page}
                  aria-label="Page number"
                  className="w-14 rounded-lg border border-line bg-surface px-2 py-1 text-center text-ink outline-none focus:border-primary"
                />
                <span className="text-muted">/ {numPages || "..."}</span>
              </form>
              <button
                onClick={() => step(1)}
                disabled={!numPages || page >= numPages}
                className={btn}
                aria-label={readingMode === "scroll" ? "Scroll to next page" : "Next page"}
              >
                Next
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
                disabled={zoomIndex === 0}
                className={btn}
                aria-label="Zoom out"
              >
                &minus;
              </button>
              <span className="w-12 text-center text-xs font-semibold text-muted">
                {Math.round(ZOOMS[zoomIndex] * 100)}%
              </span>
              <button
                onClick={() => setZoomIndex((i) => Math.min(ZOOMS.length - 1, i + 1))}
                disabled={zoomIndex === ZOOMS.length - 1}
                className={btn}
                aria-label="Zoom in"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF View Container */}
      <div ref={wrapRef} className="mx-auto max-w-5xl px-2 py-6">
        {loadError ? (
          <div role="alert" className="mx-auto max-w-md rounded-xl border border-line bg-surface px-6 py-10 text-center shadow-sm">
            <p className="font-semibold text-red-700">Could not display this PDF here</p>
            <p className="mt-1 text-sm text-muted">{loadError}</p>
            <a
              href={book.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Open the PDF in a new tab
            </a>
          </div>
        ) : (
          <Document
            file={book.pdfUrl}
            onLoadSuccess={onLoadSuccess}
            onLoadError={(err) => setLoadError(err.message)}
            loading={<p className="py-20 text-center text-muted">Loading book...</p>}
            className="flex flex-col items-center"
          >
            {readingMode === "scroll" ? (
              /* Continuous Scroll Mode: renders all pages vertically */
              <div className="flex flex-col items-center gap-6 w-full">
                {Array.from({ length: numPages }, (_, index) => {
                  const pageNum = index + 1;
                  return (
                    <div
                      key={`page_${pageNum}`}
                      id={`pdf-page-${pageNum}`}
                      data-page-number={pageNum}
                      className="flex flex-col items-center w-full"
                    >
                      <Page
                        pageNumber={pageNum}
                        width={pageWidth}
                        className="shadow-md transition-shadow"
                        loading={
                          <div
                            style={{ width: pageWidth, height: Math.round(pageWidth * 1.35) }}
                            className="flex items-center justify-center rounded-lg border border-line bg-surface text-sm text-muted shadow-sm animate-pulse"
                          >
                            Loading page {pageNum}...
                          </div>
                        }
                      />
                      <span className="mt-2 text-xs font-medium text-muted select-none">
                        Page {pageNum} of {numPages}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Page by Page (Next Page) Mode: renders single page */
              <div className="flex flex-col items-center">
                <Page
                  pageNumber={page}
                  width={pageWidth}
                  className="shadow-md"
                  loading={
                    <div
                      style={{ width: pageWidth, height: Math.round(pageWidth * 1.35) }}
                      className="flex items-center justify-center rounded-lg border border-line bg-surface text-sm text-muted shadow-sm animate-pulse"
                    >
                      Loading page {page}...
                    </div>
                  }
                />
                <span className="mt-2 text-xs font-medium text-muted select-none">
                  Page {page} of {numPages || "..."}
                </span>
              </div>
            )}
          </Document>
        )}
      </div>
    </div>
  );
}

export default function Reader() {
  const { id } = useParams();
  // "id" records which book these results belong to, so loading = (results are for another book)
  const [result, setResult] = useState({ id: null, data: null, error: "" });
  const loading = result.id !== id;

  useEffect(() => {
    let active = true;
    api
      .get(`/reading/${id}`)
      .then(({ data }) => active && setResult({ id, data, error: "" }))
      .catch((err) => active && setResult({ id, data: null, error: getErrorMessage(err) }));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <p className="px-4 py-20 text-center text-muted">Opening book...</p>;

  if (result.error || !result.data) {
    return (
      <div className="px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-primary">Cannot open this book</h1>
        <p className="mt-2 text-muted">{result.error}</p>
        <Link to="/browse" className="mt-4 inline-block font-semibold text-primary underline">
          Back to browse
        </Link>
      </div>
    );
  }

  return <Viewer key={id} bookId={id} book={result.data.book} startPage={result.data.lastPage} />;
}