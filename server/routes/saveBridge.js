const { saveBridge } = require("../../bridge");

/**
 * Fired whenever bridge's url changes and we need to save it
 * @param {*} bridge_url
 * @returns
 */
module.exports = (db) => async (req, res) => {
  const bridge_id = req.headers["bridge-id"];
  const { bridge_url } = req.body;
  await saveBridge(db, bridge_id, bridge_url);
  res.send();
};
