const { getUserIdFromRequest } = require("../../auth");
const asyncHandler = require("../routes/asyncHandler");

const CLANS_URL = "/api/clans";
const CLANS_INVITE_URL = "/api/clans/invite";
const CLANS_JOIN_URL = "/api/clans/join/:invitationId";
const CLANS_LEAVE_URL = "/api/clans/leave";
const CLANS_MANAGEMENT_URL = "/api/management/clans";

function saveClan(db) {
  return async (req, res) => {
    const userId = await getUserIdFromRequest(req);
    await db.assertUserCreateAClan(userId);
    const clanName = getClanName(req);
    await db.saveUserClan(clanName, userId);
    res.status(200).send({});
  };
}

function getClanName(req) {
  const clanName = req.body.name;
  if (!clanName) {
    throw new Error("Clan name is not valid.");
  }
  return clanName;
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
};
