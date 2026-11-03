import "dotenv/config";
import mongoose from "mongoose";
import Category from "../src/models/Category.js";

const categories = [
  // Literature
  { name: "Poetry", nameUrdu: "شاعری", namePashto: "شاعري" },
  { name: "Novel", nameUrdu: "ناول", namePashto: "ناول" },
  { name: "Short Stories", nameUrdu: "افسانے", namePashto: "لنډې کیسې" },
  { name: "Drama & Plays", nameUrdu: "ڈرامہ", namePashto: "ډرامه" },
  { name: "Humor & Satire", nameUrdu: "طنز و مزاح", namePashto: "طنز او مزاح" },
  { name: "Folk Tales", nameUrdu: "لوک کہانیاں", namePashto: "ولسي کیسې" },
  { name: "Literature", nameUrdu: "ادب", namePashto: "ادب" },
  { name: "Children's Books", nameUrdu: "بچوں کی کتابیں", namePashto: "د ماشومانو کتابونه" },

  // Religion
  { name: "Islamic Studies", nameUrdu: "اسلامیات", namePashto: "اسلامي زده کړې" },
  { name: "Quran & Tafseer", nameUrdu: "قرآن و تفسیر", namePashto: "قرآن او تفسیر" },
  { name: "Hadith", nameUrdu: "حدیث", namePashto: "حدیث" },
  { name: "Sufism", nameUrdu: "تصوف", namePashto: "تصوف" },

  // History, people and society
  { name: "History", nameUrdu: "تاریخ", namePashto: "تاریخ" },
  { name: "Biography", nameUrdu: "سوانح عمری", namePashto: "ژوندلیک" },
  { name: "Pashtun Culture", nameUrdu: "پشتون ثقافت", namePashto: "پښتون کلتور" },
  { name: "Art & Culture", nameUrdu: "فن و ثقافت", namePashto: "هنر او کلتور" },
  { name: "Travel", nameUrdu: "سفرنامہ", namePashto: "سفرنامه" },
  { name: "Politics", nameUrdu: "سیاست", namePashto: "سیاست" },
  { name: "Law", nameUrdu: "قانون", namePashto: "قانون" },
  { name: "Economics", nameUrdu: "معاشیات", namePashto: "اقتصاد" },
  { name: "Business & Management", nameUrdu: "کاروبار", namePashto: "سوداګري" },
  { name: "Philosophy", nameUrdu: "فلسفہ", namePashto: "فلسفه" },

  // Education and science
  { name: "Textbooks", nameUrdu: "درسی کتب", namePashto: "درسي کتابونه" },
  { name: "Education", nameUrdu: "تعلیم", namePashto: "تعلیم" },
  { name: "Science", nameUrdu: "سائنس", namePashto: "ساینس" },
  { name: "Mathematics", nameUrdu: "ریاضی", namePashto: "ریاضي" },
  { name: "Computer Science", nameUrdu: "کمپیوٹر سائنس", namePashto: "کمپیوټر ساینس" },
  { name: "Health & Medicine", nameUrdu: "صحت و طب", namePashto: "روغتیا او طب" },
  { name: "Research & Journals", nameUrdu: "تحقیق", namePashto: "څیړنه" },

  // Language and self-improvement
  { name: "Grammar & Language Learning", nameUrdu: "زبان و قواعد", namePashto: "ژبه او ګرامر" },
  { name: "Dictionaries", nameUrdu: "لغت", namePashto: "قاموس" },
  { name: "Self Development", nameUrdu: "ذاتی ترقی", namePashto: "شخصي پرمختګ" },
];

try {
  await mongoose.connect(process.env.MONGO_URI);

  let added = 0;
  let skipped = 0;

  for (const cat of categories) {
    // Skip a category that already exists (same name, ignoring upper/lower case)
    const exists = await Category.findOne({ name: new RegExp(`^${cat.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") });
    if (exists) {
      skipped++;
      continue;
    }
    await Category.create(cat); // create() builds the slug automatically
    added++;
  }

  console.log(`Done. Added ${added} categories, skipped ${skipped} that already existed.`);
} catch (err) {
  console.error("Error:", err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}