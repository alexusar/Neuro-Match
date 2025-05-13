import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      // Prevent double verification
      if (isVerifying) return;
      setIsVerifying(true);

      try {
        const API = import.meta.env.VITE_API_BASE_URL;
        console.log('Verifying email with token:', token);
        const response = await axios.get(`${API}/api/auth/verify/${token}`, {
          withCredentials: true
        });
        
        if (response.data.success) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to login...');
          setTimeout(() => navigate('/'), 3000);
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Invalid verification link. Please try registering again.');
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        // If we get a 400 error, it might mean the email was already verified
        if (error.response?.status === 400) {
          setStatus('success');
          setMessage('Email verified! Redirecting to login...');
          setTimeout(() => navigate('/'), 3000);
        } else {
          setStatus('error');
          setMessage(error.response?.data?.message || 'Failed to verify email. Please try registering again.');
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, navigate, isVerifying]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-center text-gray-800">Email Verification</h1>
        <div className={`p-4 rounded ${
          status === 'verifying' ? 'bg-blue-100 text-blue-700' :
          status === 'success' ? 'bg-green-100 text-green-700' :
          'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
        {status === 'error' && (
          <div className="mt-4 text-center">
            <a 
              href="/register" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Return to Registration
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage; 