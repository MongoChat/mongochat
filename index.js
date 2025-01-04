import express from "express";
import bodyParser from "body-parser";
import colors from "colors";
import "dotenv/config";
import Groq from "groq-sdk";
import cors from "cors";
import connectDB from "./utils/dbConnect.js";

import chatRoutes from "./routes/chatRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
connectDB();

export const GroqClient = new Groq({
  apiKey: process.env.GROQ_API_TOKEN,
});

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/", chatRoutes);
app.use("/api/users/", userRoutes);

const PORT = process.env.PORT || 9000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.blue.bold
  )
);
