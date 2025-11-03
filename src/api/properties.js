import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Get auth token from Firebase
const getAuthHeader = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
};

// Get all properties
export const getAllProperties = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/properties`, { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get featured properties
export const getFeaturedProperties = async () => {
  try {
    const response = await axios.get(`${API_URL}/properties/featured`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get single property
export const getPropertyById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/properties/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user properties
export const getUserProperties = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/properties/user/my-properties`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create property
export const createProperty = async (propertyData, token) => {
  try {
    const response = await axios.post(`${API_URL}/properties`, propertyData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update property
export const updateProperty = async (id, propertyData, token) => {
  try {
    const response = await axios.put(`${API_URL}/properties/${id}`, propertyData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete property
export const deleteProperty = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/properties/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get wishlist
export const getWishlist = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add to wishlist
export const addToWishlist = async (propertyId, token) => {
  try {
    const response = await axios.post(`${API_URL}/wishlist`, 
      { propertyId }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Remove from wishlist
export const removeFromWishlist = async (propertyId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/wishlist/${propertyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Check if in wishlist
export const checkWishlist = async (propertyId, token) => {
  try {
    const response = await axios.get(`${API_URL}/wishlist/check/${propertyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin: Approve property
export const approveProperty = async (propertyId, token) => {
  try {
    const response = await axios.patch(
      `${API_URL}/properties/admin/${propertyId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin: Reject property
export const rejectProperty = async (propertyId, reason, token) => {
  try {
    const response = await axios.patch(
      `${API_URL}/properties/admin/${propertyId}/reject`,
      { reason },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};