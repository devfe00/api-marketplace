const express = require('express');
const router = express.Router();
const {
  generateNotifications,
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getSummary
} = require('../controllers/notificationController');

router.post('/generate', generateNotifications);
router.get('/', getAllNotifications);
router.get('/summary', getSummary);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;