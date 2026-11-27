import test from "node:test";
import assert from "node:assert/strict";
import { analyze, similarity, getHost } from "./analyze.js";
import { scholarships } from "./data.js";
test("official listing has low signals", () =>
  assert.equal(analyze(scholarships[0], scholarships).level, "Low signals"));
test("fictional payment and urgency example is high risk", () =>
  assert.equal(analyze(scholarships[2], scholarships).level, "High risk"));
test("lookalike suffix is not an official domain", () =>
  assert.equal(
    analyze({
      ...scholarships[0],
      url: "https://scholarships.gov.in.evil.example",
    }).checks[0].points,
    25,
  ));
test("non-web protocols are rejected", () =>
  assert.equal(getHost("javascript:alert(1)"), ""));
test("matching text flags similarity but self does not", () => {
  assert.equal(
    similarity(scholarships[0].description, scholarships[0].description),
    1,
  );
  assert.equal(
    analyze({ ...scholarships[0], id: "copy" }, scholarships).checks[3].points,
    15,
  );
  assert.equal(analyze(scholarships[0], [scholarships[0]]).checks[3].points, 0);
});
test("unknown organisation is not labelled fake", () =>
  assert.equal(
    analyze({ ...scholarships[0], organization: "New foundation" }).level,
    "Low signals",
  ));
