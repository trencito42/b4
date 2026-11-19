import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ColorPicker } from "./ColorPicker";

describe("ColorPicker", () => {
  it("shows the current hex value on the trigger", () => {
    render(<ColorPicker label="Brand color" value="#3366cc" onValueChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Brand color #3366cc" })).toBeInTheDocument();
  });

  it("opens the panel with the saturation area, hue slider, and hex field", async () => {
    const user = userEvent.setup();
    render(<ColorPicker label="Brand color" value="#3366cc" onValueChange={() => {}} />);

    await user.click(screen.getByRole("button", { name: "Brand color #3366cc" }));
    expect(await screen.findByRole("slider", { name: "Saturation and brightness" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Hue" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Hex color" })).toHaveValue("#3366cc");
  });

  it("updates the value when a valid hex is typed", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<ColorPicker label="Brand color" value="#3366cc" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Brand color #3366cc" }));
    const hexInput = await screen.findByRole("textbox", { name: "Hex color" });
    await user.clear(hexInput);
    await user.type(hexInput, "#ff0000");

    expect(onValueChange).toHaveBeenLastCalledWith("#ff0000");
  });

  it("ignores an invalid, incomplete hex while typing without crashing", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<ColorPicker label="Brand color" value="#3366cc" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Brand color #3366cc" }));
    const hexInput = await screen.findByRole("textbox", { name: "Hex color" });
    await user.clear(hexInput);
    await user.type(hexInput, "#ff");

    expect(hexInput).toHaveValue("#ff");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("shows the latest controlled color while the panel is open", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ColorPicker label="Brand color" value="#3366cc" />);
    await user.click(screen.getByRole("button", { name: "Brand color #3366cc" }));
    const hexInput = await screen.findByRole("textbox", { name: "Hex color" });
    await user.clear(hexInput);
    await user.type(hexInput, "#ff");

    rerender(<ColorPicker label="Brand color" value="#00ff00" />);
    expect(hexInput).toHaveValue("#00ff00");
    expect(screen.getByRole("slider", { name: "Hue" })).toHaveValue("120");
  });

  it("retains the chosen hue while the selected color is gray", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<ColorPicker label="Brand color" defaultValue="#808080" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Brand color #808080" }));
    const hue = await screen.findByRole("slider", { name: "Hue" });
    hue.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");

    expect(hue).toHaveValue("2");
    expect(screen.getByRole("button", { name: "Brand color #808080" })).toBeVisible();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("nudges saturation/brightness with arrow keys on the 2D area", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<ColorPicker label="Brand color" value="#808080" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Brand color #808080" }));
    const area = await screen.findByRole("slider", { name: "Saturation and brightness" });
    area.focus();
    await user.keyboard("{ArrowRight}");

    expect(onValueChange).toHaveBeenCalled();
    const [nextHex] = onValueChange.mock.calls.at(-1)!;
    expect(nextHex).not.toBe("#808080");
  });

  it("changes hue via the real Base UI slider's keyboard support", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<ColorPicker label="Brand color" value="#ff0000" onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Brand color #ff0000" }));
    const hueSlider = await screen.findByRole("slider", { name: "Hue" });
    hueSlider.focus();
    await user.keyboard("{ArrowRight}");

    expect(onValueChange).toHaveBeenCalled();
    const [nextHex] = onValueChange.mock.calls.at(-1)!;
    expect(nextHex).not.toBe("#ff0000");
  });

  it("supports uncontrolled use via defaultValue", async () => {
    const user = userEvent.setup();
    render(<ColorPicker label="Brand color" defaultValue="#00ff00" />);

    expect(screen.getByRole("button", { name: "Brand color #00ff00" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Brand color #00ff00" }));
    const hexInput = await screen.findByRole("textbox", { name: "Hex color" });
    await user.clear(hexInput);
    await user.type(hexInput, "#0000ff");

    expect(screen.getByRole("button", { name: "Brand color #0000ff" })).toBeInTheDocument();
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    const { container } = render(<ColorPicker label="Brand color" value="#3366cc" onValueChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Brand color #3366cc" }));
    await screen.findByRole("slider", { name: "Hue" });

    const results = await axe(container.ownerDocument.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
