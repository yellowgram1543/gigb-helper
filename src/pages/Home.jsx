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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero / Discovery Header */}
      <header className="card-neo bg-secondary-container relative overflow-visible py-8">
         <div className="absolute -top-3 -right-3 badge-neo bg-primary-container px-3 py-1 text-[10px]">
            DISCOVERY MODE
         </div>
         <h1 className="text-4xl md:text-5xl mb-2 uppercase leading-tight">Find Local Gigs 📍</h1>
         <p className="font-headline font-bold text-sm uppercase tracking-tight opacity-80">
           {loading ? "Scanning the Grid..." : `Spotted ${tasks.length} opportunities in your perimeter.`}
         </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-10">
           <div className="loader border-[4px] border-on-surface border-b-transparent rounded-full w-10 h-10 animate-spin"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="card-neo text-center py-16 bg-surface-container border-dashed border-2">
          <p className="text-lg font-headline font-black uppercase mb-4 opacity-60">Zero signals detected. Relocate and retry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* GIG LIST */}
          <section className="lg:col-span-6 space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {tasks.map((task, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={task._id} 
                className="card-neo flex flex-col justify-between cursor-pointer min-h-[180px] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(48,52,44,1)] neo-interactive"
                onClick={() => navigate(`/task/${task._id}`)}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="neo-border bg-surface-container-lowest px-2 py-0.5 font-headline font-black text-sm shadow-[2px_2px_0px_0px_rgba(48,52,44,1)]">
                      ₹{task.budget}
                    </div>
                    <span className="badge-neo bg-tertiary-container">
                      {task.category || 'GENERAL'}
                    </span>
                  </div>
                  <h3 className="text-xl mb-2 leading-tight uppercase line-clamp-1">{task.title}</h3>
                  <div className="flex items-center gap-2 mb-2 font-headline font-black text-[9px] uppercase opacity-60">
                    <span className="material-symbols-outlined text-[10px] text-secondary">location_on</span>
                    {task.address}
                  </div>
                  <p className="font-body text-[11px] text-on-surface opacity-80 line-clamp-2">
                    {task.description}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t-[2px] border-on-surface border-dashed flex justify-end">
                  <button 
                    className="btn-neo bg-primary-container text-[10px] px-3 py-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/task/${task._id}`);
                    }}
                  >
                    APPLY NOW →
                  </button>
                </div>
              </motion.div>
            ))}
          </section>

          {/* MAP VIEW */}
          <aside className="lg:col-span-6 h-[70vh] sticky top-8 card-neo p-0 overflow-hidden bg-surface-container shadow-[8px_8px_0px_0px_rgba(48,52,44,1)]">
             <div className="absolute top-3 left-3 z-[400] badge-neo bg-surface-container-lowest py-1 px-3 shadow-[2px_2px_0px_0px_rgba(48,52,44,1)]">
                LIVE GRID VIEW
             </div>
             <TaskMap tasks={tasks} />
          </aside>
          
        </div>
      )}
    </div>
  );
}
