import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const navItems = [
    { name: "Discover", path: "/", icon: "explore" },
    { name: "My Gigs", path: "/active", icon: "work_history" },
  ];

  return (
    <>
      {/* Sidebar for Desktop */}
      <aside className="fixed left-0 top-0 h-full flex flex-col p-6 w-64 border-r-[3px] border-on-surface bg-surface shadow-[4px_4px_0px_0px_rgba(48,52,44,1)] z-50 hidden md:flex">
        <div className="mb-12 cursor-pointer" onClick={() => navigate("/")}>
          <h1 className="text-3xl font-black text-on-surface italic tracking-tighter font-headline">GigB</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary opacity-70">Helper Force</p>
        </div>

        <nav className="flex flex-col gap-4 flex-grow">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 p-4 font-headline font-bold uppercase tracking-tighter border-[3px] border-on-surface neo-interactive ${
                location.pathname === item.path
                  ? "bg-secondary-container shadow-[2px_2px_0px_0px_rgba(48,52,44,1)]"
                  : "bg-surface-container-lowest hover:bg-surface-container shadow-[4px_4px_0px_0px_rgba(48,52,44,1)] hover:shadow-[2px_2px_0px_0px_rgba(48,52,44,1)]"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-4 p-4 font-headline font-bold uppercase tracking-tighter bg-error-container text-on-surface border-[3px] border-on-surface shadow-[4px_4px_0px_0px_rgba(48,52,44,1)] neo-interactive"
        >
          <span className="material-symbols-outlined">logout</span>
          Logout
        </button>
      </aside>

      {/* Mobile Top Nav */}
      <nav className="md:hidden sticky top-0 left-0 w-full bg-surface border-b-[3px] border-on-surface p-4 flex justify-between items-center z-50">
        <h1 className="text-2xl font-black text-on-surface italic tracking-tighter font-headline" onClick={() => navigate("/")}>GigB</h1>
        <button onClick={handleLogout} className="p-2 border-[2px] border-on-surface bg-error-container">
          <span className="material-symbols-outlined text-sm">logout</span>
        </button>
      </nav>
      
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface border-t-[3px] border-on-surface p-2 flex justify-around items-center z-50">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center p-2 ${location.pathname === item.path ? 'bg-secondary-container border-[2px] border-on-surface' : ''}`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px] font-bold uppercase">{item.name}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
