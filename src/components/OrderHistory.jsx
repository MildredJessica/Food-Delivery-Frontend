import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { addMultipleToCart } = useCart();
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user?._id) {
            fetchOrders();
        } else {
            setLoading(false);
            setError('Please log in to view your orders');
        }
    }, [user]); // Add user as dependency


    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`http://localhost:3000/api/orders/user/${user._id}`);
            console.log('Orders response:', response.data); // Debug log
            // Handle different response structures
            if (response.data.success && Array.isArray(response.data.data)) {
                setOrders(response.data.data);
            } else if (Array.isArray(response.data.orders)) {
                setOrders(response.data.orders);
            } else if (Array.isArray(response.data)) {
                setOrders(response.data);
            } else {
                console.error('Unexpected response structure:', response.data);
                setOrders([]);
                setError('Invalid response format from server');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]); // Ensure orders is always an array
            setError(error.response?.data?.message || 'Failed to fetch orders');
        }finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
        case 'delivered':
            return 'bg-green-100 text-green-800';
        case 'out for delivery':
            return 'bg-blue-100 text-blue-800';
        case 'preparing':
            return 'bg-yellow-100 text-yellow-800';
        case 'confirmed':
            return 'bg-orange-100 text-orange-800';
        case 'pending':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        if (!status) return 'Unknown';
        switch (status?.toLowerCase()) {
            case 'out for delivery':
                return 'Out for Delivery';
            case 'pending':
                return 'Pending';
            case 'confirmed':
                return 'Confirmed';
            case 'preparing':
                return 'Preparing';
            case 'delivered':
                return 'Delivered';
            case 'cancelled':
                return 'Cancelled';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    const handleReorder = async (order) => {
        // Add items to cart
        const cartItems = order.items.map(item => ({
            // _id: item.menuItem || item._id,
            _id: item.menuItem,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            restaurant: order.restaurant?._id || order.restaurant
        }));
        const restaurant = order.restaurant?._id || order.restaurant;
        const result = await addMultipleToCart(cartItems, restaurant);
        
        if (result.success) {
            toast.success(`${result.count} items added to cart!`);
            navigate('/cart');
        } else {
            toast.error(result.error || 'Failed to reorder');
        }
    };

    // Safe check for orders array
    const hasOrders = Array.isArray(orders) && orders.length > 0;

    if (loading) {
        return (
        <div className="max-w-7xl mx-auto py-6 px-4">
            <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-6 px-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    {!user && (
                        <a
                            href="/login"
                            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 inline-block"
                        >
                            Login
                        </a>
                    )}
                </div>
            </div>
        );
    }

    if (!hasOrders) {
        return (
            <div className="max-w-7xl mx-auto py-6 px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <svg 
                        className="mx-auto h-16 w-16 text-gray-400 mb-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeWidth={2} 
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                        />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
                    <p className="text-gray-600 mb-6">Start ordering some delicious food!</p>
                    <a
                        href="/restaurants"
                        className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 inline-block transition-colors"
                    >
                        Browse Restaurants
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-6 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>
        
            {/* {orders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
                <p className="text-gray-600 mb-6">Start ordering some delicious food!</p>
                <a
                    href="/"
                    className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 inline-block"
                >
                    Browse Restaurants
                </a>
                </div>
            ) : ( */}
            <div className="space-y-6">
                {orders.map(order => (
                    <div key={order._id || Math.random()} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex md:flex-row justify-between items-start md:items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Order #{order._id?.slice(-6).toUpperCase() || 'N/A'}
                                </h3>
                                <p className="text-gray-600">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'Date not available'} 
                                    {order.restaurant?.name && ` • ${order.restaurant.name}`}
                                </p>
                            </div>
                            <div className="mt-2 md:mt-0 text-left md:text-right">
                                <p className="text-lg font-bold text-green-600">
                                    ₦{order.totalAmount?.toFixed(2) || '0.00'}
                                </p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                    {getStatusText(order.status)}
                                </span>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                            <ul className="space-y-2">
                            {Array.isArray(order.items) && order.items.map((item, index) => (
                                <li key={index} className="flex justify-between text-sm">
                                    <span className="text-gray-700">
                                        {item.quantity || 1}x {item.name || 'Item'}
                                    </span>
                                    <span className="font-medium text-gray-900">
                                        ₦{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                    </span>
                                </li>
                            ))}
                            </ul>
                            {order.items?.length > 0 && (
                                <div className="mt-3 text-right text-sm font-medium text-gray-900 border-t pt-2">
                                    Subtotal: ₦{order.totalAmount?.toFixed(2) || '0.00'}
                                </div>
                            )}
                        </div>

                        {order.deliveryAddress && (
                            <div className="border-t pt-4 mt-4">
                                <p className="font-medium text-gray-600">
                                    <strong>Delivery to:</strong> {' '}
                                    {typeof order.deliveryAddress === 'string' 
                                        ? order.deliveryAddress 
                                        : `${order.deliveryAddress.street || ''}, ${order.deliveryAddress.city || ''}`.trim()}
                                </p>
                                {order.deliveryAddress.phone && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        <strong className="font-medium text-gray-900">Phone:</strong> {order.deliveryAddress.phone}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="border-t pt-4 mt-4 flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                            Ordered on { order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                            </p>
                            <p className={`text-sm font-medium px-3 py-1 rounded-full${
                                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                                order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                Payment: {order.paymentStatus || 'pending'}
                            </p>
                        </div>
                        {/* Reorder button */}
                        {order.status !== 'cancelled' && (
                        <div className="border-t pt-4 mt-4">
                            <button
                                onClick={() => handleReorder(order)}
                                className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reorder
                            </button>
                        </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderHistory;