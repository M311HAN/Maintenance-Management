import React, { useState, useEffect, useCallback } from "react";
import JobForm from "./components/JobForm";
import JobList from "./components/JobList";
import api from "./services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import styles for react-toastify

function App() {
  // State to store the list of jobs
  const [jobs, setJobs] = useState([]);
  // State to determine whether archived jobs should be shown
  const [showArchived, setShowArchived] = useState(false);

  // Function to fetch jobs from the backend, wrapped in useCallback to avoid unnecessary re-renders
  const fetchJobs = useCallback(async () => {
    try {
      // Fetch jobs from the backend, passing the 'showArchived' state as a query parameter
      const response = await api.get("/jobs", {
        params: { archived: showArchived },
      });
      // Update the state with the fetched jobs
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
    // Re-run the effect if 'showArchived' changes
  }, [showArchived]);

  // useEffect to fetch jobs when the component mounts and whenever 'fetchJobs' changes
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Function to handle job creation success
  const handleJobCreated = () => {
    fetchJobs(); // Refresh the list
    toast.success("Job added successfully!"); // Show success toast notification
  };

  // Function to handle job update success
  const handleJobUpdated = () => {
    fetchJobs(); // Refresh the list
    toast.info("Job updated successfully!"); // Show info toast notification
  };

  return (
    <div className="container">
      <h1>Maintenance Management</h1>
      <JobForm onJobCreated={handleJobCreated} />
      <h2 className="job-list-title">
        <FontAwesomeIcon icon={faBriefcase} /> Job List
      </h2>
      <JobList
        jobs={jobs}
        onStatusChange={handleJobUpdated}
        onArchiveChange={handleJobUpdated}
        showArchived={showArchived}
        setShowArchived={setShowArchived}
      />
      <ToastContainer /> {/* Container to display toast notifications */}
    </div>
  );
}

export default App;
