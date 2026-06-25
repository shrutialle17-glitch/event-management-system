import "./App.css";

function UserDashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>👋 Welcome Back</h1>
        <p>Manage your events and memories</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>📌 Registered Events</h2>
          <p>View all your registered events.</p>
        </div>

        <div className="dashboard-card">
          <h2>✅ Attended Events</h2>
          <p>Track events you have attended.</p>
        </div>

        <div className="dashboard-card">
          <h2>📸 My Memories</h2>
          <p>Access event photos and memories.</p>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;