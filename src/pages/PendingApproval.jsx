// frontend/src/pages/PendingApproval.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUser } from '../context/UserContext';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const PendingApproval = () => {
  const { logout } = useAuth();
  const { userData, loading, refreshUserData } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRefresh = async () => {
    await refreshUserData();
    if (userData?.approvalStatus === 'approved') {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If approved, redirect
  if (userData?.approvalStatus === 'approved') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            userData?.approvalStatus === 'rejected' 
              ? 'bg-red-100' 
              : 'bg-yellow-100'
          }`}>
            {userData?.approvalStatus === 'rejected' ? (
              <FaTimesCircle className="w-10 h-10 text-red-600" />
            ) : (
              <FaClock className="w-10 h-10 text-yellow-600" />
            )}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {userData?.approvalStatus === 'rejected' 
              ? 'Account Rejected' 
              : 'Pending Approval'}
          </h2>
          <p className="text-gray-600 text-sm">
            {userData?.approvalStatus === 'rejected'
              ? 'Your account application was rejected'
              : 'Your account is awaiting admin approval'}
          </p>
        </div>

        {/* User Info */}
        {userData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Account Details:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Name:</strong> {userData.name}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Type:</strong> <span className="capitalize">{userData.userType}</span></p>
              <p><strong>Status:</strong> <span className="capitalize font-semibold">{userData.approvalStatus}</span></p>
              
              {userData.approvalStatus === 'rejected' && userData.rejectionReason && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-800"><strong>Reason:</strong></p>
                  <p className="text-red-700 text-sm mt-1">{userData.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        {userData?.approvalStatus === 'pending' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Our admin team will review your account</li>
              <li>You'll receive an email once approved</li>
              <li>Return here and click "Check Status"</li>
              <li>Once approved, you can access all features</li>
            </ol>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {userData?.approvalStatus === 'pending' && (
            <button
              onClick={handleRefresh}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaCheckCircle />
              Check Approval Status
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Browse Properties
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact us at support@findabode.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;