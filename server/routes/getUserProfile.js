const { findUserById } = require("../../user");
const { getUserIdFromToken } = require("../../auth");

module.exports = (db) => async (req, res) => {
  const token = req.params.token;
  const userId = await getUserIdFromToken(token);
  const user = await findUserById(db, userId);
  if (!user) {
    return res.status(404).send({});
  }
  const [
    skillsCatalog,
    meterStatus,
    clan,
    clanInvitations,
    clanMembership,
    relationships,
  ] = await Promise.all([
    db.getSkillsCatalog(),
    db.getUserMeterStatus(userId),
    db.getUserClanDetails(userId),
    db.getClanInvitations(userId),
    db.getClanMembership(userId),
    db.getClanRelationships(userId),
  ]);
  res.send({
    ...user,
    clan_invitations: clanInvitations,
    clan_membership: clanMembership,
    clan,
    meter: {
      status: meterStatus,
    },
    skills_catalog: skillsCatalog,
    ...relationships,
  });
};
