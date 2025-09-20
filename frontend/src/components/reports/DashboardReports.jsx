import { useState, useEffect } from 'react';
import {
  UsersIcon,
  CreditCardIcon,
  BuildingIcon,
  BookOpenIcon,
  TrendingUpIcon,
  DownloadIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import useDashboardStore from '../../stores/dashboardStore';
import useFeeStore from '../../stores/feeStore';
import useExamStore from '../../stores/examStore';
import Loader from '../common/Loader';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DashboardReports = () => {
  const { stats, loading, getDashboardStats } = useDashboardStore();
  const { getFeeStats } = useFeeStore();
  const { getPerformanceStats } = useExamStore();
  const [feeStats, setFeeStats] = useState(null);
  const [performanceStats, setPerformanceStats] = useState([]);

  useEffect(() => {
    getDashboardStats();
    fetchFeeStats();
    fetchPerformanceStats();
  }, []);

  const fetchFeeStats = async () => {
    const currentYear = new Date().getFullYear();
    const stats = await getFeeStats({
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`
    });
    setFeeStats(stats);
  };

  const fetchPerformanceStats = async () => {
    const stats = await getPerformanceStats();
    setPerformanceStats(stats);
  };

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
      value: (stats?.recentActivities?.exams || 0) + ' recent',
      icon: BookOpenIcon,
      color: 'bg-orange-500',
      change: '+15%'
    }
  ];

  const courseData = stats?.courseDistribution?.map((course, index) => ({
    name: course._id,
    value: course.count,
    color: COLORS[index % COLORS.length]
  })) || [];

  const monthlyFeeData = stats?.feeCollectionByMonth?.map((amount, index) => ({
    name: new Date(2023, index).toLocaleString('default', { month: 'short' }),
    amount: amount
  })) || [];

  const performanceData = performanceStats.slice(0, 5).map((stat, index) => ({
    subject: stat.subject,
    average: stat.averageMarks,
    passRate: stat.passPercentage
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Comprehensive institutional analytics and reports</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700">
          <DownloadIcon className="h-4 w-4" />
          <span>Export Report</span>
        </button>
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Collection Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Collection Trend (2023)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyFeeData}>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Course Distribution</h3>
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

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Marks by Subject */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Marks by Subject</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="average" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pass Rate by Subject */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pass Rate by Subject</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}%`, 'Pass Rate']} />
              <Line type="monotone" dataKey="passRate" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Student Reports</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="hover:text-blue-600 cursor-pointer">Student Directory</li>
              <li className="hover:text-blue-600 cursor-pointer">Attendance Report</li>
              <li className="hover:text-blue-600 cursor-pointer">Academic Performance</li>
              <li className="hover:text-blue-600 cursor-pointer">Fee Defaulters</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Financial Reports</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="hover:text-blue-600 cursor-pointer">Fee Collection Summary</li>
              <li className="hover:text-blue-600 cursor-pointer">Revenue Analysis</li>
              <li className="hover:text-blue-600 cursor-pointer">Outstanding Payments</li>
              <li className="hover:text-blue-600 cursor-pointer">Expense Reports</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Academic Reports</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="hover:text-blue-600 cursor-pointer">Exam Results</li>
              <li className="hover:text-blue-600 cursor-pointer">Grade Distribution</li>
              <li className="hover:text-blue-600 cursor-pointer">Course-wise Performance</li>
              <li className="hover:text-blue-600 cursor-pointer">Faculty Performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardReports;