import { describe, expect, test } from "vitest";

import {
    activities,
    participants,
} from "../src/data/sampleData.js";

import { ELIGIBILITY_POLICY } from "../src/constants.js";

import { parseParticipant } from "../src/domain/parser.js";

import {
    evaluateParticipant,
    evaluateParticipants,
} from "../src/domain/evaluator.js";


const activityMap = new Map(
    activities.map((activity) => [activity.id, activity])
);

function parseAll(data) {
    return data.map(parseParticipant);
}

describe("eligibility evaluation", () => {
    test("built-in participants have the expected points and eligibility", () => {
        const parsed = parseAll(participants);

        const results = evaluateParticipants(
            parsed,
            activities,
            ELIGIBILITY_POLICY
        );

        expect(results.map((result) => result.totalPoints)).toEqual([
            7,
            6,
            7,
            7,
            4,
        ]);

        expect(results.map((result) => result.eligible)).toEqual([
            true,
            true,
            false,
            false,
            false,
        ]);
    });


    test("participant is eligible at exactly 6 points", () => {
        const participant = parseParticipant({
            id: "C05",
            name: "Eshan",
            completedActivities: "A01, A03, A04",
        });

        const result = evaluateParticipant(
            participant,
            activityMap,
            ELIGIBILITY_POLICY
        );

        expect(result.totalPoints).toBe(6);
        expect(result.missingCategories).toEqual([]);
        expect(result.eligible).toBe(true);
    });


    test("empty activity list returns all failure reasons in order", () => {
        const participant = parseParticipant({
            id: "C01",
            name: "Asha",
            completedActivities: "",
        });

        const result = evaluateParticipant(
            participant,
            activityMap,
            ELIGIBILITY_POLICY
        );

        expect(result.totalPoints).toBe(0);

        expect(result.reasons).toEqual([
            "MISSING_CATEGORY: LEARN",
            "MISSING_CATEGORY: BUILD",
            "MISSING_CATEGORY: SHARE",
            "POINTS_BELOW_6",
        ]);
    });

    test("eligible participants appear before ineligible participants", () => {
        const parsed = parseAll(participants);

        const results = evaluateParticipants(
            parsed,
            activities,
            ELIGIBILITY_POLICY
        );

        expect(results.map((result) => result.participantId)).toEqual([
            "C01",
            "C02",
            "C03",
            "C04",
            "C05",
        ]);
    });

    test("results are ordered by eligibility and participant ID", () => {
        const parsed = parseAll([
            participants[4],
            participants[2],
            participants[1],
            participants[3],
            participants[0],
        ]);

        const results = evaluateParticipants(
            parsed,
            activities,
            ELIGIBILITY_POLICY
        );

        expect(results.map((result) => result.participantId)).toEqual([
            "C01",
            "C02",
            "C03",
            "C04",
            "C05",
        ]);
    });

    
    test("eligibility respects a changed point threshold", () => {
        const participant = parseParticipant({
            id: "C01",
            name: "Asha",
            completedActivities: "A01, A02, A03",
        });

        const customPolicy = {
            minimumPoints: 8,
            requiredCategories: ["LEARN", "BUILD", "SHARE"],
        };

        const result = evaluateParticipant(
            participant,
            activityMap,
            customPolicy
        );

        expect(result.totalPoints).toBe(7);
        expect(result.eligible).toBe(false);

        expect(result.reasons).toEqual([
            "POINTS_BELOW_8",
        ]);
    });
});