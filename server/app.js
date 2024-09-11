const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const jobController = require("./controllers/jobController");
require("dotenv").config();

const app = express();

// Use Helmet for security
app.use(helmet());

app.use(bodyParser.json());
app.use(cors());

// I stored this connection string in an environment variable (e.g., in a .env file)
// to ensure sensitive information is not exposed in the codebase.
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Define routes and map them to controller functions
app.put("/api/jobs/status", jobController.updateJobsStatus);
app.post("/api/jobs", jobController.createJob);
app.get("/api/jobs", jobController.getJobs);
app.put("/api/jobs/:id", jobController.updateJob);
app.put("/api/jobs/archive/:id", jobController.archiveJob);
app.delete("/api/jobs/:id", jobController.deleteJob);

// Start the server and listen on the specified port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
