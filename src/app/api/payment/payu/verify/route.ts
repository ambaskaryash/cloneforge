import { NextRequest, NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { verifyPayUHash } from '@/lib/payu';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      status,
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      hash,
      udf1: userId,
      udf2: plan,
      mihpayid,
      mode
    } = body;

    // Verify hash for security
    const isValidHash = verifyPayUHash(body);
    
    if (!isValidHash) {
      console.error('Invalid PayU hash verification');
      return NextResponse.json({ 
        verified: false, 
        error: 'Invalid payment verification' 
      }, { status: 400 });
    }

    // Check if payment was successful
    if (status !== 'success') {
      console.log('Payment not successful:', status);
      return NextResponse.json({ 
        verified: false, 
        error: `Payment ${status}. Please try again.` 
      }, { status: 400 });
    }

    if (!userId || !plan) {
      console.error('Missing user ID or plan in PayU response');
      return NextResponse.json({ 
        verified: false, 
        error: 'Invalid payment data' 
      }, { status: 400 });
    }

    try {
      // Update user subscription in database
      await prisma.user.update({
        where: { clerkId: userId },
        data: {
          subscriptionStatus: 'active',
          subscriptionPlan: plan.toUpperCase(),
          payuTransactionId: mihpayid,
          payuPaymentMode: mode || 'unknown',
        },
      });

      // Update Clerk user metadata
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          subscription: {
            plan: plan,
            status: 'active',
            paymentGateway: 'payu',
            transactionId: mihpayid,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            cancelAtPeriodEnd: false,
          },
        },
      });

      console.log(`PayU payment verified and subscription activated for user ${userId}`);

      return NextResponse.json({
        verified: true,
        message: 'Payment verified and subscription activated',
        plan: plan,
        transactionId: mihpayid
      });

    } catch (dbError) {
      console.error('Database update error:', dbError);
      return NextResponse.json({ 
        verified: false, 
        error: 'Failed to activate subscription. Please contact support.' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('PayU verification error:', error);
    return NextResponse.json({ 
      verified: false, 
      error: 'Payment verification failed' 
    }, { status: 500 });
  }
}

// Handle GET requests (for webhook if needed)
export async function GET() {
  return NextResponse.json({ message: 'PayU verification endpoint' });
}