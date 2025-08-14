const express = require("express");
const { body } = require("express-validator");

const { auth } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
} = require("../controllers/authController");

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const { validationResult } = require("express-validator");
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
 */
router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name is required"),
    body("phone")
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage("Please provide a valid phone number"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    validate,
  ],
  registerUser
);

/**
 * @route POST /api/auth/login
 */
router.post(
  "/login",
  [body("password").notEmpty().withMessage("Password is required"), validate],
  loginUser
);

/**
 * @route GET /api/auth/me
 */
router.get("/me", auth, getMe);

/**
 * @route PUT /api/auth/profile
 */
router.put("/profile", auth, updateProfile);

module.exports = router;
