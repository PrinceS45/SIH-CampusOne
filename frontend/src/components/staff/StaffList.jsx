import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useStaffStore from '../../stores/staffStore';
import Table from '../common/Table';
import Modal from '../common/Modal';
import Loader from '../common/Loader';

const StaffList = () => {
  const { 
    staffMembers, 
    loading, 
    totalPages, 
    currentPage, 
    fetchStaff, 
    deleteStaff 
  } = useStaffStore();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    status: ''
  });

  useEffect(() => {
    fetchStaff({ ...filters, search, page: 1 });
  }, [filters, search]);

  const handlePageChange = (page) => {
    fetchStaff({ ...filters, search, page });
  };

  const handleDeleteClick = (staff) => {
    setSelectedStaff(staff);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedStaff) {
      try {
        await deleteStaff(selectedStaff._id);
        toast.success('Staff member deleted successfully');
        fetchStaff({ ...filters, search, page: currentPage });
      } catch (error) {
        toast.error('Failed to delete staff member');
      } finally {
        setShowDeleteModal(false);
        setSelectedStaff(null);
      }
    }
  };

  const columns = [
    {
      header: 'Staff ID',
      accessor: 'staffId'
    },
    {
      header: 'Name',
      accessor: 'firstName',
      render: (staff) => (
        <div className="flex items-center space-x-3">
          {staff.photo ? (
            <img src={staff.photo} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
              {staff.firstName[0]}{staff.lastName[0]}
            </div>
          )}
          <span>{staff.firstName} {staff.lastName}</span>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department'
    },
    {
      header: 'Designation',
      accessor: 'designation'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (staff) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          staff.status === 'active' ? 'bg-green-100 text-green-800' :
          staff.status === 'inactive' ? 'bg-red-100 text-red-800' :
          staff.status === 'on-leave' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {staff.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (staff) => (
        <div className="flex space-x-2">
          <Link to={`/staff/${staff._id}`} className="text-blue-600 hover:text-blue-900">
            <EyeIcon className="h-5 w-5" />
          </Link>
          <Link to={`/staff/${staff._id}/edit`} className="text-green-600 hover:text-green-900">
            <PencilIcon className="h-5 w-5" />
          </Link>
          <button onClick={() => handleDeleteClick(staff)} className="text-red-600 hover:text-red-900">
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      )
    }
  ];

  if (loading && !staffMembers.length) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage employee records and profiles</p>
        </div>
        <Link
          to="/staff/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Staff Member</span>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Name, Email, or Employee ID..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Filter by department..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
              <option value="retired">Retired</option>
            </select>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={staffMembers}
        pagination={{ page: currentPage, totalPages }}
        onPageChange={handlePageChange}
        loading={loading}
      />

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete staff member{' '}
            <span className="font-bold text-gray-900">{selectedStaff?.firstName} {selectedStaff?.lastName}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StaffList;
