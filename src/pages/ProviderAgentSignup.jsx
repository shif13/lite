// frontend/src/pages/ProviderAgentSignup.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createUser } from '../api/users';
import { toast } from 'react-toastify';
import { FaUserTie, FaEye, FaEyeSlash, FaArrowLeft, FaClock } from 'react-icons/fa';

const ProviderAgentSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agencyName: '',
    licenseNumber: '',
    reraNumber: '',
    city: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error('Please agree to terms and conditions');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create Firebase user
      const firebaseResult = await signup(formData.email, formData.password, formData.name);

      if (!firebaseResult.success) {
        toast.error(firebaseResult.message);
        setIsLoading(false);
        return;
      }

      // Step 2: Save to MySQL as PROVIDER (AGENT)
      const userData = {
        firebaseUid: firebaseResult.user.uid,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        agencyName: formData.agencyName,
        licenseNumber: formData.licenseNumber,
        reraNumber: formData.reraNumber || null,
        city: formData.city || null,
        userType: 'provider',      // 🔥 NEW
        providerType: 'agent'      // 🔥 NEW
      };

      const dbResult = await createUser(userData);

      if (dbResult.success) {
        if (dbResult.needsApproval) {
          toast.success('Agent account created! Pending admin approval.');
          navigate('/pending-approval');
        } else {
          toast.success('Account created successfully!');
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Failed to create account. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 py-12 px-4">
      <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/signup/provider-type')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <FaUserTie className="text-3xl text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Real Estate Agent Signup</h2>
          <p className="text-gray-600 mt-2">Join as a professional agent</p>
          
          {/* Approval Notice */}
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start">
            <FaClock className="text-yellow-600 mt-1 mr-2 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold text-yellow-800">Admin Approval Required</p>
              <p className="text-xs text-yellow-700 mt-1">
                Your account will be reviewed by our team within 24-48 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Info Section */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="+91 12345 67890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Mumbai"
                />
              </div>
            </div>
          </div>

          {/* Professional Info Section */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Professional Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agency/Company Name *</label>
                <input
                  type="text"
                  name="agencyName"
                  required
                  value={formData.agencyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Your agency name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    required
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., AGT12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RERA Number (Optional)</label>
                  <input
                    type="text"
                    name="reraNumber"
                    value={formData.reraNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., RERA123456"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Set Password</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Re-enter password"
                />
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start pt-4">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              I agree to the{' '}
              <a href="#" className="text-orange-600 hover:text-orange-700">Terms & Conditions</a>
              {' '}and{' '}
              <a href="#" className="text-orange-600 hover:text-orange-700">Privacy Policy</a>.
              I understand my account needs admin approval.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? 'Creating Account...' : 'Submit for Approval'}
          </button>
        </form>

        {/* Sign in link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 text-sm mb-2">📋 Agent Benefits:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>✓ Post unlimited properties</li>
            <li>✓ Verified agent badge on listings</li>
            <li>✓ Advanced analytics and insights</li>
            <li>✓ Priority support</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProviderAgentSignup;