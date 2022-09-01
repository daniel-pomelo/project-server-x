const { ObjectId } = require("mongodb");
const asyncHandler = require("../routes/asyncHandler");

const URL_JOIN_MEMBERS = "/api/join-members";
const URL_PLAYERS_WITHOUT_MEMBERS = "/api/management/players-without-clan";

module.exports = {
  joinMembers: (app, db) => {
    app.post(URL_JOIN_MEMBERS, asyncHandler(joinMembers(db)));
  },
  playersWithoutClan: (app, db) => {
    app.get(URL_PLAYERS_WITHOUT_MEMBERS, asyncHandler(playersWithoutClan(db)));
  },
};

function joinMembers(db) {
  return async (req, res) => {
    const { clan, members } = req.body;
    await Promise.all(
      members.map((member) => db.joinMemberToClan(member.id, ObjectId(clan.id)))
    );
    res.send({});
  };
}
function playersWithoutClan(db) {
  return async (req, res) => {
    const players = await db.playersWithoutClan();
    res.send({ players });
  };
}
