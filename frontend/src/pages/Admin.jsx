import { useEffect, useState } from "react";
import api, { API_BASE } from "../api/api";

const MATERIAL_TYPES = ["document", "image", "video", "youtube", "hyperlink"];

export default function Admin() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    difficulty: "beginner",
    price: 0,
  });
  const [editingCourse, setEditingCourse] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Study materials state
  const [materialsTab, setMaterialsTab] = useState(null); // courseId or null
  const [materials, setMaterials] = useState([]);
  const [matForm, setMatForm] = useState({ title: "", type: "document", url: "" });
  const [matFile, setMatFile] = useState(null);
  const [matLoading, setMatLoading] = useState(false);
  const [matMessage, setMatMessage] = useState({ type: "", text: "" });

  const fetchCourses = () => {
    api.get("/courses").then((res) => setCourses(res.data));
  };

  const fetchMaterials = (courseId) => {
    api.get(`/study-materials?courseId=${courseId}`)
      .then((r) => setMaterials(r.data))
      .catch(() => setMaterials([]));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await api.post("/courses", form);
      setMessage({ type: "success", text: "Course created successfully!" });
      setForm({ title: "", slug: "", description: "", category: "", difficulty: "beginner", price: 0 });
      fetchCourses();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to create course" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/courses/${id}`);
      if (materialsTab === id) setMaterialsTab(null);
      fetchCourses();
    } catch {
      alert("Failed to delete course");
    }
  };

  const startEdit = (course) => {
    setEditingCourse(course._id);
    setEditForm({
      title: course.title,
      slug: course.slug,
      description: course.description || "",
      category: course.category || "",
      difficulty: course.difficulty || "beginner",
      price: course.price || 0
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/courses/${editingCourse}`, editForm);
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update course");
    }
  };

  const openMaterials = (courseId) => {
    setMaterialsTab(courseId);
    setMatMessage({ type: "", text: "" });
    fetchMaterials(courseId);
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!materialsTab) return;
    setMatLoading(true);
    setMatMessage({ type: "", text: "" });
    try {
      const fd = new FormData();
      fd.append("courseId", materialsTab);
      fd.append("title", matForm.title);
      fd.append("type", matForm.type);
      if (matFile) {
        fd.append("file", matFile);
      } else {
        fd.append("url", matForm.url);
      }
      await api.post("/study-materials", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMatMessage({ type: "success", text: "Material added!" });
      setMatForm({ title: "", type: "document", url: "" });
      setMatFile(null);
      fetchMaterials(materialsTab);
    } catch (err) {
      setMatMessage({ type: "error", text: err.response?.data?.message || "Failed to add material" });
    } finally {
      setMatLoading(false);
    }
  };

  const handleDeleteMaterial = async (matId) => {
    if (!window.confirm("Delete this material?")) return;
    try {
      await api.delete(`/study-materials/${matId}`);
      fetchMaterials(materialsTab);
    } catch {
      alert("Failed to delete material");
    }
  };

  const materialTypeIcon = (type) => {
    const icons = { document: "📄", image: "🖼️", video: "🎬", youtube: "▶️", hyperlink: "🔗" };
    return icons[type] || "📎";
  };

  return (
    <div className="min-h-screen transition-colors" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div className="hero-bg text-white py-12 px-6">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(230,126,34,0.2)", border: "1px solid rgba(230,126,34,0.3)", color: "#F5A623" }}>
            ⚙️ Admin Panel
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Admin Dashboard</h1>
          <p style={{ color: "rgba(255,255,255,0.6)" }}>Manage courses and platform content</p>
        </div>
      </div>

      <div className="px-6 py-10">
        <div className="max-w-6xl mx-auto">

          {/* Create Course */}
          <div className="card mb-10">
            <h2 className="text-lg font-bold mb-6" style={{ color: "var(--color-text-dark)" }}>Create New Course</h2>

            {message.text && (
              <div className={`mb-5 ${message.type === "success" ? "form-success" : "form-error"} flex items-center gap-2`}>
                <span>{message.type === "success" ? "✅" : "⚠️"}</span>
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="form-group">
                  <label className="form-label">Course Title</label>
                  <input type="text" name="title" value={form.title} onChange={handleChange}
                    placeholder="e.g., React Mastery" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug (URL-friendly)</label>
                  <input type="text" name="slug" value={form.slug} onChange={handleChange}
                    placeholder="e.g., react-mastery" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input type="text" name="category" value={form.category} onChange={handleChange}
                    placeholder="e.g., Web Development" />
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty Level</label>
                  <select name="difficulty" value={form.difficulty} onChange={handleChange}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input type="number" name="price" value={form.price} onChange={handleChange}
                    placeholder="0 for free" min="0" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  placeholder="Course description..." rows="3" />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="spinner" style={{ width: "14px", height: "14px" }}></span>
                    Creating...
                  </span>
                ) : (
                  "+ Create Course"
                )}
              </button>
            </form>
          </div>

          {/* Courses List */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: "var(--color-text-dark)" }}>
                Manage Courses
                {courses.length > 0 && (
                  <span className="ml-2 text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(24,153,163,0.1)", color: "var(--color-secondary)" }}>
                    {courses.length}
                  </span>
                )}
              </h2>
            </div>

            {courses.length === 0 ? (
              <div className="card text-center py-14 animate-fadeIn">
                <div className="text-4xl mb-3">📚</div>
                <p className="font-semibold mb-1" style={{ color: "var(--color-text-dark)" }}>No courses yet</p>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Create your first course above</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map((course) => (
                  <div key={course._id} className="card flex flex-col">
                    {editingCourse === course._id ? (
                      /* ── Edit Form ── */
                      <form onSubmit={handleUpdate} className="space-y-3">
                        <p className="text-sm font-bold mb-2" style={{ color: "var(--color-text-dark)" }}>Edit Course</p>
                        {[
                          { name: "title", placeholder: "Title", label: "Title" },
                          { name: "slug", placeholder: "Slug", label: "Slug" },
                          { name: "category", placeholder: "Category", label: "Category" }
                        ].map((f) => (
                          <div key={f.name} className="form-group">
                            <label className="form-label">{f.label}</label>
                            <input type="text" name={f.name} value={editForm[f.name] || ""}
                              placeholder={f.placeholder}
                              onChange={(e) => setEditForm({ ...editForm, [e.target.name]: e.target.value })} />
                          </div>
                        ))}
                        <div className="form-group">
                          <label className="form-label">Difficulty</label>
                          <select name="difficulty" value={editForm.difficulty || "beginner"}
                            onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Price (₹)</label>
                          <input type="number" name="price" value={editForm.price || 0} min="0"
                            onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <textarea name="description" rows="2" value={editForm.description || ""}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" className="btn btn-primary flex-1 text-xs py-1.5">Save</button>
                          <button type="button" onClick={() => setEditingCourse(null)}
                            className="btn text-xs py-1.5 flex-1"
                            style={{ background: "var(--color-surface-alt)", color: "var(--color-text-light)", border: "1px solid var(--color-border)" }}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="mb-4 pb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                          <h3 className="text-sm font-bold mb-1 line-clamp-2" style={{ color: "var(--color-text-dark)" }}>
                            {course.title}
                          </h3>
                          <p className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>{course.slug}</p>
                        </div>

                        <div className="flex-1 space-y-2.5 mb-5">
                          {course.category && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-text-muted)" }}>Category</p>
                              <p className="text-xs font-semibold" style={{ color: "var(--color-text-dark)" }}>{course.category}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Difficulty</p>
                              <span className="badge badge-secondary text-xs capitalize">{course.difficulty}</span>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-text-muted)" }}>Price</p>
                              <p className="text-sm font-bold" style={{ color: course.price === 0 ? "var(--color-success)" : "var(--color-text-dark)" }}>
                                {course.price === 0 ? "Free" : `₹${course.price}`}
                              </p>
                            </div>
                          </div>
                          {course.description && (
                            <p className="text-xs line-clamp-2" style={{ color: "var(--color-text-light)" }}>
                              {course.description}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <button onClick={() => startEdit(course)} className="btn flex-1 text-xs py-2"
                              style={{ background: "rgba(24,153,163,0.1)", color: "var(--color-secondary)", border: "1px solid rgba(24,153,163,0.3)" }}>
                              ✏️ Edit
                            </button>
                            <button onClick={() => handleDelete(course._id)} className="btn btn-danger flex-1 text-xs py-2">
                              🗑️ Delete
                            </button>
                          </div>
                          <button
                            onClick={() => materialsTab === course._id ? setMaterialsTab(null) : openMaterials(course._id)}
                            className="btn w-full text-xs py-2"
                            style={{
                              background: materialsTab === course._id ? "rgba(230,126,34,0.15)" : "rgba(230,126,34,0.08)",
                              color: "#E67E22",
                              border: "1px solid rgba(230,126,34,0.3)"
                            }}>
                            📚 {materialsTab === course._id ? "Hide Materials" : "Manage Study Materials"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Study Materials Panel ── */}
            {materialsTab && (
              <div className="card mt-8">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold" style={{ color: "var(--color-text-dark)" }}>
                    Study Materials — {courses.find((c) => c._id === materialsTab)?.title}
                  </h2>
                  <button onClick={() => setMaterialsTab(null)}
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: "var(--color-surface-alt)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}>
                    Close ✕
                  </button>
                </div>

                {/* Add material form */}
                <form onSubmit={handleAddMaterial} className="space-y-4 mb-6 pb-6" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                      <label className="form-label">Title</label>
                      <input type="text" value={matForm.title} required placeholder="e.g., Chapter 1 Notes"
                        onChange={(e) => setMatForm({ ...matForm, title: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select value={matForm.type} onChange={(e) => setMatForm({ ...matForm, type: e.target.value })}>
                        {MATERIAL_TYPES.map((t) => (
                          <option key={t} value={t} className="capitalize">{materialTypeIcon(t)} {t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      {["youtube", "hyperlink"].includes(matForm.type) ? (
                        <>
                          <label className="form-label">URL</label>
                          <input type="url" value={matForm.url} placeholder="https://..." required={!matFile}
                            onChange={(e) => setMatForm({ ...matForm, url: e.target.value })} />
                        </>
                      ) : (
                        <>
                          <label className="form-label">Upload File</label>
                          <input type="file"
                            accept={
                              matForm.type === "image" ? "image/*"
                                : matForm.type === "video" ? "video/*"
                                  : ".pdf,.ppt,.pptx,.doc,.docx"
                            }
                            onChange={(e) => setMatFile(e.target.files[0] || null)} />
                        </>
                      )}
                    </div>
                  </div>
                  {matMessage.text && (
                    <div className={`flex items-center gap-2 text-sm ${matMessage.type === "success" ? "form-success" : "form-error"}`}>
                      {matMessage.type === "success" ? "✅" : "⚠️"} {matMessage.text}
                    </div>
                  )}
                  <button type="submit" disabled={matLoading} className="btn btn-primary text-xs py-2">
                    {matLoading ? "Adding…" : "+ Add Material"}
                  </button>
                </form>

                {/* Materials list */}
                {materials.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: "var(--color-text-muted)" }}>No study materials yet.</p>
                ) : (
                  <div className="space-y-3">
                    {materials.map((m) => (
                      <div key={m._id} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: "var(--color-surface-alt)", border: "1px solid var(--color-border)" }}>
                        <span className="text-2xl">{materialTypeIcon(m.type)}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>{m.title}</p>
                          <p className="text-xs capitalize" style={{ color: "var(--color-text-muted)" }}>
                            {m.type}{m.fileType ? ` · ${m.fileType.toUpperCase()}` : ""}
                          </p>
                        </div>
                        <a href={["youtube", "hyperlink"].includes(m.type) ? m.url : `${API_BASE}${m.url}`}
                          target="_blank" rel="noreferrer"
                          className="text-xs px-2 py-1 rounded"
                          style={{ background: "rgba(24,153,163,0.1)", color: "var(--color-secondary)" }}>
                          View
                        </a>
                        <button onClick={() => handleDeleteMaterial(m._id)}
                          className="text-xs px-2 py-1 rounded"
                          style={{ background: "rgba(235,87,87,0.1)", color: "var(--color-danger)" }}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
