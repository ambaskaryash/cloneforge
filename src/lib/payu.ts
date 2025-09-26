import crypto from 'crypto';

// PayU India configuration - Load environment variables directly
export const PAYU_CONFIG = {
  key: process.env.NEXT_PUBLIC_PAYU_KEY || 'YOUR_PAYU_KEY_HERE',
  salt: process.env.PAYU_SALT || 'YOUR_PAYU_SALT_HERE',
  endpoint: process.env.PAYU_ENVIRONMENT === 'production'
    ? 'https://secure.payu.in/_payment'
    : 'https://test.payu.in/_payment',
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success`,
  failureUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/failure`,
};

// Generate PayU hash for security
export const generatePayUHash = (data: Record<string, string>): string => {
  const { key, txnid, amount, productinfo, firstname, email } = data;
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_CONFIG.salt}`;
  return crypto.createHash('sha512').update(hashString).digest('hex');
};

// Verify PayU response hash
export const verifyPayUHash = (data: Record<string, string>): boolean => {
  const { status, key, txnid, amount, productinfo, firstname, email, hash } = data;
  const hashString = `${PAYU_CONFIG.salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  const generatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
  return generatedHash === hash;
};

// Plan configurations with Indian pricing
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    currency: 'INR',
    clones: 5,
    features: [
      '5 website clones per month',
      'Basic frameworks (HTML/CSS/JS)',
      'Community support',
      'Basic templates',
    ],
    payuPlanId: null,
  },
  pro: {
    name: 'Pro',
    price: 2400, // ₹2400/month (roughly $29)
    currency: 'INR',
    clones: 100,
    features: [
      '100 website clones per month',
      'All frameworks (Next.js, React, Vue, etc.)',
      'Priority support',
      'Advanced templates',
      'Code optimization',
      'Export to GitHub',
    ],
    payuPlanId: 'pro_monthly_2400',
  },
  premium: {
    name: 'Premium',
    price: 8200, // ₹8200/month (roughly $99)
    currency: 'INR',
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
    payuPlanId: 'premium_monthly_8200',
  },
};

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

// PayU payment data interface
export interface PayUPaymentData {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone?: string;
  surl: string;
  furl: string;
  hash: string;
  service_provider?: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}
