import { useState, useEffect } from 'react';
import {
  UsersIcon,
  CreditCardIcon,
  BuildingIcon,
  BookOpenIcon,
  TrendingUpIcon,
  CalendarIcon,
  DownloadIcon,
  FilterIcon
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
  Line,
  AreaChart,
  Area
} from 'recharts';
import useDashboardStore from '../../stores/dashboardStore';
import useStudentStore from '../../stores/studentStore';
import useFeeStore from '../../stores/feeStore';
import useExamStore from '../../stores/examStore';
import useHostelStore from '../../stores/hostelStore';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Loader from '../common/Loader';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const Analytics = () => {
  const { stats, loading, getDashboardStats } = useDashboardStore();
  const { getStudentStats } = useStudentStore();
  const { getFeeStats } = useFeeStore();
  const { getPerformanceStats } = useExamStore();
  const { getOccupancyStats } = useHostelStore();
  
  const [studentStats, setStudentStats] = useState(null);
  const [feeStats, setFeeStats] = useState(null);
  const [performanceStats, setPerformanceStats] = useState([]);
  const [occupancyStats, setOccupancyStats] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAllStats();
  }, [dateRange]);

  const loadAllStats = async () => {
    try {
      await getDashboardStats();
      
      // Load additional statistics
      const [studentData, feeData, performanceData, occupancyData] = await Promise.all([
        getStudentStats(),
        getFeeStats(dateRange),
        getPerformanceStats(),
        getOccupancyStats()
      ]);
      
      setStudentStats(studentData);
      setFeeStats(feeData);
      setPerformanceStats(performanceData);
      setOccupancyStats(occupancyData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <Loader />;

  // Prepare data for charts
  const studentCourseData = stats?.courseDistribution?.map((course, index) => ({
    name: course._id,
    value: course.count,
    color: COLORS[index % COLORS.length]
  })) || [];

  const feeMonthlyData = stats?.feeCollectionByMonth?.map((amount, index) => ({
    name: new Date(2023, index).toLocaleString('default', { month: 'short' }),
    amount: amount
  })) || [];

  const performanceChartData = performanceStats.slice(0, 8).map((stat, index) => ({
    subject: stat.subject.substring(0, 15) + (stat.subject.length > 15 ? '...' : ''),
    average: stat.averageMarks,
    passRate: stat.passPercentage
  }));

  const occupancyChartData = occupancyStats.map(hostel => ({
    name: hostel.name,
    occupancy: hostel.occupancyRate,
    occupied: hostel.occupiedRooms,
    total: hostel.totalRooms
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600">Comprehensive institutional analytics and insights</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700">
          <DownloadIcon className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FilterIcon className="h-5 w-5 mr-2" />
            Filter Analytics
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Report Type</label>
            <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option>Comprehensive Report</option>
              <option>Financial Report</option>
              <option>Academic Report</option>
              <option>Hostel Report</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'financial', 'academic', 'hostel', 'trends'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Analytics
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Analytics */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100">
                      <UsersIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Students</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.students?.totalStudents || 0}</p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUpIcon className="h-4 w-4 mr-1" />
                        +12% from last year
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100">
                      <CreditCardIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats?.fees?.totalRevenue || 0)}
                      </p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUpIcon className="h-4 w-4 mr-1" />
                        +8% from last year
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100">
                      <BuildingIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Hostel Occupancy</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.hostels?.occupiedRooms || 0}/{stats?.hostels?.totalRooms || 0}
                      </p>
                      <p className="text-sm text-green-600 flex items-center">
                        <TrendingUpIcon className="h-4 w-4 mr-1" />
                        {stats?.hostels?.totalRooms ? 
                          Math.round((stats.hostels.occupiedRooms / stats.hostels.totalRooms) * 100) : 0
                        }% occupied
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-orange-100">
                      <BookOpenIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Pass Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {performanceStats.length ? 
                          Math.round(performanceStats.reduce((sum, stat) => sum + stat.passPercentage, 0) / performanceStats.length) 
                          : 0
                        }%
                      </p>
                      <p className="text-sm text-gray-600">Across all subjects</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Distribution */}
                <div className="bg-white p-6 rounded-lg shadow border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Course Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={studentCourseData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {studentCourseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-white p-6 rounded-lg shadow border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={feeMonthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                      <Bar dataKey="amount" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Additional Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Trends */}
                <div className="bg-white p-6 rounded-lg shadow border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Performance</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="average" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Hostel Occupancy */}
                <div className="bg-white p-6 rounded-lg shadow border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hostel Occupancy Rates</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={occupancyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Occupancy Rate']} />
                      <Bar dataKey="occupancy" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Financial Analytics */}
          {activeTab === 'financial' && feeStats && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(feeStats.overview?.totalAmount || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Fee Amount</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(feeStats.overview?.totalPaid || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Collected</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(feeStats.overview?.totalBalance || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Pending Balance</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {feeStats.overview?.totalTransactions || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Transactions</div>
                </div>
              </div>

              {/* Payment Status Distribution */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Paid', value: feeStats.overview?.paidTransactions || 0, color: '#10B981' },
                        { name: 'Pending', value: feeStats.overview?.pendingTransactions || 0, color: '#F59E0B' },
                        { name: 'Partial', value: feeStats.overview?.partialTransactions || 0, color: '#3B82F6' },
                        { name: 'Overdue', value: feeStats.overview?.overdueTransactions || 0, color: '#EF4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {[
                        { name: 'Paid', value: feeStats.overview?.paidTransactions || 0, color: '#10B981' },
                        { name: 'Pending', value: feeStats.overview?.pendingTransactions || 0, color: '#F59E0B' },
                        { name: 'Partial', value: feeStats.overview?.partialTransactions || 0, color: '#3B82F6' },
                        { name: 'Overdue', value: feeStats.overview?.overdueTransactions || 0, color: '#EF4444' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Academic Analytics */}
          {activeTab === 'academic' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {performanceStats.slice(0, 6).map((stat, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow border">
                    <h4 className="font-semibold text-gray-900 mb-2">{stat.subject}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Marks:</span>
                        <span className="font-medium">{stat.averageMarks}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pass Rate:</span>
                        <span className="font-medium text-green-600">{stat.passPercentage}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Students:</span>
                        <span className="font-medium">{stat.totalStudents}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hostel Analytics */}
          {activeTab === 'hostel' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {occupancyStats.map((hostel, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow border">
                    <h4 className="font-semibold text-gray-900 mb-2">{hostel.name}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Rooms:</span>
                        <span className="font-medium">{hostel.totalRooms}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Occupied Rooms:</span>
                        <span className="font-medium">{hostel.occupiedRooms}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Occupancy Rate:</span>
                        <span className="font-medium text-blue-600">{hostel.occupancyRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trends Analytics */}
          {activeTab === 'trends' && (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Enrollment Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="students" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-center text-gray-500 mt-4">Enrollment trend data will be available soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;