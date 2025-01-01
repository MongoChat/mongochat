import axios from "axios";
import asyncHandler from "express-async-handler";
import { MongoClient } from "mongodb";
import generateToken from "./utils/generateToken.js";
import { generateQuery, getDBName, validateURI } from "./utils/common.js";
import vm from "vm";

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

/**
 * @route   GET /api/execute-query
 * @desc    make LLM model API call to process natural language into a DB query
 * @access  Private
 */

export const executeQuery = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const uri = req.mongoURI;
  // const uri = "mongodb://localhost:27017/test";
  try {
    const command = await generateQuery(message);
    // console.log("LOG 2 : ", command);
    const dbName = getDBName(uri);

    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db(dbName);

    const sandbox = { db, result: null };
    vm.createContext(sandbox);

    const script = new vm.Script(`result = ${command}`);
    await script.runInContext(sandbox);

    let documents = [];
    if (sandbox.result && typeof sandbox.result.toArray === "function") {
      documents = await sandbox.result.toArray();
    }

    await client.close();
    res.status(200).json({ data: documents });
  } catch (error) {
    // console.log(error);
    res.status(400).json({ error: error.response?.data || error.message });
  }
});
