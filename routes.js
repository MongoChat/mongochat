import express from "express";
import {
  connectMongoDB,
  executeQuery,
  testToken,
  validateMongoURI,
} from "./controller.js";
import { protect } from "./utils/middleware.js";

const router = express.Router();

router.route("/validate-connection-url").post(validateMongoURI);
router.route("/connect-mongodb").post(connectMongoDB);
router.route("/test-token").get(protect, testToken);
router.route("/execute-query").get(protect, executeQuery);

export default router;
