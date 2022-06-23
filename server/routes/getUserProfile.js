const { findUserById } = require("../../user");
const { getUserIdFromToken } = require("../../auth");

module.exports = (db) => async (req, res) => {
  const token = req.params.token;
  const userId = await getUserIdFromToken(token);
  const user = await findUserById(db, userId);
  const skillsCatalog = await db.find("Skills");

  res.send({
    ...user,
    skills_catalog: skillsCatalog,
  });
};
