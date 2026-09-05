# Cisco Certificate Eligibility Board
## Iterative Development, AI Collaboration, Design Decisions, and Testing Record

---

## Purpose of This Document

This document records how the **College Event Certificate Eligibility Board** was designed and implemented using an iterative AI-assisted development process.

The goal was not to ask AI to generate a complete application in one step. Instead, the project was deliberately developed through small, reviewable iterations. Each iteration introduced one responsibility, validated it, and then refined it before moving on.

This document focuses on the work completed up to the current checkpoint:

- project setup and removal of unnecessary starter code
- fixed activity and participant data
- parsing participant input
- validating participant input
- testing validation behavior
- implementing the eligibility evaluator
- testing eligibility rules and edge cases
- refining the evaluator implementation
- implementing reset behavior
- integrating the domain logic with a simple one-page UI
- adding editable participant inputs
- adding participant rows
- deleting participant rows
- displaying eligible and ineligible counts
- displaying category progress
- displaying point progress

The document is organized around the evaluation criteria provided for the interview.

---

# 1. Planning and Solution Presentation

## 1.1 Initial Goal

The application is a local, single-page **Certificate Eligibility Board** for a college event.

The application must:

- display a fixed list of activities
- allow participant records to be edited
- allow participant rows to be added or removed
- parse completed activity IDs entered as text
- validate invalid participant data
- calculate participant points
- determine category coverage
- determine certificate eligibility
- explain why a participant is ineligible
- show eligible and ineligible counts
- show point and category progress
- support Evaluate and Reset actions

A participant is eligible only if both of the following are true:

1. The participant has completed at least one activity from each required category:
   - `LEARN`
   - `BUILD`
   - `SHARE`
2. The participant has at least `6` total points.

The implementation was intentionally kept local-only. No backend, authentication, database, cloud service, or persistence layer was introduced because none of those were required by the problem.

---

## 1.2 Original Implementation Plan

The project was initially divided into four main steps.

### Step 1 — Domain Data, Parsing, and Validation

Implement:

- activity data
- participant sample data
- eligibility policy configuration
- participant input parsing
- participant validation

Expected checkpoint:

- empty participant IDs are rejected
- empty participant names are rejected
- duplicate participant IDs are rejected
- unknown activity IDs are rejected
- duplicate activity participation is rejected
- empty completed-activity lists are allowed

---

### Step 2 — Eligibility Evaluation

Implement:

- activity lookup
- point aggregation
- category tracking
- missing-category detection
- minimum-point threshold evaluation
- eligibility decision
- failure reason generation
- deterministic result ordering

Expected built-in output:

```text
C01 = 7 points = ELIGIBLE
C02 = 6 points = ELIGIBLE
C03 = 7 points = INELIGIBLE
C04 = 7 points = INELIGIBLE
C05 = 4 points = INELIGIBLE
```

Expected summary:

```text
Eligible   = 2
Ineligible = 3
```

---

### Step 3 — Reset and Minimal User Interface

Implement:

- fixed activity table
- editable participant table
- Evaluate button
- Reset button
- validation display
- result table

The UI would consume the domain-layer output rather than reimplementing eligibility logic.

---

### Step 4 — UI Refinement

Add:

- add participant row
- delete participant row
- eligible count
- ineligible count
- category progress
- point progress
- later visual polish

---

## 1.3 How the Actual Work Followed and Changed the Plan

The overall plan remained stable, but the implementation order was refined as the project evolved.

### Change 1 — Starter Project Was Simplified Before Any Feature Work

After creating the Vite project, the generated starter code contained demo assets, logos, counter logic, and starter styling.

Instead of continuing with that structure, the project was deliberately cleaned first.

The initial user prompt was:

> “i just ran the initial 4 commands and already there is much bloat in my project i want to make a simple project how do i fix this”

This caused the implementation plan to temporarily pause feature work and first remove accidental complexity.

The following starter content was removed:

```text
src/assets/
src/counter.js
public/
Vite demo markup
Vite demo CSS
```

The project was reduced to a minimal starting point:

```text
src/
├── main.js
└── style.css

index.html
package.json
package-lock.json
.gitignore
```

This decision made later work easier to explain because every file added after that point existed for an actual project requirement.

---

### Change 2 — The Architecture Was Introduced Gradually

Instead of pre-creating every possible folder and UI module, files were added only when a responsibility existed.

Iteration 1 added:

```text
src/data/sampleData.js
src/domain/parser.js
src/domain/validation.js
src/constants.js
tests/validation.test.js
```

Iteration 2 later added:

```text
src/domain/evaluator.js
tests/evaluator.test.js
```

This kept the implementation small and prevented architecture from becoming more complex than the actual problem.

---

### Change 3 — Reset Was Implemented Before UI Expansion

After evaluation logic was complete, the user explicitly changed the next implementation order:

