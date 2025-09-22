import { useEffect, useState } from 'react';
import { BookOpenIcon, CreditCardIcon, HomeIcon, UserIcon } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import useStudentStore from '../../stores/studentStore';
import useFeeStore from '../../stores/feeStore';
import useExamStore from '../../stores/examStore';
import Loader from '../common/Loader';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const { currentStudent, getStudent } = useStudentStore();
  const { getMyFees, loading: feesLoading } = useFeeStore();
  const { getMyExams, loading: examsLoading } = useExamStore();
  
  const [fees, setFees] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (user) {
        try {
          if (user.role === 'student') {
            // Use student-specific methods for fees and exams
            const studentFees = await getMyFees();
            const studentExams = await getMyExams();
            
            setFees(studentFees);
            setExams(studentExams);
            
            // Get student profile data
            if (user.studentProfile) {
              // student profile is already populated in user object
            } else if (user.studentId) {
              // Fallback: get student by studentId
              await getStudent(user.studentId);
            }
          }
        } catch (error) {
          console.error('Error fetching student data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user, getMyFees, getMyExams, getStudent]);

  if (loading) return <Loader />;

  // Use user.studentProfile if available, otherwise use currentStudent
  const studentData = user?.studentProfile || currentStudent;
  
  if (!studentData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Student data not found. Please contact administration.</p>
      </div>
    );
  }

  const totalPaid = fees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
  const totalDue = fees.reduce((sum, fee) => sum + (fee.balance || 0), 0);
  const recentExam = exams[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">Welcome back, {studentData.firstName}!</p>
      </div>

      {/* Student Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-6">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            {studentData.photo ? (
              <img
                src={studentData.photo}
                alt={studentData.firstName}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="h-8 w-8 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {studentData.firstName} {studentData.lastName}
            </h2>
            <p className="text-gray-600">{studentData.studentId}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>{studentData.course}</span>
              <span>•</span>
              <span>Semester {studentData.semester}</span>
              <span>•</span>
              <span>{studentData.branch}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <CreditCardIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Due</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalDue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <BookOpenIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Exams Taken</p>
              <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Exam Result */}
      {recentExam && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Exam Result</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Subject</p>
              <p className="font-medium">{recentExam.subject}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Exam Type</p>
              <p className="font-medium capitalize">{recentExam.examType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Marks</p>
              <p className="font-medium">{recentExam.marksObtained}/{recentExam.maximumMarks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Grade</p>
              <p className="font-bold text-blue-600">{recentExam.grade}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                recentExam.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {recentExam.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-medium">{new Date(recentExam.examDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hostel Information */}
      {studentData.hostel && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <HomeIcon className="h-5 w-5 mr-2" />
            Hostel Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Hostel</p>
              <p className="font-medium">{studentData.hostel.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Room Number</p>
              <p className="font-medium">{studentData.room?.roomNumber || 'Not allocated'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Hostel Type</p>
              <p className="font-medium capitalize">{studentData.hostel.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                Allocated
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Fee Payments */}
      {fees.filter(fee => fee.balance > 0).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Fee Payments</h3>
          <div className="space-y-3">
            {fees.filter(fee => fee.balance > 0).slice(0, 3).map((fee) => (
              <div key={fee._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                <div>
                  <p className="font-medium">Semester {fee.semester}</p>
                  <p className="text-sm text-gray-600">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{fee.balance}</p>
                  <p className="text-sm text-gray-600">Balance</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data Messages */}
      {exams.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Exam Results</h3>
          <p className="text-gray-500">No exam results available yet.</p>
        </div>
      )}

      {fees.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Fee Information</h3>
          <p className="text-gray-500">No fee records available yet.</p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;