const express = require('express');
const router = express.Router();
const streamController = require('../controllers/stream.controller');
const auth = require('../middlewares/auth.middleware');

// Get all live streams (public)
router.get('/', streamController.getLiveStreams);

// Get my active stream (private)
router.get('/me', auth, streamController.getMyStream);

// Get a specific stream (public)
router.get('/:streamId', streamController.getStream);

// Create a new stream (private)
router.post('/', auth, streamController.createStream);

// End a stream (private - must be the broadcaster)
router.put('/:streamId/end', auth, streamController.endStream);

// Update viewer count (private)
router.put('/:streamId/viewers', auth, streamController.updateViewerCount);

module.exports = router;
