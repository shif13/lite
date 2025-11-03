// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { 
  signUpWithEmail, 
  signInWithEmail, 
  signInWithGoogle, 
  signInWithFacebook,
  logOut, 
  resetPassword,
  resendVerificationEmail,
  onAuthChange,
  getCurrentUser,
  getIdToken
} from '../firebase/auth';

// Create Auth Context
const AuthContext = createContext({});

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Sign up function
  const signup = async (email, password, displayName) => {
    try {
      setError(null);
      setLoading(true);
      const result = await signUpWithEmail(email, password, displayName);
      
      if (!result.success) {
        setError(result.message);
      }
      
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, message: err.message };
    }
  };

  // Sign in function
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithEmail(email, password);
      
      if (!result.success) {
        setError(result.message);
      }
      
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, message: err.message };
    }
  };

  // Google sign in
  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithGoogle();
      
      if (!result.success) {
        setError(result.message);
      }
      
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, message: err.message };
    }
  };

  // Facebook sign in
  const loginWithFacebook = async () => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithFacebook();
      
      if (!result.success) {
        setError(result.message);
      }
      
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, message: err.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setError(null);
      const result = await logOut();
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Password reset
  const forgotPassword = async (email) => {
    try {
      setError(null);
      const result = await resetPassword(email);
      
      if (!result.success) {
        setError(result.message);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Resend verification email
  const resendVerification = async () => {
    try {
      setError(null);
      const result = await resendVerificationEmail();
      
      if (!result.success) {
        setError(result.message);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Get Firebase ID token for API calls
  const getToken = async () => {
    try {
      return await getIdToken();
    } catch (err) {
      console.error('Error getting token:', err);
      return null;
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    forgotPassword,
    resendVerification,
    getToken,
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerified || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default useAuth;