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
        
        const myGigs = response.data.filter(
          task => task.status !== "OPEN" && 
                 task.helper?.name && 
                 task.helper.name === user?.user_metadata?.full_name
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

  const statusColors = {
    ASSIGNED: "bg-tertiary-container",
    COMPLETED: "bg-primary-container",
    PAID: "bg-secondary-container"
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="card-neo bg-secondary-container relative">
        <div className="absolute -top-4 -right-4 badge-neo bg-primary-container px-4 py-1 text-xs uppercase">
          OPERATIVE LOG
        </div>
        <h1 className="text-5xl uppercase mb-2 italic">My Active Gigs 🛠️</h1>
        <p className="font-headline font-bold text-lg uppercase tracking-tight opacity-80">
          {loading ? "Decrypting mission logs..." : `You have ${tasks.filter(t => t.status === "ASSIGNED").length} missions currently active.`}
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-40">
           <div className="loader border-[6px] border-on-surface border-b-transparent rounded-full w-16 h-16 animate-spin"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="card-neo text-center py-24 bg-surface-container border-dashed border-4">
          <h2 className="text-3xl uppercase opacity-40 mb-8">No Active Missions</h2>
          <button 
            className="btn-neo-secondary bg-secondary-container text-xl px-10 py-4" 
            onClick={() => navigate("/")}
          >
            DISCOVER GIGS NOW
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {tasks.map((task, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={task._id} 
              className={`card-neo flex flex-col md:flex-row justify-between items-center gap-8 bg-surface-container-lowest hover:bg-surface-container transition-colors group`}
            >
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <span className={`badge-neo ${statusColors[task.status]} px-4 py-1 text-[10px] shadow-[2px_2px_0px_0px_rgba(48,52,44,1)]`}>
                    {task.status}
                  </span>
                  <div className="neo-border bg-surface-container-lowest px-3 py-0.5 font-headline font-black text-lg shadow-[2px_2px_0px_0px_rgba(48,52,44,1)]">
                    ₹{task.budget}
                  </div>
                </div>
                
                <h3 className="text-3xl uppercase m-0 leading-none group-hover:italic transition-all">
                  {task.title}
                </h3>
                
                <p className="font-headline font-black text-[10px] uppercase tracking-widest opacity-50">
                  📍 {task.address}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <button 
                  className="btn-neo bg-surface-container-lowest flex-1 sm:flex-none text-xs"
                  onClick={() => navigate(`/task/${task._id}`)}
                >
                  VIEW MISSION
                </button>
                
                {task.status === "ASSIGNED" && (
                  <button 
                    className="btn-neo bg-tertiary-container flex-1 sm:flex-none text-xs whitespace-nowrap"
                    onClick={() => navigate(`/chat/${task._id}`)}
                  >
                    💬 COMMS CHANNEL
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
