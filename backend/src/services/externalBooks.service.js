/**
 * Service to search and fetch public-domain and open-access books
 * for English, Urdu, and Pashto languages from free APIs (Internet Archive, Open Library, Google Books).
 *
 * Supports dedicated queries for categories:
 * - Biography
 * - Novel
 * - Art & Culture
 * - Business & Management
 * - Children's Books
 * - Computer Science
 * - Dictionaries
 * - Drama & Plays
 * - Economics
 */

export const SUPPORTED_EXTERNAL_CATEGORIES = [
  {
    key: "biography",
    label: "Biography",
    labelUrdu: "سوانح حیات",
    labelPashto: "ژوندلیک",
    icon: "👤",
    aliases: ["biography", "autobiography", "memoir", "seerat", "sawaneh", "life of"],
    archiveFilter: '(subject:biography OR title:biography OR title:autobiography OR title:seerat OR title:sawaneh OR title:hayat)',
    archiveLangOverrides: {
      urdu: '(subject:biography OR title:seerat OR title:sawaneh OR title:hayat OR "سوانح" OR "سیرت")',
      pashto: '(pashto OR pukhto) AND (jwand OR sawaneh OR tareekh OR baba OR "ژوندلیک")',
    },
    googleSubject: "biography",
    openLibrarySubject: "biography",
    popularQueries: {
      english: ["Albert Einstein", "Abraham Lincoln", "Steve Jobs", "Winston Churchill", "Autobiography of Benjamin Franklin"],
      urdu: ["Seerat un Nabi", "Hayat e Ghalib", "Yadgar e Ghalib", "Hayat Us Sahaba", "Aab e Hayat"],
      pashto: ["Da Rahman Baba Jwand", "Khushal Khan Sawaneh", "Bacha Khan", "Ahmad Shah Baba", "Da Pashtano Tareekh"],
      all: ["Biography", "Autobiography", "Seerat un Nabi", "Sawaneh"],
    },
  },
  {
    key: "novel",
    label: "Novel",
    labelUrdu: "ناول",
    labelPashto: "ناول",
    icon: "📖",
    aliases: ["novel", "novels", "fiction", "noval", "short stories"],
    archiveFilter: '(subject:novel OR title:novel OR subject:fiction OR subject:"short stories" OR afsana)',
    archiveLangOverrides: {
      urdu: '(subject:novel OR title:novel OR subject:fiction OR afsana OR dastan OR "اردو ناول")',
      pashto: '(pashto OR pukhto) AND (novel OR qissay OR dastan OR adab OR "پښتو ناول")',
    },
    googleSubject: "fiction",
    openLibrarySubject: "fiction",
    popularQueries: {
      english: ["Pride and Prejudice", "Great Expectations", "War and Peace", "Sherlock Holmes", "Jane Eyre"],
      urdu: ["Umrao Jan Ada", "Mirat ul Uroos", "Aag Ka Darya", "Peer e Kamil", "Jannat K Pattay"],
      pashto: ["Dewan e Rahman Baba", "Pashto Adab", "Da Qissa Khani Qissay", "Patan", "Zama Jwand"],
      all: ["Classic Novel", "Fiction", "Urdu Novel", "Pride and Prejudice"],
    },
  },
  {
    key: "art-culture",
    label: "Art & Culture",
    labelUrdu: "فن اور ثقافت",
    labelPashto: "هنر او کلتور",
    icon: "🎨",
    aliases: ["art-culture", "art & culture", "art and culture", "art", "culture"],
    archiveFilter: '(subject:art OR subject:culture OR title:"art and culture" OR title:culture OR title:saqafat OR subject:"fine arts")',
    archiveLangOverrides: {
      urdu: '(title:saqafat OR title:tamaddun OR title:funoon OR "ثقافت" OR "فن")',
      pashto: '(pashto OR pukhto) AND (saqafat OR riwaj OR folklore OR "کلتور")',
    },
    googleSubject: "art",
    openLibrarySubject: "art",
    popularQueries: {
      english: ["History of Art", "Renaissance Art", "World Cultures", "Architecture", "Islamic Art"],
      urdu: ["Hindustani Saqafat", "Islami Funoon", "Tehzeeb o Tamaddun", "Urdu Qalamkaran", "Mughal Art"],
      pashto: ["Pashtun Culture", "Pashtunwali", "Da Pashto Saqafat", "Pashto Folklore", "Da Pukhtano Riwajuna"],
      all: ["Art and Culture", "Islamic Art", "Cultural History", "Architecture"],
    },
  },
  {
    key: "business-management",
    label: "Business & Management",
    labelUrdu: "کاروبار اور انتظام",
    labelPashto: "سوداګري او اداره",
    icon: "💼",
    aliases: ["business-management", "business & management", "business and management", "business", "management"],
    archiveFilter: '(subject:business OR subject:management OR title:"business" OR title:management OR title:leadership OR subject:commerce)',
    archiveLangOverrides: {
      urdu: '(title:karobar OR title:tijarat OR title:qayadat OR "کاروبار" OR "تجارت")',
      pashto: '(pashto OR pukhto) AND (tijarat OR karobar OR eqtesad OR "سوداګري")',
    },
    googleSubject: "business",
    openLibrarySubject: "business",
    popularQueries: {
      english: ["Principles of Management", "Leadership", "Business Strategy", "Marketing Management", "Entrepreneurship"],
      urdu: ["Karobari Rahnuma", "Tijarat o Karobar", "Qayadat Aur Intizamia", "Business Management", "Kamyab Karobar"],
      pashto: ["Tijarat", "Da Karobar Usul", "Intizamia", "Leadership", "Eqtesad aw Karobar"],
      all: ["Business Management", "Leadership", "Marketing", "Entrepreneurship"],
    },
  },
  {
    key: "children-s-books",
    label: "Children's Books",
    labelUrdu: "بچوں کی کتب",
    labelPashto: "د ماشومانو کتابونه",
    icon: "🧸",
    aliases: ["children-s-books", "children-books", "childrens-books", "children books", "children's books", "kids"],
    archiveFilter: '(subject:children OR subject:"juvenile fiction" OR title:"children" OR title:"fairy tales" OR title:bachon)',
    archiveLangOverrides: {
      urdu: '(title:bachon OR title:kahaniyan OR "بچوں کی کہانیاں" OR "کہانی")',
      pashto: '(pashto OR pukhto) AND (mashoman OR mashomano OR qissay OR "ماشومان")',
    },
    googleSubject: "juvenile fiction",
    openLibrarySubject: "children",
    popularQueries: {
      english: ["Fairy Tales", "Alice in Wonderland", "Aesop Fables", "Peter Pan", "Grimm Fairy Tales"],
      urdu: ["Bachon Ki Kahaniyan", "Nazmein Bachon Ke Liye", "Tot Batot", "Chacha Chakkan", "Alif Laila"],
      pashto: ["Da Mashomano Qissay", "Da Mashomano Nazmona", "Mashoman", "Pukhto Qissay", "Mashomano Adab"],
      all: ["Children Books", "Fairy Tales", "Alice in Wonderland", "Bachon Ki Kahaniyan"],
    },
  },
  {
    key: "computer-science",
    label: "Computer Science",
    labelUrdu: "کمپیوٹر سائنس",
    labelPashto: "کمپیوټر ساینس",
    icon: "💻",
    aliases: ["computer-science", "computer science", "cs", "computers", "programming"],
    archiveFilter: '(subject:"computer science" OR title:"computer science" OR subject:programming OR title:programming OR subject:algorithms)',
    archiveLangOverrides: {
      urdu: '(title:computer OR "کمپیوٹر سائنس" OR "پروگرامنگ")',
      pashto: '(title:computer OR "کمپیوټر")',
    },
    googleSubject: "computer science",
    openLibrarySubject: "computer_science",
    popularQueries: {
      english: ["Python Programming", "Introduction to Algorithms", "Computer Networks", "Database Systems", "Operating Systems"],
      urdu: ["Computer Science", "Information Technology", "Computer Ke Bunyadi Usul", "Programming", "Software Engineering"],
      pashto: ["Computer Science", "Da Computer Zaba", "Information Technology", "Da Computer Asasiyat", "Programming"],
      all: ["Computer Science", "Python Programming", "Algorithms", "Database Systems"],
    },
  },
  {
    key: "dictionaries",
    label: "Dictionaries",
    labelUrdu: "لغات و فرہنگ",
    labelPashto: "قاموسونه او لغاتونه",
    icon: "📚",
    aliases: ["dictionaries", "dictionary", "lexicon", "vocabulary", "lughat", "qamoos"],
    archiveFilter: '(subject:dictionary OR subject:dictionaries OR title:dictionary OR title:dictionaries OR title:lughat OR title:qamoos OR title:farhang)',
    archiveLangOverrides: {
      urdu: '(title:lughat OR title:farhang OR title:dictionary OR "لغت" OR "فرہنگ")',
      pashto: '(title:qamoos OR title:lughat OR title:dictionary OR "قاموس" OR "لغت")',
    },
    googleSubject: "dictionaries",
    openLibrarySubject: "dictionaries",
    popularQueries: {
      english: ["Oxford English Dictionary", "Webster Dictionary", "English Etymology", "Roget Thesaurus", "Greek Latin Lexicon"],
      urdu: ["Feroz Ul Lughat", "Farhang e Asifiya", "Noor ul Lughat", "Jame ul Lughat", "Urdu English Dictionary"],
      pashto: ["Daryab Pashto Qamoos", "Pashto English Dictionary", "Afghan Qamoos", "Pukhto Lughat", "English to Pashto"],
      all: ["Dictionary", "Urdu English Dictionary", "Pashto Qamoos", "Oxford Dictionary"],
    },
  },
  {
    key: "drama-plays",
    label: "Drama & Plays",
    labelUrdu: "ڈراما اور ڈرامے",
    labelPashto: "ډرامه او تمثیل",
    icon: "🎭",
    aliases: ["drama-plays", "drama and plays", "dramas-and-plays", "drama & plays", "drama", "plays"],
    archiveFilter: '(subject:drama OR subject:plays OR title:drama OR title:plays OR subject:theatre OR subject:playwright)',
    archiveLangOverrides: {
      urdu: '(title:drama OR title:natak OR "ڈراما" OR "ناٹک")',
      pashto: '(pashto OR pukhto) AND (drama OR natak OR tamseel OR "ډرامه")',
    },
    googleSubject: "drama",
    openLibrarySubject: "drama",
    popularQueries: {
      english: ["Shakespeare Plays", "Hamlet", "Macbeth", "Oedipus Rex", "A Doll's House"],
      urdu: ["Anarkali Drama", "Agha Hashar Kashmiri", "Urdu Dramey", "Rustam o Sohrab", "Khawaja Moinuddin Dramey"],
      pashto: ["Pashto Drama", "Da Pukhto Natak", "Hamza Baba Drama", "Pashto Theatre", "Da Meenay Qissa"],
      all: ["Drama and Plays", "Shakespeare", "Hamlet", "Urdu Drama"],
    },
  },
  {
    key: "economics",
    label: "Economics",
    labelUrdu: "معاشیات و اقتصادیات",
    labelPashto: "اقتصاد",
    icon: "📈",
    aliases: ["economics", "economy", "finance", "ecnonmics", "maashiyat", "eqtesad"],
    archiveFilter: '(subject:economics OR title:economics OR subject:economy OR title:economy OR title:finance OR subject:"political economy")',
    archiveLangOverrides: {
      urdu: '(title:maashiyat OR title:iqtesad OR "معاشیات" OR "اقتصادیات")',
      pashto: '(pashto OR pukhto) AND (eqtesad OR maashiyat OR "اقتصاد")',
    },
    googleSubject: "economics",
    openLibrarySubject: "economics",
    popularQueries: {
      english: ["Wealth of Nations", "Principles of Economics", "Macroeconomics", "Microeconomics", "Capitalism and Freedom"],
      urdu: ["Ilm e Maashiyat", "Islami Maashiyat", "Maashi Tareekh", "Maashiyat Ke Usul", "Pakistan Ki Maashiyat"],
      pashto: ["Da Eqtesad Usul", "Eqtesad", "Da Afghanistan Eqtesad", "Maashi Nizam", "Da Pukhtano Eqtesad"],
      all: ["Economics", "Principles of Economics", "Wealth of Nations", "Finance"],
    },
  },
];

