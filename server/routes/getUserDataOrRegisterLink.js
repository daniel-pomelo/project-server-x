const { findUserById } = require("../../user");

module.exports = (req, res) => {
  const id = req.params.id;
  findUserById(id)
    .then((user) => {
      if (user.isRegistered()) {
        res.send(user.asJSONResponse());
      } else {
        res.status(404).send(user.getLinkToRegister());
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
};
