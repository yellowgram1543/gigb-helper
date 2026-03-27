import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import useAuthStore from "../store/authStore";
import { motion } from "framer-motion";

export default function ActiveGigs() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveGigs = async () => {
      try {
        const response = await api.get("/tasks");
        
        // For our MVP, we filter for gigs that:
        // 1. Are NOT OPEN (so they are ASSIGNED, COMPLETED, or PAID)
        // 2. Are assigned specifically to this current logged-in Helper
        const myGigs = response.data.filter(
          task => task.status !== "OPEN" && task.helper?.name === user?.name
        );
        
        setTasks(myGigs);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchActiveGigs();
    }
  }, [user]);

  return (
    <main style={{ padding: "0 20px 40px", maxWidth: "1000px", margin: "0 auto" }}>
      <header style={{ padding: "2rem 0", marginBottom: "1rem", borderBottom: "2px solid #e5e7eb" }}>
        <h1 style={{ marginBottom: "0.2rem", color: "#111827", fontSize: "2rem" }}>
          My Active Gigs
        </h1>
        <p style={{ fontWeight: 600, color: "#6b7280" }}>
          {loading ? "Loading your jobs..." : `You have ${tasks.filter(t => t.status === "ASSIGNED").length} ongoing jobs.`}
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", padding: "5rem" }}>
          <h2 style={{ color: "#6b7280" }}>Loading your accepted gigs...</h2>
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem", background: "#f3f4f6", borderRadius: "12px", border: "2px dashed #d1d5db" }}>
          <h2 style={{ color: "#374151" }}>No jobs yet!</h2>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>Head to the dashboard to find open gigs near you.</p>
          <button className="btn btn-primary" onClick={() => navigate("/")} style={{ background: "#2563eb", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
            Find Gigs Now
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {tasks.map((task, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={task._id} 
              className="card" 
              style={{ 
                background: "#ffffff", 
                padding: "1.5rem 2rem", 
                borderRadius: "12px", 
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                borderLeft: task.status === "PAID" ? "6px solid #16a34a" 
                          : task.status === "COMPLETED" ? "6px solid #eab308" 
                          : "6px solid #8b5cf6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ display: "flex", gap: "15px", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ 
                    background: task.status === "PAID" ? "#dcfce7" 
                              : task.status === "COMPLETED" ? "#fef9c3" 
                              : "#f3e8ff",
                    color: task.status === "PAID" ? "#166534" 
                         : task.status === "COMPLETED" ? "#854d0e" 
                         : "#6b21a8",
                    padding: "4px 12px", 
                    borderRadius: "20px", 
                    fontWeight: 800, 
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px"
                  }}>
                    {task.status}
                  </span>
                  <div style={{ fontWeight: "bold", color: "#16a34a", fontSize: "1.1rem" }}>
                    ₹{task.budget}
                  </div>
                </div>
                
                <h3 style={{ margin: "0.5rem 0", fontSize: "1.4rem", color: "#111827" }}>
                  {task.title}
                </h3>
                
                <p style={{ margin: "0", color: "#6b7280", fontSize: "0.95rem" }}>
                  📍 {task.address}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button 
                  style={{ background: "#f8fafc", color: "#334155", padding: "10px 20px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "bold", cursor: "pointer" }}
                  onClick={() => navigate(`/task/${task._id}`)}
                >
                  View Job
                </button>
                
                {task.status === "ASSIGNED" && (
                  <button 
                    style={{ background: "#8b5cf6", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer" }}
                    onClick={() => navigate(`/chat/${task._id}`)}
                  >
                    💬 Chat with Client
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
