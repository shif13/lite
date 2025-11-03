// src/firebase/auth.js
// ⚠️ IMPORTANT: This file uses your existing config.js which already has the correct Vite environment variables
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

// ============================================
// EMAIL & PASSWORD AUTHENTICATION
// ============================================

/**
 * Sign up a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} displayName - User's full name
 * @returns {Promise<Object>} User credential object
 */
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    await updateProfile(userCredential.user, {
      displayName: displayName
    });

    // Send email verification
    await sendEmailVerification(userCredential.user);

    return {
      success: true,
      user: userCredential.user,
      message: 'Account created! Please check your email for verification.'
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

/**
 * Sign in existing user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User credential object
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    return {
      success: true,
      user: userCredential.user,
      message: 'Login successful!'
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

// ============================================
// SOCIAL AUTHENTICATION (Google & Facebook)
// ============================================

/**
 * Sign in with Google popup
 * @returns {Promise<Object>} User credential object
 */
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account' // Forces account selection
    });
    
    const userCredential = await signInWithPopup(auth, provider);
    
    return {
      success: true,
      user: userCredential.user,
      message: 'Google login successful!'
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

/**
 * Sign in with Facebook popup
 * @returns {Promise<Object>} User credential object
 */
export const signInWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    provider.setCustomParameters({
      display: 'popup'
    });
    
    const userCredential = await signInWithPopup(auth, provider);
    
    return {
      success: true,
      user: userCredential.user,
      message: 'Facebook login successful!'
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

// ============================================
// PASSWORD RESET
// ============================================

/**
 * Send password reset email
 * @param {string} email - User's email
 * @returns {Promise<Object>} Success/error message
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    
    return {
      success: true,
      message: 'Password reset email sent! Check your inbox.'
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

/**
 * Resend email verification
 * @returns {Promise<Object>} Success/error message
 */
export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return {
        success: false,
        message: 'No user is currently signed in.'
      };
    }

    if (user.emailVerified) {
      return {
        success: false,
        message: 'Email is already verified.'
      };
    }

    await sendEmailVerification(user);
    
    return {
      success: true,
      message: 'Verification email sent!'
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

// ============================================
// SIGN OUT
// ============================================

/**
 * Sign out the current user
 * @returns {Promise<Object>} Success/error message
 */
export const logOut = async () => {
  try {
    await signOut(auth);
    
    return {
      success: true,
      message: 'Logged out successfully!'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error logging out. Please try again.'
    };
  }
};

// ============================================
// AUTH STATE LISTENER
// ============================================

/**
 * Listen to authentication state changes
 * @param {Function} callback - Function to call when auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

// ============================================
// GET CURRENT USER
// ============================================

/**
 * Get currently signed-in user
 * @returns {Object|null} Current user object or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Get Firebase ID token for API authentication
 * @returns {Promise<string|null>} Firebase ID token
 */
export const getIdToken = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

// ============================================
// ERROR HANDLER
// ============================================

/**
 * Handle Firebase authentication errors
 * @param {Object} error - Firebase error object
 * @returns {Object} Formatted error response
 */
const handleAuthError = (error) => {
  let message = 'An error occurred. Please try again.';
  
  switch (error.code) {
    case 'auth/email-already-in-use':
      message = 'This email is already registered. Try logging in instead.';
      break;
    case 'auth/invalid-email':
      message = 'Invalid email address.';
      break;
    case 'auth/weak-password':
      message = 'Password should be at least 6 characters.';
      break;
    case 'auth/user-not-found':
      message = 'No account found with this email.';
      break;
    case 'auth/wrong-password':
      message = 'Incorrect password.';
      break;
    case 'auth/too-many-requests':
      message = 'Too many failed attempts. Try again later.';
      break;
    case 'auth/network-request-failed':
      message = 'Network error. Check your internet connection.';
      break;
    case 'auth/popup-closed-by-user':
      message = 'Sign-in popup was closed. Please try again.';
      break;
    case 'auth/account-exists-with-different-credential':
      message = 'An account already exists with this email using a different sign-in method.';
      break;
    case 'auth/requires-recent-login':
      message = 'Please log in again to perform this action.';
      break;
    default:
      message = error.message || 'An unexpected error occurred.';
  }
  
  return {
    success: false,
    message,
    errorCode: error.code
  };
};