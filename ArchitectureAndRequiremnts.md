# College Event Certificate Eligibility Board
## Design Documentation

### AI-Assisted Coding Interview Solution

---

## 1. Problem Overview

The goal is to build a compact **College Event Certificate Eligibility Board** that:

- Uses a fixed activity table.
- Allows participant activity records to be edited.
- Calculates total activity points.
- Derives covered activity categories.
- Determines certificate eligibility.
- Shows exact failure reasons for ineligible participants.
- Validates invalid or duplicate input.
- Supports Evaluate and Reset actions.
- Produces ordered, testable results.

A participant is eligible only when:

1. They have covered all required categories:
   - `LEARN`
   - `BUILD`
   - `SHARE`
2. Their total activity points are at least `6`.

The solution is intentionally local-only. No backend, account system, database, payment flow, event registration, scheduling, or certificate generation is included.

---

# 2. Design Goals

Before selecting technologies, I prioritized the following:

| Priority | Reason |
|---|---|
| Correctness | Eligibility and validation behavior are strictly defined |
| Explainability | The system should show exactly why a participant is eligible or ineligible |
| Testability | Acceptance criteria include specific edge cases and exact outputs |
| Live Modification | The interviewer may request a small requirement change during the interview |
| Maintainability | Business logic should not be coupled to the UI |
| Simplicity | Avoid introducing frameworks or infrastructure that do not solve a real problem |

### Main Design Principle

> Build the simplest architecture that satisfies the requirements while remaining modular, testable, explainable, and easy to modify live.

---

# 3. Final Technology Stack

| Area | Technology | Why |
|---|---|---|
| UI | HTML5 | Single-screen application with no routing requirement |
| Styling | CSS3 | Full control over a polished interface without UI framework overhead |
| Application Logic | Vanilla JavaScript ES6+ | Lightweight, understandable, and easy to modify live |
| Build Tool | Vite | Modern development server, ES modules, fast refresh, production build |
| Testing | Vitest | Lightweight automated testing with good Vite integration |
| Code Quality | ESLint | Detects common JavaScript problems and enforces consistency |
| Contracts / Documentation | JSDoc | Documents data structures and function contracts without TypeScript |
| Data Storage | In-memory JavaScript objects | Matches the local-only problem requirement |
| Activity Lookup | `Map` | Fast and clear lookup by activity ID |
| Category Tracking | `Set` | Naturally represents unique category coverage |
| Version Control | Git | Preserves implementation progression and changes |
| AI Assistance | AI coding assistant | Used for planning, design review, code support, and test generation |

---

# 4. Technologies Considered but Not Selected

## React

React was considered because it provides:

- Component-based UI development
- State management
- Declarative rendering
- Strong ecosystem support

However, this application contains:

- One main screen
- No routing
- No remote API state
- No authentication
- No complex shared state
- No large component hierarchy

For this scope, React would add an additional abstraction layer without solving a major requirement.

### Decision

**Deferred React.**

### Interview Explanation

> I considered React, but the application is a single-screen local-data application with relatively simple state. I decided the framework overhead was not justified. Instead, I kept the domain, validation, and presentation logic modular so the application remains maintainable without depending on a framework.

---

## TypeScript

TypeScript was considered for:

- Compile-time type checking
- Explicit interfaces
- Safer domain models

For the current scope, JavaScript with JSDoc provides enough clarity while keeping live modification simple.

Example:

```js
/**
 * @typedef {Object} Activity
 * @property {string} id
 * @property {string} name
 * @property {"LEARN"|"BUILD"|"SHARE"} category
 * @property {number} points
 */
```

### Decision

**Deferred TypeScript.**

### Interview Explanation

> TypeScript would be a reasonable choice for a larger application. For this compact problem, I preferred JavaScript because rapid live modification is important. I still documented domain contracts through JSDoc so inputs and outputs remain explicit.

---

## Backend / Database

Not selected because:

- Records are evaluated locally.
- There is no persistence requirement.
- There is no authentication.
- There are no external APIs.
- A server would increase complexity without improving the required solution.

### Decision

**No Express, Node API, MongoDB, PostgreSQL, or cloud database.**

---

# 5. System Architecture

The application is divided into clear layers.

