// src/pages/admin/AnalyticsDashboard.jsx
import { useState, useEffect } from "react";

const AnalyticsDashboard = ({ stats, users, courses }) => {
  const [timeRange, setTimeRange] = useState("month");
  const [chartData, setChartData] = useState({});

  // Mock analytics data - replace with real data from your database
  const mockAnalytics = {
    userGrowth: [65, 78, 90, 110, 145, 178, 210, 245, 278, 300, 325, 350],
    courseEnrollments: [120, 150, 180, 210, 240, 280, 320, 360, 400, 450, 500, 550],
    revenue: [1200, 1500, 1800, 2100, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000],
    completionRates: [75, 78, 82, 85, 80, 83, 87, 85, 88, 90, 87, 92]
  };

  useEffect(() => {
    // Simulate loading analytics data
    setChartData(mockAnalytics);
  }, [timeRange]);

  const StatCard = ({ title, value, change, changeType, icon }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  const ChartPlaceholder = ({ title, data }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>Chart visualization for {title}</p>
          <p className="text-sm mt-2">Data points: {data?.length || 0}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights and performance metrics</p>
        </div>
        <div className="mt-4 lg:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats.revenue || 0}`}
          change="+12.5% from last month"
          changeType="positive"
          icon="💰"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          change="+8% from last month"
          changeType="positive"
          icon="👥"
        />
        <StatCard
          title="Course Completion"
          value="85%"
          change="+5% from last month"
          changeType="positive"
          icon="✅"
        />
        <StatCard
          title="Avg. Session"
          value="24m"
          change="+2m from last month"
          changeType="positive"
          icon="⏱️"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPlaceholder title="User Growth" data={chartData.userGrowth} />
        <ChartPlaceholder title="Course Enrollments" data={chartData.courseEnrollments} />
        <ChartPlaceholder title="Revenue Trends" data={chartData.revenue} />
        <ChartPlaceholder title="Completion Rates" data={chartData.completionRates} />
      </div>

      {/* Recent Activity & Top Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {users.slice(0, 5).map((user, index) => (
              <div key={user.id} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.displayName?.charAt(0) || "U"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{user.displayName || "Unknown User"}</p>
                  <p className="text-sm text-gray-600">Joined the platform</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Top Performing Courses</h3>
          <div className="space-y-4">
            {courses.slice(0, 5).map((course, index) => (
              <div key={course.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                    📚
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{course.title}</p>
                    <p className="text-sm text-gray-600">{course.students || 0} students</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    {Math.floor(Math.random() * 50) + 50}%
                  </span>
                  <p className="text-sm text-gray-500 mt-1">Completion</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;