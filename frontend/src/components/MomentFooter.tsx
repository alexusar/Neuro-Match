import React from 'react';
import { Comment } from '../types/moment';

interface MomentFooterProps {
  userId: string;
  momentId: string;
  comments: Comment[];
  username: string;
  avatar?: string;
  description: string;
}

const MomentFooter: React.FC<MomentFooterProps> = ({
  username,
  avatar,
  description
}) => {
  return (
    <div className="text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-2xl px-5 py-4 shadow-lg">
      {/* User info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 shadow-lg">
          {avatar ? (
            <img src={avatar} alt={username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600 font-semibold text-lg">
              {username[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold tracking-wide text-white">@{username}</span>
          <span className="text-xs text-gray-300">Creator</span>
        </div>
      </div>
      
      {/* Description with better styling */}
      {description && (
        <div className="mb-3">
          <p className="text-sm text-gray-100">{description}</p>
        </div>
      )}
      
      {/* Music info with improved styling */}
      <div className="flex items-center gap-2 mt-2 text-gray-200 text-xs font-light w-fit">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
        </svg>
        <span>Original Sound • {username}</span>
      </div>
    </div>
  );
};

export default MomentFooter;
