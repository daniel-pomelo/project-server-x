const saveSkills = (db) => async (req, res) => {
  const skill = req.body;
  const found = await db.findOne("Skills", { id: skill.id });

  if (found) {
    await db.updateOne("Skills", { id: skill.id }, skill);
  } else {
    await db.save("Skills", skill);
  }

  res.send({});
};

module.exports = saveSkills;
