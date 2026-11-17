import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "jest-axe";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("shows initials from two-word names", () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("shows initials from single-word names", () => {
    render(<Avatar name="Madonna" />);
    expect(screen.getByText("MA")).toBeInTheDocument();
  });

  it("has an accessible name even when showing initials", () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toBeInTheDocument();
  });

  it("falls back to initials if the image fails to load", () => {
    render(<Avatar name="Ada Lovelace" src="https://broken.example/404.png" />);
    const img = screen.getByRole("img", { name: "Ada Lovelace" }).querySelector("img");
    expect(img).not.toBeNull();
    fireEvent.error(img!);
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Madonna" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
