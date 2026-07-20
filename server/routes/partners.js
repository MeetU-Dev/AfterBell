const express = require('express');
const {
  getPartners,
  getAllPartners,
  createPartner,
  updatePartner,
  deletePartner,
} = require('../controllers/partners');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getPartners)
  .post(protect, authorize('admin'), createPartner);

router.get('/all', protect, authorize('admin'), getAllPartners);

router
  .route('/:id')
  .put(protect, authorize('admin'), updatePartner)
  .delete(protect, authorize('admin'), deletePartner);

module.exports = router;