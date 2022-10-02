const { findUserById } = require("../../user");
const { getUserIdFromToken } = require("../../auth");

const meter = {
  status: "active",
};

module.exports = (db) => async (req, res) => {
  const token = req.params.token;
  const userId = await getUserIdFromToken(token);
  const user = await findUserById(db, userId);
  if (!user) {
    return res.status(404).send({});
  }
  const [
    skillsCatalog,
    clan,
    clanInvitations,
    clanMembership,
    relationships,
    clanInvitationsSent,
  ] = await Promise.all([
    db.getSkillsCatalog(),
    db.getUserClanDetails(userId),
    db.getClanInvitations(userId),
    db.getClanMembership(userId),
    db.getClanRelationships(userId),
    db.getClanInvitationsSent(userId),
  ]);
  res.send({
    ...user,
    clan_invitations: clanInvitations,
    clan_invitations_sent: clanInvitationsSent,
    clan_membership: clanMembership,
    clan,
    meter,
    skills_catalog: skillsCatalog,
    ...relationships,
  });
};
