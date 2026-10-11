require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

const app = express();

app.use(express.json());


if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("MONGO_URI and JWT_SECRET must be set in .env");
  process.exit(1);
}


app.get("/", (req, res) => {
  res.json({
    message: "Week 3 User Management API is running"
  });
});

app.use("/api/users", require("./routes/userRouter"));


app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});


const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();