import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const TYPE_ICONS = {
  enrolled: "📚",
  unenrolled: "📤",
  follow_request: "👥",
  follow_accepted: "✅",
  follow_rejected: "❌"
};

const TYPE_LABELS = {
  enrolled: "Enrollment",
  unenrolled: "Unenrollment",
  follow_request: "Follow Request",
  follow_accepted: "Follow Accepted",
  follow_rejected: "Follow Rejected"
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchNotifications = () => {
    setLoading(true);
    api
      .get("/notifications")
      .then((r) => setNotifications(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = async () => {
    await api.put("/notifications/read-all").catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleAccept = async (notif) => {
    if (!notif.followId) return;
    setActionLoading((prev) => ({ ...prev, [notif._id]: "accepting" }));
    try {
      await api.put(`/follows/${notif.followId}/accept`);
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept");
    } finally {
      setActionLoading((prev) => ({ ...prev, [notif._id]: null }));
    }
  };

  const handleReject = async (notif) => {
    if (!notif.followId) return;
    setActionLoading((prev) => ({ ...prev, [notif._id]: "rejecting" }));
    try {
      await api.put(`/follows/${notif.followId}/reject`);
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoading((prev) => ({ ...prev, [notif._id]: null }));
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen transition-colors" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div className="hero-bg text-white py-10 px-6">
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(24,153,163,0.25)", border: "1px solid rgba(24,153,163,0.4)", color: "#6EE7F0" }}>
            🔔 Notifications
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Notifications</h1>
              <p style={{ color: "rgba(255,255,255,0.6)" }}>
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="btn text-sm px-4 py-2"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="spinner spinner-lg mx-auto mb-4"></div>
              <p style={{ color: "var(--color-text-muted)" }}>Loading notifications…</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="card text-center py-14">
              <p className="text-4xl mb-3">🔔</p>
              <p className="font-semibold mb-1" style={{ color: "var(--color-text-dark)" }}>No notifications yet</p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                You&apos;ll see course enrollments, follow requests and more here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => !notif.read && markRead(notif._id)}
                className="card cursor-pointer transition-all"
                style={{
                  borderLeft: notif.read ? "3px solid transparent" : "3px solid var(--color-secondary)",
                  opacity: notif.read ? 0.8 : 1
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "rgba(24,153,163,0.1)" }}>
                    {TYPE_ICONS[notif.type] || "📣"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(24,153,163,0.1)", color: "var(--color-secondary)" }}>
                        {TYPE_LABELS[notif.type] || notif.type}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full inline-block"
                          style={{ background: "var(--color-secondary)" }} />
                      )}
                    </div>
                    <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-dark)" }}>
                      {notif.message}
                    </p>
                    {notif.relatedCourse && (
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        Course: {notif.relatedCourse.title}
                      </p>
                    )}
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                      {formatDate(notif.createdAt)}
                    </p>

                    {/* Accept / Reject buttons for follow requests */}
                    {notif.type === "follow_request" && notif.followId && !notif.read && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAccept(notif); }}
                          disabled={!!actionLoading[notif._id]}
                          className="btn btn-primary text-xs py-1.5 px-4"
                        >
                          {actionLoading[notif._id] === "accepting" ? "…" : "Accept"}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReject(notif); }}
                          disabled={!!actionLoading[notif._id]}
                          className="btn btn-danger text-xs py-1.5 px-4"
                        >
                          {actionLoading[notif._id] === "rejecting" ? "…" : "Reject"}
                        </button>
                      </div>
                    )}

                    {notif.type === "follow_accepted" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/chat/${notif.relatedUser?._id}`);
                        }}
                        className="btn btn-primary text-xs py-1.5 px-4 mt-2"
                      >
                        💬 Start Chat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
