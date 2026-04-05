import React, { useEffect, useState } from 'react';
import useAttendanceStore from '../../stores/attendanceStore';
import { 
  Calendar as CalendarIcon, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  PieChart
} from 'lucide-react';
import './attendance.css';

const MyAttendance = () => {
  const { myAttendance, fetchMyAttendance, loading } = useAttendanceStore();

  useEffect(() => {
    fetchMyAttendance();
  }, [fetchMyAttendance]);

  const stats = myAttendance.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const total = myAttendance.length;
  const percentage = total > 0 ? Math.round(((stats['Present'] || 0) / total) * 100) : 0;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Present': return 'bg-green-100 text-green-700';
      case 'Absent': return 'bg-red-100 text-red-700';
      case 'Late': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Attendance</h2>
        <p className="text-gray-500 mt-2">Track your daily presence and academic consistency.</p>
      </div>

      {total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
             <div className="text-3xl font-black text-blue-600MB-2">{percentage}%</div>
             <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Attendance</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
             <div className="text-3xl font-black text-green-600 mb-2">{stats['Present'] || 0}</div>
             <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Present</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
             <div className="text-3xl font-black text-red-500 mb-2">{stats['Absent'] || 0}</div>
             <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Absent</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
             <div className="text-3xl font-black text-yellow-500 mb-2">{stats['Late'] || 0}</div>
             <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Late</div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CalendarIcon size={20} className="text-blue-500" />
          Recent Records
        </h3>
        {loading ? (
          <div className="text-center py-20 text-blue-500 font-bold">Fetching your profile records...</div>
        ) : myAttendance.length > 0 ? (
          myAttendance.map((record) => (
            <div key={record._id} className="attendance-card">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${getStatusBadgeClass(record.status)} bg-opacity-20`}>
                  {record.status === 'Present' && <CheckCircle size={24} className="text-green-600" />}
                  {record.status === 'Absent' && <XCircle size={24} className="text-red-600" />}
                  {record.status === 'Late' && <Clock size={24} className="text-yellow-600" />}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div className="text-sm text-gray-500">Method: {record.type === 'manual' ? 'Instructor Verified' : 'Machine Biometric'}</div>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${getStatusBadgeClass(record.status)}`}>
                {record.status}
              </span>
            </div>
          ))
        ) : (
          <div className="bg-white p-20 rounded-2xl text-center text-gray-500 font-medium border-2 border-dashed">
            No attendance records recorded for your account yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAttendance;
