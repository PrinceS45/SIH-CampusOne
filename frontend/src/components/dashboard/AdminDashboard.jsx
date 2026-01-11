import {
  BookOpenIcon,
  BuildingIcon,
  CalendarIcon,
  CreditCardIcon,
  TrendingUpIcon,
  UsersIcon
} from 'lucide-react';
import { useEffect } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import useDashboardStore from '../../stores/dashboardStore';
import Loader from '../common/Loader';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminDashboard = () => {
  const { stats, upcomingFees, recentActivities, loading, getDashboardStats, getUpcomingFees, getRecentActivities } = useDashboardStore();

  useEffect(() => {
    getDashboardStats();
    getUpcomingFees();
    getRecentActivities();
  }, [getDashboardStats, getUpcomingFees, getRecentActivities]);

  if (loading) return <Loader />;

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.students?.totalStudents || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats?.fees?.totalRevenue || 0).toLocaleString()}`,
      icon: CreditCardIcon,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Hostel Occupancy',
      value: `${stats?.hostels?.occupiedRooms || 0}/${stats?.hostels?.totalRooms || 0}`,
      icon: BuildingIcon,
      color: 'bg-purple-500',
      change: '+5%'
    },
    {
      title: 'Exam Records',
      value: (recentActivities?.exams?.length || 0) + ' recent',
      icon: BookOpenIcon,
      color: 'bg-orange-500',
      change: '+15%'
    }
  ];

  const feeData = stats?.feeCollectionByMonth?.map((amount, index) => ({
    name: new Date(2023, index).toLocaleString('default', { month: 'short' }),
    amount: amount
  })) || [];

  const courseData = stats?.courseDistribution?.map((course, index) => ({
    name: course._id,
    value: course.count,
    color: COLORS[index % COLORS.length]
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">NextGen Student Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${card.color} bg-opacity-10`}>
                <card.icon className={`h-6 w-6 ${card.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUpIcon className="h-4 w-4 mr-1" />
                  {card.change}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Collection Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Collection (2026)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={feeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Course Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={courseData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {courseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Upcoming Fees & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Fees */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Upcoming Fee Due Dates
          </h3>
          <div className="space-y-3">
            {upcomingFees.slice(0, 5).map((fee) => (
              <div key={fee._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{fee.student?.firstName} {fee.student?.lastName}</p>
                  <p className="text-sm text-gray-600">{fee.student?.studentId}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{fee.amount}</p>
                  <p className="text-sm text-gray-600">
                    Due: {new Date(fee.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {upcomingFees.length === 0 && (
              <p className="text-gray-500 text-center py-4">No upcoming fee due dates</p>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">New Students</h4>
              <div className="space-y-2">
                {recentActivities.students?.slice(0, 3).map((student) => (
                  <div key={student._id} className="flex items-center text-sm">
                    <UsersIcon className="h-4 w-4 text-green-500 mr-2" />
                    <span>{student.firstName} {student.lastName}</span>
                    <span className="text-gray-500 ml-2">joined</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Fee Payments</h4>
              <div className="space-y-2">
                {recentActivities.fees?.slice(0, 3).map((fee) => (
                  <div key={fee._id} className="flex items-center text-sm">
                    <CreditCardIcon className="h-4 w-4 text-blue-500 mr-2" />
                    <span>₹{fee.paidAmount} received from {fee.student?.firstName}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Exam Results</h4>
              <div className="space-y-2">
                {recentActivities.exams?.slice(0, 3).map((exam) => (
                  <div key={exam._id} className="flex items-center text-sm">
                    <BookOpenIcon className="h-4 w-4 text-purple-500 mr-2" />
                    <span>{exam.student?.firstName} scored {exam.marksObtained} in {exam.subject}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;