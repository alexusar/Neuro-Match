// src/lib/profile.ts
export type UserDoc = {
  _id: any;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  verificationToken?: string | null;
  isVerified: boolean;

  age?: number;
  bio?: string;
  gender?: string;
  pronouns?: string;
  height?: string;
  preferences?: { gender?: string; ageRange?: { min?: number; max?: number } };
  location?: string;
  profilePicture?: string;

  friends?: string[];         // ids (we may post-filter)
  friendRequests?: string[];  // ids
  userInterests?: string[];
  momentInterests?: string[];
  createdAt?: Date;
};

export function displayName(u: UserDoc) {
  return [u.firstname, u.lastname].filter(Boolean).join(" ").trim() || u.username;
}

export function profileToText(u: UserDoc) {
  // Keep this compact and match-focused
  return [
    `Name: ${displayName(u)}`,
    u.age ? `Age: ${u.age}` : null,
    u.gender ? `Gender: ${u.gender}` : null,
    u.pronouns ? `Pronouns: ${u.pronouns}` : null,
    u.location ? `Location: ${u.location}` : null,
    u.userInterests?.length ? `Interests: ${u.userInterests.join(", ")}` : null,
    u.bio ? `Bio: ${u.bio}` : null,
  ].filter(Boolean).join("\n");
}

export function toMetadata(u: UserDoc) {
  // Keep Pinecone metadata types simple (string/number/boolean/array)
  return {
    userId: String(u._id),
    username: u.username,
    name: displayName(u),
    age: typeof u.age === "number" ? u.age : undefined,
    gender: u.gender || undefined,
    pronouns: u.pronouns || undefined,
    location: u.location || undefined,

    // preferences used for filtering
    prefGender: u.preferences?.gender || undefined,
    prefMinAge: u.preferences?.ageRange?.min,
    prefMaxAge: u.preferences?.ageRange?.max,

    interests: (u.userInterests || []).map(s => s.toLowerCase().trim()),
    hasPhoto: !!u.profilePicture,
    isVerified: !!u.isVerified,
    // add small flags you need (e.g. onboardingComplete)
  };
}
