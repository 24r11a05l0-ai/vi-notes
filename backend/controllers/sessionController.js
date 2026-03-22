exports.saveSession = (req, res) => {
  console.log(req.body);
  res.json({ message: "Session stored" });
};