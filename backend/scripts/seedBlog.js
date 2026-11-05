import "dotenv/config";
import mongoose from "mongoose";
import BlogPost from "../src/models/BlogPost.js";
import User from "../src/models/User.js";
import slugify from "../src/utils/slugify.js";

const posts = [
  {
    title: "The Enduring Legacy of Khushal Khan Khattak: The Warrior Poet of Pashto",
    category: "Pashto Literature",
    excerpt: "Discover the extraordinary life, fiery verses, and philosophical wisdom of Khushal Khan Khattak, whose poetry shaped the soul of Pashto literature.",
    featuredImageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
    seoTitle: "Legacy of Khushal Khan Khattak | KitabAura Blog",
    seoDescription: "Explore the poetry, life, and philosophy of Khushal Khan Khattak, the celebrated warrior-poet of Pashto literature.",
    status: "published",
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    content: `Few literary figures in history have commanded both the sword and the pen with the mastery of Khushal Khan Khattak (1613–1689). Known as the national poet of the Pashtuns, his works encompass epic bravery, philosophical contemplation, romantic lyricism, and keen observations on human nature.

## A Life of Struggle and Conviction
Born near Akora Khattak in the valley of the Kabul River, Khushal lived during the height of Mughal rule. His life was marked by fierce independence and unwavering principles. Even during years of imprisonment in the Gwalior fortress, his spirit remained unbroken, giving birth to some of his most poignant and passionate poetry.

## The Pillars of His Poetry
Khushal's Diwan is a treasure trove that touches on every facet of existence:
- Honor and courage (*Nang and Pukhto*): Inspiring his people toward dignity, self-determination, and moral integrity.
- Wisdom and counsel: Practical aphorisms on statecraft, friendship, and self-restraint.
- The splendor of nature: Vibrant reflections on the mountains, valleys, and seasons of his homeland.

## Why His Words Still Resonate
What makes Khushal Khan Khattak timeless is his authenticity. He wrote not from theoretical detachment, but from direct experience of triumph, loss, battle, and reflection. For modern readers exploring Pashto literature on KitabAura, Khushal's verses provide an unforgettable window into the courage, philosophy, and lyrical majesty of the Afghan frontier.`,
  },
  {
    title: "Mirza Ghalib and the Art of the Urdu Ghazal",
    category: "Urdu Literature",
    excerpt: "An exploration of Mirza Asadullah Khan Ghalib's poetic genius, his unmatched wit, and how his verses redefined the emotional depth of Urdu literature.",
    featuredImageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80",
    seoTitle: "Mirza Ghalib & Urdu Ghazal | KitabAura Blog",
    seoDescription: "A deep dive into Mirza Ghalib's poetic mastery, wit, and philosophical inquiry in the classical Urdu ghazal tradition.",
    status: "published",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    content: `In the storied history of Urdu poetry, no name shines with greater brilliance and intrigue than Mirza Asadullah Khan Ghalib (1797–1869). Writing in the twilight years of Mughal Delhi, Ghalib transformed the ghazal from traditional courtly romance into a profound meditation on existence, longing, doubt, and human resilience.

## The Rebel of Form and Thought
Before Ghalib, the Urdu ghazal was often constrained by predictable tropes. Ghalib shattered these conventions. His poetry embraced paradox, questioning authority, mocking solemn dogma, and celebrating the bittersweet agony of mortal love.

## Key Themes in Ghalib's Ghazals
- Philosophical skepticism: Ghalib constantly asks whether the world we perceive is reality or mere illusion.
- The beauty of human yearning: For Ghalib, the desire itself is sacred, even when unfulfilled.
- Witty self-irony: Few poets could mock their own financial worries and human frailties with such effortless charm and humor.

## How to Begin Reading Ghalib
If you are new to Urdu poetry, start with his simpler, musical couplets before tackling his intricate Persianized verses. Pay attention to how a single couplet can yield three distinct interpretations depending on where you pause. Ghalib's Diwan remains essential reading for anyone seeking the heart of Urdu literary heritage.`,
  },
  {
    title: "Building a Sustainable Daily Reading Habit",
    category: "Reading Tips",
    excerpt: "Small, steady habits beat big plans. Here is a simple, proven way to make reading a joyful part of your everyday routine.",
    featuredImageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80",
    seoTitle: "How to Build a Daily Reading Habit | KitabAura Blog",
    seoDescription: "Practical strategies to overcome distractions, build focus, and establish a consistent daily reading routine.",
    status: "published",
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    content: `Most people who wish they read more do not fail because they lack time. They fail because their goals are too ambitious and rigid. Building a lifelong reading habit does not require reading fifty pages an afternoon; it requires showing up consistently in small, enjoyable moments.

## Start with Just Fifteen Minutes
The secret to building momentum is making the barrier to entry as low as possible. Pick a dedicated moment in your day — right after morning tea, on your commute, or before turning off the bedside lamp. Read for fifteen uninterrupted minutes.

## Practical Steps to Protect Your Focus
- Keep your current book in plain sight on your desk or nightstand.
- Silence mobile notifications and place your phone in another room during reading time.
- If a book is not clicking after fifty pages, gently set it aside and try another. Reading should be an adventure, not a punishment.

## Celebrate Progress on KitabAura
Use your KitabAura profile to set weekly reading targets and track your current streak. Seeing your finished pages accumulate over weeks and months is one of the most rewarding feelings a reader can experience.`,
  },
  {
    title: "The Joy of Rereading: Why Great Books Grow With You",
    category: "Book Reviews",
    excerpt: "Why returning to beloved books at different stages of life reveals hidden layers of meaning, comfort, and unexpected insights.",
    featuredImageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
    seoTitle: "The Joy of Rereading Books | KitabAura Blog",
    seoDescription: "Discover why revisiting classic literature and favorite titles unlocks deeper meanings and reveals personal growth.",
    status: "published",
    publishedAt: new Date(),
    content: `There is a unique magic in opening a book you haven't read in ten years. The words on the page remain identical, yet the story you experience feels completely transformed. As the philosopher Heraclitus noted that no man steps in the same river twice, no reader ever encounters the exact same book twice.

## What Happens When We Reread
On a first reading, our attention is consumed by plot: What happens next? Who survives? How does it resolve? On a second or third reading, plot tension fades into the background, allowing craftsmanship, nuance, and thematic subtlety to emerge.

## Why Rereading is Worth Your Time
- Discovering foreshadowing and literary architecture you missed the first time.
- Finding solace and familiarity in an increasingly noisy and hectic world.
- Measuring your own emotional and intellectual growth against the characters and ideas.

## Books to Revisit on KitabAura
Whether it is Saadat Hasan Manto's poignant short stories, Rehman Baba's spiritual verses, or classic novels, try picking up a title you once loved. You may be surprised by how much more it has to tell you today.`,
  },
];

try {
  await mongoose.connect(process.env.MONGO_URI);

  let author = await User.findOne({ role: "admin" }) || await User.findOne();
  if (!author && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    author = await User.create({
      name: process.env.ADMIN_NAME || "Sikandar Afridi",
      email: process.env.ADMIN_EMAIL.toLowerCase(),
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
    });
  }
  if (!author) {
    throw new Error("No user found to assign as blog author. Create an admin user first.");
  }

  let added = 0;
  let updated = 0;

  for (const p of posts) {
    const slug = slugify(p.title);
    const existing = await BlogPost.findOne({ slug });
    if (existing) {
      existing.title = p.title;
      existing.category = p.category;
      existing.excerpt = p.excerpt;
      existing.content = p.content;
      existing.featuredImageUrl = p.featuredImageUrl;
      existing.status = "published";
      if (!existing.publishedAt) existing.publishedAt = p.publishedAt || new Date();
      await existing.save();
      updated++;
    } else {
      await BlogPost.create({
        ...p,
        slug,
        author: author._id,
      });
      added++;
    }
  }

  console.log(`Success! Added ${added} new blog posts, updated ${updated} existing posts.`);
} catch (err) {
  console.error("Error:", err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
