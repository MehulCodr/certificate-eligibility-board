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
    <section>
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

        <input
          id="delete-participant-id"
          type="text"
          placeholder="Participant ID to delete"
          aria-label="Participant ID to delete"
        />

        <button id="delete-participant-button" type="button">
          Delete Participant Row
        </button>

        <span
          id="delete-participant-feedback"
          role="status"
          aria-live="polite"
        ></span>
      </div>
    </section>
  `;
}

export function attachParticipantEventListeners({
  onAddParticipant,
  onDeleteParticipant,
  onParticipantInput,
}) {
  document
    .querySelector("#add-participant-button")
    .addEventListener("click", onAddParticipant);

  document
    .querySelector("#delete-participant-button")
    .addEventListener("click", () => {
      const participantId = document
        .querySelector("#delete-participant-id")
        .value.trim();

      onDeleteParticipant(participantId);
    });

  const inputs = document.querySelectorAll(
    "#app input[data-index]"
  );

  for (const input of inputs) {
    input.addEventListener("input", (event) => {
      const index = Number(event.target.dataset.index);
      const field = event.target.dataset.field;

      onParticipantInput(
        index,
        field,
        event.target.value
      );
    });
  }
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
