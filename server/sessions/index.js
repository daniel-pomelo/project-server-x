module.exports = {
  listActives(app, db) {
    app.get("/api/sessions", async (req, res) => {
      const sessions = await db.find("Sessions", {
        expired: false,
      });
      res.send({ sessions });
    });
  },
};
