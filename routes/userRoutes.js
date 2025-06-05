import express from "express";
const router = express.Router();
import * as userController from "../controllers/userController.js";
import { authenticate } from "../middlewares.js";

router.route("/signup").post(userController.signup);
router.route("/login").post(userController.login);
router.route("/logout").get(authenticate, userController.logout);

export default router;
