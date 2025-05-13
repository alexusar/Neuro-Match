import { useState } from 'react';
import TitleUI from './TitleUI';

interface Reel {
  id: string;
  videoUrl: string;
  caption: string;
  likes: number;
  comments: number;
  user: {
    username: string;
    avatar: string;
  };
}

const MomentsUI = () => {
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [reels] = useState<Reel[]>([
    {
      id: '1',
      videoUrl: 'https://example.com/video1.mp4',
      caption: 'Morning workout routine 💪',
      likes: 120,
      comments: 15,
      user: {
        username: 'fitness_guru',
        avatar: 'https://example.com/avatar1.jpg'
      }
    },
    // Add more sample reels here
  ]);

  const handleNextReel = () => {
    setCurrentReelIndex((prev) => (prev + 1) % reels.length);
  };

  const handlePrevReel = () => {
    setCurrentReelIndex((prev) => (prev - 1 + reels.length) % reels.length);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <TitleUI />
      {/* Moments Header */}
      <div className="w-full bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#0f172a]">Moments</h1>
          <p className="text-gray-600 mt-1">Capture Moments. Discover Connections</p>
        </div>
      </div>
      {/* Reels Content */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="relative h-[600px] w-[350px] bg-black rounded-lg overflow-hidden shadow-xl">
          {/* Video Player */}
          <div className="absolute inset-0">
            <video
              src={reels[currentReelIndex].videoUrl}
              className="w-full h-full object-cover"
              loop
              autoPlay
              muted
            />
          </div>

          {/* Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-center mb-2">
              <img
                src={reels[currentReelIndex].user.avatar}
                alt={reels[currentReelIndex].user.username}
                className="w-8 h-8 rounded-full mr-2"
              />
              <span className="font-semibold">{reels[currentReelIndex].user.username}</span>
            </div>
            <p className="text-sm mb-2">{reels[currentReelIndex].caption}</p>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrevReel}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-xl z-10"
          >
            ↑
          </button>
          <button
            onClick={handleNextReel}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xl z-10"
          >
            ↓
          </button>

          {/* Right Floating Buttons */}
          <div className="absolute right-3 bottom-20 flex flex-col items-center space-y-4 text-white">
            {/* Star */}
            <button className="hover:scale-110 transition-transform flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
              <p className="text-sm mt-1">{reels[currentReelIndex].likes}</p>
            </button>

            {/* Comment (new icon) */}
            <button className="hover:scale-110 transition-transform flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
              </svg>
              <p className="text-sm mt-1">{reels[currentReelIndex].comments}</p>
            </button>

            {/* Bookmark */}
            <button className="hover:scale-110 transition-transform flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
            </button>

            {/* Message (Send) */}
            <button className="hover:scale-110 transition-transform flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-7 h-7">
                <path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>

            </button>
          </div>






        </div>
      </div>
    </div>
  );
};

export default MomentsUI;
