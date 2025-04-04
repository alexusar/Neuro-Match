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
            const response = await axios.post('http://localhost:6969/api/login', 
            {
                username,
                password,
            });

        //if logins successfully, navigate to dashboard
        if (response.status === 200) 
            {
            navigate('/dashboard');
        } 
        else 
        {
            alert('Login failed.');
        }
        } 
        catch (err) 
        {
            console.error(err);
            alert('Wrong username or password.');
        }
    };

    return (
        <div className="login-container">
        <div className="login-form">
            <h1 className="text-4xl font-bold mb-4">Login</h1>
            <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="username"
                placeholder="Username"
                required
                className="mb-2 p-2 border rounded"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="mb-2 p-2 border rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                Login
            </button>
            </form>
        </div>
        <div className="register-link mt-4">
            <p>
            Don't have an account?{' '}
            <a href="/register" className="text-blue-500">
                Register
            </a>
            </p>
        </div>
    </div>
  );
}

export default LoginUI;
