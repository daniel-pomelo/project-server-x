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

module.exports = {
  saveBridge,
  findBridgeById,
};
