import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast'; // Make sure to import toast

const RestaurantOwnerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');

  useEffect(() => {
    fetchRestaurantOrders();
  }, []);

  const fetchRestaurantOrders = async () => {
    try {
      // Get orders for all restaurants owned by this user
      const response = await axios.get('http://localhost:3000/api/orders/restaurant-owner', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:3000/api/orders/${orderId}/status`, 
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Refresh orders
      fetchRestaurantOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'out for delivery': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    return status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  // Get unique restaurants for filter
  const restaurants = [...new Set(orders.map(order => order.restaurant?.name))].filter(Boolean);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filterStatus !== 'all' && order.status !== filterStatus) return false;
    if (selectedRestaurant !== 'all' && order.restaurant?.name !== selectedRestaurant) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Restaurant Orders</h1>
        <p className="text-gray-600 mt-2">Manage orders for your restaurants</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="out for delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {restaurants.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Restaurant
              </label>
              <select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Restaurants</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant} value={restaurant}>{restaurant}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order._id?.slice(-8).toUpperCase()}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Restaurant:</span> {order.restaurant?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Customer:</span> {order.user?.name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {order.user?.email || 'N/A'}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <p className="text-lg font-bold text-green-600">₦{order.totalAmount?.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>₦{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              {order.deliveryAddress && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Deliver to:</span> {order.deliveryAddress}
                  </p>
                  {order.deliveryNotes && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Notes:</span> {order.deliveryNotes}
                    </p>
                  )}
                </div>
              )}

              {/* Status Update Actions */}
              <div className="border-t pt-4 mt-4">
                <div className="flex flex-wrap gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                      className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                    >
                      Confirm Order
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'preparing')}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                    >
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'out for delivery')}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      Mark as Out for Delivery
                    </button>
                  )}
                  {order.status === 'out for delivery' && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'delivered')}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  {!['delivered', 'cancelled'].includes(order.status) && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RestaurantOwnerOrders;