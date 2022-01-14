const { findAllUser } = require("../../user");

module.exports = (req, res) => findAllUser().then((users) => res.send(users));
