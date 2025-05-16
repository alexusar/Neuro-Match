import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TitleUI from './TitleUI';

const API = import.meta.env.VITE_API_BASE_URL;

/**
 * ProfileUI (Web)
 * Responsive two-column layout for desktop, single-column for smaller screens.
 * Allows users to view and edit age, pronouns, bio & profile picture.
 */
const ProfileUI: React.FC = () => {
    // State variables for user profile fields
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [pronouns, setPronouns] = useState('');
    const [pronounInput, setPronounInput] = useState('');
    const [bio, setBio] = useState('');
    const [profilePicture, setProfilePicture] = useState('');

    // Fetch current user on mount
    useEffect(() => {
        axios
            .get(`${API}/api/auth/me`, { withCredentials: true })
            .then((res) => {
                const user = res.data.user;
                setFirstname(user.firstname);
                setLastname(user.lastname);
                setAge(user.age ?? '');
                setPronouns(user.pronouns ?? '');
                setBio(user.bio ?? '');
                setProfilePicture(user.profilePicture ?? '');
            })
            .catch((err) => {
                console.error('Failed to load profile:', err);
            });
    }, []);

    // Save updates to backend
    const handleSave = () => {
        axios
            .put(
                `${API}/api/auth/me`,
                { age, pronouns, bio, profilePicture },
                { withCredentials: true }
            )
            .then(() => {
                alert('Profile saved successfully!');
            })
            .catch((err) => {
                console.error('Save failed:', err);
                alert('Unable to save. Please try again later.');
            });
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
          <TitleUI />
          <div className="p-8">
            {/* Responsive grid: sidebar + form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                {/* Sidebar: profile picture & name */}
                <div className="text-center">
                    <img
                        src={profilePicture || '/placeholder.png'}
                        alt="Profile"
                        className="w-full max-w-xs h-auto rounded-full object-cover mx-auto"
                    />
                    <h2 className="mt-4 text-2xl font-bold">
                            {firstname} {lastname}, {age}
                        </h2>
                    <h3 className="mt-0 text-2xl">
                        {pronouns}
                        </h3>
                    <h3 className="mt-0">
                        {bio}
                        </h3>
                </div>

                {/* Main form fields (span 2 cols on md+) */}
                <div className="md:col-span-2">
                    <div className="space-y-6">
                        {/* Profile Picture URL */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Profile Picture URL
                            </label>
                            <input
                                type="text"
                                value={profilePicture}
                                onChange={(e) => setProfilePicture(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                            />
                        </div>

                        {/* Age */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Age</label>
                            <input
                                type="number"
                                min={18}
                                value={age}
                                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                            />
                        </div>

                        {/* Pronouns */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Pronouns</label>
                            <select
                                value={pronouns}
                                onChange={(e) => setPronouns(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                            >
                                <option value="">{pronouns}</option>
                                <option value="She/Her">She/Her</option>
                                <option value="he/him">He/Him</option>
                                <option value="they/them">They/Them</option>
                                <option value="other">Other…</option>
                            </select>
                            {/* Free-form input if "Other" */}
                            {pronouns === 'other' && (
                                <input
                                    autoFocus                            // ← focus this input immediately when it appears
                                    type="text"
                                    placeholder="Please specify pronouns"
                                    value={pronounInput}                 // controlled by your pronounInput state
                                    onChange={e => setPronounInput(e.target.value)}
                                    onKeyDown={e => {
                                    if (e.key === 'Enter') {           // only run on Enter
                                            e.preventDefault();              // stop any form submission / default
                                            console.log('Submitting:', pronounInput);
                                            setPronouns(pronounInput);       // commit the custom pronouns
                                        }
                                    }}
                                    className="w-full mt-2 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
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
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                            />
                        </div>

                        {/* Save Button */}
                        <div className="text-right">
                            <button
                                onClick={handleSave}
                                className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
    );
};

export default ProfileUI;
