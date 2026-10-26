import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../api/axios";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

const emptyForm = { name: "", nameUrdu: "", namePashto: "" };

export default function Categories() {
  const [state, setState] = useState({ loading: true, categories: [], error: "" });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = adding a new category
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null); // category being deleted
  const [notice, setNotice] = useState({ type: "", text: "" });

  useEffect(() => {
    let active = true;
    api
      .get("/categories")
      .then(({ data }) => active && setState({ loading: false, categories: data.categories, error: "" }))
      .catch((err) => active && setState({ loading: false, categories: [], error: getErrorMessage(err) }));
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setForm({ name: cat.name, nameUrdu: cat.nameUrdu || "", namePashto: cat.namePashto || "" });
    setNotice({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice({ type: "", text: "" });
    setSubmitting(true);

    const body = {
      name: form.name.trim(),
      nameUrdu: form.nameUrdu.trim(),
      namePashto: form.namePashto.trim(),
    };

    try {
      if (editingId) {
        const { data } = await api.put(`/categories/${editingId}`, body);
        setState((s) => ({
          ...s,
          categories: s.categories
            .map((c) => (c._id === editingId ? data.category : c))
            .sort((a, b) => a.name.localeCompare(b.name)),
        }));
        setNotice({ type: "success", text: `"${data.category.name}" was updated.` });
      } else {
        const { data } = await api.post("/categories", body);
        setState((s) => ({
          ...s,
          categories: [...s.categories, data.category].sort((a, b) => a.name.localeCompare(b.name)),
        }));
        setNotice({ type: "success", text: `"${data.category.name}" was added.` });
      }
      resetForm();
    } catch (err) {
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete the category "${cat.name}"?`)) return;

    setNotice({ type: "", text: "" });
    setBusyId(cat._id);
    try {
      await api.delete(`/categories/${cat._id}`);
      setState((s) => ({ ...s, categories: s.categories.filter((c) => c._id !== cat._id) }));
      if (editingId === cat._id) resetForm();
      setNotice({ type: "success", text: `"${cat.name}" was deleted.` });
    } catch (err) {
      // For example: "Cannot delete a category that still has books"
      setNotice({ type: "error", text: getErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const { loading, categories, error } = state;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/admin" className="text-sm font-medium text-primary hover:underline">
        &larr; Back to dashboard
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-primary">Categories</h1>
      <p className="mt-1 text-sm text-muted">
        Genres shown in the filters and upload form. Urdu and Pashto names are used by the multilingual interface later.
      </p>

      {notice.text && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            notice.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Add / edit form */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <h2 className="font-bold text-ink">{editingId ? "Edit category" : "Add a category"}</h2>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="block text-sm font-medium">
            English name *
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={50}
              placeholder="Poetry"
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium">
            Urdu name
            <input
              name="nameUrdu"
              value={form.nameUrdu}
              onChange={handleChange}
              dir="rtl"
              lang="ur"
              placeholder="شاعری"
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium">
            Pashto name
            <input
              name="namePashto"
              value={form.namePashto}
              onChange={handleChange}
              dir="rtl"
              lang="ps"
              placeholder="شاعري"
              className={inputClass}
            />
          </label>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {submitting ? "Saving..." : editingId ? "Save changes" : "Add category"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium hover:bg-soft"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <div className="mt-6" aria-live="polite">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-soft" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-lg bg-red-50 px-4 py-6 text-center text-red-700">
            {error}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl bg-soft px-4 py-12 text-center">
            <p className="text-lg font-semibold text-primary">No categories yet</p>
            <p className="mt-1 text-sm text-muted">Add the first one above, for example Poetry or Novel.</p>
          </div>
        ) : (
          <>
            <p className="mb-2 text-sm text-muted">
              {categories.length} {categories.length === 1 ? "category" : "categories"}
            </p>
            <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
              {categories.map((cat) => (
                <li
                  key={cat._id}
                  className={`flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 ${
                    editingId === cat._id ? "bg-soft" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{cat.name}</p>
                    <p className="text-xs text-muted">/{cat.slug}</p>
                  </div>
                  <div className="flex gap-4 text-sm text-muted">
                    <span dir="rtl" lang="ur">{cat.nameUrdu || "-"}</span>
                    <span dir="rtl" lang="ps">{cat.namePashto || "-"}</span>
                  </div>
                  <div className="flex gap-4 text-sm font-medium">
                    <button onClick={() => startEdit(cat)} className="text-primary hover:underline">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={busyId === cat._id}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      {busyId === cat._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}