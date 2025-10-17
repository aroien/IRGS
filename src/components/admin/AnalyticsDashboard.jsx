// src/components/admin/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';

const StatCard = ({ title, value, change, changeType, icon, color, gradient, chartData }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (value !== undefined) {
      const timer = setTimeout(() => {
        setAnimatedValue(value);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            {typeof animatedValue === 'number' ? animatedValue.toLocaleString() : animatedValue}
          </p>
          {change && (
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                changeType === 'positive' 
                  ? 'bg-green-100 text-green-700' 
                  : changeType === 'negative'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {changeType === 'positive' ? '↗' : changeType === 'negative' ? '↘' : '→'} {change}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <span className="text-2xl text-white">{icon}</span>
        </div>
      </div>
      
      {/* Mini Chart */}
      {chartData && (
        <div className="mt-4 flex items-end justify-between space-x-1 h-12">
          {chartData.map((value, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center"
            >
              <div
                className={`w-full rounded-t-sm transition-all duration-500 ${color} hover:opacity-80`}
                style={{ height: `${(value / Math.max(...chartData)) * 100}%` }}
              ></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Mock data
  const statsData = {
    totalUsers: { value: 1234, change: '+12.4%', changeType: 'positive' },
    activeUsers: { value: 567, change: '+5.2%', changeType: 'positive' },
    pageViews: { value: 8901, change: '+18.7%', changeType: 'positive' },
    conversionRate: { value: 24.5, change: '+2.1%', changeType: 'positive' },
    bounceRate: { value: 32.8, change: '-1.3%', changeType: 'negative' },
    avgSession: { value: 4.2, change: '+0.3%', changeType: 'positive' },
    revenue: { value: 12560, change: '+8.9%', changeType: 'positive' },
    coursesCompleted: { value: 342, change: '+15.2%', changeType: 'positive' }
  };

  const chartData = {
    totalUsers: [65, 78, 90, 81, 56, 55, 40, 65, 78, 90, 81, 56],
    activeUsers: [45, 52, 68, 59, 42, 45, 35, 45, 52, 68, 59, 42],
    pageViews: [120, 145, 178, 165, 142, 130, 115, 120, 145, 178, 165, 142],
    conversionRate: [22, 24, 26, 25, 23, 24, 22, 22, 24, 26, 25, 23]
  };

  const metrics = [
    {
      title: "Total Users",
      value: statsData.totalUsers.value,
      change: statsData.totalUsers.change,
      changeType: statsData.totalUsers.changeType,
      icon: "👥",
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-600",
      color: "bg-blue-400",
      chartData: chartData.totalUsers
    },
    {
      title: "Active Users",
      value: statsData.activeUsers.value,
      change: statsData.activeUsers.change,
      changeType: statsData.activeUsers.changeType,
      icon: "🔥",
      gradient: "bg-gradient-to-br from-green-500 to-emerald-600",
      color: "bg-green-400",
      chartData: chartData.activeUsers
    },
    {
      title: "Page Views",
      value: statsData.pageViews.value,
      change: statsData.pageViews.change,
      changeType: statsData.pageViews.changeType,
      icon: "👀",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
      color: "bg-purple-400",
      chartData: chartData.pageViews
    },
    {
      title: "Conversion Rate",
      value: `${statsData.conversionRate.value}%`,
      change: statsData.conversionRate.change,
      changeType: statsData.conversionRate.changeType,
      icon: "📈",
      gradient: "bg-gradient-to-br from-orange-500 to-red-600",
      color: "bg-orange-400",
      chartData: chartData.conversionRate
    },
    {
      title: "Avg. Session",
      value: `${statsData.avgSession.value}m`,
      change: statsData.avgSession.change,
      changeType: statsData.avgSession.changeType,
      icon: "⏱️",
      gradient: "bg-gradient-to-br from-indigo-500 to-blue-600",
      color: "bg-indigo-400"
    },
    {
      title: "Revenue",
      value: `$${statsData.revenue.value.toLocaleString()}`,
      change: statsData.revenue.change,
      changeType: statsData.revenue.changeType,
      icon: "💰",
      gradient: "bg-gradient-to-br from-teal-500 to-green-600",
      color: "bg-teal-400"
    },
    {
      title: "Bounce Rate",
      value: `${statsData.bounceRate.value}%`,
      change: statsData.bounceRate.change,
      changeType: statsData.bounceRate.changeType,
      icon: "🎯",
      gradient: "bg-gradient-to-br from-gray-500 to-gray-600",
      color: "bg-gray-400"
    },
    {
      title: "Courses Completed",
      value: statsData.coursesCompleted.value,
      change: statsData.coursesCompleted.change,
      changeType: statsData.coursesCompleted.changeType,
      icon: "🏆",
      gradient: "bg-gradient-to-br from-yellow-500 to-amber-600",
      color: "bg-yellow-400"
    }
  ];

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 p-6 rounded-2xl h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-br from-gray-800 to-indigo-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Real-time insights and performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="flex bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 p-1">
              {['day', 'week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all duration-200 ${
                    timeRange === range
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <button className="bg-white/80 backdrop-blur-sm hover:bg-white border border-white/20 text-gray-700 px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg flex items-center space-x-2">
              <span>📊</span>
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.slice(0, 4).map((metric, index) => (
            <StatCard key={index} {...metric} />
          ))}
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.slice(4, 8).map((metric, index) => (
            <StatCard key={index} {...metric} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* User Acquisition Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">User Acquisition</h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">New Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Returning</span>
                </div>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {[65, 78, 90, 81, 56, 55, 40].map((value, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="flex items-end space-x-1 w-full justify-center h-48">
                    <div 
                      className="w-4 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-500 hover:opacity-80"
                      style={{ height: `${(value / 100) * 100}%` }}
                    ></div>
                    <div 
                      className="w-4 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg transition-all duration-500 hover:opacity-80"
                      style={{ height: `${((value - 20) / 100) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Traffic Sources</h3>
            <div className="space-y-4">
              {[
                { source: 'Direct', percentage: 45, color: 'bg-blue-500' },
                { source: 'Organic Search', percentage: 30, color: 'bg-green-500' },
                { source: 'Social Media', percentage: 15, color: 'bg-purple-500' },
                { source: 'Email', percentage: 10, color: 'bg-orange-500' }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{item.source}</span>
                    <span className="text-sm text-gray-600">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.color} transition-all duration-1000`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🚀', text: 'Peak traffic hours: 2-4 PM', color: 'text-blue-600' },
              { icon: '📱', text: 'Mobile users increased by 25%', color: 'text-green-600' },
              { icon: '🎯', text: 'Conversion optimized landing pages', color: 'text-purple-600' },
              { icon: '👥', text: 'Social referrals up by 18%', color: 'text-orange-600' },
              { icon: '💰', text: 'Revenue growth steady at 8.9%', color: 'text-teal-600' },
              { icon: '📚', text: 'Course completion rates improved', color: 'text-indigo-600' }
            ].map((insight, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-lg">
                <span className="text-2xl">{insight.icon}</span>
                <span className={`text-sm font-medium ${insight.color}`}>{insight.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;