const Bid = require('../models/Bid');
const Job = require('../models/Job');
const { validationResult } = require('express-validator');
const { notifyNewBid, notifyBidAccepted, notifyBidRejected } = require('../socket');

// @desc    Create a bid
// @route   POST /api/bids/:jobId
// @access  Private (Freelancers only)
exports.createBid = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    // Check if job exists
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if freelancer has already bid on this job
    const existingBid = await Bid.findOne({
      job: req.params.jobId,
      freelancer: req.user.id
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'You have already placed a bid on this job'
      });
    }

    // Create the bid
    const bid = await Bid.create({
      job: req.params.jobId,
      freelancer: req.user.id,
      bidAmount: req.body.bidAmount,
      timeline: req.body.timeline,
      message: req.body.message
    });

    // Send real-time notification to the employer
    notifyNewBid(job, bid);

    res.status(201).json({
      success: true,
      data: bid
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all bids for a job
// @route   GET /api/bids/:jobId
// @access  Private
exports.getBidsForJob = async (req, res) => {
  try {
    // Check if job exists
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // For freelancers, only return their own bid for this job
    if (req.user.role === 'freelancer') {
      const freelancerBid = await Bid.findOne({
        job: req.params.jobId,
        freelancer: req.user.id
      }).populate({
        path: 'freelancer',
        select: 'name'
      });

      if (!freelancerBid) {
        return res.status(404).json({
          success: false,
          message: 'You have not placed a bid on this job'
        });
      }

      return res.status(200).json({
        success: true,
        data: freelancerBid
      });
    }

    // For employers, check if they own the job
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access bids for this job'
      });
    }

    // Get all bids for the job
    const bids = await Bid.find({ job: req.params.jobId }).populate({
      path: 'freelancer',
      select: 'name'
    });

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Accept a bid
// @route   PATCH /api/bids/:bidId/accept
// @access  Private (Employers only)
exports.acceptBid = async (req, res) => {
  try {
    let bid = await Bid.findById(req.params.bidId).populate({
      path: 'job',
      select: 'postedBy'
    });

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    // Check if the employer owns the job associated with this bid
    if (bid.job.postedBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to accept this bid'
      });
    }

    // Update bid status to Accepted
    bid = await Bid.findByIdAndUpdate(
      req.params.bidId,
      { status: 'Accepted' },
      {
        new: true,
        runValidators: true
      }
    ).populate({
      path: 'freelancer',
      select: 'name'
    });

    // Send real-time notification to the freelancer
    notifyBidAccepted(bid);

    res.status(200).json({
      success: true,
      data: bid
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reject a bid
// @route   PATCH /api/bids/:bidId/reject
// @access  Private (Employers only)
exports.rejectBid = async (req, res) => {
  try {
    let bid = await Bid.findById(req.params.bidId).populate({
      path: 'job',
      select: 'postedBy'
    });

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    // Check if the employer owns the job associated with this bid
    if (bid.job.postedBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to reject this bid'
      });
    }

    // Update bid status to Rejected
    bid = await Bid.findByIdAndUpdate(
      req.params.bidId,
      { status: 'Rejected' },
      {
        new: true,
        runValidators: true
      }
    ).populate({
      path: 'freelancer',
      select: 'name'
    });

    // Send real-time notification to the freelancer
    notifyBidRejected(bid);

    res.status(200).json({
      success: true,
      data: bid
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}