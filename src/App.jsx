import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import TaskDetail from "./pages/TaskDetail";
import ActiveGigs from "./pages/ActiveGigs";
import Chat from "./pages/Chat";
import Navbar from "./components/Navbar";
import useAuthStore from "./store/authStore";

export default function App() {
  const { isAuthenticated, initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-surface">
        <div className="loader border-[5px] border-on-surface border-b-transparent rounded-full w-12 h-12 animate-spin"></div>
        <p className="font-headline font-black uppercase tracking-tighter text-secondary">Analyzing Opportunities...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col md:flex-row min-h-screen bg-surface">
        <Navbar />
        <main className="flex-grow p-4 md:p-8 md:ml-64 mb-20 md:mb-0">
          <Routes>
            <Route 
              path="/auth" 
              element={isAuthenticated ? <Navigate to="/" /> : <Auth />} 
            />
            <Route 
              path="/" 
              element={isAuthenticated ? <Home /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/task/:id" 
              element={isAuthenticated ? <TaskDetail /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/active" 
              element={isAuthenticated ? <ActiveGigs /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/chat/:id" 
              element={isAuthenticated ? <Chat /> : <Navigate to="/auth" />} 
            />
            <Route path="*" element={<Navigate to="/auth" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
