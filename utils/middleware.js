import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const validateToken = async (token) => {
  if (!token) {
    throw new Error("Not authorized, no token");
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Protect Routes for User Authentication
export const authProtect = asyncHandler(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = await validateToken(token);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

export const clientConnectionProtect = asyncHandler(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[2];
      const decoded = await validateToken(token);
      req.mongoURI = decoded.id;
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Connection expired, kindly connect your DB again");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});
