const asyncHandler = require("../routes/asyncHandler");

const READ_DEFAULT_STATS_URL = "/api/stats";

module.exports = {
  readDefaultStats: async (app, db) => {
    app.get(
      READ_DEFAULT_STATS_URL,
      asyncHandler(async (req, res) => {
        const stats = await db.getDefaultStats();
        res.send({ stats });
      })
    );
  },
};
