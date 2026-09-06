# Certificate Eligibility Board — Interview Summary

## 1. Problem and Solution

The project implements a local, single-screen **College Event Certificate Eligibility Board**.

Each participant has completed activity IDs. Every activity has a fixed category and point value.

A participant is **ELIGIBLE** only when:

- all required categories are covered: `LEARN`, `BUILD`, and `SHARE`
- total points are at least `6`

The application also:

- validates participant input
- calculates points and category coverage
- produces exact ordered failure reasons
- sorts results deterministically
- shows eligible/ineligible counts
- shows category and point progress
- allows participant records to be edited
- supports adding and deleting participant rows
- supports Evaluate and Reset behavior

The solution intentionally remains local-only. I did not introduce a backend, database, authentication, event registration, payments, scheduling, or certificate generation because none were required.

---

## 2. Implementation Plan

I divided development into four checkpoints instead of asking AI to generate the complete application at once.

### Step 1 — Data, Parsing, and Validation

Implemented:

- fixed activities
- built-in participant records
- eligibility-policy configuration
- participant input parsing
- validation for:
  - empty IDs/names
  - duplicate participant IDs
  - unknown activity IDs
  - duplicate activity participation

### Step 2 — Eligibility Evaluation

Implemented:

- activity lookup
- point aggregation
- unique category tracking
- missing-category detection
- minimum-point validation
- complete failure-reason generation
- deterministic result ordering

### Step 3 — Minimal UI and Reset

Implemented:

- fixed activity table
- editable participant table
- Evaluate
- Reset
- validation display
- result table

### Step 4 — Functional Refinement

Added:

- Add Participant Row
- Delete Participant Row
- eligible/ineligible counts
- category progress
- point progress
- synchronization and validation refinements

The overall plan remained stable, but I deliberately changed the order when useful. For example, I implemented deterministic reset behavior before expanding the UI.

---

## 3. AI Prompting Strategy

I used AI through small prompts that translated one part of the problem statement at a time. I did not use a single prompt asking AI to build the entire application.

### Requirement and architecture prompts

> Analyze this problem statement and separate fixed data, editable input, validation contracts, eligibility rules, deterministic ordering, reset behavior, and acceptance tests. Return a short implementation plan with useful checkpoints.

This produced the four-stage plan used by the project: parsing and validation, evaluation, minimal UI and reset, then UI refinement.

> Analyze this problem statement and compare Vanilla JavaScript, React + JavaScript, and React + TypeScript. Consider application complexity, testing, maintainability, live modification, and unnecessary dependencies.

This converted the scope constraints into a technology decision instead of selecting a framework by default.

> Identify which parts of the eligibility specification are business-policy values that may change and which parts are stable application logic. Recommend a simple way to avoid hardcoding without overengineering the solution.

This led to `ELIGIBILITY_POLICY` plus pure evaluator functions rather than a generic rule engine.

### Validation and testing prompt

> Convert the acceptance criteria into deterministic automated test cases. Include the built-in oracle, exact point boundary, empty completion list, duplicate participation, duplicate participant IDs, unknown activity, failure-reason ordering, and participant ordering.

The generated cases were checked against the problem statement before being implemented in Vitest.

### Iterative refinement prompts

The broad specifications were narrowed through prompts such as:

> "ok let's start with iteration 1 remember to keep it simple"

> "remember to keep the implementation clean and simple"

> "main.js is getting too long add render participants and related logic in another file and render results and related logic in another file"

> "remove the suggestions in the drop down remove the dropdown altogether"

These prompts did more than request features: they constrained scope, controlled when abstractions were introduced, and removed UI complexity that did not justify its code cost.

---

## 4. Design Constraints and Technology Choices

The following constraints were repeatedly provided to AI:

