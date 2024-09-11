const Job = require("../models/Job");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");

// Create a new job with validation
exports.createJob = [
  // Validate and sanitize fields
  body("description")
    .not()
    .isEmpty()
    .withMessage("Description is required")
    .trim()
    .escape(),
  body("location")
    .not()
    .isEmpty()
    .withMessage("Location is required")
    .trim()
    .escape(),
  body("priority")
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High")
    .trim(),

  // Process the request after validation and sanitization
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // If there are no validation errors, proceed with creating the job
    const newJob = new Job(req.body);
    try {
      const job = await newJob.save();
      res.status(201).json(job);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
];

// Controller to fetch jobs with optional archived filter and sorted by status and date
exports.getJobs = async (req, res) => {
  try {
    const { archived } = req.query;
    // Convert query string to boolean
    const isArchived = archived === "true";
    const jobs = await Job.find({ archived: isArchived }).sort({
      status: 1,
      dateSubmitted: 1,
    });
    res.status(200).json(jobs);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller to update a job's status with validation
exports.updateJob = [
  body("status")
    .isIn(["Submitted", "In Progress", "Completed"])
    .withMessage("Invalid status value"),

  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Find the job by ID and update it
      const job = await Job.findByIdAndUpdate(req.params.id.trim(), req.body, {
        new: true,
      });
      res.status(200).json(job);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
];

// Batch update jobs with validation
exports.updateJobsStatus = [
  body("status")
    .isIn(["Submitted", "In Progress", "Completed"])
    .withMessage("Invalid status value"),

  async (req, res) => {
    try {
      const { ids, status } = req.body;

      if (!ids || !status) {
        return res.status(400).json({ message: "Missing ids or status" });
      }

      const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

      // Attempt to update the status only if it's different from the current status
      // Also performs batch updates using MongoDB's UpdateMany method.
      const result = await Job.updateMany(
        // Match only if status is different
        { _id: { $in: objectIds }, status: { $ne: status } },
        { $set: { status: status } }
      );

      // Handle cases where no jobs were updated
      if (result.modifiedCount === 0) {
        return res.status(200).json({
          message:
            "No jobs were updated because they were already in the desired state",
        });
      }

      res
        .status(200)
        .json({ message: `${result.modifiedCount} jobs updated successfully` });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
];

// Controller to archive a job by setting its archived flag to true
exports.archiveJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true }
    );
    res.status(200).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller to delete a job by its ID
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
