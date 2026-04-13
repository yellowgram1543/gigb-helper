import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../api";
import useAuthStore from "../store/authStore";

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

  const task = location.state?.task || {
    title: "ACTIVE OPERATION",
    helper: { name: "CLIENT" }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user) return;

    socket.emit("join_room", { taskId: id, userId: user.id });

    const fetchHistory = async () => {
      try {
        const response = await api.get(`/messages/${id}`);
        setMessages(response.data);
      } catch (err) {
        console.error("Fetch history failed:", err);
      }
    };
    fetchHistory();

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("error", (e) => {
      console.error("Socket error:", e.message);
    });

    return () => {
      socket.off("receive_message");
      socket.off("error");
    };
  }, [id, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const messageData = {
      taskId: id,
      senderId: user.id,
      senderName: user.user_metadata?.full_name || "HELPER",
      content: inputText
    };

    socket.emit("send_message", messageData);
    setInputText("");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <div className="card-neo bg-error-container p-8 text-center">
           <h2 className="text-2xl uppercase mb-2">Access Denied</h2>
           <p className="font-headline font-black uppercase text-xs">You must be logged in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto neo-border bg-surface-container shadow-[8px_8px_0px_0px_rgba(48,52,44,1)] overflow-hidden">
      {/* HEADER */}
      <header className="p-4 bg-surface-container-lowest border-b-[3px] border-on-surface flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-8 h-8 neo-border bg-tertiary-container flex items-center justify-center neo-interactive"
          >
            <span className="material-symbols-outlined text-sm font-black">arrow_back</span>
          </button>
          <div>
            <h2 className="text-lg uppercase m-0 leading-none mb-1 italic">HQ / {task.helper?.name || "CURATOR"}</h2>
            <p className="font-headline font-black text-[8px] uppercase tracking-widest opacity-50">{task.title}</p>
          </div>
        </div>
        <div className="badge-neo bg-secondary-container px-2 py-0.5 text-[8px]">
           SECURE LINK
        </div>
      </header>

      {/* MESSAGES AREA */}
      <section className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar bg-surface">
        {messages.map((msg, index) => {
          const isMe = msg.sender === user?.id;
          return (
            <div 
              key={msg._id || index} 
              className={`max-w-[80%] flex flex-col ${isMe ? "self-end items-end" : "self-start items-start"}`}
            >
              {!isMe && (
                <span className="font-headline font-black text-[8px] uppercase tracking-widest mb-1 ml-1 opacity-60 text-secondary">
                  {msg.senderName}
                </span>
              )}
              <div 
                className={`card-neo py-2 px-4 relative ${
                  isMe ? "bg-secondary-container shadow-[-2px_2px_0px_0px_rgba(48,52,44,1)]" : "bg-surface-container-lowest shadow-[4px_4px_0px_0px_rgba(48,52,44,1)]"
                }`}
              >
                <p className="font-body font-bold text-xs leading-tight">
                  {msg.text}
                </p>
                <p className="font-headline font-black text-[7px] opacity-40 text-right mt-1 uppercase">
                  {msg.time || "00:00"}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </section>

      {/* INPUT AREA */}
      <footer className="p-4 bg-surface-container-lowest border-t-[3px] border-on-surface">
        <form 
          onSubmit={handleSendMessage}
          className="flex gap-2"
        >
          <input 
            type="text" 
            placeholder="TRANSMIT TO HQ..."
            className="input-neo flex-1 py-2 px-4 text-[10px] font-bold uppercase tracking-tight"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button 
            type="submit" 
            className="btn-neo-secondary px-4 shadow-[2px_2px_0px_0px_rgba(48,52,44,1)] active:shadow-none"
          >
            <span className="material-symbols-outlined text-sm font-black text-secondary">send</span>
          </button>
        </form>
      </footer>
    </div>
  );
}
