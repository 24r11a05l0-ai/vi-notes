const express = require("express");
const cors = require("cors");

const app = express();

// 🔹 Middleware
app.use(cors());
app.use(express.json());

// 🔹 Route
app.post("/save-session", (req, res) => {
  console.log("📥 Session received:");
  console.log(req.body);

  res.json({ message: "Session saved successfully" });
});

// 🔹 Start Server
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});