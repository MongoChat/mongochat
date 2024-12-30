import axios from "axios";
import asyncHandler from "express-async-handler";
import { MongoClient } from "mongodb";

const mongoURI = "mongodb://localhost:27017/test";

export const validateMongoURI = asyncHandler(async (req, res) => {
  try {
    const { uri } = req.body;
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
      return res.status(200).json({
        message: `success`,
      });
    } else {
      throw new Error(`Database ${dbName} does not exist.`);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message:
        err.codeName === "AtlasError" ? "Invalid MongoDB URI" : err.message,
    });
  }
});
