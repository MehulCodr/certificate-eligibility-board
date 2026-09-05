export function validateParticipants(participants, activities) {
  const errors = [];

  const validActivityIds = new Set(
    activities.map((activity) => activity.id)
  );

  const seenParticipantIds = new Set();

  for (const participant of participants) {
    // Validate participant ID
    if (!participant.id) {
      errors.push({
        code: "INVALID_PARTICIPANT",
        participant: participant.id,
        value: participant.id,
      });
    }

    // Validate participant name
    if (!participant.name) {
      errors.push({
        code: "INVALID_PARTICIPANT",
        participant: participant.id,
        value: participant.name,
      });
    }

    // Only check duplicate IDs when the ID itself is valid
    if (participant.id) {
      if (seenParticipantIds.has(participant.id)) {
        errors.push({
          code: "DUPLICATE_PARTICIPANT_ID",
          participant: participant.id,
          value: participant.id,
        });
      }

      seenParticipantIds.add(participant.id);
    }

    const seenActivities = new Set();

    for (const activityId of participant.completedActivities) {
      if (!validActivityIds.has(activityId)) {
        errors.push({
          code: "UNKNOWN_ACTIVITY",
          participant: participant.id,
          value: activityId,
        });
      }

      if (seenActivities.has(activityId)) {
        errors.push({
          code: "DUPLICATE_PARTICIPATION",
          participant: participant.id,
          value: activityId,
        });
      }

      seenActivities.add(activityId);
    }
  }

  return errors;
}