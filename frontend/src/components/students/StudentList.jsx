import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useStudentStore from '../../stores/studentStore';
import Table from '../common/Table';
import Modal from '../common/Modal';
import Loader from '../common/Loader';

const StudentList = () => {
  const { students, loading, pagination, filters, getStudents, deleteStudent, setFilters, clearError } = useStudentStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    getStudents({ ...filters, page: 1 });
  }, [filters]);

  const handlePageChange = (page) => {
    getStudents({ ...filters, page });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
  if (selectedStudent) {
    try {
      await deleteStudent(selectedStudent._id);
      toast.success('Student deleted successfully');
      
      // Optional: Refresh the data to ensure consistency with the server
      // This is good practice in case there are pagination changes
      getStudents({ ...filters, page: pagination.page });
      
    } catch (error) {
      toast.error('Failed to delete student');
      console.error('Delete error:', error);
    } finally {
      setShowDeleteModal(false);
      setSelectedStudent(null);
    }
  }
};

  const columns = [
    {
      header: 'Student ID',
      accessor: 'studentId'
    },
    {
      header: 'Name',
      accessor: 'firstName',
      render: (student) => `${student.firstName} ${student.lastName}`
    },
    {
      header: 'Email',
      accessor: 'email'
    },
    {
      header: 'Course',
      accessor: 'course'
    },
    {
      header: 'Semester',
      accessor: 'semester'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (student) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          student.status === 'active' ? 'bg-green-100 text-green-800' :
          student.status === 'inactive' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {student.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (student) => (
        <div className="flex space-x-2">
          <Link
            to={`/students/${student._id}`}
            className="text-blue-600 hover:text-blue-900"
          >
            <EyeIcon className="h-5 w-5" />
          </Link>
          <Link
            to={`/students/${student._id}/edit`}
            className="text-green-600 hover:text-green-900"
          >
            <PencilIcon className="h-5 w-5" />
          </Link>
          <button
            onClick={() => handleDeleteClick(student)}
            className="text-red-600 hover:text-red-900"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      )
    }
  ];

  if (loading && !students.length) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage student records</p>
        </div>
        <Link
          to="/students/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Student</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search students..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Course</label>
            <select
              value={filters.course || ''}
              onChange={(e) => handleFilterChange({ course: e.target.value })}
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
              value={filters.semester || ''}
              onChange={(e) => handleFilterChange({ semester: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange({ status: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <Table
        columns={columns}
        data={students}
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete student{' '}
            <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong>?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentList;