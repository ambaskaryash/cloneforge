import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

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
 * Get the current user's subscription information from Clerk
 */
export async function getCurrentSubscription() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  try {
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
    const user = await clerkClient.users.getUser(userId);
    
    // Get subscription data from Clerk's publicMetadata
    const subscriptionData = user.publicMetadata?.subscription as any;
    
    return {
      plan: subscriptionData?.plan || 'free',
      status: subscriptionData?.status || 'inactive',
      currentPeriodEnd: subscriptionData?.currentPeriodEnd 
        ? new Date(subscriptionData.currentPeriodEnd) 
        : null,
      cancelAtPeriodEnd: subscriptionData?.cancelAtPeriodEnd || false,
    };
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return {
      plan: 'free',
      status: 'inactive',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }
}

/**
 * Get subscription plan details by plan name
 */
export function getSubscriptionPlan(planName: string): SubscriptionPlan {
  return subscriptionPlans[planName] || subscriptionPlans.free;
}

/**
 * Check if user has access to a feature based on their subscription
 */
export async function hasFeatureAccess(feature: string): Promise<boolean> {
  const subscription = await getCurrentSubscription();
  
  if (!subscription) return false;
  
  const plan = getSubscriptionPlan(subscription.plan);
  
  // Add feature-specific logic here
  switch (feature) {
    case 'unlimited_clones':
      return subscription.plan === 'premium';
    case 'advanced_frameworks':
      return ['pro', 'premium'].includes(subscription.plan);
    case 'api_access':
      return subscription.plan === 'premium';
    default:
      return true;
  }
}

/**
 * Check if user can create a new clone based on usage limits
 */
export async function canCreateClone(): Promise<{ canCreate: boolean; reason?: string }> {
  const subscription = await getCurrentSubscription();
  
  if (!subscription) {
    return { canCreate: false, reason: 'No subscription found' };
  }
  
  const plan = getSubscriptionPlan(subscription.plan);
  
  // If unlimited clones (premium plan)
  if (plan.clones === -1) {
    return { canCreate: true };
  }
  
  // For free and pro plans, check usage
  // TODO: Implement usage tracking from database
  // For now, return true - you'll need to implement usage tracking
  return { canCreate: true };
}

/**
 * Require authentication and redirect if not authenticated
 */
export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  return userId;
}

/**
 * Require a specific subscription plan
 */
export async function requireSubscription(requiredPlan: string) {
  await requireAuth();
  
  const subscription = await getCurrentSubscription();
  
  if (!subscription || subscription.plan === 'free') {
    redirect('/subscription');
  }
  
  const planHierarchy = ['free', 'pro', 'premium'];
  const userPlanIndex = planHierarchy.indexOf(subscription.plan);
  const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);
  
  if (userPlanIndex < requiredPlanIndex) {
    redirect('/subscription');
  }
}