/**
 * Service to search and fetch public-domain and open-access books
 * for English, Urdu, and Pashto languages from free APIs (Internet Archive, Open Library, Google Books).
 */

const DEFAULT_POPULAR_QUERIES = {
  urdu: "ghalib OR iqbal OR adab OR shairi OR tareekh OR afsane",
  pashto: "pashto OR pukhto OR khushal OR afghanistan OR dewan OR tareekh",
  english: "classic literature OR fiction OR history OR philosophy OR science",
  all: "literature OR poetry OR history",
};

/**
 * Clean text from HTML tags or excessive whitespace
 */
function cleanText(text = "") {
  if (Array.isArray(text)) text = text.join(", ");
  return String(text)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Searches the Internet Archive (archive.org) for books with PDF files.
 * Archive.org is the premier free source for genuine Urdu, Pashto, and English digitized books.
 */
export async function searchInternetArchive({ query = "", language = "all", page = 1, limit = 16 }) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const rows = Math.min(50, Math.max(1, parseInt(limit, 10) || 16));

  // Determine query text
  const cleanQ = query.trim();
  const baseQuery = cleanQ || (DEFAULT_POPULAR_QUERIES[language] || DEFAULT_POPULAR_QUERIES.all);

  // Language filter clause
  let langClause = "";
  if (language === "urdu") {
    langClause = "(language:urdu OR language:urd)";
  } else if (language === "pashto") {
    langClause = "(language:pashto OR language:pus)";
  } else if (language === "english") {
    langClause = "(language:english OR language:eng)";
  } else {
    langClause = "(language:urdu OR language:urd OR language:pashto OR language:pus OR language:english OR language:eng)";
  }

  // Search texts with format:pdf
  const searchFilter = `(${baseQuery}) AND ${langClause} AND format:pdf AND mediatype:texts`;
  const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(
    searchFilter
  )}&fl[]=identifier,title,creator,description,year,language,publicdate,downloads&sort[]=downloads+desc&rows=${rows}&page=${pageNum}&output=json`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Internet Archive search failed with status ${res.status}`);
  }

  const data = await res.json();
  const docs = data.response?.docs || [];
  const total = data.response?.numFound || 0;

  const results = docs.map((doc) => {
    // Detect item language
    let docLang = "english";
    const rawLang = Array.isArray(doc.language) ? doc.language.join(" ") : String(doc.language || "");
    const lowerLang = rawLang.toLowerCase();
    if (lowerLang.includes("urd") || language === "urdu") {
      docLang = "urdu";
    } else if (lowerLang.includes("pus") || lowerLang.includes("pashto") || language === "pashto") {
      docLang = "pashto";
    }

    const title = cleanText(doc.title) || "Untitled Book";
    const author = cleanText(doc.creator) || "Unknown Author";
    const desc = cleanText(doc.description);
    const identifier = doc.identifier;

    return {
      externalId: identifier,
      source: "Internet Archive",
      title,
      author,
      language: docLang,
      year: doc.year || (doc.publicdate ? doc.publicdate.substring(0, 4) : ""),
      description: desc.length > 500 ? desc.substring(0, 500) + "..." : desc,
      coverUrl: `https://archive.org/services/img/${identifier}`,
      // Standard direct PDF URL on Internet Archive
      pdfUrl: `https://archive.org/download/${identifier}/${identifier}.pdf`,
      detailsUrl: `https://archive.org/details/${identifier}`,
      downloads: doc.downloads || 0,
    };
  });

  return {
    total,
    page: pageNum,
    pages: Math.ceil(total / rows),
    books: results,
  };
}

/**
 * Searches Google Books API
 */
