import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        monthlyClones: true,
        lastResetDate: true,
        projects: {
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Start of current month
            },
          },
          select: { id: true },
        },
      },
    });

    if (!user) {
      // Create user if doesn't exist
      const newUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: '', // Will be updated later
          monthlyClones: 0,
          lastResetDate: new Date(),
        },
      });
      
      return NextResponse.json({
        monthlyClones: 0,
        usedClones: 0,
      });
    }

    // Check if we need to reset monthly count
    const now = new Date();
    const lastReset = new Date(user.lastResetDate);
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let monthlyClones = user.monthlyClones;
    
    if (lastReset < startOfCurrentMonth) {
      // Reset monthly count
      monthlyClones = 0;
      await prisma.user.update({
        where: { clerkId: userId },
        data: {
          monthlyClones: 0,
          lastResetDate: now,
        },
      });
    }

    return NextResponse.json({
      monthlyClones: monthlyClones,
      usedClones: user.projects.length, // Projects created this month
    });
  } catch (error) {
    console.error('Error fetching user usage:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}