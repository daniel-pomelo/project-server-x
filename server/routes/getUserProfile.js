const { findUserById } = require("../../user");
const { getUserIdFromToken } = require("../../auth");

const meter = {
  status: "active",
};

module.exports = (db) => async (req, res) => {
  const token = req.params.token;
  const userId = await getUserIdFromToken(db, token);
  console.log("token: ", token);
  console.log("userId: ", userId);
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
    clans,
    respecCount,
    conquers,
  ] = await Promise.all([
    db.getSkillsCatalog(),
    db.getUserClanDetails(userId),
    db.getClanInvitations(userId),
    db.getClanMembership(userId),
    db.getClanRelationships(userId),
    db.getClanInvitationsSent(userId),
    db.getClanList(),
    db.getRespecCount(userId),
    db.getConquerPoints(userId),
  ]);

  const conquests = await db.hasAConquerPoint(
    clan?.name || clanMembership?.name
  );

  res.send({
    ...user,
    clan_invitations: clanInvitations,
    clan_invitations_sent: formatInvitationsSent(clanInvitationsSent),
    clan_membership: clanMembership,
    clan,
    meter,
    skills_catalog: skillsCatalog,
    ...relationships,
    clans,
    respecs: respecCount,
    conquers,
    conquests,
  });
};

function formatInvitationsSent(invitations) {
  return invitations.map((invitation) => {
    return {
      ...invitation,
      status:
        invitation.status === "declined_by_accepting_another_invitation"
          ? "declined"
          : invitation.status,
    };
  });
}
