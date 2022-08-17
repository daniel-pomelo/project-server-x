const { findUserById } = require("../../user");
const { getUserIdFromToken } = require("../../auth");
const { ObjectId } = require("mongodb");

module.exports = (db) => async (req, res) => {
  const token = req.params.token;
  const userId = await getUserIdFromToken(token);
  const user = await findUserById(db, userId);
  const [skillsCatalog, userMeter, userClan, clanInvitations, clanMembership] =
    await Promise.all([
      db.find("Skills"),
      db.findOne("UserMeters", { user_id: userId }),
      db.findOne("UserClans", { user_id: userId }),
      db.find("UserClanInvitations", {
        invitado_id: userId,
        status: "pending",
      }),
      db.findOne("UserClanMembers", { member_id: userId }).then((membership) =>
        membership
          ? db
              .findOne("Clans", { _id: new ObjectId(membership.clan_id) })
              .then((clan) => {
                return {
                  ...clan,
                  status: membership.status,
                };
              })
          : Promise.resolve()
      ),
    ]);
  // const clan = await db.findOne("Clans", { _id: userClan.clan_id });
  if (!user) {
    return res.status(404).send({});
  }
  const meterStatus = userMeter ? userMeter.status : "pending";

  const clan_invitations = await Promise.all(
    clanInvitations.map(async (clanInvitation) => {
      const clan = await db.findOne("Clans", { _id: clanInvitation.clan_id });
      const invitador = await db.findOne("Users", {
        id: clanInvitation.invitador_id,
      });
      return {
        id: clanInvitation._id,
        invitador: invitador.name,
        clanName: clan.name,
        timestamp: clanInvitation.timestamp,
      };
    })
  );
  res.send({
    ...user,
    clan_invitations,
    clan_membership: clanMembership,
    // clan: {
    //   name: clan.name,
    // },
    meter: {
      status: meterStatus,
    },
    skills_catalog: skillsCatalog,
  });
};
