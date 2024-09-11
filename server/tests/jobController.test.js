const request = require("supertest");
const express = require("express");
const jobController = require("../controllers/jobController");
const bodyParser = require("body-parser");
const Job = require("../models/Job");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

// Create an express app for testing with necessary middlewares and routes
const app = express();
app.use(bodyParser.json());
app.post("/api/jobs", jobController.createJob);
app.get("/api/jobs", jobController.getJobs);
app.put("/api/jobs/:id", jobController.updateJob);
app.put("/api/jobs/status", jobController.updateJobsStatus);
app.put("/api/jobs/archive/:id", jobController.archiveJob);
app.delete("/api/jobs/:id", jobController.deleteJob);

let mongoServer;

describe("Job Controller", () => {
  // Set up a new in-memory MongoDB server before running tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Clean up the database before each test to ensure isolation
  beforeEach(async () => {
    await Job.deleteMany({});
  });

  // Disconnect and stop the in-memory MongoDB server after running tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("should create a new job", async () => {
    const newJob = {
      description: "Test job",
      location: "Test location",
      priority: "High",
    };

    // Send a POST request to create a new job and check the response
    const response = await request(app)
      .post("/api/jobs")
      .send(newJob)
      // Expect a "201 Created" response
      .expect(201);

    // Verify the response contains the correct job data and default status
    expect(response.body.description).toBe(newJob.description);
    expect(response.body.location).toBe(newJob.location);
    expect(response.body.priority).toBe(newJob.priority);
    expect(response.body.status).toBe("Submitted");
  });

  it("should return validation errors for missing required fields", async () => {
    const invalidJob = {
      location: "Test location", // Missing 'description' and 'priority'
    };

    // Send a POST request with incomplete job data and expect a validation error
    const response = await request(app)
      .post("/api/jobs")
      .send(invalidJob)
      // Expect a "400 Bad Request" response
      .expect(400);

    // Verify that validation errors are returned
    expect(response.body.errors.length).toBeGreaterThan(0);
    expect(response.body.errors[0].msg).toBe("Description is required");
  });

  it("should get all jobs", async () => {
    // Create and save two jobs to the database
    const job1 = new Job({
      description: "Job 1",
      location: "Loc 1",
      priority: "Low",
    });
    const job2 = new Job({
      description: "Job 2",
      location: "Loc 2",
      priority: "Medium",
    });
    await job1.save();
    await job2.save();

    // Send a GET request to retrieve all jobs and check the response
    const response = await request(app)
      .get("/api/jobs")
      // Expect a "200 OK" response
      .expect(200);

    // Verify that two jobs are returned in the response
    expect(response.body.length).toBe(2);
  });

  it("should update a job", async () => {
    // Create and save a job to be updated
    const job = new Job({
      description: "Job to be updated",
      location: "Loc",
      priority: "Low",
    });
    await job.save();

    const updatedJob = {
      status: "In Progress",
    };

    // Send a PUT request to update the job's status and check the response
    const response = await request(app)
      .put(`/api/jobs/${job._id}`)
      .send(updatedJob)
      // Expect a "200 OK" response
      .expect(200);

    // Verify that the job's status has been updated in the response
    expect(response.body.status).toBe(updatedJob.status);
  });

  it("should delete a job", async () => {
    // Create and save a job to be deleted
    const job = new Job({
      description: "Job to be deleted",
      location: "Loc",
      priority: "Low",
    });
    await job.save();

    // Send a DELETE request to remove the job and check the response
    await request(app)
      .delete(`/api/jobs/${job._id}`)
      // Expect a "200 OK" response
      .expect(200);

    // Verify that the job has been removed from the database
    const foundJob = await Job.findById(job._id);
    expect(foundJob).toBeNull();
  });
});
