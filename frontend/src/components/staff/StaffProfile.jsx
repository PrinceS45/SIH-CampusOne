import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MailIcon, 
  PhoneIcon, 
  CalendarIcon, 
  MapPinIcon, 
  UserIcon,
  EditIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  ClockIcon,
  ArrowLeftIcon
} from 'lucide-react';
import useStaffStore from '../../stores/staffStore';
import Loader from '../common/Loader';

const StaffProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { staffDetails, loading, fetchStaffById } = useStaffStore();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (id) {
      fetchStaffById(id);
    }
  }, [id, fetchStaffById]);

  if (loading) return <Loader />;
  if (!staffDetails) return (
    <div className="flex flex-col items-center justify-center p-12">
      <h2 className="text-2xl font-bold text-gray-800">Staff Profile Not Found</h2>
      <button onClick={() => navigate('/staff')} className="mt-4 text-blue-600 hover:underline">Back to Staff List</button>
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate('/staff')} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group">
          <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Staff List</span>
        </button>
        <Link
          to={`/staff/${id}/edit`}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          <EditIcon className="h-4 w-4" />
          <span className="font-semibold text-sm">Edit Profile</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-12 flex flex-col md:flex-row md:items-end md:space-x-6">
            <div className="h-32 w-32 rounded-3xl bg-white p-1 shadow-xl">
              {staffDetails.photo ? (
                <img src={staffDetails.photo} alt="" className="h-full w-full rounded-2xl object-cover" />
              ) : (
                <div className="h-full w-full rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-4xl">
                  {staffDetails.firstName[0]}{staffDetails.lastName[0]}
                </div>
              )}
            </div>
            <div className="mt-6 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900">{staffDetails.firstName} {staffDetails.lastName}</h1>
                  <p className="text-blue-600 font-semibold mt-1">{staffDetails.designation} • {staffDetails.department}</p>
                </div>
                <div className="hidden md:block">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    staffDetails.status === 'active' ? 'bg-green-100 text-green-700' :
                    staffDetails.status === 'on-leave' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {staffDetails.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <MailIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Email Address</p>
                <p className="text-sm font-semibold text-gray-700">{staffDetails.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <PhoneIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Phone Number</p>
                <p className="text-sm font-semibold text-gray-700">{staffDetails.phone || 'Not Provided'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <BriefcaseIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Employee ID</p>
                <p className="text-sm font-semibold text-gray-700">{staffDetails.staffId}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              {['profile', 'experience'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 text-sm font-bold transition-all ${
                    activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab === 'profile' ? 'Full Profile' : 'Qualifications'}
                </button>
              ))}
            </div>
            <div className="p-8">
              {activeTab === 'profile' ? (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                      <UserIcon className="h-4 w-4 mr-2" />
                      About Employee
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="text-gray-500 text-sm">Full Name</span>
                        <span className="font-semibold text-gray-900">{staffDetails.firstName} {staffDetails.lastName}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="text-gray-500 text-sm">Gender</span>
                        <span className="font-semibold text-gray-900 capitalize">{staffDetails.gender}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="text-gray-500 text-sm">Date of Birth</span>
                        <span className="font-semibold text-gray-900">{formatDate(staffDetails.dateOfBirth)}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="text-gray-500 text-sm">Joining Date</span>
                        <span className="font-semibold text-gray-900">{formatDate(staffDetails.joiningDate)}</span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      Permanent Address
                    </h3>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-start space-x-4">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        {staffDetails.address?.street ? (
                          <>
                            <p className="text-gray-900 font-semibold">{staffDetails.address.street}</p>
                            <p className="text-gray-500 text-sm">{staffDetails.address.city}, {staffDetails.address.state} - {staffDetails.address.zip}</p>
                            <p className="text-gray-500 text-sm">{staffDetails.address.country}</p>
                          </>
                        ) : (
                          <p className="text-gray-500 italic">No address provided</p>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                      <GraduationCapIcon className="h-4 w-4 mr-2" />
                      Qualifications
                    </h3>
                    <div className="p-6 rounded-2xl border-2 border-dashed border-gray-100">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {staffDetails.qualification || 'No qualification details provided.'}
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Professional Experience
                    </h3>
                    <div className="p-6 rounded-2xl border-2 border-dashed border-gray-100">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {staffDetails.experience || 'No previous experience records provided.'}
                      </p>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Side Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <BriefcaseIcon className="h-5 w-5 mr-3 text-blue-600" />
              Work Overview
            </h3>
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-extrabold uppercase">Department</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">{staffDetails.department}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <UserIcon className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-start justify-between pt-4 border-t border-gray-50">
                <div>
                  <p className="text-xs text-gray-400 font-extrabold uppercase">Service Length</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">
                    {Math.floor((new Date() - new Date(staffDetails.joiningDate))/(1000 * 60 * 60 * 24 * 365))} Years
                  </p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <ClockIcon className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100 p-8 text-white relative overflow-hidden">
             <div className="relative z-10">
               <h4 className="text-xl font-bold mb-2">Need to contact?</h4>
               <p className="text-indigo-100 text-sm mb-6 opacity-80">Official contact information is verified by HR department.</p>
               <a href={`mailto:${staffDetails.email}`} className="block w-full text-center bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-opacity-90 transition-all active:scale-95">
                 Send Email
               </a>
             </div>
             <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
