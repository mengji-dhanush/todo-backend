import express from "express";
const router = express.Router();
import * as userController from "../controllers/userController";
import { authenticate } from "../middlewares";

router.route("/signup").post(userController.signup);
router.route("/login").post(userController.login);
router.route("/logout").get(authenticate, userController.logout);

export default router;
