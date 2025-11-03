// frontend/src/components/PropertyCard.jsx - FIXED TO SHOW CORRECT DATA
import { Link } from 'react-router-dom';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { addToWishlist, removeFromWishlist } from '../api/properties';
import { toast } from 'react-toastify';

const PropertyCard = ({ property, onWishlistChange }) => {
  const [isWishlisted, setIsWishlisted] = useState(property.isWishlisted || false);
  const [loading, setLoading] = useState(false);
  const { user, getToken } = useAuth();

  const handleWishlist = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to save properties');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      
      if (isWishlisted) {
        await removeFromWishlist(property.id, token);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(property.id, token);
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
      
      if (onWishlistChange) onWishlistChange();
    } catch (error) {
      toast.error(error.message || 'Failed to update wishlist');
    }
    setLoading(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Determine which price to show based on listing type
  const displayPrice = property.listingType === 'rent' 
    ? property.rentPerMonth 
    : property.price;

  return (
    <Link to={`/property/${property.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={
              property.images && property.images.length > 0 
                ? (typeof property.images === 'string' ? JSON.parse(property.images)[0] : property.images[0])
                : 'https://via.placeholder.com/400x300?text=No+Image'
            }
            alt={property.title}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
          
          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            disabled={loading}
            className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            {isWishlisted ? (
              <FaHeart className="text-red-500 text-xl" />
            ) : (
              <FaRegHeart className="text-gray-600 text-xl" />
            )}
          </button>

          {/* Property Type Badge */}
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
              {displayPrice ? formatPrice(displayPrice) : 'Price Not Available'}
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
            <FaMapMarkerAlt className="mr-1 text-sm flex-shrink-0" />
            <span className="text-sm line-clamp-1">
              {property.city}, {property.state}
            </span>
          </div>

          {/* Property Details */}
          <div className="flex items-center justify-between text-gray-600 border-t pt-3">
            <div className="flex items-center space-x-4">
              {property.bedrooms > 0 && (
                <div className="flex items-center">
                  <FaBed className="mr-1" />
                  <span className="text-sm">{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center">
                  <FaBath className="mr-1" />
                  <span className="text-sm">{property.bathrooms}</span>
                </div>
              )}
              {property.area && (
                <div className="flex items-center">
                  <FaRulerCombined className="mr-1" />
                  <span className="text-sm">{property.area} sqft</span>
                </div>
              )}
            </div>
          </div>

          {/* Property Type */}
          <div className="mt-3">
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize">
              {property.propertyType}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;