'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Unmotivated Hero
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Automate your social media presence across YouTube, Instagram, Facebook, and TikTok
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-8 py-3 rounded-lg font-semibold border border-gray-300 dark:border-gray-600 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Multi-Platform</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Manage YouTube, Instagram, Facebook, and TikTok from one dashboard
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Smart Scheduling</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Schedule posts across all platforms with intelligent timing recommendations
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Analytics</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track engagement, reach, and performance across all your social accounts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
