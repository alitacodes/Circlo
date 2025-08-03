import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface RazorpayPaymentProps {
  bookingId: string;
  itemId: string;
  startDate: string;
  endDate: string;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  bookingId,
  itemId,
  startDate,
  endDate,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Create payment order
      const orderResponse = await apiService.createPaymentOrder({
        booking_id: bookingId,
        item_id: itemId,
        start_date: startDate,
        end_date: endDate,
      });

      if (!orderResponse.success) {
        alert('Failed to create payment order. Please try again.');
        return;
      }

      const { order_id, amount, breakdown } = orderResponse.data;

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_B4QR3yhISeGhFN',
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: 'Circlo Rental',
        description: 'Item Rental Payment',
        order_id: order_id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await apiService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: bookingId,
            });

            if (verifyResponse.success) {
              onSuccess(response.razorpay_payment_id);
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: 'User Name', // You can get this from user context
          email: 'user@example.com',
          contact: '9999999999'
        },
        notes: {
          booking_id: bookingId,
          item_id: itemId
        },
        theme: {
          color: '#FFD700'
        },
        modal: {
          ondismiss: function() {
            onCancel();
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Rent Payment:</span>
          <span className="font-medium">₹{paymentDetails?.breakdown?.rent_payment || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Platform Fee:</span>
          <span className="font-medium">₹{paymentDetails?.breakdown?.platform_fee || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Safety Deposit:</span>
          <span className="font-medium">₹{paymentDetails?.breakdown?.safety_deposit || 200}</span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900">Total Payment:</span>
            <span className="font-bold text-gray-900">₹{paymentDetails?.breakdown?.total || 0}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handlePayment}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-[#FFD700] text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
};

export default RazorpayPayment; 