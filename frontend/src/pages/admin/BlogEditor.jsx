import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";
import ArticleBody from "../../components/ArticleBody";
import { scriptLang } from "../../utils/lang";

const MAX_IMAGE = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const DEFAULT_CATEGORIES = [
  "Book Reviews",
  "Pashto Literature",
  "Urdu Literature",
  "English Literature",
  "Reading Tips",
  "Famous Authors",
  "Education and Learning",
  "Literary News",
];

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

const emptyForm = {
  title: "",
  category: "",
  excerpt: "",
  content: "",
  featuredImageUrl: "",
  seoTitle: "",
  seoDescription: "",
};

export default function BlogEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [form, setForm] = useState(emptyForm);
  const [existing, setExisting] = useState({ status: "draft", imageUrl: "" });
  const [loadedId, setLoadedId] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageMode, setImageMode] = useState("url"); // "url" or "file"
  const [removeImage, setRemoveImage] = useState(false);
  const [activeTab, setActiveTab] = useState("edit"); // "edit" or "preview"
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const loading = isEdit && loadedId !== id && !loadError;

  // Load categories from server if available, fallback to DEFAULT_CATEGORIES
  useEffect(() => {
    api
      .get("/blog/categories")
      .then(({ data }) => {
        if (data?.categories?.length) {
          setCategories(data.categories.map((c) => c.name));
        }
      })
      .catch(() => {});
  }, []);

  // When editing, load the post data
  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    api
      .get(`/blog/admin/${id}`)
      .then(({ data }) => {
        if (!active) return;
        const p = data.post;
        setForm({
          title: p.title || "",
          category: p.category || "",
          excerpt: p.excerpt || "",
          content: p.content || "",
          featuredImageUrl: p.featuredImageUrl || "",
          seoTitle: p.seoTitle || "",
          seoDescription: p.seoDescription || "",
        });
        setExisting({ status: p.status, imageUrl: p.featuredImageUrl || "" });
        if (p.featuredImageUrl) setImageMode("url");
        setLoadedId(id);
      })
      .catch((err) => active && setLoadError(getErrorMessage(err)));
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  // Preview of a newly chosen file
  const filePreview = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : ""), [imageFile]);
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const pickFile = (e) => {
    const file = e.target.files[0];
    setError("");
    if (!file) return setImageFile(null);
    if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE) {
      e.target.value = "";
      setImageFile(null);
      return setError("The image must be a JPG, PNG or WEBP file under 10 MB");
    }
    setImageFile(file);
    setRemoveImage(false);
  };

  // Insert markdown helpers into the content textarea at current cursor
  const insertFormatting = (prefix, suffix = "") => {
    const el = contentRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = form.content.slice(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const nextContent = form.content.slice(0, start) + replacement + form.content.slice(end);
    setForm((f) => ({ ...f, content: nextContent }));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 0);
  };

  // Word count and reading time calculation
  const words = useMemo(() => {
    return (form.content || "").trim().split(/\s+/).filter(Boolean).length;
  }, [form.content]);
  const estMinutes = Math.max(1, Math.ceil(words / 200));

  // Handle saving post as published or draft
  const handleSubmit = async (e) => {
    e.preventDefault();
    const status = e.nativeEvent.submitter?.value || "draft";
    setError("");

    if (status === "published") {
      if (!form.excerpt.trim()) {
        return setError("Please add a short excerpt before publishing.");
      }
      if (form.content.trim().length < 20) {
        return setError("Please add some article content before publishing.");
      }
    }

    const data = new FormData();
    data.append("title", form.title);
    data.append("category", form.category);
    data.append("excerpt", form.excerpt);
    data.append("content", form.content);
    data.append("seoTitle", form.seoTitle);
    data.append("seoDescription", form.seoDescription);
    data.append("status", status);

    if (imageMode === "file" && imageFile) {
      data.append("image", imageFile);
    } else if (imageMode === "url") {
      data.append("featuredImageUrl", form.featuredImageUrl.trim());
    }

    if (removeImage) {
      data.append("removeImage", "true");
    }

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/blog/${id}`, data);
      } else {
        await api.post("/blog", data);
      }
      navigate("/admin/blog", {
        state: {
          notice: status === "published" ? "Blog post published successfully!" : "Blog post saved as a draft.",
        },
      });
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-3 text-sm text-muted">Loading post details...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-primary">Cannot open this post</h1>
        <p className="mt-2 text-muted">{loadError}</p>
        <Link to="/admin/blog" className="mt-4 inline-block font-semibold text-primary underline">
          &larr; Back to blog posts
        </Link>
      </div>
    );
  }

  const wasPublished = isEdit && existing.status === "published";
  const currentPreviewImage =
    imageMode === "file" ? filePreview : (!removeImage ? form.featuredImageUrl || existing.imageUrl : "");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* ── Breadcrumb / Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/admin/blog" className="text-sm font-semibold text-primary hover:underline">
            &larr; Back to blog posts
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
            {isEdit ? "Edit Blog Post" : "Create a Blog Post"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Share articles, book reviews, reading tips, or literary stories with KitabAura readers.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex rounded-lg border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === "edit" ? "bg-primary text-white" : "text-muted hover:text-ink"
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === "preview" ? "bg-primary text-white" : "text-muted hover:text-ink"
            }`}
          >
            Live Preview
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Live Preview Mode ── */}
      {activeTab === "preview" ? (
        <div className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-10">
          <div className="border-b border-line pb-6">
            <span className="inline-block rounded-full bg-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              {form.category || "Uncategorized"}
            </span>
            <h2 lang={scriptLang(form.title)} dir="auto" className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
              {form.title || "Untitled Article"}
            </h2>
            {form.excerpt && (
              <p lang={scriptLang(form.excerpt)} dir="auto" className="mt-3 text-base text-muted">
                {form.excerpt}
              </p>
            )}
            <div className="mt-4 flex items-center gap-3 text-xs text-muted">
              <span>Admin Preview</span>
              <span>&middot;</span>
              <span>{words} words</span>
              <span>&middot;</span>
              <span>~{estMinutes} min read</span>
            </div>
          </div>

          {currentPreviewImage && (
            <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl bg-soft">
              <img src={currentPreviewImage} alt="" className="h-full w-full object-cover" />
            </div>
          )}

          <div className="mt-8">
            {form.content.trim() ? (
              <ArticleBody content={form.content} />
            ) : (
              <p className="italic text-muted">No article content written yet. Switch back to Editor to write.</p>
            )}
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Continue editing
            </button>
          </div>
        </div>
      ) : (
        /* ── Editor Form ── */
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 space-y-5">
            {/* Title */}
            <label className="block text-sm font-semibold text-ink">
              Article Title *
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={150}
                placeholder="e.g. The Enduring Legacy of Khushal Khan Khattak"
                className={inputClass}
              />
            </label>

            {/* Category */}
            <label className="block text-sm font-semibold text-ink">
              Category *
              <select name="category" value={form.category} onChange={handleChange} required className={inputClass}>
                <option value="">Select a blog category…</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            {/* Excerpt */}
            <label className="block text-sm font-semibold text-ink">
              Short Excerpt * <span className="font-normal text-muted">(Brief summary shown on blog cards)</span>
              <textarea
                name="excerpt"
                value={form.excerpt}
                onChange={handleChange}
                rows={2}
                maxLength={300}
                placeholder="Write a concise 1-2 sentence hook to introduce the article..."
                className={inputClass}
              />
              <span className="mt-1 block text-right text-xs text-muted">{form.excerpt.length} / 300</span>
            </label>

            {/* Content with Markdown Toolbar */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5">
                <span className="text-sm font-semibold text-ink">Article Content *</span>
                <span className="text-xs text-muted">
                  {words} words &middot; ~{estMinutes} min read
                </span>
              </div>

              {/* Formatting quick buttons */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-t-lg border border-b-0 border-gray-300 bg-soft px-3 py-2 text-xs font-medium text-ink">
                <span className="text-muted mr-1">Insert:</span>
                <button
                  type="button"
                  onClick={() => insertFormatting("\n## ")}
                  className="rounded bg-white px-2 py-1 shadow-sm hover:bg-gray-100"
                  title="Heading 2"
                >
                  ## Heading
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("\n- ")}
                  className="rounded bg-white px-2 py-1 shadow-sm hover:bg-gray-100"
                  title="List Item"
                >
                  - Bullet
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("**", "**")}
                  className="rounded bg-white px-2 py-1 shadow-sm hover:bg-gray-100"
                  title="Bold"
                >
                  **Bold**
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("\n*Note: ", "*")}
                  className="rounded bg-white px-2 py-1 shadow-sm hover:bg-gray-100"
                  title="Note"
                >
                  *Italic*
                </button>
              </div>

              <textarea
                ref={contentRef}
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={14}
                maxLength={50000}
                dir="auto"
                placeholder="Write your article here. Blank line creates a new paragraph. Lines starting with '## ' become headings, and lines with '- ' become bullet points..."
                className={`w-full rounded-b-lg border border-gray-300 bg-white px-3.5 py-3 font-mono text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted/60`}
              />
            </div>

            {/* Featured Image Section */}
            <div className="border-t border-line pt-5">
              <span className="text-sm font-semibold text-ink">Featured Cover Image (optional)</span>
              <p className="text-xs text-muted mt-0.5">Choose to enter a web image URL or upload an image file.</p>

              <div className="mt-3 flex items-center gap-4 text-xs font-semibold">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="imageMode"
                    value="url"
                    checked={imageMode === "url"}
                    onChange={() => setImageMode("url")}
                    className="accent-[#0f4c3a]"
                  />
                  Image URL / Link
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="imageMode"
                    value="file"
                    checked={imageMode === "file"}
                    onChange={() => setImageMode("file")}
                    className="accent-[#0f4c3a]"
                  />
                  Upload File
                </label>
              </div>

              {imageMode === "url" ? (
                <div className="mt-2.5">
                  <input
                    name="featuredImageUrl"
                    type="url"
                    value={form.featuredImageUrl}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/photo-... or any image address"
                    className={inputClass}
                  />
                </div>
              ) : (
                <div className="mt-2.5">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={pickFile}
                    aria-label="Upload featured image"
                    className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-soft file:px-4 file:py-2 file:font-semibold file:text-primary hover:file:bg-gray-200"
                  />
                </div>
              )}

              {/* Image Preview Box */}
              {currentPreviewImage && (
                <div className="mt-3 flex items-start gap-4">
                  <img
                    src={currentPreviewImage}
                    alt="Cover preview"
                    className="h-24 w-40 rounded-lg border border-line object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setForm((f) => ({ ...f, featuredImageUrl: "" }));
                      setImageFile(null);
                      setRemoveImage(true);
                    }}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove cover image
                  </button>
                </div>
              )}
            </div>

            {/* SEO Section */}
            <details className="rounded-xl border border-line bg-soft/50 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-ink">
                Search Engine Details & SEO (Optional)
              </summary>
              <div className="mt-4 space-y-3">
                <label className="block text-xs font-medium text-ink">
                  SEO Title (max 70 chars)
                  <input
                    name="seoTitle"
                    value={form.seoTitle}
                    onChange={handleChange}
                    maxLength={70}
                    placeholder="Defaults to article title"
                    className={inputClass}
                  />
                </label>
                <label className="block text-xs font-medium text-ink">
                  SEO Description (max 160 chars)
                  <textarea
                    name="seoDescription"
                    value={form.seoDescription}
                    onChange={handleChange}
                    rows={2}
                    maxLength={160}
                    placeholder="Defaults to excerpt"
                    className={inputClass}
                  />
                </label>
              </div>
            </details>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                name="status"
                value="published"
                disabled={saving}
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-60"
              >
                {saving ? "Saving..." : wasPublished ? "Update Published Post" : "Publish Blog Post"}
              </button>

              <button
                type="submit"
                name="status"
                value="draft"
                disabled={saving}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-primary transition hover:bg-soft disabled:opacity-60"
              >
                {wasPublished ? "Unpublish to Draft" : "Save as Draft"}
              </button>
            </div>

            <Link
              to="/admin/blog"
              className="text-sm font-medium text-muted hover:text-ink hover:underline"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
