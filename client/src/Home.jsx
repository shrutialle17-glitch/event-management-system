import "./App.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      <nav className="navbar">
        <h2>🎉 EventHub</h2>

        <div>
          <Link to="/login">
            <button className="nav-btn">Login</button>
          </Link>

          <Link to="/register">
            <button className="register-btn">Register</button>
          </Link>
        </div>
      </nav>

      <section className="hero">
        <h1>Create & Manage Amazing Events</h1>

        <p>
          Discover events, register instantly, manage attendance
          and create unforgettable memories.
        </p>

        <div className="hero-buttons">
          <button className="primary-btn">Get Started</button>
          <button className="secondary-btn">Explore Events</button>
        </div>
      </section>

      <section className="features">
        <div className="card">
          <h3>🎟 Smart Registration</h3>
          <p>Easy and secure event registration system.</p>
        </div>

        <div className="card">
          <h3>📱 QR Attendance</h3>
          <p>Track attendance with QR code scanning.</p>
        </div>

        <div className="card">
          <h3>📸 Event Memories</h3>
          <p>Upload and share event photos and moments.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;