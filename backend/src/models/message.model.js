const mongoose = require('mongoose');

const mockInterviewSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: Number,
        default: 45 // in minutes
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Intermediate'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    }
}, { _id: false });

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'mockRequest'],
        default: 'text'
    },
    text: {
        type: String,
        default: ''
    },
    mockInterview: {
        type: mockInterviewSchema,
        default: null
    },
    image: {
        type: String,
        default: ''
    },
    video: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const MessageModel = mongoose.model('Message', messageSchema);

module.exports = MessageModel;
