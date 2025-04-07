const express = require('express');
const { check } = require('express-validator');
const {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');
const { verifyEmployer } = require('../middleware/roleCheck');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - budget
 *         - duration
 *         - skillsRequired
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated job ID
 *         title:
 *           type: string
 *           description: Job title
 *         description:
 *           type: string
 *           description: Detailed job description
 *         budget:
 *           type: number
 *           description: Job budget in dollars
 *         duration:
 *           type: number
 *           description: Estimated job duration in days
 *         skillsRequired:
 *           type: array
 *           items:
 *             type: string
 *           description: List of required skills
 *         postedBy:
 *           type: string
 *           description: ID of the employer who posted the job
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the job was created
 */

/**
 * @swagger
 * /jobs/create:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - budget
 *               - duration
 *               - skillsRequired
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               budget:
 *                 type: number
 *               duration:
 *                 type: number
 *               skillsRequired:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed (freelancers cannot post jobs)
 */
router.post(
  '/create',
  [
    protect,
    verifyEmployer,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('budget', 'Budget is required and must be a number').isNumeric(),
      check('duration', 'Duration is required and must be a number').isNumeric(),
      check('skillsRequired', 'At least one skill is required').isArray().notEmpty()
    ]
  ],
  createJob
);

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Comma separated list of skills to filter by
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Fields to select (comma separated)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Fields to sort by (comma separated)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 */
router.get('/', getJobs);

/**
 * @swagger
 * /jobs/{jobId}:
 *   get:
 *     summary: Get a single job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the job to retrieve
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 */
router.get('/:jobId', getJob);

/**
 * @swagger
 * /jobs/{jobId}:
 *   put:
 *     summary: Update a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the job to update
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               budget:
 *                 type: number
 *               duration:
 *                 type: number
 *               skillsRequired:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed (freelancers or non-owners cannot update jobs)
 *       404:
 *         description: Job not found
 */
router.put(
  '/:jobId',
  [
    protect,
    verifyEmployer,
    [
      check('title', 'Title is required').optional().not().isEmpty(),
      check('description', 'Description is required').optional().not().isEmpty(),
      check('budget', 'Budget must be a number').optional().isNumeric(),
      check('duration', 'Duration must be a number').optional().isNumeric(),
      check('skillsRequired', 'Skills must be an array').optional().isArray()
    ]
  ],
  updateJob
);

/**
 * @swagger
 * /jobs/{jobId}:
 *   delete:
 *     summary: Delete a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the job to delete
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed (freelancers or non-owners cannot delete jobs)
 *       404:
 *         description: Job not found
 */
router.delete('/:jobId', protect, verifyEmployer, deleteJob);

module.exports = router;