import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ChartContainer } from "./ChartContainer";

describe("ChartContainer", () => {
  it("renders its title and children", () => {
    render(
      <ChartContainer title="Revenue">
        <svg role="img" aria-label="chart" />
      </ChartContainer>,
    );
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "chart" })).toBeInTheDocument();
  });

  it("renders a description when provided", () => {
    render(
      <ChartContainer title="Revenue" description="Last 6 quarters">
        <svg />
      </ChartContainer>,
    );
    expect(screen.getByText("Last 6 quarters")).toBeInTheDocument();
  });

  it("pairs each legend swatch with a visible text label", () => {
    render(
      <ChartContainer
        title="Chart"
        legend={[
          { label: "Revenue", color: "#60a5fa" },
          { label: "Costs", color: "#34d399" },
        ]}
      >
        <svg />
      </ChartContainer>,
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Revenue");
    expect(items[1]).toHaveTextContent("Costs");
  });

  it("hides legend swatches from assistive tech (the text label carries the meaning)", () => {
    const { container } = render(
      <ChartContainer title="Revenue" legend={[{ label: "Revenue", color: "#60a5fa" }]}>
        <svg />
      </ChartContainer>,
    );
    expect(container.querySelector(".b4-chart-container__legend-swatch")).toHaveAttribute("aria-hidden", "true");
  });

  it("omits the legend list entirely when no legend is provided", () => {
    const { container } = render(
      <ChartContainer title="Revenue">
        <svg />
      </ChartContainer>,
    );
    expect(container.querySelector(".b4-chart-container__legend")).toBeNull();
  });

  it("renders actions when provided", () => {
    render(
      <ChartContainer title="Revenue" actions={<button type="button">Export</button>}>
        <svg />
      </ChartContainer>,
    );
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ChartContainer
        title="Revenue"
        description="Last 6 quarters"
        legend={[
          { label: "Revenue", color: "#60a5fa" },
          { label: "Costs", color: "#34d399" },
        ]}
        actions={<button type="button">Export</button>}
      >
        <svg role="img" aria-label="chart" />
      </ChartContainer>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
