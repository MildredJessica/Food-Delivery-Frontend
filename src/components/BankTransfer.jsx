import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BankTransfer = ({ orderId, amount, onSuccess, onBack }) => {
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState({});
  const [timeLeft, setTimeLeft] = useState('');
  const navigate = useNavigate();
  const backend_url = import.meta.env.VITE_BACKEND_URL;
  

  useEffect(() => {
    fetchBankDetails();
  }, [orderId]);

  useEffect(() => {
    if (bankDetails?.expiresAt) {
      const timer = setInterval(updateCountdown, 1000);
      return () => clearInterval(timer);
    }
  }, [bankDetails]);

  const fetchBankDetails = async () => {
    try {
      const response = await axios.post(
        `${backend_url}api/payments/paystack/bank-transfer`,
        { orderId }
      );

      if (response.data.success) {
        setBankDetails(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
      setError('Failed to get bank transfer details');
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    if (!bankDetails?.expiresAt) return;

    const expiry = new Date(bankDetails.expiresAt).getTime();
    const now = new Date().getTime();
    const difference = expiry - now;

    if (difference <= 0) {
      setTimeLeft('Expired');
      return;
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [field]: true });
    setTimeout(() => setCopied({ ...copied, [field]: false }), 2000);
  };

  const handlePaymentComplete = () => {
    // Poll for payment confirmation
    const checkPayment = setInterval(async () => {
      try {
        const response = await axios.get(
          `${backend_url}api/orders/${orderId}`
        );
        
        if (response.data.order.paymentStatus === 'paid') {
          clearInterval(checkPayment);
          onSuccess();
        }
      } catch (error) {
        console.error('Error checking payment:', error);
      }
    }, 10000); // Check every 10 seconds

    // Show success message
    alert('Payment initiated! We will confirm your payment shortly.');
    setTimeout(() => {
      navigate('/orders');
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={onBack}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Bank Transfer Details</h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="text-2xl mr-3">⏰</div>
          <div>
            <p className="font-medium text-yellow-800">Time Remaining</p>
            <p className="text-lg font-bold text-yellow-900">{timeLeft}</p>
            <p className="text-sm text-yellow-700 mt-1">
              Complete transfer within this time to secure your order
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-600">Amount to Pay</label>
            <button
              onClick={() => handleCopy(`₦${bankDetails.amount.toFixed(2)}`, 'amount')}
              className="text-orange-500 hover:text-orange-600 text-sm"
            >
              {copied.amount ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-2xl font-bold text-green-600">₦{bankDetails.amount.toFixed(2)}</p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-600">Bank Name</label>
            <button
              onClick={() => handleCopy(bankDetails.bankName, 'bank')}
              className="text-orange-500 hover:text-orange-600 text-sm"
            >
              {copied.bank ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-lg font-semibold text-gray-900">{bankDetails.bankName}</p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-600">Account Number</label>
            <button
              onClick={() => handleCopy(bankDetails.accountNumber, 'account')}
              className="text-orange-500 hover:text-orange-600 text-sm"
            >
              {copied.account ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-lg font-semibold text-gray-900 font-mono">{bankDetails.accountNumber}</p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-600">Account Name</label>
            <button
              onClick={() => handleCopy(bankDetails.accountName, 'name')}
              className="text-orange-500 hover:text-orange-600 text-sm"
            >
              {copied.name ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-lg font-semibold text-gray-900">{bankDetails.accountName}</p>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <label className="text-sm font-medium text-gray-600 mb-2">Payment Reference</label>
          <p className="text-sm font-mono text-gray-800 break-all">{bankDetails.reference}</p>
          <p className="text-xs text-gray-500 mt-2">
            Use this reference when making transfer for automatic confirmation
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-3">How to Pay:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
          <li>Log in to your mobile banking app or internet banking</li>
          <li>Transfer the exact amount to the account details above</li>
          <li>Use the payment reference as your transaction description</li>
          <li>Payment will be confirmed automatically within 5-10 minutes</li>
          <li>You'll receive a notification once payment is confirmed</li>
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 font-medium"
        >
          Back
        </button>
        <button
          onClick={handlePaymentComplete}
          className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 font-medium"
        >
          I've Made the Transfer
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        ⚡ Payment will be verified automatically. Do not close this page until payment is confirmed.
      </p>
    </div>
  );
};

export default BankTransfer;