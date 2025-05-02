import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

type User = {
    _id: string;
    username: string;
    firstname: string;
    lastname: string;
};

const SearchResultsUI: React.FC = () => {
    const [query, setQuery] = useState<string>('');
    const [results, setResults] = useState<User[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const location = useLocation();

    // Fetch current logged-in user data
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const res = await axios.get('http://localhost:6969/api/auth/me', { withCredentials: true });
                if (res.data.success) {
                    setCurrentUser(res.data.user);
                }
            } catch (err) {
                console.error("Error fetching current user:", err);
            }
        };
        fetchCurrentUser();
    }, []);

    // Extract query from URL and perform search
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('query') || '';
        setQuery(q);
        if (q.trim()) {
            performSearch(q);
        }
    }, [location.search]);

    const performSearch = async (q: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(
                `http://localhost:6969/api/friends/search?query=${encodeURIComponent(q)}`,
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
            setLoading(false);
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

    // Function to send a friend request to a user
    const handleSendFriendRequest = async (targetId: string) => {
        if (!currentUser) {
            alert('Please log in.');
            return;
        }
        try {
            const response = await axios.post(
                'http://localhost:6969/api/friends/send-request',
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

    return (
        <div className="container p-4">
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
            {loading && <p>Loading...</p>}
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
    );
};

export default SearchResultsUI;