import { Task } from "../models/taskModel.js";

export const allTodo = async (req, res) => {
  try {
    let id = req.user.id;
    let alltasks = await Task.find({ userId: id });
    res.status(200).json({ alltasks });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const newTodo = async (req, res) => {
  try {
    let task = req.body;
    task.userId = req.user.id;
    const newTask = new Task(task);
    await newTask.save();
    res.status(200).json({ message: "ok" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const deleteTodo = async (req, res) => {
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
};

export const editTodo = async (req, res) => {
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
};

export const toggleTodo = async (req, res) => {
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
};
