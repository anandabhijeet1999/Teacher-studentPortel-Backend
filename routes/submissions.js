const express = require('express');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { auth, authorize } = require('../middleware/auth');
const { validateSubmission } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/submissions
// @desc    Submit assignment answer
// @access  Private (Student only)
router.post('/', auth, authorize('student'), validateSubmission, async (req, res) => {
  try {
    const { assignmentId, answer } = req.body;

    // Check if assignment exists and is published
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.status !== 'published') {
      return res.status(400).json({ message: 'Assignment is not available for submission' });
    }

    // Check if assignment is past due date
    if (new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({ message: 'Assignment submission deadline has passed' });
    }

    // Check if student has already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    // Create new submission
    const submission = new Submission({
      assignment: assignmentId,
      student: req.user._id,
      answer
    });

    await submission.save();
    await submission.populate('student', 'name email');
    await submission.populate('assignment', 'title description dueDate');

    res.status(201).json(submission);
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/submissions
// @desc    Get student's submissions
// @access  Private (Student only)
router.get('/', auth, authorize('student'), async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('assignment', 'title description dueDate status')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/submissions/:id
// @desc    Get single submission
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('student', 'name email')
      .populate('assignment', 'title description dueDate status');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Students can only see their own submissions
    if (req.user.role === 'student' && submission.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Teachers can only see submissions for their assignments
    if (req.user.role === 'teacher' && submission.assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/submissions/:id/review
// @desc    Mark submission as reviewed
// @access  Private (Teacher only)
router.put('/:id/review', auth, authorize('teacher'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('assignment');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if teacher owns the assignment
    if (submission.assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    submission.isReviewed = true;
    submission.reviewedAt = new Date();
    await submission.save();

    await submission.populate('student', 'name email');
    await submission.populate('assignment', 'title description dueDate status');

    res.json(submission);
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
