import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Maintenance Management title", () => {
  // Render the App component to test if it displays the title correctly
  render(<App />);
  // Select the element containing the title "Maintenance Management"
  const titleElement = screen.getByText(/Maintenance Management/i);
  // Check if the title element is present in the document
  expect(titleElement).toBeInTheDocument();
});
