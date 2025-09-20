import { useEffect } from 'react';
import { UsersIcon, CreditCardIcon, BookOpenIcon, CalendarIcon } from 'lucide-react';
import useDashboardStore from '../../stores/dashboardStore';
import Loader from '../common/Loader';

const StaffDashboard = () => {
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
      color: 'bg-blue-500'
    },
    {
      title: 'Fee Collection',
      value: `₹${(stats?.fees?.totalRevenue || 0).toLocaleString()}`,
      icon: CreditCardIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Exam Records',
      value: (recentActivities?.exams?.length || 0) + ' recent',
      icon: BookOpenIcon,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-600">Welcome to Student Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${card.color} bg-opacity-10`}>
                <card.icon className={`h-6 w-6 ${card.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-100 text-blue-700 p-4 rounded-lg hover:bg-blue-200 transition-colors">
            <div className="flex items-center">
              <CreditCardIcon className="h-6 w-6 mr-2" />
              <span>Collect Fee</span>
            </div>
          </button>
          <button className="bg-green-100 text-green-700 p-4 rounded-lg hover:bg-green-200 transition-colors">
            <div className="flex items-center">
              <BookOpenIcon className="h-6 w-6 mr-2" />
              <span>Record Exam Result</span>
            </div>
          </button>
          <button className="bg-purple-100 text-purple-700 p-4 rounded-lg hover:bg-purple-200 transition-colors">
            <div className="flex items-center">
              <UsersIcon className="h-6 w-6 mr-2" />
              <span>Add New Student</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;