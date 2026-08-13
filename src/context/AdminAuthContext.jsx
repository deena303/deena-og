import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const AdminAuthContext = createContext();

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (mounted) {
            if (session) {
              setIsAuthenticated(true);
              setUser(session.user);
            } else {
              setIsAuthenticated(false);
              setUser(null);
            }
          }
        } catch (e) {
          console.error("Supabase auth session check failed:", e);
        }
      } else {
        const session = localStorage.getItem('admin_session');
        if (mounted && session === 'true') {
          setIsAuthenticated(true);
          setUser({ email: 'deenaofficial1507@gmail.com' });
        }
      }
      if (mounted) setIsLoading(false);
    }

    checkAuth();

    let authListener;
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setIsAuthenticated(true);
          setUser(session.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
        setIsLoading(false);
      });
      authListener = subscription;
    }

    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          return { success: false, error: error.message };
        }

        setIsAuthenticated(true);
        setUser(data.user);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message || 'Authentication failed' };
      }
    } else {
      // Local fallback auth
      const ADMIN_EMAIL = 'deenaofficial1507@gmail.com';
      const ADMIN_PASSWORD = 'Deena@15072006';

      if (email.trim() === ADMIN_EMAIL && password.trim() === ADMIN_PASSWORD) {
        localStorage.setItem('admin_session', 'true');
        setIsAuthenticated(true);
        setUser({ email: ADMIN_EMAIL });
        return { success: true };
      }
      return { success: false, error: 'Invalid email or password.' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Logout error:", err);
      }
    }
    localStorage.removeItem('admin_session');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    isSupabaseActive: isSupabaseConfigured,
    login,
    logout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {isLoading ? (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center flex-col gap-3">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-white/40 text-xs font-mono">Authenticating...</span>
        </div>
      ) : children}
    </AdminAuthContext.Provider>
  );
}
