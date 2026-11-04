import "dotenv/config";
import mongoose from "mongoose";
import BlogPost from "../src/models/BlogPost.js";
import User from "../src/models/User.js";
import slugify from "../src/utils/slugify.js";

const posts = [
  {
    title: "Building a Sustainable Daily Reading Habit",
    category: "Reading Tips",
    excerpt: "Small, steady habits beat big plans. Here is a simple way to make reading part of your day.",
    content: `Most people do not fail at reading because they lack time. They fail because the plan is too big. A habit that lasts starts small.

## Start with ten minutes
Pick a fixed moment, such as after breakfast or before sleep, and read for ten minutes. When that feels easy, add five more.

## Make it easy to begin
- Keep your current book where you will see it.
- Use the same chair or corner every day.
- Put your phone in another room while you read.

## Track it, gently
Use the reading goal and streak on your KitabAura profile to see your progress. Missing a day is fine. Just start again tomorrow.`,
  },
  {
    title: "Why Reading Books Can Broaden Your Perspective",
    category: "Education and Learning",
    excerpt: "A good book lets you spend time inside another person's thoughts, place and time.",
    content: `Books give us a way to see the world through someone else's eyes. A novel can take you to a village or a city you may never visit. A history can show you why people made the choices they did.

## Different voices, different views
Reading widely, in more than one language, introduces ideas that your own surroundings may never bring up. That does not mean you will agree with all of them. It means you understand more before you decide.

## Where to start
- Pick one book from a language you read less often.
- Choose a subject you know little about.
- Talk about what you read with a friend or in a review.`,
  },
  {
    title: "Welcome to the KitabAura Blog",
    category: "Literary News",
    excerpt: "What you will find here: reviews, reading tips and stories about books in Pashto, Urdu and English.",
    content: `KitabAura is a library for readers of Pashto, Urdu and English. This blog is where we share what we are reading and what we are learning about books.

## What to expect
- Book reviews and recommendations
- Tips for building a reading habit
- Notes on literature in our languages

## Share a book
If you have a book you have the right to share, you can upload it to the library. Every upload is checked by an admin before it is published.`,
  },
];

try {
  await mongoose.connect(process.env.MONGO_URI);

  const author = await User.findOne({ role: "admin" });
  if (!author) throw new Error("No admin user found. Run npm run create-admin first.");

  let added = 0;
  for (const p of posts) {
    const slug = slugify(p.title);
    if (await BlogPost.exists({ slug })) continue; // skip posts that already exist
    await BlogPost.create({ ...p, slug, author: author._id, status: "draft" });
    added++;
  }
  console.log(`Done. Added ${added} draft posts. Edit and publish them from the admin blog page.`);
} catch (err) {
  console.error("Error:", err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}