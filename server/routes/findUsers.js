const { findAllUser } = require("../../user");

module.exports = (db) => (req, res) =>
  findAllUser(db).then((users) => res.send(users));
