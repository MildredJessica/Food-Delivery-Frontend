import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import PayStackPayment from './PaystackPayment.jsx';
import BankTransfer from './BankTransfer.jsx';
import AddressForm from './AddressForm.jsx';

const Cart = () => {
  const [checkoutStep, setCheckoutStep] = useState('cart');
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeError, setPromoCodeError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [orderId, setOrderId] = useState(null);
  const { 
    cartItems, 
    cartCount, 
    cartTotal, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart();
  const navigate = useNavigate();
  const backend_url = import.meta.env.VITE_BACKEND_URL;

  const getDeliveryFee = () => {
    return cartTotal > 20 ? 0 : 2.99;
  };

  const getTax = () => {
    return cartTotal * 0.08;
  };
  const getDiscount = () => {
    return promoApplied ? cartTotal * promoDiscount : 0;
  };
  const getGrandTotal = () => {
    return cartTotal + getDeliveryFee() + getTax() - getDiscount();
  };

  // Validate cart before proceeding
  // const validateCart = () => {
  //   if (cartItems.length === 0) {
  //     alert('Your cart is empty!');
  //     return false;
  //   }

  //   // Check if all items have valid prices
  //   const invalidItems = cartItems.filter(item => !item.price || item.price <= 0);
  //   if (invalidItems.length > 0) {
  //     alert('Some items in your cart have invalid prices. Please remove them and try again.');
  //     return false;
  //   }

  //   return true;
  // };

  // Handle promo code application
  const handleApplyPromo = () => {
      setPromoCodeError('');
      
      // Mock promo codes
      const promoCodes = {
        'SAVE10': 0.10,
        'SAVE20': 0.20,
        'FREESHIP': 0.00,
        'WELCOME5': 0.05
      };
  
      if (promoCodes[promoCode.toUpperCase()]) {
        setPromoDiscount(promoCodes[promoCode.toUpperCase()]);
        setPromoApplied(true);
        alert(`Promo code applied! You saved ${promoCodes[promoCode.toUpperCase()] * 100}%`);
      } else {
        setPromoCodeError('Invalid promo code');
      }
    };
  
    // Create order before payment
    const createOrder = async (address) => {
      setLoading(true);
      try {
        // Get restaurant ID from first item
        const restaurantId = cartItems[0]?.restaurant?._id || cartItems[0]?.restaurant;
        
        if (!restaurantId) {
          throw new Error('Restaurant ID is missing from cart items');
        }
        const orderData = {
          user: user._id,
          restaurant: restaurantId,
          items: cartItems.map(item => ({
            menuItem: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions || ''
          })),
          subtotal: cartTotal,
          deliveryFee: getDeliveryFee(),
          tax: getTax(),
          discount: getDiscount(),
          totalAmount: getGrandTotal(),
          deliveryAddress: typeof address === 'string' ? address : 
            `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`,
          deliveryNotes: deliveryInstructions,
          paymentMethod: paymentMethod,
          promoCode: promoApplied ? promoCode : null
        };
        // console.log('Sending order data:', JSON.stringify(orderData, null, 2));
        const response = await axios.post(`${backend_url}api/orders`, orderData,{
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (response.data.success) {
          const order = response.data.data
          setOrderId(order._id);
          return order;
        } else {
          throw new Error(response.data.message || 'Failed to create order');
        }
      } catch (error) {
          console.error('Error creating order details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                data: error.response?.data
              });        
          alert(error.response?.data?.message || 'Failed to create order. Please try again.');
          return null;
      } finally {
        setLoading(false);
      }
  };
  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    setCheckoutStep('address');
  };
  
  // Handle address submission
  const handleAddressSubmit = async (address) => {
    setDeliveryAddress(address);
    // Create order first
    const order = await createOrder(address);
    console.log("Order", order, order._id)

    // setCheckoutStep('payment')
    if (order && order._id) {
        console.log("Address Form")
        setCheckoutStep('payment');
      // }
    }
  };

  // Handle cash on delivery
  // const handleCashPayment = async (orderId) => {
  //   try {
  //     await axios.post('${backend_url}api/payments/confirm-cash', { orderId });
      
  //     // Clear cart
  //     clearCart();
      
  //     // Show success message
  //     alert('Order placed successfully! You will pay upon delivery.');
      
  //     // Navigate to orders
  //     navigate('/orders');
  //   } catch (error) {
  //     console.error('Error processing cash payment:', error);
  //     alert('Failed to place order. Please try again.');
  //   }
  // };
  const handlePaymentSuccess = (paymentData) => {
    // Clear cart after successful payment
    clearCart();
  };
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };
  const handlePaymentClose = () => {
    setCheckoutStep('address');
  };
  
  // const handleBankTransfer = () => {
  //   setShowBankTransfer(true);
  //   setCheckoutStep('bank');
  // };
  
  // Handle back navigation
  const handleBackToCart = () => setCheckoutStep('cart');
  const handleBackToAddress = () => setCheckoutStep('address');

  if (cartItems.length === 0 && checkoutStep === 'cart') {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add delicious food from our restaurants!</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  if (checkoutStep === 'address') {
    return (
      <AddressForm 
        userAddress={user?.address}
        onSubmit={handleAddressSubmit}
        loading={loading}
        deliveryInstructions = {deliveryInstructions}
        setDeliveryInstructions = {setDeliveryInstructions}
        onBack={handleBackToCart}
        // click={() => setCheckoutStep('payment')}
      />
    );
  }

  // Add this to your payment step
  if (checkoutStep === 'bank' && orderId) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center mb-6">
          <button
            // onClick={() => setCheckoutStep('payment')}
            onClick={handleBackToAddress}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Bank Transfer</h1>
        </div>
        
        <BankTransfer
          orderId={orderId}
          amount={getGrandTotal()}
          onSuccess={handlePaymentSuccess}
          // onBack={() => setCheckoutStep('payment')}
          onBack={handleBackToAddress}
        />
      </div>
    );
  }
  // console.log("Display Order" )
  if (checkoutStep === 'payment' && orderId) {
    try{
      return (
        <div className="max-w-4xl mx-auto py-6 px-4">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setCheckoutStep('address')} 
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              ← Back to Address
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Complete Payment</h1>
          </div>            
          <PayStackPayment
            email={user?.email}
            amount={getGrandTotal()}
            orderId={orderId}
            onSuccess={handlePaymentSuccess}
            onClose={handlePaymentClose}
          />
        </div>
      );
    } catch(error){
        console.error('Error rendering payment component:', error);
        // Fallback to show error and allow going back
        return (
          <div className="max-w-4xl mx-auto py-6 px-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-600">Error loading payment. Please try again.</p>
              <button onClick={handleBackToAddress}>Go Back</button>
            </div>
          </div>
        );  
    }
    
  }
  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        <div className="flex items-center space-x-4">
            <span className="text-gray-600">{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
            <button
              onClick={() =>{
                if (window.confirm('Are you sure you want to clear your cart?')) {
                    clearCart();
                }
              }}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear Cart
            </button>
        </div>
      </div>
            
      {/* Cart Items */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              {cartItems.map((item, index) => (
                <div key={`${item._id}-${index}`} className="flex items-center justify-between border-b py-4 last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      {/* Item Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80?text=Food';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                            <span className="text-2xl">🍽️</span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <span className="text-xs text-gray-500">({item.restaurant?.name})</span>
                      {item.specialInstructions && (
                          <p className="text-xs text-gray-500 mt-2 italic">
                              Note: {item.specialInstructions}
                          </p>
                      )}
                    </div>
                    <p className="text-gray-600">₦{(item.price || 0).toFixed(2)} each</p>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item._id, item.restaurant?._id, (item.quantity || 1) - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="font-semibold w-8 text-center">{item.quantity || 1}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.restaurant?._id, (item.quantity || 1) + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatCurrency((item.price || 0) * (item.quantity || 1))}
                    </p>
                    <button
                      onClick={() => {
                        if (window.confirm('Remove this item from cart?')) 
                          removeFromCart(item._id, item.restaurant?._id);
                      }}
                      className="text-sm text-red-500 hover:text-red-700 mt-2"
                    >
                      Remove
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
      </div>
              
      {/* Promo Code Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Promo Code</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter promo code"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={promoApplied}
          />
          <button
            onClick={handleApplyPromo}
            disabled={promoApplied || !promoCode}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
        {promoCodeError && (
          <p className="text-red-500 text-sm mt-2">{promoCodeError}</p>
        )}
        {promoApplied && (
          <p className="text-green-600 text-sm mt-2">
            Promo code applied! {promoDiscount * 100}% discount
          </p>
        )}
      </div>


      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                  <span className="font-medium">₦{cartTotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className={getDeliveryFee() === 0 ? "text-green-600 font-medium" : "font-medium"}>
                    {getDeliveryFee() === 0 ? 'FREE' : `₦${getDeliveryFee().toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-medium">₦{getTax().toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">₦{getGrandTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleProceedToCheckout}
                disabled={cartItems.length === 0 || loading}
                className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>
              
              {!isAuthenticated && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  You'll need to sign in to complete your order
                </p>
              )}
      </div>
    </div>
  );
  

  
};



export default Cart;