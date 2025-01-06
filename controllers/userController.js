import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

/**
 * @route   POST /api/users/login
 * @desc    Sign up or login user with Google user info
 * @access  Public
 */

export const signupOrLoginUser = asyncHandler(async (req, res) => {
  try {
    const { email, name, picture, id } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        userId: id,
        email,
        name,
        picture,
      });
    }

    res.status(200).json({
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      authToken: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});
