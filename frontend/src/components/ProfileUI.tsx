import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TitleUI from './TitleUI';
import { MoreVertical } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL;

interface Moment {
    _id: string;
    videoUrl: string;
    caption: string;
    userId: {
        _id: string;
        username: string;
    };
    likes: string[];
    comments: { _id: string; userId: any; text: string; createdAt: string }[];
    createdAt: string;
}

interface Post {
    id: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
}

const ProfileUI: React.FC = () => {
    const navigate = useNavigate();

    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [pronouns, setPronouns] = useState('');
    const [bio, setBio] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    // Removed unused userId state variable

    const [moments, setMoments] = useState<Moment[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [urlInput, setUrlInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    // New state for the clicked moment (modal)
    const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);

    useEffect(() => {
        axios
            .get(`${API}/api/auth/me`, { withCredentials: true })
            .then(res => {
                const user = res.data.user;
                setFirstname(user.firstname);
                setLastname(user.lastname);
                setAge(user.age ?? '');
                setPronouns(user.pronouns ?? '');
                setBio(user.bio ?? '');
                setProfilePicture(user.profilePicture ?? '');
                // userId is passed directly to fetchMoments below
                fetchMoments(user._id); // 👈 Filter by user
            })
            .catch(err => console.error('Failed to load profile:', err));
        fetchPosts();
    }, []);

    // Only fetch moments for the logged-in user!
    const fetchMoments = (userId: string) => {
        axios
            .get(`${API}/api/moments?userId=${userId}`, { withCredentials: true })
            .then(res => setMoments(res.data))
            .catch(err => console.error('Failed to load moments:', err));
    };

    const fetchPosts = () => {
        axios
            .get(`${API}/api/posts/me`, { withCredentials: true })
            .then(res => setPosts(res.data.posts))
            .catch(err => console.error('Failed to load posts:', err));
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
            setUrlInput('');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setSelectedFile(e.target.files[0]);
            setUrlInput('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile && !urlInput) return;
        setIsUploading(true);
        try {
            if (selectedFile) {
                const formData = new FormData();
                formData.append('media', selectedFile);
                await axios.post(`${API}/api/posts`, formData, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await axios.post(
                    `${API}/api/posts`,
                    { mediaUrl: urlInput },
                    { withCredentials: true }
                );
            }
            setIsModalOpen(false);
            setSelectedFile(null);
            setUrlInput('');
            fetchPosts();
        } catch (err) {
            console.error('Upload error:', err);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    // Add logout function
    const handleLogout = async () => {
        try {
            await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
            // Clear user data from localStorage
            localStorage.removeItem('user');
            // Navigate to login page
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if API call fails, clear local data and redirect
            localStorage.removeItem('user');
            navigate('/login');
        }
        setMenuOpen(false);
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
            <TitleUI />

            <div className="p-8 relative">
                <div className="flex justify-end items-center mb-4 space-x-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100"
                    >
                        Upload Media
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="text-white p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                        >
                            <MoreVertical className="w-6 h-6" />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-32 bg-white rounded shadow-lg py-1 z-50">
                                <button
                                    onClick={() => {
                                        navigate('/profile/edit');
                                        setMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                    Edit Profile
                                </button>
                                <button
                                    onClick={() => {
                                        navigate('/settings');
                                        setMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                    Settings
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                    <div className="text-center">
                        <img
                            src={profilePicture ? `${API}${profilePicture}` : '/placeholder.png'}
                            alt="Profile"
                            className="w-full max-w-xs h-auto rounded-full object-cover mx-auto"
                        />
                        <h2 className="mt-4 text-2xl font-bold">
                            {firstname} {lastname}, {age}
                        </h2>
                        <h3 className="mt-2 text-xl">{pronouns}</h3>
                        <p className="mt-2">{bio}</p>
                    </div>

                    <div className="md:col-span-2 mt-0">
                        <h3 className="text-white text-xl font-semibold mb-2">Moments</h3>
                        {/* Moments grid */}
                        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
                            {moments.length === 0 ? (
                                <p className="text-white col-span-3 text-center">
                                    No moments yet.
                                </p>
                            ) : (
                                moments.map(moment => (
                                    <div
                                        key={moment._id}
                                        className="relative w-full aspect-square overflow-hidden rounded-lg bg-gray-200 cursor-pointer group"
                                        onClick={() => setSelectedMoment(moment)}
                                    >
                                        {/* Thumbnail: video element, but no controls or sound */}
                                        <video
                                            src={moment.videoUrl.startsWith('http')
                                                ? moment.videoUrl
                                                : `${API}${moment.videoUrl}`}
                                            className="w-full h-full object-cover pointer-events-none"
                                            muted
                                            preload="metadata"
                                            playsInline
                                        />
                                        {/* Play icon overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                            <svg width={40} height={40} viewBox="0 0 48 48" fill="white">
                                                <circle cx="24" cy="24" r="22" fill="rgba(0,0,0,0.5)" />
                                                <polygon points="20,16 34,24 20,32" fill="white" />
                                            </svg>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <h3 className="text-white text-xl font-semibold mb-2">Posts</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {posts.length === 0 ? (
                                <p className="text-white col-span-3 text-center">
                                    No posts yet.
                                </p>
                            ) : (
                                posts.map(post => {
                                    const src = post.mediaUrl.startsWith('http')
                                        ? post.mediaUrl
                                        : `${API}${post.mediaUrl}`;
                                    return (
                                        <div
                                            key={post.id}
                                            className="w-full h-60 overflow-hidden rounded-sm bg-gray-200"
                                        >
                                            {post.mediaType === 'video' ? (
                                                <video
                                                    src={src}
                                                    controls
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={src}
                                                    alt="User Post"
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for uploading media */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-purple-600 bg-opacity-50 flex justify-center items-center z-20">
                    <div className="bg-white rounded-lg p-6 w-96 relative">
                        <h2 className="text-xl font-semibold mb-4">Upload Media</h2>
                        <div
                            className="border-2 border-dashed border-gray-300 rounded p-4 mb-4 text-center"
                            onDragOver={e => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                            {selectedFile ? (
                                <p>{selectedFile.name}</p>
                            ) : (
                                <p>Drag & drop file here</p>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">Paste URL</label>
                            <input
                                type="text"
                                value={urlInput}
                                onChange={e => {
                                    setUrlInput(e.target.value);
                                    setSelectedFile(null);
                                }}
                                placeholder="https://example.com/video.mp4"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">Or browse file</label>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                className="w-full border-2 border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={isUploading || (!selectedFile && !urlInput)}
                                className="bg-purple-600 border-2 text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                {isUploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Moment playback, IG/TikTok style */}
            {selectedMoment && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg overflow-hidden shadow-lg w-full max-w-md relative">
                        {/* Close button */}
                        <button
                            onClick={() => setSelectedMoment(null)}
                            className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white rounded-full p-1"
                        >✕</button>
                        {/* Video Player */}
                        <video
                            src={selectedMoment.videoUrl.startsWith('http')
                                ? selectedMoment.videoUrl
                                : `${API}${selectedMoment.videoUrl}`}
                            controls
                            autoPlay
                            className="w-full h-96 object-contain bg-black"
                        />
                        {/* Info and actions: likes, comments, etc. */}
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span>❤️ {selectedMoment.likes.length}</span>
                                <span>💬 {selectedMoment.comments.length}</span>
                            </div>
                            <p className="mb-2">{selectedMoment.caption}</p>
                            <div className="max-h-36 overflow-y-auto">
                                {selectedMoment.comments.length === 0 ? (
                                    <p className="text-gray-400 text-sm">No comments yet.</p>
                                ) : (
                                    selectedMoment.comments.slice(-10).map(comment => (
                                        <div key={comment._id} className="mb-2">
                                            <span className="font-semibold">{comment.userId?.username || "User"}: </span>
                                            <span>{comment.text}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileUI;
