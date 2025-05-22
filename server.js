import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import express from "express";
const app = express();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
const jwt_secret = process.env.JWT_SECRET;
import { User } from "./userdb.js";
import { Task } from "./db.js";
import { authenticate } from "./middlewares.js";
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "https://todo-frontend-j8cw.vercel.app",
    credentials: true,
  })
);
const mongo_url = process.env.MONGO_URL;

async function main() {
  await mongoose.connect(mongo_url);
}
main()
  .then(() => console.log("connected to db successfully"))
  .catch((err) => console.log(err));

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "incomplete request" });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ user: { username: user.username, _id: user._id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "invalid credentials" });

    const token = jwt.sign(
      { username: user.username, id: user._id },
      jwt_secret,
      {
        expiresIn: "1h",
      }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .json({ message: "login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

app.get("/todos", authenticate, async (req, res) => {
  try {
    let id = req.user.id;
    let alltasks = await Task.find({ userId: id });
    res.status(200).json({ alltasks });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.post("/newtask", authenticate, async (req, res) => {
  try {
    let task = req.body;
    task.userId = req.user.id;
    const newTask = new Task(task);
    await newTask.save();
    res.status(200).json({ message: "ok" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.post("/task/:id", authenticate, async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    // Find the task and verify ownership
    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      return res
        .status(404)
        .json({ error: "Task not found or not authorized" });
    }

    await Task.deleteOne({ _id: taskId });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/task/edit/:id", authenticate, async (req, res) => {
  let taskId = req.params.id;
  let userId = req.user.id;
  let text = req.body.text;

  const task = await Task.findOne({ _id: taskId, userId });
  if (!task)
    return res.status(401).json({
      message:
        "task does not exist or you are not authorised to edit this task",
    });
  task.todo = text;
  await task.save();
  res.status(200).json({ message: "task updated" });
});
app.post("/completed/:id", authenticate, async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    // Find the task that belongs to the user
    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      return res
        .status(404)
        .json({ error: "Task not found or not authorized" });
    }

    task.completed = !task.completed;
    await task.save();

    res.status(200).json({ message: "Task marked as completed", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Logout route
app.get("/logout", authenticate, (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ message: "logged out successfully" });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
