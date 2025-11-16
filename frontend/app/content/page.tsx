'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api, Content } from '../../lib/api';
import { formatFileSize, formatDate } from '../../lib/utils';

export default function ContentPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'VIDEO' | 'IMAGE' | 'TEXT'>('ALL');

  useEffect(() => {
    loadContent();
  }, [search, filter]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (search) params.search = search;
      if (filter !== 'ALL') params.contentType = filter;

      const response = await api.getContent(params);
      setContent(response.content);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      await api.deleteContent(id);
      setContent(content.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete content:', error);
      alert('Failed to delete content');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
          <p className="text-gray-600 mt-2">
            Manage your media files imported from Google Drive
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'VIDEO', 'IMAGE', 'TEXT'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading content...</p>
          </div>
        ) : content.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-100 relative">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">
                        {item.contentType === 'VIDEO' ? '🎥' :
                         item.contentType === 'IMAGE' ? '🖼️' : '📄'}
                      </span>
                    </div>
                  )}
                  <span className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded">
                    {item.contentType}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 line-clamp-1 mb-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatFileSize(item.fileSize)}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <span className="text-6xl">📁</span>
            <h3 className="text-xl font-medium text-gray-900 mt-4">No content found</h3>
            <p className="text-gray-600 mt-2">
              Connect your Google Drive in Settings to start importing content
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