```text
                    User Input
                        |
                        v
                  Input Parsing
                        |
                        v
                 Validation Layer
                   /         \
              Invalid        Valid
                 |              |
                 v              v
         Validation Error   Evaluation Engine
                                |
                                v
                        Explainable Result
                                |
                                v
                         Rendering Layer
```

### Important Rule

> The UI does not determine eligibility.

The UI only renders output produced by the domain evaluation layer.

This keeps business logic independent from presentation logic.

---

# 6. Proposed Project Structure

```text
certificate-eligibility-board/
|
|-- index.html
|
|-- src/
|   |
|   |-- data/
|   |   `-- sampleData.js
|   |
|   |-- domain/
|   |   |-- parser.js
|   |   |-- validation.js
|   |   `-- evaluator.js
|   |
|   |-- ui/
|   |   |-- participantTable.js
|   |   |-- resultTable.js
|   |   |-- categoryProgress.js
|   |   `-- validationPanel.js
|   |
|   |-- constants.js
|   |-- main.js
|   `-- styles.css
|
|-- tests/
|   |-- validation.test.js
|   `-- evaluator.test.js
|
|-- package.json
`-- README.md
```

---

# 7. Core Data Structures

## Activity

```js
{
    id: "A01",
    name: "Emerging Tech Talk",
    category: "LEARN",
    points: 2
}
```

## Participant Input

```js
{
    id: "C01",
    name: "Asha",
    completedActivities: "A01, A02, A03"
}
```

The activity input is stored as text initially because this allows the UI to represent:

- Normal activity lists
- Unknown activity IDs
- Duplicate activity IDs

Example:

```text
A01, A02, A03, A01
```

This makes duplicate-participation validation demonstrable from the interface.

---

# 8. Main Architectural Complexity
## Configuration-Driven Eligibility Engine

Instead of hardcoding the eligibility requirements throughout the application, the policy is represented once:

```js
export const ELIGIBILITY_POLICY = {
    minimumPoints: 6,

    requiredCategories: [
        "LEARN",
        "BUILD",
        "SHARE"
    ]
};
```

The evaluator receives the policy rather than embedding the values directly.

```js
evaluateParticipant(
    participant,
    activityMap,
    ELIGIBILITY_POLICY
);
```

---

# 9. Why the Eligibility Policy Is Configuration-Driven

## 9.1 Single Source of Truth

The following all depend on the same policy:

- Eligibility evaluation
- Category progress
- Point progress
- Failure reasons
- Tests
- UI threshold display

This prevents the UI and business logic from becoming inconsistent.

---

## 9.2 Easier Live Modification

If the interviewer asks:

> Change the minimum eligibility threshold from 6 points to 8 points.

Only the policy needs to change:

```js
minimumPoints: 8
```

The evaluator itself does not need to be rewritten.

---

## 9.3 Extensibility

If a new required category is introduced:

```js
requiredCategories: [
    "LEARN",
    "BUILD",
    "SHARE",
    "VOLUNTEER"
]
```

the evaluator can process it using the same algorithm.

---

## 9.4 Avoiding Overengineering

I intentionally did **not** introduce:

- Rule factories
- Strategy classes
- Abstract interfaces
- Generic rule-engine libraries

For only two eligibility conditions, that would be unnecessary complexity.

The selected approach is:

```text
Small configuration object
          +
Pure evaluation function
```

---

# 10. Explainable Evaluation

The evaluator should not return only:

```js
eligible: false
```

Instead, it returns the complete derived state.

Example:

```js
{
    participantId: "C05",

    totalPoints: 4,

    coveredCategories: [
        "LEARN",
        "SHARE"
    ],

    missingCategories: [
        "BUILD"
    ],

    meetsPointThreshold: false,

    eligible: false,

    reasons: [
        "MISSING_CATEGORY: BUILD",
        "POINTS_BELOW_6"
    ]
}
```

### Why

This provides:

- Better debugging
- Better testability
- Clear UI rendering
- Exact failure-reason support
- Easier explanation during the interview

### Design Principle

> The evaluator produces an explainable decision rather than only a boolean result.

---

# 11. Validation Layer

Validation is handled before evaluation.

The system checks:

- Empty participant ID
- Empty participant name
- Duplicate participant IDs
- Unknown activity IDs
- Duplicate activity participation

