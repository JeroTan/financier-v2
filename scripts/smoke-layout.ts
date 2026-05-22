import { chromium, type Page } from "@playwright/test";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:4321";
const viewports = [
  { width: 390, height: 844 },
  { width: 1280, height: 900 },
];

async function assertNoHorizontalOverflow(page: Page, path: string): Promise<void> {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  if (metrics.scrollWidth > metrics.clientWidth + 1) {
    throw new Error(`${path} overflows horizontally: ${metrics.scrollWidth}px > ${metrics.clientWidth}px`);
  }
}

async function assertAuthFormUsable(page: Page, path: string): Promise<void> {
  await page.goto(new URL(path, baseUrl).toString(), { waitUntil: "networkidle" });
  await assertNoHorizontalOverflow(page, path);

  const formBox = await page.locator("form").boundingBox();
  const emailBox = await page.locator('input[name="email"]').boundingBox();
  const buttonBox = await page.locator('button[type="submit"]').boundingBox();

  if (!formBox || formBox.width < 280) throw new Error(`${path} form too narrow`);
  if (!emailBox || emailBox.width < 260) throw new Error(`${path} email input too narrow`);
  if (!buttonBox || buttonBox.width < 260) throw new Error(`${path} submit button too narrow`);
}

const browser = await chromium.launch();
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await assertAuthFormUsable(page, "/login");
    await assertAuthFormUsable(page, "/register");

    await page.goto(new URL("/dashboard", baseUrl).toString(), { waitUntil: "domcontentloaded" });
    await assertNoHorizontalOverflow(page, "/dashboard redirect");
    await page.close();
  }

  console.log("layout smoke passed");
} finally {
  await browser.close();
}
