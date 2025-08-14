const express = require('express');
const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const { auth } = require('../middleware/auth');
const { validateInquiry } = require('../middleware/validation');
const { sendInquiryEmail } = require('../utils/emailService');

const router = express.Router();

/**
 * @route   POST /api/inquiries/:_id
 * @desc    Send inquiry for a property
 * @access  Public
 */
router.post('/:_id', validateInquiry, async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const propertyId = req.params._id; // <-- use _id instead of propertyId

    // Check if property exists
    const property = await Property.findById(propertyId)
      .populate('owner', 'name email phone');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    if (!property.isApproved || !property.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Property is not available for inquiries',
      });
    }

    // Create inquiry
    const inquiry = new Inquiry({
      property: propertyId,
      inquirer: { name, email, phone },
      message,
    });

    await inquiry.save();

    // Send email to property owner
    try {
      await sendInquiryEmail({
        propertyTitle: property.title,
        inquirerData: { name, email, phone, message },
        ownerEmail: property.ownerEmail,
        ownerName: property.ownerName,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don’t fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry sent successfully! The property owner will contact you soon.',
      data: { inquiry },
    });
  } catch (error) {
    console.error('Send inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending inquiry',
    });
  }
});

/**
 * @route   GET /api/inquiries/property/:_id
 * @desc    Get inquiries for a property (property owner only)
 * @access  Private
 */
router.get('/property/:_id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params._id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Check if user is the property owner
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view inquiries for your own properties.',
      });
    }

    const inquiries = await Inquiry.find({ property: req.params._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: { inquiries },
    });
  } catch (error) {
    console.error('Get property inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching inquiries',
    });
  }
});

/**
 * @route   GET /api/inquiries/my-inquiries
 * @desc    Get all inquiries for user's properties
 * @access  Private
 */
router.get('/my-inquiries', auth, async (req, res) => {
  try {
    const userProperties = await Property.find({ owner: req.user._id }).select('_id');
    const propertyIds = userProperties.map((prop) => prop._id);

    const inquiries = await Inquiry.find({ property: { $in: propertyIds } })
      .populate('property', 'title location price status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { inquiries },
    });
  } catch (error) {
    console.error('Get user inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your inquiries',
    });
  }
});

/**
 * @route   GET /api/inquiries/me
 * @desc    Alias of /my-inquiries (for frontend compatibility)
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    const userProperties = await Property.find({ owner: req.user._id }).select('_id');
    const propertyIds = userProperties.map((prop) => prop._id);

    const inquiries = await Inquiry.find({ property: { $in: propertyIds } })
      .populate('property', 'title location price status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { inquiries },
    });
  } catch (error) {
    console.error('Get user inquiries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your inquiries',
    });
  }
});

/**
 * @route   PUT /api/inquiries/:_id/respond
 * @desc    Respond to an inquiry
 * @access  Private
 */
router.put('/:_id/respond', auth, async (req, res) => {
  try {
    const { response } = req.body;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required',
      });
    }

    const inquiry = await Inquiry.findById(req.params._id).populate(
      'property',
      'owner title'
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found',
      });
    }

    // Check if user is the property owner
    if (inquiry.property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only respond to inquiries for your own properties.',
      });
    }

    // Update inquiry
    inquiry.response = response.trim();
    inquiry.status = 'responded';
    inquiry.respondedAt = new Date();

    await inquiry.save();

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: { inquiry },
    });
  } catch (error) {
    console.error('Respond to inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while responding to inquiry',
    });
  }
});

module.exports = router;
