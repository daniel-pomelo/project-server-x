const { getUserIdFromRequest } = require("../../auth");
const asyncHandler = require("../routes/asyncHandler");

const CLANS_URL = "/api/clans";
const CLANS_INVITE_URL = "/api/clans/invite";

function saveClan(db) {
  return async (req, res) => {
    const userId = await getUserIdFromRequest(req);
    await db.assertUserCreateAClan(userId);
    const clanName = getClanName(req);
    await db.saveUserClan(clanName, userId);
    res.status(201).send({});
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
    await db.inviteToUserClan(invitadorId, invitadoId);
    res.status(201).send({});
  };
}

function getInvitadorId(req) {
  return req.headers["invitador-id"];
}
function getInvitadoId(req) {
  return req.headers["invitado-id"];
}

module.exports = {
  save(app, db) {
    app.post(CLANS_URL, asyncHandler(saveClan(db)));
  },
  sendInvitationToMyClan(app, db) {
    app.post(CLANS_INVITE_URL, asyncHandler(inviteToMyClan(db)));
  },
};
