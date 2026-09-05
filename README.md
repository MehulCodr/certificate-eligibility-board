# College Event Certificate Eligibility Board

A compact single-page web application that evaluates whether college event participants are eligible for a certificate based on **activity-category coverage** and **minimum points**.

The project was built as part of an **AI-Assisted Coding Interview** exercise, with emphasis on correctness, explainability, validation, testing, simplicity, and live modification.

---

## Eligibility Rules

A participant is **ELIGIBLE** only when both conditions are satisfied:

1. They have completed at least one activity from each required category:
   - `LEARN`
   - `BUILD`
   - `SHARE`
2. They have at least **6 total points**.

The eligibility policy is defined centrally in:

```text
src/constants.js
```

```js
export const ELIGIBILITY_POLICY = {
  minimumPoints: 6,
  requiredCategories: ["LEARN", "BUILD", "SHARE"],
};
```

---

## Features

- Fixed activity definitions
- Built-in sample participant data
- Editable participant ID, name, and completed activities
- Add participant row
- Delete participant row
- Load and evaluate built-in sample data
- Reset to the original participant data
- Participant input parsing and trimming
- Total point calculation
- Category coverage calculation
- Eligible and ineligible counts
- Category progress
- Point progress
- Exact failure reasons for ineligible participants
- Deterministic result ordering
- Input validation
- Automated tests using Vitest

---

## Validation

The application validates:

```text
INVALID_PARTICIPANT
DUPLICATE_PARTICIPANT_ID
UNKNOWN_ACTIVITY
DUPLICATE_PARTICIPATION
```

Examples include:

- empty participant ID
- empty participant name
- duplicate participant IDs
- unknown activity IDs
- repeated participation in the same activity

An empty completed-activity list is valid.

If evaluation encounters invalid input, old results and summary counts are cleared so stale results are not displayed.

---

## Built-In Activities

| ID | Activity | Category | Points |
|---|---|---|---:|
| A01 | Emerging Tech Talk | LEARN | 2 |
| A02 | Soldering Mini Lab | BUILD | 3 |
| A03 | Project Pitch Circle | SHARE | 2 |
| A04 | Open Source Clinic | BUILD | 2 |

---

## Built-In Participants

| ID | Name | Completed Activities | Points | Expected Status |
|---|---|---|---:|---|
| C01 | Asha | A01, A02, A03 | 7 | ELIGIBLE |
| C02 | Bilal | A01, A03, A04 | 6 | ELIGIBLE |
| C03 | Chen | A01, A02, A04 | 7 | INELIGIBLE |
| C04 | Divya | A02, A03, A04 | 7 | INELIGIBLE |
| C05 | Eshan | A01, A03 | 4 | INELIGIBLE |

Expected summary:

```text
Eligible:   2
Ineligible: 3
```

Expected failure reasons:

```text
C03 -> MISSING_CATEGORY: SHARE

C04 -> MISSING_CATEGORY: LEARN

C05 -> MISSING_CATEGORY: BUILD
       POINTS_BELOW_6
```

---

## Tech Stack

| Area | Technology |
|---|---|
| UI | HTML5 |
| Styling | CSS3 |
| Application Logic | Vanilla JavaScript ES6+ |
| Development / Build | Vite |
| Testing | Vitest |
| Data Storage | In-memory JavaScript objects |

React, TypeScript, backend services, and databases were intentionally not introduced because the application is a small local single-screen system.

The goal was to keep the implementation easy to understand, test, and modify during a live interview.

---

## Project Structure

```text
certificate-eligibility-board/
│
├── index.html
│
├── package.json
│
├── package-lock.json
│
├── src/
│   ├── constants.js
│   ├── main.js
│   ├── style.css
│   │
│   ├── data/
│   │   └── sampleData.js
│   │
│   └── domain/
│       ├── parser.js
│       ├── validation.js
│       └── evaluator.js
│
├── tests/
│   ├── validation.test.js
│   └── evaluator.test.js
│
├── Cisco_Certificate_Eligibility_Board_Design_Documentation.md
└── Cisco_Iterative_Development_and_AI_Collaboration.md
```

---

## Architecture

The application separates input handling, validation, business logic, and rendering.

```text
Participant Input
       |
       v
parseParticipant()
       |
       v
validateParticipants()
       |
   +---+---+
   |       |
Invalid   Valid
   |       |
   v       v
 Errors   evaluateParticipants()
               |
               v
        Explainable Results
               |
       +-------+-------+
       |       |       |
     Counts  Progress  Result Rows
```

### Responsibilities

**`sampleData.js`**

Stores the fixed activity definitions and initial participants.

**`parser.js`**

Normalizes raw participant input.

For example:

```text
" A01, A02, A03 "
```

becomes:

```js
["A01", "A02", "A03"]
```

**`validation.js`**

Checks participant and activity input before evaluation.

**`evaluator.js`**

