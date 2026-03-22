import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import RestaurantOwnerList from './RestaurantOwnerList.jsx';
import AddRestaurantForm from './AddRestaurantForm.jsx';
import RestaurantOwnerOrders from '../orders/RestaurantOwnerOrders.jsx';

const RestaurantOwnerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('restaurants');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [showEditRestaurant, setShowEditRestaurant] = useState(null);
  const [editRestaurantData, setEditRestaurantData] = useState(null);
  const [showEditMenu, setShowEditMenu] = useState(null);
  const [editMenuItemData, setEditMenuItemData] = useState(null);
  const backend_url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (user?.role === 'restaurant_owner') {
      fetchRestaurants();
    }
  }, [user]);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/restaurant-owner/my-restaurants`);
      setRestaurants(response.data.restaurants || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not restaurant owner
  if (user?.role !== 'restaurant_owner') {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">This page is for restaurant owners only.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Restaurant Owner Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user.name}! Manage your restaurants and menus.
            </p>
          </div>
          <button
            onClick={() => setShowAddRestaurant(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 font-semibold"
          >
            + Add Restaurant
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-gray-900">{restaurants.length}</div>
          <div className="text-gray-600">Total Restaurants</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-gray-900">
            {restaurants.reduce((acc, r) => acc + (r.menu?.length || 0), 0)}
          </div>
          <div className="text-gray-600">Total Menu Items</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-gray-900">0</div>
          <div className="text-gray-600">Today's Orders</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-gray-900">$0.00</div>
          <div className="text-gray-600">Today's Revenue</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`py-4 px-6 font-medium ${
                activeTab === 'restaurants'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Restaurants
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-6 font-medium ${
                activeTab === 'orders'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-6 font-medium ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'restaurants' && (
            <RestaurantOwnerList 
              restaurants={restaurants} 
              onRestaurantAdded={fetchRestaurants}
              showEditRestaurant={showEditRestaurant}
              setShowEditRestaurant={setShowEditRestaurant}
              editRestaurantData={editRestaurantData}
              setEditRestaurantData={setEditRestaurantData}
              showEditMenu={showEditMenu}
              setShowEditMenu={setShowEditMenu}
              editMenuItemData={editMenuItemData}
              setEditMenuItemData={setEditMenuItemData}
            />
          )}
          {activeTab === 'orders' && <RestaurantOwnerOrders />}
          {activeTab === 'analytics' && <Analytics />}
        </div>
      </div>

      {/* Add Restaurant Modal */}
      {showAddRestaurant && (
        <AddRestaurantForm
          onClose={() => setShowAddRestaurant(false)}
          onSuccess={() => {
            fetchRestaurants();
            setShowAddRestaurant(false);
          }}
        />
      )}
    </div>
  );
};




// Analytics Component (Placeholder)
const Analytics = () => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📊</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">Analytics coming soon</h3>
      <p className="text-gray-500">Track your restaurant's performance here.</p>
    </div>
  );
};

export default RestaurantOwnerDashboard;