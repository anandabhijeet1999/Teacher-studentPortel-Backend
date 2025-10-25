const express = require('express');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const { auth, authorize } = require('../middleware/auth');
const { validateAssignment } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/assignments
// @desc    Get assignments based on user role
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let assignments;
    
    if (req.user.role === 'teacher') {
      // Teachers see all their assignments
      assignments = await Assignment.find({ teacher: req.user._id })
        .populate('teacher', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Students see only published assignments
      assignments = await Assignment.find({ status: 'published' })
        .populate('teacher', 'name email')
        .sort({ createdAt: -1 });
    }

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/:id
// @desc    Get single assignment
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('teacher', 'name email');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Students can only see published assignments
    if (req.user.role === 'student' && assignment.status !== 'published') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Teachers can only see their own assignments
    if (req.user.role === 'teacher' && assignment.teacher._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/assignments
// @desc    Create new assignment
// @access  Private (Teacher only)
router.post('/', auth, authorize('teacher'), validateAssignment, async (req, res) => {
  try {
    const assignment = new Assignment({
      ...req.body,
      teacher: req.user._id
    });

    await assignment.save();
    await assignment.populate('teacher', 'name email');

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private (Teacher only)
router.put('/:id', auth, authorize('teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if teacher owns this assignment
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow updates to draft assignments
    if (assignment.status !== 'draft') {
      return res.status(400).json({ 
        message: 'Cannot update published or completed assignments' 
      });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('teacher', 'name email');

    res.json(updatedAssignment);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private (Teacher only)
router.delete('/:id', auth, authorize('teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if teacher owns this assignment
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow deletion of draft assignments
    if (assignment.status !== 'draft') {
      return res.status(400).json({ 
        message: 'Cannot delete published or completed assignments' 
      });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/assignments/:id/publish
// @desc    Publish assignment
// @access  Private (Teacher only)
router.put('/:id/publish', auth, authorize('teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if teacher owns this assignment
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow publishing draft assignments
    if (assignment.status !== 'draft') {
      return res.status(400).json({ 
        message: 'Only draft assignments can be published' 
      });
    }

    assignment.status = 'published';
    await assignment.save();
    await assignment.populate('teacher', 'name email');

    res.json(assignment);
  } catch (error) {
    console.error('Publish assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/assignments/:id/complete
// @desc    Mark assignment as completed
// @access  Private (Teacher only)
router.put('/:id/complete', auth, authorize('teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if teacher owns this assignment
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow completing published assignments
    if (assignment.status !== 'published') {
      return res.status(400).json({ 
        message: 'Only published assignments can be completed' 
      });
    }

    assignment.status = 'completed';
    await assignment.save();
    await assignment.populate('teacher', 'name email');

    res.json(assignment);
  } catch (error) {
    console.error('Complete assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/:id/submissions
// @desc    Get submissions for an assignment
// @access  Private (Teacher only)
router.get('/:id/submissions', auth, authorize('teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if teacher owns this assignment
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
