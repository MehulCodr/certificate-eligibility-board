import "./style.css";

import {
  activities,
  getInitialParticipants,
} from "./data/sampleData.js";

import { parseParticipant } from "./domain/parser.js";
import { validateParticipants } from "./domain/validation.js";
import { evaluateParticipants } from "./domain/evaluator.js";
import { ELIGIBILITY_POLICY } from "./constants.js";

let currentParticipants = getInitialParticipants();

function render() {
  document.querySelector("#app").innerHTML = `
    <main>
      <div class="page-header">
      <h1>Certificate Eligibility Board</h1>
      <p>
        Evaluate certificate eligibility using activity
        categories and total points.
      </p>
      </div>

      <section>
        <h2>Activities</h2>
        ${renderActivities()}
      </section>

    <section>
        <h2>Participants</h2>

        ${renderParticipants()}

        <div class="participant-actions">
          <button id="add-participant-button" type="button">
            Add Participant Row
          </button>

          <button id="delete-participant-button" type="button">
            Delete Participant Row
          </button>
        </div>
    </section>

      <div class="actions">
      <button id="sample-button">
      Load & Evaluate Sample
      </button>

      <button id="evaluate-button">Evaluate</button>
      <button id="reset-button">Reset</button>
    </div>

      <div id="validation"></div>
      <div id="summary"></div>
      <div id="results"></div>
    </main>
  `;

  attachEventListeners();
}

function renderActivities() {
  const rows = activities
    .map(
      (activity) => `
        <tr>
          <td>${activity.id}</td>
          <td>${activity.name}</td>
          <td>${activity.category}</td>
          <td>${activity.points}</td>
        </tr>
      `
    )
    .join("");

  return `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Activity</th>
          <th>Category</th>
          <th>Points</th>
        </tr>
      </thead>

      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function renderParticipants() {
  const rows = currentParticipants
    .map(
      (participant, index) => `
        <tr>
          <td>
            <input
              data-index="${index}"
              data-field="id"
              value="${participant.id}"
            />
          </td>

          <td>
            <input
              data-index="${index}"
              data-field="name"
              value="${participant.name}"
            />
          </td>

          <td>
            <input
              data-index="${index}"
              data-field="completedActivities"
              value="${participant.completedActivities}"
            />
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <table>
      <thead>
        <tr>
          <th>Participant ID</th>
          <th>Name</th>
          <th>Completed Activities</th>
        </tr>
      </thead>

      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}


function attachEventListeners() {
  const inputs = document.querySelectorAll(
    "#app input[data-index]"
  );
  document
    .querySelector("#add-participant-button")
    .addEventListener("click", handleAddParticipant);

  document
    .querySelector("#delete-participant-button")
    .addEventListener("click", handleDeleteParticipant);

  for (const input of inputs) {
    input.addEventListener("input", (event) => {
      const index = Number(event.target.dataset.index);
      const field = event.target.dataset.field;

      currentParticipants[index][field] =
        event.target.value;

      clearEvaluationOutput();
    });
  }

  document
    .querySelector("#sample-button")
    .addEventListener("click", handleLoadSample);

  document
    .querySelector("#evaluate-button")
    .addEventListener("click", handleEvaluate);

  document
    .querySelector("#reset-button")
    .addEventListener("click", handleReset);
}

function clearEvaluationOutput() {
  document.querySelector("#validation").innerHTML = "";
  document.querySelector("#summary").innerHTML = "";
  document.querySelector("#results").innerHTML = "";
}


function handleReset() {
  currentParticipants = getInitialParticipants();
  render();
}


function handleEvaluate() {
  const parsedParticipants =
    currentParticipants.map(parseParticipant);

  const errors = validateParticipants(
    parsedParticipants,
    activities
  );

  if (errors.length > 0) {
    renderValidationErrors(errors);

    document.querySelector("#summary").innerHTML = "";
    document.querySelector("#results").innerHTML = "";

    return;
  }

  const results = evaluateParticipants(
    parsedParticipants,
    activities,
    ELIGIBILITY_POLICY
  );

  document.querySelector("#validation").innerHTML = "";

  renderSummary(results);
  renderResults(results);
}

