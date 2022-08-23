const { findUserById } = require("../../user");
const { getUserIdFromToken } = require("../../auth");

module.exports = (db) => async (req, res) => {
  const token = req.params.token;
  const userId = await getUserIdFromToken(token);
  const user = await findUserById(db, userId);
  if (!user) {
    return res.status(404).send({});
  }
  const [skillsCatalog, meterStatus, clan, clanInvitations, clanMembership] =
    await Promise.all([
      db.getSkillsCatalog(),
      db.getUserMeterStatus(userId),
      db.getUserClanDetails(userId),
      db.getClanInvitations(userId),
      db.getClanMembership(userId),
    ]);
  const plan = {
    name: "free",
  };
  res.send({
    ...user,
    plan,
    clan_invitations: clanInvitations,
    clan_membership: clanMembership,
    clan,
    meter: {
      status: meterStatus,
    },
    skills_catalog: skillsCatalog,
  });
};
