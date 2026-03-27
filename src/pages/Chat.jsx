import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../api";
import useAuthStore from "../store/authStore";

// Determine socket url by stripping /api from the active API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

const socket = io(SOCKET_URL);

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // If navigated without state, we fallback to finding the title from somewhere else or just default:
  const task = location.state?.task || {
    title: "Client Task",
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.emit("join_room", id);

    const fetchHistory = async () => {
      try {
        const response = await api.get(`/messages/${id}`);
        setMessages(response.data);
      } catch (err) {
        console.error("DEBUG ERROR: Fetching history failed:", err);
      }
    };
    fetchHistory();

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageData = {
      taskId: id,
      sender: user?.id || "anonymous-helper",
      senderName: user?.user_metadata?.full_name || "Helper",
      text: inputText
    };

    socket.emit("send_message", messageData);
    setInputText("");
  };

  return (
    <main style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100vh", 
      maxWidth: "600px", 
      margin: "0 auto",
      background: "white"
    }}>
      <header style={{ 
        padding: "15px 20px", 
        background: "var(--color-secondary, #2563eb)", 
        color: "white",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        zIndex: 10,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: "none", border: "none", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "1.2rem" }}
        >
          ←
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold" }}>Chat with Client</h2>
          <p className="text-small" style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>{task.title}</p>
        </div>
      </header>

      <section style={{ 
        flex: 1, 
        overflowY: "auto", 
        padding: "20px", 
        display: "flex", 
        flexDirection: "column", 
        gap: "15px",
        background: "#f8fafc"
      }}>
        {messages.map((msg, index) => {
          const isMe = msg.sender === user?.id || msg.sender === "anonymous-helper";
          return (
            <div 
              key={msg._id || index} 
              style={{ 
                maxWidth: "80%",
                alignSelf: isMe ? "flex-end" : "flex-start",
                background: isMe ? "#dbeafe" : "white",
                padding: "12px 18px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                position: "relative"
              }}
            >
              {!isMe && <p style={{ fontSize: "0.75rem", fontWeight: "bold", marginBottom: "4px", color: "#1e3a8a" }}>{msg.senderName}</p>}
              <p style={{ margin: 0, fontWeight: 500, fontSize: "1rem", color: "#1e293b", lineHeight: "1.4" }}>{msg.text}</p>
              <p style={{ 
                margin: 0,
                fontSize: "0.7rem", 
                fontWeight: 600, 
                color: "#94a3b8", 
                textAlign: "right",
                marginTop: "6px"
              }}>
                {msg.time}
              </p>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </section>

      <footer style={{ padding: "15px 20px", background: "white", borderTop: "1px solid #e2e8f0" }}>
        <form 
          onSubmit={handleSendMessage}
          style={{ display: "flex", gap: "10px" }}
        >
          <input 
            type="text" 
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ borderRadius: "20px", flex: 1, padding: "12px 20px", border: "1px solid #cbd5e1", fontSize: "1rem" }}
          />
          <button 
            type="submit" 
            style={{ padding: "0 1.5rem", borderRadius: "20px", background: "#2563eb", color: "white", border: "none", fontWeight: "bold", cursor: "pointer" }}
          >
            Send
          </button>
        </form>
      </footer>
    </main>
  );
}
