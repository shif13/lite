import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProperties } from '../api/properties';
import PropertyCard from '../components/PropertyCard';
import { FaHome, FaBuilding, FaTree, FaStore, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import FeaturedCarousel from '../components/FeaturedCarousel';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const response = await getFeaturedProperties();
      setFeaturedProperties(response.data || []);
    } catch (error) {
      console.error('Error fetching featured properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/listings?search=${searchQuery}`;
    }
  };

  const propertyTypes = [
    { icon: FaBuilding, name: 'Apartments', type: 'apartment', color: 'blue' },
    { icon: FaHome, name: 'Houses', type: 'house', color: 'green' },
    { icon: FaTree, name: 'Villas', type: 'villa', color: 'purple' },
    { icon: FaStore, name: 'Commercial', type: 'commercial', color: 'orange' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Dream <span className="text-yellow-300">Home</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover the perfect property for you and your family
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="flex bg-white rounded-lg shadow-lg overflow-hidden">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by city, location, or property name..."
                  className="flex-1 px-6 py-4 text-gray-900 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-yellow-400 text-gray-900 px-8 py-4 font-semibold hover:bg-yellow-500 transition-colors"
                >
                  <FaSearch className="inline mr-2" />
                  Search
                </button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">1000+</div>
                <div className="text-blue-100">Properties</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">50+</div>
                <div className="text-blue-100">Cities</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">5000+</div>
                <div className="text-blue-100">Happy Users</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">100+</div>
                <div className="text-blue-100">Agents</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Property Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {propertyTypes.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.type}
                  to={`/listings?propertyType=${item.type}`}
                  className={`bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center group`}
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-${item.color}-100 rounded-full mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`text-3xl text-${item.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Carousel */}
<section className="py-16">
  <div className="max-w-7xl mx-auto px-4">
    <h2 className="text-3xl font-bold mb-8">Featured Properties</h2>
    {loading ? (
      <div className="bg-gray-200 h-[500px] rounded-2xl animate-pulse"></div>
    ) : featuredProperties.length > 0 ? (
      <FeaturedCarousel properties={featuredProperties} />
    ) : (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-gray-500">No featured properties available</p>
      </div>
    )}
  </div>
</section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose FindAbode?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHome className="text-3xl text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Wide Selection</h3>
              <p className="text-gray-600">Browse thousands of properties across multiple cities</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="text-3xl text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Search</h3>
              <p className="text-gray-600">Find your perfect home with our advanced filters</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBuilding className="text-3xl text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Listings</h3>
              <p className="text-gray-600">All properties are verified for your safety</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Dream Home?</h2>
          <p className="text-xl mb-8 text-blue-100">Join thousands of happy homeowners today</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/listings"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Browse Properties
            </Link>
            <Link
              to="/post-property"
              className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              Post Property
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;