- keep the application local and single-screen
- use Vanilla JavaScript and browser APIs
- do not add React, TypeScript, a backend, a database, authentication, or persistence
- keep parsing, validation, evaluation, and rendering separate
- keep eligibility policy in one configuration object
- keep the UI dependent on evaluator output rather than recalculating eligibility
- preserve exact validation codes, failure-reason order, and result ordering
- allow unknown and duplicate activity IDs to reach validation
- prefer small functions, ES modules, and standard data structures
- add abstractions only after the code demonstrates a real need
- verify changes with tests and a production build

| Area | Choice | Reason |
|---|---|---|
| UI | HTML + CSS | One compact screen; no routing required |
| Logic | Vanilla JavaScript ES modules | Simple, familiar, explainable, easy to modify live |
| Development | Vite | Minimal setup and fast local development |
| Testing | Vitest | Lightweight and works naturally with Vite |
| Data | In-memory JavaScript objects | Matches the local-only requirement |
| Activity lookup | `Map` | Direct lookup by activity ID |
| Category tracking | `Set` | Naturally represents unique categories |

### Why not React?

I considered React, but this project has:

- one screen
- no routing
- no API state
- no authentication
- no large component hierarchy

React would add another abstraction layer without solving an important requirement.

### Why not TypeScript?

TypeScript would be useful for a larger system, but for this compact interview task I prioritized code I could confidently explain and modify live.

My principle was:

> Use only complexity that provides real value for the problem.

---

## 5. Architecture

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

Responsibilities are separated as follows:

```text
sampleData.js
    Fixed activities and built-in participant records

parser.js
    Converts raw editable input into normalized participant data

validation.js
    Enforces input contracts

evaluator.js
    Contains eligibility business logic

constants.js
    Contains eligibility policy

main.js
    Browser state and application workflow

ui/participants.js
    Participant inputs, activity chips, and participant actions

ui/results.js
    Validation, summary, progress, and result rendering
```

The important architectural rule is:

> The UI does not determine eligibility.

The UI only displays results produced by the domain layer.

---

## 6. Main Design Decisions

### Configuration-Driven Eligibility

The eligibility requirements are stored centrally:

```js
export const ELIGIBILITY_POLICY = {
  minimumPoints: 6,
  requiredCategories: ["LEARN", "BUILD", "SHARE"],
};
```

This avoids scattering business-policy values across the application.

It also makes likely live modifications easy.

For example, if the interviewer changes the minimum threshold from `6` to `8`, the policy can change without rewriting the evaluator.

---

### `Map` for Activity Lookup

Instead of repeatedly scanning the four activities for each completed ID, the evaluator builds an activity lookup:

```text
Activity ID -> Activity
```

This makes the lookup logic explicit and keeps the evaluator simple.

---

### `Set` for Category Coverage

The requirement only cares whether a category has been covered at least once.

Therefore:

```js
Set
```

is a natural representation of:

```text
LEARN
BUILD
SHARE
```

without duplicates.

---

### Explainable Results

The evaluator does not return only:

```js
eligible: false
```

It returns derived information such as:

```text
totalPoints
coveredCategories
missingCategories
meetsPointThreshold
eligible
reasons
```

This same output drives:

- tests
- progress indicators
- eligibility status
- failure reasons

That prevents the UI from recalculating business logic.

---

### Avoiding Overengineering

A generic rule engine, strategy pattern, repository layer, or framework abstraction could have been introduced.

I deliberately rejected them.

There are only two eligibility rules:

1. required categories
2. minimum points

The final design is therefore:

```text
Small policy object
        +
Pure evaluation logic
```

---

## 7. Validation

The required validation codes are:

```text
INVALID_PARTICIPANT
DUPLICATE_PARTICIPANT_ID
UNKNOWN_ACTIVITY
DUPLICATE_PARTICIPATION
```

Participant input is editable as comma-separated activity IDs.

For example:

```text
A01, A02, A01
```

is intentionally allowed to reach the validation layer so that duplicate participation can be detected rather than silently removed.

An empty activity list is valid.

It produces:

