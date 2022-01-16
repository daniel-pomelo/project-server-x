module.exports = (bridges) => (req, res) => {
  const bridge_id = req.headers["bridge-id"];
  const { bridge_url } = req.body;
  bridges.set(bridge_id, { bridge_id, bridge_url });
  console.log("Body: ", req.body);
  console.log("Bridges: ", Array.from(bridges.values()));
  res.send();
};
