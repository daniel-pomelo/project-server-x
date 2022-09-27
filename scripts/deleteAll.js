module.exports = function deleteAll(db, collectionName) {
  return db.client.db("ProjectX").collection(collectionName).deleteMany({});
};
