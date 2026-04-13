import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password || (!isLogin && !name)) {
      setError("Incomplete data. Fill all fields.");
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: 'helper'
            },
          },
        });
        if (signUpError) throw signUpError;
        alert("Account created. Check your email.");
      }
      
      navigate("/");
    } catch (err) {
      setError(err.message || "System error. Retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="card-neo max-w-xs w-full relative bg-surface-container-lowest">
        <div className="absolute -top-3 -left-3 badge-neo bg-secondary-container px-3 py-0.5 text-[8px]">
          {isLogin ? "RETURNING HELPER" : "NEW FORCE"}
        </div>
        
        <header className="mb-6 text-center">
          <h1 className="text-2xl uppercase mb-1 italic">
            {isLogin ? "Force Login" : "Join the Force"}
          </h1>
          <p className="font-headline font-black text-[8px] uppercase tracking-[0.15em] opacity-50 text-secondary">
            {isLogin ? "GigB / Helper Force" : "Deploy your skills locally"}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="font-headline font-black text-[9px] uppercase mb-1 block tracking-widest">Your Moniker</label>
              <input 
                type="text" 
                placeholder="FULL NAME"
                className="input-neo w-full text-[10px] font-bold uppercase tracking-tighter"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="font-headline font-black text-[9px] uppercase mb-1 block tracking-widest">Comm Channel</label>
            <input 
              type="email" 
              placeholder="EMAIL ADDRESS"
              className="input-neo w-full text-[10px] font-bold uppercase tracking-tighter"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="font-headline font-black text-[9px] uppercase mb-1 block tracking-widest">Security Key</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="input-neo w-full text-[10px]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-error-container neo-border p-2 shadow-[2px_2px_0px_0px_rgba(48,52,44,1)]">
              <p className="font-headline font-black text-[8px] uppercase text-center m-0">
                ERROR: {error}
              </p>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-neo-secondary w-full text-base py-3 shadow-[4px_4px_0px_0px_rgba(48,52,44,1)] active:shadow-none" 
            disabled={isLoading}
          >
            {isLoading ? "PROCESSING..." : (isLogin ? "INITIALIZE FORCE →" : "JOIN SQUADRON →")}
          </button>
          
          <div className="border-t-[2px] border-on-surface border-dashed pt-4">
            <p className="text-center font-headline font-black text-[8px] uppercase">
              {isLogin ? "Not in the Force?" : "Already deployed?"}{" "}
              <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                className="bg-secondary-container px-2 py-0.5 neo-border shadow-[2px_2px_0px_0px_rgba(48,52,44,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                {isLogin ? "ENLIST" : "IDENTIFY"}
              </button>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
