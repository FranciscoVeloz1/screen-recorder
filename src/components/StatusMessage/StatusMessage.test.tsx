import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusMessage } from ".";

describe("StatusMessage", () => {
  it("renders message with status role", () => {
    render(<StatusMessage message="Listo para grabar" variant="" />);
    expect(screen.getByRole("status")).toHaveTextContent("Listo para grabar");
  });

  it("uses assertive live region for errors", () => {
    render(<StatusMessage message="Error" variant="error" />);
    expect(screen.getByText("Error")).toHaveAttribute("aria-live", "assertive");
  });
});
