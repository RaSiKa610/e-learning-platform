import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";

const DIFFICULTY_COLORS = {
  beginner:     { bg: "rgba(39,174,96,0.12)",  text: "#27AE60" },
  intermediate: { bg: "rgba(230,126,34,0.12)", text: "#E67E22" },
  advanced:     { bg: "rgba(231,76,60,0.12)",  text: "#E74C3C" },
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");
  const [priceType, setPriceType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let url = "/courses";
    const params = [];

    if (difficulty) params.push(`difficulty=${difficulty}`);
    if (category) params.push(`category=${category}`);
    if (priceType === "free") params.push(`price=0`);
    if (priceType === "paid") params.push(`price_gt=0`);

    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    api.get(url).then((res) => setCourses(res.data));
  }, [difficulty, category, priceType]);

  const handleEnroll = async (courseId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to enroll");
      navigate("/login");
      return;
    }

    try {
      await api.post("/enrollments/enroll", { courseId });
      alert("Enrolled successfully");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed");
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ background: "var(--color-bg)" }}>

      {/* Hero Section */}
      <div className="hero-bg text-white py-24 px-6">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: "rgba(24,153,163,0.2)", border: "1px solid rgba(24,153,163,0.35)", color: "#2BA8B5" }}>
            ✦ Professional Learning Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-5 leading-tight text-white tracking-tight">
            Learn Skills That{" "}
            <span style={{ background: "linear-gradient(135deg,#2BA8B5,#6EE7F0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Matter
            </span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
            Expert-crafted courses designed to accelerate your career. Learn at your own pace with our
            flexible, industry-focused curriculum.
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="px-6 py-8 -mt-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="card rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-base font-semibold" style={{ color: "var(--color-text-dark)" }}>Filter Courses</span>
              {(difficulty || category || priceType) && (
                <button
                  onClick={() => { setDifficulty(""); setCategory(""); setPriceType(""); }}
                  className="text-xs px-2.5 py-1 rounded-full font-medium transition-colors"
                  style={{ background: "rgba(231,76,60,0.1)", color: "var(--color-error)", border: "1px solid rgba(231,76,60,0.2)" }}
                >
                  Clear filters
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full">
                  <option value="">All Categories</option>
                  <option value="programming">Programming</option>
                  <option value="web">Web Development</option>
                  <option value="data">Data Science</option>
                  <option value="design">Design</option>
                </select>
              </div>
              <div>
                <label className="form-label">Difficulty Level</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full">
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="form-label">Price Type</label>
                <select value={priceType} onChange={(e) => setPriceType(e.target.value)} className="w-full">
                  <option value="">All Prices</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          {courses.length === 0 ? (
            <div className="card rounded-2xl p-16 text-center animate-fadeIn">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-xl font-semibold mb-2" style={{ color: "var(--color-text-dark)" }}>No courses found</p>
              <p style={{ color: "var(--color-text-light)" }}>Try adjusting your filters or browse all courses</p>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                {courses.length} course{courses.length !== 1 ? "s" : ""} available
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((c) => {
                  const diff = DIFFICULTY_COLORS[c.difficulty] || DIFFICULTY_COLORS.beginner;
                  return (
                    <div key={c._id} className="card hover:shadow-xl group overflow-hidden p-0 flex flex-col">
                      {/* Card Header */}
                      <div
                        className="h-40 relative overflow-hidden"
                        style={{ background: "var(--gradient-card)" }}
                      >
                        <div className="absolute inset-0"
                          style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 60%)" }} />
                        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                          <span
                            className="text-xs font-bold px-3 py-1 rounded-full capitalize"
                            style={{ background: diff.bg, color: diff.text, backdropFilter: "blur(8px)" }}
                          >
                            {c.difficulty}
                          </span>
                          {c.price === 0 && (
                            <span className="text-xs font-bold px-3 py-1 rounded-full"
                              style={{ background: "rgba(39,174,96,0.2)", color: "#27AE60", backdropFilter: "blur(8px)" }}>
                              FREE
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex flex-col flex-1">
                        <Link to={`/courses/${c.slug}`} style={{ textDecoration: "none" }}>
                          <h3 className="text-sm font-bold mb-2 leading-snug hover:text-secondary transition-colors line-clamp-2"
                            style={{ color: "var(--color-text-dark)" }}>
                            {c.title}
                          </h3>
                        </Link>

                        <p className="text-xs mb-4 line-clamp-2 flex-1" style={{ color: "var(--color-text-light)" }}>
                          {c.description}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xl font-extrabold" style={{ color: "var(--color-secondary)" }}>
                            {c.price === 0 ? "Free" : `₹${c.price}`}
                          </span>
                          {c.category && (
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                              style={{ background: "var(--color-surface-alt)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}>
                              {c.category}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleEnroll(c._id)}
                          className="btn btn-secondary w-full text-sm py-2.5"
                        >
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

