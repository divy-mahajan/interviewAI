const mongoose = require('mongoose');

const aiMessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const aiConversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    title: {
        type: String,
        default: 'New AI Chat',
        trim: true
    },
    messages: [aiMessageSchema],
    context: {
        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InterviewReport'
        },
        topic: {
            type: String,
            default: ''
        }
    }
}, { timestamps: true });

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);

module.exports = AIConversation;
