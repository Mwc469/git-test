'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api, AnalyticsSummary } from '../../lib/api';
import { formatNumber, getPlatformColor } from '../../lib/utils';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalyticsSummary(period);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-2">
              Track your performance across all platforms
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2">
            {['7d', '30d', '90d', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                {p === '7d' ? '7 Days' :
                 p === '30d' ? '30 Days' :
                 p === '90d' ? '90 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Posts"
            value={analytics?.totalPosts.toString() || '0'}
            icon="📝"
            color="purple"
          />
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
            title="Avg. Engagement"
            value={`${analytics?.averageEngagementRate.toFixed(1)}%` || '0%'}
            icon="📊"
            color="green"
          />
        </div>

        {/* Platform Breakdown */}
        {analytics?.byPlatform && Object.keys(analytics.byPlatform).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(analytics.byPlatform).map(([platform, stats]: [string, any]) => (
                <div key={platform} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getPlatformColor(platform)}`}></div>
                      <h3 className="text-lg font-bold text-gray-900">{platform}</h3>
                    </div>
                    <span className="text-sm text-gray-500">{stats.posts} posts</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Views</p>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.views)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Likes</p>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.likes)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Engagement</p>
                      <p className="text-2xl font-bold text-green-600">{stats.avgEngagementRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Avg. per Post</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.posts > 0 ? formatNumber(Math.round(stats.views / stats.posts)) : '0'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Posts */}
        {analytics?.topPosts && analytics.topPosts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performing Posts</h2>
            <div className="space-y-4">
              {analytics.topPosts.map((post: any, index: number) => (
                <div key={post.postId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-700">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{post.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatNumber(post.views)} views · {post.engagementRate.toFixed(1)}% engagement
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatNumber(post.views)}</p>
                    <p className="text-xs text-gray-500">views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Engagement Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Total Likes</h3>
            <p className="text-4xl font-bold text-pink-600">
              {formatNumber(analytics?.totalLikes || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Across all platforms and posts
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Total Comments</h3>
            <p className="text-4xl font-bold text-blue-600">
              {formatNumber(analytics?.totalComments || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Community engagement
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Total Shares</h3>
            <p className="text-4xl font-bold text-green-600">
              {formatNumber(analytics?.totalShares || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Content distributed
            </p>
          </div>
        </div>

        {/* Empty State */}
        {(!analytics || analytics.totalPosts === 0) && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <span className="text-6xl">📈</span>
            <h3 className="text-xl font-medium text-gray-900 mt-4">No analytics yet</h3>
            <p className="text-gray-600 mt-2">
              Start publishing posts to see your analytics here
            </p>
          </div>
        )}
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