export function findCategoryDef(catQueryOrSlug = "") {
  if (!catQueryOrSlug) return null;
  const raw = String(catQueryOrSlug).toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  return (
    SUPPORTED_EXTERNAL_CATEGORIES.find((cat) => {
      if (cat.key.replace(/[^a-z0-9]/g, "") === raw) return true;
      if (cat.label.toLowerCase().replace(/[^a-z0-9]/g, "") === raw) return true;
      return cat.aliases.some((a) => a.toLowerCase().replace(/[^a-z0-9]/g, "") === raw);
    }) || null
  );
}

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
 * Supports language, category, and text query filtering.
 */
export async function searchInternetArchive({
  query = "",
  language = "all",
  category = "",
  page = 1,
  limit = 16,
}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const rows = Math.min(50, Math.max(1, parseInt(limit, 10) || 16));

  const cleanQ = query.trim();
  const catDef = findCategoryDef(category);

  // Build query
  let baseQuery = "";
  if (cleanQ && catDef) {
    const filter =
      (language !== "all" && catDef.archiveLangOverrides?.[language]) ||
      catDef.archiveFilter;
    baseQuery = `(${cleanQ}) AND ${filter}`;
  } else if (cleanQ) {
    baseQuery = cleanQ;
  } else if (catDef) {
    const filter =
      (language !== "all" && catDef.archiveLangOverrides?.[language]) ||
      catDef.archiveFilter;
    baseQuery = filter;
  } else {
    baseQuery = DEFAULT_POPULAR_QUERIES[language] || DEFAULT_POPULAR_QUERIES.all;
  }

  // Language filter clause
  let langClause = "";
  if (language === "urdu") {
    langClause = "(language:urdu OR language:urd)";
  } else if (language === "pashto") {
    langClause = "(language:pashto OR language:pus)";
  } else if (language === "english") {
    langClause = "(language:english OR language:eng)";
  } else {
    langClause =
      "(language:urdu OR language:urd OR language:pashto OR language:pus OR language:english OR language:eng)";
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
      categoryKey: catDef ? catDef.key : undefined,
      categoryLabel: catDef ? catDef.label : undefined,
      year: doc.year || (doc.publicdate ? doc.publicdate.substring(0, 4) : ""),
      description: desc.length > 500 ? desc.substring(0, 500) + "..." : desc,
      coverUrl: `https://archive.org/services/img/${identifier}`,
      pdfUrl: `https://archive.org/download/${identifier}/${identifier}.pdf`,
      detailsUrl: `https://archive.org/details/${identifier}`,
      downloads: doc.downloads || 0,
    };
  });

  return {
    total,
    page: pageNum,
    pages: Math.ceil(total / rows),
    category: catDef ? catDef.key : null,
    categoryInfo: catDef || null,
    books: results,
  };
}

