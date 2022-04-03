const { findUserById } = require("../../user");

const BACKEND_URL = process.env.BACKEND_URL;

module.exports = (db) => async (req, res) => {
  const userId = req.params.id;
  const bridgeId = req.headers["bridge-id"];
  const user = await findUserById(db, userId);
  if (user) {
    res.send({
      ...user,
      skills: [],
      skills_url: `${process.env.BACKEND_URL}/api/skills/${userId}`,
    });
  } else {
    db.save("RegisterAttempts", {
      userId,
      bridgeId,
    });
    res.status(404).send(getLinkToRegister(userId));
  }
};

function getLinkToRegister(id) {
  return {
    register_link: `${process.env.BACKEND_URL}/register/${id}`,
  };
}
