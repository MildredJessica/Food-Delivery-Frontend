const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// Verify Paystack payment
router.get('/paystack/verify/:reference', protect, async (req, res) => {
    try {
        const { reference } = req.params;
        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

        console.log('🔍 Verifying payment reference:', reference);
        console.log('User ID:', req.user.id);

        if (!PAYSTACK_SECRET_KEY) {
            console.error('❌ PAYSTACK_SECRET_KEY is not set');
            return res.status(500).json({
                success: false,
                message: 'Payment gateway configuration error'
            });
        }

        // First, try to find order by paymentReference
        let order = await Order.findOne({ paymentReference: reference });
        
        // If not found, try to find by orderId in the reference string
        if (!order) {
            // Extract orderId from reference if possible (format: PAYSTACK_timestamp_random)
            console.log('Order not found by paymentReference, checking metadata...');
            
            // You might want to query Paystack API to get metadata
            try {
                const paystackResponse = await axios.get(
                    `https://api.paystack.co/transaction/verify/${reference}`,
                    {
                        headers: {
                            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log('Paystack API response:', paystackResponse.data);

                if (paystackResponse.data.status) {
                    const metadata = paystackResponse.data.data.metadata;
                    if (metadata && metadata.orderId) {
                        order = await Order.findById(metadata.orderId);
                        console.log('Found order by metadata orderId:', order?._id);
                    }
                }
            } catch (paystackError) {
                console.error('Error calling Paystack API:', paystackError.response?.data || paystackError.message);
            }
        }

        if (!order) {
            console.log('❌ Order not found for reference:', reference);
            return res.status(404).json({
                success: false,
                message: 'Order not found for this payment reference'
            });
        }

        // Verify with Paystack API
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Paystack verification response:', response.data);

        if (response.data.status && response.data.data.status === 'success') {
            // Update order status
            order.paymentStatus = 'paid';
            order.paymentDetails = {
                provider: 'paystack',
                reference: reference,
                amount: response.data.data.amount / 100,
                paidAt: response.data.data.paid_at,
                channel: response.data.data.channel,
                cardType: response.data.data.authorization?.card_type,
                last4: response.data.data.authorization?.last4
            };
            order.paymentReference = reference;
            order.status = 'confirmed';
            
            await order.save();
            console.log(`✅ Order ${order._id} updated successfully`);

            return res.json({
                success: true,
                message: 'Payment verified successfully',
                data: {
                    orderId: order._id,
                    status: order.status,
                    amount: order.totalAmount,
                    reference: reference
                }
            });
        } else {
            console.log('❌ Payment verification failed:', response.data);
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed',
                data: response.data
            });
        }
    } catch (error) {
        console.error('❌ Paystack verification error:', error);
        
        // Log detailed error information
        if (error.response) {
            console.error('Error response:', {
                status: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error message:', error.message);
        }

        // Handle specific error cases
        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                message: 'Transaction reference not found on Paystack'
            });
        }

        if (error.response?.status === 401) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Paystack secret key'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.response?.data || error.message
        });
    }
});

// Create virtual account for bank transfer
router.post('/paystack/create-virtual-account', protect, async (req, res) => {
    try {
        const { email, amount, orderId } = req.body;
        
        // Mock bank details for testing
        const mockBankDetails = {
            bankName: 'Wema Bank',
            accountNumber: '0123456789',
            accountName: 'FoodExpress Payments',
            amount: amount,
            reference: 'REF-' + Date.now(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        // Update order with bank transfer details
        await Order.findByIdAndUpdate(orderId, {
            paymentMethod: 'bank_transfer',
            paymentStatus: 'pending',
            bankTransferDetails: mockBankDetails
        });

        res.json({
            success: true,
            data: mockBankDetails
        });
    } catch (error) {
        console.error('Bank transfer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate bank transfer details'
        });
    }
});

// Confirm cash payment
router.post('/confirm-cash', protect, async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.paymentStatus = 'pending';
        order.paymentMethod = 'cash';
        order.status = 'confirmed';
        
        await order.save();

        res.json({
            success: true,
            message: 'Order confirmed for cash on delivery',
            order
        });
    } catch (error) {
        console.error('Error confirming cash payment:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;