const express = require("express");
const router = express.Router();

router.post("/save-session", (req, res) => {
  console.log(req.body);
  res.json({ message: "Session saved successfully" });
});

module.exports = router;