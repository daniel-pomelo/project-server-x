function filterExMembers(memberships) {
  const results = new Map();
  const resultsToReturn = new Map();
  for (const membership of memberships) {
    if (!results.get(membership.member_id)) {
      results.set(membership.member_id, membership.version);
      resultsToReturn.set(membership.member_id, membership);
    } else {
      const lastVersion = results.get(membership.member_id);
      if (membership.version > lastVersion) {
        resultsToReturn.set(membership.member_id, membership);
      }
    }
  }
  const a = Array.from(resultsToReturn.values());
  return a.filter((member) => member.status !== "brokeup");
}

module.exports = filterExMembers;
