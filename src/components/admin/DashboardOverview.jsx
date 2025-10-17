// src/components/admin/DashboardOverview.jsx
import { Link } from "react-router-dom";

const StatCard = ({ title, value, icon, change, changeType, color, gradient }) => (
  <div className="group relative">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {value || 0}
          </p>
          {change && (
            <div className="flex items-center mt-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                changeType === 'positive' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {changeType === 'positive' ? '↗' : '↘'} {change}
              </span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl ${gradient} shadow-lg`}>
          <span className="text-2xl text-white">{icon}</span>
        </div>
      </div>
    </div>
  </div>
);

const DashboardOverview = ({ stats = {}, recentUsers = [] }) => {
  // Ensure stats has default values
  const safeStats = {
    totalUsers: stats?.totalUsers || 0,
    totalCourses: stats?.totalCourses || 0,
    totalCertificates: stats?.totalCertificates || 0,
    activeUsers: stats?.activeUsers || 0,
    totalInstructors: stats?.totalInstructors || 0,
    pendingEnrollments: stats?.pendingEnrollments || 0,
    revenue: stats?.revenue || 0
  };

  const quickActions = [
    { 
      title: "Create Course", 
      icon: "📚", 
      path: "#", 
      gradient: "bg-gradient-to-br from-indigo-500 to-purple-600",
      description: "Add new course content"
    },
    { 
      title: "Manage Users", 
      icon: "👥", 
      path: "#", 
      gradient: "bg-gradient-to-br from-green-500 to-emerald-600",
      description: "View and manage users"
    },
    { 
      title: "Certificates", 
      icon: "🏆", 
      path: "#", 
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
      description: "Issue certificates"
    },
    { 
      title: "Announcements", 
      icon: "📢", 
      path: "#", 
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-600",
      description: "Post updates"
    },
  ];

  const chartData = [
    { day: "Mon", users: 65, courses: 45 },
    { day: "Tue", users: 78, courses: 52 },
    { day: "Wed", users: 90, courses: 68 },
    { day: "Thu", users: 81, courses: 59 },
    { day: "Fri", users: 56, courses: 42 },
    { day: "Sat", users: 35, courses: 28 },
    { day: "Sun", users: 48, courses: 32 },
  ];

  const maxValue = Math.max(...chartData.map(d => Math.max(d.users, d.courses)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-br from-gray-800 to-indigo-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
            📅 Last updated: {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <button className="bg-white/80 backdrop-blur-sm hover:bg-white border border-white/20 text-gray-700 px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg">
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={safeStats.totalUsers.toLocaleString()}
          icon="👥"
          change="+12% from last month"
          changeType="positive"
          gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
        />
        <StatCard
          title="Total Courses"
          value={safeStats.totalCourses.toLocaleString()}
          icon="📚"
          change="+5 new this week"
          changeType="positive"
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
        />
        <StatCard
          title="Certificates Issued"
          value={safeStats.totalCertificates.toLocaleString()}
          icon="🏆"
          change="+8 issued today"
          changeType="positive"
          gradient="bg-gradient-to-br from-purple-500 to-pink-600"
        />
        <StatCard
          title="Active Instructors"
          value={safeStats.totalInstructors.toLocaleString()}
          icon="👨‍🏫"
          change="All active"
          changeType="positive"
          gradient="bg-gradient-to-br from-orange-500 to-red-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions & Activity Chart */}
        <div className="xl:col-span-2 space-y-8">
          {/* Activity Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Weekly Activity</h3>
              <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
              </select>
            </div>
            <div className="flex items-end justify-between h-48 space-x-2">
              {chartData.map((data, index) => (
                <div key={data.day} className="flex flex-col items-center flex-1 space-y-2">
                  <div className="text-xs text-gray-500">{data.day}</div>
                  <div className="flex items-end space-x-1 w-full justify-center h-32">
                    <div 
                      className="w-3 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-500 hover:opacity-80"
                      style={{ height: `${(data.users / maxValue) * 100}%` }}
                    ></div>
                    <div 
                      className="w-3 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg transition-all duration-500 hover:opacity-80"
                      style={{ height: `${(data.courses / maxValue) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    <div>Users: {data.users}</div>
                    <div>Courses: {data.courses}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded"></div>
                <span className="text-sm text-gray-600">Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-400 rounded"></div>
                <span className="text-sm text-gray-600">Courses</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.path}
                  className="group p-4 rounded-xl border border-gray-100 hover:border-transparent bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${action.gradient} rounded-xl flex items-center justify-center text-white text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 group-hover:text-gray-900">
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                    </div>
                    <div className="text-gray-300 group-hover:text-indigo-500 transition-colors duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Recent Users */}
        <div className="space-y-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Recent Users</h3>
              <Link 
                to="/admin/users" 
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="space-y-4">
              {recentUsers.slice(0, 6).map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg">
                        {user.displayName?.charAt(0) || "U"}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-gray-900">
                        {user.displayName || "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-600 truncate max-w-[120px]">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status || 'active'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{user.role || 'student'}</p>
                  </div>
                </div>
              ))}
              
              {recentUsers.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <p className="text-gray-500">No users found</p>
                  <p className="text-sm text-gray-400 mt-1">Users will appear here once registered</p>
                </div>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">System Status</h3>
            <div className="space-y-3">
              {[
                { name: "Server", status: "operational", icon: "🖥️" },
                { name: "Database", status: "operational", icon: "💾" },
                { name: "API", status: "degraded", icon: "🔗" },
                { name: "CDN", status: "operational", icon: "🌐" },
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{service.icon}</span>
                    <span className="font-medium text-gray-700">{service.name}</span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    service.status === 'operational' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;