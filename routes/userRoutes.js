import express from "express";
import { signupOrLoginUser } from "../controllers/userController.js";

const router = express.Router();

router.route("/login").post(signupOrLoginUser);

export default router;
