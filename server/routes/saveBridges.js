const { saveBridge } = require("../../bridge");

const saveBridges = (db) => async (req, res) => {
  const { id, url, enabled } = req.body;
  await saveBridge(db, id, url, enabled);
  res.send({});
};

module.exports = saveBridges;
