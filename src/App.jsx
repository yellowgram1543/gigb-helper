import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Placeholder components
const Auth = () => <div style={{ padding: "2rem", textAlign: "center" }}><h2>Helper Login / Signup</h2></div>;
const Home = () => <div style={{ padding: "2rem", textAlign: "center" }}><h2>Available Gigs Map / List</h2></div>;
const TaskDetail = () => <div style={{ padding: "2rem", textAlign: "center" }}><h2>Task Details & Apply</h2></div>;
const ActiveGigs = () => <div style={{ padding: "2rem", textAlign: "center" }}><h2>My Accepted Gigs</h2></div>;
const Chat = () => <div style={{ padding: "2rem", textAlign: "center" }}><h2>Chat with Client</h2></div>;

export default function App() {
  const isAuthenticated = false; // To be integrated with supabase auth state

  return (
    <Router>
      <nav style={{ padding: "1rem", background: "#f5f5f5", display: "flex", gap: "1rem" }}>
        <strong>GigB Helper</strong>
        <a href="/">Home</a>
        <a href="/active">Active Gigs</a>
      </nav>
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
