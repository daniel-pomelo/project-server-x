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
  if (!bridge) {
    const e = new Error("BRIDGE_INVALID");
    e.context = "MAKING_SURE_A_REQUEST_IS_FROM_ENABLED_BRIDGE";
    e.reason = "BRIDGE_NOT_FOUND";
    e.payload = {
      headers: req.headers,
      query: { id: bridgeId },
    };
    throw e;
  }
  if (!bridge.enabled) {
    const e = new Error("BRIDGE_INVALID");
    e.context = "MAKING_SURE_A_REQUEST_IS_FROM_ENABLED_BRIDGE";
    e.reason = "BRIDGE_DISABLED";
    e.payload = {
      headers: req.headers,
      query: { id: bridgeId },
    };
    throw e;
  }
  return bridge;
};

module.exports = {
  saveBridge,
  findBridgeById,
  assertRequestComesFromBridgeEnabled,
};
