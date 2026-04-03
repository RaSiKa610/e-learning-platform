import { useEffect, useState } from "react";
import api from "../api/api";
import LoginCalendar from "../components/LoginCalendar";

export default function Dashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/enrollments/me").then((res) => setEnrollments(res.data));
    api.get("/auth/me").then((res) => setUser(res.data)).catch(() => {});
  }, []);

  const completed = enrollments.filter((e) => e.progressPercent === 100).length;
  const inProgress = enrollments.filter((e) => e.progressPercent > 0 && e.progressPercent < 100).length;

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ background: "var(--color-bg)" }}>

      {/* Welcome Banner */}
      <div className="hero-bg text-white py-12 px-6">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>Welcome back 👋</p>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {user?.name || "Learner"}
              </h1>
              <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                Keep the momentum — your next lesson awaits.
              </p>
            </div>
            {user?.streak > 0 && (
              <div
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "rgba(24,153,163,0.25)", border: "1px solid rgba(24,153,163,0.4)" }}
              >
                🔥 <span>{user.streak}-day streak</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-6 -mt-5 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Enrolled",    value: enrollments.length, icon: "📚", color: "var(--color-secondary)" },
            { label: "In Progress", value: inProgress,          icon: "⚡", color: "var(--color-warning)"   },
            { label: "Completed",   value: completed,           icon: "✅", color: "var(--color-success)"   },
          ].map((s) => (
            <div key={s.label} className="card rounded-xl px-5 py-4 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${s.color}18` }}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-extrabold leading-none" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "var(--color-text-muted)" }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Calendar – left */}
        <div className="lg:col-span-1">
          <LoginCalendar />
        </div>

        {/* Courses – right */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: "var(--color-text-dark)" }}>My Courses</h2>
            <a
              href="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-base transition-colors"
              style={{ background: "rgba(24,153,163,0.1)", color: "var(--color-secondary)", border: "1px solid rgba(24,153,163,0.2)", textDecoration: "none" }}
            >
              + Browse more
            </a>
          </div>

          {enrollments.length === 0 ? (
            <div className="card rounded-2xl p-14 text-center animate-scaleIn">
              <div className="text-5xl mb-4">📖</div>
              <p className="text-base font-semibold mb-2" style={{ color: "var(--color-text-dark)" }}>No courses yet</p>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-light)" }}>Start your learning journey today</p>
              <a href="/" className="btn btn-primary inline-flex" style={{ textDecoration: "none" }}>
                Explore Courses
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrollments.map((e) => (
                <div key={e._id} className="card rounded-2xl overflow-hidden group p-0 flex flex-col">
                  {/* Header */}
                  <div className="h-24 relative overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #2C3E50, #1899A3)" }}>
                    <div className="absolute inset-0"
                      style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
                    {e.progressPercent === 100 && (
                      <div className="absolute top-3 right-3">
                        <span className="text-xs font-bold px-2 py-1 rounded-full"
                          style={{ background: "rgba(39,174,96,0.25)", color: "#4ADE80", border: "1px solid rgba(39,174,96,0.3)" }}>
                          ✓ Done
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-bold mb-3 line-clamp-2 leading-snug" style={{ color: "var(--color-text-dark)" }}>
                      {e.courseId.title}
                    </h3>

                    <div className="mb-4">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Progress</span>
                        <span className="text-xs font-bold" style={{ color: "var(--color-secondary)" }}>{e.progressPercent}%</span>
                      </div>
                      <div className="progress">
                        <div className="progress-bar" style={{ width: `${e.progressPercent}%` }} />
                      </div>
                    </div>

                    <div className="mt-auto">
                      {e.progressPercent === 100 ? (
                        <div className="text-center py-2 rounded-lg"
                          style={{ background: "rgba(39,174,96,0.1)", border: "1px solid rgba(39,174,96,0.2)" }}>
                          <p className="text-xs font-bold" style={{ color: "var(--color-success)" }}>✅ Completed!</p>
                        </div>
                      ) : (
                        <a href={`/courses/${e.courseId.slug}`}
                          className="btn btn-primary block text-center w-full text-xs py-2"
                          style={{ textDecoration: "none" }}>
                          Continue Learning →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
