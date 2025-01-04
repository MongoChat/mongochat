import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

/**
 * @route   POST /api/users/signup
 * @desc    Register a new user
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const newUser = await User.create({ email, password });

    res.status(200).json({
      email: newUser.email,
      userId: newUser._id,
      authToken: generateToken(newUser._id),
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong while registering new user",
    });
  }
});

/**
 * @route   POST /api/users/login
 * @desc    login user
 * @access  Public
 */

export const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        userId: user._id,
        email: user.email,
        authToken: generateToken(user._id),
      });
    } else {
      res.status(401).json({
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});
