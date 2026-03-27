import { create } from "zustand";
import { supabase } from "../supabaseClient";

const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: (session) => {
    set({ 
      session, 
      user: session?.user || null, 
      isAuthenticated: !!session,
      isLoading: false 
    });
    
    if (session?.access_token) {
      localStorage.setItem("token", session.access_token);
    } else {
      localStorage.removeItem("token");
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    set({ user: null, session: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      console.log("DEBUG: Initializing Supabase Auth...");
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (session) {
        console.log("DEBUG: Session found, user is authenticated.");
        set({ 
          session, 
          user: session.user, 
          isAuthenticated: true,
          isLoading: false
        });
        localStorage.setItem("token", session.access_token);
      } else {
        console.log("DEBUG: No active session found.");
        set({ isLoading: false, isAuthenticated: false });
      }

      // Start listening for changes after the initial check
      supabase.auth.onAuthStateChange((_event, session) => {
        console.log("DEBUG: Auth State Changed:", _event);
        if (session) {
          set({ session, user: session.user, isAuthenticated: true, isLoading: false });
          localStorage.setItem("token", session.access_token);
        } else {
          set({ session: null, user: null, isAuthenticated: false, isLoading: false });
          localStorage.removeItem("token");
        }
      });

    } catch (err) {
      console.error("DEBUG ERROR: Supabase initialization failed:", err.message);
      set({ isLoading: false, isAuthenticated: false });
    }
  }
}));

export default useAuthStore;
