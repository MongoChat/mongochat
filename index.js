import express from "express";
import bodyParser from "body-parser";
import colors from "colors";
import "dotenv/config";

import routes from "./routes.js";

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/", routes);

const PORT = process.env.PORT || 9000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.blue.bold
  )
);