> “Okay, now we have hit a meaningful checkpoint. We have implemented the evaluation logic for different participants, and we have also tested that evaluation logic using our sample input data and also empty participation lists as well. So now I think we should first implement the reset logic, and then we can integrate all of that into a simplified UI at a one-page HTML page.”

Instead of immediately building the complete UI, reset behavior was implemented first using a fresh copy of the initial participant data.

This allowed the UI to be built around deterministic state restoration from the beginning.

---

### Change 4 — Participant Management Was Simplified During Iteration

The initial AI-assisted UI suggestion placed a Delete button on every row.

The user rejected that interface design and simplified it:

> “I don't think we need to add delete column of participant table functionality. I think we should only add a participant row and delete a participant row. Yes. Let's do that.”

The resulting UI used two controls outside the table:

```text
Add Participant Row
Delete Participant Row
```

The table remained focused on only three fields:

```text
Participant ID | Name | Completed Activities
```

This is an important example where AI proposed one implementation but the user made the final product decision.

---

## 1.4 Current Implementation Flow

The application now follows this flow:

```text
User edits participant rows
        |
        v
currentParticipants
        |
        v
parseParticipant()
        |
        v
validateParticipants()
        |
   +----+----+
   |         |
Invalid     Valid
   |         |
   v         v
Show       evaluateParticipants()
errors          |
                v
         Explainable results
                |
       +--------+--------+
       |        |        |
       v        v        v
     Counts   Progress  Result rows
```

Reset uses a separate simple path:

```text
Reset
  |
  v
getInitialParticipants()
  |
  v
render()
```

---

# 2. AI Prompting Strategy

## 2.1 Prompting Philosophy

The project deliberately avoided prompts such as:

```text
"Build the entire application."
```

Instead, prompts were scoped to one technical responsibility at a time.

The approach was:

```text
Requirement
   |
   v
Small implementation prompt
   |
   v
Review generated direction
   |
   v
Question complexity or behavior
   |
   v
Refinement prompt
   |
   v
Tests / manual verification
   |
   v
Next iteration
```

This made AI assistance easier to verify and ensured that implementation decisions stayed understandable.

---

## 2.2 Prompt — Start Iterative Refinement

After architecture selection, the user explicitly established the development style:

> “ok now that the architecture of the project is finalized now we can start the project with iterative refinement”

This prompt changed the interaction from architecture discussion into incremental implementation.

The implementation was therefore split into:

1. scaffold cleanup
2. parsing and validation
3. evaluation
4. evaluator refinement
5. reset
6. minimal UI
7. participant-row controls
8. count and progress display

---

## 2.3 Prompt — Remove Project Bloat

User prompt:

> “i just ran the initial 4 commands and already there is much bloat in my project i want to make a simple project how do i fix this”

### AI recommendation

The AI identified most of the visible complexity as default Vite demo content and suggested removing:

- demo assets
- demo counter code
- demo markup
- unnecessary public assets

### User influence

The user had already established that simplicity was a major design goal. This prompt forced the generated implementation to match that principle in practice rather than only in documentation.

### Result

The project started from a very small codebase instead of building features on top of boilerplate.

---

## 2.4 Prompt — Iteration 1 Must Stay Simple

User prompt:

> “ok let's start with iteration 1 remember to keep it simple”

This prompt placed an explicit constraint on the AI-generated implementation.

### Scope produced from this constraint

Only the following were implemented:

```text
fixed data
parsing
validation
```

The following were intentionally excluded:

```text
eligibility evaluation
UI architecture
classes
validation libraries
schema frameworks
backend logic
```

### Technical implementation generated

The parser used only basic string operations:

```js
.trim()
.split(",")
.map(...)
.filter(...)
```

Validation used arrays, loops, and `Set`.

No validation framework was introduced.

---

## 2.5 Prompt — Investigating Why Tests Did Not Run

After Iteration 1, the user ran:

```bash
npm test
```

and Vitest reported:

```text
No test files found
```

User prompt:

> “why is npm test not working”

### AI analysis

The test file had been named:

```text
validationTests.js
```

Vitest's default discovery pattern expected names such as:

```text
*.test.js
*.spec.js
```

### Fix

The file was renamed to:

```text
validation.test.js
```

No custom Vitest configuration was introduced.

### Why this was important

Instead of solving a small naming issue by adding configuration complexity, the project followed the tool's default convention.

---

## 2.6 Prompt — Questioning `toContainEqual()`

User prompt:

> “Okay, now the validation of the input and the parsing of the input data is done and the tests are passing. I have also added the test for checking if the participant ID is empty. Can you check here if you are doing expect errors dot equals to contain equals, but our errors can contain multiple objects, right? So how are we handling that? And let's also start with the next phase of our project.”

### Discussion created by this prompt

The AI explained that:

```js
expect(errors).toContainEqual(expectedObject)
```

means that at least one object in the array must deeply equal the expected object.

This is different from:

```js
expect(errors).toEqual([...])
```

which requires the entire array to match exactly.

### User influence

