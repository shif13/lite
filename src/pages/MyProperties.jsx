import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserProperties, deleteProperty } from '../api/properties';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaMapMarkerAlt, FaBed, FaBath,
  FaRulerCombined, FaCheckCircle, FaClock, FaTimes, FaFilter,
  FaSortAmountDown, FaChartLine, FaPhone, FaEnvelope
} from 'react-icons/fa';

const MyProperties = () => {
  const { getToken } = useAuth();
  const { userData, canPostProperty } = useUser();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const [filters, setFilters] = useState({
    approvalStatus: '',
    listingType: '',
    propertyType: ''
  });
  
  const [sortBy, setSortBy] = useState('newest');
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalViews: 0,
    totalContacts: 0
  });

  useEffect(() => {
    if (canPostProperty()) {
      fetchProperties();
    }
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [properties, filters, sortBy]);

  const fetchProperties = async () => {
    try {
      const token = await getToken();
      const response = await getUserProperties(token);
      const props = response.data || [];
      setProperties(props);
      
      // Calculate stats
      const stats = {
        total: props.length,
        approved: props.filter(p => p.approvalStatus === 'approved').length,
        pending: props.filter(p => p.approvalStatus === 'pending').length,
        rejected: props.filter(p => p.approvalStatus === 'rejected').length,
        totalViews: props.reduce((sum, p) => sum + (p.views || 0), 0),
        totalContacts: props.reduce((sum, p) => sum + (p.contacts || 0), 0)
      };
      setStats(stats);
    } catch (error) {
      toast.error('Failed to fetch properties');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...properties];

    // Apply filters
    if (filters.approvalStatus) {
      filtered = filtered.filter(p => p.approvalStatus === filters.approvalStatus);
    }
    if (filters.listingType) {
      filtered = filtered.filter(p => p.listingType === filters.listingType);
    }
    if (filters.propertyType) {
      filtered = filtered.filter(p => p.propertyType === filters.propertyType);
    }

    // Apply sorting
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'views') {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'contacts') {
      filtered.sort((a, b) => (b.contacts || 0) - (a.contacts || 0));
    }

    setFilteredProperties(filtered);
  };

  const handleDelete = async (id) => {
    try {
      const token = await getToken();
      await deleteProperty(id, token);
      setProperties(properties.filter(p => p.id !== id));
      toast.success('Property deleted successfully');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete property');
    }
  };

  const formatPrice = (property) => {
    const price = property.listingType === 'rent' ? property.rentPerMonth : property.price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!canPostProperty()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Only providers can view this page</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Properties</h1>
            <p className="text-gray-600">Manage your property listings</p>
          </div>
          <Link
            to="/post-property"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            <FaPlus />
            Post New Property
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-600 text-sm mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-600 text-sm mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-600 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-600 text-sm mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-600 text-sm mb-1">Total Views</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalViews}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-600 text-sm mb-1">Contacts</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalContacts}</p>
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <select
              value={filters.approvalStatus}
              onChange={(e) => setFilters({ ...filters, approvalStatus: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Listing Type Filter */}
            <select
              value={filters.listingType}
              onChange={(e) => setFilters({ ...filters, listingType: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Buy/Rent</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>

            {/* Property Type Filter */}
            <select
              value={filters.propertyType}
              onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
            </select>

            {/* Sort */}
            <div className="ml-auto flex items-center gap-2">
              <FaSortAmountDown className="text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="views">Most Viewed</option>
                <option value="contacts">Most Contacted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties List */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaPlus className="text-5xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {properties.length === 0 ? 'No Properties Yet' : 'No Properties Match Filters'}
            </h2>
            <p className="text-gray-600 mb-6">
              {properties.length === 0 
                ? 'Start by posting your first property' 
                : 'Try adjusting your filters'}
            </p>
            {properties.length === 0 && (
              <Link
                to="/post-property"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                <FaPlus />
                Post Property
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-1/4 h-48 md:h-auto relative">
                    <img
                      src={property.images?.[0] || 'https://via.placeholder.com/400x300'}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1 ${
                        property.approvalStatus === 'approved' ? 'bg-green-600' :
                        property.approvalStatus === 'pending' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}>
                        {property.approvalStatus === 'approved' && <FaCheckCircle />}
                        {property.approvalStatus === 'pending' && <FaClock />}
                        {property.approvalStatus === 'rejected' && <FaTimes />}
                        {property.approvalStatus.charAt(0).toUpperCase() + property.approvalStatus.slice(1)}
                      </span>
                    </div>

                    {/* Listing Type */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        property.listingType === 'rent' ? 'bg-blue-600' : 'bg-purple-600'
                      }`}>
                        {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="md:w-3/4 p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div className="flex-1">
                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {property.title}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center text-gray-600 mb-3">
                          <FaMapMarkerAlt className="mr-2" />
                          <span className="text-sm">{property.city}, {property.state}</span>
                        </div>

                        {/* Details */}
                        <div className="flex items-center gap-6 text-gray-600 mb-3">
                          <div className="flex items-center">
                            <FaBed className="mr-2" />
                            <span className="text-sm">{property.bedrooms} Beds</span>
                          </div>
                          <div className="flex items-center">
                            <FaBath className="mr-2" />
                            <span className="text-sm">{property.bathrooms} Baths</span>
                          </div>
                          <div className="flex items-center">
                            <FaRulerCombined className="mr-2" />
                            <span className="text-sm">{property.area} sqft</span>
                          </div>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize">
                            {property.propertyType}
                          </span>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaEye className="mr-1" />
                            <span>{property.views || 0} views</span>
                          </div>
                          <div className="flex items-center">
                            <FaEnvelope className="mr-1" />
                            <span>{property.contacts || 0} contacts</span>
                          </div>
                          <span>Posted {new Date(property.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mt-4 md:mt-0 md:ml-6 text-right">
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(property)}
                        </span>
                        {property.listingType === 'rent' && (
                          <span className="text-gray-500 text-sm block">/month</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                      <Link
                        to={`/property/${property.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        <FaEye />
                        View
                      </Link>

                      <Link
                        to={`/edit-property/${property.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                      >
                        <FaEdit />
                        Edit
                      </Link>

                      <button
                        onClick={() => setDeleteConfirm(property.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm font-medium"
                      >
                        <FaTrash />
                        Delete
                      </button>

                      {property.approvalStatus === 'approved' && (
                        <button
                          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 text-sm font-medium"
                        >
                          <FaChartLine />
                          Analytics
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Property?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this property? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProperties;