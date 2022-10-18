function getConquestPoint(id, db) {
  //ConquestPoints
  // status (initial state: 'inactive', also posibles: conquered, disabled)
  // created_at
  // -> status = 'conquered' => conquered_at
  // -> status = 'disabled' => disabled_at
  // ttl (unit: seconds)
  //
  return db.findOne("ConquestPoints", {
    id,
  });
}

module.exports = getConquestPoint;