The user's question exposed a weakness in the initial tests: a test could pass even if the correct error existed alongside an unexpected error.

### Refinement

Tests were strengthened with:

```js
expect(errors).toHaveLength(1);
```

followed by:

```js
expect(errors).toContainEqual(...);
```

This verified both:

- the expected error exists
- no unexpected extra error was produced

This was a direct example of the user reviewing AI-generated testing logic rather than accepting it automatically.

---

## 2.7 Prompt — Start Eligibility Evaluation

The same checkpoint transitioned the project into the next phase.

The evaluator was kept as a pure function conceptually:

```js
evaluateParticipant(participant, activityMap, policy)
```

It returned a complete result rather than only a boolean:

```js
{
  participantId,
  totalPoints,
  coveredCategories,
  missingCategories,
  meetsPointThreshold,
  eligible,
  reasons
}
```

This structure made evaluation explainable and directly usable by the UI.

---

## 2.8 Prompt — Refine the Evaluator

User prompt:

> “ok let's do this refinement”

This followed a review observation that the initial evaluator created an activity `Map` separately for every participant.

### Initial implementation

Conceptually:

```text
C01 -> create activity Map
C02 -> create activity Map
C03 -> create activity Map
C04 -> create activity Map
C05 -> create activity Map
```

### Refined implementation

The lookup was moved to the batch evaluator:

```text
activities
   |
   v
create Map once
   |
   +--> evaluate C01
   +--> evaluate C02
   +--> evaluate C03
   +--> evaluate C04
   +--> evaluate C05
```

### Why this refinement was accepted

It removed repeated work without adding a new abstraction.

The project did **not** introduce classes such as:

```text
ActivityRepository
LookupService
EvaluationContext
```

because those would have made a four-activity problem harder to understand.

---

## 2.9 Prompt — Prioritize Reset Before UI

User prompt:

> “Okay, now we have hit a meaningful checkpoint. We have implemented the evaluation logic for different participants, and we have also tested that evaluation logic using our sample input data and also empty participation lists as well. So now I think we should first implement the reset logic, and then we can integrate all of that into a simplified UI at a one-page HTML page.”

### Effect on implementation

The next step became state restoration instead of visual design.

A helper returned a fresh copy of the built-in participants:

```js
getInitialParticipants()
```

The reset handler then remained extremely small:

```js
function handleReset() {
  currentParticipants = getInitialParticipants();
  render();
}
```

This ensured that reset behavior also cleared old results and errors because the page was rendered again from clean state.

---

## 2.10 Prompt — Add and Delete Participants

User prompt:

> “Okay, this works, but we need to have the option to add a new participant. In Participant ID, currently I can edit the participant IDs and names and completed activities, but I yet cannot add a new participant or delete an existing participant. Add that functionality.”

### Initial AI recommendation

The first implementation suggestion added a Delete control to each participant row.

### User correction

The user then refined the requirement:

> “I don't think we need to add delete column of participant table functionality. I think we should only add a participant row and delete a participant row. Yes. Let's do that.”

### Final design

The UI used two simple actions:

```text
Add Participant Row
Delete Participant Row
```

The table itself stayed simple.

The handlers were implemented using basic array operations:

```js
currentParticipants.push(...)
```

and:

```js
currentParticipants.pop()
```

This avoided per-row delete state, per-row event handling, or additional identifiers.

---

## 2.11 Prompt — Add Counts and Progress While Staying Clean

User prompt:

> “Okay, now our UI works with add participant row, delete participant row, and we can edit the input for participants. Okay, so now we can move on to eligible count, ineligible count, and category progress, point progress. remember to keep the implementation clean and simple”

### Effect on AI output

No new domain module was introduced.

The UI derived display-only values from existing evaluator results:

```js
result.eligible
result.coveredCategories
result.totalPoints
```

and policy values:

```js
ELIGIBILITY_POLICY.requiredCategories
ELIGIBILITY_POLICY.minimumPoints
```

The browser-native `<progress>` element was used instead of building a custom progress component.

This preserved the distinction between:

```text
Business logic -> evaluator
Display logic  -> UI
```

---

# 3. Design Constraints and Technology Choices

## 3.1 Primary Constraints Given to AI

Throughout the project, the following constraints were repeatedly reinforced:

- keep the project simple
- do not introduce unnecessary frameworks
- avoid overengineering
- keep business logic independent of UI
- use small functions
- make the implementation easy to explain in an interview
- make changes easy to demonstrate live
- use automated tests for important rules
- preserve deterministic behavior
- prefer standard JavaScript and browser features when sufficient

---

## 3.2 Technology Stack

The selected stack is:

