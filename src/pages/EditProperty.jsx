import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../context/UserContext';
import { getPropertyById, updateProperty } from '../api/properties';
import { uploadMultipleImages } from '../firebase/cloudinary';
import { toast } from 'react-toastify';
import { 
  FaHome, FaMapMarkerAlt, FaRupeeSign, FaBed, FaBath, 
  FaRulerCombined, FaImage, FaCheckCircle, FaTimes,
  FaSpinner, FaInfoCircle, FaTrash, FaArrowLeft
} from 'react-icons/fa';

const EditProperty = () => {
  const { id } = useParams();
  const { getToken } = useAuth();
  const { userData, canPostProperty } = useUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'apartment',
    listingType: 'sale',
    price: '',
    pricePerSqft: '',
    rentPerMonth: '',
    depositAmount: '',
    maintenanceCharges: '',
    leaseDuration: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    floor: '',
    totalFloors: '',
    facing: '',
    ageOfProperty: '',
    isFurnished: 'unfurnished',
    address: '',
    city: '',
    state: '',
    pincode: '',
    videoUrl: '',
    amenities: []
  });

  const amenitiesList = [
    'Parking', 'Lift', 'Power Backup', 'Swimming Pool', 'Gym',
    'Garden', 'Security', 'Playground', 'Club House', 'Water Supply',
    'Air Conditioning', 'WiFi', 'Intercom', 'Gas Pipeline', 'Sewage Treatment'
  ];

  useEffect(() => {
    if (!userData || !canPostProperty()) {
      toast.error('Unauthorized access');
      navigate('/');
      return;
    }
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await getPropertyById(id);
      const property = response.data;

      // Check if user owns this property
      const token = await getToken();
      const userProfile = await getUserProfile(userData.firebaseUid, token);
      
      if (property.userId !== userData.firebaseUid) {
        toast.error('You can only edit your own properties');
        navigate('/my-properties');
        return;
      }

      // Populate form
      setFormData({
        title: property.title || '',
        description: property.description || '',
        propertyType: property.propertyType || 'apartment',
        listingType: property.listingType || 'sale',
        price: property.price || '',
        pricePerSqft: property.pricePerSqft || '',
        rentPerMonth: property.rentPerMonth || '',
        depositAmount: property.depositAmount || '',
        maintenanceCharges: property.maintenanceCharges || '',
        leaseDuration: property.leaseDuration || '',
        bedrooms: property.bedrooms || '',
        bathrooms: property.bathrooms || '',
        area: property.area || '',
        floor: property.floor || '',
        totalFloors: property.totalFloors || '',
        facing: property.facing || '',
        ageOfProperty: property.ageOfProperty || '',
        isFurnished: property.isFurnished || 'unfurnished',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        pincode: property.pincode || '',
        videoUrl: property.videoUrl || '',
        amenities: property.amenities || []
      });

      // Set existing images
      const images = typeof property.images === 'string' 
        ? JSON.parse(property.images) 
        : property.images || [];
      setExistingImages(images);

    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property');
      navigate('/my-properties');
    } finally {
      setLoading(false);
    }
  };

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

  const handleNewImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newImageFiles.length + existingImages.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setNewImageFiles([...newImageFiles, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveNewImage = (index) => {
    setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (existingImages.length === 0 && newImageFiles.length === 0) {
      toast.error('Please keep at least one image');
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

    setIsSubmitting(true);

    try {
      let allImages = [...existingImages];

      // Upload new images if any
      if (newImageFiles.length > 0) {
        setUploadingImages(true);
        const uploadResult = await uploadMultipleImages(newImageFiles);
        
        if (!uploadResult.success) {
          toast.error('Failed to upload new images');
          setIsSubmitting(false);
          setUploadingImages(false);
          return;
        }

        allImages = [...allImages, ...uploadResult.urls];
        setUploadingImages(false);
      }

      // Prepare property data
      const propertyData = {
        ...formData,
        images: allImages,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        area: parseFloat(formData.area),
        price: formData.listingType === 'sale' ? parseFloat(formData.price) : null,
        rentPerMonth: formData.listingType === 'rent' ? parseFloat(formData.rentPerMonth) : null,
        depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : null,
        maintenanceCharges: formData.maintenanceCharges ? parseFloat(formData.maintenanceCharges) : null,
        totalFloors: formData.totalFloors ? parseInt(formData.totalFloors) : null
      };

      // Update property
      const token = await getToken();
      const result = await updateProperty(id, propertyData, token);

      if (result.success) {
        toast.success('Property updated successfully!');
        navigate('/my-properties');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update property');
    } finally {
      setIsSubmitting(false);
      setUploadingImages(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/my-properties')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft />
            Back to My Properties
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
          <p className="text-gray-600 mt-2">Update your property details</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
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

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing Details</h2>
            
            <div className="space-y-4">
              {formData.listingType === 'sale' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

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
                </div>
              )}
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms *</label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Area (sq.ft) *</label>
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

          {/* Location */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Location</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <textarea
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
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
                    pattern="[0-9]{6}"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Images</h2>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Current Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {existingImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Images */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Images</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleNewImageSelect}
                  className="hidden"
                  id="new-image-upload"
                />
                <label htmlFor="new-image-upload" className="cursor-pointer">
                  <FaImage className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-2">Click to add more images</p>
                  <p className="text-sm text-gray-500">Max 10 images total</p>
                </label>
              </div>

              {newImagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`New ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                        New
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-3">
              Total images: {existingImages.length + newImageFiles.length}/10
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/my-properties')}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingImages}
              className="flex-1 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  {uploadingImages ? 'Uploading Images...' : 'Updating Property...'}
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Update Property
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;