import express from "express";
import { connectMongoDB, testToken, validateMongoURI } from "./controller.js";
import { protect } from "./utils/middleware.js";

const router = express.Router();

router.route("/validate-connection-url").post(validateMongoURI);
router.route("/connect-mongodb").post(connectMongoDB);
router.route("/test-token").get(protect, testToken);

export default router;
