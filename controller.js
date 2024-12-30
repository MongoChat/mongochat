import axios from "axios";
import asyncHandler from "express-async-handler";
import { MongoClient } from "mongodb";

const mongoURI = "mongodb://localhost:27017/test";

export const testController = asyncHandler(async (req, res) => {
  try {
    const client = new MongoClient(mongoURI);
    await client.connect();

    const db = client.db("test");
    const collection = db.collection("users");

    const query = { age: { $gt: 25 } };
    const results = await collection.find(query).toArray();

    res.status(200).json({ results });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});
