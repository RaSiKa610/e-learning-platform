import { useState, useEffect } from "react";
import api from "../api/api";

export default function LoginCalendar() {
  const [user, setUser] = useState(null);
  const [month, setMonth] = useState(new Date());

  useEffect(() => {
    api.get("/auth/me").then((res) => setUser(res.data)).catch(() => {});
  }, []);

  if (!user) return null;

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateLogged = (day) => {
    if (!user.loginDates) return false;
    return user.loginDates.some((loginDate) => {
      const d = new Date(loginDate);
      return (
        d.getDate() === day &&
        d.getMonth() === month.getMonth() &&
        d.getFullYear() === month.getFullYear()
      );
    });
  };

  const daysInMonth = getDaysInMonth(month);
  const firstDay = getFirstDayOfMonth(month);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = month.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + 1));
  };

  return (
    <div className="card sticky top-24">
      {/* Streak Display */}
      <div className="text-center mb-6 pb-6" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="text-5xl mb-2">🔥</div>
        <h3 className="text-xl font-bold mb-1" style={{ color: "var(--color-text-dark)" }}>Login Streak</h3>
        <div className="text-5xl font-extrabold text-warning mb-1">
          {user.streak || 0}
        </div>
        <p className="text-sm" style={{ color: "var(--color-text-light)" }}>
          {user.streak === 1 ? "day in a row" : "days in a row"}
        </p>
      </div>

      {/* Calendar */}
      <div>
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePrevMonth}
            className="flex items-center justify-center w-8 h-8 rounded-base hover:bg-secondary hover:text-white transition-colors font-bold"
            style={{ backgroundColor: "var(--color-border)", color: "var(--color-text-dark)" }}
            aria-label="Previous month"
          >
            ←
          </button>
          <h4 className="font-bold text-center flex-1 text-sm" style={{ color: "var(--color-text-dark)" }}>
            {monthName}
          </h4>
          <button
            onClick={handleNextMonth}
            className="flex items-center justify-center w-8 h-8 rounded-base hover:bg-secondary hover:text-white transition-colors font-bold"
            style={{ backgroundColor: "var(--color-border)", color: "var(--color-text-dark)" }}
            aria-label="Next month"
          >
            →
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div
              key={i}
              className="text-center text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--color-text-light)" }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => (
            <div
              key={idx}
              className={`aspect-square flex items-center justify-center text-xs font-semibold rounded-base transition-all ${
                day === null
                  ? "bg-transparent"
                  : isDateLogged(day)
                  ? "bg-success text-white shadow-sm font-bold"
                  : "hover:bg-secondary/10"
              }`}
              style={
                day !== null && !isDateLogged(day)
                  ? { backgroundColor: "var(--color-border)", color: "var(--color-text-light)" }
                  : {}
              }
              title={
                day && isDateLogged(day)
                  ? `Logged in on ${day} ${monthName.split(" ")[0]}`
                  : ""
              }
            >
              {day && day}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-light)" }}>
          <div className="w-3 h-3 rounded-sm bg-success"></div>
          <span>Days you logged in</span>
        </div>
      </div>

      {/* Motivational Message */}
      {user.streak === 0 ? (
        <div className="mt-3 p-3 rounded-base text-center" style={{ backgroundColor: "rgba(24,153,163,0.08)", border: "1px solid rgba(24,153,163,0.2)" }}>
          <p className="text-xs font-semibold text-secondary">
            🎯 Start your streak today!
          </p>
        </div>
      ) : user.streak < 7 ? (
        <div className="mt-3 p-3 rounded-base text-center" style={{ backgroundColor: "rgba(230,126,34,0.08)", border: "1px solid rgba(230,126,34,0.2)" }}>
          <p className="text-xs font-semibold text-warning">
            🚀 Great job! Keep it up!
          </p>
        </div>
      ) : (
        <div className="mt-3 p-3 rounded-base text-center" style={{ backgroundColor: "rgba(39,174,96,0.08)", border: "1px solid rgba(39,174,96,0.2)" }}>
          <p className="text-xs font-semibold text-success">
            ⭐ Amazing streak! Don't break it!
          </p>
        </div>
      )}
    </div>
  );
}
