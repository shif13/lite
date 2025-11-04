
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../context/UserContext';
import { FaHome, FaHeart, FaUser, FaPlus, FaSignOutAlt, FaBars, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { userData, canPostProperty, isAdmin, loading } = useUser();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-[#C9E4CA]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-[#3B6064] to-[#55828B] rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 shadow-md">
              <FaHome className="text-white text-2xl" />
            </div>
            <span className="text-2xl font-bold text-[#364958]">
              Find<span className="text-[#55828B]">Abode</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-[#364958] hover:text-[#55828B] transition-colors font-medium relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#87BBA2] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              to="/listings" 
              className="text-[#364958] hover:text-[#55828B] transition-colors font-medium relative group"
            >
              Properties
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#87BBA2] group-hover:w-full transition-all duration-300"></span>
            </Link>

            {user ? (
              <>
                {!loading && canPostProperty() && (
                  <Link 
                    to="/post-property" 
                    className="text-[#364958] hover:text-[#55828B] transition-colors font-medium relative group flex items-center gap-2"
                  >
                    <FaPlus className="text-sm" />
                    <span>Post Property</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#87BBA2] group-hover:w-full transition-all duration-300"></span>
                  </Link>
                )}
                
                <Link 
                  to="/wishlist" 
                  className="text-[#364958] hover:text-[#C17767] transition-colors relative group"
                >
                  <FaHeart className="text-2xl" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#C17767] rounded-full animate-pulse"></span>
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-2 text-[#364958] hover:text-[#55828B] font-medium">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#C9E4CA] to-[#87BBA2] rounded-full flex items-center justify-center shadow-sm">
                      <FaUser className="text-[#3B6064]" />
                    </div>
                    <span className="flex items-center gap-2">
                      {userData?.name || user.displayName || 'Account'}
                      {userData?.isVerified && (
                        <FaCheckCircle className="text-[#87BBA2] text-sm" title="Verified" />
                      )}
                    </span>
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-[#C9E4CA]/50 overflow-hidden">
                    {userData && (
                      <div className="px-5 py-4 bg-gradient-to-br from-[#F5F1E8] to-[#C9E4CA]/20 border-b border-[#C9E4CA]/40">
                        <p className="text-base font-bold text-[#364958]">{userData.name}</p>
                        <p className="text-sm text-[#55828B] capitalize font-medium mt-1">
                          {userData.userType}
                          {userData.userType === 'agent' && ' 🤝'}
                          {userData.userType === 'builder' && ' 🏗️'}
                          {userData.userType === 'owner' && ' 🏡'}
                        </p>
                      </div>
                    )}
                    
                    <Link 
                      to="/profile" 
                      className="block px-5 py-3 text-[#364958] hover:bg-[#F5F1E8] transition-colors font-medium"
                    >
                      My Profile
                    </Link>
                    
                    {(userData?.userType === 'owner' || userData?.userType === 'agent' || userData?.userType === 'builder') && (
                      <Link 
                        to="/my-properties" 
                        className="block px-5 py-3 text-[#364958] hover:bg-[#F5F1E8] transition-colors font-medium"
                      >
                        My Properties
                      </Link>
                    )}
                    
                    {isAdmin() && (
                      <Link 
                        to="/admin" 
                        className="block px-5 py-3 text-[#55828B] hover:bg-[#F5F1E8] font-bold transition-colors"
                      >
                        Admin Panel
                      </Link>
                    )}
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-3 text-[#C17767] hover:bg-[#F5F1E8] border-t border-[#C9E4CA]/40 font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-[#364958] hover:text-[#55828B] transition-colors font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-gradient-to-r from-[#3B6064] to-[#55828B] text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-semibold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-[#364958] w-10 h-10 flex items-center justify-center hover:bg-[#F5F1E8] rounded-lg transition-colors"
          >
            {isMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 space-y-4 border-t border-[#C9E4CA]/40 bg-gradient-to-b from-[#F5F1E8] to-white rounded-b-xl">
            <Link 
              to="/" 
              className="block text-[#364958] hover:text-[#55828B] font-medium py-2 px-4 rounded-lg hover:bg-[#C9E4CA]/20 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/listings" 
              className="block text-[#364958] hover:text-[#55828B] font-medium py-2 px-4 rounded-lg hover:bg-[#C9E4CA]/20 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              Properties
            </Link>

            {user ? (
              <>
                {!loading && canPostProperty() && (
                  <Link 
                    to="/post-property" 
                    className="block text-[#364958] hover:text-[#55828B] font-medium py-2 px-4 rounded-lg hover:bg-[#C9E4CA]/20 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <FaPlus className="text-sm" />
                      Post Property
                    </span>
                  </Link>
                )}
                <Link 
                  to="/wishlist" 
                  className="block text-[#364958] hover:text-[#55828B] font-medium py-2 px-4 rounded-lg hover:bg-[#C9E4CA]/20 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Wishlist
                </Link>
                <Link 
                  to="/profile" 
                  className="block text-[#364958] hover:text-[#55828B] font-medium py-2 px-4 rounded-lg hover:bg-[#C9E4CA]/20 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                {isAdmin() && (
                  <Link 
                    to="/admin" 
                    className="block text-[#55828B] font-bold py-2 px-4 rounded-lg hover:bg-[#C9E4CA]/20 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-[#C17767] font-medium py-2 px-4 rounded-lg hover:bg-[#C9E4CA]/20 transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block text-[#364958] hover:text-[#55828B] font-medium py-2 px-4 rounded-lg hover:bg-[#C9E4CA]/20 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="block text-white bg-gradient-to-r from-[#3B6064] to-[#55828B] font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;