```text
0 points

MISSING_CATEGORY: LEARN
MISSING_CATEGORY: BUILD
MISSING_CATEGORY: SHARE
POINTS_BELOW_6
```

Validation is performed before eligibility evaluation so the evaluator can work with valid activity references.

---

## 8. Expected Built-In Results

| Participant | Points | Status | Failure reason |
|---|---:|---|---|
| C01 | 7 | ELIGIBLE | — |
| C02 | 6 | ELIGIBLE | — |
| C03 | 7 | INELIGIBLE | `MISSING_CATEGORY: SHARE` |
| C04 | 7 | INELIGIBLE | `MISSING_CATEGORY: LEARN` |
| C05 | 4 | INELIGIBLE | `MISSING_CATEGORY: BUILD`, `POINTS_BELOW_6` |

Summary:

```text
Eligible:   2
Ineligible: 3
```

Failure reasons always follow:

```text
LEARN
BUILD
SHARE
POINTS
```

Participants are sorted:

```text
Eligible first
        |
        v
Ineligible second
        |
        v
Participant ID ascending inside each group
```

---

## 9. Testing Strategy

I focused automated tests on deterministic domain behavior rather than browser styling.

Important test cases include:

- built-in participant totals and eligibility
- exact `6`-point boundary
- empty completion list
- duplicate participation
- unknown activity
- duplicate participant ID
- empty participant fields
- exact failure-reason ordering
- eligible/ineligible ordering
- participant-ID ordering
- fresh-copy initial data behavior
- changed eligibility threshold

A particularly useful boundary test is C05:

```text
Before:
A01, A03
4 points
Missing BUILD
INELIGIBLE

Add A04:

A01, A03, A04
6 points
LEARN + BUILD + SHARE
ELIGIBLE
```

This simultaneously checks the point threshold and category requirement.

---

## 10. AI-Influenced Decision Making

AI was used as a **development partner**, not as a one-shot application generator.

My workflow was:

```text
Requirement
    |
    v
Focused AI prompt
    |
    v
Review recommendation
    |
    v
Question complexity / behavior
    |
    v
Accept, reject, or refine
    |
    v
Implement and test
```

The main assumptions given to and reviewed with AI were:

- evaluation receives parsed and validated activity IDs
- participant and activity IDs remain case-sensitive
- an empty activity list is valid
- all state is local and in memory
- rerendering the small screen is an acceptable reset/update strategy
- the fixed activity table is the source of truth for points and categories

Important decisions and trade-offs included:

| Decision | AI contribution | Final engineering judgment |
|---|---|---|
| Vanilla JavaScript | Compared framework options | React and TypeScript were unnecessary for one local screen |
| Policy plus pure evaluator | Suggested separating policy from logic | Kept the separation but rejected a generic rule engine |
| `Map` activity lookup | Identified repeated lookup work | Build one map per participant batch, not one per participant |
| `Set` category coverage | Recommended uniqueness semantics | Reused the derived set for eligibility and category progress |
| Structured validation errors | Proposed machine-readable errors | Retained them because they support exact tests and clear UI output |
| UI modules | Suggested possible component splits | Extracted only `participants.js` and `results.js` after `main.js` genuinely grew |
| Participant deletion | Initially used last-row deletion | Refined to typed-ID deletion using `findIndex()` and `splice()` |
| Completed-activity UX | Explored a datalist and chips | Rejected the suggestion dropdown; kept a text box, Add button, and removable chips |

AI recommendations were therefore treated as proposals. They were accepted when they improved correctness or clarity, refined when too broad, and removed when their complexity was not justified.

### Example 1 — Simplifying the Initial Project

My prompt:

> “i just ran the initial 4 commands and already there is much bloat in my project i want to make a simple project how do i fix this”

The default Vite demo code and assets were removed before feature work began.

This ensured every remaining file existed for an actual project requirement.

---

### Example 2 — Explicit Simplicity Constraint

My prompt:

> “ok let's start with iteration 1 remember to keep it simple”

