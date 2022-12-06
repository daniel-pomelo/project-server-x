const { getUserIdFromToken } = require("../../auth");
const { forceMeterUpdate } = require("../../forceMeterUpdate");
const { timestamp } = require("../../time");
const { findUserById } = require("../../user");

const EMPTY_RESPONSE = {};

const updateUserSkills = (db, systemEvents) => async (req, res) => {
  const token = req.params.token;
  const userId = await getUserIdFromToken(db, token);
  const user = await findUserById(db, userId);
  const { skills } = req.body;
  const { skill_points } = user;

  if (skill_points <= 0) {
    throw new Error("Insufficient points");
  }

  await db.saveUserSkillPointsWithdrawal(skill_points, userId, timestamp());
  await db.saveUserSkills(skills, userId, timestamp());

  res.send(EMPTY_RESPONSE);

  await forceMeterUpdate(userId, db, "UPDATING_USER_SKILLS");
};

module.exports = updateUserSkills;
