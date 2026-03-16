import React, {useEffect, useState} from 'react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
// import { CheckCircleIcon } from '@heroicons/react/solid';
import axios from 'axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  const reference = searchParams.get('reference');
  const location = useLocation();
  const order = location.state?.order;
  const backend_url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (reference)
      verifyPayment();
    else{
      setVerifying(false);
      setError("No Payment reference found");
    }
  }, [reference]);

  const verifyPayment = async () => {
    try {
      const response = await axios.get(
        `${backend_url}/api/payments/paystack/verify/${reference}`
      );

      if (response.data.success) 
        setOrderDetails(response.data.data);
      else 
        setError(response.data.message);
    }catch (error) { 
      console.error('Verification error:', error);
      setError('Payment verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleViewOrders = () => {
    navigate(`/orders/${orderDetails?.orderId}`);
  };

  if (verifying) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl text-red-500 mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/cart"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    );
  } 


  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        {/* <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" /> */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. Your food is being prepared and will be delivered soon.
        </p>
        
        {order && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <p className="text-gray-600 mb-2">Reference: {reference}</p>
            <p className="text-gray-600 mb-6">Amount: ₦{orderDetails?.amount?.toFixed(2)}</p>
            <p><strong>Status:</strong> <span className="text-green-600">Confirmed</span></p>
          </div>
        )}
        
        <div className="flex space-x-4 justify-center">
          <Link
            to={handleViewOrders}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600"
          >
            View Orders
          </Link>
          <Link
            to="/"
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;