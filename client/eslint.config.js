import "./App.css";

function UserDashboard() {
  return (
    <div className="dashboard">
      <h1>👋 Welcome Back</h1>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>📌 Registered Events</h2>
          <p>View all events you have registered for.</p>
        </div>

        <div className="dashboard-card">
          <h2>✅ Attended Events</h2>
          <p>Track events you attended.</p>
        </div>

        <div className="dashboard-card">
          <h2>📸 My Memories</h2>
          <p>See event photos and memories.</p>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;