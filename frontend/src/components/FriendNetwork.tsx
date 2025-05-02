import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TitleUI from "./TitleUI";
import { useLocation } from 'react-router-dom';

type User = {
    _id: string;
    username: string;
    firstname: string;
    lastname: string;
};

const API = import.meta.env.VITE_API_BASE_URL;

const FriendNetwork: React.FC = () => {
    const [friendRequests, setFriendRequests] = useState<User[]>([]);
    const [friends, setFriends] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [query, setQuery] = useState<string>('');
    const [results, setResults] = useState<User[]>([]);
    const [error, setError] = useState<string>('');
    const [searching, setSearching] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const location = useLocation();

    const fetchUserData = async () => {
        try {
            const res = await axios.get(`${API}/api/auth/me`, { withCredentials: true });
            if (res.data.success) {
                setCurrentUser(res.data.user);
                setFriendRequests(res.data.user.friendRequests || []);
                setFriends(res.data.user.friends || []);
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
        } finally {
            setLoading(false);
        }
    };

    const performSearch = async (q: string) => {
        setSearching(true);
        setError('');
        try {
            const response = await axios.get(
                `${API}/api/friends/search?query=${encodeURIComponent(q)}`,
                { withCredentials: true }
            );
            if (response.data.success) {
                setResults(response.data.users);
            } else {
                setError(response.data.msg || "Search failed.");
            }
        } catch (err) {
            console.error("Error fetching search results:", err);
            setError("Error fetching search results.");
        } finally {
            setSearching(false);
        }
    };

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!query.trim()) {
            setError("Please enter a search query.");
            return;
        }
        await performSearch(query);
    };

    const handleSendFriendRequest = async (targetId: string) => {
        if (!currentUser) {
            alert('Please log in.');
            return;
        }
        try {
            const response = await axios.post(
                `${API}/api/friends/send-request`,
                {
                    userId: currentUser._id,
                    targetId,
                },
                { withCredentials: true }
            );
            if (response.data.success) {
                alert('Friend request sent.');
            } else {
                alert(response.data.msg || 'Failed to send friend request.');
            }
        } catch (error) {
            console.error("Error sending friend request:", error);
            alert('Error sending friend request.');
        }
    };

    const handleAcceptRequest = async (requesterId: string) => {
        try {
            const meRes = await axios.get(`${API}/api/auth/me`, { withCredentials: true });
            const userId = meRes.data.user._id;

            const res = await axios.post(
                `${API}/api/friends/accept-request`,
                { userId, requesterId },
                { withCredentials: true }
            );

            if (res.data.success) {
                alert('Friend request accepted');
                fetchUserData();
            } else {
                alert(res.data.msg);
            }
        } catch (err) {
            console.error("Error accepting friend request:", err);
        }
    };

    useEffect(() => {
        fetchUserData();

        // Optional: Populate query from URL if desired
        const params = new URLSearchParams(location.search);
        const q = params.get('query') || '';
        setQuery(q);
        if (q.trim()) performSearch(q);
    }, [location.search]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <TitleUI />

            {/* Search Bar */}
            <div className="p-4">
                <h1 className="text-3xl font-bold mb-4">Search Users</h1>
                <form onSubmit={handleSearch} className="mb-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter search query"
                        className="border rounded p-2 mr-2"
                    />
                    <button type="submit" className="bg-blue-500 text-white px-3 py-2 rounded">
                        Search
                    </button>
                </form>
                {searching && <p>Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}
                <ul>
                    {results.map((user) => (
                        <li key={user._id} className="mb-2 border-b pb-2 flex items-center justify-between">
                            <div>
                                <p className="font-semibold">
                                    {user.firstname} {user.lastname} (@{user.username})
                                </p>
                            </div>
                            <button
                                onClick={() => handleSendFriendRequest(user._id)}
                                className="bg-green-500 text-white px-2 py-1 rounded ml-2"
                            >
                                Add Friend
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Friend Requests */}
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-2">Friend Requests</h2>
                {friendRequests.length === 0 ? (
                    <p>No friend requests</p>
                ) : (
                    friendRequests.map((user) => (
                        <div key={user._id} className="flex items-center justify-between bg-gray-100 p-2 my-1 rounded">
                            <div>
                                <p className="font-semibold">{user.firstname} {user.lastname}</p>
                                <p className="text-sm text-gray-600">@{user.username}</p>
                            </div>
                            <button
                                onClick={() => handleAcceptRequest(user._id)}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            >
                                Accept
                            </button>
                        </div>
                    ))
                )}

                {/* Current Friends */}
                <h2 className="text-2xl font-bold mt-6 mb-2">Current Friends</h2>
                {friends.length === 0 ? (
                    <p>No friends yet</p>
                ) : (
                    friends.map((user) => (
                        <div key={user._id} className="bg-gray-100 p-2 my-1 rounded">
                            <p className="font-semibold">{user.firstname} {user.lastname}</p>
                            <p className="text-sm text-gray-600">@{user.username}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FriendNetwork;
