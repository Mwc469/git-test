'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your connection...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get OAuth data from URL parameters
        const provider = searchParams.get('provider');
        const platform = searchParams.get('platform');
        const accountId = searchParams.get('accountId');
        const accountName = searchParams.get('accountName');
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');

        // Check for errors from backend
        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error.replace(/_/g, ' ')}`);
          setTimeout(() => router.push('/connect'), 3000);
          return;
        }

        // Validate required parameters
        if (!platform || !accountId || !accountName || !accessToken) {
          setStatus('error');
          setMessage('Invalid OAuth callback data');
          setTimeout(() => router.push('/connect'), 3000);
          return;
        }

        // Call backend to save the social account
        await api.post('/social/connect', {
          platform,
          accountId,
          accountName,
          accessToken,
          refreshToken: refreshToken || undefined,
        });

        setStatus('success');
        setMessage(`Successfully connected your ${provider} account!`);

        // Redirect to connect page after 2 seconds
        setTimeout(() => router.push('/connect'), 2000);
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage('Failed to save account connection. Please try again.');
        setTimeout(() => router.push('/connect'), 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Connecting Account</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Success!</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting back to your accounts...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Connection Failed</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting back...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
            <p className="text-gray-600">Preparing OAuth callback</p>
          </div>
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