| Area | Technology | Reason |
|---|---|---|
| UI | HTML5 | Single-screen application |
| Styling | CSS3 | No UI framework needed |
| Logic | Vanilla JavaScript ES6+ | Simple and easy to explain |
| Build Tool | Vite | Minimal modern development environment |
| Testing | Vitest | Small, fast, and integrates naturally with Vite |
| Code Structure | ES modules | Separates responsibilities without framework overhead |
| Data | In-memory JavaScript objects | No persistence requirement |
| Lookup | `Map` | Direct activity ID lookup |
| Unique values | `Set` | Natural duplicate/category detection |

---

## 3.3 Why React Was Not Used

React was considered earlier in the design process.

It was rejected because the application has:

- one page
- no routing
- no backend state
- no remote API state
- no authentication
- no complex component hierarchy

Using React would have introduced additional concepts such as:

```text
components
props
hooks
state synchronization
build conventions
```

without solving a requirement that could not be solved simply with browser APIs.

The user also wanted to be able to explain every line of the solution during an interview, making Vanilla JavaScript a better fit.

---

## 3.4 Why TypeScript Was Not Used

TypeScript was also considered.

The application domain is small and the user is more comfortable with JavaScript.

For a larger production application, TypeScript would improve compile-time safety. For this problem, however, it would increase live-editing overhead without significantly improving correctness.

The project therefore prioritized:

```text
JavaScript + clear function contracts + tests
```

over introducing a language layer the user was less comfortable modifying live.

---

## 3.5 Why No Backend or Database Was Added

All evaluation occurs locally.

The problem does not require:

- user accounts
- persistence
- server-side processing
- external APIs
- authentication
- concurrent data access

Therefore Express, MongoDB, PostgreSQL, Firebase, and cloud infrastructure were deliberately excluded.

This is an example of requirement-driven architecture rather than technology-driven architecture.

---

## 3.6 Configuration-Driven Eligibility Policy

One deliberate architectural feature was retained despite the otherwise minimal design.

Eligibility policy is stored separately:

```js
export const ELIGIBILITY_POLICY = {
  minimumPoints: 6,
  requiredCategories: ["LEARN", "BUILD", "SHARE"],
};
```

This means the evaluator does not contain hardcoded checks such as:

```js
if (points >= 6 && hasLearn && hasBuild && hasShare)
```

Instead, it reads the policy values.

This supports live interview modifications such as:

```js
minimumPoints: 8
```

without rewriting the evaluator algorithm.

---

## 3.7 Why a Generic Rule Engine Was Rejected

AI-assisted architecture discussion identified that business policy should be separated from evaluation logic.

A more elaborate implementation could have introduced:

- rule objects
- strategy classes
- abstract interfaces
- rule factories
- generic rule-engine libraries

Those approaches were rejected because the system has only two current eligibility rules:

1. category coverage
2. minimum points

The final design kept the useful abstraction:

```text
Policy configuration + pure evaluator
```

without introducing a generic rule framework.

---

## 3.8 Why Parsing Is Separate From Validation

Participant activity input begins as user-entered text:

```text
A01, A02, A03
```

The parser converts it into:

```js
["A01", "A02", "A03"]
```

This keeps validation focused on semantic questions such as:

- Is the participant ID missing?
- Is an activity unknown?
- Is the same activity repeated?

rather than string cleanup.

This separation also allows the same evaluator to operate on already-structured data.

---

## 3.9 Why `Set` Was Used

`Set` is used for uniqueness-related behavior.

### Duplicate participant IDs

```text
seenParticipantIds
```

allows the validator to detect when the same participant ID appears more than once.

### Duplicate activity participation

```text
seenActivities
```

allows the validator to detect repeated activity IDs for one participant.

### Covered categories

```text
coveredCategories
```

naturally stores unique categories without manual duplicate checks.

This is simpler than repeatedly searching arrays.

---

## 3.10 Why `Map` Was Used

Activities are keyed by IDs such as:

```text
A01
A02
A03
A04
```

The activity lookup therefore maps IDs directly to activity objects:

```js
activityMap.get("A02")
```

Although `.find()` would also be sufficient for only four activities, `Map` communicates the lookup intent more clearly and remains efficient if the activity list expands.

During refinement, the `Map` was moved outside the individual participant evaluator so it is created once for the batch rather than once per participant.

---

## 3.11 Why Native `<progress>` Was Used

When point and category progress were added, a custom progress component was unnecessary.

HTML already provides:

```html
<progress value="2" max="3"></progress>
```

Using the native element reduced:

- custom CSS
- custom rendering logic
- accessibility work
- extra JavaScript

This is consistent with the project's general principle of using browser capabilities before adding abstractions.

---

# 4. AI-Influenced Decision Making

## 4.1 AI as a Design Partner Rather Than Final Authority

AI influenced the project by:

- proposing possible structures
- identifying edge cases
- suggesting test patterns
- explaining standard library behavior
- reviewing repeated work
- suggesting UI implementation options

However, several AI suggestions were explicitly changed or rejected by the user.

This is important because the final implementation was not simply generated from one AI response.

---

## 4.2 Decision Example — Simplifying the Vite Project

### AI-related situation

The default Vite project provided a functional starter application.

