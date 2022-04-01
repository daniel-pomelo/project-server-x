const togglePlayer = (db) => async (req, res) => {
  const found = await db.findOne("DisabledUsers", {
    user_id: req.params.player_id,
  });
  if (!found) {
    await db.save("DisabledUsers", { user_id: req.params.player_id });
  } else {
    await db.deleteOne("DisabledUsers", { user_id: req.params.player_id });
  }
  res.send({});
};

module.exports = togglePlayer;
