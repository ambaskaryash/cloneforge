'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface SubscriptionData {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface SubscriptionStatusProps {
  monthlyClones?: number;
  usedClones?: number;
}

export default function SubscriptionStatus({ monthlyClones = 0, usedClones = 0 }: SubscriptionStatusProps) {
  const { user } = useUser();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  
  useEffect(() => {
    if (user?.publicMetadata?.subscription) {
      setSubscription(user.publicMetadata.subscription as SubscriptionData);
    } else {
      setSubscription({
        plan: 'free',
        status: 'active',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });
    }
  }, [user]);

  if (!subscription) return null;

  const planLimits = {
    free: 5,
    pro: 100,
    premium: -1, // unlimited
  };

  const planNames = {
    free: 'Free',
    pro: 'Pro',
    premium: 'Premium',
  };

  const limit = planLimits[subscription.plan as keyof typeof planLimits] || 5;
  const planName = planNames[subscription.plan as keyof typeof planNames] || 'Free';
  const usagePercentage = limit === -1 ? 0 : Math.min((usedClones / limit) * 100, 100);
  const isNearLimit = usagePercentage > 80;
  const isOverLimit = usedClones >= limit && limit !== -1;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Subscription Status</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          subscription.status === 'active' 
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {planName} Plan
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Monthly Usage</span>
          <span className="text-sm text-gray-600">
            {usedClones} / {limit === -1 ? '∞' : limit} clones
          </span>
        </div>
        
        {limit !== -1 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isOverLimit 
                  ? 'bg-red-500' 
                  : isNearLimit 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        )}
        
        {isOverLimit && (
          <div className="flex items-center mt-2 text-red-600">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">Usage limit exceeded</span>
          </div>
        )}
        
        {isNearLimit && !isOverLimit && (
          <div className="flex items-center mt-2 text-yellow-600">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">Approaching usage limit</span>
          </div>
        )}
      </div>

      {/* Subscription Details */}
      {subscription.plan !== 'free' && subscription.currentPeriodEnd && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Next billing date:</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          </div>
          {subscription.cancelAtPeriodEnd && (
            <div className="mt-2 text-sm text-yellow-600">
              Subscription will be canceled at the end of the billing period
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {subscription.plan === 'free' || isOverLimit ? (
          <Link
            href="/subscription"
            className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {subscription.plan === 'free' ? 'Upgrade Plan' : 'Increase Limits'}
          </Link>
        ) : (
          <Link
            href="/subscription"
            className="flex-1 border border-gray-300 text-gray-700 text-center py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Change Plan
          </Link>
        )}
        
        {subscription.plan !== 'free' && (
          <div className="flex-1 text-center py-2 px-4 text-gray-500 text-sm">
            Managed via Clerk
          </div>
        )}
      </div>
    </div>
  );
}