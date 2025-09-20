import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  BuildingIcon,
  BookOpenIcon,
  BarChartIcon,
  XIcon
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Students', href: '/students', icon: UsersIcon },
  { name: 'Fee Management', href: '/fees', icon: CreditCardIcon },
  { name: 'Hostel Management', href: '/hostels', icon: BuildingIcon },
  { name: 'Exam Records', href: '/exams', icon: BookOpenIcon },
  { name: 'Reports', href: '/reports', icon: BarChartIcon },
];

const Sidebar = ({ open, setOpen }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-800 transform transition duration-300 ease-in-out lg:static lg:inset-0 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-blue-900">
          <div className="flex items-center">
            <span className="text-white text-xl font-semibold">
              Student ERP
            </span>
          </div>
          <button
            className="text-white lg:hidden"
            onClick={() => setOpen(false)}
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-blue-700">
            <div className="px-4">
              <p className="text-blue-100 text-xs font-semibold uppercase">
                User Role
              </p>
              <p className="text-blue-200 text-sm mt-1">
                {user?.role?.toUpperCase()}
              </p>
              {user?.department && (
                <p className="text-blue-200 text-sm mt-1">
                  {user.department}
                </p>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;