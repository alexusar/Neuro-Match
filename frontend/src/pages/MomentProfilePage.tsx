import React from 'react';
import { useParams } from 'react-router-dom';
import MomentProfileUI from '../components/MomentProfileUI';

const MomentProfilePage: React.FC = () => {
  const { username } = useParams(); // matches /profile/:username
  const storedUser = localStorage.getItem('user');
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;

  // fallback: if no param, use the logged-in user's username
  const finalUsername = username || parsedUser?.username;

  if (!finalUsername) {
    return <div className="text-white">❌ No username found. Please log in.</div>;
  }

  return <MomentProfileUI username={finalUsername} />;
};

export default MomentProfilePage;
