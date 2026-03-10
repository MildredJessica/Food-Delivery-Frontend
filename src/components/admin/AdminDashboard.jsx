import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import ManageUsers from './ManageUsers';
import ManageRestaurants from './ManageRestaurants';
import CreateAdmin from './CreateAdmin';
// import AdminAnalytics from './AdminAnalytics';
// import SystemSettings from './SystemSettings';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchDashboardStats();
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const [usersRes, restaurantsRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:3000/api/admin/stats/users'),
        axios.get('http://localhost:3000/api/admin/stats/restaurants'),
        axios.get('http://localhost:3000/api/admin/stats/orders')
      ]);

      setStats({
        totalUsers: usersRes.data.total || 0,
        totalRestaurants: restaurantsRes.data.total || 0,
        totalOrders: ordersRes.data.total || 0,
        totalRevenue: ordersRes.data.revenue || 0,
        pendingOrders: ordersRes.data.pending || 0,
        recentActivities: ordersRes.data.recent || []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/users', icon: '👥', label: 'Manage Users' },
    { path: '/admin/restaurants', icon: '🏪', label: 'Manage Restaurants' },
    { path: '/admin/create-admin', icon: '👑', label: 'Create Admin' },
    { path: '/admin/analytics', icon: '📈', label: 'Analytics' },
    { path: '/admin/settings', icon: '⚙️', label: 'Settings' }
  ];

  const isActive = (path) => location.pathname === path;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Panel</h2>
            <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
          </div>
          
          <nav className="mt-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 text-sm ${
                  isActive(item.path)
                    ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-500'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Routes>
            <Route index element={<DashboardHome stats={stats} />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="restaurants" element={<ManageRestaurants />} />
            {<Route path="create-admin" element={<CreateAdmin />} />}
            {/* <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<SystemSettings />} /> */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Dashboard Home Component
const DashboardHome = ({ stats }) => {
  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`text-3xl ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon="👥"
          color="text-blue-500"
        />
        <StatCard
          title="Restaurants"
          value={stats.totalRestaurants.toLocaleString()}
          icon="🏪"
          color="text-green-500"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon="📦"
          color="text-orange-500"
        />
        <StatCard
          title="Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon="💰"
          color="text-purple-500"
        />
      </div>

      {/* Pending Orders & Recent Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Orders</h3>
          <div className="text-3xl font-bold text-orange-500 mb-2">{stats.pendingOrders}</div>
          <p className="text-sm text-gray-600">Orders awaiting confirmation</p>
          <Link
            to="/admin/restaurants"
            className="mt-4 inline-block text-sm text-orange-500 hover:text-orange-600"
          >
            View All Orders →
          </Link>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-gray-600">{activity}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent activities</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;