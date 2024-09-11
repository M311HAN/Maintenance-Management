import { render, fireEvent, waitFor } from "@testing-library/react";
import JobForm from "../components/JobForm";
import api from "../services/api";

// Mock the API service to control the behavior of the post request in the tests
jest.mock("../services/api");

describe("JobForm Component", () => {
  it("renders the form correctly", () => {
    // Render the JobForm component and check if all form fields and the submit button are present
    const { getByLabelText, getByText } = render(<JobForm />);
    expect(getByLabelText(/Description/i)).toBeInTheDocument();
    expect(getByLabelText(/Location/i)).toBeInTheDocument();
    expect(getByLabelText(/Priority/i)).toBeInTheDocument();
    expect(getByText(/Submit Job/i)).toBeInTheDocument();
  });

  it("calls onJobCreated after a job is successfully created", async () => {
    const mockOnJobCreated = jest.fn();

    // Ensure the API call returns the expected data
    api.post.mockResolvedValueOnce({
      data: {
        description: "Fix the leak",
        location: "Building 1, Room 203",
        priority: "High",
      },
    });
    // Render the JobForm component with the mockOnJobCreated function passed as a prop
    const { getByLabelText, getByText } = render(
      <JobForm onJobCreated={mockOnJobCreated} />
    );

    // Simulate user input in the form fields
    fireEvent.change(getByLabelText(/Description/i), {
      target: { value: "Fix the leak" },
    });
    fireEvent.change(getByLabelText(/Location/i), {
      target: { value: "Building 1, Room 203" },
    });
    fireEvent.change(getByLabelText(/Priority/i), {
      target: { value: "High" },
    });

    // Simulate a click on the submit button
    fireEvent.click(getByText(/Submit Job/i));

    // Wait for the mockOnJobCreated function to be called after the form submission
    await waitFor(() => {
      expect(mockOnJobCreated).toHaveBeenCalled(); // Check it's been called
    });

    // Optionally check the arguments passed to mockOnJobCreated (if necessary)
    expect(mockOnJobCreated.mock.calls[0][0]).toEqual({
      description: "Fix the leak",
      location: "Building 1, Room 203",
      priority: "High",
    });
  });
});
