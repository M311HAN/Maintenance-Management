import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  screen,
  within,
} from "@testing-library/react";
import JobList from "../components/JobList";
import api from "../services/api";

// Mock the API service to control the behavior of the put request in the tests
jest.mock("../services/api");

describe("JobList Component", () => {
  // Sample job data used in the tests
  const jobs = [
    {
      _id: "1",
      description: "Fix the leak",
      location: "Building 1, Room 203",
      priority: "High",
      status: "Submitted",
      archived: false,
    },
    {
      _id: "2",
      description: "Repair the HVAC",
      location: "Building 2, Room 101",
      priority: "Medium",
      status: "In Progress",
      archived: false,
    },
  ];

  it("renders the list of jobs", () => {
    // Render the JobList component with the provided jobs and check if job descriptions are displayed
    render(<JobList jobs={jobs} showArchived={false} />);
    expect(screen.getByText(/Fix the leak/i)).toBeInTheDocument();
    expect(screen.getByText(/Repair the HVAC/i)).toBeInTheDocument();
  });

  it("calls the appropriate handler when a status button is clicked", async () => {
    // Create a mock function to verify the status change handler
    const mockOnStatusChange = jest.fn();

    // Mock the API response for the PUT request
    api.put.mockResolvedValueOnce({});

    // Render the JobList component with the provided jobs and mockOnStatusChange handler
    render(
      <JobList
        jobs={jobs}
        onStatusChange={mockOnStatusChange}
        showArchived={false}
      />
    );

    // Find the list item corresponding to the job description "Fix the leak"
    const jobItem = screen.getByText(/Fix the leak/i).closest("li");
    const { getByText } = within(jobItem);

    // Simulate a click on the "In Progress" status button
    fireEvent.click(getByText("In Progress"));

    // Wait for the mockOnStatusChange function to be called after the status button is clicked
    await waitFor(() => {
      console.log(
        "mockOnStatusChange called times:",
        mockOnStatusChange.mock.calls.length
      );
      // Check that the handler was called exactly once
      expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
    });
  });

  it("shows archived jobs when the checkbox is selected", () => {
    // Sample archived job data used in this test
    const archivedJobs = [
      {
        _id: "3",
        description: "Paint the walls",
        location: "Building 3, Room 305",
        priority: "Low",
        status: "Completed",
        archived: true,
      },
    ];

    // Render the JobList component with both active and archived jobs, showing archived jobs
    render(<JobList jobs={[...jobs, ...archivedJobs]} showArchived={true} />);
    // Check that the archived job "Paint the walls" is displayed
    expect(screen.getByText("Paint the walls")).toBeInTheDocument();
    // Verify that the "Show Archived Jobs" checkbox is checked
    expect(screen.getByLabelText(/Show Archived Jobs/i)).toBeChecked();
  });
});
