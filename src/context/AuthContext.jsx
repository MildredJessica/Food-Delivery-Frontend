import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { cartUtils } from '../utils/cart.js';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
    };

    // Auth Provider Component
    export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Initialize user from localStorage if available
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Failed to parse saved user:', error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    // Set auth token for axios requests
    useEffect(() => {
        if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
        } else {
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
        }
    }, [token]);

    // Register function
    const register = async (userData) => {
        try {
            console.log('Sending registration request:', userData); // Debug log
            const response = await axios.post('http://localhost:3000/api/users/register', userData
                , {
              headers: {
                        'Content-Type': 'application/json'
                    }
            });
            console.log('Registration response:', response.data); // Debug log
            const { token: newToken, user } = response.data;
            
            if (newToken) {
                setToken(newToken);
                setUser(user);

                // Update axios default headers
                axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                localStorage.setItem('token', newToken);
                localStorage.setItem('user', JSON.stringify(user));
            }
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Registration failed' 
            };
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
        const response = await axios.post('http://localhost:3000/api/users/login', {
            email,
            password
        });
        
        const { token: newToken, user } = response.data;

        // Clear guest cart before setting user data
        cartUtils.clearAllCarts(); // Clear cart on login
        
        // Update axios headers with new token
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        setToken(newToken);
        setUser(user);
        
        return { success: true, data: response.data };
        } catch (error) {
        return { 
            success: false, 
            message: error.response?.data?.message || 'Login failed' 
        };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            // Clear user's cart from localStorage
            localStorage.removeItem('foodCart');
            // Clear sessionStorage too
            sessionStorage.removeItem('foodCart');
            // Dispatch cart updated event to update header count
            window.dispatchEvent(new Event('cartUpdated'));
            // Call backend logout endpoint (optional)
            if (token)
                await axios.post('http://localhost:3000/api/users/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Remove axios authorization header
            delete axios.defaults.headers.common['Authorization'];
            
            console.log('✅ User logged out and cart cleared');
        }
    };

    // Update profile function
    const updateProfile = async (profileData) => {
        try {
        const response = await axios.put('http://localhost:3000/api/users/profile', profileData);
        setUser(response.data.user);
        return { success: true, data: response.data };
        } catch (error) {
        return { 
            success: false, 
            message: error.response?.data?.message || 'Profile update failed' 
        };
        }
    };

    // Change password function
    const changePassword = async (passwordData) => {
        try {
        const response = await axios.put('http://localhost:3000/api/users/change-password', passwordData);
        setToken(response.data.token);
        return { success: true, data: response.data };
        } catch (error) {
        return { 
            success: false, 
            message: error.response?.data?.message || 'Password change failed' 
        };
        }
    };

    // Context value
    const value = {
        user,
        token,
        loading,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
        {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;