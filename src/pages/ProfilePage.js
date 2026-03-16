import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Space Mono', monospace",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(124,58,237,0.2)",
          borderRadius: "16px",
          padding: "2.5rem",
          maxWidth: "480px",
          width: "100%",
        }}
      >
        <h1
          style={{
            color: "#7c3aed",
            marginBottom: "1.5rem",
            fontSize: "1.4rem",
          }}
        >
          Profile
        </h1>

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              fontSize: "0.75rem",
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Username
          </label>
          <p style={{ marginTop: "0.25rem", fontSize: "1rem" }}>
            {user?.username}
          </p>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              fontSize: "0.75rem",
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Email
          </label>
          <p style={{ marginTop: "0.25rem", fontSize: "1rem" }}>
            {user?.email}
          </p>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label
            style={{
              fontSize: "0.75rem",
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Role
          </label>
          <p
            style={{
              marginTop: "0.25rem",
              fontSize: "1rem",
              textTransform: "capitalize",
            }}
          >
            {user?.role}
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => navigate("/chat")}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.3)",
              borderRadius: "8px",
              color: "#7c3aed",
              cursor: "pointer",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.85rem",
            }}
          >
            ← Back to Chat
          </button>
          <button
            onClick={handleLogout}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "8px",
              color: "#ef4444",
              cursor: "pointer",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.85rem",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
