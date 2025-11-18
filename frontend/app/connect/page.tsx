'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, SocialAccount } from '../../lib/api';

const platforms = [
  {
    id: 'YOUTUBE',
    name: 'YouTube',
    icon: '📺',
    color: 'bg-red-600',
    hoverColor: 'hover:bg-red-700',
    description: 'Upload videos and track performance',
    oauthUrl: '/api/v1/auth/google',
  },
  {
    id: 'INSTAGRAM',
    name: 'Instagram',
    icon: '📸',
    color: 'bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500',
    hoverColor: 'hover:from-purple-700 hover:via-pink-700 hover:to-orange-600',
    description: 'Share posts, reels, and stories',
    oauthUrl: '/api/v1/auth/facebook', // Instagram uses Facebook OAuth
  },
  {
    id: 'FACEBOOK',
    name: 'Facebook',
    icon: '👥',
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    description: 'Post to your pages and groups',
    oauthUrl: '/api/v1/auth/facebook',
  },
  {
    id: 'TIKTOK',
    name: 'TikTok',
    icon: '🎵',
    color: 'bg-black',
    hoverColor: 'hover:bg-gray-900',
    description: 'Share short-form videos',
    oauthUrl: '/api/v1/auth/tiktok',
  },
];

export default function ConnectAccountsPage() {
  const router = useRouter();
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      const accounts = await api.getSocialAccounts();
      setConnectedAccounts(accounts);
    } catch (error) {
      console.error('Failed to load connected accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const isConnected = (platformId: string) => {
    return connectedAccounts.some(
      (account) => account.platform === platformId && account.isActive
    );
  };

  const getConnectedAccount = (platformId: string) => {
    return connectedAccounts.find(
      (account) => account.platform === platformId && account.isActive
    );
  };

  const handleConnect = async (platform: typeof platforms[0]) => {
    setConnectingPlatform(platform.id);

    // Get the backend URL from environment or default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    const oauthUrl = `${apiUrl.replace('/api/v1', '')}${platform.oauthUrl}`;

    // Redirect to OAuth flow
    window.location.href = oauthUrl;
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) {
      return;
    }

    try {
      await api.disconnectAccount(accountId);
      await loadConnectedAccounts();
    } catch (error) {
      console.error('Failed to disconnect account:', error);
      alert('Failed to disconnect account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Connect Your Accounts
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Link your social media accounts to start automating your posts
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🔗</div>
            <div>
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Connected Accounts: {connectedAccounts.length} / {platforms.length}
              </h2>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Connect at least one platform to start scheduling posts. The more platforms you connect,
                the wider your reach!
              </p>
            </div>
          </div>
        </div>

        {/* Platform Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {platforms.map((platform) => {
            const connected = isConnected(platform.id);
            const account = getConnectedAccount(platform.id);
            const isConnecting = connectingPlatform === platform.id;

            return (
              <div
                key={platform.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-transform hover:scale-105"
              >
                {/* Platform Header */}
                <div className={`${platform.color} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{platform.icon}</div>
                      <div>
                        <h3 className="text-2xl font-bold">{platform.name}</h3>
                        <p className="text-white/90 text-sm mt-1">
                          {platform.description}
                        </p>
                      </div>
                    </div>
                    {connected && (
                      <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                        ✓ Connected
                      </div>
                    )}
                  </div>
                </div>

                {/* Platform Body */}
                <div className="p-6">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">Loading...</p>
                    </div>
                  ) : connected && account ? (
                    <div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Connected as
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white text-lg">
                              {account.accountName}
                            </p>
                          </div>
                          <div className="text-green-500 text-2xl">✓</div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Connected on {new Date(account.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleDisconnect(account.id)}
                          className="flex-1 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                          Disconnect
                        </button>
                        <button
                          onClick={() => handleConnect(platform)}
                          className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Reconnect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          What you can do:
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>Schedule and publish posts automatically</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>Track performance and analytics</span>
                          </li>
                          <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>Get AI-powered recommendations</span>
                          </li>
                        </ul>
                      </div>

                      <button
                        onClick={() => handleConnect(platform)}
                        disabled={isConnecting}
                        className={`w-full px-6 py-4 ${platform.color} ${platform.hoverColor} text-white rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
                      >
                        {isConnecting ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full"></div>
                            Connecting...
                          </span>
                        ) : (
                          `Connect ${platform.name}`
                        )}
                      </button>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                        Secure OAuth authentication • We never see your password
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Need Help Connecting?
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Why connect your accounts?
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Post to multiple platforms at once</li>
                <li>• Schedule content in advance</li>
                <li>• Track all your analytics in one place</li>
                <li>• Get AI recommendations for best posting times</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is it secure?
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• We use official OAuth - we never see your password</li>
                <li>• Your tokens are encrypted in our database</li>
                <li>• You can disconnect anytime</li>
                <li>• We only request necessary permissions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
