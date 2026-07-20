const express = require('express');
const {
  chat,
  chatStream,
  getHistory,
  clearHistory,
  quiz,
  summarize,
  status,
} = require('../controllers/ai');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/status', protect, status);
router.post('/chat', protect, chat);
router.post('/chat/stream', protect, chatStream);
router.get('/history', protect, getHistory);
router.delete('/history', protect, clearHistory);
router.post('/quiz', protect, quiz);
router.post('/summarize', protect, summarize);

module.exports = router;