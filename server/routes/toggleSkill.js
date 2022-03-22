const toggleSkill = (db) => async (req, res) => {
  const skill = await db.findOne("Skills", { id: req.params.skill_id });
  await db.updateOne(
    "Skills",
    { id: req.params.skill_id },
    { ...skill, enabled: !skill.enabled }
  );
  res.send({});
};

module.exports = toggleSkill;
