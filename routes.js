import express from "express";
import { validateMongoURI } from "./controller.js";

const router = express.Router();

router.route("/validate-connection-url").post(validateMongoURI);

export default router;
