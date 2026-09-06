const mongoose = require('mongoose');
const Message = require('../models/message.model');
const User = require('../models/user.model');
const { emitToUser } = require('../lib/socket');

/**
 * @name getUsersForSidebar
 * @description Get all registered users except the currently logged-in user.
 * @access Private
 */
async function getUsersForSidebar(req, res) {
    try {
        const loggedInUserId = req.user.id;

        const users = await User.find({ _id: { $ne: loggedInUserId } })
            .select('-password')
            .sort({ username: 1 });

        return res.status(200).json(users);
    } catch (error) {
        console.error('Error in getUsersForSidebar:', error);
        return res.status(500).json({ message: 'Failed to fetch users' });
    }
}

/**
 * @name getConversationsForSidebar
 * @description Get all active conversation partners with their latest message.
 * @access Private
 */
async function getConversationsForSidebar(req, res) {
    try {
        const loggedInUserId = new mongoose.Types.ObjectId(req.user.id);

        const conversations = await Message.aggregate([
            // 1. Find all messages where user is either sender or receiver
            {
                $match: {
                    $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }]
                }
            },
            // 2. Sort so latest messages are first
            { $sort: { createdAt: -1 } },
            // 3. Group by the conversation partner
            {
                $group: {
                    _id: {
                        $cond: [{ $eq: ["$senderId", loggedInUserId] }, "$receiverId", "$senderId"]
                    },
                    lastMessage: { $first: "$$ROOT" },
                    lastMessageAt: { $first: "$createdAt" }
                }
            },
            // 4. Sort conversations by most recent message
            { $sort: { lastMessageAt: -1 } },
            // 5. Look up the partner's user details from 'users' collection
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            // 6. Unwind user array
            { $unwind: "$user" },
            // 7. Project clean representation excluding password
            {
                $project: {
                    _id: "$user._id",
                    username: "$user.username",
                    email: "$user.email",
                    profilePic: "$user.profilePic",
                    skills: "$user.skills",
                    bio: "$user.bio",
                    lastMessage: {
                        _id: "$lastMessage._id",
                        text: "$lastMessage.text",
                        messageType: "$lastMessage.messageType",
                        mockInterview: "$lastMessage.mockInterview",
                        senderId: "$lastMessage.senderId",
                        createdAt: "$lastMessage.createdAt"
                    },
                    lastMessageAt: 1
                }
            }
        ]);

        return res.status(200).json(conversations);
    } catch (error) {
        console.error('Error in getConversationsForSidebar:', error);
        return res.status(500).json({ message: 'Failed to fetch conversations' });
    }
}

/**
 * @name getMessages
 * @description Fetch conversation messages between logged-in user and specified user.
 * @access Private
 */
async function getMessages(req, res) {
    try {
        const { userId: otherUserId } = req.params;
        const myId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });

        return res.status(200).json(messages);
    } catch (error) {
        console.error('Error in getMessages:', error);
        return res.status(500).json({ message: 'Failed to load messages' });
    }
}

/**
 * @name sendMessage
 * @description Send a message (text or mock interview request) to another user.
 * @access Private
 */
async function sendMessage(req, res) {
    try {
        const { userId: receiverId } = req.params;
        const senderId = req.user.id;
        const { text, messageType = 'text', mockInterview } = req.body;

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: 'Invalid receiver user ID' });
        }

        if (receiverId.toString() === senderId.toString()) {
            return res.status(400).json({ message: 'Cannot message yourself' });
        }

        const receiverExists = await User.findById(receiverId);
        if (!receiverExists) {
            return res.status(404).json({ message: 'Receiver user not found' });
        }

        if (messageType === 'mockRequest') {
            if (!mockInterview || !mockInterview.topic) {
                return res.status(400).json({ message: 'Mock interview topic is required' });
            }
        } else {
            if (!text || !text.trim()) {
                return res.status(400).json({ message: 'Message text cannot be empty' });
            }
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            messageType,
            text: text ? text.trim() : '',
            mockInterview: messageType === 'mockRequest' ? {
                topic: mockInterview.topic,
                duration: mockInterview.duration || 45,
                level: mockInterview.level || 'Intermediate',
                status: 'pending'
            } : null
        });

        await newMessage.save();

        // Deliver message in real-time via Socket.io
        emitToUser(receiverId.toString(), 'newMessage', newMessage);

        return res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error in sendMessage:', error);
        return res.status(500).json({ message: 'Failed to send message' });
    }
}

/**
 * @name updateMockStatus
 * @description Accept or decline a mock interview request.
 * @access Private
 */
async function updateMockStatus(req, res) {
    try {
        const { messageId } = req.params;
        const { status } = req.body;
        const loggedInUserId = req.user.id;

        if (!['accepted', 'declined'].includes(status)) {
            return res.status(400).json({ message: 'Status must be either accepted or declined' });
        }

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            return res.status(400).json({ message: 'Invalid message ID' });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        if (message.messageType !== 'mockRequest') {
            return res.status(400).json({ message: 'Message is not a mock interview request' });
        }

        // Only the receiver of the request can accept or decline
        if (message.receiverId.toString() !== loggedInUserId.toString()) {
            return res.status(403).json({ message: 'Only the recipient can respond to this request' });
        }

        message.mockInterview.status = status;
        await message.save();

        // Notify both parties in real time
        emitToUser(message.senderId.toString(), 'mockStatusUpdated', message);
        emitToUser(message.receiverId.toString(), 'mockStatusUpdated', message);

        return res.status(200).json(message);
    } catch (error) {
        console.error('Error in updateMockStatus:', error);
        return res.status(500).json({ message: 'Failed to update mock interview status' });
    }
}

module.exports = {
    getUsersForSidebar,
    getConversationsForSidebar,
    getMessages,
    sendMessage,
    updateMockStatus
};
