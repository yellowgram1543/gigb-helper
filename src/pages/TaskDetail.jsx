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
      <div className="flex justify-center py-20">
        <div className="loader border-[4px] border-on-surface border-b-transparent rounded-full w-10 h-10 animate-spin"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-xl mx-auto py-10 text-center">
        <h1 className="text-2xl uppercase opacity-40">Mission Not Found</h1>
        <button className="btn-neo-secondary mt-4 bg-secondary-container text-[10px] py-2 px-4" onClick={() => navigate("/")}>RETURN TO GRID</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 font-headline font-black uppercase text-[10px] opacity-60 hover:opacity-100 transition-opacity"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to Local Grid
      </button>

      <div className="card-neo bg-surface-container-lowest relative overflow-visible">
        <div className="absolute -top-3 -right-3 badge-neo bg-secondary-container px-4 py-1 text-[9px] shadow-[2px_2px_0px_0px_rgba(48,52,44,1)] uppercase">
          {task.status}
        </div>
        
        <header className="mb-6 pb-6 border-b-[2px] border-on-surface border-dashed">
          <h1 className="text-3xl md:text-4xl uppercase leading-none mb-3">{task.title}</h1>
          <div className="flex items-center gap-3">
             <span className="font-headline font-black text-[8px] uppercase opacity-50 tracking-widest text-secondary">Task Code: {task._id.slice(-8)}</span>
             <div className="neo-border bg-secondary-container px-2 py-0.5 font-headline font-black text-lg shadow-[2px_2px_0px_0px_rgba(48,52,44,1)]">
                ₹{task.budget}
             </div>
          </div>
        </header>
        
        <div className="space-y-8">
          <div>
            <label className="font-headline font-black text-[8px] uppercase tracking-[0.2em] opacity-50 mb-3 block">MISSION OBJECTIVE</label>
            <p className="font-body text-base leading-relaxed text-on-surface whitespace-pre-wrap">
              {task.description}
            </p>
          </div>
          
          {task.imageUrl && (
            <div className="neo-border shadow-[4px_4px_0px_0px_rgba(48,52,44,1)] overflow-hidden bg-surface-container">
              <img src={task.imageUrl} alt={task.title} className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-500" />
            </div>
          )}
          
          <div className="card-neo bg-surface-container relative overflow-visible mt-6 p-3">
            <div className="absolute -top-2.5 -left-2.5 badge-neo bg-surface-container-lowest text-[8px] py-0.5 px-2">TARGET ZONE</div>
            <p className="font-headline font-black text-sm uppercase leading-tight">📍 {task.address}</p>
          </div>
        </div>
      </div>

      {/* FLOATING ACTION BAR */}
      {task.status === "OPEN" ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-50">
          <div className="card-neo bg-surface-container-lowest flex flex-col sm:flex-row items-center gap-4 p-4 shadow-[8px_8px_0px_0px_rgba(48,52,44,1)] border-[3px]">
            <div className="text-center sm:text-left flex-1">
               <p className="font-headline font-black text-[8px] uppercase opacity-50 mb-0.5 tracking-widest">READY FOR DEPLOYMENT?</p>
               <h3 className="text-xl font-black uppercase m-0">Claim for ₹{task.budget}</h3>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                className="btn-neo bg-tertiary-container flex-1 sm:flex-none text-[9px] py-2 px-4" 
                onClick={() => navigate("/")}
              >
                ABORT
              </button>
              
              <button 
                className={`btn-neo bg-secondary-container flex-[2] sm:flex-none py-3 px-6 text-base font-black ${isAccepting ? 'animate-pulse' : ''}`}
                onClick={handleAcceptGig}
                disabled={isAccepting}
              >
                {isAccepting ? "INITIALIZING..." : "ACCEPT MISSION →"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-neo text-center py-8 bg-surface-container border-dashed border-[3px]">
          <h3 className="text-xl uppercase opacity-50 italic">Deployment Restricted: {task.status}</h3>
          <p className="font-headline font-black text-[8px] uppercase tracking-[0.15em] mt-1">This opportunity has been claimed or closed.</p>
        </div>
      )}
    </div>
  );
}
