import { describe, it, expect, afterEach, vi } from "vitest";

async function freshClient() {
  vi.resetModules();
  return import("@/lib/ai-tutor/client");
}

describe("AI provider gating", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("hasAiProvider is false with no API key configured", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const { hasAiProvider } = await freshClient();
    expect(hasAiProvider()).toBe(false);
  });

  it("hasAiProvider is true when an API key is configured", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-test-key");
    const { hasAiProvider } = await freshClient();
    expect(hasAiProvider()).toBe(true);
  });

  it("returns a clearly-labeled mock reply outside production when no provider is configured", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("NODE_ENV", "development");
    const { getTutorReply } = await freshClient();
    const reply = await getTutorReply("system", [{ role: "user", content: "hi" }]);
    expect(reply.toLowerCase()).toContain("development preview");
  });

  it("throws AiUnavailableError in a real production deployment with no provider — never a mock reply", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("VERCEL_ENV", "production");
    const { getTutorReply, AiUnavailableError } = await freshClient();
    await expect(
      getTutorReply("system", [{ role: "user", content: "hi" }]),
    ).rejects.toThrow(AiUnavailableError);
    await expect(
      getTutorReply("system", [{ role: "user", content: "hi" }]),
    ).rejects.toThrow("No AI provider is currently connected.");
  });

  it("throws AiUnavailableError in production even without VERCEL_ENV set (e.g. non-Vercel hosting)", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("NODE_ENV", "production");
    const { getTutorReply, AiUnavailableError } = await freshClient();
    await expect(
      getTutorReply("system", [{ role: "user", content: "hi" }]),
    ).rejects.toThrow(AiUnavailableError);
  });
});
