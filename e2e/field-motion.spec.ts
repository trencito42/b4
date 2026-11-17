import { test, expect } from "@playwright/test";

const story = (
  component: string,
  name = "default",
  theme = "graphite",
  motion = "full",
) =>
  `/iframe.html?id=family-b-forms-inputs-${component}--${name}&globals=b4Theme:${theme};b4Motion:${motion}`;

for (const theme of ["graphite", "porcelain"]) {
  test(`NumberField animates an accepted step without replacing the editable input on ${theme}`, async ({
    page,
  }) => {
    await page.goto(story("numberfield", "default", theme));
    const input = page.getByRole("textbox", { name: "Quantity" });
    const handle = await input.elementHandle();
    const samples = page.evaluate(async () => {
      const frames: { opacity: number; transform: string }[] = [];
      for (let index = 0; index < 45; index++) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const style = getComputedStyle(
          document.querySelector(".b4-number-field__input")!,
        );
        frames.push({ opacity: Number(style.opacity), transform: style.transform });
      }
      return frames;
    });
    await page.getByRole("button", { name: "Increase value" }).click();
    expect(
      (await samples).some((frame) => frame.opacity > 0 && frame.opacity < 0.99),
    ).toBe(true);
    await expect(input).toHaveValue("2");
    expect(
      await input.evaluate((element, original) => element === original, handle),
    ).toBe(true);
    await input.fill("12");
    await expect(input).toHaveValue("12");
    await expect(page.getByRole("textbox")).toHaveCount(1);
  });

  test(`PasswordField crossfades icons while keeping one native input on ${theme}`, async ({
    page,
  }) => {
    await page.goto(story("passwordfield", "default", theme));
    const input = page.getByLabel("Password", { exact: true });
    await input.fill("test-passphrase");
    const handle = await input.elementHandle();
    const samples = page.evaluate(async () => {
      let moving = false;
      for (let index = 0; index < 45; index++) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        const layers = document.querySelectorAll(
          ".b4-field-action__glyph .b4-text-transition__item",
        );
        if (
          [...layers].some((el) => {
            const opacity = Number(getComputedStyle(el).opacity);
            return opacity > 0 && opacity < 0.99;
          })
        )
          moving = true;
      }
      return moving;
    });
    await page.getByRole("button", { name: "Show password" }).click();
    expect(await samples).toBe(true);
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).toHaveValue("test-passphrase");
    expect(
      await input.evaluate((element, original) => element === original, handle),
    ).toBe(true);
    await page.getByRole("button", { name: "Hide password" }).click();
    await expect(input).toHaveAttribute("type", "password");
  });

  test(`RadioGroup keeps one traveling surface through interrupted changes on ${theme}`, async ({
    page,
  }) => {
    await page.goto(story("radiogroup", "with-descriptions", theme));
    for (let index = 0; index < 8; index++) {
      await page
        .getByRole("radio", { name: index % 2 ? /Personal/ : /Organization/ })
        .click();
    }
    await expect(page.locator(".b4-radio-group__selection")).toHaveCount(1);
    await expect(page.getByRole("radio", { name: /Personal/ })).toBeChecked();
    const selected = page.locator(".b4-radio-group__item--selected");
    await expect
      .poll(async () => {
        const row = await selected.boundingBox();
        const surface = await page.locator(".b4-radio-group__selection").boundingBox();
        return Math.abs(row!.y - surface!.y);
      })
      .toBeLessThan(1);
  });
}

test("reduced motion leaves number editing and radio selection instantaneous", async ({
  page,
}) => {
  await page.goto(story("numberfield", "default", "graphite", "reduced"));
  await page.getByRole("button", { name: "Increase value" }).click();
  const input = page.getByRole("textbox", { name: "Quantity" });
  await expect(input).toHaveValue("2");
  await expect(input).toHaveCSS("opacity", "1");
  await expect(input).toHaveCSS("transform", "none");
  await page.goto(story("radiogroup", "default", "graphite", "reduced"));
  await page.getByRole("radio", { name: "Enterprise", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Enterprise", exact: true }),
  ).toBeChecked();
  await expect(page.locator(".b4-radio-group__selection")).toHaveCount(1);
});
