const express = require('express');
const { check } = require('express-validator');
const {
  createBid,
  getBidsForJob,
  acceptBid,
  rejectBid
} = require('../controllers/bidController');
const { protect } = require('../middleware/auth');
const { verifyFreelancer, verifyEmployer } = require('../middleware/roleCheck');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Bid:
 *       type: object
 *       required:
 *         - job
 *         - freelancer
 *         - bidAmount
 *         - timeline
 *         - message
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated bid ID
 *         job:
 *           type: string
 *           description: ID of the job the bid is for
 *         freelancer:
 *           type: string
 *           description: ID of the freelancer who placed the bid
 *         bidAmount:
 *           type: number
 *           description: Bid amount in dollars
 *         timeline:
 *           type: number
 *           description: Estimated completion time in days
 *         message:
 *           type: string
 *           description: Cover message for the bid
 *         status:
 *           type: string
 *           enum: [Pending, Accepted, Rejected]
 *           description: Current status of the bid
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the bid was created
 */

/**
 * @swagger
 * /bids/{jobId}:
 *   post:
 *     summary: Place a bid on a job
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the job to bid on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bidAmount
 *               - timeline
 *               - message
 *             properties:
 *               bidAmount:
 *                 type: number
 *                 description: Your bid amount
 *               timeline:
 *                 type: number
 *                 description: Your estimated completion time in days
 *               message:
 *                 type: string
 *                 description: Your cover message
 *     responses:
 *       201:
 *         description: Bid placed successfully
 *       400:
 *         description: Invalid request data or already bid on this job
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed (employers cannot place bids)
 *       404:
 *         description: Job not found
 */
router.post(
  '/:jobId',
  [
    protect,
    verifyFreelancer,
    [
      check('bidAmount', 'Bid amount is required and must be a number').isNumeric(),
      check('timeline', 'Timeline is required and must be a number').isNumeric(),
      check('message', 'Message is required').not().isEmpty()
    ]
  ],
  createBid
);

/**
 * @swagger
 * /bids/{jobId}:
 *   get:
 *     summary: Get bids for a job
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the job to get bids for
 *     responses:
 *       200:
 *         description: List of bids (for employer) or your own bid (for freelancer)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   oneOf:
 *                     - type: array
 *                       items:
 *                         $ref: '#/components/schemas/Bid'
 *                     - $ref: '#/components/schemas/Bid'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Job not found or you have not placed a bid on this job
 */
router.get('/:jobId', protect, getBidsForJob);

/**
 * @swagger
 * /bids/{bidId}/accept:
 *   patch:
 *     summary: Accept a bid
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bidId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the bid to accept
 *     responses:
 *       200:
 *         description: Bid accepted successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed (freelancers cannot accept bids)
 *       404:
 *         description: Bid not found
 */
router.patch('/:bidId/accept', protect, verifyEmployer, acceptBid);

/**
 * @swagger
 * /bids/{bidId}/reject:
 *   patch:
 *     summary: Reject a bid
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bidId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the bid to reject
 *     responses:
 *       200:
 *         description: Bid rejected successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed (freelancers cannot reject bids)
 *       404:
 *         description: Bid not found
 */
router.patch('/:bidId/reject', protect, verifyEmployer, rejectBid);

module.exports = router;