/**
 * Searches Google Books API
 */
export async function searchGoogleBooks({
  query = "",
  language = "all",
  category = "",
  page = 1,
  limit = 16,
}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const rows = Math.min(40, Math.max(1, parseInt(limit, 10) || 16));
  const startIndex = (pageNum - 1) * rows;

  const catDef = findCategoryDef(category);
  const langRestrict = language === "urdu" ? "ur" : language === "pashto" ? "ps" : language === "english" ? "en" : "";

  let cleanQ = query.trim();
  if (!cleanQ && catDef) {
    const langKey = language === "urdu" ? "urdu" : language === "pashto" ? "pashto" : language === "english" ? "english" : "all";
    cleanQ = (catDef.popularQueries[langKey] || catDef.popularQueries.all)[0] || catDef.label;
  } else if (!cleanQ) {
    cleanQ = language === "urdu" ? "urdu literature" : language === "pashto" ? "pashto poetry" : "classic literature";
  }

  if (catDef && catDef.googleSubject && !cleanQ.toLowerCase().includes("subject:")) {
    cleanQ = `${cleanQ} subject:${catDef.googleSubject}`;
  }

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
      categoryKey: catDef ? catDef.key : undefined,
      categoryLabel: catDef ? catDef.label : undefined,
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
    category: catDef ? catDef.key : null,
    categoryInfo: catDef || null,
    books: results,
  };
}

