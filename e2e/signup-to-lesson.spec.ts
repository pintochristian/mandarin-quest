import { test, expect } from "@playwright/test";

/**
 * End-to-end smoke test for the core loop: sign up, complete onboarding,
 * land on the dashboard, open a lesson, and confirm the review queue is
 * reachable. Uses a freshly generated email each run so it never collides
 * with existing accounts in the dev database.
 */
test("sign up, onboard, and reach a lesson", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;

  await page.goto("/sign-up");
  await page.getByLabel("Name").fill("E2E Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correcthorsebattery");
  await page.getByRole("button", { name: "Create account" }).click();

  // Onboarding: pick a practice style.
  await expect(page.getByText("How do you like to practice?")).toBeVisible({
    timeout: 15_000,
  });
  await page.getByText("I usually study quietly").click();

  // Lands on the dashboard.
  await expect(page).toHaveURL("/", { timeout: 15_000 });
  await expect(page.getByText("Review due today")).toBeVisible();

  // Open the first lesson.
  await page.getByRole("link", { name: /Meeting Someone/ }).click();
  await expect(page.getByText(/of 6|Quiet|Full Speaking/).first()).toBeVisible({
    timeout: 15_000,
  });

  // The review queue is reachable (even if empty for a brand-new user).
  await page.goto("/review");
  await expect(
    page.getByText(/Nothing due right now|Review complete!|\/ \d+/).first(),
  ).toBeVisible({ timeout: 15_000 });
});
