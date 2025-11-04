// frontend/src/pages/Listings.jsx - COMPLETE FIXED VERSION
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAllProperties } from '../api/properties';
import PropertyCard from '../components/PropertyCard';
import SearchBar from '../components/SearchBar';
import { toast } from 'react-toastify';

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [compareList, setCompareList] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    listingType: searchParams.get('type') || searchParams.get('listingType') || '',
    propertyType: searchParams.get('propertyType') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || ''
  });

  // Fetch properties on mount and when filters change
  useEffect(() => {
    fetchProperties(1);
  }, []); // Only on mount

  const fetchProperties = async (page = 1) => {
    setLoading(true);
    try {
      // Prepare params - match your backend API expectations
      const params = {
        page,
        limit: 12
      };

      // Add filters only if they have values
      if (filters.search) params.search = filters.search;
      if (filters.listingType) params.listingType = filters.listingType;
      if (filters.propertyType) params.propertyType = filters.propertyType;
      if (filters.city) params.city = filters.city;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.bedrooms) params.bedrooms = filters.bedrooms;

      console.log('🔍 Fetching with params:', params);

      const response = await getAllProperties(params);
      
      console.log('✅ API Response:', response);
      
      setProperties(response.data || []);
      setPagination(response.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error('❌ Fetch error:', error);
      toast.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newFilters) => {
    console.log('🔍 New filters:', newFilters);
    
    setFilters(newFilters);
    
    // Update URL params for sharing/bookmarking
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) {
        params.set(key, newFilters[key]);
      }
    });
    setSearchParams(params);
    
    // Fetch with new filters
    fetchPropertiesWithFilters(newFilters);
  };

  const fetchPropertiesWithFilters = async (filterValues) => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 12
      };

      // Add filters
      if (filterValues.search) params.search = filterValues.search;
      if (filterValues.listingType) params.listingType = filterValues.listingType;
      if (filterValues.propertyType) params.propertyType = filterValues.propertyType;
      if (filterValues.city) params.city = filterValues.city;
      if (filterValues.minPrice) params.minPrice = filterValues.minPrice;
      if (filterValues.maxPrice) params.maxPrice = filterValues.maxPrice;
      if (filterValues.bedrooms) params.bedrooms = filterValues.bedrooms;

      console.log('🔍 Searching with params:', params);

      const response = await getAllProperties(params);
      
      console.log('✅ Search results:', response);
      
      setProperties(response.data || []);
      setPagination(response.pagination || { page: 1, pages: 1, total: 0 });
    } catch (error) {
      console.error('❌ Search error:', error);
      toast.error('Failed to search properties');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setLoading(true);
    
    const params = {
      page: newPage,
      limit: 12
    };

    // Keep existing filters
    if (filters.search) params.search = filters.search;
    if (filters.listingType) params.listingType = filters.listingType;
    if (filters.propertyType) params.propertyType = filters.propertyType;
    if (filters.city) params.city = filters.city;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.bedrooms) params.bedrooms = filters.bedrooms;

    getAllProperties(params)
      .then(response => {
        setProperties(response.data || []);
        setPagination(response.pagination || { page: newPage, pages: 1, total: 0 });
      })
      .catch(error => {
        console.error('Pagination error:', error);
        toast.error('Failed to load page');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCompareToggle = (propertyId) => {
    if (compareList.includes(propertyId)) {
      setCompareList(compareList.filter(id => id !== propertyId));
      toast.info('Removed from comparison');
    } else {
      if (compareList.length >= 3) {
        toast.error('You can compare maximum 3 properties');
        return;
      }
      setCompareList([...compareList, propertyId]);
      toast.success('Added to comparison');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Properties</h1>
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${pagination.total} properties found`}
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} initialFilters={filters} />
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property}
                  onWishlistChange={() => fetchProperties(pagination.page)}
                  compareList={compareList}
                  onCompareToggle={handleCompareToggle}
                />
              ))}
            </div>

            {/* Compare Button - Fixed Position */}
            {compareList.length >= 2 && (
              <button
                onClick={() => navigate(`/compare?ids=${compareList.join(',')}`)}
                className="fixed bottom-8 right-8 bg-purple-600 text-white px-6 py-4 rounded-full shadow-2xl hover:bg-purple-700 z-50 flex items-center gap-3 animate-bounce"
              >
                <span className="font-bold">Compare ({compareList.length})</span>
              </button>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-12 flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {[...Array(pagination.pages)].map((_, index) => {
                  const page = index + 1;
                  
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 || 
                    page === pagination.pages || 
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          pagination.page === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === pagination.page - 2 || 
                    page === pagination.page + 2
                  ) {
                    return <span key={page} className="px-2 text-gray-500">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Properties Found</h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.city || filters.propertyType || filters.listingType
                ? 'Try adjusting your search filters'
                : 'No properties available at the moment'}
            </p>
            <button
              onClick={() => handleSearch({
                search: '',
                listingType: '',
                propertyType: '',
                city: '',
                minPrice: '',
                maxPrice: '',
                bedrooms: ''
              })}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Listings;