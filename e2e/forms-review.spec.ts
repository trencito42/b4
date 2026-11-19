import { expect, test } from "@playwright/test";

const story = (theme = "graphite") =>
  `/iframe.html?id=family-b-forms-inputs-forms-review--default&globals=b4Theme:${theme}`;

for (const theme of ["graphite", "porcelain"]) {
  for (const width of [390, 768, 1440]) {
    test(`forms review at ${width}px in ${theme}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(story(theme));
      await expect(
        page.getByRole("main", { name: "Forms review" }).locator(":scope > *"),
      ).toHaveCount(18);
      await expect(page.locator("html")).toHaveAttribute("data-b4-theme", theme);
      await page.screenshot({
        path: testInfo.outputPath("forms.png"),
        fullPage: true,
        animations: "disabled",
      });
      const overflow = await page
        .locator(".forms-review > *")
        .evaluateAll((fields) =>
          fields
            .filter((field) => field.scrollWidth > field.clientWidth + 1)
            .map((field) => field.textContent),
        );
      expect(overflow).toEqual([]);

      const geometry = await page
        .locator(
          ".forms-review :is(.b4-select, .b4-combobox, .b4-text-field__control):not(.b4-text-field__control--textarea)",
        )
        .evaluateAll((controls) =>
          controls.map((control) => {
            const style = getComputedStyle(control);
            return [control.getBoundingClientRect().height, style.borderRadius];
          }),
        );
      expect(new Set(geometry.map((entry) => JSON.stringify(entry))).size).toBe(1);
    });
  }
}

test("revealing a password preserves the active editor and its selection", async ({
  page,
}) => {
  await page.goto(story());
  const input = page.getByLabel("Password", { exact: true });
  await input.evaluate((element: HTMLInputElement) => {
    element.focus();
    element.setSelectionRange(1, 5);
  });
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(input).toHaveAttribute("type", "text");
  await expect(input).toBeFocused();
  expect(
    await input.evaluate((element: HTMLInputElement) => [
      element.selectionStart,
      element.selectionEnd,
    ]),
  ).toEqual([1, 5]);
});

test("rejecting a single-file replacement preserves the previous file", async ({
  page,
}) => {
  await page.goto(story());
  const upload = page.getByLabel("Attachments", { exact: true });
  await upload.setInputFiles({
    name: "image.png",
    mimeType: "image/png",
    buffer: Buffer.from("png"),
  });
  await expect(page.getByRole("button", { name: "Remove image.png" })).toBeVisible();
  await upload.setInputFiles({
    name: "replacement.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("text"),
  });
  await expect(page.getByRole("alert")).toContainText("replacement.txt");
  await expect(page.getByRole("button", { name: "Remove image.png" })).toBeVisible();
});

test("calendar month buttons leave a visible day in the grid tab order", async ({
  page,
}) => {
  await page.goto(story());
  await page.getByRole("button", { name: /Nov 19, 2026/ }).click();
  const next = page.getByRole("button", { name: "Next month" });
  for (let index = 0; index < 3; index++) await next.press("Enter");
  await expect(page.getByRole("grid")).toHaveAccessibleName("February 2027");
  await next.press("Tab");
  await expect(page.getByRole("grid").locator("button[tabindex='0']")).toBeFocused();
});

test("NumberField repeats fractional steps, stops on release and obeys bounds", async ({
  page,
}) => {
  await page.goto(story());
  const input = page.getByRole("textbox", { name: "Quantity" });
  const increase = page.getByRole("button", { name: "Increase value" });
  const decrease = page.getByRole("button", { name: "Decrease value" });
  await increase.hover();
  await page.mouse.down();
  await expect
    .poll(async () => Number(await input.inputValue()))
    .toBeGreaterThanOrEqual(1.5);
  await page.mouse.up();
  const releasedValue = await input.inputValue();
  // More than two of the underlying stepper's 60 ms repeat intervals.
  await page.waitForTimeout(180);
  await expect(input).toHaveValue(releasedValue);

  await input.press("ArrowUp");
  await expect(input).toHaveValue(String(Math.min(3, Number(releasedValue) + 0.25)));
  await increase.hover();
  await page.mouse.down();
  await expect(input).toHaveValue("3");
  await page.mouse.up();
  await expect(increase).toBeDisabled();
  await decrease.hover();
  await page.mouse.down();
  await expect(input).toHaveValue("0");
  await page.mouse.up();
  await expect(decrease).toBeDisabled();
});

for (const theme of ["graphite", "porcelain"]) {
  test.describe(`touch in ${theme}`, () => {
    test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

    test("controlled toggles preserve their selection when switching input methods", async ({
      page,
    }) => {
      await page.goto(story(theme));
      const checkbox = page.getByRole("checkbox", { name: "Include archived" });
      const toggle = page.getByRole("switch", { name: "Notifications" });
      const radio = page.getByRole("radio", { name: /^Team/ });
      await expect(checkbox).toHaveAttribute("aria-checked", "mixed");
      for (const control of [checkbox, toggle, radio]) {
        await control.tap();
        await expect(control).toBeChecked();
      }
      for (const control of [checkbox, toggle]) {
        await control.press("Space");
        await expect(control).not.toBeChecked();
        await expect(control).toBeFocused();
        await control.press("Space");
        await expect(control).toBeChecked();
      }
      await expect(radio).toBeChecked();
    });

    test("opens a touch-sized option popup and selects from the long list", async ({
      page,
    }, testInfo) => {
      await page.goto(story(theme));
      const trigger = page.getByRole("combobox", { name: "Workspace", exact: true });
      expect((await trigger.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await trigger.tap();
      const popup = page.locator(".b4-select__popup");
      const disabled = page.getByRole("option", { name: "Workspace 1", exact: true });
      await expect(disabled).toBeDisabled();
      await expect(popup).toHaveCSS("transform", "none");
      expect((await disabled.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      const ending = page.getByRole("option", { name: "Workspace 23", exact: true });
      await ending.scrollIntoViewIfNeeded();
      const bounds = (await popup.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
      expect(bounds.y).toBeGreaterThanOrEqual(0);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(845);
      await page.screenshot({ path: testInfo.outputPath("select-touch.png") });
      await ending.tap();
      await expect(trigger).toContainText("Workspace 23");
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(popup).toBeHidden();
    });

    test("range thumb tracks a horizontal touch drag through intermediate values", async ({
      page,
    }) => {
      await page.goto(story(theme));
      const min = page.getByRole("slider", { name: "Minimum price" });
      const max = page.getByRole("slider", { name: "Maximum price" });
      const track = min.locator("xpath=../..");
      await track.scrollIntoViewIfNeeded();
      const bounds = (await track.boundingBox())!;
      const y = Math.round(bounds.y + bounds.height / 2);
      const xAt = (value: number) => Math.round(bounds.x + (bounds.width * value) / 100);
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: xAt(25), y }],
      });
      for (const value of [33, 42, 53, 61]) {
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: xAt(value), y }],
        });
        await expect(min).toHaveValue(String(value));
        const thumbX = await min.evaluate((input) => {
          const thumb = input.parentElement!.getBoundingClientRect();
          return thumb.x + thumb.width / 2;
        });
        expect(Math.abs(thumbX - xAt(value))).toBeLessThan(2);
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await expect(min).toHaveValue("61");
      await expect(max).toHaveValue("75");
      const fill = (await track.locator(".b4-slider__indicator").boundingBox())!;
      expect(Math.abs(fill.width - bounds.width * 0.14)).toBeLessThan(1);

      const scrollBefore = await page.evaluate(() => scrollY);
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: xAt(61), y }],
      });
      for (const distance of [32, 64, 96, 128]) {
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: xAt(61), y: y - distance }],
        });
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await expect
        .poll(() => page.evaluate(() => scrollY))
        .toBeGreaterThan(scrollBefore + 20);
      await expect(min).toHaveValue("61");
    });

    test("date and color pickers opened by touch fit in the viewport", async ({
      page,
    }, testInfo) => {
      await page.goto(story(theme));
      for (const [name, filename] of [
        [/^Delivery date/, "date-picker.png"],
        [/^Accent color/, "color-picker.png"],
      ] as const) {
        const trigger = page.getByRole("button", { name });
        await trigger.scrollIntoViewIfNeeded();
        await trigger.tap();
        const popup = page.getByRole("dialog");
        await expect(popup).toHaveCSS("transform", "none");
        const box = (await popup.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(390);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.y + box.height).toBeLessThanOrEqual(844);
        await page.screenshot({
          path: testInfo.outputPath(filename),
        });
        await page.keyboard.press("Escape");
        await expect(popup).toHaveCount(0);
      }
    });
  });
}
