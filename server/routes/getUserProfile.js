const { findUserById } = require("../../user");

const skills = [
  {
    id: "self-heal",
    name: "Heal",
    description:
      "Reference site about Lorem Ipsum, giving information on its origins, as well as a random Lipsum generator.",
    level_min: 2,
    level_gap: 2,
  },
  {
    id: "ignite",
    name: "Ignite",
    description:
      "Reference site about Lorem Ipsum, giving information on its origins, as well as a random Lipsum generator.",
    level_min: 2,
    level_gap: 3,
  },
  {
    id: "chaining",
    name: "Chaining",
    description:
      "Reference site about Lorem Ipsum, giving information on its origins, as well as a random Lipsum generator.",
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
