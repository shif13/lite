import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../context/UserContext';
import { createProperty } from '../api/properties';
import { uploadMultipleImages } from '../firebase/cloudinary';
import { toast } from 'react-toastify';
import { 
  FaHome, FaMapMarkerAlt, FaRupeeSign, FaBed, FaBath, 
  FaRulerCombined, FaImage, FaCheckCircle, FaTimes,
  FaSpinner, FaInfoCircle
} from 'react-icons/fa';

const PostProperty = () => {
  const { getToken } = useAuth();
  const { userData, canPostProperty, isPending } = useUser();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    propertyType: 'apartment',
    listingType: 'sale',
    
    // Price Info
    price: '',
    pricePerSqft: '',
    rentPerMonth: '',
    depositAmount: '',
    maintenanceCharges: '',
    leaseDuration: '',
    
    // Property Details
    bedrooms: '',
    bathrooms: '',
    area: '',
    floor: '',
    totalFloors: '',
    facing: '',
    ageOfProperty: '',
    isFurnished: 'unfurnished',
    
    // Location
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    
    // Media & Amenities
    images: [],
    videoUrl: '',
    amenities: [],
    
    // Owner Info (if agent/builder)
    postedByType: 'self',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: ''
  });

  const amenitiesList = [
    'Parking', 'Lift', 'Power Backup', 'Swimming Pool', 'Gym',
    'Garden', 'Security', 'Playground', 'Club House', 'Water Supply',
    'Air Conditioning', 'WiFi', 'Intercom', 'Gas Pipeline', 'Sewage Treatment'
  ];

  // Check permissions
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!canPostProperty()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimes className="text-3xl text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isPending() ? 'Approval Pending' : 'Cannot Post Properties'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isPending() 
              ? 'Your account is pending admin approval. Once approved, you can post properties.'
              : 'Only property owners, agents, and builders can post properties. Please create a provider account.'}
          </p>
          <button
            onClick={() => navigate(isPending() ? '/pending-approval' : '/signup/provider-type')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            {isPending() ? 'Check Status' : 'Become a Provider'}
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Auto-calculate price per sqft
    if (name === 'price' || name === 'area') {
      const price = name === 'price' ? parseFloat(value) : parseFloat(formData.price);
      const area = name === 'area' ? parseFloat(value) : parseFloat(formData.area);
      if (price && area) {
        setFormData(prev => ({ ...prev, pricePerSqft: (price / area).toFixed(2) }));
      }
    }
  };

  const handleAmenityToggle = (amenity) => {
    const current = formData.amenities;
    if (current.includes(amenity)) {
      setFormData({ ...formData, amenities: current.filter(a => a !== amenity) });
    } else {
      setFormData({ ...formData, amenities: [...current, amenity] });
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setImageFiles([...imageFiles, ...files]);

    // Generate previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (imageFiles.length === 0) {
      toast.warn('Please upload at least one image');
      return;
    }

    if (formData.listingType === 'sale' && !formData.price) {
      toast.error('Please enter sale price');
      return;
    }

    if (formData.listingType === 'rent' && !formData.rentPerMonth) {
      toast.error('Please enter monthly rent');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Upload images to Cloudinary
      setUploadingImages(true);
      const uploadResult = await uploadMultipleImages(imageFiles);
      
      if (!uploadResult.success) {
        toast.error('Failed to upload images');
        setIsLoading(false);
        setUploadingImages(false);
        return;
      }

      setUploadingImages(false);

      // Step 2: Prepare property data
      const propertyData = {
        ...formData,
        images: uploadResult.urls,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area: parseFloat(formData.area),
        price: formData.listingType === 'sale' ? parseFloat(formData.price) : null,
        rentPerMonth: formData.listingType === 'rent' ? parseFloat(formData.rentPerMonth) : null,
        depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : null,
        maintenanceCharges: formData.maintenanceCharges ? parseFloat(formData.maintenanceCharges) : null,
        totalFloors: formData.totalFloors ? parseInt(formData.totalFloors) : null,
        postedByType: userData.providerType
      };

      // Step 3: Submit to backend
      const token = await getToken();
      const result = await createProperty(propertyData, token);

      if (result.success) {
        toast.success(result.message);
        navigate('/my-properties');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to post property. Please try again.');
    } finally {
      setIsLoading(false);
      setUploadingImages(false);
    }
  };

  const nextStep = () => {
    // Basic validation before moving forward
    if (step === 1) {
      if (!formData.title || !formData.description) {
        toast.error('Please fill in title and description');
        return;
      }
    }
    if (step === 2) {
      if (formData.listingType === 'sale' && !formData.price) {
        toast.error('Please enter sale price');
        return;
      }
      if (formData.listingType === 'rent' && !formData.rentPerMonth) {
        toast.error('Please enter monthly rent');
        return;
      }
    }
    if (step === 3) {
      if (!formData.area) {
        toast.error('Please enter property area');
        return;
      }
    }
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post Your Property</h1>
          <p className="text-gray-600">Fill in the details to list your property</p>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s < step ? <FaCheckCircle /> : s}
                </div>
                {s < 5 && (
                  <div className={`w-16 h-1 mx-2 ${s < step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Basic Info</span>
            <span>Pricing</span>
            <span>Details</span>
            <span>Location</span>
            <span>Media</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Spacious 3BHK Apartment in Andheri West"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Describe your property in detail..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
                    <select
                      name="propertyType"
                      required
                      value={formData.propertyType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="villa">Villa</option>
                      <option value="plot">Plot/Land</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type *</label>
                    <select
                      name="listingType"
                      required
                      value={formData.listingType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pricing */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing Details</h2>
              
              <div className="space-y-4">
                {formData.listingType === 'sale' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price (₹) *</label>
                      <input
                        type="number"
                        name="price"
                        required
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="e.g., 8500000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {formData.pricePerSqft && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          Price per sq.ft: ₹{formData.pricePerSqft}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent (₹) *</label>
                      <input
                        type="number"
                        name="rentPerMonth"
                        required
                        value={formData.rentPerMonth}
                        onChange={handleChange}
                        placeholder="e.g., 35000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit (₹)</label>
                        <input
                          type="number"
                          name="depositAmount"
                          value={formData.depositAmount}
                          onChange={handleChange}
                          placeholder="e.g., 70000"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance (₹/month)</label>
                        <input
                          type="number"
                          name="maintenanceCharges"
                          value={formData.maintenanceCharges}
                          onChange={handleChange}
                          placeholder="e.g., 2000"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing Status</label>
                        <select
                          name="isFurnished"
                          value={formData.isFurnished}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="unfurnished">Unfurnished</option>
                          <option value="semi-furnished">Semi-Furnished</option>
                          <option value="furnished">Fully Furnished</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lease Duration</label>
                        <input
                          type="text"
                          name="leaseDuration"
                          value={formData.leaseDuration}
                          onChange={handleChange}
                          placeholder="e.g., 11 months, 1 year"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Property Details */}
         {/* Step 3: Property Details */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Show Bedrooms/Bathrooms only for residential properties */}
                {formData.propertyType !== 'commercial' && formData.propertyType !== 'plot' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaBed className="inline mr-1" /> Bedrooms *
                      </label>
                      <input
                        type="number"
                        name="bedrooms"
                        required
                        value={formData.bedrooms}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaBath className="inline mr-1" /> Bathrooms *
                      </label>
                      <input
                        type="number"
                        name="bathrooms"
                        required
                        value={formData.bathrooms}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaRulerCombined className="inline mr-1" /> Area (sq.ft) *
                  </label>
                  <input
                    type="number"
                    name="area"
                    required
                    value={formData.area}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Floor details - only for apartments and commercial */}
                {(formData.propertyType === 'apartment' || formData.propertyType === 'commercial') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
                      <input
                        type="text"
                        name="floor"
                        value={formData.floor}
                        onChange={handleChange}
                        placeholder="e.g., Ground, 2nd"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Floors</label>
                      <input
                        type="number"
                        name="totalFloors"
                        value={formData.totalFloors}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {/* Facing - not for commercial or plot */}
                {formData.propertyType !== 'commercial' && formData.propertyType !== 'plot' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facing</label>
                    <select
                      name="facing"
                      value={formData.facing}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                      <option value="North-East">North-East</option>
                      <option value="North-West">North-West</option>
                      <option value="South-East">South-East</option>
                      <option value="South-West">South-West</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age of Property</label>
                  <select
                    name="ageOfProperty"
                    value={formData.ageOfProperty}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="0-1 years">0-1 years</option>
                    <option value="1-5 years">1-5 years</option>
                    <option value="5-10 years">5-10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenitiesList.map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Location */}
          {step === 4 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Location Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaMapMarkerAlt className="inline mr-1" /> Full Address *
                  </label>
                  <textarea
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Building/Society name, Street, Area"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g., Mumbai"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g., Maharashtra"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="e.g., 400001"
                      pattern="[0-9]{6}"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                  <FaInfoCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Location Privacy</p>
                    <p>Your exact address will only be shared with serious buyers who contact you.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Media & Images */}
          {step === 5 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Photos & Media</h2>
              
              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <FaImage className="inline mr-1" /> Property Images * (Max 10)
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <FaImage className="mx-auto text-4xl text-gray-400 mb-3" />
                    <p className="text-gray-600 mb-2">Click to upload images</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 5MB each</p>
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimes />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Cover Photo
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-3">
                  {imageFiles.length}/10 images uploaded. First image will be the cover photo.
                </p>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Tour URL (Optional)</label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder="e.g., YouTube or Vimeo link"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Final Note */}
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FaCheckCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-semibold mb-1">Almost Done!</p>
                    <p>Review all details and click "Post Property" to publish your listing.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Previous
              </button>
            )}
            
            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || uploadingImages}
                className="ml-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    {uploadingImages ? 'Uploading Images...' : 'Posting Property...'}
                  </>
                ) : (
                  <>
                    <FaCheckCircle />
                    Post Property
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostProperty;