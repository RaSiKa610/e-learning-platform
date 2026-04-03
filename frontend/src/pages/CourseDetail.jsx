import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/auth/courses/slug/${slug}`)
      .then((res) => {
        setCourse(res.data);
        setLoading(false);
      })
      .catch(() => navigate("/"));
  }, [slug, navigate]);

  const handleEnroll = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to enroll");
      navigate("/login");
      return;
    }

    try {
      await api.post("/auth/enrollments/enroll", { courseId: course._id });
      alert("Enrolled successfully!");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <div className="text-center">
          <div className="spinner spinner-lg mx-auto mb-4"></div>
          <p style={{ color: "var(--color-text-muted)" }}>Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <div className="text-center">
          <p className="text-2xl font-semibold mb-4" style={{ color: "var(--color-text-dark)" }}>Course not found</p>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors" style={{ background: "var(--color-bg)" }}>
      {/* Hero */}
      <div className="hero-bg text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "0.7rem" }}>
              {course.difficulty}
            </span>
            <span className="badge" style={{ background: "rgba(24,153,163,0.3)", color: "#6EE7F0", fontSize: "0.7rem" }}>
              {course.category}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white leading-tight tracking-tight">
            {course.title}
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
            {course.description}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Overview */}
              <div className="card">
                <h2 className="text-xl font-bold mb-5" style={{ color: "var(--color-text-dark)" }}>Course Overview</h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-text-light)" }}>
                  {course.description}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Difficulty", value: course.difficulty },
                    { label: "Category",   value: course.category || "General" },
                  ].map((s) => (
                    <div key={s.label} className="stat-card">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-text-muted)" }}>
                        {s.label}
                      </p>
                      <p className="text-base font-bold capitalize" style={{ color: "var(--color-text-dark)" }}>
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Syllabus */}
              <div className="card">
                <h2 className="text-xl font-bold mb-5" style={{ color: "var(--color-text-dark)" }}>Course Syllabus</h2>
                {course.lessons && course.lessons.length > 0 ? (
                  <div className="space-y-3">
                    {course.lessons.map((lesson, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-lg transition-colors"
                        style={{
                          background: "var(--color-surface-alt)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: "var(--gradient-card)" }}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm" style={{ color: "var(--color-text-dark)" }}>
                            {lesson.title}
                          </h3>
                          {lesson.description && (
                            <p className="text-xs mt-1" style={{ color: "var(--color-text-light)" }}>
                              {lesson.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8" style={{ color: "var(--color-text-muted)" }}>
                    No lessons added yet
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="card sticky top-24">
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
                    Price
                  </p>
                  <div className="text-4xl font-extrabold" style={{ color: "var(--color-text-dark)" }}>
                    {course.price === 0 ? (
                      <span style={{ color: "var(--color-success)" }}>Free</span>
                    ) : (
                      `₹${course.price}`
                    )}
                  </div>
                </div>

                <button onClick={handleEnroll} className="btn btn-primary w-full mb-3 text-sm py-3">
                  Enroll Now →
                </button>

                <p className="text-xs text-center mb-6" style={{ color: "var(--color-text-muted)" }}>
                  Instant access after enrollment
                </p>

                <div className="space-y-3" style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1.25rem" }}>
                  {[
                    { label: "Level",    value: course.difficulty },
                    { label: "Category", value: course.category || "General" },
                    ...(course.lessons?.length > 0 ? [{ label: "Lessons", value: `${course.lessons.length} lessons` }] : []),
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                        {item.label}
                      </p>
                      <p className="text-xs font-semibold capitalize" style={{ color: "var(--color-text-dark)" }}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
