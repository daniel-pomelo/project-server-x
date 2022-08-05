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

const assertRequestComesFromBridgeEnabled = async (db, bridgeId) => {
  const bridge = await db.findOne("Bridges", { id: bridgeId });
  if (!bridge || !bridge.enabled) {
    throw new Error("Bridge invalid");
  }
  return bridge;
};

module.exports = {
  saveBridge,
  findBridgeById,
  assertRequestComesFromBridgeEnabled,
};
