const mongoose = require("mongoose");

// Define the Job schema to structure job documents in MongoDB
const JobSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Submitted", "In Progress", "Completed"],
    default: "Submitted",
  },
  dateSubmitted: {
    type: Date,
    default: Date.now,
  },
  archived: {
    type: Boolean,
    default: false,
  },
});
// Export the Job model to interact with the jobs collection in MongoDB
module.exports = mongoose.model("Job", JobSchema);
