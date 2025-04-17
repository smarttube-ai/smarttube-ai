import React from 'react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Eye,
  Clock,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Activity,
} from 'lucide-react';

interface AnalyticsData {
  dailyData: Array<{
    date: string;
    views: number;
    watchTime: number;
    avgViewDuration: number;
    likes: number;
    comments: number;
  }>;
  totals: {
    views: number;
    watchTime: number;
    avgViewDuration: number;
    likes: number;
    comments: number;
  };
}

interface Props {
  analytics: AnalyticsData;
}

export default function VideoAnalytics({ analytics }: Props) {
  if (!analytics) return null;

  const { dailyData, totals } = analytics;

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const metrics = [
    {
      title: 'Total Views',
      value: totals.views.toLocaleString(),
      icon: Eye,
      color: 'text-blue-500',
    },
    {
      title: 'Watch Time',
      value: formatMinutes(totals.watchTime),
      icon: Clock,
      color: 'text-green-500',
    },
    {
      title: 'Avg. View Duration',
      value: formatDuration(totals.avgViewDuration),
      icon: Activity,
      color: 'text-purple-500',
    },
    {
      title: 'Total Likes',
      value: totals.likes.toLocaleString(),
      icon: ThumbsUp,
      color: 'text-red-500',
    },
    {
      title: 'Total Comments',
      value: totals.comments.toLocaleString(),
      icon: MessageSquare,
      color: 'text-yellow-500',
    },
    {
      title: 'Engagement Rate',
      value: `${((totals.likes + totals.comments) / totals.views * 100).toFixed(2)}%`,
      icon: TrendingUp,
      color: 'text-indigo-500',
    },
  ];

  const chartData = dailyData.map(day => ({
    ...day,
    date: format(new Date(day.date), 'MMM dd'),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <span>{metric.title}</span>
            </div>
            <span className="text-xl font-semibold">{metric.value}</span>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-6">Performance Over Time</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#3b82f6"
                name="Views"
              />
              <Line
                type="monotone"
                dataKey="likes"
                stroke="#ef4444"
                name="Likes"
              />
              <Line
                type="monotone"
                dataKey="comments"
                stroke="#eab308"
                name="Comments"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-6">Watch Time Trends</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="watchTime"
                  stroke="#22c55e"
                  name="Watch Time (minutes)"
                />
                <Line
                  type="monotone"
                  dataKey="avgViewDuration"
                  stroke="#a855f7"
                  name="Avg. View Duration (seconds)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-6">Engagement Analysis</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="likes"
                  stroke="#ef4444"
                  name="Likes"
                />
                <Line
                  type="monotone"
                  dataKey="comments"
                  stroke="#eab308"
                  name="Comments"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}