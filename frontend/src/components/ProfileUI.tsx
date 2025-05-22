import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TitleUI from './TitleUI';
import { MoreVertical } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE_URL;

interface Post {
    id: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
}

const ProfileUI: React.FC = () => {
    const navigate = useNavigate();

    // User profile state
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [pronouns, setPronouns] = useState('');
    const [bio, setBio] = useState('');
    const [profilePicture, setProfilePicture] = useState('');

    // Posts grid state
    const [posts, setPosts] = useState<Post[]>([]);

    // Upload modal & dropdown state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [urlInput, setUrlInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    // Fetch profile data
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
            })
            .catch(err => console.error('Failed to load profile:', err));
    }, []);

    // Fetch posts
    const fetchPosts = () => {
        axios
            .get(`${API}/api/posts/me`, { withCredentials: true })
            .then(res => setPosts(res.data.posts))
            .catch(err => console.error('Failed to load posts:', err));
    };
    useEffect(fetchPosts, []);

    // Drag & drop handlers
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
            setUrlInput('');
        }
    };

    // File input handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setSelectedFile(e.target.files[0]);
            setUrlInput('');
        }
    };

    // Upload (file or URL)
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

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
            <TitleUI />

            <div className="p-8 relative">
                {/* Top-right controls */}
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
                            <div className="absolute right-0 mt-2 w-32 bg-white rounded shadow-lg py-1">
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
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile + Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                    {/* Sidebar: Avatar & Bio */}
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

                    {/* Posts Grid */}
                    <div className="md:col-span-2 mt-0">
                        <div className="grid grid-cols-3 gap-4">
                            {posts.length === 0 ? (
                                <p className="text-white col-span-3 text-center">
                                    No posts yet.
                                </p>
                            ) : (
                                posts.map(post => {
                                    // build full URL for static media
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

            {/* Upload Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-purple-600 bg-opacity-50 flex justify-center items-center z-20">
                    <div className="bg-white rounded-lg p-6 w-96 relative">
                        <h2 className="text-xl font-semibold mb-4">Upload Media</h2>

                        {/* Drag & Drop Area */}
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

                        {/* URL Input */}
                        <div className="mb-4">
                            <label className="block mb-1">Paste URL</label>
                            <input
                                type="text"
                                value={urlInput}
                                onChange={e => {
                                    setUrlInput(e.target.value);
                                    setSelectedFile(null);
                                }}
                                placeholder="https://example.com/media.jpg"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>

                        {/* Browse File */}
                        <div className="mb-4">
                            <label className="block mb-1">Or browse file</label>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                className="w-full border-2 border-gray-300 rounded px-3 py-2"
                            />
                        </div>

                        {/* Modal Actions */}
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
        </div>
    );
};

export default ProfileUI;