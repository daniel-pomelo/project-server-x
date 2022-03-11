const getSkills = (db) => async (req, res) => {
  const skills = await db.find("Skills");
  res.send({ skills });
};

module.exports = getSkills;
