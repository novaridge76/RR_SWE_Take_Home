import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeStreaks } from "./streaks.js";

describe("computeStreaks", () => {
  it("empty history", () => {
    assert.deepEqual(computeStreaks([], "2026-07-17"), {
      current: 0,
      longest: 0,
    });
  });

  it("one day today", () => {
    assert.deepEqual(computeStreaks(["2026-07-17"], "2026-07-17"), {
      current: 1,
      longest: 1,
    });
  });

  it("keeps going if last check-in was yesterday", () => {
    assert.deepEqual(
      computeStreaks(["2026-07-15", "2026-07-16"], "2026-07-17"),
      { current: 2, longest: 2 },
    );
  });

  it("breaks when last check-in is older than yesterday", () => {
    assert.deepEqual(
      computeStreaks(["2026-07-10", "2026-07-11", "2026-07-12"], "2026-07-17"),
      { current: 0, longest: 3 },
    );
  });

  it("longest can be bigger than current", () => {
    assert.deepEqual(
      computeStreaks(
        [
          "2026-07-01",
          "2026-07-02",
          "2026-07-03",
          "2026-07-04",
          "2026-07-05",
          "2026-07-16",
          "2026-07-17",
        ],
        "2026-07-17",
      ),
      { current: 2, longest: 5 },
    );
  });
});
