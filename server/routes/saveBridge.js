const { saveBridge } = require("../../bridge");

module.exports = (db) => (req, res) => {
  const bridge_id = req.headers["bridge-id"];
  const { bridge_url } = req.body;
  console.log("body: ", req.body);
  console.log("headers: ", req.headers);
  saveBridge(db, bridge_id, bridge_url);
  res.send();
};
