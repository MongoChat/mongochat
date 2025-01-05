import express from "express";
import {
  connectMongoDB,
  disconnectDB,
  executeQuery,
  testToken,
  validateMongoURI,
} from "../controllers/chatController.js";
import { authProtect, clientConnectionProtect } from "../utils/middleware.js";

const router = express.Router();

router.route("/validate-connection-url").post(validateMongoURI);
router.route("/connect-mongodb").post(authProtect, connectMongoDB);
router.route("/disconnect-mongodb").post(authProtect, disconnectDB);
router
  .route("/test-token")
  .get(authProtect, clientConnectionProtect, testToken);
router
  .route("/execute-query")
  .post(authProtect, clientConnectionProtect, executeQuery);

export default router;
