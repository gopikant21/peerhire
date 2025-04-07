const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  budget: {
    type: Number,
    required: [true, 'Please add a budget']
  },
  duration: {
    type: Number,
    required: [true, 'Please add estimated duration in days']
  },
  skillsRequired: {
    type: [String],
    required: [true, 'Please add at least one required skill']
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for skills for efficient querying
JobSchema.index({ skillsRequired: 1 });

module.exports = mongoose.model('Job', JobSchema);