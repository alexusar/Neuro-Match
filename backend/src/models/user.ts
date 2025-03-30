import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: Number,
  bio: String,
  gender: String,
  preferences: {
    gender: String,       
    ageRange: {
      min: Number,
      max: Number
    }
  },
  location: String,
  profilePicture: String, // URL to profile picture
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);
export default User;
