// Shows: Prev  1 ... 4 5 6 ... 20  Next
function getPageList(page, pages) {
  const list = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) list.push(p);
    else if (list[list.length - 1] !== "...") list.push("...");
  }
  return list;
}

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  const btn = "min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium transition";

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={`${btn} text-primary hover:bg-soft disabled:opacity-40`}
      >
        Prev
      </button>

      {getPageList(page, pages).map((p, i) =>
        p === "..." ? (
          <span key={`gap-${i}`} className="px-1 text-muted">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${btn} ${p === page ? "bg-primary text-white" : "text-primary hover:bg-soft"}`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pages}
        className={`${btn} text-primary hover:bg-soft disabled:opacity-40`}
      >
        Next
      </button>
    </nav>
  );
}