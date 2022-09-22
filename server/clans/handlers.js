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
    res.status(201).send({});
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
    const clanId = req.body._id;
    await db.leaveClan(clanId, userId);
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
      return res.status(200).send({
        id: clan.name.toLowerCase(),
        name: clan.name,
        status:
          clan.status === "inactive" ? 0 : clan.status === "active" ? 1 : -1,
        can_invite: true,
      });
    }
    const membership = await db.getClanMembership(userId);
    if (membership) {
      return res.status(200).send({
        id: membership.name.toLowerCase(),
        name: membership.name,
        status:
          membership.status === "inactive"
            ? 0
            : membership.status === "active"
            ? 1
            : -1,
        can_invite: false,
      });
    }
    res.status(404).send({});
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
