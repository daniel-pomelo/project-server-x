const { findUserById } = require("../../user");
const { getUserIdFromToken } = require("../../auth");

module.exports = (db) => async (req, res) => {
  const token = req.params.token;
  const userId = await getUserIdFromToken(token);
  const user = await findUserById(db, userId);
  const [skillsCatalog, userMeter = {}] = await Promise.all([
    db.find("Skills"),
    db.findOne("UserMeters", { user_id: userId }),
  ]);

  if (!user) {
    return res.status(404).send({});
  }
  res.send({
    ...user,
    meter: {
      status: userMeter.status,
    },
    skills_catalog: skillsCatalog,
  });
};
