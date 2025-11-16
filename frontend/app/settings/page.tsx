'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api, SocialAccount } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { getPlatformColor, formatDateTime } from '../../lib/utils';

const platformInfo = {
  YOUTUBE: {
    name: 'YouTube',
    description: 'Upload videos and manage your channel',
    authUrl: '/api/v1/auth/google',
  },
  INSTAGRAM: {
    name: 'Instagram',
    description: 'Post photos, videos, and stories',
    authUrl: '/api/v1/auth/facebook',
  },
  FACEBOOK: {
    name: 'Facebook',
    description: 'Share posts on your Facebook page',
    authUrl: '/api/v1/auth/facebook',
  },
  TIKTOK: {
    name: 'TikTok',
    description: 'Publish videos to TikTok',
    authUrl: '/api/v1/auth/tiktok',
  },
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await api.getSocialAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;

    try {
      await api.disconnectAccount(accountId);
      setAccounts(accounts.filter(a => a.id !== accountId));
    } catch (error) {
      console.error('Failed to disconnect account:', error);
      alert('Failed to disconnect account');
    }
  };

  const handleConnect = (platform: keyof typeof platformInfo) => {
    const info = platformInfo[platform];
    window.location.href = info.authUrl;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account and connected platforms
          </p>
        </div>

        {/* User Profile */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-gray-900">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Connected Accounts</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 text-sm">Loading accounts...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(platformInfo).map(([platform, info]) => {
                const account = accounts.find(a => a.platform === platform);

                return (
                  <div key={platform} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${getPlatformColor(platform)} flex items-center justify-center text-white text-xl font-bold`}>
                          {platform[0]}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{info.name}</h3>
                          <p className="text-sm text-gray-600">{info.description}</p>
                          {account && (
                            <p className="text-xs text-gray-500 mt-1">
                              Connected as @{account.platformUsername}
                              {account.lastUsedAt && (
                                <span> · Last used {formatDateTime(account.lastUsedAt)}</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      {account ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            account.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {account.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleDisconnect(account.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition"
                          >
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConnect(platform as keyof typeof platformInfo)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Google Drive */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Google Drive Integration</h2>
          <p className="text-gray-600 mb-4">
            Connect your Google Drive to automatically import content from designated folders.
          </p>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Google Drive integration is managed through the Google OAuth flow.
              Connect your YouTube account above to also enable Drive access.
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-1">Delete Account</h3>
              <p className="text-sm text-gray-600 mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition">
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* API Information */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">How OAuth Connections Work</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>YouTube:</strong> Connects via Google OAuth. Requires YouTube Data API and Google Drive API permissions.
            </p>
            <p>
              <strong>Instagram & Facebook:</strong> Both use Facebook Login. Connect Facebook to enable both platforms.
            </p>
            <p>
              <strong>TikTok:</strong> Uses TikTok's Content Posting API. Requires approval from TikTok for production use.
            </p>
            <p className="mt-4 text-xs text-gray-500">
              All OAuth tokens are encrypted and stored securely. Your credentials are never exposed.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
