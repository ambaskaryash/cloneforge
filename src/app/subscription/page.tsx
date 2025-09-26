'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SUBSCRIPTION_PLANS } from '@/lib/payu';
import { CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import PayUPayment from '@/components/PayUPayment';

interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd: boolean;
}

export default function SubscriptionPage() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  
  useEffect(() => {
    if (isLoaded && user) {
      fetchSubscription();
    }
    
    // Check for success parameters
    const success = searchParams.get('success');
    const demo = searchParams.get('demo');
    if (success === 'true') {
      setShowSuccess(true);
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [user, isLoaded, searchParams]);
  
  // Auto-refresh subscription status when page becomes visible (returning from payment)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchSubscription();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);
  
  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/current');
      if (response.ok) {
        const data = await response.json();
        setSubscription({
          plan: data.plan,
          status: data.status,
          currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Set default to free plan on error
      setSubscription({
        plan: 'free',
        status: 'inactive',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    window.location.href = '/sign-in';
    return null;
  }
  
  const currentPlan = subscription?.plan || 'free';
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    {searchParams.get('demo') ? 'Demo: Payment Successful!' : 'Payment Successful!'}
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      {searchParams.get('demo') 
                        ? 'Demo mode: Your subscription has been activated for testing purposes.'
                        : 'Your subscription has been activated and you now have access to premium features.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upgrade your CloneForge experience with more clones, advanced features, and priority support.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {Object.entries(SUBSCRIPTION_PLANS).map(([planKey, plan]) => (
            <div
              key={planKey}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                planKey === 'pro' ? 'ring-2 ring-blue-500 transform scale-105' : ''
              }`}
            >
              {planKey === 'pro' && (
                <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                
                <div className="mb-8">
                  <div className="text-sm font-semibold text-gray-900 mb-2">
                    {plan.clones === -1 ? 'Unlimited' : plan.clones} clones per month
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {currentPlan === planKey ? (
                  <button
                    disabled
                    className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : planKey === 'free' ? (
                  <button
                    onClick={async () => {
                      const response = await fetch('/api/subscription/upgrade', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ plan: 'free' }),
                      });
                      if (response.ok) {
                        fetchSubscription();
                      }
                    }}
                    className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Downgrade to Free
                  </button>
                ) : (
                  <div className="w-full">
                    <PayUPayment
                      plan={planKey}
                      planName={plan.name}
                      price={plan.price}
                      onSuccess={() => {
                        fetchSubscription();
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {subscription && subscription.plan !== 'free' && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Current Subscription
              </h3>
              <p className="text-gray-600 mb-4">
                You're on the {SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS]?.name} plan
              </p>
              {subscription.currentPeriodEnd && (
                <p className="text-sm text-gray-500 mb-4">
                  Next billing date: {subscription.currentPeriodEnd.toLocaleDateString()}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Subscription managed through PayU India
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}