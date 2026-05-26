const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
  broadcaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  // Stream status: 'live', 'ended'
  status: {
    type: String,
    enum: ['live', 'ended'],
    default: 'live'
  },
  // Viewer count (updated via Socket.IO)
  viewerCount: {
    type: Number,
    default: 0
  },
  // List of current viewer user IDs
  viewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Stream key (for broadcaster authentication)
  streamKey: {
    type: String,
    default: () => require('crypto').randomBytes(20).toString('hex')
  },
  // RTMP ingest URL
  rtmpUrl: {
    type: String,
    default: ''
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for finding active streams
streamSchema.index({ status: 1, createdAt: -1 });

const Stream = mongoose.model('Stream', streamSchema);

module.exports = Stream;
