function updateConquestPoint(db, conquestPoint, updatedConquestPoint) {
  return db.updateOne(
    "ConquestPoints",
    {
      id: conquestPoint.id,
    },
    updatedConquestPoint,
    false
  );
}

module.exports = updateConquestPoint;
