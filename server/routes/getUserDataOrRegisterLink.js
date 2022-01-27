const { findUserById } = require("../../user");

module.exports = (db) => async (req, res) => {
  const userId = req.params.id;
  const bridgeId = req.headers["bridge-id"];
  const user = await findUserById(db, userId);
  if (user) {
    res.send(user);
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
    register_link: "https://project-server-x.herokuapp.com/register/" + id,
  };
}
