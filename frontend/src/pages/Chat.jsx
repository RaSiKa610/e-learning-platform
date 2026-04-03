import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [mutualUsers, setMutualUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [materialCourseId, setMaterialCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [me, setMe] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch the current user and mutual follows
  useEffect(() => {
    api.get("/auth/me").then((r) => setMe(r.data)).catch(() => {});
    api.get("/follows/mutual").then((r) => setMutualUsers(r.data)).catch(() => {});
    api.get("/enrollments/me").then((r) => setMyEnrollments(r.data)).catch(() => {});
  }, []);

  // Pre-select user from URL param
  useEffect(() => {
    if (userId && mutualUsers.length > 0) {
      const found = mutualUsers.find((u) => u._id === userId);
      if (found) setSelectedUser(found);
    }
  }, [userId, mutualUsers]);

  const loadMessages = useCallback(() => {
    if (!selectedUser) return;
    api.get(`/messages/${selectedUser._id}`)
      .then((r) => setMessages(r.data))
      .catch(() => {});
  }, [selectedUser]);

  // Load messages when selected user changes
  useEffect(() => {
    if (!selectedUser) return;
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedUser, loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load study materials for a chosen course
  const loadMaterials = (courseId) => {
    setMaterialCourseId(courseId);
    if (!courseId) {
      setStudyMaterials([]);
      return;
    }
    api.get(`/study-materials?courseId=${courseId}`)
      .then((r) => setStudyMaterials(r.data))
      .catch(() => setStudyMaterials([]));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!text.trim() && !imageFile && !selectedMaterial) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      if (text.trim()) formData.append("text", text.trim());
      if (imageFile) formData.append("image", imageFile);
      if (selectedMaterial) formData.append("studyMaterialId", selectedMaterial);

      await api.post(`/messages/${selectedUser._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setText("");
      setImageFile(null);
      setSelectedMaterial(null);
      loadMessages();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen transition-colors" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div className="hero-bg text-white py-10 px-6">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(24,153,163,0.25)", border: "1px solid rgba(24,153,163,0.4)", color: "#6EE7F0" }}>
            💬 Messages
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Chat</h1>
          <p style={{ color: "rgba(255,255,255,0.6)" }}>Message your mutual connections</p>
        </div>
      </div>

      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto flex gap-6" style={{ minHeight: "60vh" }}>
          {/* Sidebar – contacts */}
          <div className="w-64 flex-shrink-0">
            <div className="card h-full overflow-y-auto">
              <h2 className="text-sm font-bold mb-4" style={{ color: "var(--color-text-dark)" }}>
                Mutual Follows
              </h2>
              {mutualUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">👥</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    No mutual follows yet.
                  </p>
                  <button
                    onClick={() => navigate("/notifications")}
                    className="btn btn-primary text-xs mt-3 py-1.5 px-3"
                  >
                    Find People
                  </button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {mutualUsers.map((u) => (
                    <li key={u._id}>
                      <button
                        onClick={() => { setSelectedUser(u); setError(""); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${selectedUser?._id === u._id ? "font-semibold" : ""}`}
                        style={{
                          background: selectedUser?._id === u._id ? "rgba(24,153,163,0.12)" : "transparent",
                          color: selectedUser?._id === u._id ? "var(--color-secondary)" : "var(--color-text-light)",
                          border: selectedUser?._id === u._id ? "1px solid rgba(24,153,163,0.3)" : "1px solid transparent"
                        }}
                      >
                        <span className="w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-bold mr-2"
                          style={{ background: "rgba(24,153,163,0.15)", color: "var(--color-secondary)" }}>
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                        {u.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Chat window */}
          <div className="flex-1 flex flex-col card" style={{ minHeight: "60vh" }}>
            {!selectedUser ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <p className="text-5xl mb-4">💬</p>
                  <p className="font-semibold mb-1" style={{ color: "var(--color-text-dark)" }}>Select a conversation</p>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    Choose someone from your mutual follows to chat with
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="pb-4 mb-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: "rgba(24,153,163,0.15)", color: "var(--color-secondary)" }}>
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--color-text-dark)" }}>{selectedUser.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Mutual connection</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4" style={{ maxHeight: "45vh" }}>
                  {messages.length === 0 && (
                    <p className="text-center text-sm py-6" style={{ color: "var(--color-text-muted)" }}>
                      No messages yet. Say hello! 👋
                    </p>
                  )}
                  {messages.map((msg) => {
                    const isMe = msg.sender._id === me?._id || msg.sender === me?._id;
                    return (
                      <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div
                          className="max-w-xs rounded-xl px-4 py-2.5 text-sm shadow-sm"
                          style={{
                            background: isMe ? "var(--color-secondary)" : "var(--color-surface-alt)",
                            color: isMe ? "#fff" : "var(--color-text-dark)",
                            borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px"
                          }}
                        >
                          {msg.text && <p className="mb-1">{msg.text}</p>}
                          {msg.imageUrl && (
                            <img
                              src={`https://e-learning-platform-k1kg.onrender.com${msg.imageUrl}`}
                              alt="shared"
                              className="rounded-lg max-w-full mt-1"
                              style={{ maxHeight: "200px" }}
                            />
                          )}
                          {msg.studyMaterial && (
                            <div className="mt-1 p-2 rounded-lg text-xs"
                              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
                              <p className="font-semibold">📎 {msg.studyMaterial.title}</p>
                              <p className="opacity-75 capitalize">{msg.studyMaterial.type}</p>
                              {["youtube", "hyperlink"].includes(msg.studyMaterial.type) ? (
                                <a href={msg.studyMaterial.url} target="_blank" rel="noreferrer"
                                  className="underline block mt-0.5 opacity-90">Open link</a>
                              ) : (
                                <a href={`https://e-learning-platform-k1kg.onrender.com${msg.studyMaterial.url}`}
                                  target="_blank" rel="noreferrer"
                                  className="underline block mt-0.5 opacity-90">View file</a>
                              )}
                            </div>
                          )}
                          <p className="text-xs mt-1 opacity-60">{formatTime(msg.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Error */}
                {error && (
                  <div className="form-error mb-3 text-xs flex items-center gap-2">
                    <span>⚠️</span> {error}
                  </div>
                )}

                {/* Compose */}
                <form onSubmit={handleSend} className="space-y-3">
                  {/* Study material picker */}
                  <div className="flex gap-2">
                    <select
                      className="flex-1 text-xs rounded-lg px-3 py-2"
                      style={{ background: "var(--color-surface-alt)", border: "1px solid var(--color-border)", color: "var(--color-text-light)" }}
                      value={materialCourseId}
                      onChange={(e) => { loadMaterials(e.target.value); setSelectedMaterial(null); }}
                    >
                      <option value="">📚 Share a study material (optional)</option>
                      {myEnrollments.map((en) => (
                        <option key={en._id} value={en.courseId._id}>
                          {en.courseId.title}
                        </option>
                      ))}
                    </select>
                    {studyMaterials.length > 0 && (
                      <select
                        className="flex-1 text-xs rounded-lg px-3 py-2"
                        style={{ background: "var(--color-surface-alt)", border: "1px solid var(--color-border)", color: "var(--color-text-light)" }}
                        value={selectedMaterial || ""}
                        onChange={(e) => setSelectedMaterial(e.target.value || null)}
                      >
                        <option value="">Choose material…</option>
                        {studyMaterials.map((m) => (
                          <option key={m._id} value={m._id}>{m.title} ({m.type})</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="flex gap-2 items-center">
                    {/* Image upload */}
                    <label className="cursor-pointer p-2 rounded-lg transition-colors"
                      style={{ background: "var(--color-surface-alt)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}
                      title="Attach image">
                      🖼️
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => setImageFile(e.target.files[0] || null)} />
                    </label>
                    {imageFile && (
                      <span className="text-xs px-2 py-1 rounded-full"
                        style={{ background: "rgba(24,153,163,0.1)", color: "var(--color-secondary)" }}>
                        {imageFile.name}
                        <button type="button" onClick={() => setImageFile(null)} className="ml-1 opacity-60">×</button>
                      </span>
                    )}

                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Type a message…"
                      className="flex-1 rounded-xl px-4 py-2.5 text-sm"
                      style={{
                        background: "var(--color-surface-alt)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-dark)"
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                    />
                    <button type="submit" disabled={loading} className="btn btn-primary px-4 py-2.5 text-sm">
                      {loading ? "…" : "Send"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
