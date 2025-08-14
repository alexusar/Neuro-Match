import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TitleUI from './TitleUI';
import MomentVideo from './MomentVideo';

interface User {
  _id: string;
  username: string;
  avatar?: string;
}

interface Moment {
  _id: string;
  videoUrl: string;
  caption: string;
  userId: User;
  likes: string[];
  comments: any[];
  createdAt: string;
}

interface Post {
  _id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
}

const TABS = [
  { label: "Moments", value: "moments" },
  { label: "Posts", value: "posts" },
];

const MomentProfileUI: React.FC<{ username: string }> = ({ username }) => {
  const [user, setUser] = useState<User | null>(null);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"moments" | "posts">("moments");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const API = import.meta.env.VITE_API_BASE_URL;
      try {
        const userRes = await axios.get(`${API}/api/users/username/${username}`, { withCredentials: true });
        setUser(userRes.data);

        // Moments
        try {
          const momentRes = await axios.get(`${API}/api/moments?userId=${userRes.data._id}`, { withCredentials: true });
          setMoments(Array.isArray(momentRes.data) ? momentRes.data : []);
        } catch {
          setMoments([]);
        }

        // Posts
        try {
          const postRes = await axios.get(`${API}/api/posts?userId=${userRes.data._id}`, { withCredentials: true });
          setPosts(Array.isArray(postRes.data.posts) ? postRes.data.posts : (Array.isArray(postRes.data) ? postRes.data : []));
        } catch {
          setPosts([]);
        }
      } catch {
        setUser(null);
        setMoments([]);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">User not found</div>
      </div>
    );
  }

  // Profile Banner
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <TitleUI />

      <div className="flex flex-col items-center mt-6 mb-2">
        <div className="relative">
          <img
            src={user.avatar || "/placeholder.png"}
            alt={user.username}
            className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
          />
          {/* Optionally, add a border/gradient or badge */}
        </div>
        <h1 className="mt-4 text-2xl md:text-3xl font-bold text-white drop-shadow">{user.username}</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center mb-4 mt-2 sticky top-0 z-10 bg-gradient-to-br from-blue-500 to-purple-600 bg-opacity-80">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as "moments" | "posts")}
            className={`px-6 py-2 mx-2 rounded-full font-semibold transition ${
              activeTab === tab.value
                ? "bg-white text-purple-600 shadow"
                : "bg-transparent text-white hover:bg-white hover:bg-opacity-20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="flex-1 px-2 md:px-8 pb-16">
        {activeTab === "moments" ? (
          <div>
            <h2 className="text-white text-xl font-bold px-4 mb-4">Moments</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {moments.length === 0 ? (
                <div className="col-span-full text-white text-center mt-12 opacity-70">No moments yet.</div>
              ) : (
                moments.map((moment) => (
                  <div
                    key={moment._id}
                    className="rounded-2xl bg-black/40 overflow-hidden shadow-lg hover:scale-[1.03] transition"
                  >
                    <MomentVideo
                      videoUrl={moment.videoUrl}
                      showOverlay={false}
                      momentId={moment._id}
                      userId={user._id}
                      likes={moment.likes}
                      comments={moment.comments}
                      onUpdate={() => {}}
                      user={user}
                      description={moment.caption}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-white text-xl font-bold px-4 mb-4">Posts</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {posts.length === 0 ? (
                <div className="col-span-full text-white text-center mt-12 opacity-70">No posts yet.</div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post._id}
                    className="rounded-2xl bg-black/40 overflow-hidden shadow-lg hover:scale-[1.03] transition flex items-center justify-center aspect-square"
                  >
                    {post.mediaType === 'video' ? (
                      <video
                        src={
                          post.mediaUrl.startsWith('http')
                            ? post.mediaUrl
                            : `${import.meta.env.VITE_API_BASE_URL}${post.mediaUrl}`
                        }
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={
                          post.mediaUrl.startsWith('http')
                            ? post.mediaUrl
                            : `${import.meta.env.VITE_API_BASE_URL}${post.mediaUrl}`
                        }
                        alt="Post"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MomentProfileUI;
