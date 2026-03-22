const sessionSchema = {
  text: String,
  keystrokes: Array,
  pasteEvents: Array,
  startTime: Number,
  endTime: Number
};

module.exports = sessionSchema;