This deliberately restricted the first implementation to:

```text
data
parsing
validation
tests
```

instead of trying to build the UI and evaluator simultaneously.

---

### Example 3 — Rejecting an AI UI Suggestion

AI initially suggested placing a Delete button on every participant row.

I changed the design:

> “I don't think we need to add delete column of participant table functionality. I think we should only add a participant row and delete a participant row.”

The final solution uses:

```text
Add Participant Row
Delete Participant Row
```

with simple array operations.

This is a useful example of maintaining ownership of the product instead of automatically accepting an AI recommendation.

---

### Example 4 — Evaluator Refinement

The initial evaluator direction recreated activity lookup work repeatedly.

After reviewing it, the lookup was moved outside individual participant evaluation so the activity `Map` is created once and reused.

The refinement improved the implementation without introducing classes or additional abstraction layers.

---

## 11. What I Prioritized and Deferred

### Prioritized

- correctness
- deterministic behavior
- explainable decisions
- simple architecture
- testability
- live-modification readiness
- code I understand completely

### Intentionally Deferred

- React
- TypeScript migration
- backend
- database
- authentication
- certificate generation
- persistence
- generic rule-engine abstractions

These were not omitted because they are difficult; they were omitted because they do not improve the required solution.

---

## 12. Live Modification Readiness

The architecture makes likely interview changes localized.

### Change minimum threshold

```js
ELIGIBILITY_POLICY.minimumPoints
```

### Change required categories

```js
ELIGIBILITY_POLICY.requiredCategories
```

### Add another activity

Update:

```text
sampleData.js
```

### Change validation behavior

Update:

```text
validation.js
```

and its focused test.

### Change output presentation

Update rendering in:

```text
ui/participants.js
ui/results.js
```

without modifying the eligibility evaluator.

This separation reduces the risk that a small live modification breaks unrelated behavior.

---

## 13. Interview Demonstration Order

For a short interview presentation, I would demonstrate the project in this order:

### 1. Explain the rule

> A participant must cover LEARN, BUILD, and SHARE and have at least six points.

### 2. Explain the architecture

> I separated parsing, validation, evaluation, and rendering so the UI never owns eligibility logic.

### 3. Explain technology choices

> I chose Vanilla JavaScript, Vite, and Vitest because the project is one local screen and I wanted a stack I could fully explain and modify live.

### 4. Show the interesting code

Show:

```text
ELIGIBILITY_POLICY
Activity Map
Category Set
evaluateParticipant()
```

### 5. Demo the built-in data

Expected:

```text
C01  7  ELIGIBLE
C02  6  ELIGIBLE
C03  7  INELIGIBLE
C04  7  INELIGIBLE
C05  4  INELIGIBLE

Eligible: 2
Ineligible: 3
```

### 6. Show one boundary change

Add `A04` to C05.

Explain:

```text
4 -> 6 points
BUILD becomes covered
C05 becomes eligible
```

### 7. Show validation

Add a second `A01` to C01.

Show:

```text
DUPLICATE_PARTICIPATION
```

and explain why stale results are not allowed to remain.

### 8. Show Reset

Restore the built-in data.

### 9. Show tests

Run:

```bash
npm test
```

Point out the boundary, empty-list, validation, and ordering tests.

### 10. Finish with AI collaboration

> I used AI iteratively for design alternatives, implementation suggestions, and tests, but I reviewed its output and changed recommendations when they added unnecessary complexity. The participant-delete design is one concrete example.

---

## 14. Documentation Structure

Use this document during the interview.

Keep:

```text
CompleteProcess.md
```

as the detailed evidence trail containing:

- prompts
- iterations
- debugging
- AI recommendations
- user corrections
- design evolution

You do not need to present that document line by line. Open it only if the interviewer asks:

- “What prompts did you use?”
- “How did AI influence the solution?”
- “Give an example where you disagreed with AI.”
- “How did your original plan change?”
