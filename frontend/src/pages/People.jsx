import { useEffect, useState } from "react";
import api from "../api/api";

export default function People() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [search, setSearch] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    api.get("/follows/users")
      .then((r) => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const sendRequest = async (userId) => {
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await api.post(`/follows/request/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status) => {
    if (status === "pending")
      return (
        <span className="text-xs px-2 py-1 rounded-full font-semibold"
          style={{ background: "rgba(230,126,34,0.1)", color: "#E67E22" }}>
          Pending
        </span>
      );
    if (status === "accepted")
      return (
        <span className="text-xs px-2 py-1 rounded-full font-semibold"
          style={{ background: "rgba(39,174,96,0.1)", color: "var(--color-success)" }}>
          Following ✓
        </span>
      );
    if (status === "rejected")
      return (
        <span className="text-xs px-2 py-1 rounded-full font-semibold"
          style={{ background: "rgba(235,87,87,0.1)", color: "var(--color-danger)" }}>
          Rejected
        </span>
      );
    return null;
  };

  return (
    <div className="min-h-screen transition-colors" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div className="hero-bg text-white py-12 px-6">
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(24,153,163,0.25)", border: "1px solid rgba(24,153,163,0.4)", color: "#6EE7F0" }}>
            👥 Community
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">People</h1>
          <p style={{ color: "rgba(255,255,255,0.6)" }}>
            Follow others to start chatting and sharing study materials
          </p>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Search */}
          <div className="card mb-6">
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm"
              style={{
                background: "var(--color-surface-alt)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-dark)"
              }}
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="spinner spinner-lg mx-auto mb-4"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-14">
              <p className="text-4xl mb-3">👥</p>
              <p className="font-semibold" style={{ color: "var(--color-text-dark)" }}>
                {search ? "No matching users" : "No other users yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((u) => (
                <div key={u._id} className="card flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                    style={{ background: "rgba(24,153,163,0.12)", color: "var(--color-secondary)" }}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: "var(--color-text-dark)" }}>{u.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(u.followStatus)}
                    {!u.followStatus && (
                      <button
                        onClick={() => sendRequest(u._id)}
                        disabled={actionLoading[u._id]}
                        className="btn btn-primary text-xs py-1.5 px-3"
                      >
                        {actionLoading[u._id] ? "…" : "+ Follow"}
                      </button>
                    )}
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
