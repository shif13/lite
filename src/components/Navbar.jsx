// frontend/src/components/Navbar.jsx (UPDATED)
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
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FaHome className="text-blue-600 text-2xl" />
            <span className="text-2xl font-bold text-gray-800">
              Find<span className="text-blue-600">Abode</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
              Home
            </Link>
            <Link to="/listings" className="text-gray-700 hover:text-blue-600 transition">
              Properties
            </Link>

            {user ? (
              <>
                {/* Only show Post Property for Owner/Agent/Builder */}
                {!loading && canPostProperty() && (
                  <Link 
                    to="/post-property" 
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <FaPlus />
                    <span>Post Property</span>
                  </Link>
                )}
                
                <Link to="/wishlist" className="text-gray-700 hover:text-blue-600 transition">
                  <FaHeart className="text-xl" />
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                    <FaUser />
                    <span className="flex items-center gap-2">
                      {userData?.name || user.displayName || 'Account'}
                      {userData?.isVerified && (
                        <FaCheckCircle className="text-blue-600 text-sm" title="Verified" />
                      )}
                    </span>
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    {/* User Info */}
                    {userData && (
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{userData.name}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {userData.userType}
                          {userData.userType === 'agent' && ' 🤝'}
                          {userData.userType === 'builder' && ' 🏗️'}
                          {userData.userType === 'owner' && ' 🏡'}
                        </p>
                      </div>
                    )}
                    
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </Link>
                    
                    {userData?.userType === 'owner' || userData?.userType === 'agent' || userData?.userType === 'builder' ? (
                      <Link 
                        to="/my-properties" 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        My Properties
                      </Link>
                    ) : null}
                    
                    {isAdmin() && (
                      <Link 
                        to="/admin" 
                        className="block px-4 py-2 text-purple-600 hover:bg-gray-100 font-semibold"
                      >
                        Admin Panel
                      </Link>
                    )}
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 border-t border-gray-200"
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
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {isMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link 
              to="/" 
              className="block text-gray-700 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/listings" 
              className="block text-gray-700 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Properties
            </Link>

            {user ? (
              <>
                {!loading && canPostProperty() && (
                  <Link 
                    to="/post-property" 
                    className="block text-blue-600 font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Post Property
                  </Link>
                )}
                <Link 
                  to="/wishlist" 
                  className="block text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Wishlist
                </Link>
                <Link 
                  to="/profile" 
                  className="block text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                {isAdmin() && (
                  <Link 
                    to="/admin" 
                    className="block text-purple-600 font-semibold"
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
                  className="block w-full text-left text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="block text-blue-600 font-semibold"
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