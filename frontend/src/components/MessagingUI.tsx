import React, { useState, useEffect, useRef } from 'react';
import TitleUI from './TitleUI';
import { io, Socket } from 'socket.io-client';

const API = import.meta.env.VITE_API_BASE_URL;

interface User {
    _id: string;
    username: string;
    firstname: string;
    lastname: string;
}

interface Message {
    _id: string;
    senderId: string;
    recipientId: string;
    text: string;
    momentId?: string;
    createdAt: string;
}

const MessagingUI: React.FC = () => {
    const [userId, setUserId] = useState<string>('');
    const [friends, setFriends] = useState<User[]>([]);
    const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const socketRef = useRef<Socket | null>(null);

    // Initialize socket and fetch current user/friends on mount
    useEffect(() => {
        // fetch current user info
        fetch(`${API}/api/auth/me`, { credentials: 'include' })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setUserId(data.user._id);
                    setFriends(data.user.friends);
                }
            });

        // connect socket.io
        const socket = io(`${API}`, {
            withCredentials: true,
        });
        socketRef.current = socket;

        // listen for incoming messages
        socket.on('receive_message', (msg: Message) => {
            // only add messages for current conversation
            if (
                selectedFriend &&
                (msg.senderId === selectedFriend._id || msg.recipientId === selectedFriend._id)
            ) {
                setMessages((prev) => [...prev, msg]);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [selectedFriend]);

    // Join the room for the selected friend
    useEffect(() => {
        if (!selectedFriend || !userId || !socketRef.current) return;

        // room name based on sorted IDs
        const room = [userId, selectedFriend._id].sort().join('_');
        socketRef.current.emit('join_room', room);

        // fetch existing messages via REST
        fetch(`${API}/api/messages?with=${selectedFriend._id}`, {
            credentials: 'include',
        })
            .then((res) => res.json())
            .then((data) => setMessages(data));
    }, [selectedFriend, userId]);

    // Send a new message via socket
    const handleSendMessage = () => {
        if (!selectedFriend || !newMessage.trim() || !socketRef.current) return;

        const msgData = {
            senderId: userId,
            recipientId: selectedFriend._id,
            text: newMessage.trim(),
        };

        // emit to server
        socketRef.current.emit('send_message', msgData);
        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-500 to-purple-600">
          <TitleUI />
      
          {/* Background color selector */}
          <div className="p-2  border-b flex items-center gap-4">
            <label className="text-sm font-medium">Chat Background:</label>

            {/* Color Picker */}
            <input
                type="color"
                defaultValue="#ffffff"
                onChange={(e) => {
                const chat = document.getElementById('chat-scroll');
                if (chat) {
                    chat.className = "flex-1 overflow-y-auto mb-4 flex flex-col rounded p-4";
                    chat.style.backgroundColor = e.target.value;
                }
                }}
                className="w-8 h-8 p-0 border cursor-pointer rounded"
                title="Pick a color"
            />

            {/* Rainbow Button */}
            <button
                onClick={() => {
                const chat = document.getElementById('chat-scroll');
                if (chat) {
                    chat.style.backgroundColor = '';
                    chat.className = "flex-1 overflow-y-auto mb-4 flex flex-col rounded p-4 bg-gradient-to-br from-pink-400 via-yellow-300 to-blue-400";
                }
                }}
                className="bg-gradient-to-r from-pink-400 via-yellow-300 to-blue-400 text-white font-medium px-3 py-1 rounded shadow hover:brightness-105"
            >
                🌈 Rainbow
            </button>
            </div>

      
          <div className="flex flex-1 overflow-hidden">
            {/* Friends List */}
            <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Friends</h2>
              {friends.map((friend) => (
                <button
                  key={friend._id}
                  onClick={() => setSelectedFriend(friend)}
                  className={`w-full text-left px-4 py-2 mb-2 rounded ${
                    selectedFriend?._id === friend._id ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                >
                  {friend.firstname} {friend.lastname}
                </button>
              ))}
            </div>
      
            {/* Chat Window */}
            <div className="w-2/3 flex flex-col p-4">
              {selectedFriend ? (
                <>
                  {/* Chat Messages */}
                  <div
                    id="chat-scroll"
                    className="flex-1 overflow-y-auto mb-4 flex flex-col rounded p-4"
                    style={{ backgroundColor: '#ffffff' }} // default
                  >
                    {messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`mb-2 p-2 rounded ${msg.momentId ? 'max-w-sm' : 'max-w-xs'} ${
                          msg.senderId === selectedFriend._id
                            ? 'bg-gray-200 self-start'
                            : 'bg-blue-500 text-white self-end'
                        }`}
                      >
                        {msg.text}
                        {msg.momentId && (
                          <div className="mt-3 rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white">
                            <div className="bg-black relative" style={{ paddingBottom: '177.77%' }}>
                              <video 
                                className="absolute inset-0 w-full h-full object-cover"
                                src={`${API}/api/moments/video/${msg.momentId}`}
                                controls
                                poster={`${API}/api/moments/thumbnail/${msg.momentId}`}
                                playsInline
                              />
                            </div>
                            <div className="p-2.5 flex items-center justify-between bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                              <span className="text-sm font-medium flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Shared Moment
                              </span>
                              <span className="text-xs opacity-80">Tap to play</span>
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
      
                  {/* Message Input */}
                  <div className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                      }}
                      className="flex-1 border border-gray-300 rounded-l px-4 py-2 focus:outline-none"
                      placeholder="Type a message..."
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
                    >
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a friend to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      );
      
};

export default MessagingUI;