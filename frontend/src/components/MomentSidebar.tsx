import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaUser, FaPaperPlane } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { likeMoment, addComment } from '../services/momentsAPI';
import { formatDistanceToNow } from 'date-fns';
import { Comment } from '../types/moment';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface MomentSidebarProps {
  momentId: string;
  userId: string;
  momentUsername: string;
  likes: string[];
  comments: Comment[];
  onUpdate: () => void;
  onCommentsToggle: (open: boolean) => void;
}

const MomentSidebar: React.FC<MomentSidebarProps> = ({
  momentId,
  userId,
  momentUsername,
  likes = [],
  comments = [],
  onUpdate,
  onCommentsToggle,
}) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [likeError, setLikeError] = useState<string>('');
  const [localLikes, setLocalLikes] = useState<string[]>(likes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendCount, setSendCount] = useState(0);
  
  const API = import.meta.env.VITE_API_BASE_URL;

  const navigate = useNavigate();
  const hasLiked = localLikes.includes(userId);
  console.log('MomentSidebar props:', { momentId, userId, momentUsername, likes, comments });
  
  // Fetch friends when send modal is opened
  useEffect(() => {
    if (showSendModal) {
      fetchFriends();
    }
  }, [showSendModal]);
  
  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${API}/api/auth/me`, { withCredentials: true });
      if (res.data.success && res.data.user.friends) {
        setFriends(res.data.user.friends);
      }
    } catch (err) {
      console.error('Error fetching friends:', err);
      setSendError('Failed to load friends');
    }
  };


  const handleLike = async () => {
    if (!userId) {
      setLikeError('Please log in to like moments');
      return;
    }
    setLikeError('');
    if (hasLiked) {
      setLocalLikes(prev => prev.filter(id => id !== userId));
    } else {
      setLocalLikes(prev => [...prev, userId]);
    }
    try {
      await likeMoment(momentId, userId);
      onUpdate();
    } catch (error) {
      setLikeError('Failed to like moment. Please try again.');
      setLocalLikes(likes);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addComment(momentId, commentText, userId);
      setCommentText('');
      onUpdate();
    } catch (error) {
      setLikeError('Failed to post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentsToggle = (open: boolean) => {
    setShowComments(open);
    onCommentsToggle(open);
  };

  // Function to send moment to a friend
  const handleSendToFriend = async (friendId: string) => {
    // Use the userId from props
    if (!userId || !momentId) {
      setSendError('Missing user or moment information');
      return;
    }
    
    setIsSending(true);
    setSendError('');
    
    try {
      // Send a message with the moment information
      await axios.post(
        `${API}/api/messages`,
        {
          recipientId: friendId,
          text: `Check out this moment!`,
          momentId: momentId
        },
        { withCredentials: true }
      );
      
      setSendCount(prev => prev + 1);
      setShowSendModal(false);
      alert('Moment sent successfully!');
    } catch (error) {
      console.error('Error sending moment:', error);
      setSendError('Failed to send moment. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Improved Sidebar */}
      <div className="flex flex-col items-center space-y-6 p-0 z-20 select-none">
        {/* Profile Button */}
        <button
          onClick={() => navigate(`/profile/${momentUsername}`)}
          className="flex flex-col items-center group/profile"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover/profile:bg-white/20 transition-all duration-300">
            <FaUser className="w-5 h-5 text-white group-hover/profile:text-yellow-300 transition-colors" />
          </div>
        </button>
        
        {/* Like Button */}
        <div className="flex flex-col items-center">
          <button 
            onClick={handleLike} 
            className="group/like"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover/like:bg-white/20 transition-all duration-300">
              {hasLiked ? (
                <FaHeart className="w-5 h-5 text-red-500 group-hover/like:text-red-400 group-hover/like:scale-110 transition-all" />
              ) : (
                <FaRegHeart className="w-5 h-5 text-white group-hover/like:text-red-300 group-hover/like:scale-110 transition-all" />
              )}
            </div>
            <span className="text-white text-xs mt-1 opacity-80 group-hover/like:opacity-100">{localLikes.length}</span>
          </button>
          {likeError && (
            <span className="text-red-500 text-xs mt-1">{likeError}</span>
          )}
        </div>
        
        {/* Comment Button */}
        <button
          onClick={() => handleCommentsToggle(true)}
          className="flex flex-col items-center group/comment"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover/comment:bg-white/20 transition-all duration-300">
            <svg className="w-5 h-5 text-white group-hover/comment:text-blue-300 group-hover/comment:scale-110 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-white text-xs mt-1 opacity-80 group-hover/comment:opacity-100">{comments.length}</span>
        </button>
        
        {/* Send Button */}
        <button
          onClick={() => setShowSendModal(true)}
          className="flex flex-col items-center group/send"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover/send:bg-white/20 transition-all duration-300">
            <FaPaperPlane className="w-4 h-4 text-white group-hover/send:text-green-300 group-hover/send:scale-110 transition-all" />
          </div>
          <span className="text-white text-xs mt-1 opacity-80 group-hover/send:opacity-100">{sendCount}</span>
        </button>
      </div>

      {/* Send to Friends Modal - Improved */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowSendModal(false)}
          />
          {/* Modal */}
          <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-black max-h-[80vh] rounded-2xl flex flex-col shadow-2xl animate-slideup overflow-hidden border border-gray-700">
            {/* Header */}
            <div className="w-full flex justify-between items-center px-6 py-4 border-b border-gray-700 bg-black/40">
              <h3 className="text-lg font-bold text-white flex items-center">
                <FaPaperPlane className="mr-2 text-blue-400" /> Share Moment
              </h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="p-2 hover:bg-gray-800/50 rounded-full transition-colors text-gray-300 hover:text-white"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>

            {/* Friends List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {sendError && (
                <div className="text-red-400 mb-4 p-3 bg-red-900/30 rounded-lg border border-red-800/50">{sendError}</div>
              )}
              
              {friends.length === 0 ? (
                <div className="text-center text-gray-400 py-12 px-4">
                  {isSending ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mb-3"></div>
                      <p>Loading friends...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p>No friends found. Add some friends first!</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {friends.map((friend) => (
                    <button
                      key={friend._id}
                      onClick={() => handleSendToFriend(friend._id)}
                      disabled={isSending}
                      className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-800/50 transition-all duration-300 border border-gray-700/50 hover:border-blue-500/50 group"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-3 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300 p-0.5">
                        {friend.avatar ? (
                          <img src={friend.avatar} alt={friend.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">
                              {friend.username ? friend.username[0].toUpperCase() : '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">{friend.username}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer with send button */}
            {friends.length > 0 && (
              <div className="p-4 border-t border-gray-700 bg-black/40 flex justify-end">
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center shadow-md hover:shadow-blue-500/20"
                  onClick={() => setShowSendModal(false)}
                >
                  <span>Close</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Improved Comments Drawer */}
      {showComments && (
        <div className="fixed inset-0 z-50 flex justify-center items-end">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => handleCommentsToggle(false)}
          />
          {/* Sliding comments panel */}
          <div className="relative w-full max-w-md bg-gradient-to-b from-gray-900 to-black max-h-[80vh] rounded-t-3xl flex flex-col shadow-2xl animate-slideup border-t border-x border-gray-700">
            {/* Header with gradient */}
            <div className="w-full flex justify-between items-center px-6 py-4 border-b border-gray-700 bg-black/40">
              <h3 className="text-lg font-bold text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Comments
              </h3>
              <button
                onClick={() => handleCommentsToggle(false)}
                className="p-2 hover:bg-gray-800/50 rounded-full transition-colors text-gray-300 hover:text-white"
              >
                <IoClose className="w-6 h-6" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {comments.length === 0 ? (
                <div className="text-center text-gray-400 py-12 flex flex-col items-center">
                  <svg className="w-12 h-12 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                [...comments].reverse().map((comment) => (
                  <div key={comment._id} className="flex items-start space-x-3 group hover:bg-gray-800/30 p-3 rounded-lg transition-colors duration-200">
                    <div className="flex-shrink-0">
                      {comment.userId.avatar ? (
                        <img
                          src={comment.userId.avatar}
                          alt={comment.userId.username}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-700 group-hover:border-blue-500/50 transition-colors"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-700 group-hover:border-blue-500/50 transition-colors">
                          <span className="text-white font-bold">
                            {comment.userId.username[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-white group-hover:text-blue-300 transition-colors">{comment.userId.username}</span>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300 break-words mt-1">{comment.text}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input Bar */}
            <form onSubmit={handleComment} className="px-4 py-4 border-t border-gray-700 bg-black/40 flex items-center gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-full border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-white placeholder-gray-400"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmitting}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                  !commentText.trim() || isSubmitting
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                ) : (
                  'Post'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MomentSidebar;