Contains certificate-eligibility business logic.

**`constants.js`**

Stores the configurable eligibility policy.

**`main.js`**

Handles browser state, user events, and UI rendering.

---

## Design Decisions

### Configuration-Driven Eligibility

Eligibility values are stored in one policy object instead of being hardcoded throughout the application.

This makes changes such as:

```text
minimumPoints: 6 -> 8
```

localized and easy to implement.

---

### `Map` for Activity Lookup

Activities are converted into a lookup structure:

```text
Activity ID -> Activity
```

This makes point/category lookup direct and avoids repeatedly scanning the activity array.

---

### `Set` for Category Coverage

Category coverage uses a `Set` because only unique categories matter.

For example:

```text
LEARN
BUILD
SHARE
```

Each category only needs to be represented once regardless of how many activities from that category a participant completed.

---

### Explainable Evaluation

The evaluator returns more than an eligibility boolean.

A result contains information such as:

```text
participantId
totalPoints
coveredCategories
missingCategories
meetsPointThreshold
eligible
reasons
```

This allows the same evaluation output to drive:

- status
- progress
- failure reasons
- summary counts
- automated tests

The UI therefore does not reimplement business logic.

---

## Failure Reason Ordering

Failure reasons are deterministic.

Missing categories appear in this order:

```text
LEARN
BUILD
SHARE
```

The point failure is added afterward.

An empty activity list therefore produces:

```text
MISSING_CATEGORY: LEARN
MISSING_CATEGORY: BUILD
MISSING_CATEGORY: SHARE
POINTS_BELOW_6
```

---

## Result Ordering

Results are sorted using two rules:

1. Eligible participants first
2. Participant ID ascending within each eligibility group

Example:

```text
C01 - ELIGIBLE
C02 - ELIGIBLE
C03 - INELIGIBLE
C04 - INELIGIBLE
C05 - INELIGIBLE
```

---

## Getting Started

### Prerequisites

Install:

```text
Node.js
npm
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Open the local URL printed by Vite in your browser.

---

## Running Tests

Run the complete automated test suite with:

```bash
npm test
```

The tests cover important scenarios such as:

- built-in participant results
- exact 6-point eligibility boundary
- exact failure reasons
- empty activity lists
- unknown activities
- duplicate participation
- duplicate participant IDs
- invalid participant fields
- multiple validation errors
- result ordering
- eligibility-group ordering
- modified sample-data acceptance cases
- configurable point thresholds
- reset-data copy behavior

---

## Build

Create a production build using:

```bash
npm run build
```

Preview the production build using:

```bash
npm run preview
```

---

## Important Acceptance Scenarios

### Exact Point Boundary

Change C05 from:

```text
A01, A03
```

to:

```text
A01, A03, A04
```

C05 changes from:

```text
4 points
Missing BUILD
INELIGIBLE
```

to:

```text
6 points
LEARN + BUILD + SHARE
ELIGIBLE
```

The summary becomes:

```text
Eligible:   3
Ineligible: 2
```

---

### Empty Activity List

Clear all completed activities for C01.

Expected result:

```text
Points: 0

MISSING_CATEGORY: LEARN
MISSING_CATEGORY: BUILD
MISSING_CATEGORY: SHARE
POINTS_BELOW_6
```

---

### Duplicate Participation

Change C01 to:

```text
A01, A02, A03, A01
```

Expected validation error:

```text
DUPLICATE_PARTICIPATION
Participant: C01
Value: A01
```

Evaluation results and counts are not retained after invalid input.

---

## AI-Assisted Development

AI was used throughout the project for:

- requirement breakdown
- architecture comparison
- implementation suggestions
- debugging
- test-case generation
- code review
- refinement suggestions

The application was not generated from one large prompt.

Development followed an iterative workflow:

```text
Requirement
    |
    v
Focused AI Prompt
    |
    v
Review Suggestion
    |
    v
Accept / Reject / Refine
    |
    v
Implement
    |
    v
Test
```

A major design goal was maintaining ownership of engineering decisions rather than automatically accepting AI recommendations.

For example, an initial AI suggestion proposed adding a Delete button to every participant row. That design was deliberately simplified to two table-level actions:

```text
Add Participant Row
Delete Participant Row
```

This kept the UI and state-management logic simpler.

---

## Documentation

Detailed design decisions are available in:

[`Cisco_Certificate_Eligibility_Board_Design_Documentation.md`](./Cisco_Certificate_Eligibility_Board_Design_Documentation.md)

The complete iterative AI-assisted development record, including prompts and design changes, is available in:

[`Cisco_Iterative_Development_and_AI_Collaboration.md`](./Cisco_Iterative_Development_and_AI_Collaboration.md)

---

## Design Philosophy

The main principle behind the project is:

> Build the simplest architecture that completely satisfies the requirements while remaining modular, testable, explainable, and easy to modify live.

Complexity was added only when it solved a concrete requirement.