import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import axios from 'axios';
import toast from 'react-hot-toast'; // Make sure to import toast

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { addToCart, cartCount } = useCart();
  const navigate = useNavigate();
  const backend_url = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {
    fetchRestaurant();
    if (isAuthenticated) {
      checkIfFavorite();
    }
  }, [id, isAuthenticated]);

  const fetchRestaurant = async () => {
    try {
      const response = await axios.get(`${backend_url}/api/restaurants/${id}`);
      setRestaurant(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('${backend_url}/api/users/favorites', {
        headers: 
        {  'Authorization': `Bearer ${token}` 
        }
      });
      const favorites = response.data.favorites || [];
      setIsFavorite(favorites.some(fav => fav._id === id));
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (isFavorite) {
        await axios.delete(`${backend_url}/api/users/favorites/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setIsFavorite(false);
      } else {
        await axios.post(`${backend_url}/api/users/favorites/${id}`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAddToCart = (menuItem) => {
  
    const result = addToCart(menuItem, restaurant, 1);
    if (result.success) 
      // Show success message
      toast.success(`${menuItem.name} added to cart!`, {
        icon: '🛒',
        duration: 2000
      });
    else
      // Show error message
      toast.error(result.error || 'Failed to add item to cart');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Restaurant not found</h1>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Restaurant Header with Favorite Button */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 relative">
            <button
            onClick={toggleFavorite}
            disabled={favoriteLoading}
            className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
                {favoriteLoading ? (
                    <svg className="w-6 h-6 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                ) : (
                    <svg
                    className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                    fill={isFavorite ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                )}
            </button>
            
            <img
            src={restaurant.image || '/placeholder-food.jpg'}
            alt={restaurant.name}
            className="w-full h-64 object-cover"
            onError={(e) => {
                e.target.src = '/placeholder-food.jpg';
            }}
            />
            <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {restaurant.name}
                </h1>
                <p className="text-gray-600 mb-4">{restaurant.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>⭐ {restaurant.rating || 'New'}</span>
                    <span>🕒 {restaurant.deliveryTime}</span>
                    <span>🍽️ {restaurant.cuisine}</span>
                </div>
            </div>
        </div>

        

        {/* Menu */}
        <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu</h2>
                
                {restaurant.menu?.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No menu items available</p>
                ) : (
                <div className="space-y-6">
                    {(restaurant.menu || []).map(item => {
                        // const quantity = getItemQuantity(item._id, restaurant._id);
                        // const inCart = isInCart(item._id, restaurant._id);
                        return (
                            <div key={item._id} className="flex justify-between items-start border-b pb-6 last:border-b-0 gap-4">
                                <img
                                src={item.image || '/placeholder-food.jpg'}
                                alt={item.name}
                                className="w-24 h-24 object-cover rounded-lg shrink-0"
                                onError={(e) => {
                                    e.target.src = '/placeholder-food.jpg';
                                }}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                                        {/* {inCart && (
                                        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                            {quantity} in cart
                                        </span>
                                        )} */}
                                    </div>
                                    <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                                    <p className="text-green-600 font-semibold mt-2">₦{item.price?.toFixed(2)}</p>
                                </div>
                            
                                <button
                                onClick={() => handleAddToCart(item)}
                                className=" bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
                                >
                                Add to Cart
                                </button>
                            </div>
                        );
                    })
                    }
                </div>
                )}
            </div>
        </div>
        {/* View Cart Button */}
        {cartCount > 0 && (
            <div className='fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200'>
                <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-gray-900">
                        {cartCount} item{cartCount !== 1 ? 's' : ''} in cart
                    </span>
                    <button
                        onClick={() => navigate('/cart')}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                    >
                        View Cart
                    </button>
                </div>
            </div>
            
        )}

    </div>
  );
};

export default RestaurantDetail;