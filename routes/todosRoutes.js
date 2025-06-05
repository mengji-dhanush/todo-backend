import express from "express";
const router = express.Router();
import * as todosController from "../controllers/todosController.js";
import { authenticate } from "../middlewares.js";

router
  .route("/")
  .get(authenticate, todosController.allTodo)
  .post(authenticate, todosController.newTodo);

router
  .route("/:id")
  .delete(authenticate, todosController.deleteTodo)
  .put(authenticate, todosController.editTodo)
  .patch(authenticate, todosController.toggleTodo);

export default router;
