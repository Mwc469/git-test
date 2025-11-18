'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api, Recommendation } from '../../lib/api';

const recommendationTypeInfo = {
  BEST_TIME: {
    icon: '⏰',
    color: 'blue',
    title: 'Best Posting Times',
  },
  CONTENT_TYPE: {
    icon: '🎨',
    color: 'purple',
    title: 'Content Type Optimization',
  },
  PLATFORM_FOCUS: {
    icon: '🎯',
    color: 'green',
    title: 'Platform Focus Strategy',
  },
  POSTING_FREQUENCY: {
    icon: '📅',
    color: 'orange',
    title: 'Posting Frequency',
  },
};

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await api.getRecommendations();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.generateRecommendations();
      await loadRecommendations();
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      alert('Failed to generate recommendations');
    } finally {
      setGenerating(false);
    }
  };

  const handleApply = async (id: string) => {
    try {
      await api.applyRecommendation(id);
      setRecommendations(recommendations.map(r =>
        r.id === id ? { ...r, status: 'APPLIED' as const } : r
      ));
    } catch (error) {
      console.error('Failed to apply recommendation:', error);
      alert('Failed to apply recommendation');
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await api.dismissRecommendation(id);
      setRecommendations(recommendations.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to dismiss recommendation:', error);
      alert('Failed to dismiss recommendation');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recommendations...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">AI Recommendations</h1>
            <p className="text-gray-600 mt-2">
              Data-driven insights to optimize your social media strategy
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {generating ? 'Generating...' : '🔄 Regenerate'}
          </button>
        </div>

        {/* Recommendations List */}
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((rec) => {
              const info = recommendationTypeInfo[rec.type];
              return (
                <div key={rec.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className={`p-6 bg-gradient-to-r ${
                    info.color === 'blue' ? 'from-blue-50 to-blue-100' :
                    info.color === 'purple' ? 'from-purple-50 to-purple-100' :
                    info.color === 'green' ? 'from-green-50 to-green-100' :
                    'from-orange-50 to-orange-100'
                  }`}>
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{info.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{rec.title}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-700">
                            {rec.confidence}% confidence
                          </span>
                          <span className="px-2 py-1 bg-green-100 rounded-full text-xs font-medium text-green-700">
                            +{rec.expectedImprovement.toFixed(0)}% improvement
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {rec.description}
                    </p>

                    {/* Suggested Action */}
                    <div className="p-4 bg-gray-50 rounded-lg mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Suggested Action</h4>
                      <div className="text-sm text-gray-600">
                        {rec.type === 'BEST_TIME' && rec.suggestedAction.times && (
                          <p>Schedule posts at: {rec.suggestedAction.times.map((t: string) => {
                            const hour = parseInt(t);
                            const ampm = hour >= 12 ? 'PM' : 'AM';
                            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                            return `${displayHour}${ampm}`;
                          }).join(', ')}</p>
                        )}
                        {rec.type === 'CONTENT_TYPE' && (
                          <p>Create more {rec.suggestedAction.contentType?.toLowerCase()} content</p>
                        )}
                        {rec.type === 'PLATFORM_FOCUS' && (
                          <p>Increase posting frequency on {rec.suggestedAction.platform}</p>
                        )}
                        {rec.type === 'POSTING_FREQUENCY' && (
                          <p>Post {rec.suggestedAction.targetFrequency?.toFixed(1)} times per week</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApply(rec.id)}
                        disabled={rec.status === 'APPLIED'}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {rec.status === 'APPLIED' ? '✓ Applied' : 'Apply'}
                      </button>
                      <button
                        onClick={() => handleDismiss(rec.id)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <span className="text-6xl">💡</span>
            <h3 className="text-xl font-medium text-gray-900 mt-4">No recommendations yet</h3>
            <p className="text-gray-600 mt-2 max-w-md mx-auto">
              We need more data to generate personalized recommendations. Keep publishing posts and we'll analyze your performance to provide insights.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Try Generating Now'}
            </button>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">About AI Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h4 className="font-medium mb-1">⏰ Best Posting Times</h4>
              <p className="text-gray-600">Identifies when your audience is most engaged based on historical performance.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">🎨 Content Type Optimization</h4>
              <p className="text-gray-600">Shows which content types (video, image) perform best for your audience.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">🎯 Platform Focus Strategy</h4>
              <p className="text-gray-600">Recommends which platforms deserve more of your attention.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">📅 Posting Frequency</h4>
              <p className="text-gray-600">Suggests optimal posting frequency for maximum growth.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
