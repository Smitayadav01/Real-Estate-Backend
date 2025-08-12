// routes/properties.js

const express = require('express');
const Property = require('../models/Property');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { validateProperty } = require('../middleware/validation');
const { sendPropertyNotificationEmail } = require('../utils/emailService');

const router = express.Router();

// Allowed values for enums
const ALLOWED_TYPES = ['apartment', 'house', 'villa', 'commercial'];
const ALLOWED_STATUS = ['sale', 'rent'];

/* -------------------- PUBLIC ROUTES -------------------- */

// GET all approved properties with filtering
router.get('/', async (req, res) => {
  try {
    let {
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

    page = parseInt(page);
    limit = parseInt(limit);

    const filter = { isApproved: true, isActive: true };

    if (location) filter.location = { $regex: location, $options: 'i' };
    if (type && type !== 'all') filter.type = type;
    if (bhk && bhk !== 'all') filter.bhk = bhk;
    if (status) filter.status = status;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    if (search) filter.$text = { $search: search };

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate('owner', 'name email phone')
        .sort(sort)
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(),
      Property.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          currentPage: page,
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

/* -------------------- AUTHENTICATED ROUTES -------------------- */

// Get current user's properties
router.get('/user/my-properties', auth, async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: { properties } });
  } catch (error) {
    console.error('Get user properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your properties'
    });
  }
});

// Get user's wishlist
router.get('/user/wishlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'wishlist',
        match: { isApproved: true, isActive: true },
        populate: { path: 'owner', select: 'name email phone' }
      });

    res.json({ success: true, data: { wishlist: user.wishlist } });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist'
    });
  }
});

// Create a new property listing
router.post('/', auth, async (req, res) => {
  try {
    const { type, status, title, description, price, location, bhk, images } = req.body;

    // Validate enums
    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: `Invalid type. Allowed: ${ALLOWED_TYPES.join(', ')}` });
    }
    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${ALLOWED_STATUS.join(', ')}` });
    }

    const propertyData = {
      title,
      description: description || '',
      price: price || 0,
      location: location || 'Not specified',
      bhk: bhk || 1,
      type,
      status,
      owner: req.user._id,
      ownerName: req.user.name,
      ownerPhone: req.user.phone,
      ownerEmail: req.user.email,
      isApproved: true,
      isActive: true,
      images: images && images.length > 0
        ? images
        : ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800']
    };

    const property = new Property(propertyData);
    await property.save();
    await property.populate('owner', 'name email phone');

    try {
      await sendPropertyNotificationEmail({
        propertyData: property,
        ownerEmail: property.owner.email,
        ownerName: property.owner.name
      });
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }

    res.status(201).json({
      success: true,
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

