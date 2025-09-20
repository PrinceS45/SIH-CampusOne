import { useState, useEffect } from 'react';
import { PlusIcon, BuildingIcon, UsersIcon } from 'lucide-react';
import useHostelStore from '../../stores/hostelStore';
import Table from '../common/Table';
import Modal from '../common/Modal';
import Loader from '../common/Loader';

const HostelManagement = () => {
  const { hostels, loading, getHostels, createHostel, deleteHostel } = useHostelStore();
  const [showHostelModal, setShowHostelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'boys',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    warden: {
      name: '',
      contact: '',
      email: ''
    },
    totalRooms: 0,
    amenities: [],
    rules: [],
    status: 'active'
  });

  useEffect(() => {
    getHostels();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAmenityChange = (e) => {
    const { value } = e.target;
    if (value && !formData.amenities.includes(value)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, value]
      }));
      e.target.value = '';
    }
  };

  const removeAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const handleRuleChange = (e) => {
    const { value } = e.target;
    if (value && !formData.rules.includes(value)) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, value]
      }));
      e.target.value = '';
    }
  };

  const removeRule = (index) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createHostel(formData);
      setShowHostelModal(false);
      setFormData({
        name: '',
        type: 'boys',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        warden: {
          name: '',
          contact: '',
          email: ''
        },
        totalRooms: 0,
        amenities: [],
        rules: [],
        status: 'active'
      });
      getHostels();
    } catch (error) {
      console.error('Error creating hostel:', error);
    }
  };

  const handleDeleteClick = (hostel) => {
    setSelectedHostel(hostel);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedHostel) {
      await deleteHostel(selectedHostel._id);
      setShowDeleteModal(false);
      setSelectedHostel(null);
      getHostels();
    }
  };

  const columns = [
    {
      header: 'Hostel Name',
      accessor: 'name'
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (hostel) => (
        <span className="capitalize">{hostel.type}</span>
      )
    },
    {
      header: 'Total Rooms',
      accessor: 'totalRooms'
    },
    {
      header: 'Occupied',
      accessor: 'occupiedRooms'
    },
    {
      header: 'Available',
      accessor: 'availableRooms'
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (hostel) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          hostel.status === 'active' ? 'bg-green-100 text-green-800' :
          hostel.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {hostel.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: '_id',
      render: (hostel) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleDeleteClick(hostel)}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  if (loading && !hostels.length) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hostel Management</h1>
          <p className="text-gray-600">Manage college hostels and rooms</p>
        </div>
        <button
          onClick={() => setShowHostelModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Hostel</span>
        </button>
      </div>

      {/* Hostels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hostels.map((hostel) => (
          <div key={hostel._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <BuildingIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{hostel.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{hostel.type} hostel</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Rooms</span>
                <span className="text-sm font-medium">{hostel.totalRooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Occupied</span>
                <span className="text-sm font-medium">{hostel.occupiedRooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Available</span>
                <span className="text-sm font-medium">{hostel.availableRooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  hostel.status === 'active' ? 'bg-green-100 text-green-800' :
                  hostel.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {hostel.status}
                </span>
              </div>
            </div>

            {hostel.warden?.name && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <UsersIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Warden: {hostel.warden.name}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Hostel Modal */}
      <Modal
        isOpen={showHostelModal}
        onClose={() => setShowHostelModal(false)}
        title="Add New Hostel"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hostel Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Hostel Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Total Rooms *</label>
              <input
                type="number"
                name="totalRooms"
                value={formData.totalRooms}
                onChange={handleInputChange}
                required
                min="1"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                placeholder="Street"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                placeholder="City"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                placeholder="State"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleInputChange}
                placeholder="ZIP Code"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Warden Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="warden.name"
                value={formData.warden.name}
                onChange={handleInputChange}
                placeholder="Warden Name"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="tel"
                name="warden.contact"
                value={formData.warden.contact}
                onChange={handleInputChange}
                placeholder="Contact Number"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="email"
                name="warden.email"
                value={formData.warden.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Amenities</h4>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder="Add amenity (press enter)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAmenityChange(e);
                  }
                }}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Rules</h4>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder="Add rule (press enter)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRuleChange(e);
                  }
                }}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.rules.map((rule, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                >
                  {rule}
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="ml-1 text-gray-600 hover:text-gray-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowHostelModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Create Hostel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete hostel{' '}
            <strong>{selectedHostel?.name}</strong>? This action cannot be undone.
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

export default HostelManagement;