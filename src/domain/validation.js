export function validateParticipants(participants, activities) {
  const errors = [];

  const validActivityIds = new Set(
    activities.map((activity) => activity.id)
  );

  const seenParticipantIds = new Set();

  for (const participant of participants) {
    if (!participant.id || !participant.name) {
      errors.push({
        code: "INVALID_PARTICIPANT",
        participant: participant.id,
      });

      continue;
    }

    if (seenParticipantIds.has(participant.id)) {
      errors.push({
        code: "DUPLICATE_PARTICIPANT_ID",
        participant: participant.id,
        value: participant.id,
      });
    }

    seenParticipantIds.add(participant.id);

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