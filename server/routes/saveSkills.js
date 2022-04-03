const saveSkills = (db) => async (req, res) => {
  const skill = req.body;
  await db.updateOne("Skills", { id: skill.id }, skill);
  res.send({});
};

module.exports = saveSkills;
