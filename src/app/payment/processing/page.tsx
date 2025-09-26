'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function PaymentProcessingPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [countdown, setCountdown] = useState(5);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const plan = searchParams.get('plan');
  const userId = searchParams.get('userId');

  useEffect(() => {
    // Simulate payment processing
    const timer = setTimeout(() => {
      setStatus('success');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status === 'success') {
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
  }, [status, router]);

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="mb-8">
            <ArrowPathIcon className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900">
            Processing Your Payment
          </h1>
          <p className="text-gray-600 mb-4">
            Please wait while we process your {plan} plan subscription...
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">
              This is a demo payment flow. In production, this would be handled by PayU India.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="mb-8">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-900">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Your {plan} plan subscription has been activated successfully.
          </p>
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
            <p className="text-sm text-green-800">
              You now have access to all {plan} plan features.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Redirecting to your subscription page in {countdown} seconds...
          </p>
        </div>
      </div>
    );
  }

  return null;
}