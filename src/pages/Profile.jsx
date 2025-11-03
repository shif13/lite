// frontend/src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../context/UserContext';
import { updateUserProfile } from '../api/users';
import { getUserProperties } from '../api/properties';
import { toast } from 'react-toastify';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, 
  FaEdit, FaSave, FaTimes, FaCheckCircle, 
  FaBuilding, FaIdCard, FaClock, FaShieldAlt,
  FaKey, FaTrash, FaSignOutAlt, FaHome, FaEye, FaEnvelopeOpen,
  FaTimesCircle, FaExclamationTriangle
} from 'react-icons/fa';

const Profile = () => {
  const { user, getToken, logout } = useAuth();
  const { userData, refreshUserData, getUserDisplayType, isProvider, isSeeker, isPending, isRejected } = useUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalContacts: 0
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    state: '',
    address: ''
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        city: userData.city || '',
        state: userData.state || '',
        address: userData.address || ''
      });

      // Fetch statistics for providers
      if (isProvider()) {
        fetchStatistics();
      }
    }
  }, [userData]);

  const fetchStatistics = async () => {
    try {
      const token = await getToken();
      const response = await getUserProperties(token);
      const properties = response.data || [];
      
      const totalViews = properties.reduce((sum, prop) => sum + (prop.views || 0), 0);
      const totalContacts = properties.reduce((sum, prop) => sum + (prop.contacts || 0), 0);
      
      setStats({
        totalProperties: properties.length,
        totalViews,
        totalContacts
      });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      await updateUserProfile(user.uid, formData, token);
      await refreshUserData();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        city: userData.city || '',
        state: userData.state || '',
        address: userData.address || ''
      });
    }
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    // Redirect to Firebase password reset
    navigate('/forgot-password');
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      // TODO: Implement delete account API
      toast.info('Account deletion requested. Please contact support.');
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {userData.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {userData.name}
                  {userData.isVerified && (
                    <FaCheckCircle className="text-blue-600" title="Verified Account" />
                  )}
                </h1>
                <p className="text-gray-600">{getUserDisplayType()}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    userData.approvalStatus === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : userData.approvalStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {userData.approvalStatus === 'approved' ? '✓ Approved' : 
                     userData.approvalStatus === 'pending' ? '⏳ Pending Approval' : 
                     '✗ Rejected'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    userData.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {userData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>

        {/* Statistics (For Providers Only) */}
        {isProvider() && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Properties</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalProperties}</p>
                </div>
                <FaHome className="text-4xl text-blue-200" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Views</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalViews}</p>
                </div>
                <FaEye className="text-4xl text-green-200" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Contacts</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalContacts}</p>
                </div>
                <FaEnvelopeOpen className="text-4xl text-purple-200" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'personal'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Personal Info
              </button>
              {isProvider() && (
                <button
                  onClick={() => setActiveTab('professional')}
                  className={`px-6 py-4 font-medium ${
                    activeTab === 'professional'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Professional Info
                </button>
              )}
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 font-medium ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Account Settings
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <FaEdit />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <FaSave />
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        <FaTimes />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUser className="inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaEnvelope className="inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={userData.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaPhone className="inline mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline mr-2" />
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Professional Info Tab (Providers Only) */}
            {activeTab === 'professional' && isProvider() && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Professional Information</h2>
                <p className="text-sm text-gray-600 mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  ℹ️ Professional details cannot be edited after signup. Contact support if you need changes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Provider Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provider Type
                    </label>
                    <input
                      type="text"
                      value={userData.providerType?.toUpperCase()}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 capitalize"
                    />
                  </div>

                  {/* Agent Fields */}
                  {userData.providerType === 'agent' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaBuilding className="inline mr-2" />
                          Agency Name
                        </label>
                        <input
                          type="text"
                          value={userData.agencyName || '-'}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaIdCard className="inline mr-2" />
                          License Number
                        </label>
                        <input
                          type="text"
                          value={userData.licenseNumber || '-'}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaShieldAlt className="inline mr-2" />
                          RERA Number
                        </label>
                        <input
                          type="text"
                          value={userData.reraNumber || '-'}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                      </div>
                    </>
                  )}

                  {/* Builder Fields */}
                  {userData.providerType === 'builder' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaBuilding className="inline mr-2" />
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={userData.companyName || '-'}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaShieldAlt className="inline mr-2" />
                          RERA Number
                        </label>
                        <input
                          type="text"
                          value={userData.reraNumber || '-'}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          GST Number
                        </label>
                        <input
                          type="text"
                          value={userData.gstNumber || '-'}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                      </div>
                    </>
                  )}

                  {/* Registration Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaClock className="inline mr-2" />
                      Member Since
                    </label>
                    <input
                      type="text"
                      value={new Date(userData.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                </div>

                {/* Rejection Reason (if applicable) */}
                {isRejected() && userData.rejectionReason && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <FaExclamationTriangle className="text-red-600 text-xl mt-1" />
                      <div>
                        <h3 className="font-semibold text-red-800 mb-1">Account Rejection Reason:</h3>
                        <p className="text-red-700 text-sm">{userData.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>

                <div className="space-y-4">
                  {/* Change Password */}
                  <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <FaKey className="text-gray-600" />
                        Change Password
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Update your password to keep your account secure
                      </p>
                    </div>
                    <button
                      onClick={handleChangePassword}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Change Password
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div className="bg-red-50 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900 flex items-center gap-2">
                          <FaTrash className="text-red-600" />
                          Delete Account
                        </h3>
                        <p className="text-sm text-red-700 mt-1">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        {showDeleteConfirm && (
                          <div className="mt-4 bg-white border-2 border-red-200 rounded-lg p-4">
                            <p className="text-sm font-semibold text-red-800 mb-3">
                              ⚠️ Are you absolutely sure? This will:
                            </p>
                            <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc mb-4">
                              <li>Delete your account permanently</li>
                              <li>Remove all your properties</li>
                              <li>Delete all your saved data</li>
                              <li>Cannot be recovered</li>
                            </ul>
                            <div className="flex gap-3">
                              <button
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                              >
                                Yes, Delete My Account
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      {!showDeleteConfirm && (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Delete Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;