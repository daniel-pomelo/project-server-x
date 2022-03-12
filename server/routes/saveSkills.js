const saveSkills = (db) => async (req, res) => {
  const skill = req.body;
  console.log("skill: ");
  console.log(skill);
  const skills = await db.save("Skills", skill);
  res.send({ skills });
};

module.exports = saveSkills;
