import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";

const EXTERNAL_CATEGORIES = [
  { id: "all", label: "All Categories", icon: "🌐", mongoSlug: "" },
  { id: "biography", label: "Biography", icon: "👤", mongoSlug: "biography" },
  { id: "novel", label: "Novel", icon: "📖", mongoSlug: "novel" },
  { id: "art-culture", label: "Art & Culture", icon: "🎨", mongoSlug: "art-culture" },
  { id: "business-management", label: "Business & Management", icon: "💼", mongoSlug: "business-management" },
  { id: "children-s-books", label: "Children's Books", icon: "🧸", mongoSlug: "children-s-books" },
  { id: "computer-science", label: "Computer Science", icon: "💻", mongoSlug: "computer-science" },
  { id: "dictionaries", label: "Dictionaries", icon: "📚", mongoSlug: "dictionaries" },
  { id: "drama-plays", label: "Drama & Plays", icon: "🎭", mongoSlug: "drama-plays" },
  { id: "economics", label: "Economics", icon: "📈", mongoSlug: "economics" },
];

const CATEGORY_SUGGESTIONS = {
  biography: {
    all: ["Albert Einstein", "Steve Jobs", "Seerat un Nabi", "Sawaneh Ghalib", "Da Rahman Baba Jwand"],
    english: ["Albert Einstein", "Abraham Lincoln", "Steve Jobs", "Winston Churchill", "Benjamin Franklin"],
    urdu: ["Seerat un Nabi", "Hayat e Ghalib", "Yadgar e Ghalib", "Hayat Us Sahaba", "Aab e Hayat"],
    pashto: ["Da Rahman Baba Jwand", "Khushal Khan Sawaneh", "Bacha Khan", "Ahmad Shah Baba", "Pashtano Tareekh"],
  },
  novel: {
    all: ["Pride and Prejudice", "War and Peace", "Umrao Jan Ada", "Peer e Kamil", "Jannat K Pattay"],
    english: ["Pride and Prejudice", "Great Expectations", "War and Peace", "Sherlock Holmes", "Jane Eyre"],
    urdu: ["Umrao Jan Ada", "Mirat ul Uroos", "Aag Ka Darya", "Peer e Kamil", "Jannat K Pattay"],
    pashto: ["Dewan e Rahman Baba", "Pashto Adab", "Da Qissa Khani Qissay", "Patan", "Zama Jwand"],
  },
  "art-culture": {
    all: ["History of Art", "Islamic Art", "Mughal Art", "Pashtun Culture", "World Cultures"],
    english: ["History of Art", "Renaissance Art", "World Cultures", "Architecture", "Islamic Art"],
    urdu: ["Hindustani Saqafat", "Islami Funoon", "Tehzeeb o Tamaddun", "Urdu Qalamkaran", "Mughal Art"],
    pashto: ["Pashtun Culture", "Pashtunwali", "Da Pashto Saqafat", "Pashto Folklore", "Da Pukhtano Riwajuna"],
  },
  "business-management": {
    all: ["Principles of Management", "Leadership", "Business Strategy", "Karobar", "Tijarat"],
    english: ["Principles of Management", "Leadership", "Business Strategy", "Marketing Management", "Entrepreneurship"],
    urdu: ["Karobari Rahnuma", "Tijarat o Karobar", "Qayadat Aur Intizamia", "Business Management", "Kamyab Karobar"],
    pashto: ["Tijarat", "Da Karobar Usul", "Intizamia", "Leadership", "Eqtesad aw Karobar"],
  },
  "children-s-books": {
    all: ["Fairy Tales", "Alice in Wonderland", "Bachon Ki Kahaniyan", "Aesop Fables", "Peter Pan"],
    english: ["Fairy Tales", "Alice in Wonderland", "Aesop Fables", "Peter Pan", "Grimm Fairy Tales"],
    urdu: ["Bachon Ki Kahaniyan", "Nazmein Bachon Ke Liye", "Tot Batot", "Chacha Chakkan", "Alif Laila"],
    pashto: ["Da Mashomano Qissay", "Da Mashomano Nazmona", "Mashoman", "Pukhto Qissay", "Mashomano Adab"],
  },
  "computer-science": {
    all: ["Python Programming", "Algorithms", "Computer Networks", "Database Systems", "Operating Systems"],
    english: ["Python Programming", "Introduction to Algorithms", "Computer Networks", "Database Systems", "Operating Systems"],
    urdu: ["Computer Science", "Information Technology", "Computer Ke Bunyadi Usul", "Programming", "Software Engineering"],
    pashto: ["Computer Science", "Da Computer Zaba", "Information Technology", "Da Computer Asasiyat", "Programming"],
  },
  dictionaries: {
    all: ["Oxford English Dictionary", "Feroz Ul Lughat", "Pashto English Dictionary", "Webster Dictionary"],
    english: ["Oxford English Dictionary", "Webster Dictionary", "English Etymology", "Roget Thesaurus", "Greek Latin Lexicon"],
    urdu: ["Feroz Ul Lughat", "Farhang e Asifiya", "Noor ul Lughat", "Jame ul Lughat", "Urdu English Dictionary"],
    pashto: ["Daryab Pashto Qamoos", "Pashto English Dictionary", "Afghan Qamoos", "Pukhto Lughat", "English to Pashto"],
  },
  "drama-plays": {
    all: ["Shakespeare Plays", "Hamlet", "Anarkali Drama", "Macbeth", "Urdu Dramey"],
    english: ["Shakespeare Plays", "Hamlet", "Macbeth", "Oedipus Rex", "A Doll's House"],
    urdu: ["Anarkali Drama", "Agha Hashar Kashmiri", "Urdu Dramey", "Rustam o Sohrab", "Khawaja Moinuddin Dramey"],
    pashto: ["Pashto Drama", "Da Pukhto Natak", "Hamza Baba Drama", "Pashto Theatre", "Da Meenay Qissa"],
  },
  economics: {
    all: ["Wealth of Nations", "Principles of Economics", "Macroeconomics", "Ilm e Maashiyat", "Finance"],
    english: ["Wealth of Nations", "Principles of Economics", "Macroeconomics", "Microeconomics", "Capitalism and Freedom"],
    urdu: ["Ilm e Maashiyat", "Islami Maashiyat", "Maashi Tareekh", "Maashiyat Ke Usul", "Pakistan Ki Maashiyat"],
    pashto: ["Da Eqtesad Usul", "Eqtesad", "Da Afghanistan Eqtesad", "Maashi Nizam", "Da Pukhtano Eqtesad"],
  },
};

