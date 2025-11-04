import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { FaHome, FaBuilding, FaTree, FaStore, FaSearch, FaArrowRight, FaCheckCircle, FaStar } from 'react-icons/fa';
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
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5550';
      const response = await fetch(`${API_URL}/api/properties?featured=true&limit=5`);
      const data = await response.json();
      setFeaturedProperties(data.data || []);
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
    { 
      icon: FaBuilding, 
      name: 'Apartments', 
      type: 'apartment', 
      count: '500+',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80'
    },
    { 
      icon: FaHome, 
      name: 'Houses', 
      type: 'house', 
      count: '300+',
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80'
    },
    { 
      icon: FaTree, 
      name: 'Villas', 
      type: 'villa', 
      count: '150+',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80'
    },
    { 
      icon: FaStore, 
      name: 'Commercial', 
      type: 'commercial', 
      count: '50+',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FCF7FF]">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80" 
            alt="Modern Buildings"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#034732]/95 via-[#034732]/90 to-[#880D1E]/85"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="max-w-3xl">
            <div className="inline-block mb-6 px-4 py-2 bg-[#84DD63]/20 border border-[#84DD63]/30 rounded-full backdrop-blur-sm">
              <span className="text-[#84DD63] font-medium text-sm tracking-wide">PREMIUM PROPERTY SEARCH</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
              Find Your Perfect
              <span className="block text-[#84DD63] mt-2">Living Space</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-[#C7EFCF] leading-relaxed">
              Discover exceptional properties tailored to your lifestyle and dreams
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-16">
              <div className="flex flex-col sm:flex-row gap-3 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by city, location, or property name..."
                  className="flex-1 px-6 py-5 text-gray-900 focus:outline-none bg-transparent text-lg"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#034732] to-[#880D1E] text-white px-10 py-5 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
                >
                  <FaSearch className="text-xl" />
                  <span className="text-lg">Search</span>
                </button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { num: '1000+', label: 'Properties' },
                { num: '50+', label: 'Cities' },
                { num: '5000+', label: 'Happy Clients' },
                { num: '100+', label: 'Expert Agents' }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="text-4xl font-bold text-white mb-1">{stat.num}</div>
                  <div className="text-[#C7EFCF] text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Property Types with Images */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#880D1E] font-semibold text-sm tracking-wide uppercase mb-3 block">
              Browse Categories
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#034732] mb-4">
              Browse by Property Type
            </h2>
            <p className="text-xl text-gray-600">Find the perfect match for your needs</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {propertyTypes.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.type}
                  to={`/listings?propertyType=${item.type}`}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-80"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#034732]/95 via-[#034732]/50 to-transparent"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-end p-6">
                    <div className="mb-4 inline-flex w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl items-center justify-center group-hover:bg-[#84DD63] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      <Icon className="text-2xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#84DD63] transition-colors duration-300">
                      {item.name}
                    </h3>
                    <p className="text-[#C7EFCF] text-sm">{item.count} listings</p>
                  </div>
                  
                  {/* Arrow Icon */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-10 h-10 bg-[#84DD63] rounded-full flex items-center justify-center">
                      <FaArrowRight className="text-white" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Carousel */}
      <section className="py-24 bg-[#F2F7F2]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="text-[#880D1E] font-semibold text-sm tracking-wide uppercase mb-3 block">
                Featured Listings
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-[#034732] mb-4">
                Featured Properties
              </h2>
              <p className="text-xl text-gray-600">Handpicked selections just for you</p>
            </div>
            <Link 
              to="/listings"
              className="hidden md:flex items-center gap-2 text-[#034732] font-semibold text-lg hover:text-[#880D1E] transition-colors group"
            >
              View All <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          
          {loading ? (
            <div className="bg-gradient-to-r from-[#D1BCE3]/20 to-[#C7EFCF]/20 h-[500px] rounded-3xl animate-pulse"></div>
          ) : featuredProperties.length > 0 ? (
            <FeaturedCarousel properties={featuredProperties} />
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
              <p className="text-gray-500 text-xl">No featured properties available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#84DD63]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D1BCE3]/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#880D1E] font-semibold text-sm tracking-wide uppercase mb-3 block">
              Our Advantages
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#034732] mb-4">
              Why Choose FindAbode?
            </h2>
            <p className="text-xl text-gray-600">Excellence in every aspect of property search</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: FaCheckCircle,
                title: 'Verified Listings',
                desc: 'Every property is thoroughly verified and authenticated for your complete peace of mind',
                color: 'from-[#034732] to-[#880D1E]'
              },
              {
                icon: FaStar,
                title: 'Expert Support',
                desc: 'Dedicated team of professionals to guide you through your property journey',
                color: 'from-[#880D1E] to-[#034732]'
              },
              {
                icon: FaHome,
                title: 'Wide Selection',
                desc: 'Browse thousands of verified properties across multiple cities and neighborhoods',
                color: 'from-[#034732] to-[#880D1E]'
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="group bg-gradient-to-br from-[#FCF7FF] to-[#CEEDDB] rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-2 border-[#D1BCE3]/30 hover:border-[#84DD63]">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <Icon className="text-4xl text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-[#034732]">{feature.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section with Image */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=80" 
            alt="Luxury Property"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#034732]/95 to-[#880D1E]/90"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-[#C7EFCF] max-w-2xl mx-auto">
            Join thousands of satisfied homeowners who found their perfect property with us
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/listings"
              className="group bg-white text-[#034732] px-10 py-5 rounded-xl font-bold text-lg hover:bg-[#84DD63] hover:text-white transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              Browse Properties
              <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link
              to="/post-property"
              className="group bg-transparent border-2 border-white text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-white hover:text-[#034732] transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              List Your Property
              <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;