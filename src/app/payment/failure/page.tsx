'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function PaymentFailurePage() {
  const [paymentInfo, setPaymentInfo] = useState<any>({});
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Get PayU failure response parameters
    const info = {
      status: searchParams.get('status') || 'failed',
      error: searchParams.get('error') || 'Payment was not completed',
      txnid: searchParams.get('txnid'),
      amount: searchParams.get('amount'),
      productinfo: searchParams.get('productinfo'),
    };
    setPaymentInfo(info);
  }, [searchParams]);

  const handleRetry = () => {
    router.push('/subscription');
  };

  const handleContactSupport = () => {
    // You can implement support contact logic here
    window.open('mailto:support@cloneforge.com?subject=Payment Failed - Transaction ID: ' + paymentInfo.txnid, '_blank');
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <XMarkIcon className="h-8 w-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-red-600">Payment Failed</h1>
        
        <p className="text-gray-600 mb-6">
          {paymentInfo.error || 'Your payment could not be processed. Please try again.'}
        </p>

        {paymentInfo.txnid && (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Transaction ID:</strong> {paymentInfo.txnid}
            </p>
            {paymentInfo.amount && (
              <p className="text-sm text-gray-700">
                <strong>Amount:</strong> ₹{paymentInfo.amount}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button 
            onClick={handleRetry}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Try Again
          </button>
          
          <button 
            onClick={handleContactSupport}
            className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Contact Support
          </button>
          
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full text-gray-600 px-6 py-2 hover:text-gray-800 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Common Payment Issues:</h3>
          <ul className="text-xs text-blue-700 space-y-1 text-left">
            <li>• Insufficient balance in your account</li>
            <li>• Network connectivity issues</li>
            <li>• Bank server temporarily down</li>
            <li>• Transaction limit exceeded</li>
          </ul>
        </div>
      </div>
    </div>
  );
}