'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api, AnalyticsSummary, Post, Recommendation } from '../../lib/api';
import { formatNumber } from '../../lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [analyticsData, postsData, recsData] = await Promise.all([
          api.getAnalyticsSummary('30d'),
          api.getPosts({ limit: 5 }),
          api.getRecommendations(),
        ]);

        setAnalytics(analyticsData);
        setRecentPosts(postsData.posts);
        setRecommendations(recsData.recommendations.slice(0, 3));
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your social media.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/connect"
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all hover:scale-105"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-4xl mb-3">🔗</div>
                <h3 className="text-xl font-bold mb-2">Connect Accounts</h3>
                <p className="text-blue-100 text-sm">
                  Link your social media accounts to start automating your posts
                </p>
              </div>
              <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/schedule"
            className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Schedule Post</h3>
                <p className="text-gray-600 text-sm">
                  Create and schedule your next social media post
                </p>
              </div>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/content"
            className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-4xl mb-3">📁</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Content</h3>
                <p className="text-gray-600 text-sm">
                  Upload and organize your media files
                </p>
              </div>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Views"
            value={formatNumber(analytics?.totalViews || 0)}
            icon="👁️"
            color="blue"
          />
          <StatCard
            title="Total Likes"
            value={formatNumber(analytics?.totalLikes || 0)}
            icon="❤️"
            color="pink"
          />
          <StatCard
            title="Engagement Rate"
            value={`${analytics?.averageEngagementRate.toFixed(1)}%` || '0%'}
            icon="📊"
            color="green"
          />
          <StatCard
            title="Total Posts"
            value={analytics?.totalPosts.toString() || '0'}
            icon="📝"
            color="purple"
          />
        </div>

        {/* Platform Performance */}
        {analytics?.byPlatform && Object.keys(analytics.byPlatform).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(analytics.byPlatform).map(([platform, stats]: [string, any]) => (
                <div key={platform} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{platform}</span>
                    <span className="text-sm text-gray-500">{stats.posts} posts</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.views)}</div>
                    <div className="text-sm text-gray-500">views</div>
                    <div className="text-sm font-medium text-green-600">
                      {stats.avgEngagementRate.toFixed(1)}% engagement
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Posts */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Posts</h2>
              <Link href="/schedule" className="text-sm text-blue-600 hover:text-blue-700">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {post.caption}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {post.platforms.length} platform{post.platforms.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                        post.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No posts yet. Create your first post!
                </p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">AI Recommendations</h2>
              <Link href="/recommendations" className="text-sm text-blue-600 hover:text-blue-700">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <div key={rec.id} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{rec.title}</h3>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{rec.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-medium text-blue-700">
                            {rec.confidence}% confidence
                          </span>
                          <span className="text-xs text-gray-500">
                            +{rec.expectedImprovement.toFixed(0)}% improvement
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  Not enough data yet. Keep posting to get personalized recommendations!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    pink: 'bg-pink-50 text-pink-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
  }[color];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`text-4xl ${colorClasses} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
