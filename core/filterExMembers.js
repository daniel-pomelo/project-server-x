function filterExMembers(memberships) {
  const resultsToReturn = new Map();
  for (const membership of memberships) {
    resultsToReturn.set(membership.member_id, membership);
  }
  const a = Array.from(resultsToReturn.values());
  return a.filter((member) => member.status !== "brokeup");
}

module.exports = filterExMembers;
