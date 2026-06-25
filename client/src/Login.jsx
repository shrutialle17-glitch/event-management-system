import { Link } from "react-router-dom";
import "./App.css";

function Login() {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>🎉 EventHub</h1>
        <p>
          Manage events, registrations and memories
          from one powerful platform.
        </p>
      </div>

      <div className="auth-card">
        <h2>Welcome Back 👋</h2>

        <input type="email" placeholder="Email Address" />
        <input type="password" placeholder="Password" />

        <button className="auth-btn">Login</button>

        <Link to="/forgot-password" className="auth-link">
          Forgot Password?
        </Link>

        <p>
          Don't have an account?
          <Link to="/register"> Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;