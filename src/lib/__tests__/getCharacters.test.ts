import { describe, expect, test } from "bun:test";
import { expandPositionTokens, getCharacters } from "../getCharacters";

describe("getCharacters", () => {
  test("returns characters at 1-based positions", () => {
    expect(getCharacters("testingastring123", [4, 12, 13])).toEqual([
      { position: 4, value: "t" },
      { position: 12, value: "i" },
      { position: 13, value: "n" },
    ]);
  });

  test("uses '-' when position is past end of string", () => {
    expect(getCharacters("hi", [1, 2, 3, 99])).toEqual([
      { position: 1, value: "h" },
      { position: 2, value: "i" },
      { position: 3, value: "-" },
      { position: 99, value: "-" },
    ]);
  });

  test("empty string yields '-' for every position", () => {
    expect(getCharacters("", [1, 2])).toEqual([
      { position: 1, value: "-" },
      { position: 2, value: "-" },
    ]);
  });

  test("empty positions list yields empty array", () => {
    expect(getCharacters("abc", [])).toEqual([]);
  });
});

describe("expandPositionTokens", () => {
  test("accepts comma-separated values", () => {
    expect(expandPositionTokens("4,12,13")).toEqual([4, 12, 13]);
  });

  test("accepts space-separated values", () => {
    expect(expandPositionTokens("4 12 13")).toEqual([4, 12, 13]);
  });

  test("accepts semicolons and mixed separators", () => {
    expect(expandPositionTokens("4; 12 , 13")).toEqual([4, 12, 13]);
  });

  test("accepts newlines between numbers", () => {
    expect(expandPositionTokens("4\n12\r\n13")).toEqual([4, 12, 13]);
  });

  test("expands inclusive ranges", () => {
    expect(expandPositionTokens("1-3")).toEqual([1, 2, 3]);
  });

  test("normalizes ranges with spaces around hyphen", () => {
    expect(expandPositionTokens("1 - 3")).toEqual([1, 2, 3]);
  });

  test("reversed ranges expand low to high", () => {
    expect(expandPositionTokens("5-3")).toEqual([3, 4, 5]);
  });

  test("ignores zero, negative, and non-numeric tokens", () => {
    expect(expandPositionTokens("0 -2 abc 4")).toEqual([4]);
  });

  test("returns empty array for empty or only-invalid input", () => {
    expect(expandPositionTokens("")).toEqual([]);
    expect(expandPositionTokens("  ,  ;;  ")).toEqual([]);
    expect(expandPositionTokens("foo bar")).toEqual([]);
  });

  test("combines single positions and ranges", () => {
    expect(expandPositionTokens("2 1-2 10")).toEqual([2, 1, 2, 10]);
  });

  test("trims leading and trailing whitespace", () => {
    expect(expandPositionTokens("  7 8  ")).toEqual([7, 8]);
  });
});
