import { useState, useEffect } from 'react';
import { DownloadIcon, FilterIcon } from 'lucide-react';
import useExamStore from '../../stores/examStore';
import Table from '../common/Table';
import Loader from '../common/Loader';

const ExamResults = () => {
  const { exams, loading, pagination, filters, getExams, setFilters, getPerformanceStats } = useExamStore();
  const [performanceStats, setPerformanceStats] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    getExams({ ...filters, page: 1 });
    fetchPerformanceStats();
  }, [filters, getExams]);

  const fetchPerformanceStats = async () => {
    try {
      const stats = await getPerformanceStats({
        course: filters.course,
        semester: filters.semester
      });
      setPerformanceStats(stats);
    } catch (error) {
      console.error('Error fetching performance stats:', error);
    }
  };

  const handlePageChange = (page) => {
    getExams({ ...filters, page });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setFilters(localFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      studentId: '',
      examType: '',
      course: '',
      semester: ''
    };
    setLocalFilters(emptyFilters);
    setFilters(emptyFilters);
  };

  const columns = [
    {
      header: 'Student',
      accessor: 'student',
      render: (exam) => `${exam.student?.firstName} ${exam.student?.lastName} (${exam.student?.studentId})`
    },
    {
      header: 'Subject',
      accessor: 'subject'
    },
    {
      header: 'Exam Type',
      accessor: 'examType',
      render: (exam) => (
        <span className="capitalize">{exam.examType}</span>
      )
    },
    {
      header: 'Marks',
      accessor: 'marksObtained',
      render: (exam) => `${exam.marksObtained}/${exam.maximumMarks}`
    },
    {
      header: 'Percentage',
      accessor: 'percentage',
      render: (exam) => `${((exam.marksObtained / exam.maximumMarks) * 100).toFixed(2)}%`
    },
    {
      header: 'Grade',
      accessor: 'grade',
      render: (exam) => (
        <span className={`font-bold ${
          exam.grade === 'A+' || exam.grade === 'A' ? 'text-green-600' :
          exam.grade === 'B+' || exam.grade === 'B' ? 'text-blue-600' :
          exam.grade === 'C+' || exam.grade === 'C' ? 'text-yellow-600' :
          exam.grade === 'D' ? 'text-orange-600' : 'text-red-600'
        }`}>
          {exam.grade}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (exam) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          exam.status === 'pass' ? 'bg-green-100 text-green-800' :
          exam.status === 'fail' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {exam.status}
        </span>
      )
    },
    {
      header: 'Exam Date',
      accessor: 'examDate',
      render: (exam) => new Date(exam.examDate).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
        <p className="text-gray-600">View and analyze exam results</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FilterIcon className="h-5 w-5 mr-2" />
            Filter Results
          </h3>
          <div className="flex space-x-2">
            <button 
              onClick={applyFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
            <button 
              onClick={clearFilters}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Clear
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-green-700">
              <DownloadIcon className="h-4 w-4" />
              <span>Export Results</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Student ID</label>
            <input
              type="text"
              name="studentId"
              value={localFilters.studentId || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter student ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Exam Type</label>
            <select
              name="examType"
              value={localFilters.examType || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="midterm">Midterm</option>
              <option value="final">Final</option>
              <option value="quiz">Quiz</option>
              <option value="assignment">Assignment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Course</label>
            <select
              name="course"
              value={localFilters.course || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Courses</option>
              <option value="B.Tech">B.Tech</option>
              <option value="MBA">MBA</option>
              <option value="MCA">MCA</option>
              <option value="BBA">BBA</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Semester</label>
            <select
              name="semester"
              value={localFilters.semester || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Performance Statistics */}
      {performanceStats.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceStats.map((stat, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">{stat.subject}</h4>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Average Marks:</span>
                    <span className="font-medium">{stat.averageMarks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pass Percentage:</span>
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

      {/* Exam Results Table */}
      <Table
        columns={columns}
        data={exams}
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
};

export default ExamResults;