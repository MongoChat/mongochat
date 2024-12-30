import express from "express";
import { testController } from "./controller.js";

const router = express.Router();

router.route("/test").get(testController);

export default router;
