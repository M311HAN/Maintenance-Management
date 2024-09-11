import React, { useState } from "react";
import api from "../services/api";

// JobForm component handles the creation of new maintenance jobs
const JobForm = ({ onJobCreated }) => {
  // Local state to manage form inputs
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("Low");

  // Handles form submission to create a new job
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sends a POST request to the backend to create a new job
      const response = await api.post("/jobs", {
        description,
        location,
        priority,
      });
      console.log("Job created:", response.data);

      // Calls the parent component's onJobCreated function to refresh the job list
      if (onJobCreated) {
        onJobCreated(response.data);
      }

      // Clears the form inputs after successful submission
      setDescription("");
      setLocation("");
      setPriority("Low");
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-3">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <input
          id="description"
          type="text"
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="location" className="form-label">
          Location
        </label>
        <input
          id="location"
          type="text"
          className="form-control"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="priority" className="form-label">
          Priority
        </label>
        <select
          id="priority"
          className="form-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      <button type="submit" className="btn btn-primary">
        Submit Job
      </button>
    </form>
  );
};

export default JobForm;