/**
 * Searches Open Library API
 */
export async function searchOpenLibrary({
  query = "",
  language = "all",
  category = "",
  page = 1,
  limit = 16,
}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const rows = Math.min(50, Math.max(1, parseInt(limit, 10) || 16));

  const catDef = findCategoryDef(category);
  const langCode = language === "urdu" ? "urd" : language === "pashto" ? "pus" : language === "english" ? "eng" : "";

  let cleanQ = query.trim();
  if (!cleanQ && catDef) {
    const langKey = language === "urdu" ? "urdu" : language === "pashto" ? "pashto" : language === "english" ? "english" : "all";
    cleanQ = (catDef.popularQueries[langKey] || catDef.popularQueries.all)[0] || catDef.label;
  } else if (!cleanQ) {
    cleanQ = language === "urdu" ? "urdu poetry" : language === "pashto" ? "pashto" : "literature";
  }

  let url = `https://openlibrary.org/search.json?q=${encodeURIComponent(cleanQ)}&page=${pageNum}&limit=${rows}`;
  if (catDef && catDef.openLibrarySubject) {
    url += `&subject=${encodeURIComponent(catDef.openLibrarySubject)}`;
  }
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
      categoryKey: catDef ? catDef.key : undefined,
      categoryLabel: catDef ? catDef.label : undefined,
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
    category: catDef ? catDef.key : null,
    categoryInfo: catDef || null,
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
