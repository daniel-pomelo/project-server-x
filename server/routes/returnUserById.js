const { findUserById } = require("../../user");

const returnUserById = (db) => async (req, res) => {
  const userId = req.params.id;
  const user = await findUserById(db, userId);

  if (user) {
    if (user.isDisabled) {
      return res.status(403).send({
        user_id: userId,
      });
    }
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

module.exports = returnUserById;
