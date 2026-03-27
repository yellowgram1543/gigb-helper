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
      setError("Please fill in all required fields!");
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
              role: 'helper' // This explicit payload tells the backend to create this user as a 'helper' rather than a standard user!
            },
          },
        });
        if (signUpError) throw signUpError;
        alert("Account created! Check your email for the confirmation link!");
      }
      
      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "100vh",
      padding: "20px",
      background: "linear-gradient(135deg, #1f2937, #111827)" // Adjusted to a darker vibe for helpers
    }}>
      <div className="card" style={{ maxWidth: "420px", width: "100%", padding: "2rem" }}>
        <h1 style={{ textAlign: "center", marginBottom: "0.5rem" }}>
          {isLogin ? "Helper Login" : "Become a Helper"}
        </h1>
        <p style={{ textAlign: "center", marginBottom: "2rem", fontWeight: 600, color: "#666" }}>
          {isLogin ? "Welcome back, let's find you some gigs!" : "Earn money helping your neighborhood."}
        </p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: "1.2rem" }}>
              <label className="text-small" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>NAME</label>
              <input 
                type="text" 
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem" }}
              />
            </div>
          )}

          <div style={{ marginBottom: "1.2rem" }}>
            <label className="text-small" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>EMAIL</label>
            <input 
              type="email" 
              placeholder="helper@gigb.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem" }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label className="text-small" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>PASSWORD</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem" }}
            />
          </div>

          {error && (
            <p style={{ 
              color: "red", 
              fontWeight: 700, 
              textAlign: "center", 
              marginBottom: "1rem" 
            }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginBottom: "1rem", padding: "0.75rem", fontSize: "1rem", borderRadius: "8px", border:"none", background:"#3b82f6", color:"white", fontWeight:"bold", cursor:"pointer" }} disabled={isLoading}>
            {isLoading ? "Processing..." : (isLogin ? "Login Now" : "Sign Up to Help")}
          </button>

          <p style={{ textAlign: "center", fontWeight: 600, fontSize: "0.9rem" }}>
            {isLogin ? "New to GigB Helpers?" : "Already a Helper?"}{" "}
            <span 
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              style={{ color: "#3b82f6", cursor: "pointer", textDecoration: "underline" }}
            >
              {isLogin ? "Sign Up" : "Log In"}
            </span>
          </p>
        </form>
      </div>
    </main>
  );
}
