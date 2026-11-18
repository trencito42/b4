import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { TransitionGroup } from "./TransitionGroup";

function ListDemo() {
  const [items, setItems] = useState(["a", "b", "c"]);
  return (
    <div>
      <button type="button" onClick={() => setItems((prev) => [...prev, "d"])}>
        Add
      </button>
      <button type="button" onClick={() => setItems((prev) => prev.filter((i) => i !== "b"))}>
        Remove b
      </button>
      <TransitionGroup as="ul">
        {items.map((item) => (
          <span key={item} data-testid={`item-${item}`}>
            {item}
          </span>
        ))}
      </TransitionGroup>
    </div>
  );
}

describe("TransitionGroup", () => {
  it("renders every child wrapped as a list item", () => {
    render(<ListDemo />);
    expect(screen.getByTestId("item-a")).toBeInTheDocument();
    expect(screen.getByTestId("item-b")).toBeInTheDocument();
    expect(screen.getByTestId("item-c")).toBeInTheDocument();
    expect(screen.getByTestId("item-a").closest("li")).toBeInTheDocument();
  });

  it("renders a div container by default, ul/ol when requested", () => {
    const { container, rerender } = render(
      <TransitionGroup>
        <span key="x">x</span>
      </TransitionGroup>,
    );
    expect(container.firstChild?.nodeName).toBe("DIV");

    rerender(
      <TransitionGroup as="ol">
        <span key="x">x</span>
      </TransitionGroup>,
    );
    expect(container.firstChild?.nodeName).toBe("OL");
  });

  it("adds a new item to the DOM when the underlying list grows", async () => {
    render(<ListDemo />);
    expect(screen.queryByTestId("item-d")).not.toBeInTheDocument();

    screen.getByRole("button", { name: "Add" }).click();
    expect(await screen.findByTestId("item-d")).toBeInTheDocument();
  });

  // AnimatePresence waits for the exit animation's onExitComplete before
  // actually unmounting a removed item — doesn't resolve synchronously
  // with the state change in jsdom, same as ExpandingAction's label exit.
  it("eventually removes an item from the DOM once its exit animation completes", async () => {
    render(<ListDemo />);
    expect(screen.getByTestId("item-b")).toBeInTheDocument();

    screen.getByRole("button", { name: "Remove b" }).click();
    await waitFor(() => expect(screen.queryByTestId("item-b")).not.toBeInTheDocument());

    expect(screen.getByTestId("item-a")).toBeInTheDocument();
    expect(screen.getByTestId("item-c")).toBeInTheDocument();
  });
});
