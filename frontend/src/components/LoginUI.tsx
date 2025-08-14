import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginUI() {

  const API = import.meta.env.VITE_API_BASE_URL;

  //variables for username and password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(
        `${API}/api/auth/login`,
        {
          username,
          password,
        },
        { withCredentials: true }
      );

      //if logins successfully, navigate to dashboard
      if (response.data.success) {
        // ✅ Store user in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // ✅ Then navigate
        navigate('/moments');
      } else {
        setError(response.data.message || 'Login failed.');
      }

    }
    catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
        setError('Please verify your email before logging in. Check your inbox for the verification link.');
      } else {
        setError(err.response?.data?.message || 'Wrong username or password.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 pt-0">

      <h1 className="text-5xl font-extrabold mb-23 text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-800">NeuroMatch</h1>

      <div className="login-form bg-white p-9 rounded-xl shadow-lg w-[28rem]">
        <h1 className="text-4xl font-bold mb-4 text-center text-gray-800">Login</h1>
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            className="mb-2 p-2 border border-gray-300 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="mb-4 p-2 border border-gray-300 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition">
            Login
          </button>
        </form>
        <div className="register-link mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-purple-300 hover:text-purple-200 font-medium">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginUI;
