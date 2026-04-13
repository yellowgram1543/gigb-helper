import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import useAuthStore from "../store/authStore";
import { supabase } from "../supabaseClient";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  
  // New state for proof upload
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

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
      await api.patch(`/tasks/${id}/accept`, {
        helper: {
          name: user?.user_metadata?.full_name || "Verified Helper",
          rating: "5.0",
          reviews: 1
        }
      });
      // Re-fetch task to get updated status/escrow
      const response = await api.get(`/tasks/${id}`);
      setTask(response.data);
    } catch (err) {
      console.error("Error accepting task:", err);
      alert("Deployment failed. Coordinate conflict.");
      setIsAccepting(false);
    }
  };

  const handleConfirmHelper = async () => {
    setIsConfirming(true);
    try {
      const response = await api.patch(`/tasks/${id}/confirm-helper`);
      setTask(response.data);
    } catch (err) {
      console.error("Confirmation failed:", err);
      alert("Failed to confirm completion. System error.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitProof = async () => {
    if (!selectedFile) return alert("Select evidence file first.");
    
    setUploading(true);
    setStatusMessage("Uploading evidence...");
    
    let filePath = "";
    try {
      // 1. Upload to Supabase bucket "completion-proofs"
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${id}-${Date.now()}.${fileExt}`;
      filePath = `proofs/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('completion-proofs')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('completion-proofs')
        .getPublicUrl(filePath);

      // 3. Update task via API
      const response = await api.patch(`/tasks/${id}/completion-proof`, {
        completionImageUrl: publicUrl
      });

      setTask(response.data);
      setStatusMessage("Proof submitted! Waiting for poster approval.");
      setSelectedFile(null);
    } catch (err) {
      console.error("Proof submission failed:", err);
      setStatusMessage("Error: Proof transmission failed.");
      
      // Cleanup orphan file if it was uploaded
      if (filePath) {
        await supabase.storage.from('completion-proofs').remove([filePath]);
      }
    } finally {
      setUploading(false);
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
        <button className="btn-neo mt-4 bg-secondary-container text-[10px] py-2 px-4 shadow-[4px_4px_0px_0px_rgba(48,52,44,1)]" onClick={() => navigate("/")}>RETURN TO GRID</button>
      </div>
    );
  }

  const EscrowBadge = ({ status }) => {
    if (status === "locked") {
      return <span className="badge-neo bg-primary-container text-[7px] mb-2 block w-fit">💰 Escrow Locked</span>;
    }
    if (status === "released") {
      return <span className="badge-neo bg-secondary-container text-[7px] mb-2 block w-fit">✅ Paid</span>;
    }
    if (status === "refunded") {
      return <span className="badge-neo bg-error-container text-[7px] mb-2 block w-fit">↩ Refunded</span>;
    }
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-32">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 font-headline font-black uppercase text-[10px] opacity-60 hover:opacity-100 transition-opacity"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to Local Grid
      </button>

      {task.escrow_status === "released" && (
        <div className="card-neo bg-secondary-container text-center py-4 animate-in fade-in slide-in-from-top duration-500">
           <h2 className="text-xl uppercase m-0 leading-none">Payment Released to You ✅</h2>
           <p className="font-headline font-black text-[8px] uppercase tracking-widest mt-1 opacity-70">Funds have been added to your digital wallet.</p>
        </div>
      )}

      <div className="card-neo bg-surface-container-lowest relative overflow-visible">
        <div className="absolute -top-3 -right-3 badge-neo bg-secondary-container px-4 py-1 text-[9px] shadow-[2px_2px_0px_0px_rgba(48,52,44,1)] uppercase">
          {task.status}
        </div>
        
        <header className="mb-6 pb-6 border-b-[2px] border-on-surface border-dashed">
          <EscrowBadge status={task.escrow_status} />
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

          {/* Proof Submission Display */}
          {task.completionImageUrl && (
            <div className="space-y-2 mt-8">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm">verified</span>
                <label className="font-headline font-black text-[10px] uppercase tracking-widest text-secondary">Proof Submitted ✓</label>
              </div>
              <div className="neo-border shadow-[4px_4px_0px_0px_rgba(28,107,80,0.3)] overflow-hidden bg-surface-container-low max-w-[200px]">
                <img src={task.completionImageUrl} alt="Completion Proof" className="w-full h-auto" />
              </div>
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
      ) : task.status === "ASSIGNED" ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-50">
          <div className="card-neo bg-surface-container-lowest p-4 shadow-[8px_8px_0px_0px_rgba(48,52,44,1)] border-[3px] space-y-4">
            
            {/* Proof Upload Section */}
            {user?.id === task.helperId && !task.completionImageUrl && (
              <div className="neo-border p-4 bg-surface-container-low border-dashed">
                <p className="font-headline font-black text-[10px] uppercase mb-3 opacity-60">Upload Evidence of Completion</p>
                <div className="flex flex-col gap-3">
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="text-xs font-headline font-black uppercase"
                    accept="image/*"
                  />
                  <button 
                    onClick={handleSubmitProof}
                    disabled={uploading || !selectedFile}
                    className={`btn-neo bg-primary-container py-2 text-xs font-black shadow-[3px_3px_0px_0px_rgba(48,52,44,1)] ${uploading ? 'animate-pulse' : ''}`}
                  >
                    {uploading ? "TRANSMITTING..." : "SUBMIT PROOF"}
                  </button>
                  {statusMessage && (
                    <p className="text-[9px] font-black uppercase text-secondary animate-in fade-in">{statusMessage}</p>
                  )}
                </div>
              </div>
            )}

            {task.payment_confirmed_helper ? (
              <div className="bg-surface-container neo-border p-4 text-center">
                 <p className="font-headline font-black text-xs uppercase m-0 animate-pulse">Waiting for Poster confirmation...</p>
                 <p className="font-headline font-black text-[8px] uppercase opacity-50 mt-1">Funds will be released automatically once HQ verifies.</p>
              </div>
            ) : (
              <button 
                className={`btn-neo bg-secondary-container w-full py-4 text-lg font-black shadow-[4px_4px_0px_0px_rgba(48,52,44,1)] ${isConfirming ? 'animate-pulse' : ''}`}
                onClick={handleConfirmHelper}
                disabled={isConfirming || (user?.id === task.helperId && !task.completionImageUrl)}
              >
                {isConfirming ? "TRANSMITTING..." : "MARK AS COMPLETE →"}
              </button>
            )}
            {user?.id === task.helperId && !task.completionImageUrl && !task.payment_confirmed_helper && (
              <p className="text-[8px] font-black text-center uppercase opacity-50">Upload proof to enable final confirmation</p>
            )}
          </div>
        </div>
      ) : (
        <div className="card-neo text-center py-8 bg-surface-container border-dashed border-[3px]">
          <h3 className="text-xl uppercase opacity-50 italic">Status: {task.status}</h3>
          <p className="font-headline font-black text-[8px] uppercase tracking-[0.15em] mt-1">This operation is closed or archived.</p>
        </div>
      )}
    </div>
  );
}
