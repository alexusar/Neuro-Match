import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginUI() {

  //variables for username and password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => 
    {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:6969/api/auth/login',
                {
                    username,
                    password,
                },
                { withCredentials: true }
            );

        //if logins successfully, navigate to dashboard
        if (response.data.success) {
            navigate('/moments');
          } else {
            alert(response.data.message || 'Login failed.');
          }
        } 
        catch (err) 
        {
            console.error(err);
            alert('Wrong username or password.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
          <div className="login-form bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-4xl font-bold mb-4 text-center text-gray-800">Login</h1>
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
