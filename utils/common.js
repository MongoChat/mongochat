import { MongoClient } from "mongodb";
import { GroqClient } from "../index.js";

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

export const generateQuery = async (message) => {
  let executeableQuery = null;
  try {
    const prompt = `convert natural language to a mongodb query without explaination: ${message}`;
    const chatCompletion = await GroqClient.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-8b-8192",
    });

    // console.log("LOG 1: ", chatCompletion.choices[0].message.content);

    const query = await extractQuery(chatCompletion.choices[0].message.content);
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
