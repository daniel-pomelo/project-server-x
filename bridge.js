const BRIDGE_COLLECTION_NAME = "Bridges";

async function saveBridge(db, id, url) {
  const bridge = {
    id,
    url,
  };
  await db.updateOne(BRIDGE_COLLECTION_NAME, { id }, bridge);
}

function findBridgeById(db, id) {
  return db.findOne(BRIDGE_COLLECTION_NAME, { id });
}

const assertRequestComesFromBridgeEnabled = async (db, req) => {
  const bridgeId = req["headers"]["bridge-id"];
  const bridge = await db.findOne("Bridges", { id: bridgeId });
  if (!bridge || !bridge.enabled) {
    const e = new Error("BRIDGE_INVALID");
    const payload = {
      headers: req.headers,
    };
    e.kind = "BRIDGE_INVALID";
    e.payload = payload;
    throw e;
  }
  return bridge;
};

module.exports = {
  saveBridge,
  findBridgeById,
  assertRequestComesFromBridgeEnabled,
};
