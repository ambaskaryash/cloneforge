'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckIcon } from '@heroicons/react/24/outline';

export default function PaymentSuccessPage() {
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get all PayU response parameters
        const payuData = {
          mihpayid: searchParams.get('mihpayid'),
          mode: searchParams.get('mode'),
          status: searchParams.get('status'),
          unmappedstatus: searchParams.get('unmappedstatus'),
          key: searchParams.get('key'),
          txnid: searchParams.get('txnid'),
          amount: searchParams.get('amount'),
          productinfo: searchParams.get('productinfo'),
          firstname: searchParams.get('firstname'),
          email: searchParams.get('email'),
          phone: searchParams.get('phone'),
          hash: searchParams.get('hash'),
          udf1: searchParams.get('udf1'), // userId
          udf2: searchParams.get('udf2'), // plan
        };

        // Verify payment with backend
        const response = await fetch('/api/payment/payu/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payuData),
        });

        const result = await response.json();

        if (response.ok && result.verified) {
          setVerified(true);
        } else {
          setError(result.error || 'Payment verification failed');
        }
      } catch (err) {
        setError('Failed to verify payment');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  useEffect(() => {
    if (verified) {
      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            router.push('/subscription');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [verified, router]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-8"></div>
          <h1 className="text-2xl font-bold mb-4">Verifying Payment...</h1>
          <p className="text-gray-600">
            Please wait while we confirm your payment with PayU India.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-red-600">Payment Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/subscription')}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Return to Subscription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckIcon className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-4 text-green-600">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your subscription has been activated successfully. You now have access to all premium features.
        </p>
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
          <p className="text-sm text-green-800">
            🎉 Welcome to CloneForge Premium! Start cloning websites now.
          </p>
        </div>
        <p className="text-sm text-gray-500">
          Redirecting to your subscription dashboard in {countdown} seconds...
        </p>
      </div>
    </div>
  );
}