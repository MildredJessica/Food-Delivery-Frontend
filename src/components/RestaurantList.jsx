import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const backend_url = import.meta.env.VITE_BACKEND_URL;

    

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${backend_url}/api/restaurants`);
            const restaurantsData = response.data.data || [];
            // console.log('Setting restaurants:', restaurantsData);
            setRestaurants(restaurantsData);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            setError('Failed to load restaurants. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchRestaurants();
    }, []);

    // Enhanced loading component
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Restaurants</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                            <div className="p-4">
                                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                                <div className="flex justify-between">
                                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                            <button
                                onClick={fetchRestaurants}
                                className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state
    if (restaurants.length === 0) {
        return (
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Restaurants</h1>
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No restaurants</h3>
                    <p className="mt-1 text-sm text-gray-500">No restaurants available at the moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Restaurants</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map(restaurant => (
                    <Link
                        key={restaurant._id}
                        to={`/restaurant/${restaurant._id}`}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <img
                            src={restaurant.image || '/placeholder-food.jpg'}
                            alt={restaurant.name}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                                e.target.src = '/placeholder-food.jpg';
                            }}
                        />
                        <div className="p-4">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                                {restaurant.name}
                            </h3>
                            <p className="text-gray-600 mb-2">{restaurant.cuisine}</p>
                            <div className="flex justify-between items-center">
                                <span className="flex items-center text-yellow-500">
                                    ⭐ {restaurant.rating || 'N/A'}
                                </span>
                                <span className="text-gray-500">
                                    {restaurant.deliveryTime || 'Time not available'}
                                </span>
                            </div>
                            {restaurant.description && (
                                <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                                    {restaurant.description}
                                </p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RestaurantList;