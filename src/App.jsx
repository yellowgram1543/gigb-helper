import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import useAuthStore from "./store/authStore";

// Placeholder components
const Home = () => <div style={{ padding: "2rem", textAlign: "center" }}><h2>Available Gigs Map / List</h2></div>;
const TaskDetail = () => <div style={{ padding: "2rem", textAlign: "center" }}><h2>Task Details & Apply</h2></div>;
const ActiveGigs = () => <div style={{ padding: "2rem", textAlign: "center" }}><h2>My Accepted Gigs</h2></div>;
const Chat = () => <div style={{ padding: "2rem", textAlign: "center" }}><h2>Chat with Client</h2></div>;

export default function App() {
  const { isAuthenticated, initialize, isLoading, logout } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading Helper App...</p>
      </div>
    );
  }

  return (
    <Router>
      {isAuthenticated && (
        <nav style={{ padding: "1rem", background: "#f5f5f5", display: "flex", gap: "1rem", alignItems: "center" }}>
          <strong>GigB Helper Dashboard</strong>
          <a href="/">Find Gigs</a>
          <a href="/active">My Gigs</a>
          <button onClick={logout} style={{ marginLeft: "auto", cursor: "pointer", padding: "0.5rem", borderRadius: "8px", border: "1px solid red", color: "red", background: "white" }}>
            Logout
          </button>
        </nav>
      )}
      
      <Routes>
        <Route 
          path="/auth" 
          element={isAuthenticated ? <Navigate to="/" /> : <Auth />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Home /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/task/:id" 
          element={isAuthenticated ? <TaskDetail /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/active" 
          element={isAuthenticated ? <ActiveGigs /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/chat/:id" 
          element={isAuthenticated ? <Chat /> : <Navigate to="/auth" />} 
        />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}
