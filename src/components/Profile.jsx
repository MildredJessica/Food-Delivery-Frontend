import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'NG'
    },
    avatar: ''
  });
  const backend_url = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          country: user.address?.country || 'US'
        },
        avatar: user.avatar || ''
      });
      
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('${backend_url}/api/users/favorites');
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData({
        ...profileData,
        [parent]: {
          ...profileData[parent],
          [child]: value
        }
      });
    } else {
      setProfileData({
        ...profileData,
        [name]: value
      });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await updateProfile(profileData);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    
    setLoading(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(true);
    try {
      const response = await axios.put('${backend_url}/api/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setProfileData(prev => ({ ...prev, avatar: response.data.user.avatar }));
        setMessage({ type: 'success', text: 'Avatar updated successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload avatar' });
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (restaurantId) => {
    try {
      await axios.delete(`${backend_url}/api/users/favorites/${restaurantId}`);
      setFavorites(favorites.filter(fav => fav._id !== restaurantId));
      setMessage({ type: 'success', text: 'Removed from favorites!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove favorite' });
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      user: 'bg-blue-100 text-blue-800',
      admin: 'bg-red-100 text-red-800',
      restaurant_owner: 'bg-green-100 text-green-800'
    };

    const labels = {
      user: 'Customer',
      admin: 'Administrator',
      restaurant_owner: 'Restaurant Owner'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[role] || 'bg-gray-100 text-gray-800'}`}>
        {labels[role] || role}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar Section */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
              {profileData.avatar ? (
                <img 
                  src={profileData.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full cursor-pointer hover:bg-orange-600 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600 mt-1">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {getRoleBadge(user.role)}
                  <span className="text-sm text-gray-500">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="bg-white rounded-lg shadow-md">
        {/* Tabs */}
        <div className="border-b">
          <nav className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 font-medium ${
                activeTab === 'profile'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('address')}
              className={`py-4 px-6 font-medium ${
                activeTab === 'address'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Address
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-4 px-6 font-medium ${
                activeTab === 'favorites'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Favorites ({favorites.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Message Alert */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {getRoleBadge(user.role)}
                    <p className="text-xs text-gray-500 mt-1">
                      {user.role === 'user' && 'Regular customer account'}
                      {user.role === 'admin' && 'Administrator with full access'}
                      {user.role === 'restaurant_owner' && 'Can manage restaurants and menu items'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          )}

          {/* Address Tab */}
          {activeTab === 'address' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={profileData.address.street}
                    onChange={handleProfileChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={profileData.address.city}
                      onChange={handleProfileChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="New York"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={profileData.address.state}
                      onChange={handleProfileChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="NY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={profileData.address.zipCode}
                      onChange={handleProfileChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="10001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    name="address.country"
                    value={profileData.address.country}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="IN">India</option>
                    <option value="NG">NIGERIA</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {loading ? 'Updating...' : 'Save Address'}
                </button>
              </div>
            </form>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Your Favorite Restaurants</h3>
                <p className="text-gray-600">
                  {favorites.length === 0 
                    ? 'You haven\'t added any favorites yet.' 
                    : `${favorites.length} favorite${favorites.length === 1 ? '' : 's'}`}
                </p>
              </div>

              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">❤️</div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-2">No favorites yet</h4>
                  <p className="text-gray-500 mb-6">Start exploring restaurants and add your favorites!</p>
                  <a
                    href="/"
                    className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors inline-block"
                  >
                    Browse Restaurants
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map(restaurant => (
                    <div key={restaurant._id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-900 truncate">{restaurant.name}</h4>
                          <button
                            onClick={() => removeFromFavorites(restaurant._id)}
                            className="text-red-500 hover:text-red-700 ml-2"
                            title="Remove from favorites"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2">{restaurant.cuisine}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <span className="text-yellow-500">⭐</span>
                            <span className="ml-1">{restaurant.rating || 'New'}</span>
                          </div>
                          <span className="text-gray-500">{restaurant.deliveryTime}</span>
                        </div>
                        
                        <a
                          href={`/restaurant/${restaurant._id}`}
                          className="mt-4 block text-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors text-sm"
                        >
                          View Menu
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;