export async function searchGoogleBooks({ query = "", language = "all", page = 1, limit = 16 }) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const rows = Math.min(40, Math.max(1, parseInt(limit, 10) || 16));
  const startIndex = (pageNum - 1) * rows;

  const langRestrict = language === "urdu" ? "ur" : language === "pashto" ? "ps" : language === "english" ? "en" : "";
  const cleanQ = query.trim() || (language === "urdu" ? "urdu literature" : language === "pashto" ? "pashto poetry" : "classic literature");

  let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(cleanQ)}&startIndex=${startIndex}&maxResults=${rows}`;
  if (langRestrict) {
    url += `&langRestrict=${langRestrict}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Google Books API failed with status ${res.status}`);
  }

  const data = await res.json();
  const items = data.items || [];
  const total = data.totalItems || 0;

  const results = items.map((item) => {
    const info = item.volumeInfo || {};
    const access = item.accessInfo || {};

    let docLang = language !== "all" ? language : info.language === "ur" ? "urdu" : info.language === "ps" ? "pashto" : "english";
    const title = cleanText(info.title) || "Untitled Book";
    const author = Array.isArray(info.authors) ? info.authors.join(", ") : info.authors || "Unknown Author";
    const coverUrl = info.imageLinks?.thumbnail?.replace("http://", "https://") || "";
    const pdfUrl = access.pdf?.downloadLink || access.pdf?.acsTokenLink || access.webReaderLink || "";

    return {
      externalId: item.id,
      source: "Google Books",
      title,
      author,
      language: docLang,
      year: info.publishedDate ? info.publishedDate.substring(0, 4) : "",
      pages: info.pageCount || undefined,
      description: cleanText(info.description) || "",
      coverUrl,
      pdfUrl,
      detailsUrl: info.infoLink || info.previewLink || "",
      downloads: 0,
    };
  });

  return {
    total,
    page: pageNum,
    pages: Math.ceil(total / rows),
    books: results,
  };
}

/**
 * Searches Open Library API
 */
export async function searchOpenLibrary({ query = "", language = "all", page = 1, limit = 16 }) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const rows = Math.min(50, Math.max(1, parseInt(limit, 10) || 16));

  const langCode = language === "urdu" ? "urd" : language === "pashto" ? "pus" : language === "english" ? "eng" : "";
  const cleanQ = query.trim() || (language === "urdu" ? "urdu poetry" : language === "pashto" ? "pashto" : "literature");

  let url = `https://openlibrary.org/search.json?q=${encodeURIComponent(cleanQ)}&page=${pageNum}&limit=${rows}`;
  if (langCode) {
    url += `&language=${langCode}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open Library API failed with status ${res.status}`);
  }

  const data = await res.json();
  const docs = data.docs || [];
  const total = data.numFound || 0;

  const results = docs.map((doc) => {
    let docLang = language !== "all" ? language : "english";
    const title = cleanText(doc.title) || "Untitled Book";
    const author = Array.isArray(doc.author_name) ? doc.author_name.join(", ") : "Unknown Author";
    const iaId = Array.isArray(doc.ia) && doc.ia.length > 0 ? doc.ia[0] : null;

    const coverUrl = doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : iaId
      ? `https://archive.org/services/img/${iaId}`
      : "";

    const pdfUrl = iaId ? `https://archive.org/download/${iaId}/${iaId}.pdf` : "";

    return {
      externalId: iaId || doc.key || `ol_${Date.now()}`,
      source: "Open Library",
      title,
      author,
      language: docLang,
      year: doc.first_publish_year ? String(doc.first_publish_year) : "",
      pages: doc.number_of_pages_median || undefined,
      description: doc.first_sentence ? doc.first_sentence.join(" ") : "",
      coverUrl,
      pdfUrl,
      detailsUrl: iaId ? `https://archive.org/details/${iaId}` : `https://openlibrary.org${doc.key}`,
      downloads: doc.readinglog_count || 0,
    };
  });

  return {
    total,
    page: pageNum,
    pages: Math.ceil(total / rows),
    books: results,
  };
}

/**
 * Resolves precise files metadata for an Internet Archive identifier to obtain the primary PDF file.
 */
export async function getArchiveItemDetails(identifier) {
  try {
    const metaRes = await fetch(`https://archive.org/metadata/${encodeURIComponent(identifier)}`);
    if (!metaRes.ok) return null;
    const metaData = await metaRes.json();

    const files = metaData.files || [];
    const pdfFiles = files.filter((f) => f.name && f.name.toLowerCase().endsWith(".pdf"));

    // Find the best quality PDF (exclude _text.pdf, _chocr.pdf, _bw.pdf if clean pdf exists)
    let bestPdf = pdfFiles.find(
      (f) => !f.name.includes("_text") && !f.name.includes("_chocr") && !f.name.includes("_bw")
    );
    if (!bestPdf && pdfFiles.length > 0) {
      bestPdf = pdfFiles[0];
    }

    const title = cleanText(metaData.metadata?.title) || "";
    const author = cleanText(metaData.metadata?.creator) || "";
    const description = cleanText(metaData.metadata?.description) || "";
    const year = metaData.metadata?.year || (metaData.metadata?.publicdate ? metaData.metadata.publicdate.substring(0, 4) : "");
    const pages = bestPdf?.pages ? parseInt(bestPdf.pages, 10) : undefined;

    const directPdfUrl = bestPdf
      ? `https://archive.org/download/${identifier}/${encodeURIComponent(bestPdf.name)}`
      : `https://archive.org/download/${identifier}/${identifier}.pdf`;

    return {
      identifier,
      title,
      author,
      description,
      year,
      pages,
      pdfUrl: directPdfUrl,
      coverUrl: `https://archive.org/services/img/${identifier}`,
    };
  } catch (err) {
    console.error("Failed to fetch archive item details:", err.message);
    return null;
  }
}

