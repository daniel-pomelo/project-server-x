const toggleBridge = (db) => async (req, res) => {
  const bridge = await db.findOne("Bridges", { id: req.params.bridge_id });
  await db.updateOne(
    "Bridges",
    { id: req.params.bridge_id },
    { ...bridge, enabled: !bridge.enabled }
  );
  res.send({});
};

module.exports = toggleBridge;
