const { findUserById, getUserStats } = require("../../user");
const InMemoryDataBase = require("../../InMemoryDataBase");
const MongoDataBase = require("../../MongoDataBase");

module.exports = (req, res) => {
  const id = req.params.id;
  findUserById(id)
    .then(async (user) => {
      if (isRegistered(user)) {
        const userStats = await getUserStats(id);
        const userResponse = asJSONResponse(user);
        const { stats } = userResponse;
        res.send({
          ...userResponse,
          health: stats.health,
          mana: stats.mana,
          stats: userStats,
        });
      } else {
        const db =
          process.env.ENV_NAME === "dev"
            ? InMemoryDataBase.init()
            : MongoDataBase.init();
        const bridgeId = req.headers["bridge-id"];
        await db.save("RegisterAttempts", {
          userId: id,
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
