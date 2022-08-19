const { findUserById } = require("../../user");
const { getUserIdFromToken } = require("../../auth");
const { ObjectId } = require("mongodb");

module.exports = (db) => async (req, res) => {
  const token = req.params.token;
  const userId = await getUserIdFromToken(token);
  const user = await findUserById(db, userId);
  const [skillsCatalog, userMeter, clan, clanInvitations, clanMembership] =
    await Promise.all([
      db.find("Skills"),
      db.findOne("UserMeters", { user_id: userId }),
      db.findOne("UserClans", { user_id: userId }).then((userClan) => {
        if (userClan) {
          return db.findOne("Clans", { _id: userClan.clan_id }).then((clan) => {
            if (clan) {
              return db
                .find("UserClanMembers", {
                  clan_id: new ObjectId(clan._id),
                })
                .then((memberships) =>
                  Promise.all(
                    memberships.map((membership) =>
                      db.findOne("Users", { id: membership.member_id })
                    )
                  )
                )
                .then((members) => {
                  return {
                    ...clan,
                    members,
                  };
                });
            }
            return clan;
          });
        }
        return userClan;
      }),
      db.find("UserClanInvitations", {
        invitado_id: userId,
        status: "pending",
      }),
      db
        .findOne("UserClanMembers", { member_id: userId, status: "active" })
        .then((membership) =>
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
    clan,
    meter: {
      status: meterStatus,
    },
    skills_catalog: skillsCatalog,
  });
};