### User decision

The user considered it too bloated for the interview project.

### Final choice

Remove demo-specific files and start with a minimal application shell.

### Trade-off

The project loses example code and default visual styling, but gains:

- easier code ownership
- clearer Git history
- less irrelevant code
- easier interview explanation

---

## 4.3 Decision Example — Avoid Pre-Creating UI Modules

An early architecture document proposed files such as:

```text
participantTable.js
resultTable.js
categoryProgress.js
validationPanel.js
```

During implementation, these were deliberately not created immediately.

The reason was that `main.js` was still small enough to understand easily.

The user wanted implementation simplicity, so modules would be extracted only after real complexity justified them.

This demonstrates that the design document was treated as a guide rather than a rigid requirement.

---

## 4.4 Decision Example — Structured Validation Errors

Instead of returning only:

```js
false
```

or throwing generic exceptions, validation returns structured errors such as:

```js
{
  code: "UNKNOWN_ACTIVITY",
  participant: "C01",
  value: "A99"
}
```

This AI-influenced recommendation was retained because it directly supports:

- deterministic tests
- useful UI messages
- debugging
- exact failure reporting

The structure remained small and did not become a class hierarchy.

---

## 4.5 Decision Example — Strengthening `toContainEqual()` Tests

The original test pattern checked:

```js
expect(errors).toContainEqual(expectedError);
```

The user challenged this because `errors` can contain multiple objects.

That observation led to stronger assertions:

```js
expect(errors).toHaveLength(1);
expect(errors).toContainEqual(expectedError);
```

This is a direct example of human review improving AI-assisted code.

The AI explained the matcher semantics, but the user's question drove the test refinement.

---

## 4.6 Decision Example — Reusing One Activity Map

The initial evaluator created a `Map` inside `evaluateParticipant()`.

AI review identified that this happened once for each participant.

The implementation was refined to create the lookup once in `evaluateParticipants()`.

The change was accepted because it:

- removed repeated work
- kept the code simple
- preserved testability
- did not introduce new abstractions

---

## 4.7 Decision Example — Evaluator Assumes Validated Input

The evaluator does not independently handle unknown activity IDs.

For example:

```js
const activity = activityMap.get(activityId);
```

assumes the ID is valid.

This is intentional because the application pipeline is:

```text
Parse -> Validate -> Evaluate
```

Duplicating unknown-activity checks inside the evaluator would mix responsibilities and create two sources of validation behavior.

This was a deliberate architectural decision rather than an omission.

---

## 4.8 Decision Example — Reset by Rebuilding State

Instead of manually restoring each input and clearing each output element individually, reset does:

```js
currentParticipants = getInitialParticipants();
render();
```

This is simpler because rendering from fresh state automatically resets:

- participant values
- validation output
- summary output
- result output

The trade-off is that the page section is rerendered, but for a small local application this is simpler and safer than maintaining many individual reset operations.

---

## 4.9 Decision Example — User Rejected Per-Row Delete Buttons

The AI initially suggested adding a Delete button to every participant row.

The user explicitly rejected that idea.

User refinement:

> “I don't think we need to add delete column of participant table functionality. I think we should only add a participant row and delete a participant row.”

The final implementation used:

```js
push()
pop()
```

This reduced:

- UI clutter
- event-handler complexity
- extra table columns
- per-row deletion logic

This is one of the clearest examples of AI influence without AI ownership of the final decision.

---

## 4.10 Decision Example — UI Does Not Recalculate Eligibility

When counts and progress were added, it would have been possible to write UI logic such as:

```js
if (points >= 6 && categoryCount === 3) {
  eligible = true;
}
```

This was deliberately avoided.

The UI reads:

```js
result.eligible
```

from the evaluator.

It also reads:

```js
result.totalPoints
result.coveredCategories
```

for display.

This preserves a single source of truth for business logic.

---

# 5. Testing and Validation

## 5.1 Testing Strategy

Testing was introduced before the UI.

The project first verified domain behavior independently from rendering.

This makes failures easier to locate:

```text
Parser failure
Validation failure
Evaluator failure
UI failure
```

rather than debugging all application behavior through browser output.

Vitest was used because it integrates directly with the Vite setup and requires very little additional configuration.

---

## 5.2 Test Discovery Issue and Resolution

The first test file was named:

```text
validationTests.js
```

Running:

```bash
npm test
```

produced:

```text
No test files found
```

The issue was not with the test implementation.

Vitest's default naming convention expects patterns such as:

```text
*.test.js
*.spec.js
```

The file was renamed to:

```text
validation.test.js
```

and tests then ran successfully.

This problem was fixed using standard convention instead of adding a custom test configuration.

---

## 5.3 Parsing Tests and Expected Behavior

Participant activity input is entered as text.

Example:

```text
 A01, A02, A03 
```

The parser produces:

```js
["A01", "A02", "A03"]
```

An empty completed activity input:

```text
""
```

produces:

