const express = require('express');
const Property = require('../models/Property');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { validateProperty } = require('../middleware/validation');
const { sendPropertyNotificationEmail } = require('../utils/emailService');

const router = express.Router();

// @route   GET /api/properties
// @desc    Get all approved properties with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      location,
      type,
      bhk,
      status,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isApproved: true, isActive: true };

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (bhk && bhk !== 'all') {
      filter.bhk = bhk;
    }

    if (status) {
      filter.status = status;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const properties = await Property.find(filter)
      .populate('owner', 'name email phone')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Property.countDocuments(filter);
    console.log(properties)

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProperties: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching properties'
    });
  }
});

// @route   GET /api/properties/:id
// @desc    Get single property by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (!property.isApproved || !property.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Property not available'
      });
    }

    // Increment view count
    property.views += 1;
    await property.save();

    res.json({
      success: true,
      data: { property }
    });

  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching property'
    });
  }
});

// @route   POST /api/properties
// @desc    Create a new property listing
// @access  Private
router.post('/', auth, validateProperty, async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      owner: req.user._id,
      isApproved: true, // Auto-approve properties for immediate visibility
      isActive: true,   // Ensure property is active
      images: [req.body.image || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800']
    };

    const property = new Property(propertyData);
    await property.save();

    // Populate owner details
    await property.populate('owner', 'name email phone');

    // Send email notification
    try {
      await sendPropertyNotificationEmail({
        propertyData: property,
        ownerEmail: property.ownerEmail,
        ownerName: property.ownerName
      });
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
       message: 'Property listed successfully! It will be reviewed and approved soon.',
       message: 'Property listed successfully and is now live on the website!',
      data: { property }
    });

  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating property listing'
    });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update property (owner only)
// @access  Private
router.put('/:id', auth, validateProperty, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user is the owner
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own properties.'
      });
    }

    // Update property
    Object.assign(property, req.body);
    property.isApproved = false; // Reset approval status for review
    
    await property.save();
    await property.populate('owner', 'name email phone');

    res.json({
      success: true,
      message: 'Property updated successfully! It will be reviewed again.',
      data: { property }
    });

  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating property'
    });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property (owner only)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user is the owner
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own properties.'
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting property'
    });
  }
});

// @route   GET /api/properties/user/my-properties
// @desc    Get current user's properties
// @access  Private
router.get('/user/my-properties', auth, async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { properties }
    });

  } catch (error) {
    console.error('Get user properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your properties'
    });
  }
});

// @route   POST /api/properties/:id/wishlist
// @desc    Add/Remove property from wishlist
// @access  Private
router.post('/:id/wishlist', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const user = await User.findById(req.user._id);
    const propertyIndex = user.wishlist.indexOf(req.params.id);

    if (propertyIndex > -1) {
      // Remove from wishlist
      user.wishlist.splice(propertyIndex, 1);
      await user.save();
      
      res.json({
        success: true,
        message: 'Property removed from wishlist',
        data: { inWishlist: false }
      });
    } else {
      // Add to wishlist
      user.wishlist.push(req.params.id);
      await user.save();
      
      res.json({
        success: true,
        message: 'Property added to wishlist',
        data: { inWishlist: true }
      });
    }

  } catch (error) {
    console.error('Wishlist toggle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating wishlist'
    });
  }
});

// @route   GET /api/properties/user/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/user/wishlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'wishlist',
        match: { isApproved: true, isActive: true },
        populate: {
          path: 'owner',
          select: 'name email phone'
        }
      });

    res.json({
      success: true,
      data: { wishlist: user.wishlist }
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist'
    });
  }
});

module.exports = router;