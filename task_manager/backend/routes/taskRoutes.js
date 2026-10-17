const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
  return res.json(tasks);
});

router.post("/", async (req, res) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  if (!title || title.length > 120) {
    return res.status(400).json({ message: "Title is required (up to 120 characters)." });
  }
  if (description.length > 1000) {
    return res.status(400).json({ message: "Description must be 1000 characters or fewer." });
  }

  const task = await Task.create({
    title,
    description,
    user: req.user.id
  });
  return res.status(201).json(task);
});

router.patch("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid task ID." });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const updates = {};
  if (Object.hasOwn(body, "title")) {
    if (typeof body.title !== "string" || !body.title.trim() || body.title.trim().length > 120) {
      return res.status(400).json({ message: "Title is required (up to 120 characters)." });
    }
    updates.title = body.title.trim();
  }
  if (Object.hasOwn(body, "description")) {
    if (typeof body.description !== "string" || body.description.trim().length > 1000) {
      return res.status(400).json({ message: "Description must be 1000 characters or fewer." });
    }
    updates.description = body.description.trim();
  }
  if (Object.hasOwn(body, "completed")) {
    if (typeof body.completed !== "boolean") {
      return res.status(400).json({ message: "Completed must be true or false." });
    }
    updates.completed = body.completed;
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "Provide at least one valid task field to update." });
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }

  return res.json(task);
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid task ID." });
  }

  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }

  return res.json({ message: "Task deleted successfully." });
});

module.exports = router;