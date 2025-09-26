import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { plan } = await req.json();
    
    if (!plan || !['free', 'pro', 'premium'].includes(plan)) {
      return new NextResponse('Invalid plan', { status: 400 });
    }

    // For demo purposes, simulate subscription change by updating user metadata
    // In production, this would be handled by actual PayU integration
    const subscriptionData = plan === 'free' ? {
      plan: 'free',
      status: 'inactive',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    } : {
      plan: plan,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      cancelAtPeriodEnd: false,
    };

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        subscription: subscriptionData,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully upgraded to ${plan} plan!`,
      plan: plan 
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}