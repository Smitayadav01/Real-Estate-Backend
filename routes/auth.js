const express = require("express");
const { body, validationResult } = require("express-validator");

const { auth } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
} = require("../controllers/authController");

const router = express.Router();

// Shared validation handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name is required and must be at least 2 characters"),
    body("phone")
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage("Please provide a valid phone number"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("email")
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    validate,
  ],
  registerUser
);

/**
 * @route POST /api/auth/login
 * @desc Login user with phone or email
 * @access Public
 */
router.post(
  "/login",
  [
    body("phone")
      .optional({ checkFalsy: true })
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage("Invalid phone number"),
    body("email")
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage("Invalid email")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
  ],
  loginUser
);

/**
 * @route GET /api/auth/me
 * @desc Get logged-in user
 * @access Private
 */
router.get("/me", auth, getMe);

/**
 * @route PUT /api/auth/profile
 * @desc Update logged-in user's profile
 * @access Private
 */
router.put("/profile", auth, updateProfile);

module.exports = router;
