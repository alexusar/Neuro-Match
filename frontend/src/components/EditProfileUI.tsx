import React, {
    useState,
    useEffect,
    DragEvent,
    ChangeEvent,
    useCallback,
} from 'react';
import axios from 'axios';
import TitleUI from './TitleUI';
import { MoreVertical } from 'lucide-react';
import Cropper, { Area } from 'react-easy-crop';

// helper to load an image
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
    });

// helper to get the cropped area from canvas
async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob!);
            reader.onloadend = () => resolve(reader.result as string);
        }, 'image/jpeg');
    });
}

const API = import.meta.env.VITE_API_BASE_URL;

interface Post {
    id: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
}

const ProfileUI: React.FC = () => {
    // --- Profile state ---
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [pronouns, setPronouns] = useState('');
    const [pronounInput, setPronounInput] = useState('');
    const [bio, setBio] = useState('');
    const [profilePicture, setProfilePicture] = useState(''); // holds the final cropped Data-URL or existing URL

    // --- Posts state ---
    const [posts, setPosts] = useState<Post[]>([]);

    // --- Profile‐pic‐edit modal state ---
    const [isPicModalOpen, setIsPicModalOpen] = useState(false);
    const [picFile, setPicFile] = useState<File | null>(null);
    const [picUrlInput, setPicUrlInput] = useState('');
    const [picPreviewSrc, setPicPreviewSrc] = useState('');        // image to feed into Cropper
    const [crop, setCrop] = useState({ x: 0, y: 0 });              // position for Cropper
    const [zoom, setZoom] = useState(1);                           // zoom for Cropper
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>(null);

    // --- Upload Media modal & dropdown menu state (unchanged) ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [urlInput, setUrlInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    // --- Fetch data on mount ---
    useEffect(() => {
        fetchProfile();
        fetchPosts();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API}/api/auth/me`, {
                withCredentials: true,
            });
            const user = res.data.user;
            setFirstname(user.firstname);
            setLastname(user.lastname);
            setAge(user.age ?? '');
            setPronouns(user.pronouns ?? '');
            setBio(user.bio ?? '');
            setProfilePicture(user.profilePicture ?? '');
        } catch (err) {
            console.error('Failed to load profile:', err);
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await axios.get(`${API}/api/posts/me`, {
                withCredentials: true,
            });
            setPosts(res.data.posts);
        } catch (err) {
            console.error('Failed to load posts:', err);
        }
    };

    // --- Profile Picture Edit Handlers ---

    // open modal and seed preview from existing pic
    const openPicModal = () => {
        setPicPreviewSrc(profilePicture);
        setPicFile(null);
        setPicUrlInput('');
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setIsPicModalOpen(true);
    };

    // drop file
    const handlePicDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const preview = URL.createObjectURL(file);
            setPicFile(file);
            setPicPreviewSrc(preview);
            setPicUrlInput('');
        }
    };

    // select file via browse
    const handlePicFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const preview = URL.createObjectURL(file);
            setPicFile(file);
            setPicPreviewSrc(preview);
            setPicUrlInput('');
        }
    };

    // paste URL input
    const handlePicUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPicUrlInput(e.target.value);
        setPicFile(null);
        setPicPreviewSrc(e.target.value);
    };

    // Drag & drop handlers for modal
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // Upload file or URL
    const handleUpload = async () => {
        if (!selectedFile && !urlInput) return;
        setIsUploading(true);
        try {
            if (selectedFile) {
                const formData = new FormData();
                formData.append('media', selectedFile);
                await axios.post(
                    `${API}/api/posts`,
                    formData,
                    { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
                );
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
            console.error('Upload failed:', err);
            alert('Upload failed.');
        } finally {
            setIsUploading(false);
        }
    };

    // when crop complete
    const onCropComplete = useCallback(
        (_: Area, croppedPixels: Area) => {
            setCroppedAreaPixels(croppedPixels);
        },
        []
    );

    // confirm & update state (preview only)
    const handlePicConfirm = async () => {
        if (!picPreviewSrc || !croppedAreaPixels) return;
        const croppedDataUrl = await getCroppedImg(picPreviewSrc, croppedAreaPixels);
        setProfilePicture(croppedDataUrl);
        setIsPicModalOpen(false);
    };

    // --- Save entire profile (unchanged) ---
    const handleSave = () => {
        axios
            .put(
                `${API}/api/auth/me`,
                { age, pronouns, bio, profilePicture },
                { withCredentials: true }
            )
            .then(() => alert('Profile saved successfully!'))
            .catch((err) => {
                if (typeof age === 'number' && age < 18) {
                    alert('Age cannot be less than 18');
                } else {
                    console.error('Save failed:', err);
                    alert('Unable to save. Please try again later.');
                }
            });
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
            <TitleUI />

            <div className="p-8">
                {/* Top bar: Upload + Kebab (unchanged) */}
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
                                    onClick={() => {/* ... */ }}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                    Settings
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                    {/* Sidebar: profile + posts */}
                    <div className="text-center">
                        {/* Profile picture with Edit overlay */}
                        <div className="relative inline-block mx-auto">
                            <img
                                src={profilePicture ? `${API}${profilePicture}` : '/placeholder.png'}
                                alt="Profile"
                                className="w-48 h-48 rounded-full object-cover"
                            />
                            <button
                                onClick={openPicModal}
                                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 text-sm px-3 py-1 rounded"
                            >
                                Edit
                            </button>
                        </div>

                        <h2 className="mt-4 text-2xl font-bold">
                            {firstname} {lastname}, {age}
                        </h2>
                        <h3 className="mt-2 text-lg">{pronouns}</h3>
                        <p className="mt-2 text-sm px-4">{bio}</p>

                        <div className="mt-6 grid grid-cols-3 gap-2">
                            {posts.map((post) => {
                                const src = post.mediaUrl.startsWith('http')
                                    ? post.mediaUrl
                                    : `${API}${post.mediaUrl}`;
                                return (
                                    <div
                                        key={post.id}
                                        className="w-full h-28 overflow-hidden rounded-sm"
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
                            })}
                        </div>
                    </div>

                    {/* Profile edit form: age, pronouns, bio & save */}
                    <div className="md:col-span-2 space-y-6">
                        {/* -- Profile Picture URL field REMOVED -- */}

                        {/* Age */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Age</label>
                            <input
                                type="number"
                                min={18}
                                value={age}
                                onChange={(e) =>
                                    setAge(e.target.value === '' ? '' : Number(e.target.value))
                                }
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                            />
                        </div>

                        {/* Pronouns */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Pronouns
                            </label>
                            <select
                                value={pronouns}
                                onChange={(e) => setPronouns(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                            >
                                <option value="">Select pronouns</option>
                                <option value="She/Her">She/Her</option>
                                <option value="He/Him">He/Him</option>
                                <option value="They/Them">They/Them</option>
                                <option value="other">Other…</option>
                            </select>
                            {pronouns === 'other' && (
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Please specify pronouns"
                                    value={pronounInput}
                                    onChange={(e) => setPronounInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            setPronouns(pronounInput);
                                        }
                                    }}
                                    className="w-full mt-2 bg-white border border-gray-300 rounded px-3 py-2"
                                />
                            )}
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={5}
                                className="w-full bg-white border border-gray-300 rounded px-3 py-2"
                            />
                        </div>

                        {/* Save button */}
                        <div className="text-right">
                            <button
                                onClick={handleSave}
                                className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* -------- Profile Picture Edit Modal -------- */}
            {isPicModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
                    <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-auto">
                        <h2 className="text-xl font-semibold mb-4">Edit Profile Picture</h2>

                        {/* Drag & Drop area */}
                        <div
                            className="border-2 border-dashed border-gray-300 rounded p-4 mb-4 text-center cursor-pointer"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handlePicDrop}
                        >
                            {!picPreviewSrc && <p>Drag & drop file here</p>}
                            {picFile && <p className="truncate">{picFile.name}</p>}
                        </div>

                        {/* URL input */}
                        <div className="mb-4">
                            <label className="block mb-1">Or paste URL</label>
                            <input
                                type="text"
                                value={picUrlInput}
                                onChange={handlePicUrlChange}
                                placeholder="https://example.com/image.jpg"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>

                        {/* Browse file */}
                        <div className="mb-4">
                            <label className="block mb-1">Or browse file</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePicFileChange}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                        </div>

                        {/* Cropper preview */}
                        {picPreviewSrc && (
                            <div className="relative w-full h-64 bg-gray-100 mb-4">
                                <Cropper
                                    image={picPreviewSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    cropShape="round"
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                />
                            </div>
                        )}

                        {/* Zoom slider */}
                        {picPreviewSrc && (
                            <div className="mb-4">
                                <label className="block mb-1">Zoom</label>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        )}

                        {/* Modal actions */}
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsPicModalOpen(false)}
                                className="px-4 py-2 rounded hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePicConfirm}
                                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                                disabled={!picPreviewSrc || !croppedAreaPixels}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* -------- Upload Media Modal (unchanged) -------- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-purple-600 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h2 className="text-xl font-bold mb-4">Upload Media</h2>
                        <div
                            className="border-2 border-dashed border-gray-300 rounded p-4 text-center mb-4 cursor-pointer"
                            onDragOver={(e) => e.preventDefault()
                            }
                            onDrop={handleDrop}
                        >
                            {selectedFile ? (
                                <p className="truncate">{selectedFile.name}</p>
                            ) : (
                                <p>Drag & drop file here</p>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm mb-1">Or paste URL</label>
                            <input
                                type="text"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                className="w-full border-2 border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                                placeholder="https://example.com/media.jpg"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm mb-1">Or browse file</label>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                className="w-full border-2 border-gray-300 rounded px-3 py-2"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedFile(null);
                                    setUrlInput('');
                                }}
                                className="px-4 py-2 rounded hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={isUploading || (!selectedFile && !urlInput)}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
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