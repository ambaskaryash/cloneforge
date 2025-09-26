import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { PAYU_CONFIG, SUBSCRIPTION_PLANS, generatePayUHash, PlanType } from '@/lib/payu';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

const prisma = new PrismaClient();
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { userId } = await auth();
    
    if (!userId) {
      logger.warn('Unauthorized payment attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    logger.info('PayU payment creation started', { userId });

    const body = await request.json();
    const { plan, userEmail, userName } = body;

    if (!plan || !['pro', 'premium'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const planConfig = SUBSCRIPTION_PLANS[plan as PlanType];
    
    if (!planConfig.payuPlanId) {
      return NextResponse.json({ error: 'Plan not available for purchase' }, { status: 400 });
    }

    // Validate PayU configuration
    if (!env.NEXT_PUBLIC_PAYU_KEY || !env.PAYU_SALT) {
      logger.error('PayU configuration missing', undefined, { userId });
      return NextResponse.json({ 
        error: 'Payment gateway not configured. Please contact support.' 
      }, { status: 500 });
    }

    // Generate unique transaction ID
    const txnid = `txn_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare PayU payment data
    const paymentData = {
      key: PAYU_CONFIG.key,
      txnid: txnid,
      amount: planConfig.price.toString(),
      productinfo: `${planConfig.name} Plan Subscription`,
      firstname: userName || 'User',
      email: userEmail,
      phone: '', // Optional - can be added if available
      surl: PAYU_CONFIG.successUrl,
      furl: PAYU_CONFIG.failureUrl,
      service_provider: 'payu_paisa',
      udf1: userId, // Store user ID for later reference
      udf2: plan, // Store plan type
      udf3: '', // Reserved for future use
      udf4: '', // Reserved for future use
      udf5: '', // Reserved for future use
    };

    // Generate hash for security
    const hash = generatePayUHash(paymentData);
    paymentData.hash = hash;

    // Store transaction in database for tracking
    await prisma.user.upsert({
      where: { clerkId: userId },
      create: {
        clerkId: userId,
        email: userEmail,
        subscriptionStatus: 'pending',
        subscriptionPlan: plan.toUpperCase(),
      },
      update: {
        subscriptionStatus: 'pending',
        subscriptionPlan: plan.toUpperCase(),
      },
    });

    // Log payment attempt
    logger.paymentAttempt(userId, plan, planConfig.price);
    
    const duration = Date.now() - startTime;
    logger.info('PayU payment creation completed', { 
      userId, 
      txnid, 
      plan, 
      duration: `${duration}ms` 
    });

    return NextResponse.json({
      success: true,
      paymentUrl: PAYU_CONFIG.endpoint,
      paymentForm: paymentData,
      txnid: txnid
    });

  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error('PayU payment creation failed', error, { duration: `${duration}ms` });
    
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
