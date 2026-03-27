import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import useAuthStore from "../store/authStore";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/tasks/${id}`);
        setTask(response.data);
      } catch (err) {
        console.error("Error fetching task:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleAcceptGig = async () => {
    setIsAccepting(true);
    try {
      await api.patch(`/tasks/${id}`, {
        status: "ASSIGNED",
        helper: {
          name: user?.user_metadata?.full_name || "Verified Helper",
          rating: "5.0", // Hardcoded rating for MVP
          reviews: 1
        }
      });
      // Task accepted successfully! Redirect them to their active gigs (or chat).
      navigate("/active");
    } catch (err) {
      console.error("Error accepting task:", err);
      alert("Failed to accept this gig. Someone else may have grabbed it!");
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <main style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "#6b7280" }}>Loading gig details...</h2>
      </main>
    );
  }

  if (!task) {
    return (
      <main style={{ padding: "40px", textAlign: "center" }}>
        <h2>Job not found!</h2>
        <button className="btn btn-secondary" onClick={() => navigate("/")}>Go Back</button>
      </main>
    );
  }

  return (
    <main style={{ padding: "20px 20px 80px", maxWidth: "800px", margin: "0 auto" }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: "none", border: "none", color: "#4b5563", fontWeight: "bold", cursor: "pointer", marginBottom: "1rem", display: "flex", gap: "5px", alignItems: "center" }}
      >
        ← Back to Map
      </button>

      <div className="card" style={{ 
        background: "white", 
        borderRadius: "16px", 
        padding: "2rem", 
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        borderTop: "8px solid #2563eb"
      }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <span style={{ 
              background: task.status === "OPEN" ? "#dcfce7" : "#f1f5f9",
              color: task.status === "OPEN" ? "#166534" : "#475569",
              padding: "4px 12px", 
              borderRadius: "20px", 
              fontWeight: 800, 
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "1px"
            }}>
              {task.status}
            </span>
            <h1 style={{ marginTop: "1rem", marginBottom: "0", fontSize: "2.2rem", color: "#111827", lineHeight: "1.2" }}>
              {task.title}
            </h1>
          </div>
          <div style={{ textAlign: "right", background: "#f8fafc", padding: "1rem", borderRadius: "12px", border: "2px solid #e2e8f0" }}>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", fontWeight: "bold" }}>PAYOUT</p>
            <p style={{ margin: 0, fontSize: "2rem", fontWeight: 900, color: "#16a34a" }}>₹{task.budget}</p>
          </div>
        </div>
        
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ color: "#475569", fontSize: "1rem", marginBottom: "0.5rem", textTransform: "uppercase" }}>Job Description</h3>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#334155", whiteSpace: "pre-wrap" }}>
            {task.description}
          </p>
        </div>
        
        {task.imageUrl && (
          <div style={{ marginBottom: "2rem", borderRadius: "12px", overflow: "hidden", border: "2px solid #e2e8f0", maxHeight: "400px", display: "flex", justifyContent: "center", background: "#f8fafc" }}>
            <img src={task.imageUrl} alt={task.title} style={{ maxWidth: "100%", height: "auto", objectFit: "contain" }} />
          </div>
        )}
        
        <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "12px", marginBottom: "2rem", border: "1px solid #e2e8f0" }}>
          <h3 style={{ color: "#475569", fontSize: "0.9rem", margin: "0 0 5px 0", textTransform: "uppercase" }}>Location</h3>
          <p style={{ fontWeight: 700, margin: 0, fontSize: "1.1rem", color: "#0f172a" }}>📍 {task.address}</p>
        </div>

      </div>

      {/* FLOATING ACTION BAR FOR ACCEPTING */}
      {task.status === "OPEN" ? (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "white",
          padding: "20px",
          boxShadow: "0 -4px 10px rgba(0,0,0,0.05)",
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          zIndex: 100,
          borderTop: "1px solid #e2e8f0"
        }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: "15px 30px", fontSize: "1.1rem", borderRadius: "12px", fontWeight: "bold" }}
            onClick={() => navigate("/")}
          >
            Not Interested
          </button>
          
          <button 
            className="btn btn-primary" 
            style={{ 
              padding: "15px 40px", 
              fontSize: "1.1rem", 
              borderRadius: "12px", 
              background: "#2563eb", 
              color: "white",
              border: "none",
              fontWeight: "bold",
              cursor: isAccepting ? "not-allowed" : "pointer",
              boxShadow: "0 4px 6px rgba(37, 99, 235, 0.3)"
            }}
            onClick={handleAcceptGig}
            disabled={isAccepting}
          >
            {isAccepting ? "Accepting..." : "✓ Accept & Claim Gig"}
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "2rem", marginTop: "2rem", background: "#f1f5f9", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
          <h3 style={{ margin: 0, color: "#475569" }}>This job is no longer available.</h3>
          <p style={{ margin: "5px 0 0 0", color: "#64748b" }}>Status: {task.status}</p>
        </div>
      )}
    </main>
  );
}
