const listBridges = (db) => async (req, res) => {
  const bridges = await db.find("Bridges");
  res.send({
    bridges,
  });
};

module.exports = listBridges;
