import Link from 'next/link';
import { GlobeAltIcon, CodeBracketIcon, RocketLaunchIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
                <CodeBracketIcon className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold text-gray-900">CloneForge</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/sign-in"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
                <Link
                  href="/subscription"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Choose Plan
                </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Clone Any Website,
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Convert to Any Framework
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Transform any website into modern frameworks like Next.js, React, Vue, WordPress, and more.
            Powered by cutting-edge AI technology for pixel-perfect results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/sign-up"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
              >
                <RocketLaunchIcon className="h-5 w-5" />
                <span>Start Cloning - Free</span>
              </Link>
              <Link
                href="/subscription"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
              >
                <GlobeAltIcon className="h-5 w-5" />
                <span>View Pricing</span>
              </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <SparklesIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Our advanced AI analyzes website structure, design, and functionality to create perfect replicas.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <CodeBracketIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Framework Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Convert to Next.js, React, Vue, WordPress, Laravel, PHP, or static HTML/CSS/JS.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <RocketLaunchIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Production Ready</h3>
              <p className="text-gray-600 leading-relaxed">
                Generated code is clean, optimized, and ready for deployment with modern best practices.
              </p>
            </div>
          </div>

          {/* Pricing Preview */}
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Simple, Transparent Pricing</h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Free</h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">$0</p>
                <p className="text-gray-600">5 clones/month</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Pro</h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">$29</p>
                <p className="text-gray-600">100 clones/month</p>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Premium</h3>
                <p className="text-2xl font-bold text-gray-900 mb-2">$99</p>
                <p className="text-gray-600">Unlimited clones</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg">
                <CodeBracketIcon className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold">CloneForge</span>
            </div>
            <p className="text-gray-400">
              Transform any website into your preferred framework with AI-powered precision.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
