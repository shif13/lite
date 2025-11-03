// frontend/src/context/UserContext.jsx - UPDATED FOR 2 USER TYPES
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile } from '../api/users';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { user, getToken, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from MySQL when Firebase user changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const token = await getToken();
          const response = await getUserProfile(user.uid, token);
          setUserData(response.data);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    };

    if (!authLoading) {
      fetchUserData();
    }
  }, [user, authLoading]);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  // Refresh user data
  const refreshUserData = async () => {
    if (user) {
      try {
        const token = await getToken();
        const response = await getUserProfile(user.uid, token);
        setUserData(response.data);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  // Check if user can post properties
  const canPostProperty = () => {
    if (!userData) return false;
    
    // Only providers can post
    if (userData.userType !== 'provider') return false;
    
    // Owners can post immediately
    if (userData.providerType === 'owner') return true;
    
    // Agents and builders need to be approved
    if (userData.providerType === 'agent' || userData.providerType === 'builder') {
      return userData.approvalStatus === 'approved';
    }
    
    return false;
  };

  // Check if user is admin
  const isAdmin = () => {
    return userData?.userType === 'admin';
  };

  // Check if user is seeker
  const isSeeker = () => {
    return userData?.userType === 'seeker';
  };

  // Check if user is provider
  const isProvider = () => {
    return userData?.userType === 'provider';
  };

  // Check if user is approved
  const isApproved = () => {
    return userData?.approvalStatus === 'approved';
  };

  // Check if user is pending approval
  const isPending = () => {
    return userData?.approvalStatus === 'pending';
  };

  // Check if user is rejected
  const isRejected = () => {
    return userData?.approvalStatus === 'rejected';
  };

  // Get user display name
  const getUserDisplayType = () => {
    if (!userData) return 'User';
    
    if (userData.userType === 'admin') return 'Admin';
    if (userData.userType === 'seeker') return 'Seeker';
    
    if (userData.userType === 'provider') {
      switch(userData.providerType) {
        case 'owner': return 'Property Owner';
        case 'agent': return 'Real Estate Agent';
        case 'builder': return 'Builder/Developer';
        default: return 'Provider';
      }
    }
    
    return 'User';
  };

  // Check if provider needs approval
  const needsApproval = () => {
    if (!userData) return false;
    return userData.userType === 'provider' && 
           (userData.providerType === 'agent' || userData.providerType === 'builder');
  };

  const value = {
    userData,
    loading: loading || authLoading,
    refreshUserData,
    
    // Helper functions
    canPostProperty,
    isAdmin,
    isSeeker,
    isProvider,
    isApproved,
    isPending,
    isRejected,
    getUserDisplayType,
    needsApproval,
    
    // User properties (for easy access)
    userType: userData?.userType,
    providerType: userData?.providerType,
    approvalStatus: userData?.approvalStatus,
    isVerified: userData?.isVerified,
    isActive: userData?.isActive
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};