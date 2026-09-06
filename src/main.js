import "./style.css";

import {
  activities,
  getInitialParticipants,
} from "./data/sampleData.js";

import { parseParticipant } from "./domain/parser.js";
import { validateParticipants } from "./domain/validation.js";
import { evaluateParticipants } from "./domain/evaluator.js";
import { ELIGIBILITY_POLICY } from "./constants.js";
import {
  attachParticipantEventListeners,
  renderParticipants,
  showParticipantNotFound,
} from "./ui/participants.js";
import {
  clearEvaluationOutput,
  renderEvaluationResults,
  renderValidationErrors,
} from "./ui/results.js";

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

      ${renderParticipants(currentParticipants)}

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

function attachEventListeners() {
  attachParticipantEventListeners({
    onAddParticipant: handleAddParticipant,
    onDeleteParticipant: handleDeleteParticipant,
    onParticipantInput: handleParticipantInput,
  });

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

function handleParticipantInput(index, field, value) {
  currentParticipants[index][field] = value;
  clearEvaluationOutput();
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
    return;
  }

  const results = evaluateParticipants(
    parsedParticipants,
    activities,
    ELIGIBILITY_POLICY
  );

  renderEvaluationResults(results);
}

function handleAddParticipant() {
  currentParticipants.push({
    id: "",
    name: "",
    completedActivities: "",
  });

  render();
}

function handleDeleteParticipant(participantId) {
  const participantIndex = participantId
    ? currentParticipants.findIndex(
        (participant) =>
          participant.id.trim() === participantId
      )
    : -1;

  if (participantIndex === -1) {
    showParticipantNotFound();
    return;
  }

  currentParticipants.splice(participantIndex, 1);
  render();
}

function handleLoadSample() {
  currentParticipants = getInitialParticipants();
  render();
  handleEvaluate();
}

render();
