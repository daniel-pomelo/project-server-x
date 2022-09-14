module.exports = {
  getClansPageInfo: (app, db) => {
    app.get("/api/pages/clans", async (req, res) => {
      const clans = await db.getClans();
      res.send({ clans });
    });
  },
};
