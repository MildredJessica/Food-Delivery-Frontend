import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext.jsx';

const Header = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { cartCount, clearCart } = useCart();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // cartCount comes directly from context; no need for manual listeners

    const handleLogout = async () => {
      try {
        // clear context cart
        clearCart();
        await logout();
        setIsDropdownOpen(false);
        navigate('/');
        // console.log('✅ Logout successful, cart cleared');
      } catch (error) {
        console.error('Logout error:', error);
      }
    };


    const getGreeting = () => {
      if (user && user.name) {
        const hour = new Date().getHours();
        let greeting = ' ';
        if (hour < 12)
          greeting = 'Good morning';
        else if (hour < 18)
          greeting = 'Good afternoon';
        else
          greeting = 'Good evening';
        // const firstName = user.name.split(' ')[0];
      
        return `${greeting}, ${user.name}`;
      }
      return 'Hello, Guest';
    }; 
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className='flex items-center space-x-8'>
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-linear-to-r from-orange-500 to-orange-600 rounded-full"></div>
                <span className="text-xl font-bold text-gray-900 hidden sm:inline">FoodExpress</span>
              </Link>
              <nav className=''>
                  {/* <Link to="/" className={`text-sm font-medium ${location.pathname === '/' ? 'text-orange-600' : 'text-gray-700 hover:text-orange-500'}`}>
                    Restaurants
                  </Link> */}
                  {isAuthenticated && (
                    <>
                      {/* Role-based navigation */}
                       <Link to="/orders" className={`text-sm font-medium pl-8 ${location.pathname === '/orders' ? 'text-orange-600' : 'text-gray-700 hover:text-orange-500'} transition-colors`}>
                        My Orders
                      </Link>
                      {user?.role === 'restaurant_owner' && (
                        <Link to="/restaurant-owner/dashboard" className="text-sm font-medium pl-8 text-gray-700 hover:text-orange-500 transition-colors">
                          My Restaurants
                        </Link>
                      )}
                      {user?.role === 'admin' && (
                        <Link to="/admin/dashboard" className="text-sm font-medium pl-8 text-gray-700 hover:text-orange-500 transition-colors">
                          Admin Dashboard
                        </Link>
                      )}
                    </>
                  )}
              </nav> 
            </div>
            
            
            {/* Right Side Actions */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Cart Icon- Always Visible */}
              <Link to="/cart" className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors" title='View Cart'>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
                </Link>
                  
              
              {isAuthenticated ? (
                /* User Is Logged In */
                  <div className="relative">
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-3 p-1 rounded-full hover:bg-gray-100 transition-colors group">
                    
                      {/* User Avatar */}
                      <div className='flex items-center space-x-3'>
                        <div className='hidden sm:block text-right'>
                          <p className='text-sm font-medium text-gray-900 group-hover:text-orange-600'>
                            {getGreeting()}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {user?.role === 'admin' ? 'Administrator' :
                              user?.role === 'restaurant_owner' ? 'Restaurant Owner' : 'Customer'
                            }
                          </p>
                        </div>
                        <div className='relative'>
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover:border-orange-300"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-linear-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center border-2 border-gray-200 group-hover:border-orange-300">
                              <span className="text-lg font-medium text-white">
                                {user?.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          {/* Online Status Indicator */}
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      
                        </div>
                      </div> 
                    </button>
                    
                    {/* Dropdown Menu*/}                    
                    {isDropdownOpen && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsDropdownOpen(false)}>
                        </div>
                      
                        {/* Dropdown */}
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50 border">
                          {/* User Info */}
                          <div className="px-4 py-3 border-b">
                            <div className="flex items-center space-x-3">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-linear-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {user?.name?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className='flex-1 min-w-0'>
                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                                <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                                <div className='mt-1'>
                                  <span className={`inline-flex px-2 py-0.5 text-xs rounded font-medium ${
                                    user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                                    user?.role === 'restaurant_owner' ? 'bg-green-100 text-green-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {user.role === 'admin' ? '👑 Admin' :
                                      user.role === 'restaurant_owner' ? '👨‍🍳 Restaurant Owner' :
                                      '👤 Customer'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Menu Items */}
                          <div className="py-2">
                            <Link to="/profile"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              My Profile
                            </Link>
                          
                            <Link to="/orders"
                              onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2
                                  0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Order History
                            </Link>
                            
                            {/* Favorites */}
                            <Link
                              to="/favorites"
                              onClick={() => {
                              setIsDropdownOpen(false);
                              navigate('/profile', { state: { tab: 'favorites' } });
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                                My Favorites
                            </Link>
                            <Link to="/settings" onClick={() => setIsDropdownOpen(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Settings
                            </Link>
                          </div>
                      
                          {/* Logout */}
                          <div className="border-t pt-2">
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Sign out
                            </button>
                          </div>
                       </div>
                      </>
                    )}
                  </div>
              ) : (
                /* User is Not Logged In */
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
};

export default Header;