import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// Helper function to validate MongoDB ObjectId
const isValidMongoId = (id) => {
  return id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load cart from localStorage on initial render
    useEffect(() => {
        const savedCart = localStorage.getItem('foodCart');
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            // Validate the loaded cart items
            const validCart = parsedCart.filter(item => 
              item && item._id && isValidMongoId(item._id)
            );
            setCartItems(validCart);
          } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            localStorage.removeItem('foodCart');
          }
        }
    }, []);
    
    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (cartItems.length > 0) {
          localStorage.setItem('foodCart', JSON.stringify(cartItems));
        } else {
          localStorage.removeItem('foodCart');
        }
    }, [cartItems]);
    // Add item to cart. Items are considered identical only if both their
    // menu item ID and restaurant ID match. This prevents collisions when
    // two restaurants happen to contain menu items with the same _id.
    const addToCart = (menuItem, restaurant, quantity = 1) => {
        try {
            setError(null);
            
            // Validate menu item
            if (!menuItem) {
                throw new Error('Menu item is required');
            }

            // Validate menu item ID
            if (!menuItem._id || !isValidMongoId(menuItem._id)) {
                console.error('Invalid menu item ID:', menuItem._id);
                throw new Error('Invalid menu item: Missing or invalid ID');
            }

            // Validate restaurant
            if (!restaurant) {
                throw new Error('Restaurant information is required');
            }

            // Validate restaurant ID
            if (!restaurant._id || !isValidMongoId(restaurant._id)) {
                console.error('Invalid restaurant ID:', restaurant._id);
                throw new Error('Invalid restaurant: Missing or invalid ID');
            }

            // Check if item already exists in cart
            const existingItemIndex = cartItems.findIndex(
                item => item._id === menuItem._id && item.restaurant?._id === restaurant._id
            );

            if (existingItemIndex > -1) {
                // Update quantity if item exists
                updateQuantity(menuItem._id, restaurant._id, cartItems[existingItemIndex].quantity + quantity);
            } else {
                // Add new item
                const newItem = {
                    _id: menuItem._id,
                    name: menuItem.name || 'Unknown Item',
                    price: menuItem.price || 0,
                    image: menuItem.image || '',
                    description: menuItem.description || '',
                    quantity: quantity,
                    restaurant: {
                        _id: restaurant._id,
                        name: restaurant.name || 'Unknown Restaurant',
                        image: restaurant.image || ''
                    },
                    // Store any customizations if needed
                    specialInstructions: '',
                    addedAt: new Date().toISOString()
                };

                setCartItems(prevItems => [...prevItems, newItem]);
            }

            return { success: true };
        } catch (error) {
            setError(error.message);
            console.error('Error adding to cart:', error);
            return { success: false, error: error.message };
        }
    };
    // Add multiple items at once (useful for reordering)
    const addMultipleToCart = (items, restaurant) => {
        try {
        setError(null);
        
        if (!items || !Array.isArray(items)) {
            throw new Error('Items must be an array');
        }

        if (!restaurant || !restaurant._id || !isValidMongoId(restaurant._id)) {
            throw new Error('Valid restaurant is required');
        }

        // Filter out invalid items
        const validItems = items.filter(item => 
            item && item._id && isValidMongoId(item._id)
        );

        if (validItems.length === 0) {
            throw new Error('No valid items to add');
        }

        // Add each valid item
        validItems.forEach(item => {
            addToCart(item, restaurant, item.quantity || 1);
        });

        return { success: true, count: validItems.length };
        } catch (error) {
        setError(error.message);
        console.error('Error adding multiple items:', error);
        return { success: false, error: error.message };
        }
    };
    // Remove item from cart
    const removeFromCart = (menuItemId, restaurantId) => {
        try{
            if(!menuItemId  || !restaurantId)
                throw new Error("Menu item ID and restaurant ID are required");
            setCartItems(prevItems => 
                prevItems.filter(item => !(item._id === menuItemId && item.restaurant?._id === restaurantId))
            );
            return {success : true};
        } catch(error){
            console.error('Error updating quantity:', error);
            return { success: false, error: error.message };
        }
    };

    // Update item quantity
    const updateQuantity = (menuItemId, restaurantId, newQuantity) => {
        try{
            if(!menuItemId  || !restaurantId)
                throw new Error("Menu item ID and restaurant ID are required");
            if (newQuantity <= 0) 
                removeFromCart(menuItemId, restaurantId);
            setCartItems(prevItems => 
                prevItems.map(item => 
                    item._id === menuItemId && item.restaurant?._id === restaurantId
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );
            return {success: true};
        } catch(error){
            console.error('Error updating quantity:', error);
            return { success: false, error: error.message };
        }
    };

    // Clear entire cart
    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('foodCart');
    };
    const clearRestaurantCart = (restaurantId) => {
        try {
            if (!restaurantId) {
                throw new Error('Restaurant ID is required');
            }

            setCartItems(prevItems => 
                prevItems.filter(item => item.restaurant?._id !== restaurantId)
            );

            return { success: true };
        } catch (error) {
        console.error('Error clearing restaurant cart:', error);
        return { success: false, error: error.message };
        }
    };

    // Get cart total
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + ((item.price || 0) * (item.quantity || 1));
        }, 0);
    };
    // Check if item is in cart (requires restaurant context)
    const isInCart = (itemId, restaurantId) => {
        return cartItems.some(item => 
            item._id === itemId && item.restaurant?._id === restaurantId
        );
    };
    
    // Get item quantity with restaurant context
    const getItemQuantity = (itemId, restaurantId) => {
        const item = cartItems.find(item => 
            item._id === itemId && item.restaurant?._id === restaurantId
        );
        return item ? item.quantity : 0;
    };
    const getItemCount = () => {
        return cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
    };
    // Check if cart is from single restaurant
    const isSingleRestaurant = () => {
        if (cartItems.length === 0) return true;
        const firstRestaurantId = cartItems[0]?.restaurant?._id;
        return cartItems.every(item => item.restaurant?._id === firstRestaurantId);
    };
    
    // Get unique restaurants in cart
    const getRestaurants = () => {
        const restaurants = {};
        cartItems.forEach(item => {
          if (item.restaurant?._id) {
            restaurants[item.restaurant._id] = item.restaurant;
          }
        });
        return Object.values(restaurants);
    };
    
    // Validate cart items (check if they still exist in database)
    const validateCart = async () => {
        if (cartItems.length === 0) return { valid: true };
    
        try {
          setLoading(true);
          
          // Get all menu item IDs
          const menuItemIds = cartItems.map(item => item._id);
          
          // Fetch current menu items from database
          const response = await axios.post(`${backend_url}/api/menu/validate`, {
            ids: menuItemIds
          });
    
          if (response.data.success) {
            const validIds = new Set(response.data.validIds);
            
            // Filter out invalid items
            const validCart = cartItems.filter(item => validIds.has(item._id));
            
            if (validCart.length !== cartItems.length) {
              setCartItems(validCart);
              return { valid: false, removed: cartItems.length - validCart.length };
            }
            
            return { valid: true };
          }
        } catch (error) {
          console.error('Error validating cart:', error);
        } finally {
          setLoading(false);
        }
    
        return { valid: true }; // Assume valid if validation fails
    };
    // FIXED: Call the functions to get actual values
    const cartTotal = getCartTotal();
    const itemCount = getItemCount();
    const value = {
        cartItems,
        loading,
        error,
        cartCount: itemCount,
        cartTotal: cartTotal,
        addToCart,
        addMultipleToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        clearRestaurantCart,
        isSingleRestaurant,
        isInCart,
        getRestaurants,
        validateCart,
        getItemQuantity
    };

    return (
        <CartContext.Provider value={value}>
        {children}
        </CartContext.Provider>
    );
};