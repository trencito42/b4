import { describe, expect, it, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { axe } from "jest-axe";
import { AppShell, AppShellMobileTrigger } from "./AppShell";

describe("AppShell", () => {
  it("renders header, sidebar and main content as real landmarks", () => {
    render(
      <AppShell header={<span>Header</span>} sidebar={<span>Sidebar</span>} sidebarLabel="Primary">
        <span>Content</span>
      </AppShell>,
    );
    expect(screen.getByRole("banner")).toHaveTextContent("Header");
    expect(screen.getByRole("navigation", { name: "Primary" })).toHaveTextContent("Sidebar");
    expect(screen.getByRole("main")).toHaveTextContent("Content");
  });

  it("omits the header and sidebar landmarks entirely when not provided", () => {
    render(<AppShell>Content only</AppShell>);
    expect(screen.queryByRole("banner")).toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("applies the requested sidebar width", () => {
    const { container } = render(
      <AppShell sidebar={<span>Sidebar</span>} sidebarWidth={300}>
        Content
      </AppShell>,
    );
    const sidebar = container.querySelector(".b4-app-shell__sidebar") as HTMLElement;
    expect(sidebar.style.width).toBe("300px");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <AppShell header={<span>Header</span>} sidebar={<span>Sidebar</span>}>
        <span>Content</span>
      </AppShell>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("supports adaptive mobileNavOpen and dismisses via backdrop click", () => {
    const onMobileNavOpenChange = vi.fn();
    const { container } = render(
      <AppShell
        sidebar={<span>Sidebar</span>}
        mobileNavOpen={true}
        onMobileNavOpenChange={onMobileNavOpenChange}
      >
        Content
      </AppShell>,
    );

    const sidebar = container.querySelector(".b4-app-shell__sidebar") as HTMLElement;
    expect(sidebar).toHaveAttribute("data-open", "true");

    const backdrop = container.querySelector(".b4-app-shell__backdrop") as HTMLElement;
    expect(backdrop).toBeInTheDocument();

    backdrop.click();
    expect(onMobileNavOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders and toggles mobile navigation via AppShellMobileTrigger", () => {
    const onOpenChange = vi.fn();
    render(
      <AppShell
        header={<AppShellMobileTrigger />}
        sidebar={<span>Sidebar</span>}
        onMobileNavOpenChange={onOpenChange}
      >
        Content
      </AppShell>,
    );

    const trigger = screen.getByRole("button", { name: "Toggle navigation menu" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    act(() => {
      trigger.click();
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
