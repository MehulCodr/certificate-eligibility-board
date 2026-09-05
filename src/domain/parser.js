export function parseParticipant(participant) {
  return {
    id: participant.id.trim(),
    name: participant.name.trim(),

    completedActivities: participant.completedActivities
      .split(",")
      .map((activity) => activity.trim())
      .filter((activity) => activity !== ""),
  };
}