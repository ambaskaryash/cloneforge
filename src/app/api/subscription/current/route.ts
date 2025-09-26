import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await clerkClient.users.getUser(userId);
    const subscriptionData = user.publicMetadata?.subscription as any;
    
    console.log('User metadata:', user.publicMetadata);
    console.log('Subscription data:', subscriptionData);
    
    return NextResponse.json({
      plan: subscriptionData?.plan || 'free',
      status: subscriptionData?.status || 'inactive',
      currentPeriodEnd: subscriptionData?.currentPeriodEnd || null,
      cancelAtPeriodEnd: subscriptionData?.cancelAtPeriodEnd || false,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({
      plan: 'free',
      status: 'inactive',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    });
  }
}