Supported validation codes:

```text
INVALID_PARTICIPANT
DUPLICATE_PARTICIPANT_ID
UNKNOWN_ACTIVITY
DUPLICATE_PARTICIPATION
```

If validation fails:

```text
Clear old result rows
Clear old summary counts
Display validation error
Stop evaluation
```

This prevents stale results from remaining visible after invalid input.

---

# 12. Evaluation Flow

```text
Evaluate Button
      |
      v
Read Participant Inputs
      |
      v
Parse Activity Tokens
      |
      v
Validate Inputs
      |
      +---------------------+
      |                     |
   Invalid                Valid
      |                     |
      v                     v
Clear Results          Evaluate Participants
Show Error                    |
                              v
                      Calculate Points
                              |
                              v
                    Derive Category Set
                              |
                              v
                    Evaluate All Rules
                              |
                              v
                  Generate Ordered Reasons
                              |
                              v
                      Sort Participants
                              |
                              v
                       Render Results
```

---

# 13. Result Ordering

Participants are displayed using two rules:

1. Eligible participants first
2. Ineligible participants second

Within each status:

```text
Participant ID ascending
```

Expected order for the built-in data:

```text
C01 - ELIGIBLE
C02 - ELIGIBLE
C03 - INELIGIBLE
C04 - INELIGIBLE
C05 - INELIGIBLE
```

---

# 14. Failure Reason Ordering

Missing categories must always be evaluated in this order:

```text
LEARN
BUILD
SHARE
```

The point condition is evaluated afterward.

For an empty activity list:

```text
MISSING_CATEGORY: LEARN
MISSING_CATEGORY: BUILD
MISSING_CATEGORY: SHARE
POINTS_BELOW_6
```

The evaluator evaluates all conditions rather than stopping after the first failure.

---

# 15. Testing Strategy

Automated testing is treated as a core part of the solution rather than an optional extra.

## Test 1 - Built-In Oracle

Expected points:

```text
C01 = 7
C02 = 6
C03 = 7
C04 = 7
C05 = 4
```

Expected summary:

```text
Eligible   = 2
Ineligible = 3
```

---

## Test 2 - Exact Point Boundary

Add `A04` to `C05`.

Expected:

```text
Points = 6
Categories = LEARN, BUILD, SHARE
Status = ELIGIBLE
```

Updated summary:

```text
Eligible   = 3
Ineligible = 2
```

---

## Test 3 - Empty Completion List

Clear all completed activities for `C01`.

Expected:

```text
Points = 0
```

Reasons:

```text
MISSING_CATEGORY: LEARN
MISSING_CATEGORY: BUILD
MISSING_CATEGORY: SHARE
POINTS_BELOW_6
```

---

## Test 4 - Duplicate Participation

Input:

```text
C01 -> A01, A02, A03, A01
```

Expected:

```text
DUPLICATE_PARTICIPATION
Participant: C01
Activity: A01
```

Old results and counts must be cleared.

---

## Test 5 - Unknown Activity

Input:

```text
C01 -> A01, A02, A99
```

Expected:

```text
UNKNOWN_ACTIVITY
Participant: C01
Activity: A99
```

---

## Test 6 - Duplicate Participant ID

Input:

```text
C01 - Asha
C01 - Bilal
```

Expected:

```text
DUPLICATE_PARTICIPANT_ID
```

---

## Test 7 - Failure Reason Ordering

Verify:

```js
expect(result.reasons).toEqual([
    "MISSING_CATEGORY: LEARN",
    "MISSING_CATEGORY: BUILD",
    "MISSING_CATEGORY: SHARE",
    "POINTS_BELOW_6"
]);
```

---

## Test 8 - Result Ordering

Verify:

```text
Eligible first
Ineligible second
ID ascending within each status
```

---

# 16. How AI Shaped the Design

AI was used as a **design partner**, not as an unquestioned code generator.

The workflow was:

```text
Problem Statement
      |
      v
Ask AI for Alternatives
      |
      v
Evaluate Suggestions
      |
      v
Challenge Complexity
      |
      v
Keep Useful Ideas
      |
      v
Reject Unnecessary Abstractions
      |
      v
Final Design
```

---

# 17. AI Decision Example 1
## Framework Selection

### Prompt

