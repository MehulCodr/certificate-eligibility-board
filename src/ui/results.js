import { ELIGIBILITY_POLICY } from "../constants.js";

export function clearEvaluationOutput() {
  document.querySelector("#validation").innerHTML = "";
  document.querySelector("#summary").innerHTML = "";
  document.querySelector("#results").innerHTML = "";
}

export function renderValidationErrors(errors) {
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
          error.value === "" ? '""' : error.value;

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

  document.querySelector("#summary").innerHTML = "";
  document.querySelector("#results").innerHTML = "";
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
              ${result.eligible
                ? "ELIGIBLE"
                : "INELIGIBLE"
              }
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

export function renderEvaluationResults(results) {
  document.querySelector("#validation").innerHTML = "";
  renderSummary(results);
  renderResults(results);
}
