import axios from "axios";
import asyncHandler from "express-async-handler";
import { MongoClient } from "mongodb";
import generateToken from "./utils/generateToken.js";

// const mongoURI = "mongodb://localhost:27017/test";

const validateURI = async (uri) => {
  try {
    const parsedUrl = new URL(uri);
    const dbName = parsedUrl.pathname
      ? parsedUrl.pathname.replace("/", "")
      : null;

    if (!dbName) {
      throw new Error("Database name is not specified in the URI");
    }

    const client = new MongoClient(uri);
    await client.connect();

    const databases = await client.db().admin().listDatabases();
    const dbExists = databases.databases.some((db) => db.name === dbName);
    await client.close();

    if (dbExists) {
      return { statusCode: 200, message: "success" };
    } else {
      throw new Error(`Database ${dbName} does not exist.`);
    }
  } catch (err) {
    return {
      statusCode: 400,
      message:
        err.codeName === "AtlasError" ? "Invalid MongoDB URI" : err.message,
    };
  }
};

/**
 * @route   POST /api/mongo/validate-uri
 * @desc    Validate MongoDB URI by checking if the database exists
 * @access  Public
 */
export const validateMongoURI = asyncHandler(async (req, res) => {
  const { uri } = req.body;
  const { statusCode, message } = await validateURI(uri);

  res.status(statusCode).json({ message });
});

/**
 * @route   POST /api/mongo/connect
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
