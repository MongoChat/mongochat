import { MongoClient } from "mongodb";

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
