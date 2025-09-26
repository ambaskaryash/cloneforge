// Client-safe subscription types and constants

export interface SubscriptionPlan {
  name: string;
  description: string;
  price: number;
  clones: number;
  features: string[];
  clerkPlanId: string;
}

export const subscriptionPlans: Record<string, SubscriptionPlan> = {
  free: {
    name: 'Free',
    description: 'Perfect for trying out CloneForge',
    price: 0,
    clones: 5,
    features: [
      '5 website clones per month',
      'Basic frameworks (HTML/CSS/JS)',
      'Community support',
      'Basic templates',
    ],
    clerkPlanId: 'free', // Free plan in Clerk
  },
  pro: {
    name: 'Pro',
    description: 'Best for individuals and small teams',
    price: 29,
    clones: 100,
    features: [
      '100 website clones per month',
      'All frameworks (Next.js, React, Vue, etc.)',
      'Priority support',
      'Advanced templates',
      'Code optimization',
      'Export to GitHub',
    ],
    clerkPlanId: 'plan_pro', // Pro plan in Clerk
  },
  premium: {
    name: 'Premium',
    description: 'For agencies and large teams',
    price: 99,
    clones: -1, // Unlimited
    features: [
      'Unlimited website clones',
      'All frameworks + custom options',
      'Dedicated support',
      'White-label solution',
      'API access',
      'Team collaboration',
      'Advanced analytics',
    ],
    clerkPlanId: 'plan_premium', // Premium plan in Clerk
  },
};

/**
 * Get subscription plan details by plan name
 */
export function getSubscriptionPlan(planName: string): SubscriptionPlan {
  return subscriptionPlans[planName] || subscriptionPlans.free;
}