const Stream = require('../models/stream.model');
const User = require('../models/user.model');

// Start a new stream
exports.createStream = async (req, res) => {
  try {
    const { title, description } = req.body;
    const broadcasterId = req.user.id;

    // Check if user already has an active stream
    const existingStream = await Stream.findOne({
      broadcaster: broadcasterId,
      status: 'live'
    });

    if (existingStream) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đang có một buổi live đang diễn ra'
      });
    }

    const stream = new Stream({
      broadcaster: broadcasterId,
      title: title || 'Buổi Live',
      description: description || '',
      status: 'live',
      streamKey: require('crypto').randomBytes(20).toString('hex')
    });

    await stream.save();

    // Populate broadcaster info
    await stream.populate('broadcaster', 'firstName lastName avatar avatarType');

    // Format broadcaster avatar
    const streamObj = stream.toObject();
    if (streamObj.broadcaster && streamObj.broadcaster.avatar && streamObj.broadcaster.avatarType) {
      streamObj.broadcaster.avatarUrl = `data:${streamObj.broadcaster.avatarType};base64,${streamObj.broadcaster.avatar.toString('base64')}`;
      delete streamObj.broadcaster.avatar;
      delete streamObj.broadcaster.avatarType;
    }

    // Emit socket event for new live stream
    if (global.io) {
      global.io.emit('stream:started', {
        success: true,
        stream: streamObj
      });
    }

    res.status(201).json({
      success: true,
      message: 'Buổi live đã được bắt đầu',
      stream: streamObj
    });
  } catch (error) {
    console.error('Error creating stream:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo buổi live'
    });
  }
};

// Get all active streams
exports.getLiveStreams = async (req, res) => {
  try {
    const streams = await Stream.find({ status: 'live' })
      .populate('broadcaster', 'firstName lastName avatar avatarType')
      .sort({ createdAt: -1 })
      .limit(20);

    // Format streams
    const formattedStreams = streams.map(stream => {
      const streamObj = stream.toObject();
      if (streamObj.broadcaster && streamObj.broadcaster.avatar && streamObj.broadcaster.avatarType) {
        streamObj.broadcaster.avatarUrl = `data:${streamObj.broadcaster.avatarType};base64,${streamObj.broadcaster.avatar.toString('base64')}`;
        delete streamObj.broadcaster.avatar;
        delete streamObj.broadcaster.avatarType;
      }
      return streamObj;
    });

    res.json({
      success: true,
      data: formattedStreams
    });
  } catch (error) {
    console.error('Error fetching streams:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tải danh sách live'
    });
  }
};

// Get a specific stream
exports.getStream = async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.streamId)
      .populate('broadcaster', 'firstName lastName avatar avatarType');

    if (!stream) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi live'
      });
    }

    const streamObj = stream.toObject();
    if (streamObj.broadcaster && streamObj.broadcaster.avatar && streamObj.broadcaster.avatarType) {
      streamObj.broadcaster.avatarUrl = `data:${streamObj.broadcaster.avatarType};base64,${streamObj.broadcaster.avatar.toString('base64')}`;
      delete streamObj.broadcaster.avatar;
      delete streamObj.broadcaster.avatarType;
    }

    res.json({
      success: true,
      stream: streamObj
    });
  } catch (error) {
    console.error('Error fetching stream:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tải thông tin live'
    });
  }
};

// End a stream
exports.endStream = async (req, res) => {
  try {
    const stream = await Stream.findOne({
      _id: req.params.streamId,
      broadcaster: req.user.id,
      status: 'live'
    });

    if (!stream) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy buổi live hoặc bạn không phải người phát'
      });
    }

    stream.status = 'ended';
    stream.endedAt = new Date();
    await stream.save();

    // Emit socket event for ended stream
    if (global.io) {
      global.io.emit('stream:ended', {
        success: true,
        streamId: stream._id.toString(),
        broadcasterId: stream.broadcaster.toString()
      });
    }

    res.json({
      success: true,
      message: 'Buổi live đã kết thúc'
    });
  } catch (error) {
    console.error('Error ending stream:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi kết thúc buổi live'
    });
  }
};

// Update viewer count (via Socket.IO)
exports.updateViewerCount = async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.streamId);

    if (!stream || stream.status !== 'live') {
      return res.status(404).json({
        success: false,
        message: 'Stream không tồn tại hoặc đã kết thúc'
      });
    }

    res.json({
      success: true,
      viewerCount: stream.viewerCount
    });
  } catch (error) {
    console.error('Error updating viewer count:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Get my active stream
exports.getMyStream = async (req, res) => {
  try {
    const stream = await Stream.findOne({
      broadcaster: req.user.id,
      status: 'live'
    }).populate('broadcaster', 'firstName lastName avatar avatarType');

    if (!stream) {
      return res.json({
        success: true,
        stream: null
      });
    }

    const streamObj = stream.toObject();
    if (streamObj.broadcaster && streamObj.broadcaster.avatar && streamObj.broadcaster.avatarType) {
      streamObj.broadcaster.avatarUrl = `data:${streamObj.broadcaster.avatarType};base64,${streamObj.broadcaster.avatar.toString('base64')}`;
      delete streamObj.broadcaster.avatar;
      delete streamObj.broadcaster.avatarType;
    }

    res.json({
      success: true,
      stream: streamObj
    });
  } catch (error) {
    console.error('Error fetching my stream:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};
