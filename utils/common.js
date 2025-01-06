import { MongoClient } from "mongodb";
import { GroqClient, redis } from "../index.js";
import axios from "axios";

export const getDBName = (uri) => {
  const parsedUrl = new URL(uri);
  const dbName = parsedUrl.pathname
    ? parsedUrl.pathname.replace("/", "")
    : null;
  return dbName;
};

export const validateURI = async (uri) => {
  try {
    const dbName = getDBName(uri);

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

const extractQuery = (string) => {
  const match = string.match(/db\.\w+\.\w+\((\[.*\]|\{.*\})\)/);
  if (match) {
    const query = match[0];
    return query.trim();
  }

  return null;
};

export const generateQuery = async (message, userId) => {
  let executeableQuery = null;
  try {
    const collectionMetadata = await redis.get(userId); // get metadata for context setting in prompt
    const prompt = `You are an expert MongoDB assistant. Convert the following natural language request into a MongoDB query. 

                    ### Format Rules:
                    1. Use case-insensitive matching for string comparisons by using the '$regex' operator with the '$option' 'i'.
                    2. Always start the query with 'db.collection('<collection_name>')' where '<collection_name>' is the relevant collection.
                    3. Use proper MongoDB query syntax without any extra spaces or newlines.
                    4. Do not include explanations or any additional text.

                    Here is the schema of the database:

                    ${collectionMetadata}

                    Natural language request: ${message}

                    Your response should only contain the MongoDB query in the exact format as mentioned.`;

    const chatCompletion = await GroqClient.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-8b-8192",
    });

    const query = chatCompletion.choices[0].message.content;
    // console.log("LOG 1: ", chatCompletion.choices[0].message.content);

    // const query = await extractQuery(chatCompletion.choices[0].message.content);
    executeableQuery = await transformQuery(query);
  } catch (error) {
    throw new Error(error);
  }
  return executeableQuery;
};

const transformQuery = async (queryString) => {
  if (typeof queryString !== "string") {
    throw new Error("Query must be a string");
  }

  const regex = /^db\.(\w+)(\.\w+)\((.*)\)$/;
  const match = queryString.match(regex);

  if (match) {
    const collectionName = match[1];
    const methodName = match[2];
    const args = match[3];

    if (methodName === ".aggregate" && !args.startsWith("[")) {
      throw new Error("Aggregate queries should have a pipeline as an array.");
    }

    return `db.collection('${collectionName}')${methodName}(${args})`;
  } else {
    throw new Error("Invalid MongoDB shell query format");
  }
};

export const getCollectionMetaData = async (uri) => {
  try {
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db();

    const collections = await db.listCollections().toArray();

    const metadata = {};

    for (const collection of collections) {
      const collectionName = collection.name;
      const sampleData = await db.collection(collectionName).findOne();

      if (sampleData) {
        metadata[collectionName] = Object.keys(sampleData).reduce(
          (schema, key) => {
            schema[key] = typeof sampleData[key];
            return schema;
          },
          {}
        );
      } else {
        metadata[collectionName] = {};
      }
    }

    await client.close();

    return JSON.stringify(metadata);
  } catch (error) {
    throw new Error(`Failed to get collection metadata: ${error.message}`);
  }
};

const GOOGLE_AUTH_API = process.env.GOOGLE_AUTH_API;
export const getGoogleUserInfo = async (access_token) => {
  try {
    const response = await axios.get(
      `${GOOGLE_AUTH_API}/userinfo?access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
