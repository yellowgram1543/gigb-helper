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
    socket.emit("join_room", id);

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
      sender: user?.id || "anonymous",
      senderName: user?.user_metadata?.full_name || "HELPER",
      text: inputText
    };

    socket.emit("send_message", messageData);
    setInputText("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto neo-border bg-surface-container shadow-[12px_12px_0px_0px_rgba(48,52,44,1)] overflow-hidden">
      {/* HEADER */}
      <header className="p-6 bg-surface-container-lowest border-b-[3px] border-on-surface flex items-center justify-between z-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 neo-border bg-tertiary-container flex items-center justify-center neo-interactive"
          >
            <span className="material-symbols-outlined font-black">arrow_back</span>
          </button>
          <div>
            <h2 className="text-2xl uppercase m-0 leading-none mb-1 italic">HQ / {task.helper?.name || "CURATOR"}</h2>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
               <p className="font-headline font-black text-[10px] uppercase tracking-widest opacity-50">{task.title}</p>
            </div>
          </div>
        </div>
        <div className="badge-neo bg-secondary-container px-4 py-1 text-xs hidden sm:block">
           SECURE LINK
        </div>
      </header>

      {/* MESSAGES AREA */}
      <section className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar bg-surface">
        {messages.map((msg, index) => {
          const isMe = msg.sender === user?.id;
          return (
            <div 
              key={msg._id || index} 
              className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${isMe ? "self-end items-end" : "self-start items-start"}`}
            >
              {!isMe && (
                <span className="font-headline font-black text-[9px] uppercase tracking-widest mb-1 ml-2 opacity-60">
                  {msg.senderName}
                </span>
              )}
              <div 
                className={`card-neo py-3 px-5 relative ${
                  isMe ? "bg-secondary-container shadow-[-4px_4px_0px_0px_rgba(48,52,44,1)]" : "bg-surface-container-lowest shadow-[4px_4px_0px_0px_rgba(48,52,44,1)]"
                }`}
              >
                <p className="font-body font-bold text-sm sm:text-base leading-tight">
                  {msg.text}
                </p>
                <p className="font-headline font-black text-[8px] opacity-40 text-right mt-2 uppercase">
                  {msg.time || "00:00"}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </section>

      {/* INPUT AREA */}
      <footer className="p-6 bg-surface-container-lowest border-t-[3px] border-on-surface">
        <form 
          onSubmit={handleSendMessage}
          className="flex gap-4"
        >
          <input 
            type="text" 
            placeholder="TRANSMIT TO HQ..."
            className="input-neo flex-1 py-4 px-6 text-sm font-bold uppercase tracking-tight"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button 
            type="submit" 
            className="btn-neo-secondary px-8 shadow-[4px_4px_0px_0px_rgba(48,52,44,1)] active:shadow-none"
          >
            <span className="material-symbols-outlined font-black text-secondary">send</span>
          </button>
        </form>
      </footer>
    </div>
  );
}
