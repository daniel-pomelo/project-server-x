const saveSkills = (db) => async (req, res) => {
  const { id } = req.params;
  await db.deleteOne("Skills", { id });
  res.send({});
};

module.exports = saveSkills;
