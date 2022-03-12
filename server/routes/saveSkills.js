const saveSkills = (db) => async (req, res) => {
  const skill = req.body;
  await db.save("Skills", skill);
  res.send({});
};

module.exports = saveSkills;
