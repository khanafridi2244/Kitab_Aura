const CODES = { pashto: "ps", urdu: "ur", english: "en", arabic: "ar", persian: "fa" };

// The HTML lang code for a book's language: lang={langCode(book.language)}
export const langCode = (language) => CODES[language];