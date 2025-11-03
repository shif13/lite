// frontend/src/pages/RoleSelection.jsx - SIMPLIFIED TO 2 CHOICES
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaHome, FaArrowRight } from 'react-icons/fa';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const navigate = useNavigate();

  const roles = [
    {
      type: 'seeker',
      title: 'Find Property',
      icon: FaSearch,
      description: 'Looking to buy or rent a property',
      color: 'blue',
      features: [
        'Search thousands of properties',
        'Save favorites to wishlist',
        'Contact property owners directly',
        'Get instant notifications'
      ],
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      type: 'provider',
      title: 'List Property',
      icon: FaHome,
      description: 'Sell or rent your property',
      color: 'green',
      features: [
        'Post unlimited properties',
        'Reach thousands of buyers',
        'Manage inquiries easily',
        'Track property performance'
      ],
      gradient: 'from-green-500 to-emerald-600'
    }
  ];

  const handleContinue = () => {
    if (!selectedRole) return;
    
    if (selectedRole === 'seeker') {
      navigate('/signup/seeker');
    } else if (selectedRole === 'provider') {
      navigate('/signup/provider-type'); // Choose owner/agent/builder
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">FindAbode</span>
          </h1>
          <p className="text-xl text-gray-600">
            What brings you here today?
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.type;
            
            return (
              <div
                key={role.type}
                onClick={() => setSelectedRole(role.type)}
                className={`relative bg-white rounded-2xl shadow-xl p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl ${
                  isSelected 
                    ? 'ring-4 ring-offset-4 ring-' + role.color + '-500 transform scale-105' 
                    : 'hover:scale-102'
                }`}
              >
                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute -top-3 -right-3">
                    <div className={`bg-gradient-to-r ${role.gradient} text-white px-4 py-2 rounded-full shadow-lg text-sm font-semibold`}>
                      ✓ Selected
                    </div>
                  </div>
                )}

                {/* Icon with Gradient Background */}
                <div className={`w-20 h-20 bg-gradient-to-r ${role.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg`}>
                  <Icon className="text-4xl text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                  {role.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-600 text-center mb-6">
                  {role.description}
                </p>

                {/* Features */}
                <ul className="space-y-3">
                  {role.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`inline-flex items-center px-10 py-4 rounded-xl text-lg font-bold transition-all transform ${
              selectedRole
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Signup
            <FaArrowRight className="ml-3" />
          </button>
        </div>

        {/* Already have account */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-white border border-gray-200 rounded-xl p-6 shadow-md">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">💡 Quick Guide:</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-3">
                <FaSearch className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Seeker</p>
                <p className="text-sm text-gray-600">Instant access, no approval needed. Start browsing immediately!</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-3">
                <FaHome className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Provider</p>
                <p className="text-sm text-gray-600">Choose your role: Owner (instant), Agent/Builder (needs approval)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;