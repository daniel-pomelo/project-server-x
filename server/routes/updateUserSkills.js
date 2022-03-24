const { timestamp } = require("../../time");
const { findUserById } = require("../../user");

const updateUserSkills = (db, tokens) => async (req, res) => {
  const token = req.params.token;
  const userId = tokens.getUserIdFromToken(token);
  const user = await findUserById(db, userId);
  const { skills } = req.body;

  if (user.skill_points <= 0) {
    throw new Error("Insufficient points");
  }

  await db.save("UserSkillPoints", {
    type: "USER_POINTS_WITHDRAWAL",
    points: user.skill_points,
    user_id: userId,
    timestamp: timestamp(),
  });
  await db.save("UserSkills", {
    skills,
    user_id: userId,
    timestamp: timestamp(),
  });

  res.send({});
};

module.exports = updateUserSkills;
