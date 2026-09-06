const express = require('express');
const router = express.Router();
const aiChatController = require('../controllers/aiChat.controller');
const { authUser } = require('../middlewares/auth.middleware');

// Protect all AI chat routes
router.use(authUser);

router.get('/conversations', aiChatController.getConversations);
router.post('/conversations', aiChatController.createConversation);
router.get('/conversations/:id', aiChatController.getConversationById);
router.post('/conversations/:id/messages', aiChatController.sendMessage);
router.delete('/conversations/:id', aiChatController.deleteConversation);

module.exports = router;
