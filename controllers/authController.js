const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ✅ JWT Generator
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ✅ REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, and password are required",
      });
    }

    // Check phone
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "User with this phone number already exists",
      });
    }

    // Check email only if provided
    if (email && email.trim() !== "") {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const userData = { name, phone, password: hashedPassword };
    if (email && email.trim() !== "") userData.email = email;

    let user;
    try {
      user = new User(userData);
      await user.save();
    } catch (err) {
      console.error('User save error:', err);
      return res.status(500).json({
        success: false,
        message: 'Server error during registration',
        error: err.message,
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};


// ✅ LOGIN USER (Phone only)
const loginUser = async (req, res) => {
  try {
    let { phone, password } = req.body;

    console.log('📥 Incoming login payload:', { phone, password });

    // Validate request
    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    // Normalize phone number: remove spaces, dashes, plus signs
    phone = phone.replace(/\D/g, ''); // keep only digits
    console.log('📞 Normalized phone:', phone);

    // Lookup user by phone
    const user = await User.findOne({ phone }).select('+password');
    console.log('👤 Found user in DB:', user ? user.phone : 'No user found');

    if (!user) {
      return res.status(400).json({ message: 'No account found with that phone number' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔑 Password match result:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from user object before sending
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('✅ Login successful for:', user.phone);

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// ✅ GET LOGGED-IN USER
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          wishlist: user.wishlist,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user data",
    });
  }
};

// ✅ UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

module.exports = { registerUser, loginUser, getMe, updateProfile };