```js
[]
```

This behavior is important because an empty activity list is valid input even though the participant will later be ineligible.

---

## 5.4 Built-In Validation Test

The initial participant dataset should produce no validation errors.

Expected:

```js
[]
```

This verifies that the application's provided starting data is internally consistent.

---

## 5.5 Empty Participant Name

Example input:

```js
{
  id: "C01",
  name: "   ",
  completedActivities: "A01"
}
```

After parsing, the name becomes empty.

Expected validation code:

```text
INVALID_PARTICIPANT
```

---

## 5.6 Empty Participant ID

The user independently added this test after Iteration 1.

Example:

```js
{
  id: "   ",
  name: "Asha",
  completedActivities: "A01"
}
```

Expected:

```text
INVALID_PARTICIPANT
```

This is important because participant identity is required for later duplicate checking and result ordering.

---

## 5.7 Duplicate Participation Test

Example:

```text
C01 -> A01, A02, A01
```

Expected structured error:

```js
{
  code: "DUPLICATE_PARTICIPATION",
  participant: "C01",
  value: "A01"
}
```

This verifies that an activity cannot be counted multiple times for the same participant.

---

## 5.8 Unknown Activity Test

Example:

```text
C01 -> A01, A99
```

Expected:

```js
{
  code: "UNKNOWN_ACTIVITY",
  participant: "C01",
  value: "A99"
}
```

This prevents the evaluator from receiving activity IDs that do not exist in the fixed activity table.

---

## 5.9 Duplicate Participant ID Test

Example:

```text
C01 - Asha
C01 - Bilal
```

Expected:

```text
DUPLICATE_PARTICIPANT_ID
```

This ensures that participant IDs remain unique even though the fields are editable.

---

## 5.10 Why Both `toContainEqual()` and `toHaveLength()` Are Used

For a structured error array:

```js
expect(errors).toContainEqual(expectedError);
```

verifies that the expected object appears somewhere in the returned errors.

However, this alone would also pass for:

```js
[
  expectedError,
  unexpectedError
]
```

Therefore tests expecting exactly one error were strengthened to:

```js
expect(errors).toHaveLength(1);
expect(errors).toContainEqual(expectedError);
```

This verifies both correctness and absence of extra errors.

---

## 5.11 Built-In Eligibility Oracle

The evaluator is tested against the fixed sample data.

Expected points:

```text
C01 = 7
C02 = 6
C03 = 7
C04 = 7
C05 = 4
```

Expected eligibility:

```text
C01 = ELIGIBLE
C02 = ELIGIBLE
C03 = INELIGIBLE
C04 = INELIGIBLE
C05 = INELIGIBLE
```

Expected totals:

```text
Eligible   = 2
Ineligible = 3
```

This serves as the primary known-answer test for the evaluation engine.

---

## 5.12 Exact Boundary Test

The minimum point requirement is:

```text
6
```

A participant with exactly six points and all required categories must be eligible.

Example:

```text
C05 -> A01, A03, A04
```

Points:

```text
A01 = 2
A03 = 2
A04 = 2
Total = 6
```

Categories:

```text
LEARN
SHARE
BUILD
```

Expected:

```text
ELIGIBLE
```

This test protects against accidentally implementing:

```js
points > 6
```

instead of:

```js
points >= 6
```

---

## 5.13 Empty Activity List Evaluation

Example:

```text
C01 -> ""
```

Expected total points:

```text
0
```

Expected ordered reasons:

```text
MISSING_CATEGORY: LEARN
MISSING_CATEGORY: BUILD
MISSING_CATEGORY: SHARE
POINTS_BELOW_6
```

This test is intentionally written with:

```js
toEqual([...])
```

rather than `toContainEqual()` because failure-reason ordering is part of the required behavior.

---

## 5.14 Failure Reason Ordering

Required category order is stored in policy as:

```js
["LEARN", "BUILD", "SHARE"]
```

The evaluator calculates missing categories using this same order.

Point failure is appended afterward.

This produces deterministic output and deterministic tests.

---

## 5.15 Result Ordering Test

Results must be shown with:

1. eligible participants first
2. ineligible participants second
3. participant ID ascending within each status

To make this test meaningful, the test input is deliberately scrambled before evaluation.

The expected final order remains:

```text
C01
C02
C03
C04
C05
```

This proves that ordering comes from the evaluator rather than coincidentally matching the original input order.

---

## 5.16 Configuration-Driven Threshold Test

A custom policy is tested:

```js
{
  minimumPoints: 8,
  requiredCategories: ["LEARN", "BUILD", "SHARE"]
}
```

A participant with all three categories but seven points should then produce:

```text
INELIGIBLE
POINTS_BELOW_8
```

This test proves that the number `6` is not secretly hardcoded inside the evaluator.

---

## 5.17 Reset Behavior Test

Reset uses a fresh copy of the original participant data.

A test modifies the returned copy:

```js
copy[0].name = "Changed";
```

