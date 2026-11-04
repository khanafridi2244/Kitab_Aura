import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";
import ArticleBody from "../../components/ArticleBody";
import { scriptLang } from "../../utils/lang";

const MAX_IMAGE = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

const emptyForm = { title: "", category: "", excerpt: "", content: "", seoTitle: "", seoDescription: "" };

export default function BlogEditor() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [existing, setExisting] = useState({ status: "draft", imageUrl: "" });
  const [loadedId, setLoadedId] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [image, setImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const loading = isEdit && loadedId !== id && !loadError;

  useEffect(() => {
    api.get("/blog/categories").then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, []);

  // When editing, load the post
  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    api
      .get(`/blog/admin/${id}`)
      .then(({ data }) => {
        if (!active) return;
        const p = data.post;
        setForm({
          title: p.title,
          category: p.category,
          excerpt: p.excerpt || "",
          content: p.content || "",
          seoTitle: p.seoTitle || "",
          seoDescription: p.seoDescription || "",
        });
        setExisting({ status: p.status, imageUrl: p.featuredImageUrl || "" });
        setLoadedId(id);
      })
      .catch((err) => active && setLoadError(getErrorMessage(err)));
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  // Preview of a newly chosen image
  const imagePreview = useMemo(() => (image ? URL.createObjectURL(image) : ""), [image]);
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const pickImage = (e) => {
    const file = e.target.files[0];
    setError("");
    if (!file) return setImage(null);
    if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE) {
      e.target.value = "";
      setImage(null);
      return setError("The image must be a JPG, PNG or WEBP file under 10 MB");
    }
    setImage(file);
    setRemoveImage(false);
  };

  // Two submit buttons: the one that was pressed decides the status
  const handleSubmit = async (e) => {
    e.preventDefault();
    const status = e.nativeEvent.submitter?.value || "draft";
    setError("");

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append("status", status);
    if (image) data.append("image", image);
    else if (removeImage) data.append("removeImage", "true");

    setSaving(true);
    try {
      if (isEdit) await api.put(`/blog/${id}`, data);
      else await api.post("/blog", data);
      navigate("/admin/blog", {
        state: { notice: status === "published" ? "Post saved and published." : "Post saved as a draft." },
      });
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  if (loading) return <p className="px-4 py-20 text-center text-muted">Loading post...</p>;

  if (loadError) {
    return (
      <div className="px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-primary">Cannot open this post</h1>
        <p className="mt-2 text-muted">{loadError}</p>
        <Link to="/admin/blog" className="mt-4 inline-block font-semibold text-primary underline">
          Back to blog posts
        </Link>
      </div>
    );
  }

  const wasPublished = isEdit && existing.status === "published";
  const shownImage = imagePreview || (!removeImage ? existing.imageUrl : "");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/admin/blog" className="text-sm font-medium text-primary hover:underline">
        &larr; Back to blog posts
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-primary">{isEdit ? "Edit post" : "New post"}</h1>

      {error && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-line bg-surface p-5 shadow-sm">
        <label className="block text-sm font-medium">
          Title *
          <input name="title" value={form.title} onChange={handleChange} required minLength={3} maxLength={150} className={inputClass} />
        </label>

        <label className="block text-sm font-medium">
          Category *
          <select name="category" value={form.category} onChange={handleChange} required className={inputClass}>
            <option value="">Choose a category</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium">
          Excerpt <span className="font-normal text-muted">(shown on cards, needed to publish)</span>
          <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} maxLength={300} className={inputClass} />
          <span className="mt-1 block text-xs text-muted">{form.excerpt.length} / 300</span>
        </label>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="content" className="text-sm font-medium">Article content</label>
            <button type="button" onClick={() => setPreview(!preview)} className="text-sm font-semibold text-primary hover:underline">
              {preview ? "Back to editing" : "Preview"}
            </button>
          </div>

          {preview ? (
            <div className="mt-2 rounded-lg border border-line p-4">
              <h2 lang={scriptLang(form.title)} dir="auto" className="mb-4 text-2xl font-semibold text-ink">
                {form.title || "Untitled"}
              </h2>
              {form.content.trim() ? <ArticleBody content={form.content} /> : <p className="text-sm text-muted">Nothing to preview yet.</p>}
            </div>
          ) : (
            <>
              <textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={14}
                maxLength={50000}
                dir="auto"
                className={`${inputClass} font-mono`}
              />
              <p className="mt-1 text-xs text-muted">
                Plain text only. Leave a blank line between paragraphs. Start a line with <code>## </code> for a heading
                and with <code>- </code> for a list item. HTML is shown as text, never run.
              </p>
            </>
          )}
        </div>

        <div>
          <p className="text-sm font-medium">Featured image <span className="font-normal text-muted">(optional, JPG, PNG or WEBP)</span></p>
          {shownImage && (
            <img src={shownImage} alt="Featured image preview" className="mt-2 aspect-video w-full max-w-sm rounded-lg border border-line object-cover" />
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={pickImage}
            aria-label="Choose a featured image"
            className="mt-2 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-soft file:px-4 file:py-2 file:font-semibold file:text-primary hover:file:bg-gray-200"
          />
          {isEdit && existing.imageUrl && !image && (
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} />
              Remove the current image
            </label>
          )}
        </div>

        <fieldset className="rounded-lg border border-line p-4">
          <legend className="px-1 text-sm font-semibold text-ink">Search engine details (optional)</legend>
          <label className="block text-sm font-medium">
            SEO title
            <input name="seoTitle" value={form.seoTitle} onChange={handleChange} maxLength={70} className={inputClass} />
            <span className="mt-1 block text-xs text-muted">{form.seoTitle.length} / 70. Empty uses the post title.</span>
          </label>
          <label className="mt-3 block text-sm font-medium">
            SEO description
            <textarea name="seoDescription" value={form.seoDescription} onChange={handleChange} rows={2} maxLength={160} className={inputClass} />
            <span className="mt-1 block text-xs text-muted">{form.seoDescription.length} / 160. Empty uses the excerpt.</span>
          </label>
        </fieldset>

        <div className="flex flex-wrap gap-3 border-t border-line pt-4">
          <button
            type="submit"
            name="status"
            value="published"
            disabled={saving}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? "Saving..." : wasPublished ? "Save changes" : "Publish"}
          </button>
          <button
            type="submit"
            name="status"
            value="draft"
            disabled={saving}
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-primary hover:bg-soft disabled:opacity-60"
          >
            {wasPublished ? "Unpublish (save as draft)" : "Save draft"}
          </button>
        </div>
      </form>
    </div>
  );
}