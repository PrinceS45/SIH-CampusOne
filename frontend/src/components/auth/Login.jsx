import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon, UserIcon, IdCardIcon } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    
    try {
      // Send both email and studentId, backend will handle either
      await login({ email, studentId, password });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    // Validation
    if (password !== confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setRegisterError('Password must be at least 6 characters');
      return;
    }

   try {
  const response = await api.post('/auth/register/student', {
    name,
    studentId,
    email,
    password
  });

  setRegisterSuccess('Registration successful! You can now login.');
  setIsRegistering(false);
  // Clear form
  setName('');
  setStudentId('');
  setEmail('');
  setPassword('');
  setConfirmPassword('');
  
} catch (error) {
  throw new Error(error.response?.data?.message || error.message || 'Registration failed');
}
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setRegisterError('');
    setRegisterSuccess('');
    // Clear errors from auth store when switching modes
    if (error) {
      // You might need to add a clearError function to your authStore
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">ERP</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isRegistering ? 'Student Registration' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Student Management System
          </p>
        </div>

        {/* Success Message */}
        {registerSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {registerSuccess}
          </div>
        )}

        {/* Error Messages */}
        {(error || registerError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || registerError}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={isRegistering ? handleStudentRegister : handleLogin}>
          <div className="space-y-4">
            {/* Registration Fields */}
            {isRegistering && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                    Student ID
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IdCardIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="studentId"
                      name="studentId"
                      type="text"
                      required
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter your student ID"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Field - Show for both login and register */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Student ID for Login - Optional */}
            {/* {!isRegistering && (
              <div>
                <label htmlFor="studentIdLogin" className="block text-sm font-medium text-gray-700">
                  Student ID (optional)
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IdCardIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="studentIdLogin"
                    name="studentIdLogin"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Or enter your student ID"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Use either email or student ID to login</p>
              </div>
            )} */}

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={isRegistering ? "Create a password" : "Enter your password"}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm Password for Registration */}
            {isRegistering && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Confirm your password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isRegistering ? 'Register as Student' : 'Sign in')}
            </button>
          </div>

          {/* Toggle between Login and Register */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isRegistering 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up as Student"}
            </button>
          </div>

          {!isRegistering && (
            <div className="text-center">
              <Link
                to="#"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
          )}
        </form>

        {/* Demo Credentials - Only show for login */}
        {!isRegistering && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Demo Credentials:{' '}
              <span className="font-mono text-xs bg-gray-100 p-1 rounded">
                email : admin45@gmail.com / password : 7054454265
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;