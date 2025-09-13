import React, { useEffect, useState } from 'react';
import TitleUI from './TitleUI';
import MomentVideo from './MomentVideo';
import { fetchMoments } from '../services/momentsAPI';

interface Moment {
  _id: string;
  videoUrl: string;
  caption: string;
  userId: {
    _id: string;
    username: string;
    avatar?: string;
  };
  likes: string[];
  comments: Array<{
    _id: string;
    text: string;
    createdAt: string;
    userId: {
      username: string;
      avatar?: string;
    };
  }>;
}

const MomentsUI: React.FC = () => {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadMoments = async () => {
      try {
        setLoading(true);

        // Load user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && parsedUser._id) {
              setCurrentUser(parsedUser._id);
            }
          } catch (e) {
            console.error('Failed to parse localStorage user:', e);
          }
        }

        // Fetch moments
        const data = await fetchMoments();
        setMoments(data);
      } catch (err) {
        console.error('Failed to load moments:', err);
        setError('Failed to load moments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadMoments();
  }, []);

  const handleUpdate = async () => {
    try {
      const data = await fetchMoments();
      setMoments(data);
    } catch (err) {
      console.error('Failed to refresh moments:', err);
      setError('Failed to refresh moments. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">Loading moments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">{error}</div>
      </div>
    );
  }

  if (!moments.length) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <TitleUI />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">No moments available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <TitleUI />
      <div className="flex-1 overflow-y-scroll snap-y snap-mandatory">
        {moments.map((moment, index) => {
          return (
            <div
              key={moment._id}
              className="h-[90vh] snap-start flex items-center justify-center px-2 sm:px-4 md:px-6 lg:px-8"
            >
              <div className="w-full max-w-screen-sm flex justify-center">
                <MomentVideo
                  videoUrl={moment.videoUrl}
                  showOverlay={index === 0}
                  momentId={moment._id}
                  userId={currentUser}
                  likes={moment.likes}
                  comments={moment.comments}
                  onUpdate={handleUpdate}
                  user={moment.userId}
                  description={moment.caption}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MomentsUI;
