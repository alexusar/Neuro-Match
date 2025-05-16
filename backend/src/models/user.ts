import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
/************FOR REGISTER**************/
  username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

  firstname: {
        type: String,
        required: true,
        trim: true,
    },

  lastname: {
        type: String,
        required: true,
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

  verificationToken: {
        type: String,
        default: null
    },

  isVerified: {
        type: Boolean,
        default: false,
    }, 
/***********FOR PROFILE*********/
  age: {
        type: Number,
        min: 18,
    },

  bio: {
        type: String,
        trim: true,
    },

  gender: {
        type: String,
        trim: true,
    },

  pronouns: {
        type: String,
        trim: true,
    },

  height: {
        type: String,
        trim: true,
    },

  preferences: {
        gender: String,       
        ageRange: {
            min: Number,
            max: Number
        }
    },

  location: {
        type: String,
    },
    
  profilePicture: {
        type: String, // URL to profile picture
    },

  friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],

  friendRequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],

  createdAt: {
        type: Date,
        default: Date.now
    }

});

const User = mongoose.model('User', userSchema);
export default User;
