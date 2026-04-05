import React, { useState, useEffect } from 'react';
import useAttendanceStore from '../../stores/attendanceStore';
import useAuthStore from '../../stores/authStore';
import { 
  Users, 
  Calendar as CalendarIcon, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter
} from 'lucide-react';
import { FaUserCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './attendance.css';

const MarkAttendance = () => {
  const { 
    usersToMark, 
    fetchStudentsForMarking, 
    fetchStaffForMarking, 
    submitAttendance, 
    loading 
  } = useAttendanceStore();
  const { user } = useAuthStore();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [roleToMark, setRoleToMark] = useState(user?.role === 'admin' ? 'student' : 'student');
  const [filters, setFilters] = useState({
    course: '',
    semester: '',
    branch: ''
  });

  // Local state for attendance statuses to be submitted
  const [attendanceList, setAttendanceList] = useState({});

  const getMemberId = (m) => m._id || m.studentProfileId;

  useEffect(() => {
    if (roleToMark === 'student') {
      fetchStudentsForMarking(filters, date);
    } else if (roleToMark === 'staff') {
      fetchStaffForMarking(date);
    }
  }, [roleToMark, filters, date, fetchStudentsForMarking, fetchStaffForMarking]);

  useEffect(() => {
    // Initialize attendance list from existing status if available, 
    // otherwise default to a pending selection (null)
    const initialList = {};
    usersToMark.forEach(u => {
      initialList[getMemberId(u)] = u.existingStatus || null;
    });
    setAttendanceList(initialList);
  }, [usersToMark]);

  const handleStatusChange = (userId, status) => {
    setAttendanceList(prev => ({
      ...prev,
      [userId]: status
    }));
  };

  const handleMarkAll = (status) => {
    const newList = { ...attendanceList };
    usersToMark.forEach(u => {
      const mid = getMemberId(u);
      // Only mark those who are NOT already marked in the database
      if (!u.existingStatus) {
        newList[mid] = status;
      }
    });
    setAttendanceList(newList);
    toast.success(`Unmarked members set to ${status}`);
  };

  const handleUnmark = async (member) => {
    const mid = getMemberId(member);
    try {
      if (member.existingStatus) {
        // If it's already in the DB, we need to call the API to delete it
        await useAttendanceStore.getState().unmarkAttendance({
          userId: member._id,
          studentProfileId: member.studentProfileId,
          date,
          role: roleToMark
        });
        toast.success('Attendance record removed');
      }
      
      // Update local state to show as unmarked
      setAttendanceList(prev => ({
        ...prev,
        [mid]: null
      }));
      
      // Refresh list to sync existingStatus (optional but cleaner)
      if (roleToMark === 'student') fetchStudentsForMarking(filters, date);
      else fetchStaffForMarking(date);

    } catch (error) {
      toast.error('Failed to unmark attendance');
    }
  };

  const handleSubmit = async () => {
    try {
      // Only submit items that have a status selected AND were not already marked
      // OR they were marked but the status was changed (updates)
      const data = usersToMark
        .filter(u => {
          const currentStatus = attendanceList[getMemberId(u)];
          return currentStatus && currentStatus !== u.existingStatus;
        })
        .map(u => ({
          userId: u._id,
          studentProfileId: u.studentProfileId,
          status: attendanceList[getMemberId(u)],
          remarks: ''
        }));

      if (data.length === 0) {
        toast.error('No new changes to submit');
        return;
      }

      await submitAttendance(data, date, roleToMark);
      toast.success('Attendance submitted successfully!');
      
      // Refresh list to sync existingStatus
      if (roleToMark === 'student') fetchStudentsForMarking(filters, date);
      else fetchStaffForMarking(date);
    } catch (error) {
      toast.error(error.message || 'Failed to submit attendance');
    }
  };

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mark Attendance</h2>
            <p className="text-gray-500 mt-2">Daily presence record for {roleToMark}s.</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="bg-gray-100 p-1 rounded-xl flex">
              <button 
                onClick={() => setRoleToMark('student')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${roleToMark === 'student' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Students
              </button>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => setRoleToMark('staff')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${roleToMark === 'staff' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Staff
                </button>
              )}
            </div>
            <input 
              type="date" 
              className="p-2 border rounded-xl outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {roleToMark === 'student' && (
          <div className="filter-grid">
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
            <select 
              className="p-3 border rounded-xl outline-none"
              value={filters.semester}
              onChange={(e) => setFilters({...filters, semester: e.target.value})}
            >
              <option value="">All Semesters</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
            <button 
              className="p-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
              onClick={() => fetchStudentsForMarking(filters, date)}
            >
              Fetch List
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Showing {usersToMark.length} {roleToMark}{usersToMark.length !== 1 ? 's' : ''}
          </h3>
          <p className="text-xs text-gray-400 mt-1">* Mark All only affects members without records for today.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleMarkAll('Present')} className="status-btn present active">Mark All Present</button>
          <button onClick={() => handleMarkAll('Absent')} className="status-btn absent active">Mark All Absent</button>
        </div>
      </div>

      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Member</th>
              {roleToMark === 'student' && <th>ID</th>}
              {roleToMark === 'staff' && <th>Department</th>}
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {usersToMark.map((member) => {
              const mid = getMemberId(member);
              const currentStatus = attendanceList[mid];
              const isMarked = !!member.existingStatus;
              
              return (
                <tr key={mid} className={isMarked ? 'bg-blue-50/30' : ''}>
                  <td>
                    <div className="member-info">
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} className="member-avatar" />
                      ) : (
                        <FaUserCircle className="member-avatar text-gray-300" />
                      )}
                      <div>
                        <span className="font-bold text-gray-800 block">{member.name}</span>
                        {isMarked && <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Marked</span>}
                      </div>
                    </div>
                  </td>
                  {roleToMark === 'student' && <td className="text-sm font-medium text-gray-600">{member.studentId}</td>}
                  {roleToMark === 'staff' && <td className="text-sm font-medium text-gray-600">{member.department || 'N/A'}</td>}
                  <td>
                    <div className="status-toggle">
                      <button 
                        onClick={() => handleStatusChange(mid, 'Present')}
                        className={`status-btn present ${currentStatus === 'Present' ? 'active' : ''}`}
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Present
                      </button>
                      <button 
                        onClick={() => handleStatusChange(mid, 'Absent')}
                        className={`status-btn absent ${currentStatus === 'Absent' ? 'active' : ''}`}
                      >
                        <XCircle size={14} className="mr-1" />
                        Absent
                      </button>
                      {roleToMark === 'student' && (
                        <button 
                          onClick={() => handleStatusChange(mid, 'Late')}
                          className={`status-btn late ${currentStatus === 'Late' ? 'active' : ''}`}
                        >
                          <Clock size={14} className="mr-1" />
                          Late
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleUnmark(member)}
                      disabled={!currentStatus && !isMarked}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg"
                      title="Unmark / Reset selection"
                    >
                      <XCircle size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {usersToMark.length === 0 && (
          <div className="p-20 text-center text-gray-500 font-medium">
            No {roleToMark}s found for this date/filter.
          </div>
        )}
      </div>

      <div className="submit-section">
        <button 
          onClick={handleSubmit}
          disabled={usersToMark.length === 0 || loading}
          className="primary-button"
        >
          {loading ? 'Submitting...' : 'Submit Records'}
        </button>
      </div>
    </div>
  );
};

export default MarkAttendance;
