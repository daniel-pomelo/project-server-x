const { timestamp } = require("../../time");
const assertConquestPointIsFound = require("./common/assertConquestPointIsFound");
const getConquestPoint = require("./common/getConquestPoint");
const updateConquestPoint = require("./common/updateConquestPoint");

//Request:
//<Body>
// - conquer_id: Reference to a Conquest Point to launch
// - clan_id: Clan that conquer the Conquest Point
// - disputers: Array of clan's that dispute the Conquest Point

function conquerConquestPoint(db) {
  return async (req, res) => {
    getConquerParametersOrFail(req);

    const [clan, conquestPoint] = await Promise.all([
      getClan(req.body.clan_id, db),
      getConquestPoint(req.body.conquer_id, db),
    ]);

    assertClanIsFound(clan, req);
    assertConquestPointIsFound(conquestPoint, req, "CONQUERING_CONQUEST_POINT");

    await db.save("Conquests", {
      clan_id: req.body.clan_id,
      conquer_id: req.body.conquer_id,
      disputers: req.body.disputers,
      timestamp: timestamp(),
    });
    await updateConquestPoint(db, conquestPoint, {
      status: "conquered",
      conquered_by: clan.name,
      conquered_at: timestamp(),
    });
    res.send({});
  };
}

function getClan(name, db) {
  return db.findOne("Clans", {
    name,
  });
}

function getConquerParametersOrFail(req) {
  if (!req.body.clan_id) {
    const e = new Error("BAD_REQUEST");
    e.context = "CLAN_CONQUERING_POINT";
    e.reason = "Missing clan_id.";
    e.payload = {
      body: req.body,
      headers: req.headers,
    };
    throw e;
  }
  if (!req.body.conquer_id) {
    const e = new Error("BAD_REQUEST");
    e.context = "CLAN_CONQUERING_POINT";
    e.reason = "Missing conquer_id.";
    e.payload = {
      body: req.body,
      headers: req.headers,
    };
    throw e;
  }
  if (!Array.isArray(req.body.disputers)) {
    const e = new Error("BAD_REQUEST");
    e.context = "CLAN_CONQUERING_POINT";
    e.reason = "Missing disputers.";
    e.payload = {
      body: req.body,
      headers: req.headers,
    };
    throw e;
  }
}

function assertClanIsFound(clan, req) {
  if (!clan) {
    const e = new Error("BAD_REQUEST");
    e.context = "CLAN_CONQUERING_POINT";
    e.reason = "Clan not found.";
    e.payload = {
      body: req.body,
      headers: req.headers,
    };
    throw e;
  }
}

module.exports = conquerConquestPoint;
