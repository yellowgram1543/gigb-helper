import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import useAuthStore from "../store/authStore";
import { motion } from "framer-motion";

export default function Vault() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [earnings, setEarnings] = useState({
    totalEarned: 0,
    pending: 0,
    completedGigs: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user || !user.id) return;
      
      try {
        // user.id from Supabase matches the helperId we expect in our MongoDB
        const response = await api.get(`/tasks/earnings/${user.id}`);
        setEarnings(response.data);
      } catch (err) {
        console.error("Error fetching earnings:", err);
        setError("Failed to synchronize with the vault.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchEarnings();
    }
  }, [isAuthenticated, user]);

  if (isLoading || (isAuthenticated && loading)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-surface">
        <div className="loader border-[5px] border-on-surface border-b-transparent rounded-full w-12 h-12 animate-spin"></div>
        <p className="font-headline font-black uppercase tracking-tighter text-secondary">Accessing Vault...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      {/* Header */}
      <header className="card-neo bg-primary-container relative py-10">
        <div className="absolute -top-3 -right-3 badge-neo bg-tertiary-container px-4 py-1 text-xs font-black">
          SECURE TERMINAL
        </div>
        <h1 className="text-5xl md:text-6xl uppercase leading-none tracking-tighter mb-2">The Vault 🏦</h1>
        <p className="font-headline font-bold text-sm uppercase tracking-widest opacity-70">
          Financial Oversight & Performance Metrics
        </p>
      </header>

      {error && (
        <div className="card-neo bg-error-container border-error text-error p-4 uppercase font-black text-center">
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-neo bg-secondary-container flex flex-col items-center justify-center py-10 text-center shadow-[8px_8px_0px_0px_rgba(48,52,44,1)]"
        >
          <span className="text-xs font-black uppercase mb-2 opacity-60">Total Earned</span>
          <div className="text-5xl font-black mb-1">₹{earnings.totalEarned}</div>
          <div className="badge-neo bg-surface-container-lowest text-[10px] text-secondary border-secondary">SETTLED</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-neo bg-primary-container flex flex-col items-center justify-center py-10 text-center shadow-[8px_8px_0px_0px_rgba(48,52,44,1)]"
        >
          <span className="text-xs font-black uppercase mb-2 opacity-60">Pending Payout</span>
          <div className="text-5xl font-black mb-1">₹{earnings.pending}</div>
          <div className="badge-neo bg-surface-container-lowest text-[10px] text-primary border-primary">ESCROW LOCKED</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-neo bg-tertiary-container flex flex-col items-center justify-center py-10 text-center shadow-[8px_8px_0px_0px_rgba(48,52,44,1)]"
        >
          <span className="text-xs font-black uppercase mb-2 opacity-60">Gigs Completed</span>
          <div className="text-5xl font-black mb-1">{earnings.completedGigs.length}</div>
          <div className="badge-neo bg-surface-container-lowest text-[10px] text-tertiary border-tertiary">PERFORMANCE</div>
        </motion.div>
      </div>

      {/* Completed Gigs List */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl uppercase font-black">Transaction History</h2>
          <div className="flex-grow h-[3px] bg-on-surface"></div>
        </div>

        {earnings.completedGigs.length === 0 ? (
          <div className="card-neo py-12 text-center bg-surface-container-low border-dashed">
            <p className="font-headline font-black uppercase opacity-40">No completed records found in this sector.</p>
          </div>
        ) : (
          <div className="card-neo p-0 overflow-hidden shadow-[8px_8px_0px_0px_rgba(48,52,44,1)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-on-surface text-surface uppercase text-xs font-black">
                    <th className="px-6 py-4">Gig Title</th>
                    <th className="px-6 py-4">Escrow Amount</th>
                    <th className="px-6 py-4">Completed On</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="font-headline font-bold text-sm uppercase">
                  {earnings.completedGigs.map((gig, index) => (
                    <tr 
                      key={gig._id} 
                      className={`border-b-[3px] border-on-surface last:border-0 hover:bg-surface-container-low transition-colors ${index % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'}`}
                    >
                      <td className="px-6 py-5 truncate max-w-[300px]">{gig.title}</td>
                      <td className="px-6 py-5">₹{gig.escrow_amount}</td>
                      <td className="px-6 py-5">
                        {new Date(gig.updatedAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="badge-neo bg-secondary-container text-[10px] px-2 py-0.5">
                          RELEASED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}