and verifies that the source data still contains:

```text
Asha
```

This protects the built-in dataset from accidental mutation.

---

## 5.18 Manual UI Validation Performed / Planned at This Checkpoint

After connecting the domain layer to the one-page UI, the following manual scenarios were used as practical checks:

### Scenario 1 — Initial data

Verify all five built-in participants appear correctly.

### Scenario 2 — Editable participant fields

Change:

- participant ID
- participant name
- completed activity input

and verify evaluation uses the edited values.

### Scenario 3 — Invalid input

Enter an invalid activity such as:

```text
A99
```

and verify validation is displayed.

Old result rows and summary counts must be cleared so stale results are not visible.

### Scenario 4 — Reset

Make several edits and press Reset.

Expected:

```text
C01 Asha
C02 Bilal
C03 Chen
C04 Divya
C05 Eshan
```

are restored.

### Scenario 5 — Add participant row

Press:

```text
Add Participant Row
```

Expected:

A blank participant row is appended.

Existing validation automatically handles the row if Evaluate is pressed before required fields are filled.

### Scenario 6 — Delete participant row

Press:

```text
Delete Participant Row
```

Expected:

The final participant row is removed using `pop()`.

### Scenario 7 — Summary counts

For original data, expected UI summary:

```text
Eligible: 2
Ineligible: 3
```

### Scenario 8 — Category progress

Expected built-in category progress:

```text
C01 = 3 / 3
C02 = 3 / 3
C03 = 2 / 3
C04 = 2 / 3
C05 = 2 / 3
```

### Scenario 9 — Point progress

Expected:

```text
C01 = 7 / 6
C02 = 6 / 6
C03 = 7 / 6
C04 = 7 / 6
C05 = 4 / 6
```

The text displays the real score, while the visual progress bar is capped at the required threshold so values above six appear fully complete rather than exceeding the bar maximum.

---

# 6. Detailed Iteration Timeline

## Iteration 0 — Environment and Cleanup

### Goal

Create the development environment without carrying unnecessary Vite demo code into the project.

### User influence

The user explicitly objected to starter-project bloat.

### Result

A minimal Vite + JavaScript starting point.

---

## Iteration 1 — Parsing and Validation

### Goal

Convert editable participant input into structured data and reject invalid records before evaluation.

### Implemented

- fixed activity data
- built-in participant data
- policy configuration
- parser
- validation
- validation tests

### Important user instruction

> “remember to keep it simple”

### Complexity intentionally avoided

- classes
- schema libraries
- backend validation
- UI validation components

---

## Iteration 1 Refinement — Testing Semantics

### Trigger

The user questioned how `toContainEqual()` behaves when the errors array may contain multiple objects.

### Improvement

Tests now combine membership checks with expected array length when exactly one error should be returned.

---

## Iteration 2 — Evaluation Engine

### Goal

Calculate participant eligibility only after successful validation.

### Implemented

- activity lookup
- total points
- covered categories
- missing categories
- threshold check
- eligibility
- ordered failure reasons
- ordered participant results

### Important design

Evaluator returns an explainable object instead of only `true` or `false`.

---

## Iteration 2 Refinement — Activity Lookup and Test Strengthening

### Trigger

Review of repeated activity-map creation.

### Improvement

Create the `Map` once for batch evaluation and reuse it.

### Additional verification

Test a changed minimum-point policy to confirm configuration-driven behavior.

---

## Iteration 3 — Reset and Basic One-Page UI

### Goal

Connect the already-tested domain logic to an editable interface.

### Implemented

- fixed activity table
- editable participant fields
- Evaluate
- Reset
- validation output
- result output

### Design rule

UI does not determine eligibility.

---

## Iteration 3 Refinement — Participant Row Management

### Initial requirement

Add and delete participants.

### Initial AI suggestion

Delete button per row.

### User refinement

Use only:

```text
Add Participant Row
Delete Participant Row
```

### Final implementation

```js
push()
pop()
```

This was intentionally simpler than per-row deletion.

---

## Iteration 4 — Counts and Progress

### Goal

Display more of the already-derived evaluation state without changing business logic.

### Implemented / current target

- eligible count
- ineligible count
- category progress
- point progress

### Design rule

The UI consumes evaluator output instead of recreating eligibility rules.

---

# 7. Current Architecture at This Checkpoint

```text
certificate-eligibility-board/
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
|   |-- constants.js
|   |-- main.js
|   `-- style.css
|
|-- tests/
|   |-- validation.test.js
|   `-- evaluator.test.js
|
|-- index.html
|-- package.json
|-- package-lock.json
`-- .gitignore
```

The architecture remains intentionally compact.

---

# 8. Current End-to-End Technical Flow

```text
                    Browser UI
                        |
                        v
              currentParticipants
                        |
                        v
                 parseParticipant
                        |
                        v
               validateParticipants
                  /             \
                 /               \
             Invalid             Valid
                |                  |
                v                  v
        validation output   evaluateParticipants
                                   |
                                   v
                           evaluation results
                                   |
                     +-------------+-------------+
                     |             |             |
                     v             v             v
                result table     counts        progress
