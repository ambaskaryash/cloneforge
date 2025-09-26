'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface PayUPaymentProps {
  plan: string;
  planName: string;
  price: number;
  onSuccess?: () => void;
}

export default function PayUPayment({ plan, planName, price, onSuccess }: PayUPaymentProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    if (!user) {
      setError('Please log in to subscribe');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create PayU payment request
      const response = await fetch('/api/payment/payu/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          plan,
          userEmail: user.emailAddresses[0]?.emailAddress,
          userName: user.firstName || 'User'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.demo) {
          // Demo mode - show success message
          alert(data.message || 'Demo: Subscription activated!');
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.href = '/subscription';
          }
        } else if (data.paymentForm) {
          // Create and submit PayU payment form
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = data.paymentUrl;
          
          // Add all PayU parameters as hidden fields
          Object.entries(data.paymentForm).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value as string;
            form.appendChild(input);
          });
          
          document.body.appendChild(form);
          form.submit();
        } else {
          setError('Failed to initialize payment');
        }
      } else {
        setError(data.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payu-payment-component">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-xl border shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Subscribe to {planName}</h3>
        <p className="text-gray-600 mb-4">
          ₹{price}/month - Billed monthly, cancel anytime
        </p>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Payment processed securely through PayU India</p>
          
          {/* Payment method icons */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
              🟢 Google Pay
            </div>
            <div className="flex items-center text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
              💜 PhonePe
            </div>
            <div className="flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
              💳 UPI
            </div>
            <div className="flex items-center text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded">
              💰 Net Banking
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Secure Indian payment processing
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Cancel anytime
          </div>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg font-semibold transition-colors bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              Processing...
            </div>
          ) : (
            `Pay ₹${price}/month`
          )}
        </button>
      </div>
    </div>
  );
}