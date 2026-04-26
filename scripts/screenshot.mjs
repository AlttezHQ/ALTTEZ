import { chromium } from "@playwright/test";
import { mkdirSync } from "fs";

mkdirSync("artifacts/screenshots", { recursive: true });

const browser = await chromium.launch();

const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto("http://localhost:4173/producto/alttezcrm", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({ path: "artifacts/screenshots/alttez-crm-1440.png", fullPage: false });
console.log("Screenshot 1440px saved");

await page.setViewportSize({ width: 1536, height: 900 });
await page.screenshot({ path: "artifacts/screenshots/alttez-crm-1536.png", fullPage: false });
console.log("Screenshot 1536px saved");

await page.setViewportSize({ width: 1440, height: 900 });
await page.screenshot({ path: "artifacts/screenshots/alttez-crm-full.png", fullPage: true });
console.log("Full page screenshot saved");

await browser.close();
