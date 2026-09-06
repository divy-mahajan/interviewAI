const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authUser } = require('../middlewares/auth.middleware');

// Protect all messaging routes
router.use(authUser);

router.get('/users', messageController.getUsersForSidebar);
router.get('/conversations', messageController.getConversationsForSidebar);
router.get('/:userId', messageController.getMessages);
router.post('/send/:userId', messageController.sendMessage);
router.patch('/:messageId/mock-status', messageController.updateMockStatus);

module.exports = router;
