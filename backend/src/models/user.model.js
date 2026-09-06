const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: [ true, 'Username already exists' ]
    },
    email: {
        type: String,
        required: true,
        unique: [ true, 'Account already exists with this email' ]    
    },
    password: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        default: ""
    },
    skills: {
        type: [String],
        default: []
    },
    bio: {
        type: String,
        default: ""
    }
})

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;