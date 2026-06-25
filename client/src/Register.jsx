import { Link } from "react-router-dom";
import "./App.css";

function Register() {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>🚀 Join EventHub</h1>
        <p>
          Create your account and start managing
          amazing events today.
        </p>
      </div>

      <div className="auth-card">
        <h2>Create Account</h2>

        <input type="text" placeholder="Full Name" />
        <input type="email" placeholder="Email Address" />
        <input type="password" placeholder="Password" />
        <input type="password" placeholder="Confirm Password" />

        <select
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: "15px",
            borderRadius: "10px",
          }}
        >
          <option>User</option>
          <option>Organizer</option>
        </select>

        <button className="auth-btn">Register</button>

        <p style={{ marginTop: "15px" }}>
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;