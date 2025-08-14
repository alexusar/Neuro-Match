import React, { useEffect, useRef, useState } from 'react';
import MomentSidebar from './MomentSidebar';
import MomentFooter from './MomentFooter';

interface Comment {
  _id: string;
  text: string;
  createdAt: string;
  userId: {
    username: string;
    avatar?: string;
  };
}

interface MomentVideoProps {
  videoUrl: string;
  showOverlay: boolean;
  momentId: string;
  userId: string;
  likes: string[];
  comments: Comment[];
  onUpdate: () => void;
  user: {
    username: string;
    avatar?: string;
  };
  description: string;
}

const MomentVideo: React.FC<MomentVideoProps> = ({
  videoUrl,
  momentId,
  userId,
  likes,
  comments,
  onUpdate,
  user,
  description
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Auto-play/pause based on intersection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.9) {
          videoRef.current?.play();
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.9 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  // Add this just before return in MomentVideo
console.log('MomentVideo - user:', user);
console.log('MomentVideo - momentUsername:', user?.username);


  return (
    <div ref={containerRef} className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl relative">
      <div className="w-[360px] h-[86vh] relative flex flex-col rounded-2xl overflow-hidden bg-black shadow-xl border border-gray-800">
        {/* Video Area */}
        <div className="flex-1 relative group">
          <video
            ref={videoRef}
            src={videoUrl}
            loop
            className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-95 cursor-pointer"
            onClick={handleVideoClick}
            playsInline
          />
          {/* Play Button (only when paused) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30">
              <button
                onClick={handleVideoClick}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:scale-110 transition-all duration-300 pointer-events-auto border-2 border-white/50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}


          {/* Sidebar */}
          <div className="absolute right-2 bottom-32 z-30">
            <MomentSidebar
              momentId={momentId}
              userId={userId}
              momentUsername={user.username}
              likes={likes}
              comments={comments}
              onUpdate={onUpdate}
              onCommentsToggle={setIsCommentsOpen}
            />
          </div>
        </div>
        {/* Footer stays locked at bottom, not overlapping next video */}
        {!isCommentsOpen && (
          <div className="absolute bottom-0 left-0 right-0 z-30 text-white">
            <MomentFooter
              userId={userId}
              momentId={momentId}
              comments={comments}
              username={user.username}
              avatar={user.avatar}
              description={description}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MomentVideo;
