const asyncHandler = require("../routes/asyncHandler");

module.exports = {
  getClansPageInfo: (app, db) => {
    app.get("/api/pages/clans", async (req, res) => {
      const clans = await db.getClans();
      res.send({ clans });
    });
  },
  getConquestPointPageInfo: (app, db) => {
    app.get(
      "/api/pages/conquest-points",
      asyncHandler(async (req, res) => {
        const launchings = await db.find("ConquestPointLaunchings");
        const points = await db.find("ConquestPoints").then((conquests) => {
          return conquests.map((conquest) => {
            const launched_at = new Date(conquest.launched_at);
            const expires_at = launched_at.setSeconds(
              launched_at.getSeconds() + conquest.ttl
            );
            return {
              ...conquest,
              isExpired: new Date().getTime() >= new Date(expires_at),
              expires_at,
              now: new Date().getTime(),
            };
          });
        });
        res.send({
          points,
          launchings,
        });
      })
    );
  },
};
