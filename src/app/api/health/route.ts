import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: await checkDatabaseHealth(),
        payment: checkPaymentGatewayHealth(),
        ai: checkAIServiceHealth(),
      }
    };

    // Log health check (only in development)
    if (!env.NODE_ENV || env.NODE_ENV === 'development') {
      logger.debug('Health check performed', { health });
    }

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    logger.error('Health check failed', error as Error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: (error as Error).message
    }, { status: 500 });
  }
}

async function checkDatabaseHealth(): Promise<string> {
  try {
    // Simple database connection check
    // In a real app, you'd perform a lightweight query
    if (!env.DATABASE_URL) {
      return 'not_configured';
    }
    return 'healthy';
  } catch (error) {
    logger.error('Database health check failed', error as Error);
    return 'unhealthy';
  }
}

function checkPaymentGatewayHealth(): string {
  try {
    if (!env.NEXT_PUBLIC_PAYU_KEY || !env.PAYU_SALT) {
      return 'not_configured';
    }
    
    if (env.NEXT_PUBLIC_PAYU_KEY === 'YOUR_PAYU_KEY_HERE') {
      return 'not_configured';
    }
    
    return 'configured';
  } catch (error) {
    return 'error';
  }
}

function checkAIServiceHealth(): string {
  try {
    if (!env.GEMINI_API_KEY) {
      return 'not_configured';
    }
    
    return 'configured';
  } catch (error) {
    return 'error';
  }
}