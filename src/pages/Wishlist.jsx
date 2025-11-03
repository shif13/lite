// frontend/src/pages/Wishlist.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWishlist, removeFromWishlist } from '../api/properties';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { 
  FaHeart, FaEye, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaBed, FaBath, FaRulerCombined, FaShare, FaTrash,
  FaThLarge, FaList, FaFilter, FaSortAmountDown,
  FaHome
} from 'react-icons/fa';

const Wishlist = () => {
  const { getToken, user } = useAuth();
  const navigate = useNavigate();
  
  const [wishlist, setWishlist] = useState([]);
  const [filteredWishlist, setFilteredWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    propertyType: '',
    listingType: '',
    bedrooms: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: ''
  });
  
  const [sortBy, setSortBy] = useState('dateAdded'); // 'dateAdded', 'price', 'area'

  useEffect(() => {
    fetchWishlist();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [wishlist, filters, sortBy]);

  const fetchWishlist = async () => {
    try {
      const token = await getToken();
      const response = await getWishlist(token);
      setWishlist(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch wishlist');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...wishlist];

    // Apply filters
    if (filters.propertyType) {
      filtered = filtered.filter(item => 
        item.Property.propertyType === filters.propertyType
      );
    }
    if (filters.listingType) {
      filtered = filtered.filter(item => 
        item.Property.listingType === filters.listingType
      );
    }
    if (filters.bedrooms) {
      filtered = filtered.filter(item => 
        item.Property.bedrooms === parseInt(filters.bedrooms)
      );
    }
    if (filters.minPrice) {
      filtered = filtered.filter(item => {
        const price = item.Property.listingType === 'rent' 
          ? item.Property.rentPerMonth 
          : item.Property.price;
        return price >= parseFloat(filters.minPrice);
      });
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(item => {
        const price = item.Property.listingType === 'rent' 
          ? item.Property.rentPerMonth 
          : item.Property.price;
        return price <= parseFloat(filters.maxPrice);
      });
    }
    if (filters.minArea) {
      filtered = filtered.filter(item => 
        item.Property.area >= parseFloat(filters.minArea)
      );
    }
    if (filters.maxArea) {
      filtered = filtered.filter(item => 
        item.Property.area <= parseFloat(filters.maxArea)
      );
    }

    // Apply sorting
    if (sortBy === 'dateAdded') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'priceLowToHigh') {
      filtered.sort((a, b) => {
        const priceA = a.Property.listingType === 'rent' ? a.Property.rentPerMonth : a.Property.price;
        const priceB = b.Property.listingType === 'rent' ? b.Property.rentPerMonth : b.Property.price;
        return priceA - priceB;
      });
    } else if (sortBy === 'priceHighToLow') {
      filtered.sort((a, b) => {
        const priceA = a.Property.listingType === 'rent' ? a.Property.rentPerMonth : a.Property.price;
        const priceB = b.Property.listingType === 'rent' ? b.Property.rentPerMonth : b.Property.price;
        return priceB - priceA;
      });
    } else if (sortBy === 'areaLarge') {
      filtered.sort((a, b) => b.Property.area - a.Property.area);
    } else if (sortBy === 'areaSmall') {
      filtered.sort((a, b) => a.Property.area - b.Property.area);
    }

    setFilteredWishlist(filtered);
  };

  const handleRemoveFromWishlist = async (propertyId) => {
    try {
      const token = await getToken();
      await removeFromWishlist(propertyId, token);
      setWishlist(wishlist.filter(item => item.propertyId !== propertyId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleResetFilters = () => {
    setFilters({
      propertyType: '',
      listingType: '',
      bedrooms: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: ''
    });
  };

  const handleShare = (property) => {
    const url = `${window.location.origin}/property/${property.id}`;
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatPrice = (price) => {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {filteredWishlist.length} {filteredWishlist.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>

        {wishlist.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaHeart className="text-5xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Properties Saved Yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start adding properties to your wishlist to keep track of your favorite options
            </p>
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <FaHome />
              Browse Properties
            </Link>
          </div>
        ) : (
          <>
            {/* Controls Bar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <FaThLarge />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <FaList />
                  </button>
                </div>

                {/* Sort & Filter */}
                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <FaSortAmountDown className="text-gray-600" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="dateAdded">Date Added (Newest)</option>
                      <option value="priceLowToHigh">Price: Low to High</option>
                      <option value="priceHighToLow">Price: High to Low</option>
                      <option value="areaLarge">Area: Large to Small</option>
                      <option value="areaSmall">Area: Small to Large</option>
                    </select>
                  </div>

                  {/* Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <FaFilter />
                    Filters
                    {Object.values(filters).some(val => val) && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {Object.values(filters).filter(val => val).length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Property Type */}
                    <select
                      name="propertyType"
                      value={filters.propertyType}
                      onChange={handleFilterChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Types</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="commercial">Commercial</option>
                      <option value="plot">Plot/Land</option>
                    </select>

                    {/* Listing Type */}
                    <select
                      name="listingType"
                      value={filters.listingType}
                      onChange={handleFilterChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Buy/Rent</option>
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>

                    {/* Bedrooms */}
                    <select
                      name="bedrooms"
                      value={filters.bedrooms}
                      onChange={handleFilterChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Bedrooms</option>
                      <option value="1">1 BHK</option>
                      <option value="2">2 BHK</option>
                      <option value="3">3 BHK</option>
                      <option value="4">4 BHK</option>
                      <option value="5">5+ BHK</option>
                    </select>

                    {/* Min Price */}
                    <input
                      type="number"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      placeholder="Min Price"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Max Price */}
                    <input
                      type="number"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      placeholder="Max Price"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Min Area */}
                    <input
                      type="number"
                      name="minArea"
                      value={filters.minArea}
                      onChange={handleFilterChange}
                      placeholder="Min Area (sqft)"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Max Area */}
                    <input
                      type="number"
                      name="maxArea"
                      value={filters.maxArea}
                      onChange={handleFilterChange}
                      placeholder="Max Area (sqft)"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Reset Button */}
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Properties Display */}
            {filteredWishlist.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 text-lg">No properties match your filters</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredWishlist.map((item) => {
                  const property = item.Property;
                  const price = property.listingType === 'rent' 
                    ? property.rentPerMonth 
                    : property.price;

                  return viewMode === 'grid' ? (
                    // Grid View Card
                    <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                      {/* Image */}
                      <div className="relative h-48">
                        <img
                          src={property.images?.[0] || 'https://via.placeholder.com/400x300'}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                            property.listingType === 'rent' ? 'bg-blue-600' : 'bg-green-600'
                          }`}>
                            For {property.listingType === 'rent' ? 'Rent' : 'Sale'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        {/* Price */}
                        <div className="mb-2">
                          <span className="text-2xl font-bold text-blue-600">
                            {formatPrice(price)}
                          </span>
                          {property.listingType === 'rent' && (
                            <span className="text-gray-500 text-sm">/month</span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                          {property.title}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center text-gray-600 mb-3">
                          <FaMapMarkerAlt className="mr-1 text-sm" />
                          <span className="text-sm line-clamp-1">{property.city}, {property.state}</span>
                        </div>

                        {/* Details */}
                        <div className="flex items-center justify-between text-gray-600 border-t pt-3 mb-3">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <FaBed className="mr-1" />
                              <span className="text-sm">{property.bedrooms}</span>
                            </div>
                            <div className="flex items-center">
                              <FaBath className="mr-1" />
                              <span className="text-sm">{property.bathrooms}</span>
                            </div>
                            <div className="flex items-center">
                              <FaRulerCombined className="mr-1" />
                              <span className="text-sm">{property.area} sqft</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-3 gap-2">
                          <Link
                            to={`/property/${property.id}`}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            <FaEye />
                            View
                          </Link>
                          <button
                            onClick={() => handleShare(property)}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                          >
                            <FaShare />
                            Share
                          </button>
                          <button
                            onClick={() => handleRemoveFromWishlist(property.id)}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                          >
                            <FaTrash />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // List View Card
                    <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="md:w-1/3 h-48 md:h-auto relative">
                          <img
                            src={property.images?.[0] || 'https://via.placeholder.com/400x300'}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                              property.listingType === 'rent' ? 'bg-blue-600' : 'bg-green-600'
                            }`}>
                              For {property.listingType === 'rent' ? 'Rent' : 'Sale'}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="md:w-2/3 p-6 flex flex-col justify-between">
                          <div>
                            {/* Header */}
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-1">
                                  {property.title}
                                </h3>
                                <div className="flex items-center text-gray-600 mb-2">
                                  <FaMapMarkerAlt className="mr-1" />
                                  <span className="text-sm">{property.city}, {property.state}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl font-bold text-blue-600">
                                  {formatPrice(price)}
                                </span>
                                {property.listingType === 'rent' && (
                                  <span className="text-gray-500 text-sm block">/month</span>
                                )}
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {property.description}
                            </p>

                            {/* Details */}
                            <div className="flex items-center gap-6 text-gray-600 mb-4">
                              <div className="flex items-center">
                                <FaBed className="mr-2" />
                                <span className="text-sm font-medium">{property.bedrooms} Bedrooms</span>
                              </div>
                              <div className="flex items-center">
                                <FaBath className="mr-2" />
                                <span className="text-sm font-medium">{property.bathrooms} Bathrooms</span>
                              </div>
                              <div className="flex items-center">
                                <FaRulerCombined className="mr-2" />
                                <span className="text-sm font-medium">{property.area} sqft</span>
                              </div>
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize">
                                {property.propertyType}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <Link
                              to={`/property/${property.id}`}
                              className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                              <FaEye />
                              View Details
                            </Link>
                            <button
                              onClick={() => handleShare(property)}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                              <FaShare />
                              Share
                            </button>
                            <button
                              onClick={() => handleRemoveFromWishlist(property.id)}
                              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            >
                              <FaTrash />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;