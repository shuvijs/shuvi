import path from "path";
import { loadConfig } from "../index";

export function resolveFixture(name: string) {
  return path.join(__dirname, "fixtures", name);
}

export async function loadFixture(name: string) {
  return loadConfig(resolveFixture(name));
}
