import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../context/UserContext';
import { getAllUsers, approveUser, rejectUser, deleteUser, toggleUserStatus } from '../../api/users';
import { getAllProperties, deleteProperty, approveProperty, rejectProperty } from '../../api/properties';
import { toast } from 'react-toastify';
import { 
  FaUsers, FaHome, FaChartLine, FaUserCheck, FaClock, FaTimesCircle,
  FaCheckCircle, FaTimes, FaTrash, FaEye, FaFilter, FaSearch,
  FaBars, FaSortAmountDown, FaDownload, FaUserTie, FaHardHat,
  FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaEdit,
  FaUserFriends, FaBuilding, FaExclamationTriangle, FaBan
} from 'react-icons/fa';

const AdminPanel = () => {
  const { getToken } = useAuth();
  const { userData, isAdmin } = useUser();
  const navigate = useNavigate();

  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data State
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalAgents: 0,
    totalBuilders: 0,
    totalProperties: 0,
    pendingProperties: 0,
    approvedProperties: 0,
    rejectedProperties: 0
  });

  // Filters
  const [userFilters, setUserFilters] = useState({
    userType: '',
    providerType: '',
    approvalStatus: '',
    search: ''
  });
  const [propertyFilters, setPropertyFilters] = useState({
    approvalStatus: '',
    listingType: '',
    propertyType: '',
    search: ''
  });

  // Modals
  const [rejectModal, setRejectModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Check admin access
  useEffect(() => {
    if (!userData) return;
    if (!isAdmin()) {
      toast.error('Access denied. Admin only.');
      navigate('/');
    } else {
      fetchData();
    }
  }, [userData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      
      // Fetch users
      const usersResponse = await getAllUsers({}, token);
      const allUsers = usersResponse.data || [];
      setUsers(allUsers);

      // Fetch properties (admin endpoint if available, otherwise regular)
      const propsResponse = await getAllProperties({});
      const allProps = propsResponse.data || [];
      setProperties(allProps);

      // Calculate stats
      const stats = {
        totalUsers: allUsers.length,
        pendingUsers: allUsers.filter(u => u.approvalStatus === 'pending').length,
        totalAgents: allUsers.filter(u => u.providerType === 'agent').length,
        totalBuilders: allUsers.filter(u => u.providerType === 'builder').length,
        totalProperties: allProps.length,
        pendingProperties: allProps.filter(p => p.approvalStatus === 'pending').length,
        approvedProperties: allProps.filter(p => p.approvalStatus === 'approved').length,
        rejectedProperties: allProps.filter(p => p.approvalStatus === 'rejected').length
      };
      setStats(stats);
    } catch (error) {
      toast.error('Failed to fetch admin data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleApproveUser = async (userId) => {
    try {
      const token = await getToken();
      await approveUser(userId, token);
      toast.success('User approved successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleRejectUser = async () => {
    if (!rejectReason) {
      toast.error('Please provide a reason');
      return;
    }
    try {
      const token = await getToken();
      await rejectUser(rejectModal.id, rejectReason, token);
      toast.success('User rejected');
      setRejectModal(null);
      setRejectReason('');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject user');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = await getToken();
      await deleteUser(userId, token);
      toast.success('User deleted');
      setDeleteModal(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const token = await getToken();
      await toggleUserStatus(userId, token);
      toast.success('User status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Property Actions
  const handleApproveProperty = async (propertyId) => {
    try {
      const token = await getToken();
      await approveProperty(propertyId, token);
      toast.success('Property approved');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve property');
    }
  };

  const handleRejectProperty = async (propertyId) => {
    try {
      const token = await getToken();
      await rejectProperty(propertyId, { reason: 'Rejected by admin' }, token);
      toast.success('Property rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject property');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      const token = await getToken();
      await deleteProperty(propertyId, token);
      toast.success('Property deleted');
      setDeleteModal(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete property');
    }
  };

  // Filtered Data
  const filteredUsers = users.filter(user => {
    if (userFilters.userType && user.userType !== userFilters.userType) return false;
    if (userFilters.providerType && user.providerType !== userFilters.providerType) return false;
    if (userFilters.approvalStatus && user.approvalStatus !== userFilters.approvalStatus) return false;
    if (userFilters.search && !user.name.toLowerCase().includes(userFilters.search.toLowerCase()) && 
        !user.email.toLowerCase().includes(userFilters.search.toLowerCase())) return false;
    return true;
  });

  const filteredProperties = properties.filter(prop => {
    if (propertyFilters.approvalStatus && prop.approvalStatus !== propertyFilters.approvalStatus) return false;
    if (propertyFilters.listingType && prop.listingType !== propertyFilters.listingType) return false;
    if (propertyFilters.propertyType && prop.propertyType !== propertyFilters.propertyType) return false;
    if (propertyFilters.search && !prop.title.toLowerCase().includes(propertyFilters.search.toLowerCase())) return false;
    return true;
  });

  const formatPrice = (property) => {
    const price = property.listingType === 'rent' ? property.rentPerMonth : property.price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-md sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <FaBars className="text-xl" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white shadow-lg min-h-screen sticky top-0">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Panel</h1>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaChartLine />
                <span className="font-medium">Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'users'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaUsers />
                <span className="font-medium">Users</span>
                {stats.pendingUsers > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {stats.pendingUsers}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'properties'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FaHome />
                <span className="font-medium">Properties</span>
                {stats.pendingProperties > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {stats.pendingProperties}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-white w-64 h-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <FaTimes className="text-xl text-gray-600" />
                </button>
              </div>
              <nav className="space-y-2">
                <button
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                    activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaChartLine />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                    activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaUsers />
                  <span>Users</span>
                  {stats.pendingUsers > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {stats.pendingUsers}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab('properties'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                    activeTab === 'properties' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaHome />
                  <span>Properties</span>
                  {stats.pendingProperties > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {stats.pendingProperties}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Stats Overview - Always Visible */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-4 mb-6 lg:mb-8">
            <StatCard icon={FaUsers} label="Total Users" value={stats.totalUsers} color="blue" />
            <StatCard icon={FaClock} label="Pending Users" value={stats.pendingUsers} color="yellow" />
            <StatCard icon={FaUserTie} label="Agents" value={stats.totalAgents} color="purple" />
            <StatCard icon={FaHardHat} label="Builders" value={stats.totalBuilders} color="orange" />
            <StatCard icon={FaHome} label="Total Props" value={stats.totalProperties} color="blue" />
            <StatCard icon={FaClock} label="Pending Props" value={stats.pendingProperties} color="yellow" />
            <StatCard icon={FaCheckCircle} label="Approved" value={stats.approvedProperties} color="green" />
            <StatCard icon={FaTimesCircle} label="Rejected" value={stats.rejectedProperties} color="red" />
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Dashboard Overview</h2>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-yellow-900">Pending Approvals</h3>
                        <p className="text-yellow-700 text-sm mt-1">
                          {stats.pendingUsers} users waiting approval
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('users')}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm"
                      >
                        Review
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-blue-900">Pending Properties</h3>
                        <p className="text-blue-700 text-sm mt-1">
                          {stats.pendingProperties} properties to review
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('properties')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
                  <div className="space-y-2">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {user.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-gray-600 text-xs capitalize">{user.userType} · {user.providerType || 'N/A'}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          user.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.approvalStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">User Management</h2>
                
                {/* Filters - Mobile Responsive */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userFilters.search}
                      onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      onClick={() => setUserFilters({ userType: '', providerType: '', approvalStatus: '', search: '' })}
                      className="sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Reset
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={userFilters.userType}
                      onChange={(e) => setUserFilters({ ...userFilters, userType: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">All User Types</option>
                      <option value="seeker">Seeker</option>
                      <option value="provider">Provider</option>
                    </select>
                    
                    <select
                      value={userFilters.providerType}
                      onChange={(e) => setUserFilters({ ...userFilters, providerType: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">All Provider Types</option>
                      <option value="owner">Owner</option>
                      <option value="agent">Agent</option>
                      <option value="builder">Builder</option>
                    </select>
                    
                    <select
                      value={userFilters.approvalStatus}
                      onChange={(e) => setUserFilters({ ...userFilters, approvalStatus: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users List - Mobile Responsive */}
              <div className="p-4 lg:p-6">
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* User Info */}
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {user.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                            <p className="text-sm text-gray-600 truncate">{user.email}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                                {user.userType}
                              </span>
                              {user.providerType && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full capitalize">
                                  {user.providerType}
                                </span>
                              )}
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                user.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {user.approvalStatus}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {user.approvalStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveUser(user.id)}
                                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                              >
                                <FaCheckCircle />
                                <span className="hidden sm:inline">Approve</span>
                              </button>
                              <button
                                onClick={() => setRejectModal(user)}
                                className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                              >
                                <FaTimes />
                                <span className="hidden sm:inline">Reject</span>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm ${
                              user.isActive ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            <FaBan />
                            <span className="hidden sm:inline">{user.isActive ? 'Deactivate' : 'Activate'}</span>
                          </button>
                          <button
                            onClick={() => setDeleteModal({ type: 'user', data: user })}
                            className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No users found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Property Management</h2>
                
                {/* Filters */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Search properties..."
                      value={propertyFilters.search}
                      onChange={(e) => setPropertyFilters({ ...propertyFilters, search: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      onClick={() => setPropertyFilters({ approvalStatus: '', listingType: '', propertyType: '', search: '' })}
                      className="sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Reset
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={propertyFilters.approvalStatus}
                      onChange={(e) => setPropertyFilters({ ...propertyFilters, approvalStatus: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    
                    <select
                      value={propertyFilters.listingType}
                      onChange={(e) => setPropertyFilters({ ...propertyFilters, listingType: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                    
                    <select
                      value={propertyFilters.propertyType}
                      onChange={(e) => setPropertyFilters({ ...propertyFilters, propertyType: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">All Property Types</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="plot">Plot</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Properties List */}
              <div className="p-4 lg:p-6">
                <div className="space-y-4">
                  {filteredProperties.map((property) => (
                    <div key={property.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="md:w-1/4 h-48 md:h-auto relative">
                          <img
                            src={property.images?.[0] || 'https://via.placeholder.com/400x300'}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                              property.approvalStatus === 'approved' ? 'bg-green-600' :
                              property.approvalStatus === 'pending' ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}>
                              {property.approvalStatus}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                              property.listingType === 'rent' ? 'bg-blue-600' : 'bg-purple-600'
                            }`}>
                              {property.listingType === 'rent' ? 'Rent' : 'Sale'}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="md:w-3/4 p-4">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{property.title}</h3>
                              
                              <div className="flex items-center text-gray-600 mb-3 text-sm">
                                <FaMapMarkerAlt className="mr-1" />
                                <span>{property.city}, {property.state}</span>
                              </div>

                              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center">
                                  <FaBed className="mr-1" />
                                  <span>{property.bedrooms} Beds</span>
                                </div>
                                <div className="flex items-center">
                                  <FaBath className="mr-1" />
                                  <span>{property.bathrooms} Baths</span>
                                </div>
                                <div className="flex items-center">
                                  <FaRulerCombined className="mr-1" />
                                  <span>{property.area} sqft</span>
                                </div>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize">
                                  {property.propertyType}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <FaEye className="mr-1" />
                                  <span>{property.views || 0} views</span>
                                </div>
                                <span>Posted {new Date(property.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div className="lg:text-right">
                              <div className="text-2xl font-bold text-blue-600 mb-2">
                                {formatPrice(property)}
                              </div>
                              {property.listingType === 'rent' && (
                                <span className="text-gray-500 text-sm">/month</span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                            {property.approvalStatus === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveProperty(property.id)}
                                  className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                >
                                  <FaCheckCircle />
                                  <span className="hidden sm:inline">Approve</span>
                                </button>
                                <button
                                  onClick={() => handleRejectProperty(property.id)}
                                  className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                >
                                  <FaTimes />
                                  <span className="hidden sm:inline">Reject</span>
                                </button>
                              </>
                            )}
                            <a
                              href={`/property/${property.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              <FaEye />
                              <span className="hidden sm:inline">View</span>
                            </a>
                            <button
                              onClick={() => setDeleteModal({ type: 'property', data: property })}
                              className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                            >
                              <FaTrash />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProperties.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No properties found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Reject User Modal */}
      {rejectModal && rejectModal.email && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject User</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject <strong>{rejectModal.name}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="3"
                placeholder="Provide a reason for rejection..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Confirm Delete</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this {deleteModal.type}?
              {deleteModal.type === 'user' && (
                <span className="block mt-2 font-semibold">
                  {deleteModal.data.name} ({deleteModal.data.email})
                </span>
              )}
              {deleteModal.type === 'property' && (
                <span className="block mt-2 font-semibold">
                  {deleteModal.data.title}
                </span>
              )}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteModal.type === 'user') {
                    handleDeleteUser(deleteModal.data.id);
                  } else {
                    handleDeleteProperty(deleteModal.data.id);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 lg:p-4">
      <div className={`w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br ${colors[color]} rounded-lg flex items-center justify-center mb-2`}>
        <Icon className="text-white text-sm lg:text-base" />
      </div>
      <p className="text-gray-600 text-xs mb-1">{label}</p>
      <p className="text-xl lg:text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default AdminPanel;