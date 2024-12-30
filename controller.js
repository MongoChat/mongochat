import axios from "axios";
import asyncHandler from "express-async-handler";
import { MongoClient } from "mongodb";
import generateToken from "./utils/generateToken.js";
import { validateURI } from "./utils/common.js";

// const mongoURI = "mongodb://localhost:27017/test";

/**
 * @route   POST /api/validate-uri
 * @desc    Validate MongoDB URI by checking if the database exists
 * @access  Public
 */
export const validateMongoURI = asyncHandler(async (req, res) => {
  const { uri } = req.body;
  const { statusCode, message } = await validateURI(uri);

  res.status(statusCode).json({ message });
});

/**
 * @route   POST /api/connect
 * @desc    Connect to MongoDB, validate URI, and return a token if successful
 * @access  Public
 */
export const connectMongoDB = asyncHandler(async (req, res) => {
  const { uri } = req.body;
  const { statusCode, message } = await validateURI(uri);

  if (statusCode == 200) {
    res.status(200).json({
      token: generateToken(uri),
      message: "success",
    });
  }

  res.status(statusCode).json({ message });
});

/**
 * @route   GET /api/test-token
 * @desc    Test route to check if token is valid
 * @access  Private
 */
export const testToken = asyncHandler(async (req, res) => {
  try {
    res.status(200).json({ uri: req.mongoURI });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});
