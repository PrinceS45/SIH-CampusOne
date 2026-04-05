import React, { useState, useEffect } from 'react';
import useAttendanceStore from '../../stores/attendanceStore';
import useAuthStore from '../../stores/authStore';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Download,
  Filter,
  Users
} from 'lucide-react';
import { FaUserCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './attendance.css';

const AttendanceHistory = () => {
  const { 
    attendanceRecords, 
    fetchAttendanceHistory, 
    loading 
  } = useAttendanceStore();
  const { user } = useAuthStore();

  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    role: 'student',
    course: '',
    semester: ''
  });

  useEffect(() => {
    fetchAttendanceHistory(filters);
  }, [filters, fetchAttendanceHistory]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Present': return 'badge-present';
      case 'Absent': return 'badge-absent';
      case 'Late': return 'badge-late';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Attendance Records</h2>
            <p className="text-gray-500 mt-2">Filter and view institutional attendance history.</p>
          </div>
          <button 
            className="nav-btn bg-white"
            onClick={() => toast.info('Export CSV this feature will come soon')}
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        <div className="filter-grid">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 mb-1 ml-1 px-1">Select Date</label>
            <input 
              type="date" 
              className="p-3 border rounded-xl outline-none"
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 mb-1 ml-1 px-1">Role</label>
            <select 
              className="p-3 border rounded-xl outline-none"
              value={filters.role}
              onChange={(e) => setFilters({...filters, role: e.target.value})}
            >
              <option value="student">Students</option>
              {user?.role === 'admin' && <option value="staff">Staff</option>}
            </select>
          </div>
          {filters.role === 'student' && (
            <>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 mb-1 ml-1 px-1">Course</label>
                <select 
                  className="p-3 border rounded-xl outline-none"
                  value={filters.course}
                  onChange={(e) => setFilters({...filters, course: e.target.value})}
                >
                  <option value="">All Courses</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="BBA">BBA</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-500 mb-1 ml-1 px-1">Semester</label>
                <select 
                  className="p-3 border rounded-xl outline-none"
                  value={filters.semester}
                  onChange={(e) => setFilters({...filters, semester: e.target.value})}
                >
                  <option value="">All Semesters</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Status</th>
              <th>Date</th>
              <th>Marked By</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map((record) => (
              <tr key={record._id}>
                <td>
                  <div className="member-info">
                    {record.user?.profilePicture || record.studentProfile?.photo ? (
                      <img 
                        src={record.user?.profilePicture || record.studentProfile?.photo} 
                        alt={record.user?.name || record.studentProfile?.firstName} 
                        className="member-avatar" 
                      />
                    ) : (
                      <FaUserCircle className="member-avatar text-gray-200" />
                    )}
                    <div>
                      <div className="font-bold text-gray-800">
                        {record.user?.name || 
                        (record.studentProfile ? `${record.studentProfile.firstName} ${record.studentProfile.lastName}` : 'N/A')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {record.studentProfile?.studentId || record.user?.email || 'No ID'}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`history-status-badge ${getStatusBadgeClass(record.status)}`}>
                    {record.status}
                  </span>
                </td>
                <td className="text-sm font-medium text-gray-600">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="text-sm text-gray-500">
                  {record.markedBy?.name || 'System'}
                </td>
                <td>
                   <div className="text-xs text-gray-400">
                    {record.studentProfile ? `${record.studentProfile.course} | Sem ${record.studentProfile.semester}` : 'N/A'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {attendanceRecords.length === 0 && !loading && (
          <div className="p-20 text-center text-gray-500 font-medium">
            No attendance records found for this date/filter.
          </div>
        )}
        {loading && (
          <div className="p-20 text-center text-blue-500 font-bold">
            Loading institutional records...
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;
