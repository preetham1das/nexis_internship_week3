require("dotenv").config();
const cors = require("cors");

const express = require("express");
const path = require("path");
const connectDB = require("./config/db");

const app = express();

const clientOrigins = (
  process.env.CLIENT_ORIGINS ||
  "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedLocalNetworkOrigin = (origin) => {
  let parsedOrigin;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    return false;
  }

  if (parsedOrigin.protocol !== "http:" || !["5173", "5174"].includes(parsedOrigin.port)) {
    return false;
  }

  const hostname = parsedOrigin.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "::1" ||
    hostname === "[::1]" ||
    /^127(?:\.\d{1,3}){3}$/.test(hostname)
  ) {
    return true;
  }

  const octets = hostname.split(".").map(Number);
  if (
    octets.length !== 4 ||
    octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)
  ) {
    return false;
  }

  return (
    octets[0] === 10 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168)
  );
};

app.use(cors({
  origin(origin, callback) {
    callback(
      null,
      !origin || clientOrigins.includes(origin) || isAllowedLocalNetworkOrigin(origin)
    );
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("MONGO_URI and JWT_SECRET must be set in .env");
  process.exit(1);
}

app.get("/", (req, res) => {
  res.json({
    message: "Week 3 User Management API is running"
  });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/users", require("./routes/userRouter"));
app.use("/api/images", require("./routes/imageRoutes"));

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