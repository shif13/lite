import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPropertyById } from '../api/properties';
import { toast } from 'react-toastify';
import { 
  FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, 
  FaTimes, FaCheckCircle, FaTimesCircle 
} from 'react-icons/fa';

const PropertyComparison = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',') || [];
    if (ids.length < 2 || ids.length > 3) {
      toast.error('Please select 2-3 properties to compare');
      navigate('/listings');
      return;
    }
    fetchProperties(ids);
  }, [searchParams]);

  const fetchProperties = async (ids) => {
    try {
      const promises = ids.map(id => getPropertyById(id));
      const results = await Promise.all(promises);
      setProperties(results.map(r => r.data));
    } catch (error) {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
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

  const ComparisonRow = ({ label, values, highlight = false }) => (
    <div className={`grid grid-cols-${properties.length + 1} gap-4 py-4 border-b ${
      highlight ? 'bg-blue-50' : ''
    }`}>
      <div className="font-semibold text-gray-700">{label}</div>
      {values.map((value, idx) => (
        <div key={idx} className="text-gray-900 text-center">
          {value}
        </div>
      ))}
    </div>
  );

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Compare Properties</h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <FaTimes />
            Close
          </button>
        </div>

        {/* Property Cards */}
        <div className={`grid grid-cols-${properties.length} gap-6 mb-8`}>
          {properties.map((property) => {
            const images = typeof property.images === 'string' 
              ? JSON.parse(property.images) 
              : property.images || [];

            return (
              <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={images[0] || 'https://via.placeholder.com/400x300'}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{property.title}</h3>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <FaMapMarkerAlt className="mr-1" />
                    <span>{property.city}, {property.state}</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(property)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Detailed Comparison</h2>

            {/* Basic Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              <ComparisonRow 
                label="Price" 
                values={properties.map(p => formatPrice(p))}
                highlight
              />
              <ComparisonRow 
                label="Type" 
                values={properties.map(p => p.listingType === 'rent' ? 'For Rent' : 'For Sale')}
              />
              <ComparisonRow 
                label="Property Type" 
                values={properties.map(p => p.propertyType)}
              />
            </div>

            {/* Property Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Property Details</h3>
              <ComparisonRow 
                label="Bedrooms" 
                values={properties.map(p => p.bedrooms)}
                highlight
              />
              <ComparisonRow 
                label="Bathrooms" 
                values={properties.map(p => p.bathrooms)}
              />
              <ComparisonRow 
                label="Area (sqft)" 
                values={properties.map(p => p.area)}
                highlight
              />
              <ComparisonRow 
                label="Price/sqft" 
                values={properties.map(p => 
                  p.pricePerSqft ? `₹${p.pricePerSqft}` : 'N/A'
                )}
              />
              <ComparisonRow 
                label="Floor" 
                values={properties.map(p => p.floor || 'N/A')}
              />
              <ComparisonRow 
                label="Facing" 
                values={properties.map(p => p.facing || 'N/A')}
              />
              <ComparisonRow 
                label="Age" 
                values={properties.map(p => p.ageOfProperty || 'N/A')}
              />
            </div>

            {/* Amenities */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Amenities</h3>
              {/* Get all unique amenities */}
              {(() => {
                const allAmenities = new Set();
                properties.forEach(p => {
                  p.amenities?.forEach(a => allAmenities.add(a));
                });

                return Array.from(allAmenities).map(amenity => (
                  <ComparisonRow
                    key={amenity}
                    label={amenity}
                    values={properties.map(p => 
                      p.amenities?.includes(amenity) 
                        ? <FaCheckCircle className="text-green-600 mx-auto" />
                        : <FaTimesCircle className="text-red-400 mx-auto" />
                    )}
                  />
                ));
              })()}
            </div>

            {/* Rental Specific */}
            {properties.some(p => p.listingType === 'rent') && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Rental Details</h3>
                <ComparisonRow 
                  label="Furnishing" 
                  values={properties.map(p => 
                    p.listingType === 'rent' ? p.isFurnished : 'N/A'
                  )}
                />
                <ComparisonRow 
                  label="Deposit" 
                  values={properties.map(p => 
                    p.depositAmount ? formatPrice({...p, price: p.depositAmount}) : 'N/A'
                  )}
                />
                <ComparisonRow 
                  label="Maintenance" 
                  values={properties.map(p => 
                    p.maintenanceCharges ? `₹${p.maintenanceCharges}` : 'N/A'
                  )}
                />
              </div>
            )}

            {/* Actions */}
            <div className={`grid grid-cols-${properties.length} gap-6 mt-8`}>
              {properties.map((property) => (
                <button
                  key={property.id}
                  onClick={() => navigate(`/property/${property.id}`)}
                  className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  View Details
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyComparison;