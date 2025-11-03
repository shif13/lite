// frontend/src/components/SearchBar.jsx - FIXED TO MATCH BACKEND API
import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    search: initialFilters.search || '',
    listingType: initialFilters.listingType || '',
    propertyType: initialFilters.propertyType || '',
    city: initialFilters.city || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    bedrooms: initialFilters.bedrooms || ''
  });

  // Update local filters when initialFilters change
  useEffect(() => {
    setFilters({
      search: initialFilters.search || '',
      listingType: initialFilters.listingType || '',
      propertyType: initialFilters.propertyType || '',
      city: initialFilters.city || '',
      minPrice: initialFilters.minPrice || '',
      maxPrice: initialFilters.maxPrice || '',
      bedrooms: initialFilters.bedrooms || ''
    });
  }, [initialFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('🔍 SearchBar submitting filters:', filters); // Debug log
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      listingType: '',
      propertyType: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: ''
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search by location, title, or keywords..."
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Listing Type (Buy/Rent) */}
          <select
            name="listingType"
            value={filters.listingType}
            onChange={handleChange}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Buy or Rent</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>

          {/* Property Type */}
          <select
            name="propertyType"
            value={filters.propertyType}
            onChange={handleChange}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Property Type</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot/Land</option>
            <option value="commercial">Commercial</option>
          </select>

          {/* City */}
          <input
            type="text"
            name="city"
            value={filters.city}
            onChange={handleChange}
            placeholder="City"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Bedrooms */}
          <select
            name="bedrooms"
            value={filters.bedrooms}
            onChange={handleChange}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Bedrooms</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4 BHK</option>
            <option value="5">5+ BHK</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleChange}
            placeholder="Min Price (₹)"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleChange}
            placeholder="Max Price (₹)"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <FaSearch />
            Search Properties
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Reset
          </button>
        </div>

        {/* Active Filters Display */}
        {(filters.search || filters.city || filters.propertyType || filters.listingType || filters.bedrooms || filters.minPrice || filters.maxPrice) && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Search: {filters.search}
                </span>
              )}
              {filters.listingType && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm capitalize">
                  {filters.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                </span>
              )}
              {filters.propertyType && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm capitalize">
                  {filters.propertyType}
                </span>
              )}
              {filters.city && (
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                  City: {filters.city}
                </span>
              )}
              {filters.bedrooms && (
                <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">
                  {filters.bedrooms} BHK
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  Price: ₹{filters.minPrice || '0'} - ₹{filters.maxPrice || '∞'}
                </span>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;