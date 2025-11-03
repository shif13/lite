// frontend/src/api/users.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create user in MySQL after Firebase signup
export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/create`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user profile by Firebase UID
export const getUserProfile = async (uid, token) => {
  try {
    const response = await axios.get(`${API_URL}/users/profile/${uid}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update user profile
export const updateUserProfile = async (uid, userData, token) => {
  try {
    const response = await axios.put(`${API_URL}/users/profile/${uid}`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin: Get all users
export const getAllUsers = async (filters, token) => {
  try {
    const response = await axios.get(`${API_URL}/users/all`, {
      params: filters,
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin: Approve user
export const approveUser = async (userId, token) => {
  try {
    const response = await axios.patch(`${API_URL}/users/${userId}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin: Reject user
export const rejectUser = async (userId, reason, token) => {
  try {
    const response = await axios.patch(`${API_URL}/users/${userId}/reject`, 
      { reason }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin: Delete user
export const deleteUser = async (userId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin: Toggle user status
export const toggleUserStatus = async (userId, token) => {
  try {
    const response = await axios.patch(`${API_URL}/users/${userId}/toggle-status`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};