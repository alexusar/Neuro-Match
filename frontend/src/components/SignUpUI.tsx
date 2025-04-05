import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



function SignUpUI() {

    //variables for username and password
  const [username, setUsername] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => 
    {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:6969/api/register', 
            {
                username,
                firstname,
                lastname,
                email,
                password,
            });

        //if registers successfully, navigate to dashboard
        if (response.status === 200) 
            {
            navigate('/login');
        } 
        else 
        {
            alert('Registration failed.');
        }
        } 
        catch (err) 
        {
            console.error(err);
            alert('Something went wrong');
        }
    };


    
    return (
        <div className="register-container">
          <div className="register-form">
            <h1 className="text-4xl font-bold mb-4">Register</h1>
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
                type="text"
                name="firstname"
                placeholder="First Name"
                required
                className="mb-2 p-2 border rounded"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
              <input
                type="text"
                name="lastname"
                placeholder="Last Name"
                required
                className="mb-2 p-2 border rounded"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="mb-2 p-2 border rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                Register
              </button>
            </form>
          </div>
    
          <div className="login-link mt-4">
            <p>
              Already have an account?{' '}
              <a href="/login" className="text-blue-500">
                Login
              </a>
            </p>
          </div>
        </div>
      );
    }
    
    export default SignUpUI;