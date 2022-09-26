const { findUserById } = require("../../user");

module.exports = (db) => async (req, res) => {
  const userId = req.params.id;
  const user = await findUserById(db, userId);
  if (user) {
    res.send({
      ...user,
      skills: [],
      skills_url: `${process.env.BACKEND_URL}/api/skills/${userId}`,
    });
  } else {
    res.status(404).send({
      user_id: userId,
    });
  }
};
