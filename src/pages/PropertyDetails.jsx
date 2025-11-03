// frontend/src/pages/PropertyDetails.jsx - IMPRESSIVE VERSION
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPropertyById } from '../api/properties';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../context/UserContext';
import { addToWishlist, removeFromWishlist } from '../api/properties';
import { toast } from 'react-toastify';
import { 
  FaHeart, FaRegHeart, FaShare, FaMapMarkerAlt, FaBed, FaBath, 
  FaRulerCombined, FaBuilding, FaParking, FaTree, FaPhone, FaEnvelope,
  FaWhatsapp, FaFlag, FaCheckCircle, FaChevronLeft, FaChevronRight,
  FaHome, FaUser, FaCalendar, FaEye, FaTimes, FaExclamationTriangle
} from 'react-icons/fa';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const { userData } = useUser();

  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    fetchPropertyDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await getPropertyById(id);
      setProperty(response.data);
      // TODO: Fetch similar properties based on city/type
    } catch (error) {
      toast.error('Failed to load property details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Please login to save properties');
      navigate('/login');
      return;
    }

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
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: url
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleContactOwner = () => {
    if (!user) {
      toast.error('Please login to contact owner');
      navigate('/login');
      return;
    }
    setShowContactModal(true);
  };

  const handleSendMessage = async () => {
    // TODO: Implement contact API
    toast.success('Message sent to property owner!');
    setShowContactModal(false);
    setContactMessage('');
  };

  const handleReport = async () => {
    if (!reportReason) {
      toast.error('Please select a reason');
      return;
    }
    // TODO: Implement report API
    toast.success('Property reported. We will review it.');
    setShowReportModal(false);
    setReportReason('');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Property Not Found</h2>
          <Link to="/listings" className="text-blue-600 hover:underline">
            Browse all properties
          </Link>
        </div>
      </div>
    );
  }

  const price = property.listingType === 'rent' ? property.rentPerMonth : property.price;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-96 md:h-[500px]">
            <img
              src={property.images?.[currentImageIndex] || 'https://via.placeholder.com/800x600'}
              alt={property.title}
              className="w-full h-full object-contain cursor-pointer"
              onClick={() => setShowImageModal(true)}
            />
            
            {/* Navigation Arrows */}
            {property.images?.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70"
                >
                  <FaChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70"
                >
                  <FaChevronRight size={24} />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {property.images?.length || 1}
            </div>

            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-2"
            >
              <FaChevronLeft /> Back
            </button>
          </div>

          {/* Thumbnail Strip */}
          {property.images?.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              {property.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`h-20 w-28 object-cover rounded cursor-pointer ${
                    idx === currentImageIndex ? 'ring-4 ring-blue-500' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                      property.listingType === 'rent' ? 'bg-blue-600' : 'bg-green-600'
                    }`}>
                      For {property.listingType === 'rent' ? 'Rent' : 'Sale'}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold capitalize">
                      {property.propertyType}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{property.address}, {property.city}, {property.state} - {property.pincode}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleWishlist}
                    className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    {isWishlisted ? (
                      <FaHeart className="text-red-500 text-xl" />
                    ) : (
                      <FaRegHeart className="text-gray-600 text-xl" />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <FaShare className="text-gray-600 text-xl" />
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <FaFlag className="text-gray-600 text-xl" />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="border-t pt-4">
                <span className="text-4xl font-bold text-blue-600">
                  {formatPrice(price)}
                </span>
                {property.listingType === 'rent' && (
                  <span className="text-gray-500 text-lg ml-2">/month</span>
                )}
                {property.pricePerSqft && (
                  <span className="text-gray-500 text-sm ml-4">
                    ({formatPrice(property.pricePerSqft)}/sqft)
                  </span>
                )}
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <FaBed className="text-3xl text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Bedrooms</p>
                  <p className="text-xl font-bold text-gray-900">{property.bedrooms}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <FaBath className="text-3xl text-green-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Bathrooms</p>
                  <p className="text-xl font-bold text-gray-900">{property.bathrooms}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <FaRulerCombined className="text-3xl text-purple-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Area</p>
                  <p className="text-xl font-bold text-gray-900">{property.area} sqft</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <FaBuilding className="text-3xl text-orange-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Floor</p>
                  <p className="text-xl font-bold text-gray-900">{property.floor || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailRow label="Property Type" value={property.propertyType} />
                <DetailRow label="Listing Type" value={property.listingType} />
                {property.facing && <DetailRow label="Facing" value={property.facing} />}
                {property.totalFloors && <DetailRow label="Total Floors" value={property.totalFloors} />}
                {property.ageOfProperty && <DetailRow label="Age" value={property.ageOfProperty} />}
                {property.listingType === 'rent' && (
                  <>
                    {property.isFurnished && <DetailRow label="Furnishing" value={property.isFurnished} />}
                    {property.depositAmount && <DetailRow label="Deposit" value={formatPrice(property.depositAmount)} />}
                    {property.maintenanceCharges && <DetailRow label="Maintenance" value={formatPrice(property.maintenanceCharges)} />}
                    {property.leaseDuration && <DetailRow label="Lease Duration" value={property.leaseDuration} />}
                  </>
                )}
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <FaCheckCircle className="text-green-500" />
                      <span className="capitalize">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map - Placeholder */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
              <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Map integration coming soon</p>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              {/* Owner Info */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {property.ownerName?.[0] || 'O'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {property.ownerName || 'Property Owner'}
                      <FaCheckCircle className="text-blue-600" title="Verified User" />
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {property.postedByType || 'owner'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaEye />
                  <span>{property.views || 0} views</span>
                  <span className="mx-2">•</span>
                  <FaCalendar />
                  <span>Posted {new Date(property.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleContactOwner}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <FaEnvelope />
                  Contact Owner
                </button>
                
                {property.ownerPhone && (
                  <>
                    <a
                      href={`tel:${property.ownerPhone}`}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <FaPhone />
                      Call Now
                    </a>
                    <a
                      href={`https://wa.me/${property.ownerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] text-white py-3 rounded-lg font-semibold hover:bg-[#20BA5A] flex items-center justify-center gap-2"
                    >
                      <FaWhatsapp />
                      WhatsApp
                    </a>
                  </>
                )}
              </div>

              {/* Safety Tips */}
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle className="text-yellow-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 text-sm mb-1">Safety Tips</h4>
                    <ul className="text-xs text-yellow-800 space-y-1">
                      <li>• Meet in person before making payment</li>
                      <li>• Never transfer money in advance</li>
                      <li>• Verify property documents</li>
                      <li>• Report suspicious listings</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Contact Owner</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="I'm interested in this property..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Report Listing</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why are you reporting this?
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a reason</option>
                <option value="spam">Spam or misleading</option>
                <option value="sold">Already sold/rented</option>
                <option value="fake">Fake listing</option>
                <option value="wrong_info">Wrong information</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"
          >
            <FaTimes size={32} />
          </button>
          <img
            src={property.images?.[currentImageIndex]}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

// Helper Component
const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100">
    <span className="text-gray-600">{label}:</span>
    <span className="font-semibold text-gray-900 capitalize">{value}</span>
  </div>
);

export default PropertyDetails;