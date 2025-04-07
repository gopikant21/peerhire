const Job = require('../models/Job');
const { validationResult } = require('express-validator');

// @desc    Create a new job
// @route   POST /api/jobs/create
// @access  Private (Employers only)
exports.createJob = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    // Add user to req.body
    req.body.postedBy = req.user.id;

    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Handle skills filter
    if (req.query.skills) {
      const skills = req.query.skills.split(',');
      queryStr = JSON.stringify({ skillsRequired: { $in: skills } });
    }

    // Finding resource
    query = Job.find(JSON.parse(queryStr)).populate({
      path: 'postedBy',
      select: 'name'
    });

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Job.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const jobs = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: jobs.length,
      pagination,
      data: jobs
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:jobId
// @access  Public
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate({
      path: 'postedBy',
      select: 'name'
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (err) {
    console.error(err.message);
    
    // Handle invalid ObjectId format
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:jobId
// @access  Private (Employer only - owner of the job)
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Make sure user is job owner
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authorized to update this job'
      });
    }

    job = await Job.findByIdAndUpdate(req.params.jobId, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:jobId
// @access  Private (Employer only - owner of the job)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Make sure user is job owner
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authorized to delete this job'
      });
    }

    await job.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};