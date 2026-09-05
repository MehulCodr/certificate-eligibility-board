import { describe, expect, test } from "vitest";

import {
    activities,
    participants,
    getInitialParticipants,
} from "../src/data/sampleData.js";

import { ELIGIBILITY_POLICY } from "../src/constants.js";
import { parseParticipant } from "../src/domain/parser.js";
import { validateParticipants } from "../src/domain/validation.js";
import { evaluateParticipant,evaluateParticipants } from "../src/domain/evaluator.js";
function parseAll(data) {
  return data.map(parseParticipant);
}

describe("participant validation", () => {
  test("built-in participant data is valid", () => {
    const parsed = parseAll(participants);

    const errors = validateParticipants(parsed, activities);

    expect(errors).toEqual([]);
  });

  test("detects duplicate activity participation", () => {
    const data = [
      {
        id: "C01",
        name: "Asha",
        completedActivities: "A01, A02, A01",
      },
    ];

    const errors = validateParticipants(parseAll(data), activities);

    expect(errors).toContainEqual({
      code: "DUPLICATE_PARTICIPATION",
      participant: "C01",
      value: "A01",
    });
  });

  test("detects unknown activity", () => {
    const data = [
      {
        id: "C01",
        name: "Asha",
        completedActivities: "A01, A99",
      },
    ];

    const errors = validateParticipants(parseAll(data), activities);

    expect(errors).toContainEqual({
      code: "UNKNOWN_ACTIVITY",
      participant: "C01",
      value: "A99",
    });
  });

  test("detects duplicate participant ID", () => {
    const data = [
      {
        id: "C01",
        name: "Asha",
        completedActivities: "A01",
      },
      {
        id: "C01",
        name: "Bilal",
        completedActivities: "A02",
      },
    ];

    const errors = validateParticipants(parseAll(data), activities);

    expect(errors).toContainEqual({
      code: "DUPLICATE_PARTICIPANT_ID",
      participant: "C01",
      value: "C01",
    });
  });

  test("detects empty participant name", () => {
    const data = [
      {
        id: "C05",
        name: "   ",
        completedActivities: "A01",
      },
    ];

    const errors = validateParticipants(parseAll(data), activities);

    expect(errors).toContainEqual({
      code: "INVALID_PARTICIPANT",
      participant: "C05",
      value: "",
    });
  });
  test("detects empty participant ID", () => {
    const data = [
      {
        id: "   ",
        name: " Mehul  ",
        completedActivities: "A01",
      },
    ];

    const errors = validateParticipants(parseAll(data), activities);

    expect(errors).toContainEqual({
      code: "INVALID_PARTICIPANT",
      participant: "",
      value: "",
    });
  });
  test("reports multiple validation errors for the same participant", () => {
    const data = [
      {
        id: "C01",
        name: "   ",
        completedActivities: "A01, A99",
      },
    ];

    const errors = validateParticipants(
      parseAll(data),
      activities
    );

    expect(errors).toEqual([
      {
        code: "INVALID_PARTICIPANT",
        participant: "C01",
        value: "",
      },
      {
        code: "UNKNOWN_ACTIVITY",
        participant: "C01",
        value: "A99",
      },
    ]);
  });

  test("detects duplicate ID even when the first participant has another error", () => {
    const data = [
      {
        id: "C01",
        name: "",
        completedActivities: "A01",
      },
      {
        id: "C01",
        name: "Bilal",
        completedActivities: "A02",
      },
    ];

    const errors = validateParticipants(
      parseAll(data),
      activities
    );

    expect(errors).toContainEqual({
      code: "INVALID_PARTICIPANT",
      participant: "C01",
      value: "",
    });

    expect(errors).toContainEqual({
      code: "DUPLICATE_PARTICIPANT_ID",
      participant: "C01",
      value: "C01",
    });
  });

  test("built-in ineligible participants have exact failure reasons", () => {
    const parsed = parseAll(participants);

    const results = evaluateParticipants(
      parsed,
      activities,
      ELIGIBILITY_POLICY
    );

    const resultMap = new Map(
      results.map((result) => [
        result.participantId,
        result,
      ])
    );

    expect(resultMap.get("C03").reasons).toEqual([
      "MISSING_CATEGORY: SHARE",
    ]);

    expect(resultMap.get("C04").reasons).toEqual([
      "MISSING_CATEGORY: LEARN",
    ]);

    expect(resultMap.get("C05").reasons).toEqual([
      "MISSING_CATEGORY: BUILD",
      "POINTS_BELOW_6",
    ]);
  });

  test("adding A04 to C05 updates board to 3 eligible and 2 ineligible", () => {
    const modified = participants.map(
      (participant) => ({ ...participant })
    );

    modified[4].completedActivities =
      "A01, A03, A04";

    const results = evaluateParticipants(
      parseAll(modified),
      activities,
      ELIGIBILITY_POLICY
    );

    const eligibleCount = results.filter(
      (result) => result.eligible
    ).length;

    expect(eligibleCount).toBe(3);
    expect(results.length - eligibleCount).toBe(2);

    const c05 = results.find(
      (result) => result.participantId === "C05"
    );

    expect(c05.totalPoints).toBe(6);
    expect(c05.missingCategories).toEqual([]);
    expect(c05.eligible).toBe(true);
  });

  test("clearing C01 activities updates board to 1 eligible and 4 ineligible", () => {
    const modified = participants.map(
      (participant) => ({ ...participant })
    );

    modified[0].completedActivities = "";

    const results = evaluateParticipants(
      parseAll(modified),
      activities,
      ELIGIBILITY_POLICY
    );

    const eligibleCount = results.filter(
      (result) => result.eligible
    ).length;

    expect(eligibleCount).toBe(1);
    expect(results.length - eligibleCount).toBe(4);

    const c01 = results.find(
      (result) => result.participantId === "C01"
    );

    expect(c01.totalPoints).toBe(0);

    expect(c01.reasons).toEqual([
      "MISSING_CATEGORY: LEARN",
      "MISSING_CATEGORY: BUILD",
      "MISSING_CATEGORY: SHARE",
      "POINTS_BELOW_6",
    ]);
  });

});