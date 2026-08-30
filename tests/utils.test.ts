import { describe, expect, it } from "vitest";

import { isValidEmail, isValidUrl, joinLines, normalizeUrl, splitLines } from "@/lib/utils";

describe("resume utility validation", () => {
  it("accepts optional or well-formed contact fields", () => {
    expect(isValidEmail("")).toBe(true);
    expect(isValidEmail("researcher@example.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidUrl("github.com/Ikteder")).toBe(true);
    expect(isValidUrl("not a url")).toBe(false);
  });

  it("normalizes URLs and multiline bullet input", () => {
    expect(normalizeUrl("github.com/Ikteder")).toBe("https://github.com/Ikteder");
    expect(splitLines(" first result \n\n second result ")).toEqual(["first result", "second result"]);
    expect(joinLines(["first result", "second result"])).toBe("first result\nsecond result");
  });
});
