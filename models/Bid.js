const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bidAmount: {
    type: Number,
    required: [true, 'Please specify your bid amount']
  },
  timeline: {
    type: Number,
    required: [true, 'Please specify your estimated timeline in days']
  },
  message: {
    type: String,
    required: [true, 'Please include a message with your bid'],
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for job and freelancer to ensure a freelancer can only bid once per job
BidSchema.index({ job: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model('Bid', BidSchema);