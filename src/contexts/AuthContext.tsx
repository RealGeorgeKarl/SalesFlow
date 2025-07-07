import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, Persona, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  selectPersona: (persona: Persona, password: string) => Promise<void>;
  clearSelectedPersona: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    persona: null,
    isAuthenticated: false,
    isLoading: true,
    retryDelay: 0,
  });

  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            created_at: session.user.created_at || new Date().toISOString(),
          };
          
          // Check for stored persona
          // This part is kept as it's crucial for re-authenticating the persona on refresh
          const storedPersona = localStorage.getItem('salesflow_persona');
          const persona = storedPersona ? JSON.parse(storedPersona) : null;
          
          setAuthState({
            user,
            persona,
            isAuthenticated: !!persona, // isAuthenticated depends on both user and selected persona
            isLoading: false,
            retryDelay: 0,
          });
          
          localStorage.setItem('salesflow_user', JSON.stringify(user));
        } else {
          setAuthState({
            user: null,
            persona: null,
            isAuthenticated: false,
            isLoading: false,
            retryDelay: 0,
          });
          localStorage.removeItem('salesflow_user');
          localStorage.removeItem('salesflow_persona');
        }
      }
    );

    // Check initial session
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAuthState(prev => ({ ...prev, isLoading: false, retryDelay: 0 }));
      }
    };
    
    checkInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    // Clear any existing retry interval
    if (retryIntervalRef.current) {
      clearInterval(retryIntervalRef.current);
    }
    
    setAuthState(prev => ({ ...prev, isLoading: true, retryDelay: 0 }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // The auth state will be updated by the onAuthStateChange listener
    } catch (error) {
      // Clear any existing retry interval
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
      
      // Start 15-second retry delay
      setAuthState(prev => ({ ...prev, isLoading: true, retryDelay: 15 }));
      
      retryIntervalRef.current = setInterval(() => {
        setAuthState(prev => {
          const newDelay = prev.retryDelay - 1;
          if (newDelay <= 0) {
            if (retryIntervalRef.current) {
              clearInterval(retryIntervalRef.current);
              retryIntervalRef.current = null;
            }
            return { ...prev, isLoading: false, retryDelay: 0 };
          }
          return { ...prev, retryDelay: newDelay };
        });
      }, 1000);
      
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const selectPersona = async (persona: Persona, password: string) => {
    // Clear any existing retry interval
    if (retryIntervalRef.current) {
      clearInterval(retryIntervalRef.current);
    }
    
    setAuthState(prev => ({ ...prev, isLoading: true, retryDelay: 0 }));
    
    try {
      let validationResult;
      
      if (persona.user_type === 'Admin') {
        // Validate admin password using validate_sms_account_password
        const { data, error } = await supabase.rpc('validate_sms_account_password', {
          p_account_password: password
        });
        
        if (error) throw error;
        validationResult = data[0];
      } else {
        // Validate salesperson password using validate_sms_local_user
        const { data, error } = await supabase.rpc('validate_sms_local_user', {
          p_login_name: persona.name,
          p_login_password: password
        });
        
        if (error) throw error;
        validationResult = data[0];
      }

      if (!validationResult?.success) {
        throw new Error(validationResult?.message || 'Invalid credentials');
      }

      setAuthState(prev => ({
        ...prev,
        persona,
        isAuthenticated: true,
        isLoading: false,
        retryDelay: 0,
      }));
      
      localStorage.setItem('salesflow_persona', JSON.stringify(persona));
    } catch (error) {
      // Clear any existing retry interval
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current);
      }
      
      // Start 15-second retry delay
      setAuthState(prev => ({ ...prev, isLoading: true, retryDelay: 15 }));
      
      retryIntervalRef.current = setInterval(() => {
        setAuthState(prev => {
          const newDelay = prev.retryDelay - 1;
          if (newDelay <= 0) {
            if (retryIntervalRef.current) {
              clearInterval(retryIntervalRef.current);
              retryIntervalRef.current = null;
            }
            return { ...prev, isLoading: false, retryDelay: 0 };
          }
          return { ...prev, retryDelay: newDelay };
        });
      }, 1000);
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // The auth state will be updated by the onAuthStateChange listener
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if Supabase call fails
      setAuthState({
        user: null,
        persona: null,
        isAuthenticated: false,
        isLoading: false,
        retryDelay: 0,
      });
      localStorage.removeItem('salesflow_user');
      localStorage.removeItem('salesflow_persona');
    }
  };

  const clearSelectedPersona = () => {
    setAuthState(prev => ({
      ...prev,
      persona: null,
      isAuthenticated: false,
      retryDelay: 0,
    }));
    localStorage.removeItem('salesflow_persona');
  };
  const value: AuthContextType = {
    ...authState,
    login,
    selectPersona,
    clearSelectedPersona,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};