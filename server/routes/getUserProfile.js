const { findUserById } = require("../../user");

module.exports = (db, tokens) => async (req, res) => {
  const token = req.params.token;
  const userId = tokens.getUserIdFromToken(token);
  const user = await findUserById(db, userId);
  const skillsCatalog = await db.find("Skills");

  res.send({
    ...user,
    skills_catalog: skillsCatalog,
  });
};
