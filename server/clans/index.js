const { getUserIdFromRequest } = require("../../auth");
const asyncHandler = require("../routes/asyncHandler");

const CLANS_URL = "/api/clans";
const CLANS_INVITE_URL = "/api/clans/invite";
const CLANS_JOIN_URL = "/api/clans/join/:invitationId";
const CLANS_LEAVE_URL = "/api/clans/leave";
const CLANS_MANAGEMENT_URL = "/api/management/clans";
const CLANS_USER_INFO_URL = "/api/users/:userId/clans";

function saveClan(db) {
  return async (req, res) => {
    const userId = await getUserIdFromRequest(req);
    await db.assertUserCreateAClan(userId);
    const clanName = getClanName(req);
    const clanDescription = getClanDescription(req);
    await db.saveUserClan(clanName, clanDescription, userId);
    res.status(200).send({});
  };
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

module.exports = {
  save(app, db) {
    app.post(CLANS_URL, asyncHandler(saveClan(db)));
  },
  sendInvitationToMyClan(app, db) {
    app.post(CLANS_INVITE_URL, asyncHandler(inviteToMyClan(db)));
  },
  join(app, db) {
    app.post(CLANS_JOIN_URL, asyncHandler(joinToClan(db)));
  },
  leave(app, db) {
    app.post(CLANS_LEAVE_URL, asyncHandler(leaveToClan(db)));
  },
  management(app, db) {
    app.get(CLANS_MANAGEMENT_URL, asyncHandler(managementClans(db)));
  },
  userInfo(app, db) {
    app.get(CLANS_USER_INFO_URL, asyncHandler(getUserInfo(db)));
  },
};
