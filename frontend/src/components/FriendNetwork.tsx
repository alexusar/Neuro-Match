import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TitleUI from "./TitleUI";

type User = {
    _id: string;
    username: string;
    firstname: string;
    lastname: string;
};

const FriendNetwork: React.FC = () => {
    const [friendRequests, setFriendRequests] = useState<User[]>([]);
    const [friends, setFriends] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch the current user details including friend requests and friends
    const fetchUserData = async () => {
        try {
            const res = await axios.get('http://localhost:6969/api/auth/me', { withCredentials: true });
            if (res.data.success) {
                // Assumes that friendRequests and friends are populated with user objects
                setFriendRequests(res.data.user.friendRequests || []);
                setFriends(res.data.user.friends || []);
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
        } finally {
            setLoading(false);
        }
    };

    // Function to accept a friend request
    const handleAcceptRequest = async (requesterId: string) => {
        try {
            // Get the current user ID (or reuse stored user data)
            const meRes = await axios.get('http://localhost:6969/api/auth/me', { withCredentials: true });
            const userId = meRes.data.user._id;

            const res = await axios.post(
                'http://localhost:6969/api/friends/accept-request',
                { userId, requesterId },
                { withCredentials: true } 
            );

            if (res.data.success) {
                alert('Friend request accepted');
                // Refresh the data to update the lists
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
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <TitleUI />
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
