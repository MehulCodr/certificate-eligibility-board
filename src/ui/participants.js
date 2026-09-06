import { parseParticipant } from "../domain/parser.js";

function renderActivityChips(participant) {
  return parseParticipant(participant).completedActivities
    .map(
      (activityId, activityIndex) => `
        <span class="completed-activity-chip">
          <span class="completed-activity-value">${activityId}</span>
          <button
            class="remove-activity-button"
            type="button"
            data-activity-index="${activityIndex}"
            aria-label="Remove ${activityId}"
          >×</button>
        </span>
      `
    )
    .join("");
}

function getActivityIds(activityInput) {
  return [...activityInput.querySelectorAll(
    ".completed-activity-value"
  )].map((chip) => chip.textContent);
}

export function renderParticipants(participants) {
  const rows = participants
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
            <div
              class="completed-activities-input"
              data-participant-index="${index}"
            >
              <div class="completed-activity-chips">
                ${renderActivityChips(participant)}
              </div>

              <div class="add-activity-control">
                <input
                  class="activity-id-input"
                  type="text"
                  placeholder="Activity ID"
                  aria-label="Activity ID to add"
                />
                <button
                  class="add-activity-button"
                  type="button"
                >Add</button>
              </div>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <section id="participants-section">
      <h2>Participants</h2>

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

      <div class="participant-actions">
        <button id="add-participant-button" type="button">
          Add Participant Row
        </button>

        <div class="delete-participant-control">
          <label for="delete-participant-id">
            Delete participant by ID
          </label>

          <div class="delete-participant-input-group">
            <input
              id="delete-participant-id"
              type="text"
              placeholder="Participant ID"
            />

            <button id="delete-participant-button" type="button">
              Delete Participant
            </button>
          </div>

          <span
            id="delete-participant-feedback"
            role="status"
            aria-live="polite"
          ></span>
        </div>
      </div>
    </section>
  `;
}

export function attachParticipantEventListeners({
  onAddParticipant,
  onCompletedActivitiesChange,
  onDeleteParticipant,
  onParticipantInput,
}) {
  const section = document.querySelector(
    "#participants-section"
  );

  section.addEventListener("input", (event) => {
    if (event.target.matches("input[data-index]")) {
      onParticipantInput(
        Number(event.target.dataset.index),
        event.target.dataset.field,
        event.target.value
      );
    }
  });

  section.addEventListener("click", (event) => {
    if (event.target.matches("#add-participant-button")) {
      onAddParticipant();
      return;
    }

    if (event.target.matches("#delete-participant-button")) {
      onDeleteParticipant(
        section.querySelector("#delete-participant-id")
          .value.trim()
      );
      return;
    }

    const activityInput = event.target.closest(
      ".completed-activities-input"
    );

    if (!activityInput) return;

    const participantIndex = Number(
      activityInput.dataset.participantIndex
    );
    const activityIds = getActivityIds(activityInput);

    if (event.target.matches(".add-activity-button")) {
      const activityId = activityInput.querySelector(
        ".activity-id-input"
      ).value.trim();

      if (!activityId) return;
      activityIds.push(activityId);
    } else if (event.target.matches(
      ".remove-activity-button"
    )) {
      activityIds.splice(
        Number(event.target.dataset.activityIndex),
        1
      );
    } else {
      return;
    }

    onCompletedActivitiesChange(
      participantIndex,
      activityIds.join(", ")
    );
  });
}

export function showParticipantNotFound() {
  const feedback = document.querySelector(
    "#delete-participant-feedback"
  );

  feedback.textContent = "Participant does not exist";

  setTimeout(() => {
    feedback.textContent = "";
  }, 1000);
}
