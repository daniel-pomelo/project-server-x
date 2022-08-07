const asyncHandler = require("../routes/asyncHandler");

const DEFAULT_STATS_URL = "/api/stats";

module.exports = {
  readDefaultStats: async (app, db) => {
    app.get(
      DEFAULT_STATS_URL,
      asyncHandler(async (req, res) => {
        const stats = await db.getDefaultStats();
        res.send({ stats });
      })
    );
  },
  updateDefaultStats: async (app, db) => {
    app.post(
      DEFAULT_STATS_URL,
      asyncHandler(async (req, res) => {
        await db.updateDefaultStats(parseUpdateDefaultStats(req.body));
        res.send({});
      })
    );
  },
};

function parseUpdateDefaultStats(requestbody) {
  return {
    strength: parseInt(requestbody.strength),
    fortitude: parseInt(requestbody.fortitude),
    intelligence: parseInt(requestbody.intelligence),
    will: parseInt(requestbody.will),
    perception: parseInt(requestbody.perception),
    agility: parseInt(requestbody.agility),
    endurance: parseInt(requestbody.endurance),
    absorption: parseInt(requestbody.absorption),
  };
}