> Analyze this problem statement and compare Vanilla JavaScript, React + JavaScript, and React + TypeScript. Consider application complexity, testing, maintainability, live modification, and unnecessary dependencies.

### Initial Direction

A more framework-heavy solution such as:

```text
React
TypeScript
Vite
Vitest
```

was considered.

### Follow-Up Prompt

> This application contains one screen, local in-memory data, no routing, no backend, and no remote state. Re-evaluate whether React and TypeScript provide enough value to justify their complexity.

### Final Decision

```text
Vanilla JavaScript   SELECTED
Vite                 SELECTED
Vitest               SELECTED
JSDoc                SELECTED
ESLint                SELECTED

React                DEFERRED
TypeScript           DEFERRED
```

### What AI Changed

AI helped compare the alternatives.

The final engineering decision was made based on actual requirements rather than framework popularity.

---

# 18. AI Decision Example 2
## Eligibility Architecture

### Prompt

> Identify which parts of the eligibility specification are business-policy values that may change and which parts are stable application logic. Recommend a simple way to avoid hardcoding without overengineering the solution.

### Possible AI Recommendation

A more abstract design could include:

```text
Rule objects
Strategy pattern
Rule engine
Interfaces
```

### Final Decision

I kept the useful idea:

> Separate business policy from evaluation logic.

But rejected the unnecessary abstraction.

Final design:

```text
Configuration object
       +
Pure evaluator
```

### Why

The system currently contains only:

- Required-category rule
- Minimum-point rule

A full rule framework would make the project harder to understand and modify.

---

# 19. AI Decision Example 3
## Testing

### Prompt

> Convert the acceptance criteria into deterministic automated test cases. Include the built-in oracle, exact point boundary, empty completion list, duplicate participation, duplicate participant IDs, unknown activity, failure-reason ordering, and participant ordering.

AI helps enumerate edge cases, after which the tests are manually reviewed against the original specification.

---

# 20. AI Usage Philosophy

The goal was not:

> Ask AI to build the entire project.

The approach was:

```text
AI proposes
     |
     v
I review
     |
     v
I challenge assumptions
     |
     v
I simplify where necessary
     |
     v
I test the final decision
```

### Key Principle

> AI influenced the implementation, but engineering decisions remained requirement-driven.

---

# 21. What I Prioritized

| Priority | Design Decision |
|---|---|
| Correctness | Pure evaluation functions |
| Validation | Dedicated validation layer |
| Explainability | Complete evaluation result rather than a boolean |
| Live Modification | Configuration-driven eligibility policy |
| Testability | Vitest acceptance tests |
| Maintainability | ES modules and separated responsibilities |
| Synchronization | UI consumes the same derived evaluation data |
| Developer Experience | Vite |
| Code Quality | ESLint |
| Documentation | JSDoc |
| Understandability | Avoid unfamiliar or unnecessary abstractions |

---

# 22. What I Deferred

| Deferred Feature / Technology | Reason |
|---|---|
| React | Single-screen UI does not justify framework overhead |
| TypeScript | JSDoc is sufficient for the current domain size |
| Express / Backend API | All processing is local |
| Database | No persistence requirement |
| Authentication | Outside the requested scope |
| Certificate Generation | Outside the requested scope |
| Registration / Payments | Outside the requested scope |
| Scheduling | Outside the requested scope |
| Redux / Zustand | No complex global application state |
| Generic Rule Engine | Too complex for two eligibility conditions |
| Cloud Infrastructure | Not required for local interview demonstration |

---

# 23. Intentional vs Accidental Complexity

A major design goal was to avoid **accidental complexity**.

## Complexity Intentionally Avoided

```text
React
TypeScript
Backend
Database
Redux
Generic rule-engine framework
```

## Complexity Intentionally Added

```text
Validation layer
Configuration-driven policy
Explainable result model
Automated tests
Modular architecture
```

### Design Principle

> Complexity should exist only where it improves correctness, extensibility, testability, or maintainability.

---

# 24. Implementation Plan

## Step 1 - Model the Domain and Validation Rules

Implement:

```text
Fixed activity data
Participant structure
Eligibility policy
Activity parsing
Input validation
```

### Checkpoint

All invalid input scenarios produce the required validation errors.

---

