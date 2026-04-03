import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function CourseTimetable() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/enrollments/me")
      .then((r) => setEnrollments(r.data))
      .catch(() => {});
  }, []);

  const fetchTimetable = async (courseId) => {
    if (!courseId) return;
    setLoading(true);
    setError("");
    setTimetable(null);
    try {
      const { data } = await api.get(`/timetable/${courseId}`);
      setTimetable(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate timetable");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (e) => {
    const id = e.target.value;
    setSelectedCourseId(id);
    fetchTimetable(id);
  };

  // Difficulty labels available for future color-coding

  return (
    <div className="min-h-screen transition-colors" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div className="hero-bg text-white py-12 px-6">
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(24,153,163,0.25)", border: "1px solid rgba(24,153,163,0.4)", color: "#6EE7F0" }}>
            🤖 AI Timetable
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
            Personalized Study Schedule
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)" }}>
            AI-generated completion timeline based on your learning patterns
          </p>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-3xl mx-auto">

          {/* Course selector */}
          <div className="card mb-6">
            <label className="form-label block mb-2">Select a course to generate your timetable</label>
            <select
              className="w-full rounded-lg px-4 py-2.5 text-sm"
              style={{
                background: "var(--color-surface-alt)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-dark)"
              }}
              value={selectedCourseId}
              onChange={handleSelect}
            >
              <option value="">Choose a course…</option>
              {enrollments.map((en) => (
                <option key={en._id} value={en.courseId._id}>
                  {en.courseId.title} — {en.progressPercent}% complete
                </option>
              ))}
            </select>
            {enrollments.length === 0 && (
              <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
                You need to be enrolled in a course first.{" "}
                <button onClick={() => navigate("/")} className="underline" style={{ color: "var(--color-secondary)" }}>
                  Browse courses
                </button>
              </p>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-10">
              <div className="spinner spinner-lg mx-auto mb-3"></div>
              <p style={{ color: "var(--color-text-muted)" }}>Generating your personalised timetable…</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="form-error flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Timetable result */}
          {timetable && !loading && (
            <div className="space-y-5 animate-fadeIn">
              {/* Summary card */}
              <div className="card">
                <h2 className="text-base font-bold mb-4" style={{ color: "var(--color-text-dark)" }}>
                  {timetable.course.title}
                </h2>

                {timetable.completed ? (
                  <div className="text-center py-6">
                    <p className="text-4xl mb-3">🎉</p>
                    <p className="font-bold text-lg" style={{ color: "var(--color-success)" }}>
                      {timetable.message}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                      {[
                        { label: "Total Lessons", value: timetable.course.totalLessons, icon: "📚" },
                        { label: "Completed", value: timetable.course.completedLessons, icon: "✅" },
                        { label: "Remaining", value: timetable.remainingLessons, icon: "⏳" },
                        { label: "Lessons/Day", value: timetable.lessonsPerDay, icon: "⚡" }
                      ].map((s) => (
                        <div key={s.label} className="text-center p-3 rounded-xl"
                          style={{ background: "var(--color-surface-alt)", border: "1px solid var(--color-border)" }}>
                          <p className="text-xl mb-1">{s.icon}</p>
                          <p className="text-xl font-extrabold" style={{ color: "var(--color-secondary)" }}>{s.value}</p>
                          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{s.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "rgba(24,153,163,0.06)", border: "1px solid rgba(24,153,163,0.2)" }}>
                      <span className="text-2xl">📅</span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-0.5"
                          style={{ color: "var(--color-text-muted)" }}>Estimated Completion</p>
                        <p className="font-bold" style={{ color: "var(--color-secondary)" }}>
                          {new Date(timetable.estimatedCompletionDate).toLocaleDateString("en-US", {
                            weekday: "long", year: "numeric", month: "long", day: "numeric"
                          })}
                        </p>
                      </div>
                    </div>

                    {timetable.streak > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-sm"
                        style={{ color: "var(--color-text-muted)" }}>
                        <span>🔥</span>
                        <span>Your {timetable.streak}-day streak boosted your schedule efficiency!</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Day-by-day schedule */}
              {!timetable.completed && timetable.schedule?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold mb-3 uppercase tracking-wide"
                    style={{ color: "var(--color-text-muted)" }}>Day-by-Day Schedule</h3>
                  <div className="space-y-3">
                    {timetable.schedule.map((day, i) => (
                      <div key={day.date} className="card py-3 px-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ background: "rgba(24,153,163,0.1)", color: "var(--color-secondary)" }}>
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-sm" style={{ color: "var(--color-text-dark)" }}>
                                {day.day}, {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </p>
                              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                ~{day.totalMinutes} min
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold px-2 py-1 rounded-full"
                            style={{ background: "rgba(24,153,163,0.1)", color: "var(--color-secondary)" }}>
                            {day.lessons.length} lesson{day.lessons.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {day.lessons.map((lesson, j) => (
                            <li key={j} className="flex items-center gap-2 text-xs"
                              style={{ color: "var(--color-text-light)" }}>
                              <span style={{ color: "var(--color-secondary)" }}>▸</span>
                              {lesson.title}
                              <span className="ml-auto opacity-60">{lesson.estimatedMinutes} min</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
