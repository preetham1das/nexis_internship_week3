const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createToken = (userId) =>
  jwt.sign({}, process.env.JWT_SECRET, {
    subject: userId.toString(),
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  });

router.post("/register", async (req, res) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || name.length > 80) {
    return res.status(400).json({ message: "Name is required (up to 80 characters)." });
  }
  if (!emailPattern.test(email) || email.length > 254) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }
  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: "Password must be 8 to 128 characters." });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashedPassword });

  return res.status(201).json({
    token: createToken(user._id),
    user: { id: user._id, name: user.name, email: user.email }
  });
});

router.post("/login", async (req, res) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!emailPattern.test(email) || !password) {
    return res.status(400).json({ message: "Enter a valid email and password." });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }

  return res.json({
    token: createToken(user._id),
    user: { id: user._id, name: user.name, email: user.email }
  });
});

module.exports = router;