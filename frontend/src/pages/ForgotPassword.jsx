import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP Verification
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setStep(2);
      setTimer(res.data.expiresIn);

      // Start countdown timer
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/verify-otp", {
        email,
        otp
      });

      // Store verification token and redirect to reset password
      localStorage.setItem("verificationToken", res.data.verificationToken);
      navigate("/reset-password", {
        state: { email, verificationToken: res.data.verificationToken }
      });
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setOtp(""); // Clear OTP field
      setTimer(res.data.expiresIn);

      // Restart countdown
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-light)] px-4 py-12">
      <div className="form-container max-w-md w-full animate-scaleIn">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 dark:bg-secondary/20 mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--color-text-dark)" }}>Reset Password</h1>
          <p className="text-sm" style={{ color: "var(--color-text-light)" }}>We'll help you regain access to your account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="form-error animate-slideIn mb-5 flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Email Entry */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-5">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full"
              />
              <p className="text-xs mt-1.5" style={{ color: "var(--color-text-light)" }}>
                We'll send a verification code to this email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="spinner" style={{ width: "16px", height: "16px" }}></span>
                  Sending OTP…
                </span>
              ) : (
                "Send OTP to Email"
              )}
            </button>

            <div className="pt-4 border-t text-center" style={{ borderColor: "var(--color-border)" }}>
              <p className="text-sm" style={{ color: "var(--color-text-light)" }}>
                Remember your password?{" "}
                <a
                  href="/login"
                  className="text-secondary font-semibold hover:text-secondary-dark transition-colors"
                >
                  Sign in
                </a>
              </p>
            </div>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "rgba(24,153,163,0.08)", border: "1px solid rgba(24,153,163,0.25)" }}>
              <p className="text-sm" style={{ color: "var(--color-text-dark)" }}>
                📧 Verification code sent to
              </p>
              <strong className="block mt-1 font-mono text-sm break-all" style={{ color: "var(--color-secondary)" }}>{email}</strong>
            </div>

            {/* OTP Input */}
            <div className="form-group">
              <label className="form-label">Verification Code</label>
              <input
                type="text"
                placeholder="Enter 8-character code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.toUpperCase())}
                maxLength="8"
                required
                disabled={loading}
                className="w-full font-mono text-center text-lg tracking-widest"
              />
              <p className="text-xs mt-1.5 text-center" style={{ color: "var(--color-text-light)" }}>
                Check your email for the code
              </p>
            </div>

            {/* Timer */}
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-dark)" }}>
                  ⏱️ Code expires in{" "}
                  <span className="font-mono text-secondary">{formatTime(timer)}</span>
                </p>
              ) : (
                <p className="text-sm text-error">Code has expired</p>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || !otp}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="spinner" style={{ width: "16px", height: "16px" }}></span>
                  Verifying…
                </span>
              ) : (
                "Verify & Continue"
              )}
            </button>

            {/* Resend OTP */}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className="btn btn-ghost w-full text-sm"
            >
              Didn't receive code? Resend OTP
            </button>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
                setError("");
              }}
              className="btn btn-outline w-full text-sm"
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