const DEFAULT_SUGGESTIONS = {
  urdu: [
    { label: "Allama Iqbal", query: "allama iqbal" },
    { label: "Mirza Ghalib", query: "mirza ghalib" },
    { label: "Faiz Ahmad Faiz", query: "faiz ahmad faiz" },
    { label: "Saadat Hasan Manto", query: "manto" },
    { label: "Urdu Poetry", query: "urdu poetry" },
    { label: "Tareekh", query: "tareekh" },
  ],
  pashto: [
    { label: "Khushal Khan Khattak", query: "khushal khan khattak" },
    { label: "Rahman Baba", query: "rahman baba" },
    { label: "Ghani Khan", query: "ghani khan" },
    { label: "Hamza Baba", query: "hamza baba" },
    { label: "Pashto Literature", query: "pashto adab" },
    { label: "Pashto History", query: "pashto tareekh" },
  ],
  english: [
    { label: "Sherlock Holmes", query: "sherlock holmes" },
    { label: "Shakespeare", query: "william shakespeare" },
    { label: "Jane Austen", query: "pride and prejudice" },
    { label: "World History", query: "world history" },
    { label: "Philosophy", query: "philosophy" },
    { label: "Astronomy", query: "astronomy" },
  ],
  all: [
    { label: "Urdu Literature", query: "urdu adab", lang: "urdu" },
    { label: "Pashto Dewan", query: "dewan pashto", lang: "pashto" },
    { label: "Classic English", query: "classic literature", lang: "english" },
    { label: "Islamic Studies", query: "islamic studies", lang: "all" },
  ],
};

