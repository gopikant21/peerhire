const socketIO = require('socket.io');

let io;

// Initialize Socket.io
const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Socket events
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join room for user-specific notifications
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Send notification when a bid is placed
const notifyNewBid = (job, bid) => {
  if (io) {
    // Notify the employer
    io.to(job.postedBy.toString()).emit('newBid', {
      jobId: job._id,
      jobTitle: job.title,
      freelancerId: bid.freelancer,
      bidAmount: bid.bidAmount,
      message: 'A new bid has been placed on your job'
    });
  }
};

// Send notification when a bid is accepted
const notifyBidAccepted = (bid) => {
  if (io) {
    // Notify the freelancer
    io.to(bid.freelancer.toString()).emit('bidAccepted', {
      jobId: bid.job,
      bidId: bid._id,
      message: 'Your bid has been accepted!'
    });
  }
};

// Send notification when a bid is rejected
const notifyBidRejected = (bid) => {
  if (io) {
    // Notify the freelancer
    io.to(bid.freelancer.toString()).emit('bidRejected', {
      jobId: bid.job,
      bidId: bid._id,
      message: 'Your bid has been rejected'
    });
  }
};

module.exports = {
  initializeSocket,
  notifyNewBid,
  notifyBidAccepted,
  notifyBidRejected
};