## Step 2 - Implement the Evaluation Engine

Implement:

```text
Activity lookup
Point aggregation
Category tracking
Missing-category calculation
Point-threshold evaluation
Eligibility decision
Failure-reason ordering
Participant ordering
```

### Checkpoint

Built-in data produces:

```text
Points: 7, 6, 7, 7, 4

Eligible:   2
Ineligible: 3
```

---

## Step 3 - Build the User Interface

Implement:

```text
Activity table
Participant editor
Evaluate action
Reset action
Validation area
Category progress
Point progress
Summary counts
Results table
```

### Checkpoint

Every acceptance scenario can be demonstrated through the UI.

---

## Step 4 - Testing and Interview Preparation

Implement:

```text
Unit tests
Acceptance tests
ESLint
README / Documentation
AI prompt log
Screenshots / test output
```

### Checkpoint

All acceptance tests pass and the application is ready for live modification.

---

# 25. Live Modification Strategy

The application is intentionally designed to make likely interview changes small.

## Example: Change Minimum Points

Current:

```js
minimumPoints: 6
```

Modified:

```js
minimumPoints: 8
```

Then:

1. Update the relevant test expectation.
2. Run the test suite.
3. Demonstrate the changed output.

---

## Example: Add a Required Category

Current:

```js
requiredCategories: [
    "LEARN",
    "BUILD",
    "SHARE"
]
```

Modified:

```js
requiredCategories: [
    "LEARN",
    "BUILD",
    "SHARE",
    "VOLUNTEER"
]
```

The evaluator does not need a new hardcoded category check.

---

# 26. Design Evolution

The architecture evolved during design review.

```text
Initial Idea
React + TypeScript
       |
       v
Requirement Analysis
       |
       v
Question Framework Complexity
       |
       v
Vanilla JS + Modular Architecture
       |
       v
AI Suggests Rule Abstraction
       |
       v
Reject Full Rule Engine
       |
       v
Configuration-Driven Policy
       |
       v
Explainable Evaluation
       |
       v
Automated Acceptance Tests
       |
       v
Final Design
```

This evolution demonstrates that AI recommendations were evaluated rather than accepted automatically.

---

# 27. Final Design Summary

The final application uses:

```text
HTML5
CSS3
Vanilla JavaScript ES6+
Vite
Vitest
ESLint
JSDoc
Git
```

with:

```text
In-memory data
        |
        v
Parser
        |
        v
Validation Layer
        |
        v
Configuration-Driven Eligibility Engine
        |
        v
Explainable Evaluation Result
        |
        v
Presentation Layer
```

The design intentionally avoids framework and infrastructure complexity while investing in:

- Correctness
- Validation
- Explainability
- Automated testing
- Maintainability
- Live modification capability

---

# 28. Interview-Ready Design Explanation

A concise explanation:

> I started by prioritizing correctness, testability, explainability, and live modification because those were central to the problem. I initially considered React and TypeScript, but after reviewing the actual application scope with AI, I decided they added more abstraction than value for a single-screen local-data application.
>
> I therefore chose vanilla JavaScript with Vite, Vitest, ESLint, and JSDoc. I still kept the application modular by separating parsing, validation, evaluation, and presentation.
>
> The main architectural decision was to make eligibility configuration-driven. The point threshold and required categories exist in one policy object rather than being hardcoded throughout the application. The evaluator produces an explainable result containing points, covered categories, missing categories, eligibility status, and ordered failure reasons.
>
> AI helped me explore alternatives and identify useful abstractions, but I did not accept every suggestion. For example, a generic rule engine would have been unnecessary for only two eligibility requirements, so I kept the useful idea of separating policy from logic while implementing it as a small configuration object and a pure function.
>
> I intentionally deferred React, TypeScript, backend services, persistence, and other infrastructure because they were not required for the current scope. Instead, I invested complexity in validation, automated testing, and an architecture that makes requirement changes safe and easy to demonstrate live.

---

# 29. Key Takeaway

> **Simple technology, disciplined architecture.**

The solution is intentionally not framework-heavy.

The engineering value comes from:

- Clear separation of responsibilities
- Configuration-driven business rules
- Explainable decisions
- Strict validation
- Automated acceptance testing
- Requirement-driven AI usage
- Easy live modification

