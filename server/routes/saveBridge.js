const { saveBridge } = require("../../bridge");

module.exports = (req, res) => {
  const bridge_id = req.headers["bridge-id"];
  const { bridge_url } = req.body;
  saveBridge(bridge_id, bridge_url);
  res.send();
};
