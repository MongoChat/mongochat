import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import { getGoogleUserInfo } from "../utils/common.js";

/**
 * @route   POST /api/users/login
 * @desc    Sign up or login user with Google user info
 * @access  Public
 */

export const signupOrLoginUser = asyncHandler(async (req, res) => {
  try {
    const { access_token } = req.body;

    const userinfo = await getGoogleUserInfo(access_token);
    const { email, name, picture, id } = userinfo;

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
      message: error.response.data.error.message
        ? error.response.data.error.message
        : "Something went wrong",
    });
  }
});
