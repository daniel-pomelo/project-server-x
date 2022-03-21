const BRIDGE_COLLECTION_NAME = "Bridges";

async function saveBridge(db, id, url, enabled = 0) {
  const bridge = {
    id,
    url,
    enabled,
  };
  await db.updateOne(BRIDGE_COLLECTION_NAME, { id }, bridge);
}

function findBridgeById(db, id) {
  return db.findOne(BRIDGE_COLLECTION_NAME, { id });
}

module.exports = {
  saveBridge,
  findBridgeById,
};
