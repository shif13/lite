import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';

const FeaturedCarousel = ({ properties }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || properties.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, properties.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % properties.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + properties.length) % properties.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (properties.length === 0) return null;

  const currentProperty = properties[currentIndex];
  const images = typeof currentProperty.images === 'string' 
    ? JSON.parse(currentProperty.images) 
    : currentProperty.images || [];

  const formatPrice = (property) => {
    const price = property.listingType === 'rent' ? property.rentPerMonth : property.price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
      {/* Main Image */}
      <div className="absolute inset-0">
        <img
          src={images[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80'}
          alt={currentProperty.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#344e41]/95 via-[#3a5a40]/50 to-transparent"></div>
      </div>

      {/* Navigation Arrows */}
      {properties.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            onMouseEnter={() => setIsAutoPlaying(false)}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-[#588157] hover:scale-110 transition-all duration-300 z-20 border border-white/30"
          >
            <FaChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            onMouseEnter={() => setIsAutoPlaying(false)}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-[#588157] hover:scale-110 transition-all duration-300 z-20 border border-white/30"
          >
            <FaChevronRight size={24} />
          </button>
        </>
      )}

      {/* Property Info */}
      <div className="absolute bottom-0 left-0 right-0 p-10 text-white z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Badges */}
              <div className="flex items-center gap-3 mb-6">
                <span className="px-5 py-2 bg-[#a3b18a] text-white text-sm font-bold rounded-full shadow-lg backdrop-blur-sm">
                  ⭐ FEATURED
                </span>
                <span className={`px-5 py-2 ${
                  currentProperty.listingType === 'rent' 
                    ? 'bg-[#588157]' 
                    : 'bg-[#3a5a40]'
                } text-white text-sm font-semibold rounded-full shadow-lg backdrop-blur-sm`}>
                  For {currentProperty.listingType === 'rent' ? 'Rent' : 'Sale'}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-5xl font-bold mb-4 drop-shadow-2xl">
                {currentProperty.title}
              </h2>

              {/* Location */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <FaMapMarkerAlt className="text-[#a3b18a]" />
                </div>
                <span className="text-xl text-[#dad7cd]">
                  {currentProperty.city}, {currentProperty.state}
                </span>
              </div>

              {/* Price */}
              <div className="mb-8">
                <span className="text-6xl font-bold text-white drop-shadow-2xl">
                  {formatPrice(currentProperty)}
                </span>
                {currentProperty.listingType === 'rent' && (
                  <span className="text-2xl font-normal text-[#dad7cd]">/month</span>
                )}
              </div>

              {/* Details */}
              <div className="flex items-center gap-8 mb-8">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                  <FaBed className="text-[#a3b18a] text-xl" />
                  <span className="text-lg font-semibold">{currentProperty.bedrooms} Beds</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                  <FaBath className="text-[#a3b18a] text-xl" />
                  <span className="text-lg font-semibold">{currentProperty.bathrooms} Baths</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl">
                  <FaRulerCombined className="text-[#a3b18a] text-xl" />
                  <span className="text-lg font-semibold">{currentProperty.area} sqft</span>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                to={`/property/${currentProperty.id}`}
                className="inline-flex items-center gap-3 bg-[#a3b18a] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#588157] transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
              >
                View Full Details
                <span className="text-2xl">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      {properties.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {properties.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-[#a3b18a] w-12 shadow-lg'
                  : 'bg-white/40 w-3 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedCarousel;