import { chromium, type Page } from "@playwright/test";
import { join } from "node:path";
import { tmpdir } from "node:os";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:4321";
const password = "StatsAudit123!";
const requestedViewport = process.env.SMOKE_STATS_VIEWPORT;
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 900 },
].filter((viewport) => !requestedViewport || viewport.name === requestedViewport);

if (viewports.length === 0) {
  throw new Error(`Unknown SMOKE_STATS_VIEWPORT: ${requestedViewport}`);
}

async function register(page: Page): Promise<void> {
  const email = `stats-layout-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
  const response = await page.request.post(new URL("/api/auth/register", baseUrl).toString(), {
    headers: {
      Origin: new URL(baseUrl).origin,
      "CF-Connecting-IP": `127.0.2.${Math.floor(Math.random() * 200) + 2}`,
    },
    form: { email, password },
    timeout: 90_000,
  });

  if (!response.ok()) {
    throw new Error(`Registration failed: ${response.status()} ${await response.text()}`);
  }
}

async function assertStatsLayout(page: Page, width: number): Promise<void> {
  await page.goto(new URL("/stats", baseUrl).toString(), {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.getByTestId("stats-summary").waitFor({ state: "visible", timeout: 90_000 });

  const cards = page.getByTestId("stats-summary-card");
  if (await cards.count() !== 3) throw new Error("Expected three summary cards");

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  if (metrics.scrollWidth > metrics.clientWidth + 1) {
    throw new Error(`Stats overflows horizontally: ${metrics.scrollWidth}px > ${metrics.clientWidth}px`);
  }

  const cardStyles = await cards.evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return { borderRadius: style.borderRadius, x: rect.x, y: rect.y, width: rect.width };
  }));

  if (cardStyles.some((card) => card.borderRadius !== "16px")) {
    throw new Error(`Unexpected stats card radius: ${cardStyles.map((card) => card.borderRadius).join(", ")}`);
  }

  if (width < 640 && new Set(cardStyles.map((card) => Math.round(card.y))).size !== 3) {
    throw new Error("Mobile summary cards did not stack");
  }
  if (width >= 640 && new Set(cardStyles.map((card) => Math.round(card.y))).size !== 1) {
    throw new Error("Desktop summary cards did not align in one row");
  }

  const periodButtons = page.getByTestId("stats-period-selector").getByRole("button");
  if (await periodButtons.count() !== 3) throw new Error("Expected three period controls");

  const screenshotName = width < 640 ? "financier-stats-mobile.png" : "financier-stats-desktop.png";
  await page.screenshot({ path: join(tmpdir(), screenshotName), fullPage: true });
}

const browser = await chromium.launch();
try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    page.setDefaultTimeout(90_000);
    page.setDefaultNavigationTimeout(90_000);
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await register(page);
    await assertStatsLayout(page, viewport.width);
    await page.close();
  }
  console.log(`stats layout smoke passed; screenshots: ${join(tmpdir(), "financier-stats-mobile.png")}, ${join(tmpdir(), "financier-stats-desktop.png")}`);
} finally {
  await browser.close();
}
