import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";

const LANGUAGES = ["pashto", "urdu", "english", "arabic", "persian"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB, same limit as the server
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

const emptyForm = { title: "", author: "", language: "", category: "", description: "", pages: "" };

export default function Upload() {
  const { isAdmin } = useAuth();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [pdf, setPdf] = useState(null);
  const [cover, setCover] = useState(null);
  const [formKey, setFormKey] = useState(0); // changing it clears the file inputs
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  // Preview of the chosen cover image
  const coverPreview = useMemo(() => (cover ? URL.createObjectURL(cover) : ""), [cover]);
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const pickPdf = (e) => {
    const file = e.target.files[0];
    setError("");
    if (!file) return setPdf(null);
    if (file.type !== "application/pdf") {
      e.target.value = "";
      setPdf(null);
      return setError("The book file must be a PDF");
    }
    if (file.size > MAX_SIZE) {
      e.target.value = "";
      setPdf(null);
      return setError("The PDF is larger than 10 MB");
    }
    setPdf(file);
  };

  const pickCover = (e) => {
    const file = e.target.files[0];
    setError("");
    if (!file) return setCover(null);
    if (!IMAGE_TYPES.includes(file.type)) {
      e.target.value = "";
      setCover(null);
      return setError("The cover must be a JPG, PNG or WEBP image");
    }
    if (file.size > MAX_SIZE) {
      e.target.value = "";
      setCover(null);
      return setError("The cover image is larger than 10 MB");
    }
    setCover(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!pdf) return setError("Please choose the PDF file");

    // Files are sent as multipart form data
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "") data.append(key, value);
    });
    data.append("pdf", pdf);
    if (cover) data.append("cover", cover);

    setSubmitting(true);
    setProgress(0);
    try {
      const res = await api.post("/books", data, {
        onUploadProgress: (ev) => {
          if (ev.total) setProgress(Math.round((ev.loaded * 100) / ev.total));
        },
      });
      setSuccess(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const uploadAnother = () => {
    setForm(emptyForm);
    setPdf(null);
    setCover(null);
    setError("");
    setSuccess(null);
    setFormKey((k) => k + 1);
  };

  if (success) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-primary">
            {success.book.status === "approved" ? "Book published" : "Thank you!"}
          </h1>
          <p className="mt-2 text-muted">
            {success.book.status === "approved"
              ? "Your book is now live in the library."
              : "Your book was submitted. It will appear in the library once an admin approves it."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={uploadAnother}
              className="rounded-lg bg-primary px-5 py-2 font-semibold text-white hover:bg-primary-dark"
            >
              Upload another
            </button>
            <Link
              to={success.book.status === "approved" ? `/books/${success.book._id}` : "/browse"}
              className="rounded-lg border border-gray-300 px-5 py-2 font-semibold text-primary hover:bg-soft"
            >
              {success.book.status === "approved" ? "View book" : "Browse books"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-primary">Upload a book</h1>
      <p className="mt-1 text-sm text-muted">
        {isAdmin
          ? "As an admin, your uploads are published immediately."
          : "Your book will be reviewed by an admin before it goes live."}{" "}
        Only share books you have the right to share: public domain works, or your own.
      </p>

      {error && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form key={formKey} onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium">
          Title *
          <input name="title" value={form.title} onChange={handleChange} required maxLength={200} className={inputClass} />
        </label>

        <label className="block text-sm font-medium">
          Author *
          <input name="author" value={form.author} onChange={handleChange} required maxLength={100} className={inputClass} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Language *
            <select name="language" value={form.language} onChange={handleChange} required className={inputClass}>
              <option value="">Choose a language</option>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium">
            Category *
            <select name="category" value={form.category} onChange={handleChange} required className={inputClass}>
              <option value="">Choose a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {categories.length === 0 && (
          <p className="text-xs text-muted">No categories yet. An admin needs to create some first.</p>
        )}

        <label className="block text-sm font-medium">
          Number of pages <span className="font-normal text-muted">(optional, filled automatically if empty)</span>
          <input name="pages" type="number" min="1" value={form.pages} onChange={handleChange} className={inputClass} />
        </label>

        <label className="block text-sm font-medium">
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            maxLength={3000}
            className={inputClass}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            PDF file * <span className="font-normal text-muted">(max 10 MB)</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={pickPdf}
              className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-soft file:px-4 file:py-2 file:font-semibold file:text-primary hover:file:bg-gray-200"
            />
            {pdf && <span className="mt-1 block truncate text-xs text-muted">{pdf.name}</span>}
          </label>

          <label className="block text-sm font-medium">
            Cover image <span className="font-normal text-muted">(JPG, PNG, WEBP)</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={pickCover}
              className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-soft file:px-4 file:py-2 file:font-semibold file:text-primary hover:file:bg-gray-200"
            />
            {coverPreview && (
              <img src={coverPreview} alt="Cover preview" className="mt-2 h-32 rounded-lg border border-gray-200 object-cover" />
            )}
          </label>
        </div>

        {submitting && (
          <div aria-live="polite">
            <div className="h-2 overflow-hidden rounded-full bg-soft">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-muted">
              {progress < 100 ? `Uploading... ${progress}%` : "Processing on the server..."}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting ? "Uploading..." : "Submit book"}
        </button>
      </form>
    </div>
  );
}