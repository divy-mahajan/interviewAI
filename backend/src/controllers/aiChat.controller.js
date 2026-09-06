const mongoose = require('mongoose');
const AIConversation = require('../models/aiConversation.model');
const InterviewReport = require('../models/interviewReport.model');
const { generateAIResponse, deriveConversationTitle } = require('../services/aiChat.service');

/**
 * @name getConversations
 * @description List all AI conversations for the logged-in user
 * @access Private
 */
async function getConversations(req, res) {
    try {
        const userId = req.user.id;

        const conversations = await AIConversation.find({ userId })
            .select('title context messages createdAt updatedAt')
            .sort({ updatedAt: -1 });

        const mapped = conversations.map(c => ({
            _id: c._id,
            title: c.title,
            context: c.context,
            messageCount: c.messages.length,
            lastMessage: c.messages.length > 0 ? c.messages[c.messages.length - 1] : null,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
        }));

        return res.status(200).json(mapped);
    } catch (error) {
        console.error('Error in getConversations:', error);
        return res.status(500).json({ message: 'Failed to fetch AI conversations' });
    }
}

/**
 * @name createConversation
 * @description Start a new AI chat conversation
 * @access Private
 */
async function createConversation(req, res) {
    try {
        const userId = req.user.id;
        const { title, context } = req.body;

        const newConversation = new AIConversation({
            userId,
            title: title || 'New AI Chat',
            context: context || {},
            messages: []
        });

        await newConversation.save();
        return res.status(201).json(newConversation);
    } catch (error) {
        console.error('Error in createConversation:', error);
        return res.status(500).json({ message: 'Failed to create AI conversation' });
    }
}

/**
 * @name getConversationById
 * @description Retrieve a specific AI conversation by ID
 * @access Private
 */
async function getConversationById(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid conversation ID' });
        }

        const conversation = await AIConversation.findOne({ _id: id, userId });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        return res.status(200).json(conversation);
    } catch (error) {
        console.error('Error in getConversationById:', error);
        return res.status(500).json({ message: 'Failed to fetch conversation details' });
    }
}

/**
 * @name sendMessage
 * @description Send a user message and get the AI assistant response
 * @access Private
 */
async function sendMessage(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { content } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid conversation ID' });
        }

        if (!content || typeof content !== 'string' || !content.trim()) {
            return res.status(400).json({ message: 'Message content cannot be empty' });
        }

        if (content.length > 4000) {
            return res.status(400).json({ message: 'Message exceeds maximum length of 4000 characters' });
        }

        const conversation = await AIConversation.findOne({ _id: id, userId });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Auto-generate title if it's the first message
        if (conversation.messages.length === 0 || conversation.title === 'New AI Chat') {
            conversation.title = deriveConversationTitle(content);
        }

        const userMsg = {
            role: 'user',
            content: content.trim(),
            timestamp: new Date()
        };

        conversation.messages.push(userMsg);

        // Load interview report context if linked
        let reportContext = null;
        if (conversation.context && conversation.context.reportId) {
            try {
                reportContext = await InterviewReport.findById(conversation.context.reportId);
            } catch (err) {
                console.warn('Could not load report context:', err.message);
            }
        }

        // Call Gemini with full conversation history
        const aiResponseText = await generateAIResponse(conversation.messages, {
            report: reportContext,
            topic: conversation.context ? conversation.context.topic : null
        });

        const assistantMsg = {
            role: 'assistant',
            content: aiResponseText,
            timestamp: new Date()
        };

        conversation.messages.push(assistantMsg);
        await conversation.save();

        return res.status(200).json({
            conversationId: conversation._id,
            title: conversation.title,
            userMessage: conversation.messages[conversation.messages.length - 2],
            assistantMessage: conversation.messages[conversation.messages.length - 1]
        });
    } catch (error) {
        console.error('Error in sendMessage to AI:', error);
        return res.status(500).json({
            message: error.message && error.message.includes('API key')
                ? 'AI service configuration error. Please contact admin.'
                : 'Failed to generate AI response. Please try again.'
        });
    }
}

/**
 * @name deleteConversation
 * @description Delete an AI conversation
 * @access Private
 */
async function deleteConversation(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid conversation ID' });
        }

        const deleted = await AIConversation.findOneAndDelete({ _id: id, userId });

        if (!deleted) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        return res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Error in deleteConversation:', error);
        return res.status(500).json({ message: 'Failed to delete conversation' });
    }
}

module.exports = {
    getConversations,
    createConversation,
    getConversationById,
    sendMessage,
    deleteConversation
};
