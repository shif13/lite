import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaHeart } from 'react-icons/fa';

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
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl group">
      {/* Main Image */}
      <div className="absolute inset-0">
        <img
          src={images[0] || 'https://via.placeholder.com/1200x600'}
          alt={currentProperty.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
      </div>

      {/* Navigation Arrows */}
      {properties.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            onMouseEnter={() => setIsAutoPlaying(false)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-all z-10"
          >
            <FaChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            onMouseEnter={() => setIsAutoPlaying(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-all z-10"
          >
            <FaChevronRight size={20} />
          </button>
        </>
      )}

      {/* Property Info */}
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="px-4 py-1 bg-yellow-500 text-white text-sm font-bold rounded-full">
                  ⭐ FEATURED
                </span>
                <span className={`px-4 py-1 ${
                  currentProperty.listingType === 'rent' ? 'bg-blue-600' : 'bg-green-600'
                } text-white text-sm font-semibold rounded-full`}>
                  For {currentProperty.listingType === 'rent' ? 'Rent' : 'Sale'}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">
                {currentProperty.title}
              </h2>

              {/* Location */}
              <div className="flex items-center gap-2 mb-4">
                <FaMapMarkerAlt />
                <span className="text-lg">{currentProperty.city}, {currentProperty.state}</span>
              </div>

              {/* Price */}
              <div className="text-5xl font-bold mb-6">
                {formatPrice(currentProperty)}
                {currentProperty.listingType === 'rent' && (
                  <span className="text-2xl font-normal">/month</span>
                )}
              </div>

              {/* Details */}
              <div className="flex items-center gap-6 text-lg mb-6">
                <span>{currentProperty.bedrooms} Beds</span>
                <span>•</span>
                <span>{currentProperty.bathrooms} Baths</span>
                <span>•</span>
                <span>{currentProperty.area} sqft</span>
              </div>

              {/* CTA Button */}
              <Link
                to={`/property/${currentProperty.id}`}
                className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                View Details →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dots Indicator */}
      {properties.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {properties.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedCarousel;