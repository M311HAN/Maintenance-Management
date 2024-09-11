import React, { useState } from "react";
import api from "../services/api";

// JobList component displays a list of maintenance jobs and handles updates
const JobList = ({
  jobs,
  onStatusChange,
  onArchiveChange,
  showArchived,
  setShowArchived,
}) => {
  // Local state to manage status filter selection
  const [filter, setFilter] = useState("All");
  const [selectedJobs, setSelectedJobs] = useState([]); // <-- New state to track selected jobs

  // Handles status change of a single job
  const handleStatusChange = async (id, newStatus) => {
    try {
      // Sends a PUT request to update the status of the specified job
      await api.put(`/jobs/${id}`, { status: newStatus });
      // Refreshes the job list
      onStatusChange();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Handles archiving of a single job
  const handleArchiveJob = async (id) => {
    try {
      // Sends a PUT request to archive the specified job
      await api.put(`/jobs/archive/${id}`);
      // Refreshes the job list
      onArchiveChange();
    } catch (error) {
      console.error("Error archiving job:", error);
    }
  };

  // Handles deletion of a single job
  const handleDeleteJob = async (id, description, location, priority) => {
    // Confirms the deletion action with the user
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the job:\n\n` +
        `Description: ${description}\n` +
        `Location: ${location}\n` +
        `Priority: ${priority}`
    );

    if (confirmDelete) {
      try {
        // Sends a DELETE request to remove the specified job
        await api.delete(`/jobs/${id}`);
        // Refreshes the job list
        onStatusChange();
      } catch (error) {
        console.error("Error deleting job:", error);
      }
    }
  };

  // Function to handle batch update of selected jobs' status
  const handleBatchUpdate = async (newStatus) => {
    try {
      // API call to update multiple jobs
      await api.put("/jobs/status", { ids: selectedJobs, status: newStatus });
      // Clear selection after update
      setSelectedJobs([]);
      // Refresh the job list
      onStatusChange();
    } catch (error) {
      console.error("Error performing batch update:", error);
    }
  };

  // Function to handle selection of jobs for batch operations
  const handleCheckboxChange = (id) => {
    setSelectedJobs((prevSelected) =>
      prevSelected.includes(id)
        ? // Deselect job if it's already selected
          prevSelected.filter((jobId) => jobId !== id)
        : // Add job to selection if it's not selected
          [...prevSelected, id]
    );
  };

  // Clear all selected jobs
  const handleDeselectAll = () => {
    setSelectedJobs([]);
  };

  // Filters jobs based on the selected status and archived state
  const filteredJobs = jobs.filter(
    (job) =>
      (filter === "All" || job.status === filter) &&
      job.archived === showArchived
  );

  return (
    <div>
      <div className="mb-3">
        <label className="form-label">Filter by Status:</label>
        <select
          className="form-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Submitted">Submitted</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="showArchived"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="showArchived">
          Show Archived Jobs
        </label>
      </div>
      {selectedJobs.length > 0 && (
        <div className="mb-3">
          <button
            className="btn btn-primary"
            onClick={() => handleBatchUpdate("In Progress")}
          >
            Mark Selected as In Progress
          </button>
          <button
            className="btn btn-success ms-2"
            onClick={() => handleBatchUpdate("Completed")}
          >
            Mark Selected as Completed
          </button>
          <button className="btn btn-danger ms-2" onClick={handleDeselectAll}>
            <strong>X</strong> Deselect All
          </button>
        </div>
      )}
      <ul className="list-group">
        {filteredJobs.map((job) => (
          <li
            key={job._id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div className="d-flex align-items-center">
              <input
                type="checkbox"
                className="form-check-input me-2"
                checked={selectedJobs.includes(job._id)}
                onChange={() => handleCheckboxChange(job._id)}
              />
              <div className="job-details">
                <strong>{job.description}</strong> - {job.location} -{" "}
                {job.priority} - {job.status}
              </div>
            </div>
            <div className="job-buttons">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleStatusChange(job._id, "In Progress")}
              >
                In Progress
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleStatusChange(job._id, "Completed")}
              >
                Completed
              </button>
              {!showArchived && (
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => handleArchiveJob(job._id)}
                >
                  Archive
                </button>
              )}
              <button
                className="btn btn-danger btn-sm"
                onClick={() =>
                  handleDeleteJob(
                    job._id,
                    job.description,
                    job.location,
                    job.priority
                  )
                }
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobList;