```

Reset remains independent:

```text
Reset button
    |
    v
getInitialParticipants()
    |
    v
render()
```

---

# 9. What Has Been Intentionally Deferred

The following are not currently needed and therefore remain deferred:

- React
- TypeScript
- Express
- database
- API server
- persistence
- authentication
- Redux or Zustand
- generic rule engine
- component framework
- design system
- custom progress-bar component
- cloud deployment architecture
- complex state management

UI visual polish is also intentionally delayed until behavior is fully correct.

---

# 10. Interview Explanation of the Process So Far

A concise but detailed explanation would be:

> I started with a small implementation plan: first parse and validate the participant input, then implement eligibility evaluation, then connect it to a minimal UI, and finally add presentation features. I deliberately did not build everything at once because the interview specifically values iterative AI collaboration and code ownership.
>
> I used AI primarily to propose implementation options, review edge cases, and explain trade-offs. I repeatedly constrained the AI to keep the solution simple. For example, after Vite generated a lot of demo code, I removed the unnecessary starter assets before writing project logic. I also avoided creating all of the architecture folders up front and only introduced modules when a real responsibility appeared.
>
> The first functional iteration implemented parsing and validation. I then reviewed the tests rather than accepting them automatically. I noticed that `toContainEqual()` would still pass if the error array contained unexpected additional errors, so I strengthened the tests with a length assertion as well.
>
> The next iteration implemented the evaluator as an explainable function that returns total points, covered categories, missing categories, eligibility, and ordered failure reasons. During refinement we noticed that the activity lookup Map was being rebuilt for every participant. We changed the batch evaluation so the Map is created once and reused, but deliberately did not introduce repository or service classes because that would have been overengineering.
>
> After the domain logic and tests were stable, I implemented reset before building out the UI. Reset simply replaces the current participant state with a fresh copy of the original data and renders again. That made state restoration deterministic and automatically cleared stale outputs.
>
> In the UI iteration, I kept the interface in plain JavaScript. The UI does not calculate eligibility; it only passes parsed and validated data to the evaluator and renders the result. When AI initially suggested a Delete button on every participant row, I rejected that approach and simplified the interface to one Add Participant Row button and one Delete Participant Row button. The implementation therefore only needs `push()` and `pop()`.
>
> The latest refinement adds eligible and ineligible counts, category progress, and point progress. Those values are derived from the evaluator's result rather than duplicating business rules in the presentation layer. I also used the browser's native progress element instead of building a custom progress component. Overall, AI influenced the solution, but each recommendation was reviewed against the actual problem scope, simplicity, testability, and my ability to explain and modify the code live.

---

# 11. Key Evidence of Iterative AI Collaboration

The strongest examples to show during the interview are:

1. **Starter-project cleanup** — AI-assisted setup was simplified after the user identified unnecessary bloat.
2. **Scoped Iteration 1** — the user explicitly constrained AI to parsing and validation only.
3. **Vitest naming issue** — solved using standard convention rather than extra configuration.
4. **`toContainEqual()` review** — the user questioned AI-generated test semantics and improved the assertions.
5. **Evaluator refinement** — repeated Map construction was identified and improved without adding architecture.
6. **Configuration test** — proved that eligibility thresholds were actually configurable rather than documented only.
7. **Reset-first sequencing** — the user changed the implementation order at a meaningful checkpoint.
8. **Delete UI rejection** — the user rejected AI's per-row delete-button idea and chose a simpler row-level control model.
9. **Progress display** — reused evaluator output and native HTML rather than duplicating business logic or building custom components.

These examples demonstrate that the development process was not "AI generated the application." It was:

```text
AI proposes
    |
    v
User reviews
    |
    v
User questions or constrains
    |
    v
Implementation changes
    |
    v
Tests verify behavior
    |
    v
Next small iteration
```

---

# 12. Current Checkpoint Summary

At the current checkpoint, the application has:

```text
Project setup             DONE
Starter-code cleanup      DONE
Fixed activity data       DONE
Participant sample data   DONE
Parsing                   DONE
Validation                DONE
Validation tests          DONE
Eligibility evaluation    DONE
Evaluator tests           DONE
Evaluator refinement      DONE
Config threshold test     DONE
Reset logic               DONE
Basic one-page UI         DONE
Editable participant rows DONE
Add participant row       DONE
Delete participant row    DONE
Eligible count            CURRENT / IMPLEMENTED NEXT
Ineligible count          CURRENT / IMPLEMENTED NEXT
Category progress         CURRENT / IMPLEMENTED NEXT
Point progress            CURRENT / IMPLEMENTED NEXT
Final visual polish       DEFERRED
```

The most important design principle remains:

> **Simple technology, disciplined architecture, and visible iterative refinement.**

