const express = require('express');
const { recordCompletion } = require('../controllers/progress');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, recordCompletion);

module.exports = router;
