export function evaluateParticipant(participant, activityMap, policy) {
  let totalPoints = 0;
  const coveredCategories = new Set();

  for (const activityId of participant.completedActivities) {
    const activity = activityMap.get(activityId);

    totalPoints += activity.points;
    coveredCategories.add(activity.category);
  }

  const missingCategories = policy.requiredCategories.filter(
    (category) => !coveredCategories.has(category)
  );

  const meetsPointThreshold =
    totalPoints >= policy.minimumPoints;

  const eligible =
    missingCategories.length === 0 &&
    meetsPointThreshold;

  const reasons = [];

  for (const category of missingCategories) {
    reasons.push(`MISSING_CATEGORY: ${category}`);
  }

  if (!meetsPointThreshold) {
    reasons.push(`POINTS_BELOW_${policy.minimumPoints}`);
  }

  return {
    participantId: participant.id,
    totalPoints,
    coveredCategories: [...coveredCategories],
    missingCategories,
    meetsPointThreshold,
    eligible,
    reasons,
  };
}

export function evaluateParticipants(participants, activities, policy) {
  const activityMap = new Map(
    activities.map((activity) => [activity.id, activity])
  );

  const results = participants.map((participant) =>
    evaluateParticipant(participant, activityMap, policy)
  );

  return results.sort((a, b) => {
    if (a.eligible !== b.eligible) {
      return a.eligible ? -1 : 1;
    }

    return a.participantId.localeCompare(b.participantId);
  });
}