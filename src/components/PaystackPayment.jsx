// components/PaystackPayment.jsx
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PaystackPayment = ({ email, amount, orderId, onSuccess, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [reference, setReference] = useState('');
    const [bankDetails, setBankDetails] = useState(null);
    const [error, setError] = useState('');
    const [paymentOption, setPaymentOption] = useState(null);
    const navigate = useNavigate();
    const paystackInitialized = useRef(false);
    const backend_url = import.meta.env.VITE_BACKEND_URL;

    
    const PAYSTACK_PUBLIC_KEY = 'pk_live_e2f0d56a2bd932f09949b23e860a1dc486d9be42';

    useEffect(() => {
        // Generate reference when component mounts
        const ref = 'PAYSTACK_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
        setReference(ref);
    }, []);

    // Load Paystack script manually with better error handling
    useEffect(() => {
        // Load Paystack script
        if (!window.PaystackPop) {
            const script = document.createElement('script');
            script.src = 'https://js.paystack.co/v1/inline.js';
            script.async = true;
            script.onload = () => {
                console.log('Paystack script loaded');
                setScriptLoaded(true);
            };
            script.onerror = () => {
                console.error('Failed to load Paystack script');
                setError('Failed to load payment system');
            };
            document.body.appendChild(script);
        } else {
            setScriptLoaded(true);
        }
    }, []);

    // Handle payment with Paystack
    const handlePaystackPayment = () => {
        setPaymentOption('online');
        
        if (!scriptLoaded) {
            toast.error('Payment system is still loading. Please try again.');
            return;
        }

        if (!window.PaystackPop) {
            toast.error('Payment system not available. Please refresh the page.');
            return;
        }
        
        if (!reference) {
            toast.error('Generating payment reference. Please try again.');
            return;
        }

        setLoading(true);
        
        try {
            // Define channels - use fewer channels to avoid issues
            const channels = ['card', 'ussd', 'bank' ,'qr'];
            // console.log('localStorage.getItem(token)',localStorage.getItem('token'))
            // Define the callback function BEFORE using it
            const paymentCallback = function(response) {
                console.log('✅ Payment callback received:', response);
                console.log('Payment reference:', response.reference);
                console.log('Transaction status:', response.status);
                
                // Show success message
                toast.success('Payment successful! Verifying your payment...');
                
                // Call verify function with the response
                verifyPayment(response.reference);
            };
            // Create the handler
            const handler = window.PaystackPop.setup({
                key: PAYSTACK_PUBLIC_KEY,
                email: email,
                amount: Math.round(amount * 100),
                currency: 'NGN',
                ref: reference,
                channels: channels,
                metadata: {
                    orderId: orderId,
                    orderReference: reference
                },
                callback: paymentCallback,
                onClose: function() {
                    console.log('Payment window closed');
                    setLoading(false);
                    onClose();
                }
            });

            handler.openIframe();
        } catch (error) {
            console.error('Paystack setup error:', error);
            setError('Failed to initialize payment. Please try again.');
            setLoading(false);
        }
    };

    // Verify payment function
    const verifyPayment = async (paymentReference) => {
        try {
            console.log('Verifying payment:', paymentReference);
            
            const response = await axios.get(
                `${backend_url}/api/payments/paystack/verify/${paymentReference}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Verification response:', response.data);

            if (response.data.success) {
                onSuccess(response.data.data);
                
                // Show success message
                toast.success('Payment successful! Your order has been confirmed.');
                
                // Navigate to Success page
                navigate(`/payment/success?reference=${paymentReference}`, {
                    state: {
                      order: { _id: orderId }
                    }
                });
            } else {
                toast.error('Payment verification failed. Please contact support.');
            }
        } catch (error) {
            console.error('Verification error:', error.response?.data || error.message);
            
            // Check if payment was actually successful but verification failed
            if (error.response?.status === 404) {
                toast.error('Payment reference not found. Please contact support with your reference: ' + paymentReference);
            } else if (error.response?.status === 500) {
                toast.error('Server error during verification. Your payment may still be successful. Please check your orders page.');
                // Navigate to orders to check status
                navigate('/orders');
            } else {
                toast.error('Payment verification failed. Please contact support.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle cash on delivery
    const handleCashDelivery = async () => {
        setPaymentOption('cash');
        
        try {
            setLoading(true);
            // Update order payment method
            await axios.put(`${backend_url}/api/orders/${orderId}`, {
                paymentMethod: 'cash',
                paymentStatus: 'pending'
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            onSuccess({ orderId, paymentMethod: 'cash' });
            navigate('/orders');
        } catch (error) {
            console.error('Cash on delivery error:', error);
            setError('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Copy to clipboard function
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    // Bank Transfer Details View
    if (bankDetails) {
        return (
            <div className="max-w-2xl mx-auto py-6 px-4">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">🏦</div>
                        <h2 className="text-2xl font-bold text-gray-900">Bank Transfer Details</h2>
                        <p className="text-gray-600 mt-2">
                            Please transfer the exact amount to complete your order
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Bank Name</p>
                                    <p className="font-bold text-lg">{bankDetails.bankName}</p>
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(bankDetails.bankName)}
                                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Account Number</p>
                                    <p className="font-bold text-lg font-mono">{bankDetails.accountNumber}</p>
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(bankDetails.accountNumber)}
                                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Account Name</p>
                                    <p className="font-bold text-lg">{bankDetails.accountName}</p>
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(bankDetails.accountName)}
                                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Amount to Pay</p>
                                    <p className="font-bold text-2xl text-green-600">₦{bankDetails.amount?.toFixed(2)}</p>
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(bankDetails.amount?.toFixed(2))}
                                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Reference</p>
                            <p className="font-mono text-sm break-all">{bankDetails.reference}</p>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Expires</p>
                            <p className="font-medium">{new Date(bankDetails.expiresAt).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Instructions:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                            <li>Copy the account details above</li>
                            <li>Open your banking app or visit any bank branch</li>
                            <li>Transfer the exact amount of <span className="font-bold">₦{bankDetails.amount?.toFixed(2)}</span></li>
                            <li>Use <span className="font-mono bg-gray-200 px-1">{bankDetails.reference}</span> as payment reference</li>
                            <li>Your order will be confirmed automatically once payment is received</li>
                            <li>This typically takes 5-10 minutes</li>
                        </ol>
                    </div>

                    <div className="mt-8 flex space-x-4">
                        <button
                            onClick={() => {
                                onSuccess(bankDetails);
                                navigate('/orders');
                            }}
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
                        >
                            I've Made the Transfer
                        </button>
                        
                        <button
                            onClick={() => setBankDetails(null)}
                            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main Payment Selection View
    return (
        <div className="max-w-4xl mx-auto py-6 px-4">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
                    <p className="text-gray-600 mt-2">Choose your preferred payment method</p>
                </div>
        
                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Payment Methods Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Online Payment Option */}
                    <button
                        onClick={handlePaystackPayment}
                        disabled={loading || !scriptLoaded}
                        className={`p-8 border-2 rounded-xl text-center transition-all ${
                            paymentOption === 'online' 
                                ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100' 
                                : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <div className="text-6xl mb-4">💳</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Pay Online</h3>
                        <p className="text-gray-600 mb-4">
                            Pay instantly with card, internet banking, USSD, or QR code
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 rounded">Visa</span>
                            <span className="px-2 py-1 bg-gray-100 rounded">Mastercard</span>
                            <span className="px-2 py-1 bg-gray-100 rounded">Verve</span>
                            <span className="px-2 py-1 bg-gray-100 rounded">USSD</span>
                        </div>
                    </button>

                    {/* Cash on Delivery */}
                    <button
                        onClick={handleCashDelivery}
                        disabled={loading}
                        className={`p-8 border-2 rounded-xl text-center transition-all ${
                            paymentOption === 'cash' 
                                ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100' 
                                : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <div className="text-6xl mb-4">💵</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Cash on Delivery</h3>
                        <p className="text-gray-600 mb-4">
                            Pay when your order arrives at your doorstep
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 rounded">No Card Needed</span>
                            <span className="px-2 py-1 bg-gray-100 rounded">Pay After Delivery</span>
                        </div>
                    </button>
                </div>

                {/* Loading Indicator */}
                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        <span className="ml-4 text-gray-600">Processing your request...</span>
                    </div>
                )}

                {/* Security Badges */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-3xl mb-2">🔒</div>
                        <p className="text-xs text-gray-500">256-bit SSL</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl mb-2">🛡️</div>
                        <p className="text-xs text-gray-500">PCI DSS Level 1</p>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl mb-2">⚡</div>
                        <p className="text-xs text-gray-500">Instant Payment</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t text-center">
                    <p className="text-sm text-gray-500">
                        By completing this payment, you agree to our{' '}
                        <a href="#" className="text-orange-500 hover:underline">Terms of Service</a>
                    </p>
                    <p className="text-xs text-gray-400 mt-4">
                        Powered by Paystack • Secure payments for African businesses
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaystackPayment;

