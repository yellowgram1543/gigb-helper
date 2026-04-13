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
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Hero / Discovery Header */}
      <header className="card-neo bg-secondary-container relative overflow-visible">
         <div className="absolute -top-4 -right-4 badge-neo bg-primary-container px-4 py-2 text-sm">
            DISCOVERY MODE
         </div>
         <h1 className="text-5xl md:text-7xl mb-4 uppercase">Find Local Gigs 📍</h1>
         <p className="font-headline font-bold text-xl uppercase tracking-tight opacity-80">
           {loading ? "Scanning the Grid..." : `Spotted ${tasks.length} opportunities in your perimeter.`}
         </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
           <div className="loader border-[6px] border-on-surface border-b-transparent rounded-full w-16 h-16 animate-spin"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="card-neo text-center py-20 bg-surface-container border-dashed border-4">
          <p className="text-2xl font-headline font-black uppercase mb-8 opacity-60">Zero signals detected. Relocate and retry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* GIG LIST */}
          <section className="lg:col-span-6 space-y-8 max-h-[75vh] overflow-y-auto pr-4 custom-scrollbar">
            {tasks.map((task, index) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={task._id} 
                className="card-neo flex flex-col justify-between cursor-pointer min-h-[250px] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(48,52,44,1)] neo-interactive"
                onClick={() => navigate(`/task/${task._id}`)}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="neo-border bg-surface-container-lowest px-4 py-1 font-headline font-black text-xl shadow-[4px_4px_0px_0px_rgba(48,52,44,1)]">
                      ₹{task.budget}
                    </div>
                    <span className="badge-neo bg-tertiary-container">
                      {task.category || 'GENERAL'}
                    </span>
                  </div>
                  <h3 className="text-3xl mb-4 leading-none uppercase">{task.title}</h3>
                  <div className="flex items-center gap-2 mb-4 font-headline font-bold text-xs uppercase opacity-60">
                    <span className="material-symbols-outlined text-sm text-secondary">location_on</span>
                    {task.address}
                  </div>
                  <p className="font-body text-on-surface opacity-80 line-clamp-2">
                    {task.description}
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t-[3px] border-on-surface border-dashed flex justify-end">
                  <button 
                    className="btn-neo bg-primary-container text-xs px-4 py-2"
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
          <aside className="lg:col-span-6 h-[75vh] sticky top-8 card-neo p-0 overflow-hidden bg-surface-container shadow-[12px_12px_0px_0px_rgba(48,52,44,1)]">
             <div className="absolute top-4 left-4 z-[400] badge-neo bg-surface-container-lowest py-2 px-4 shadow-[4px_4px_0px_0px_rgba(48,52,44,1)]">
                LIVE GRID VIEW
             </div>
             <TaskMap tasks={tasks} />
          </aside>
          
        </div>
      )}
    </div>
  );
}
