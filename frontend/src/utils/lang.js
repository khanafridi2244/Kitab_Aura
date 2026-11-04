const CODES = { pashto: "ps", urdu: "ur", english: "en", arabic: "ar", persian: "fa" };

// The HTML lang code for a book's language: lang={langCode(book.language)}
export const langCode = (language) => CODES[language];

// Text in Arabic script (Urdu, Pashto, Arabic, Persian) gets the Arabic-script font.
// Use together with dir="auto" so the text direction follows the text
export const scriptLang = (text) => (/[\u0600-\u06FF]/.test(text || "") ? "ar" : undefined);