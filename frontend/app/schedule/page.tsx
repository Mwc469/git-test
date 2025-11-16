'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api, Post, Content, SocialAccount } from '../../lib/api';
import { formatDateTime, getStatusColor, getPlatformColor } from '../../lib/utils';

export default function SchedulePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED'>('ALL');

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (filter !== 'ALL') params.status = filter;

      const response = await api.getPosts(params);
      setPosts(response.posts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.deletePost(id);
      setPosts(posts.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
            <p className="text-gray-600 mt-2">
              Manage your scheduled and published posts
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            + Create Post
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['ALL', 'SCHEDULED', 'PUBLISHED', 'FAILED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex gap-6">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      {post.content.thumbnailUrl ? (
                        <img
                          src={post.content.thumbnailUrl}
                          alt={post.content.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-3xl">
                            {post.content.contentType === 'VIDEO' ? '🎥' : '🖼️'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">{post.content.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{post.caption}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)} text-white`}>
                        {post.status}
                      </span>
                    </div>

                    {/* Platforms */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.platforms.map((platform) => (
                        <div
                          key={platform.id}
                          className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-xs"
                        >
                          <span className={`w-2 h-2 rounded-full ${getPlatformColor(platform.platform)}`}></span>
                          <span className="font-medium">{platform.platform}</span>
                          <span className="text-gray-500">@{platform.socialAccount.platformUsername}</span>
                          {platform.platformUrl && (
                            <a
                              href={platform.platformUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {post.status === 'SCHEDULED' ? (
                          <span>Scheduled for {formatDateTime(post.scheduledFor)}</span>
                        ) : post.publishedAt ? (
                          <span>Published {formatDateTime(post.publishedAt)}</span>
                        ) : (
                          <span>Created {formatDateTime(post.createdAt)}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {post.status === 'PUBLISHED' && (
                          <a
                            href={`/analytics?postId=${post.id}`}
                            className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            View Analytics
                          </a>
                        )}
                        {(post.status === 'SCHEDULED' || post.status === 'DRAFT') && (
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <span className="text-6xl">📅</span>
            <h3 className="text-xl font-medium text-gray-900 mt-4">No posts found</h3>
            <p className="text-gray-600 mt-2">
              Create your first post to get started!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Create Post
            </button>
          </div>
        )}

        {/* Create Post Modal */}
        {showCreateModal && (
          <CreatePostModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadPosts();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function CreatePostModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [content, setContent] = useState<Content[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedContent, setSelectedContent] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [contentData, accountsData] = await Promise.all([
        api.getContent({ limit: 100 }),
        api.getSocialAccounts(),
      ]);
      setContent(contentData.content);
      setAccounts(accountsData.filter(a => a.isActive));
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createPost({
        contentId: selectedContent,
        caption,
        scheduledFor,
        socialAccountIds: selectedAccounts,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create Post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Content
            </label>
            <select
              required
              value={selectedContent}
              onChange={(e) => setSelectedContent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose content...</option>
              {content.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.contentType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption
            </label>
            <textarea
              required
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Write your caption here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platforms
            </label>
            <div className="space-y-2">
              {accounts.map((account) => (
                <label key={account.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={selectedAccounts.includes(account.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAccounts([...selectedAccounts, account.id]);
                      } else {
                        setSelectedAccounts(selectedAccounts.filter(id => id !== account.id));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="font-medium">{account.platform}</span>
                  <span className="text-gray-500 text-sm">@{account.platformUsername}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule For
            </label>
            <input
              type="datetime-local"
              required
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedAccounts.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
