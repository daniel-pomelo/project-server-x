const { findUserById, getUserStats } = require("../../user");

module.exports = (db) => (req, res) => {
  const userId = req.params.id;
  findUserById(db, userId)
    .then(async (user) => {
      if (isRegistered(user)) {
        const userStats = await getUserStats(db, userId);
        const userResponse = asJSONResponse(user);
        const { stats } = userResponse;
        res.send({
          ...userResponse,
          health: stats.health,
          mana: stats.mana,
          stats: userStats,
        });
      } else {
        const bridgeId = req.headers["bridge-id"];
        await db.save("RegisterAttempts", {
          userId,
          bridgeId,
        });
        res.status(404).send(getLinkToRegister(id));
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });
};

function asJSONResponse(user) {
  return user;
}
function isRegistered(user) {
  return !!user;
}
function getLinkToRegister(id) {
  return {
    register_link: "https://project-server-x.herokuapp.com/register/" + id,
  };
}