function renderValidationErrors(errors) {
  const messages = errors
    .map((error) => {
      let message = error.code;

      if ("participant" in error) {
        const participant =
          error.participant === ""
            ? '""'
            : error.participant;

        message += ` | Participant: ${participant}`;
      }

      if ("value" in error) {
        const value =
          error.value === ""
            ? '""'
            : error.value;

        message += ` | Value: ${value}`;
      }

      return `<li>${message}</li>`;
    })
    .join("");

  document.querySelector("#validation").innerHTML = `
    <h3>Validation Errors</h3>
    <ul>
      ${messages}
    </ul>
  `;
}

function renderCategoryProgress(coveredCategorySet) {
  const requiredCategories =
    ELIGIBILITY_POLICY.requiredCategories;

  const segments = requiredCategories
    .map((category) => {
      const isCovered = coveredCategorySet.has(category);

      return `
        <span
          class="category-segment ${isCovered
            ? "category-segment-covered"
            : ""
          }"
          title="${category}: ${isCovered
            ? "covered"
            : "missing"
          }"
          aria-hidden="true"
        >
          ${category}
        </span>
      `;
    })
    .join("");

  const coveredCount = requiredCategories.filter(
    (category) => coveredCategorySet.has(category)
  ).length;

  return `
    <div
      class="category-progress-strip"
      role="img"
      style="--category-count: ${requiredCategories.length}"
      aria-label="${coveredCount} of ${requiredCategories.length} required categories covered"
    >
      ${segments}
    </div>
  `;
}

function renderResults(results) {
  const rows = results
    .map((result) => {
      const requiredCategoryCount =
        ELIGIBILITY_POLICY.requiredCategories.length;

      const coveredCategorySet = new Set(
        result.coveredCategories
      );

      const categoryCount =
        ELIGIBILITY_POLICY.requiredCategories.filter(
          (category) => coveredCategorySet.has(category)
        ).length;

      const minimumPoints =
        ELIGIBILITY_POLICY.minimumPoints;

      return `
        <tr>
          <td>${result.participantId}</td>

          <td>
            ${categoryCount} / ${requiredCategoryCount}
            ${renderCategoryProgress(
              coveredCategorySet
            )}
          </td>

          <td>
            ${result.totalPoints} / ${minimumPoints}
            <br>

            <progress
              value="${Math.min(
        result.totalPoints,
        minimumPoints
      )}"
              max="${minimumPoints}"
            ></progress>
          </td>

          <td>
            <span class="status-badge ${result.eligible
          ? "status-eligible"
          : "status-ineligible"
        }">
            ${result.eligible ? "ELIGIBLE" : "INELIGIBLE"}
            </span>
          </td>

          <td>
            <span class="reason-text">
              ${result.reasons.length > 0
              ? result.reasons.join(", ")
              : "—"
              }
            </span>
          </td>
        </tr>
      `;
    })
    .join("");

  document.querySelector("#results").innerHTML = `
    <h2>Results</h2>

    <table>
      <thead>
        <tr>
          <th>Participant</th>
          <th>Category Progress</th>
          <th>Point Progress</th>
          <th>Status</th>
          <th>Reasons</th>
        </tr>
      </thead>

      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}


function handleAddParticipant() {
  currentParticipants.push({
    id: "",
    name: "",
    completedActivities: "",
  });

  render();
}
function handleDeleteParticipant() {
  if (currentParticipants.length === 0) {
    return;
  }

  currentParticipants.pop();

  render();
}

function renderSummary(results) {
  const eligibleCount = results.filter(
    (result) => result.eligible
  ).length;

  const ineligibleCount =
    results.length - eligibleCount;

  document.querySelector("#summary").innerHTML = `
    <div class="summary">
      <div>
        <strong>Eligible:</strong>
        ${eligibleCount}
      </div>

      <div>
        <strong>Ineligible:</strong>
        ${ineligibleCount}
      </div>
    </div>
  `;
}

function handleLoadSample() {
  currentParticipants = getInitialParticipants();

  render();

  handleEvaluate();
}

render();
