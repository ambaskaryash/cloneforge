# 🚀 CloneForge - Production-Ready Website Cloner SaaS

A powerful, production-ready SaaS application that analyzes any website and generates clones in multiple frameworks including Next.js, React, WordPress, Laravel, PHP, and plain HTML/CSS/JavaScript.

## ✨ Features

### 🎯 **Multi-Framework Support**
- **Next.js 14** with App Router
- **React** with modern hooks  
- **Vue.js 3** with Composition API
- **WordPress** themes
- **Laravel** applications
- **PHP** applications
- **Static HTML/CSS/JavaScript**

### 🔍 **AI-Powered Website Analysis**
- Intelligent website structure detection
- Technology stack identification  
- CSS extraction and optimization
- JavaScript analysis and cleanup
- Screenshot capture for visual comparison
- Responsive design detection

### 💳 **Complete SaaS Platform**
- **Authentication**: Clerk integration
- **Payments**: PayU India integration with UPI, Google Pay, PhonePe
- **Subscriptions**: Free, Pro (₹2400/month), Premium (₹8200/month)
- **Usage tracking** and limits enforcement
- **Project management** dashboard
- **Real-time progress** tracking

### 📦 **Professional Download System**
- ZIP file generation with complete project structure
- Framework-specific setup guides (README.md, SETUP.md)
- Ready-to-deploy configurations
- Build instructions and dependencies

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with Prisma Accelerate
- **Authentication**: Clerk  
- **Payments**: PayU India (UPI, Google Pay, PhonePe)
- **AI**: Google Gemini API
- **Web Scraping**: Puppeteer, Cheerio
- **File Processing**: JSZip
- **Deployment**: Vercel (Production Ready)

---

## 🚀 Quick Start (Production)

### **Prerequisites**
- Node.js 18+
- PostgreSQL database
- Production API keys (see DEPLOYMENT.md)

### **1. Clone & Install**
```bash
git clone https://github.com/yourusername/cloneforge.git
cd cloneforge
npm install
```

### **2. Environment Setup**
Copy `.env.example` to `.env.local` and add your production keys:

```bash
# Required Production Environment Variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_key
CLERK_SECRET_KEY=sk_live_your_clerk_secret
DATABASE_URL=postgresql://your_production_database_url
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_PAYU_KEY=your_payu_production_key
PAYU_SALT=your_payu_production_salt
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### **3. Database Setup**
```bash
npx prisma generate
npx prisma db push
```

### **4. Deploy to Vercel**
```bash
npm run vercel-build  # Production build
# Deploy via Vercel dashboard or CLI
```

---

## 📊 **Production Features**

### **🛡️ Security & Monitoring**
- ✅ Environment variable validation
- ✅ Production logging system
- ✅ Health check endpoint (`/api/health`)
- ✅ Error tracking and reporting
- ✅ Payment attempt/success/failure logging

### **💳 Payment System (PayU India)**
- ✅ UPI payments (Google Pay, PhonePe, all UPI apps)
- ✅ Net Banking (all Indian banks)
- ✅ Credit/Debit cards
- ✅ Digital wallets
- ✅ Secure payment verification with SHA512 hash
- ✅ Indian pricing in ₹ (INR)

### **⚡ Performance Optimizations**  
- ✅ Vercel Edge Functions support
- ✅ Database connection optimization
- ✅ Build-time environment validation
- ✅ Production error handling
- ✅ API response caching

---

## 💼 **Subscription Plans**

| Feature | Free | Pro | Premium |
|---------|------|-----|---------|
| **Price** | ₹0/month | **₹2400/month** | **₹8200/month** |
| **Website Clones** | 5/month | 100/month | Unlimited |
| **Frameworks** | Basic | All 7 frameworks | All + Custom |
| **Support** | Community | Priority | Dedicated |
| **Features** | Basic templates | Advanced + GitHub export | All + API access |

---

## 🚀 **Deployment**

### **Production Deployment to Vercel**

1. **Review**: `PRODUCTION_CHECKLIST.md`
2. **Setup**: Follow `DEPLOYMENT.md` guide  
3. **Deploy**: Push to GitHub → Connect to Vercel
4. **Monitor**: Use `/api/health` endpoint

### **Required Production Keys**
- **Clerk**: Production authentication keys
- **PayU India**: Production payment gateway keys  
- **Google Gemini**: Production AI API key
- **Database**: Production PostgreSQL URL

---

## 🔍 **Monitoring & Health**

### **Health Check**
```bash
curl https://your-domain.vercel.app/api/health
# Returns: {"status":"healthy","services":{"database":"healthy","payment":"configured"}}
```

### **Production Logging**
- Structured logging with log levels
- Payment attempt/success/failure tracking
- API request/response monitoring
- Error reporting with context

---

## 📞 **Support & Documentation**

- **Health Check**: `/api/health`
- **Deployment Guide**: `DEPLOYMENT.md`  
- **Production Checklist**: `PRODUCTION_CHECKLIST.md`
- **PayU Setup**: `PAYU_SETUP.md`
- **Issues**: GitHub Issues

---

**🎉 CloneForge is production-ready and deployed! Start cloning websites with AI-powered precision! 🚀🇮🇳**

*Built with ❤️ using Next.js 15, PayU India, and modern web technologies.*
