// frontend/src/App.jsx - UPDATED ADMIN ROUTE
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './hooks/useAuth';
import { UserProvider } from './context/UserContext';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

// Public Pages
import Home from './pages/Home';
import UnifiedAuth from './pages/Login';
import Signup from './pages/Signup';
import Listings from './pages/Listings';
import PropertyDetails from './pages/PropertyDetails';
import PendingApproval from './pages/PendingApproval';
import EditProperty from './pages/EditProperty';
import PropertyComparison from './pages/PropertyComparison';


// Signup Flow
import RoleSelection from './pages/RoleSelection';
import ProviderTypeSelection from './pages/ProviderTypeSelection';
import SeekerSignup from './pages/SeekerSignup';
import ProviderOwnerSignup from './pages/ProviderOwnerSignup';
import ProviderAgentSignup from './pages/ProviderAgentSignup';
import ProviderBuilderSignup from './pages/ProviderBuilderSignup';

// Protected Pages
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import PostProperty from './pages/PostProperty';
import MyProperties from './pages/MyProperties';

// Admin Panel
import AdminPanel from './pages/admin/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            
            <main className="flex-grow">
              <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<UnifiedAuth />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/pending-approval" element={<PendingApproval />} />
                
                {/* SIGNUP FLOW */}
                <Route path="/signup" element={<Signup />} />
                <Route path="/signup/role-selection" element={<RoleSelection />} />
                <Route path="/signup/seeker" element={<SeekerSignup />} />
                <Route path="/signup/provider-type" element={<ProviderTypeSelection />} />
                <Route path="/signup/provider/owner" element={<ProviderOwnerSignup />} />
                <Route path="/signup/provider/agent" element={<ProviderAgentSignup />} />
                <Route path="/signup/provider/builder" element={<ProviderBuilderSignup />} />
                
                {/* PROTECTED ROUTES */}
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/wishlist" 
                  element={
                    <PrivateRoute>
                      <Wishlist />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/post-property" 
                  element={
                    <PrivateRoute>
                      <PostProperty />
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/my-properties" 
                  element={
                    <PrivateRoute>
                      <MyProperties />
                    </PrivateRoute>
                  } 
                />

<Route 
  path="/edit-property/:id" 
  element={
    <PrivateRoute>
      <EditProperty />
    </PrivateRoute>
  } 

/>

<Route 
  path="/compare" 
  element={<PropertyComparison />} 
/>
                
                {/* ADMIN PANEL (Admin Only) - UPDATED */}
                <Route 
                  path="/admin" 
                  element={
                    <PrivateRoute adminOnly={true}>
                      <AdminPanel />
                    </PrivateRoute>
                  } 
                />
                
                {/* 404 PAGE */}
                <Route 
                  path="*" 
                  element={
                    <div className="min-h-screen flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                        <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
                        <a 
                          href="/" 
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Go Home
                        </a>
                      </div>
                    </div>
                  } 
                />
              </Routes>
            </main>

            <Footer />
            
            {/* Toast Notifications */}
            <ToastContainer 
              position="bottom-right" 
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;