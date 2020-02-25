import { createHash } from "crypto";

export function genRouteId(filepath: string) {
  const id = createHash("md4")
    .update(filepath)
    .digest("hex")
    .substr(0, 4);

  return `page-${id}`;
}

// depend on genRouteId, we should keep them sync
export const ROUTE_ID_REGEXP = /^page-[0-9A-Fa-f]{4,4}$/;
