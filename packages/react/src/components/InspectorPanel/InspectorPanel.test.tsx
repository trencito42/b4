import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { InspectorPanel, type InspectorSection } from "./InspectorPanel";

const sections: InspectorSection[] = [
  {
    id: "general",
    title: "General",
    properties: [
      { id: "name", label: "Name", value: "Marketing site" },
      { id: "owner", label: "Owner", value: "Ada" },
    ],
  },
];

describe("InspectorPanel", () => {
  it("renders the title and each property as a label/value pair", () => {
    const { container } = render(<InspectorPanel title="Marketing site" sections={sections} />);
    expect(container.querySelector(".b4-inspector-panel__title")).toHaveTextContent("Marketing site");
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
  });

  it("renders a section title when provided", () => {
    render(<InspectorPanel title="Marketing site" sections={sections} />);
    expect(screen.getByText("General")).toBeInTheDocument();
  });

  it("renders no close button when onClose is omitted", () => {
    render(<InspectorPanel title="Marketing site" sections={sections} />);
    expect(screen.queryByRole("button", { name: "Close panel" })).toBeNull();
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<InspectorPanel title="Marketing site" sections={sections} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Close panel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations", async () => {
    const { container } = render(<InspectorPanel title="Marketing site" sections={sections} onClose={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
