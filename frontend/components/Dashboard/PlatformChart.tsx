'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PlatformChartProps {
  data: Array<{
    platform: string;
    posts: number;
    views: number;
    engagement: number;
  }>;
}

export default function PlatformChart({ data }: PlatformChartProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Platform Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
          <XAxis
            dataKey="platform"
            className="text-xs"
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: '#6b7280' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem'
            }}
          />
          <Legend />
          <Bar dataKey="posts" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          <Bar dataKey="views" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
