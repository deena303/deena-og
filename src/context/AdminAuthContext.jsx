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
      if (!isSupabaseConfigured || !supabase) {
        if (mounted) {
          setIsAuthenticated(false);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Supabase getSession error:", error);
        }
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
        console.error("Supabase auth check failed:", e);
      } finally {
        if (mounted) setIsLoading(false);
      }
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
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase is not configured in .env' };
    }

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
      return { success: false, error: err.message || 'Supabase authentication failed' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Supabase logout error:", err);
      }
    }
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    isSupabaseActive: true,
    login,
    logout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {isLoading ? (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center flex-col gap-3">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-white/40 text-xs font-mono">Authenticating with Supabase...</span>
        </div>
      ) : children}
    </AdminAuthContext.Provider>
  );
}

