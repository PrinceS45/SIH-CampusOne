import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SaveIcon, ArrowLeftIcon, UploadIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useStaffStore from '../../stores/staffStore';
import Loader from '../common/Loader';

const StaffForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    staffDetails, 
    loading, 
    fetchStaffById, 
    createStaff, 
    updateStaff,
    clearDetails
  } = useStaffStore();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'India'
    },
    designation: '',
    department: '',
    joiningDate: new Date().toISOString().split('T')[0],
    qualification: '',
    experience: '',
    status: 'active'
  });
  
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(id);

  useEffect(() => {
    if (id) {
      fetchStaffById(id);
    } else {
      clearDetails();
    }
  }, [id, fetchStaffById, clearDetails]);

  useEffect(() => {
    if (isEdit && staffDetails) {
      setFormData({
        firstName: staffDetails.firstName || '',
        lastName: staffDetails.lastName || '',
        email: staffDetails.email || '',
        phone: staffDetails.phone || '',
        dateOfBirth: staffDetails.dateOfBirth ? new Date(staffDetails.dateOfBirth).toISOString().split('T')[0] : '',
        gender: staffDetails.gender || 'male',
        address: {
          street: staffDetails.address?.street || '',
          city: staffDetails.address?.city || '',
          state: staffDetails.address?.state || '',
          zip: staffDetails.address?.zip || '',
          country: staffDetails.address?.country || 'India'
        },
        designation: staffDetails.designation || '',
        department: staffDetails.department || '',
        joiningDate: staffDetails.joiningDate ? new Date(staffDetails.joiningDate).toISOString().split('T')[0] : '',
        qualification: staffDetails.qualification || '',
        experience: staffDetails.experience || '',
        status: staffDetails.status || 'active'
      });
    }
  }, [staffDetails, isEdit]);

  const handleChange = (e) => {
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'object') {
        submitData.append(key, JSON.stringify(formData[key]));
      } else {
        submitData.append(key, formData[key]);
      }
    });
    
    if (photo) {
      submitData.append('photo', photo);
    }

    try {
      if (isEdit) {
        await updateStaff(id, submitData);
        toast.success('Staff profile updated successfully');
      } else {
        await createStaff(submitData);
        toast.success('Staff profile created successfully');
      }
      navigate('/staff');
    } catch (error) {
      toast.error(error.message || 'Error saving staff profile');
    }
  };

  if (loading && isEdit) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/staff')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Staff Profile' : 'Add New Staff Member'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEdit ? 'Update employee professional and personal details' : 'Enter details to create a new employee record'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        {/* Personal Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`mt-1 block w-full border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none`}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-500 text-end uppercase font-bold">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`mt-1 block w-full border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Professional Section */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-6">Professional Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Designation *</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g. Senior Lecturer"
                className={`mt-1 block w-full border ${errors.designation ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Department *</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
                className={`mt-1 block w-full border ${errors.department ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Qualification</label>
              <textarea
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                rows={2}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="List major degrees and certifications..."
              />
            </div>
          </div>
        </section>

        {/* Profile Picture */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-6">Profile Media</h2>
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0 h-24 w-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
              {photo ? (
                <img src={URL.createObjectURL(photo)} alt="Preview" className="h-full w-full object-cover" />
              ) : staffDetails?.photo ? (
                <img src={staffDetails.photo} alt="Current" className="h-full w-full object-cover" />
              ) : (
                <UploadIcon className="h-8 w-8 text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <UploadIcon className="h-4 w-4 mr-2" />
                Choose Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files[0])}
                  className="hidden"
                />
              </label>
              {photo && <p className="mt-2 text-xs text-gray-500 font-medium">Selected: {photo.name}</p>}
              <p className="mt-1 text-xs text-gray-400">JPG, PNG or WEBP. Max 2MB.</p>
            </div>
          </div>
        </section>

        <div className="pt-8 flex justify-end space-x-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/staff')}
            className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all font-outfit"
          >
            Discard Changes
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 transition-all font-outfit flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Profile...
              </>
            ) : (
              <>
                <SaveIcon className="h-5 w-5 mr-2" />
                {isEdit ? 'Save Changes' : 'Create Staff Profile'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffForm;
