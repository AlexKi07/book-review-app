import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inactivityTimer, setInactivityTimer] = useState(null);
  const isMounted = useRef(true); // ✅ track mount state

  const navigate = useNavigate();
  const { login } = useAuth();

  const resetInactivityTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);

    const timer = setTimeout(() => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      if (isMounted.current) {
        toast.info('You have been logged out due to inactivity');
        navigate('/login');
      }
    }, 1800000); // 30 minutes

    setInactivityTimer(timer);
  };

  useEffect(() => {
    isMounted.current = true;

    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    events.forEach(event => window.addEventListener(event, resetInactivityTimer));

    return () => {
      isMounted.current = false;
      events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        toast.success('Login successful!');
        resetInactivityTimer();
        navigate('/dashboard');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error('Login failed. Please try again.');
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiLock className="text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FiEyeOff className="text-gray-400 hover:text-gray-600" />
              ) : (
                <FiEye className="text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
              isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center mt-4">
            <a href="/forgot-password" className="text-blue-600 hover:underline text-sm">
              Forgot password?
            </a>
          </div>
        </form>
      </div>
      <p className="mt-4 text-sm text-center">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-500 hover:underline">
          Register
        </Link>
      </p>
    </>
  );
}

export default LoginForm;
