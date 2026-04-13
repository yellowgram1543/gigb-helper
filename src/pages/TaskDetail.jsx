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
          rating: "5.0",
          reviews: 1
        }
      });
      navigate("/active");
    } catch (err) {
      console.error("Error accepting task:", err);
      alert("Deployment failed. Coordinate conflict.");
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <div className="loader border-[6px] border-on-surface border-b-transparent rounded-full w-16 h-16 animate-spin"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h1 className="text-4xl uppercase opacity-40">Mission Not Found</h1>
        <button className="btn-neo-secondary mt-8 bg-secondary-container" onClick={() => navigate("/")}>RETURN TO GRID</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-32">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 font-headline font-black uppercase text-xs opacity-60 hover:opacity-100 transition-opacity"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to Local Grid
      </button>

      <div className="card-neo bg-surface-container-lowest relative overflow-visible">
        <div className="absolute -top-4 -right-4 badge-neo bg-secondary-container px-6 py-2 text-sm shadow-[4px_4px_0px_0px_rgba(48,52,44,1)] uppercase">
          {task.status}
        </div>
        
        <header className="mb-8 pb-8 border-b-[3px] border-on-surface border-dashed">
          <h1 className="text-5xl md:text-6xl uppercase leading-none mb-4">{task.title}</h1>
          <div className="flex items-center gap-4">
             <span className="font-headline font-black text-xs uppercase opacity-50 tracking-widest text-secondary">Task Code: {task._id.slice(-8)}</span>
             <div className="neo-border bg-secondary-container px-3 py-0.5 font-headline font-black text-xl shadow-[2px_2px_0px_0px_rgba(48,52,44,1)]">
                ₹{task.budget}
             </div>
          </div>
        </header>
        
        <div className="space-y-10">
          <div>
            <label className="font-headline font-black text-[10px] uppercase tracking-[0.3em] opacity-50 mb-4 block">MISSION OBJECTIVE</label>
            <p className="font-body text-xl leading-relaxed text-on-surface whitespace-pre-wrap">
              {task.description}
            </p>
          </div>
          
          {task.imageUrl && (
            <div className="neo-border shadow-[8px_8px_0px_0px_rgba(48,52,44,1)] overflow-hidden bg-surface-container">
              <img src={task.imageUrl} alt={task.title} className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-500" />
            </div>
          )}
          
          <div className="card-neo bg-surface-container relative overflow-visible mt-8">
            <div className="absolute -top-3 -left-3 badge-neo bg-surface-container-lowest">TARGET ZONE</div>
            <p className="font-headline font-black text-lg uppercase leading-tight">📍 {task.address}</p>
          </div>
        </div>
      </div>

      {/* FLOATING ACTION BAR */}
      {task.status === "OPEN" ? (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
          <div className="card-neo bg-surface-container-lowest flex flex-col sm:flex-row items-center gap-6 p-6 shadow-[12px_12px_0px_0px_rgba(48,52,44,1)] border-4">
            <div className="text-center sm:text-left flex-1">
               <p className="font-headline font-black text-[10px] uppercase opacity-50 mb-1 tracking-widest">READY FOR DEPLOYMENT?</p>
               <h3 className="text-2xl font-black uppercase m-0">Claim for ₹{task.budget}</h3>
            </div>
            
            <div className="flex gap-4 w-full sm:w-auto">
              <button 
                className="btn-neo bg-tertiary-container flex-1 sm:flex-none text-xs" 
                onClick={() => navigate("/")}
              >
                ABORT
              </button>
              
              <button 
                className={`btn-neo bg-secondary-container flex-[2] sm:flex-none py-4 px-8 text-lg font-black ${isAccepting ? 'animate-pulse' : ''}`}
                onClick={handleAcceptGig}
                disabled={isAccepting}
              >
                {isAccepting ? "INITIALIZING..." : "ACCEPT MISSION →"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-neo text-center py-12 bg-surface-container border-dashed border-4">
          <h3 className="text-2xl uppercase opacity-50 italic">Deployment Restricted: {task.status}</h3>
          <p className="font-headline font-black text-[10px] uppercase tracking-[0.2em] mt-2">This opportunity has been claimed or closed.</p>
        </div>
      )}
    </div>
  );
}
