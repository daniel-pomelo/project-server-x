const { findUserById, getUserProps } = require("../../user");

module.exports = (req, res) => {
  const id = req.params.id;
  findUserById(id)
    .then(async (user) => {
      if (user.isRegistered()) {
        const props = await getUserProps(id);
        res.send({
          ...user.asJSONResponse(),
          ...props,
        });
      } else {
        res.status(404).send(user.getLinkToRegister());
      }
    })
    .catch((err) => {
      res.status(500).send(err);
    });
};
