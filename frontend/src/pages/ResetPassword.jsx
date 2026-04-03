import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Get verification token from localStorage or location state
  const verificationToken = localStorage.getItem("verificationToken") || location.state?.verificationToken;

  useEffect(() => {
    // Check if user has verification token
    if (!verificationToken) {
      setError("No verification token found. Please start from forgot password.");
      setTimeout(() => navigate("/forgot-password"), 2000);
    }
  }, [verificationToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        token: verificationToken,
        newPassword
      });

      // Clear verification token
      localStorage.removeItem("verificationToken");

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  if (error && !verificationToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-light)]">
        <div className="form-container max-w-md w-full text-center animate-scaleIn">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-lg text-error mb-4">{error}</p>
          <p className="text-sm" style={{ color: "var(--color-text-light)" }}>Redirecting to password reset request…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-light)] px-4 py-12">
      <div className="form-container max-w-md w-full animate-scaleIn">
        {success ? (
          <div className="text-center animate-slideIn">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="text-3xl font-bold text-success mb-2">
              Password Reset!
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-light)" }}>
              Your password has been reset. Redirecting you to login…
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 dark:bg-secondary/20 mb-4">
                <span className="text-3xl">🔑</span>
              </div>
              <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--color-text-dark)" }}>
                Create New Password
              </h1>
              <p className="text-sm" style={{ color: "var(--color-text-light)" }}>
                Enter a strong password for your account
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="form-error animate-slideIn mb-5 flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                <p className="text-xs mt-1.5" style={{ color: "var(--color-text-light)" }}>
                  Minimum 6 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="btn btn-primary w-full mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" style={{ width: "16px", height: "16px" }}></span>
                    Resetting Password…
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>

            {/* Back Link */}
            <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: "var(--color-border)" }}>
              <p className="text-sm" style={{ color: "var(--color-text-light)" }}>
                <a
                  href="/login"
                  className="text-secondary font-semibold hover:text-secondary-dark transition-colors"
                >
                  Back to login
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
