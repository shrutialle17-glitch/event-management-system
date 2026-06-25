import "./App.css";

function ForgotPassword() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password 🔑</h2>

        <input
          type="email"
          placeholder="Enter your email"
        />

        <button className="auth-btn">
          Send Reset Link
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;