import 'dotenv/config';
import mongoose from 'mongoose';
import Book from './src/models/Book.js';
import Category from './src/models/Category.js';

await mongoose.connect(process.env.MONGO_URI);
const books = await Book.find().populate('category', 'name slug').lean();
console.log('Total books in DB:', books.length);
for (const b of books) {
  console.log(`- "${b.title}" | category: ${b.category?.name} (${b.category?.slug}) | status: ${b.status} | id: ${b._id}`);
}
await mongoose.disconnect();
