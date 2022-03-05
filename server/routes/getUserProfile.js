const { findUserById } = require("../../user");

const skills = [
  {
    id: "heal",
    name: "Heal",
    description: "Some description...",
    level_min: 2,
    level_gap: 2,
  },
  {
    id: "ignite",
    name: "Ignite",
    description: "Some description...",
    level_min: 2,
    level_gap: 3,
  },
  {
    id: "chaining",
    name: "Chaining",
    description: "Some description...",
    level_min: 2,
    level_gap: 2,
  },
];

module.exports = (db, tokens) => async (req, res) => {
  const token = req.params.token;
  const userId = tokens.getUserIdFromToken(token);
  const user = await findUserById(db, userId);

  res.send({ ...user, skills });
};
