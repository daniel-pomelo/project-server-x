const { getUserIdFromRequest } = require("../../auth");

function saveClan(db) {
  return async (req, res) => {
    const userId = await getUserIdFromRequest(req);
    await assertUserCreateAClan(db, userId);
    const clanName = getClanName(req);
    const clanDescription = getClanDescription(req);
    await db.saveUserClan(clanName, clanDescription, userId);
    res.status(200).send({});
  };
}

async function assertUserCreateAClan(db, userId) {
  const clans = await db.userFunctionalClans(userId);
  if (clans.length > 1) {
    const e = new Error("User reached clan creation limit.");
    e.context = "CREATING_USER_CLAN";
    e.reason = "USER_CLAN_LIMIT";
    e.payload = {
      user_id: userId,
    };
    throw e;
  }
}

function getClanName(req) {
  const clanName = req.body.name;
  if (!clanName) {
    throw new Error("Clan name is required.");
  }
  return clanName;
}
function getClanDescription(req) {
  const clanDescription = req.body.description;
  if (!clanDescription) {
    throw new Error("Clan description is required.");
  }
  return clanDescription;
}
function inviteToMyClan(db) {
  return async (req, res) => {
    const invitadorId = getInvitadorId(req);
    const invitadoId = getInvitadoId(req);
    await db.inviteToClan(invitadorId, invitadoId);
    res.status(201).send({
      master_id: invitadorId,
      disciple_id: invitadoId,
      clan_name: "sarasa",
    });
  };
}
function getInvitadorId(req) {
  return req.headers["master-id"];
}
function getInvitadoId(req) {
  return req.headers["disciple-id"];
}
function joinToClan(db) {
  return async (req, res) => {
    const invitationId = req.params.invitationId;
    const userId = await getUserIdFromRequest(req);
    await db.joinClan(invitationId, userId);
    res.status(200).send({});
  };
}
function leaveToClan(db) {
  return async (req, res) => {
    const userId = await getUserIdFromRequest(req);
    await db.leaveClan(userId);
    res.status(200).send({});
  };
}
function managementClans(db) {
  return async (req, res) => {
    const clans = await db.getClans();
    res.status(200).send({ clans });
  };
}
function getUserInfo(db) {
  return async (req, res) => {
    const { userId } = req.params;
    const clan = await db.getUserClanDetails(userId);
    if (clan) {
      if (clan.members.length < 10) {
        return res.status(404).send({
          user_id: userId,
        });
      }
      return res.status(200).send({
        id: clan.name.toLowerCase(),
        name: clan.name,
        can_invite: true,
        user_id: userId,
      });
    }
    const membership = await db.getClanMembership(userId);
    if (membership) {
      if (membership.members.length < 10) {
        return res.status(404).send({
          user_id: userId,
        });
      }
      return res.status(200).send({
        id: membership.name.toLowerCase(),
        name: membership.name,
        can_invite: false,
        user_id: userId,
      });
    }
    res.status(404).send({
      user_id: userId,
    });
  };
}
function deleteClan(db) {
  return async (req, res) => {
    const id = req.params.id;
    console.log("Clan to delete: ", id);
    await db.deleteClan(id);
    res.send({});
  };
}

module.exports = {
  saveClan,
  inviteToMyClan,
  joinToClan,
  leaveToClan,
  managementClans,
  getUserInfo,
  deleteClan,
};
