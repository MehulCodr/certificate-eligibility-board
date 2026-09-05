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
      <h1>Certificate Eligibility Board</h1>

      <section>
        <h2>Activities</h2>
        ${renderActivities()}
      </section>

      <section>
        <h2>Participants</h2>
        ${renderParticipants()}
      </section>

      <div class="actions">
        <button id="evaluate-button">Evaluate</button>
        <button id="reset-button">Reset</button>
      </div>

      <div id="validation"></div>
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

  for (const input of inputs) {
    input.addEventListener("input", (event) => {
      const index = Number(event.target.dataset.index);
      const field = event.target.dataset.field;

      currentParticipants[index][field] =
        event.target.value;
    });
  }

  document
    .querySelector("#evaluate-button")
    .addEventListener("click", handleEvaluate);

  document
    .querySelector("#reset-button")
    .addEventListener("click", handleReset);
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

    document.querySelector("#results").innerHTML = "";

    return;
  }

  const results = evaluateParticipants(
    parsedParticipants,
    activities,
    ELIGIBILITY_POLICY
  );

  document.querySelector("#validation").innerHTML = "";

  renderResults(results);
}

function renderValidationErrors(errors) {
  const messages = errors
    .map((error) => {
      let message = error.code;

      if (error.participant) {
        message += ` | Participant: ${error.participant}`;
      }

      if (error.value) {
        message += ` | Value: ${error.value}`;
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

function renderResults(results) {
  const rows = results
    .map(
      (result) => `
        <tr>
          <td>${result.participantId}</td>
          <td>${result.totalPoints}</td>
          <td>${result.coveredCategories.join(", ")}</td>
          <td>${result.eligible ? "ELIGIBLE" : "INELIGIBLE"}</td>
          <td>
            ${
              result.reasons.length > 0
                ? result.reasons.join(", ")
                : "-"
            }
          </td>
        </tr>
      `
    )
    .join("");

  document.querySelector("#results").innerHTML = `
    <h2>Results</h2>

    <table>
      <thead>
        <tr>
          <th>Participant</th>
          <th>Points</th>
          <th>Categories</th>
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


render();