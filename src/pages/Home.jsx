import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import useAuthStore from "../store/authStore";
import TaskMap from "../components/TaskMap";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpenTasks = async () => {
      try {
        const response = await api.get("/tasks");
        // We only want gigs that are OPEN and nobody has accepted yet!
        const openGigs = response.data.filter(task => task.status === "OPEN");
        setTasks(openGigs);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpenTasks();
  }, []);

  return (
    <main style={{ padding: "0 20px 40px", maxWidth: "1400px", margin: "0 auto" }}>
      <header style={{ padding: "2rem 0", marginBottom: "1rem", borderBottom: "2px solid #e5e7eb" }}>
        <h1 style={{ marginBottom: "0.2rem", color: "#111827", fontSize: "2rem" }}>
          Find Local Gigs
        </h1>
        <p style={{ fontWeight: 600, color: "#6b7280" }}>
          {loading ? "Scanning your neighborhood..." : `Found ${tasks.length} open jobs waiting for you.`}
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", padding: "5rem" }}>
          <h2 style={{ color: "#6b7280" }}>Loading nearby gigs...</h2>
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem", background: "#f3f4f6", borderRadius: "12px", border: "2px dashed #d1d5db" }}>
          <h2 style={{ color: "#374151" }}>No open gigs nearby!</h2>
          <p style={{ color: "#6b7280" }}>Check back later or expand your search area.</p>
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "24px",
          alignItems: "start"
        }}>
          
          {/* LEFT PANE: SCROLLABLE LIST OF GIGS */}
          <section style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "75vh", overflowY: "auto", paddingRight: "10px" }}>
            {tasks.map((task, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={task._id} 
                className="card" 
                style={{ 
                  background: "#ffffff", 
                  padding: "1.5rem", 
                  borderRadius: "12px", 
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  cursor: "pointer",
                  borderLeft: "6px solid #2563eb",
                  transition: "transform 0.2s"
                }}
                onClick={() => navigate(`/task/${task._id}`)}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <h3 style={{ margin: "0", fontSize: "1.25rem", color: "#111827", lineHeight: "1.4" }}>
                    {task.title}
                  </h3>
                  <div style={{ background: "#dbeafe", color: "#1d4ed8", padding: "4px 12px", borderRadius: "20px", fontWeight: "bold", fontSize: "1.1rem" }}>
                    ₹{task.budget}
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "5px", alignItems: "center", marginBottom: "1rem", color: "#6b7280", fontSize: "0.9rem", fontWeight: "600" }}>
                  📍 {task.address}
                </div>
                
                <p style={{ margin: "0 0 1rem 0", color: "#4b5563", fontSize: "0.95rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {task.description}
                </p>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button 
                    style={{ background: "#2563eb", color: "#ffffff", padding: "8px 16px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents the card click from overriding the button
                      navigate(`/task/${task._id}`);
                    }}
                  >
                    View & Apply
                  </button>
                </div>
              </motion.div>
            ))}
          </section>

          {/* RIGHT PANE: MAP VIEW */}
          <aside style={{ height: "75vh", position: "sticky", top: "20px" }}>
            <TaskMap tasks={tasks} />
          </aside>
          
        </div>
      )}
    </main>
  );
}
