const express = require('express');
const {
  recordCompletion, getMyCompletions, removeCompletion,
  addBookmark, removeBookmark, getMyBookmarks,
  addActivity, getMyActivities,
  syncAll,
} = require('../controllers/progress');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Sync (must come before parameterized routes)
router.get('/sync', syncAll);

// Completions
router.post('/', recordCompletion);
router.get('/', getMyCompletions);
router.delete('/:skillId', removeCompletion);

// Bookmarks
router.post('/bookmark', addBookmark);
router.delete('/bookmark/:skillId', removeBookmark);
router.get('/bookmarks', getMyBookmarks);

// Activities
router.post('/activity', addActivity);
router.get('/activities', getMyActivities);

module.exports = router;
