const { findUserById, getUserStats } = require("../../user");

module.exports = (req, res) => {
  const id = req.params.id;
  findUserById(id)
    .then(async (user) => {
      if (user.isRegistered()) {
        const userStats = await getUserStats(id);
        const userResponse = user.asJSONResponse();
        const { stats } = userResponse;
        res.send({
          ...userResponse,
          health: stats.health,
          mana: stats.mana,
          stats: userStats,
        });
      } else {
        res.status(404).send(user.getLinkToRegister());
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
};
