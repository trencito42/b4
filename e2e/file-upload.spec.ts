import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

function makeTempFile(name: string, sizeBytes: number) {
  const dir = mkdtempSync(join(tmpdir(), "b4-file-upload-"));
  const filePath = join(dir, name);
  writeFileSync(filePath, Buffer.alloc(sizeBytes, "a"));
  return filePath;
}

for (const theme of themes) {
  test(`FileUpload is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-b-inputs-forms-fileupload--default&globals=b4Theme:${theme}`);
    await expect(page.getByLabel("Attachments")).toBeAttached();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("FileUpload selects a real file and shows it in the list", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-inputs-forms-fileupload--default");

  const filePath = makeTempFile("report.pdf", 2048);
  await page.getByLabel("Attachments").setInputFiles(filePath);

  await expect(page.getByText("report.pdf")).toBeVisible();
  await expect(page.getByText("2.0 KB")).toBeVisible();
});

test("FileUpload removes a file via its remove button", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-inputs-forms-fileupload--default");

  const filePath = makeTempFile("notes.txt", 100);
  await page.getByLabel("Attachments").setInputFiles(filePath);
  await expect(page.getByText("notes.txt")).toBeVisible();

  await page.getByRole("button", { name: "Remove notes.txt" }).click();
  await expect(page.getByText("notes.txt")).toHaveCount(0);
});

test("FileUpload rejects a file exceeding the size limit", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-inputs-forms-fileupload--with-size-and-count-limits");

  const tooBig = makeTempFile("huge.bin", 2 * 1024 * 1024);
  await page.getByLabel("Attachments").setInputFiles(tooBig);

  await expect(page.getByRole("alert")).toContainText("exceeds");
  // Scoped to the file list, not the page: the rejection message in the
  // alert region legitimately contains the filename text too.
  await expect(page.locator(".b4-file-upload__list").getByText("huge.bin")).toHaveCount(0);
});

test("FileUpload enforces maxFiles across multiple selections", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-inputs-forms-fileupload--with-size-and-count-limits");

  const files = [makeTempFile("a.txt", 100), makeTempFile("b.txt", 100), makeTempFile("c.txt", 100), makeTempFile("d.txt", 100)];
  await page.getByLabel("Attachments").setInputFiles(files);

  await expect(page.getByText("a.txt")).toBeVisible();
  await expect(page.getByText("c.txt")).toBeVisible();
  await expect(page.getByText("d.txt")).toHaveCount(0);
  await expect(page.getByRole("alert")).toContainText("limit is 3");
});

test("FileUpload supports a real drag-and-drop onto the dropzone", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-inputs-forms-fileupload--default");

  const dropzone = page.locator(".b4-file-upload__dropzone");
  await expect(dropzone).toBeVisible();

  // Build a real DataTransfer with a real File in-page, then dispatch a
  // genuine `drop` event at the input (which — per real browser behavior —
  // sets its `.files` and fires `change`, the same native mechanism the
  // component relies on for drag-and-drop rather than reimplementing it).
  const dataTransfer = await page.evaluateHandle(() => {
    const dt = new DataTransfer();
    const file = new File(["hello world"], "dropped.txt", { type: "text/plain" });
    dt.items.add(file);
    return dt;
  });
  const input = page.locator(".b4-file-upload__input");
  await input.dispatchEvent("drop", { dataTransfer });

  await expect(page.getByText("dropped.txt")).toBeVisible();
});
