import { describe, expect, test } from "vitest";

import { activities, participants } from "../src/data/sampleData.js";
import { parseParticipant } from "../src/domain/parser.js";
import { validateParticipants } from "../src/domain/validation.js";

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

    expect(errors[0].code).toBe("INVALID_PARTICIPANT");
  });
});