export default function ImportBooks() {
  const [language, setLanguage] = useState("all");
  const [category, setCategory] = useState("all");
  const [source, setSource] = useState("archive"); // 'archive' | 'openlibrary' | 'google'
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [page, setPage] = useState(1);

  const [searchResult, setSearchResult] = useState({
    loading: true,
    books: [],
    total: 0,
    totalPages: 1,
    error: "",
  });

  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState({ type: "", text: "", linkTo: "" });

  // Modal state for selecting / importing a book
  const [selectedBook, setSelectedBook] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importForm, setImportForm] = useState({
    title: "",
    author: "",
    language: "english",
    category: "",
    description: "",
    coverUrl: "",
    pdfUrl: "",
    pages: "",
    externalId: "",
  });
  const [resolvingDetails, setResolvingDetails] = useState(false);

  // Fetch website categories once on mount
  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  // Fetch external books on search / filter / page change
  useEffect(() => {
    let active = true;
    api
      .get("/admin/external-books/search", {
        params: {
          q: activeQuery,
          language,
          category: category !== "all" ? category : undefined,
          source,
          page,
          limit: 16,
        },
      })
      .then(({ data }) => {
        if (active) {
          setSearchResult({
            loading: false,
            books: data.books || [],
            total: data.total || 0,
            totalPages: data.pages || 1,
            error: "",
          });
        }
      })
      .catch((err) => {
        if (active) {
          setSearchResult({
            loading: false,
            books: [],
            total: 0,
            totalPages: 1,
            error: getErrorMessage(err),
          });
        }
      });

    return () => {
      active = false;
    };
  }, [activeQuery, language, category, source, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchResult((s) => ({ ...s, loading: true }));
    setPage(1);
    setActiveQuery(query);
  };

  const handleSuggestionClick = (sug) => {
    setSearchResult((s) => ({ ...s, loading: true }));
    setPage(1);
    const qStr = typeof sug === "string" ? sug : sug.query;
    if (sug.lang) setLanguage(sug.lang);
    setQuery(qStr);
    setActiveQuery(qStr);
  };

  const handlePageChange = (newPage) => {
    setSearchResult((s) => ({ ...s, loading: true }));
    setPage(newPage);
  };

  const handleLanguageChange = (newLang) => {
    setSearchResult((s) => ({ ...s, loading: true }));
    setLanguage(newLang);
    setPage(1);
    setQuery("");
    setActiveQuery("");
  };

  const handleCategoryChange = (newCat) => {
    setSearchResult((s) => ({ ...s, loading: true }));
    setCategory(newCat);
    setPage(1);
    setQuery("");
    setActiveQuery("");
  };

  const handleSourceChange = (newSource) => {
    setSearchResult((s) => ({ ...s, loading: true }));
    setSource(newSource);
    setPage(1);
  };

  // Open modal when admin selects a book
  const handleSelectBook = async (book) => {
    setSelectedBook(book);
    setResolvingDetails(true);

    // Auto-match category from active category filter, book's categoryKey, or fallback
    let defaultCatId = "";
    if (categories.length > 0) {
      const targetSlug = book.categoryKey || (category !== "all" ? category : null);
      if (targetSlug) {
        const cleanTarget = targetSlug.replace(/[^a-z0-9]/g, "");
        const match = categories.find((c) => {
          const cSlug = (c.slug || "").replace(/[^a-z0-9]/g, "");
          const cName = (c.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          return cSlug === cleanTarget || cName === cleanTarget || cSlug.includes(cleanTarget) || cleanTarget.includes(cSlug);
        });
        if (match) defaultCatId = match._id;
      }

      if (!defaultCatId) {
        const fallback = categories.find((c) =>
          c.name.toLowerCase().includes("literature") || c.name.toLowerCase().includes("novel")
        );
        defaultCatId = fallback ? fallback._id : categories[0]._id;
      }
    }

    // Pre-fill form with available data
    setImportForm({
      title: book.title || "",
      author: book.author || "",
      language: book.language || "english",
      category: defaultCatId,
      description: book.description || "",
      coverUrl: book.coverUrl || "",
      pdfUrl: book.pdfUrl || "",
      pages: book.pages ? String(book.pages) : "",
      externalId: book.externalId || "",
    });

    // If source is Internet Archive, resolve exact direct PDF file from archive metadata
    if (book.source === "Internet Archive" && book.externalId) {
      try {
        const { data } = await api.get("/admin/external-books/details", {
          params: { identifier: book.externalId },
        });
        if (data.details) {
          setImportForm((prev) => ({
            ...prev,
            title: prev.title || data.details.title,
            author: prev.author || data.details.author,
            description: prev.description || data.details.description,
            pdfUrl: data.details.pdfUrl || prev.pdfUrl,
            pages: data.details.pages ? String(data.details.pages) : prev.pages,
            coverUrl: data.details.coverUrl || prev.coverUrl,
          }));
        }
      } catch {
        // Fallback already pre-filled
      } finally {
        setResolvingDetails(false);
      }
    } else {
      setResolvingDetails(false);
    }
  };

  // Confirm import and save book to website library
  const handleConfirmImport = async (e) => {
    e.preventDefault();
    setIsImporting(true);
    setToast({ type: "", text: "", linkTo: "" });

    try {
      const { data } = await api.post("/admin/external-books/import", {
        ...importForm,
        pages: importForm.pages ? parseInt(importForm.pages, 10) : undefined,
      });

      // Update book card in state
      setSearchResult((prev) => ({
        ...prev,
        books: prev.books.map((b) =>
          b.externalId === importForm.externalId || b.title === importForm.title
            ? { ...b, alreadyImported: true, existingBookId: data.book._id }
            : b
        ),
      }));

      setToast({
        type: "success",
        text: `"${data.book.title}" was added to the website!`,
        linkTo: `/books/${data.book._id}`,
      });
      setSelectedBook(null);
    } catch (err) {
      setToast({
        type: "error",
        text: getErrorMessage(err),
        linkTo: "",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const { loading, books, total, totalPages, error } = searchResult;

  // Compute suggestions based on active category and language
  const suggestionChips =
    category !== "all" && CATEGORY_SUGGESTIONS[category]
      ? (CATEGORY_SUGGESTIONS[category][language] || CATEGORY_SUGGESTIONS[category].all || []).map((item) => ({
          label: item,
          query: item,
        }))
      : DEFAULT_SUGGESTIONS[language] || DEFAULT_SUGGESTIONS.all;

  const activeCategoryObj = EXTERNAL_CATEGORIES.find((c) => c.id === category) || EXTERNAL_CATEGORIES[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Toast Alert */}
      {toast.text && (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl px-5 py-3.5 text-sm font-medium shadow-md ${
            toast.type === "error"
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-green-50 text-green-900 border border-green-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{toast.type === "error" ? "⚠️" : "✓"}</span>
            <span>{toast.text}</span>
          </div>
          {toast.linkTo && (
            <Link to={toast.linkTo} className="font-bold underline hover:opacity-80">
              View on Website &rarr;
            </Link>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-1">
            <Link to="/admin" className="text-primary hover:underline">
              Admin Dashboard
            </Link>
            <span>/</span>
            <span>Free Books API</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-primary">Discover & Import Books</h1>
          <p className="mt-1 text-sm text-muted">
            Search millions of free public-domain books across English, Urdu, and Pashto. Filter by categories like Biography, Novel, Computer Science, and Dictionaries to select and add them to the website.
          </p>
        </div>

        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-soft"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Category Pills Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            Select Category to Browse ({EXTERNAL_CATEGORIES.length - 1} Special Categories):
          </span>
          {category !== "all" && (
            <button
              type="button"
              onClick={() => handleCategoryChange("all")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear Category Filter
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {EXTERNAL_CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-xs ${
                  isSelected
                    ? "bg-[#0f4c3a] text-white shadow-sm ring-2 ring-[#0f4c3a]/30"
                    : "bg-surface border border-line text-ink hover:bg-soft hover:border-primary/40"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Language Tabs & Source Selector */}
      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-t border-line/50 pt-5">
        {/* Language Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted mr-1">Language:</span>
          {[
            { id: "all", label: "🌐 All Languages" },
            { id: "urdu", label: "🇵🇰 Urdu (اردو)" },
            { id: "pashto", label: "🇦🇫 Pashto (پښتو)" },
            { id: "english", label: "🇬🇧 English" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleLanguageChange(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                language === tab.id
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface border border-line text-ink hover:bg-soft"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Source Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted">Free API Source:</span>
          <select
            value={source}
            onChange={(e) => handleSourceChange(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink outline-none focus:border-primary"
          >
            <option value="archive">Internet Archive (Direct Free PDFs)</option>
            <option value="openlibrary">Open Library</option>
            <option value="google">Google Books</option>
          </select>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${category !== "all" ? activeCategoryObj.label : "all"} books${
              language !== "all" ? ` in ${language}` : ""
            } by title, author, or keyword...`}
            className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveQuery("");
              }}
              className="absolute right-3 top-3 text-sm text-muted hover:text-ink"
            >
              &times;
            </button>
          )}
        </div>
        <button
          type="submit"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-dark transition-colors"
        >
          Search
        </button>
      </form>

      {/* Quick Suggestions Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-medium text-muted">
          {category !== "all" ? `${activeCategoryObj.label} topics:` : "Popular topics:"}
        </span>
        {suggestionChips.map((sug) => (
          <button
            key={typeof sug === "string" ? sug : sug.label}
            type="button"
            onClick={() => handleSuggestionClick(sug)}
            className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink hover:border-primary hover:text-primary transition-colors"
          >
            {typeof sug === "string" ? sug : sug.label}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm font-semibold text-muted">
          {loading ? (
            "Searching free books catalog..."
          ) : (
            <>
              Found <span className="font-bold text-ink">{total.toLocaleString()}</span> books
              {category !== "all" && (
                <>
                  {" "}
                  under <span className="font-bold text-[#0f4c3a]">{activeCategoryObj.label}</span>
                </>
              )}{" "}
              from <span className="font-bold text-primary capitalize">{source}</span>
            </>
          )}
        </p>

        {totalPages > 1 && !loading && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-ink disabled:opacity-40 hover:bg-soft"
            >
              &larr; Prev
            </button>
            <span className="text-xs text-muted">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-ink disabled:opacity-40 hover:bg-soft"
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-semibold">Failed to fetch books from {source}</p>
          <p className="mt-1 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => handlePageChange(page)}
            className="mt-3 rounded-lg bg-red-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-line bg-surface p-4 shadow-xs">
              <div className="h-56 w-full rounded-xl bg-soft" />
              <div className="mt-4 h-4 w-3/4 rounded bg-soft" />
              <div className="mt-2 h-3 w-1/2 rounded bg-soft" />
              <div className="mt-4 h-9 w-full rounded-lg bg-soft" />
            </div>
          ))}
        </div>
      )}

      {/* Books Grid */}
      {!loading && !error && books.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => {
            const isRTL = book.language === "urdu" || book.language === "pashto";

            return (
              <div
                key={book.externalId}
                className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 shadow-xs hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div>
                  {/* Book Cover Container */}
                  <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl bg-soft flex items-center justify-center">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div
                      className={`${
                        book.coverUrl ? "hidden" : ""
                      } flex flex-col items-center justify-center p-4 text-center`}
                    >
                      <svg className="h-10 w-10 text-muted/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                      <span className="mt-2 text-xs font-semibold text-muted line-clamp-2">{book.title}</span>
                    </div>

                    {/* Language Badge */}
                    <span
                      className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs ${
                        book.language === "urdu"
                          ? "bg-emerald-700"
                          : book.language === "pashto"
                          ? "bg-amber-700"
                          : "bg-blue-700"
                      }`}
                    >
                      {book.language}
                    </span>

                    {/* Already Imported Badge */}
                    {book.alreadyImported && (
                      <span className="absolute right-2 top-2 rounded-md bg-green-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                        ✓ In Library
                      </span>
                    )}
                  </div>

                  {/* Title & Author */}
                  <h3
                    dir={isRTL ? "rtl" : "ltr"}
                    className={`mt-3 font-bold text-ink line-clamp-2 ${
                      isRTL ? "font-arabic text-base" : "text-sm"
                    }`}
                  >
                    {book.title}
                  </h3>
                  <p dir={isRTL ? "rtl" : "ltr"} className="mt-0.5 text-xs text-muted line-clamp-1">
                    {book.author}
                  </p>

                  {/* Year & Source */}
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                    <span>{book.year ? `Year: ${book.year}` : book.source}</span>
                    {book.downloads > 0 && <span>{book.downloads.toLocaleString()} reads</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-line/60">
                  {book.alreadyImported ? (
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/books/${book.existingBookId}`}
                        className="flex-1 rounded-lg border border-primary bg-primary/10 py-2 text-center text-xs font-bold text-primary hover:bg-primary/20"
                      >
                        View in Library &rarr;
                      </Link>
                      <Link
                        to={`/read/${book.existingBookId}`}
                        className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-dark"
                        title="Read PDF"
                      >
                        Read
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectBook(book)}
                        className="flex-1 rounded-lg bg-primary py-2 text-center text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>+</span>
                        <span>Select & Add to Website</span>
                      </button>

                      {book.pdfUrl && (
                        <a
                          href={book.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-line bg-surface px-2.5 py-2 text-xs font-semibold text-muted hover:text-ink hover:bg-soft"
                          title="Preview external PDF"
                        >
                          PDF
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && books.length === 0 && (
        <div className="mt-12 rounded-2xl border border-line bg-surface p-12 text-center">
          <p className="text-lg font-bold text-primary">No books found</p>
          <p className="mt-1 text-sm text-muted">
            Try a different search query or select another category or language tab.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory("all");
              setLanguage("all");
              setQuery("");
              setActiveQuery("");
            }}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-dark"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Modal: Select & Review Book to Add to Website */}
      {selectedBook && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-line bg-surface p-6 shadow-2xl animate-in fade-in sm:p-8">
            <button
              type="button"
              onClick={() => setSelectedBook(null)}
              className="absolute right-4 top-4 text-xl font-bold text-muted hover:text-ink"
            >
              &times;
            </button>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-soft px-3 py-1 text-xs font-bold text-primary uppercase">
                {selectedBook.source}
              </span>
              <h2 className="text-xl font-bold font-display text-ink">Add Book to Website Catalog</h2>
            </div>
            <p className="mt-1 text-xs text-muted">
              Review and adjust the book details. Once saved, it will immediately be live for all Kitab Aura readers under the selected category.
            </p>

            {resolvingDetails && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-soft p-2.5 text-xs text-primary font-semibold">
                <span className="animate-spin">&#9696;</span>
                <span>Resolving full PDF file from library repository...</span>
              </div>
            )}

            <form onSubmit={handleConfirmImport} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-ink">Book Title *</label>
                  <input
                    type="text"
                    required
                    value={importForm.title}
                    onChange={(e) => setImportForm({ ...importForm, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-xs font-bold text-ink">Author / Writer *</label>
                  <input
                    type="text"
                    required
                    value={importForm.author}
                    onChange={(e) => setImportForm({ ...importForm, author: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="block text-xs font-bold text-ink">Language *</label>
                  <select
                    required
                    value={importForm.language}
                    onChange={(e) => setImportForm({ ...importForm, language: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                  >
                    <option value="urdu">Urdu (اردو)</option>
                    <option value="pashto">Pashto (پښتو)</option>
                    <option value="english">English</option>
                    <option value="arabic">Arabic</option>
                    <option value="persian">Persian</option>
                  </select>
                </div>

                {/* Website Category */}
                <div>
                  <label className="block text-xs font-bold text-ink">Website Category *</label>
                  <select
                    required
                    value={importForm.category}
                    onChange={(e) => setImportForm({ ...importForm, category: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.nameUrdu ? `(${c.nameUrdu})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pages */}
                <div>
                  <label className="block text-xs font-bold text-ink">Estimated Pages</label>
                  <input
                    type="number"
                    min="1"
                    value={importForm.pages}
                    onChange={(e) => setImportForm({ ...importForm, pages: e.target.value })}
                    placeholder="e.g. 150"
                    className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                  />
                </div>

                {/* PDF URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-ink">Direct PDF Link *</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={importForm.pdfUrl}
                      onChange={(e) => setImportForm({ ...importForm, pdfUrl: e.target.value })}
                      placeholder="https://..."
                      className="mt-1 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink outline-none focus:border-primary"
                    />
                    {importForm.pdfUrl && (
                      <a
                        href={importForm.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 rounded-xl border border-line bg-soft px-3 py-2 text-xs font-semibold text-primary hover:bg-line/40"
                      >
                        Test Link
                      </a>
                    )}
                  </div>
                </div>

                {/* Cover Image URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-ink">Cover Image URL</label>
                  <input
                    type="url"
                    value={importForm.coverUrl}
                    onChange={(e) => setImportForm({ ...importForm, coverUrl: e.target.value })}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink outline-none focus:border-primary"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-ink">Description</label>
                  <textarea
                    rows={3}
                    value={importForm.description}
                    onChange={(e) => setImportForm({ ...importForm, description: e.target.value })}
                    placeholder="A brief summary or background of the book..."
                    className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedBook(null)}
                  className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-ink hover:bg-soft"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting || !importForm.pdfUrl}
                  className="rounded-xl bg-primary px-6 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-dark disabled:opacity-40 flex items-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <span className="animate-spin">&#9696;</span>
                      <span>Adding to Website...</span>
                    </>
                  ) : (
                    <span>✓ Add to Website Library</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
