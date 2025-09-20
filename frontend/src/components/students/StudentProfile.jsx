import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MailIcon, 
  PhoneIcon, 
  CalendarIcon, 
  MapPinIcon, 
  UserIcon,
  EditIcon,
  FileTextIcon
} from 'lucide-react';
import useStudentStore from '../../stores/studentStore';
import Loader from '../common/Loader';

const StudentProfile = () => {
  const { id } = useParams();
  const { currentStudent, loading, getStudent } = useStudentStore();
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (id) {
      getStudent(id);
    }
  }, [id, getStudent]);

  if (loading) return <Loader />;
  if (!currentStudent) return <div>Student not found</div>;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
          <p className="text-gray-600">View and manage student details</p>
        </div>
        <Link
          to={`/students/${id}/edit`}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
        >
          <EditIcon className="h-4 w-4" />
          <span>Edit Profile</span>
        </Link>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-6">
          <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
            {currentStudent.photo ? (
              <img
                src={currentStudent.photo}
                alt={currentStudent.firstName}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="h-12 w-12 text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentStudent.firstName} {currentStudent.lastName}
            </h2>
            <p className="text-gray-600">{currentStudent.studentId}</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center text-sm text-gray-500">
                <MailIcon className="h-4 w-4 mr-1" />
                {currentStudent.email}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <PhoneIcon className="h-4 w-4 mr-1" />
                {currentStudent.phone}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              currentStudent.status === 'active' ? 'bg-green-100 text-green-800' :
              currentStudent.status === 'inactive' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {currentStudent.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['personal', 'academic', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Information
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Information */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Details</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="text-sm text-gray-900">
                      {currentStudent.firstName} {currentStudent.lastName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd className="text-sm text-gray-900 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(currentStudent.dateOfBirth)} ({calculateAge(currentStudent.dateOfBirth)} years)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Gender</dt>
                    <dd className="text-sm text-gray-900 capitalize">{currentStudent.gender}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900 flex items-center">
                      <MailIcon className="h-4 w-4 mr-1" />
                      {currentStudent.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="text-sm text-gray-900 flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-1" />
                      {currentStudent.phone}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Street</dt>
                    <dd className="text-sm text-gray-900">
                      {currentStudent.address?.street || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">City</dt>
                    <dd className="text-sm text-gray-900">
                      {currentStudent.address?.city || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">State</dt>
                    <dd className="text-sm text-gray-900">
                      {currentStudent.address?.state || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ZIP Code</dt>
                    <dd className="text-sm text-gray-900">
                      {currentStudent.address?.zipCode || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Country</dt>
                    <dd className="text-sm text-gray-900">
                      {currentStudent.address?.country || 'N/A'}
                    </dd>
                  </div>
                </dl>

                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">Guardian Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900">
                      {currentStudent.guardian?.name || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Relationship</dt>
                    <dd className="text-sm text-gray-900">
                      {currentStudent.guardian?.relationship || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="text-sm text-gray-900">
                      {currentStudent.guardian?.phone || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">
                      {currentStudent.guardian?.email || 'N/A'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* Academic Information */}
          {activeTab === 'academic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Details</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Course</dt>
                    <dd className="text-sm text-gray-900">{currentStudent.course}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Branch</dt>
                    <dd className="text-sm text-gray-900">{currentStudent.branch}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Semester</dt>
                    <dd className="text-sm text-gray-900">Semester {currentStudent.semester}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Admission Date</dt>
                    <dd className="text-sm text-gray-900 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(currentStudent.admissionDate)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hostel Information</h3>
                {currentStudent.hostel ? (
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Hostel</dt>
                      <dd className="text-sm text-gray-900">{currentStudent.hostel.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Room Number</dt>
                      <dd className="text-sm text-gray-900">{currentStudent.room?.roomNumber || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Hostel Type</dt>
                      <dd className="text-sm text-gray-900 capitalize">{currentStudent.hostel.type}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-gray-500">No hostel allocation</p>
                )}
              </div>
            </div>
          )}

          {/* Documents */}
          {activeTab === 'documents' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
              {currentStudent.documents && currentStudent.documents.length > 0 ? (
                <div className="space-y-3">
                  {currentStudent.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <FileTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            Uploaded on {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No documents uploaded</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;