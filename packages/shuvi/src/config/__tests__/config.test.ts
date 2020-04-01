import { loadFixture, resolveFixture } from "./utils";

describe("config", () => {
  test("should load config", async () => {
    const config = await loadFixture("base");

    expect(config.ssr).toBe(true);
    expect(config.rootDir).toBe(resolveFixture("base"));
  });
});
