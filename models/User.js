const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: false, // Optional
    unique: false,   // Not enforced as unique
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{9,14}$/,
      'Please enter a valid phone number'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Hidden by default in queries
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    }
  ],
  profileImage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// ✅ Hash password only if modified or new
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Compare candidate password safely
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword) {
    throw new Error('No password provided for comparison');
  }
  if (!this.password) {
    throw new Error('No password stored in user document — did you forget to select it?');
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Remove sensitive info from output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
