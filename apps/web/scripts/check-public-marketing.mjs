import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.MARKETING_BASE_URL ?? "http://localhost:9000";
const browser = await chromium.launch({ headless: true });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (error) => errors.push(error.message));
const apiCalls = [];
page.on("request", (request) => {
  if (new URL(request.url()).pathname.startsWith("/api/")) apiCalls.push(request.url());
});
const bookingLink = () => page.locator('[data-mobile-booking] a', { hasText: "Book a class" });
const checkWidth = async () => {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "No horizontal page overflow");
};
try {
  await page.goto(base);
  await page.locator('[data-calendar-grid="month"]').waitFor();
  assert(await page.locator("#schedule").evaluate((el) => el.getBoundingClientRect().top < 350), "Calendar leads the desktop page");
  assert(!(await bookingLink().isVisible()), "Desktop has no mobile booking CTA");
  await checkWidth();

  for (const [width, view, count] of [[1440, "month", 42], [834, "week", 7], [390, "day", 1]]) {
    await page.setViewportSize({ width, height: 1000 });
    const grid = page.locator(`[data-calendar-grid="${view}"]`);
    await grid.waitFor();
    assert.equal(await grid.locator("[data-calendar-date]").count(), count);
    const heading = page.locator("[data-calendar-controls] h3");
    const initialHeading = await heading.innerText();
    await page.getByRole("button", { name: `Next ${view}`, exact: true }).click();
    assert.notEqual(await heading.innerText(), initialHeading);
    await page.getByRole("button", { name: "Today", exact: true }).click();
    assert.equal(await heading.innerText(), initialHeading);
    if (view !== "month") {
      const event = grid.getByRole("button", { name: /^Caliyoga, Wed, Sep 16/ });
      assert.equal(await event.evaluate(el => el.style.height), "105px", "90-minute class follows the hourly scale");
      assert.equal(await event.evaluate(el => el.style.top), "648px", "3 PM is positioned relative to 6 AM");
    }
    await checkWidth();
  }
  await page.getByRole("combobox", { name: "Filter by class" }).selectOption("class-yoga");
  assert.equal(await page.locator("[data-calendar-event]").count(), 1);
  await page.getByRole("combobox", { name: "Filter by class" }).selectOption("all");

  // The hamburger opens the same full-screen, keyboard-accessible menu at every size.
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const trigger = page.getByRole("button", { name: "Open menu", exact: true });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Balansé menu" });
    await dialog.waitFor();
    await dialog.evaluate(async el => Promise.all(el.getAnimations({ subtree: true }).map(animation => animation.finished)));
    const box = await dialog.boundingBox();
    assert(box && Math.abs(box.x) < 1 && Math.abs(box.y) < 1 && Math.abs(box.width - width) < 1 && Math.abs(box.height - 900) < 1, "Menu covers the viewport");
    assert.equal(await dialog.getByRole("navigation", { name: "Full menu" }).locator("ul").getByRole("link").count(), 6);
    assert.equal(await dialog.getByRole("button", { name: "Close menu" }).locator("svg").count(), 1, "Close glyph is visible");
    for (let i = 0; i < 15; i += 1) {
      await page.keyboard.press("Tab");
      // Base UI schedules wrap-around focus on the next animation frame.
      await page.waitForFunction(() => document.querySelector('[role="dialog"]')?.contains(document.activeElement));
    }
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert(await trigger.evaluate(el => el === document.activeElement), "Closing restores focus to the hamburger");
  }
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page.getByRole("navigation", { name: "Full menu" }).getByRole("link", { name: "Classes", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  await page.waitForURL("**/#classes");

  await page.goto(base);
  await page.getByRole("button", { name: /^Caliyoga, Wed, Sep 16/ }).click();
  const reserve = page.getByRole("button", { name: "Reserve", exact: true });
  await reserve.click();
  await page.waitForURL("**/login?returnTo=**");
  const returnTo = new URL(page.url()).searchParams.get("returnTo");
  assert(returnTo?.startsWith("/portal/book/"), "Reservation preserves the selected session through login");
  await page.goto(base);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-calendar-grid="day"]').waitFor();
  assert(!(await bookingLink().isVisible()), "Booking CTA hidden beside the mobile calendar");
  await checkWidth();
  await page.locator("footer").scrollIntoViewIfNeeded();
  await bookingLink().waitFor({ state: "visible" });
  await bookingLink().click();
  await page.waitForFunction(() => {
    const rect = document.getElementById("schedule").getBoundingClientRect();
    return rect.top >= 70 && rect.top < 150;
  });
  await bookingLink().waitFor({ state: "hidden" });
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  assert(await page.getByRole("navigation", { name: "Full menu", exact: true }).isVisible());
  await page.keyboard.press("Escape");
  await page.getByRole("navigation", { name: "Full menu", exact: true }).waitFor({ state: "hidden" });
  await page.goto(`${base}/about`);
  await bookingLink().waitFor({ state: "visible" });
  await bookingLink().click();
  await page.waitForURL(`${base}/#schedule`);
  await bookingLink().waitFor({ state: "hidden" });
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await checkWidth();
  }
  for (const route of ["/about", "/coaches", "/faqs", "/contact"]) {
    await page.goto(`${base}${route}`);
    assert.equal(await page.locator("h1").count(), 1, `${route} has one visible page heading`);
    assert(await page.locator("h1").isVisible());
    await checkWidth();
  }
  assert.deepEqual(apiCalls, [], "Marketing remains mock-only");
  assert.deepEqual(errors, [], "No browser runtime errors");
  console.log("Marketing browser checks passed: responsive layout, booking redirect, conditional mobile CTA, menu, public routes, mock-only data.");
} finally {
  await browser.close();
}
