import { useEffect, useRef, useState } from "react";
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
  const wrapRef = useRef(null);
  const lastSaved = useRef(startPage);

  // Keep the page as wide as its container (up to 900px), so it fits phones and desktops
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const step = (delta) => setPage((cur) => Math.min(Math.max(1, cur + delta), numPages || 1));

  // Arrow keys turn the pages
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Save the page half a second after the reader stops flipping
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
    const n = parseInt(new FormData(e.currentTarget).get("page"));
    if (n) setPage(Math.min(Math.max(1, n), numPages || 1));
  };

  const pageWidth = Math.floor(Math.min(boxWidth, 900) * ZOOMS[zoomIndex]);
  const btn =
    "rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-primary hover:bg-soft disabled:opacity-40";

  return (
    <div className="bg-gray-100">
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
      <div className="sticky top-14 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">          <Link to={`/books/${bookId}`} className="text-sm font-medium text-primary hover:underline">
            &larr; Back
          </Link>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{book.title}</p>

          <div className="flex items-center gap-2">
            <button onClick={() => step(-1)} disabled={page <= 1} className={btn} aria-label="Previous page">
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
                className="w-14 rounded-lg border border-gray-300 px-2 py-1 text-center outline-none focus:border-primary"
              />
              <span className="text-muted">/ {numPages || "..."}</span>
            </form>
            <button onClick={() => step(1)} disabled={!numPages || page >= numPages} className={btn} aria-label="Next page">
              Next
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
              disabled={zoomIndex === 0}
              className={btn}
              aria-label="Zoom out"
            >
              &minus;
            </button>
            <span className="w-12 text-center text-sm text-muted">{Math.round(ZOOMS[zoomIndex] * 100)}%</span>
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

      {/* Page */}
      <div ref={wrapRef} className="mx-auto max-w-5xl overflow-x-auto px-2 py-6">
        {loadError ? (
          <div role="alert" className="mx-auto max-w-md rounded-xl bg-white px-6 py-10 text-center shadow-sm">
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
            className="flex justify-center"
          >
            <Page
              pageNumber={page}
              width={pageWidth}
              className="shadow-md"
              loading={<div className="h-96 w-full animate-pulse bg-white" />}
            />
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