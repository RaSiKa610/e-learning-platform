import { useEffect, useState } from "react";
import api from "../api/api";

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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchCourses = () => {
    api.get("/courses").then((res) => setCourses(res.data));
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
      fetchCourses();
    } catch {
      alert("Failed to delete course");
    }
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

                    <button onClick={() => handleDelete(course._id)} className="btn btn-danger w-full text-xs py-2">
                      Delete Course
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
