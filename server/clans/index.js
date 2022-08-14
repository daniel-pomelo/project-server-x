const { getUserIdFromRequest } = require("../../auth");
const asyncHandler = require("../routes/asyncHandler");

const CLANS_URL = "/api/clans";

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

module.exports = {
  save(app, db) {
    app.post(CLANS_URL, asyncHandler(saveClan(db)));
  },
};
