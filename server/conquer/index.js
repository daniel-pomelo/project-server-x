// Body:
//  - conquer_id
//  - clan_id
//  - disputers

const { timestamp } = require("../../time");
const asyncHandler = require("../routes/asyncHandler");

module.exports = {
  setPointAsConquered: (app, db) => {
    app.post(
      "/api/conquer",
      asyncHandler(async (req, res) => {
        assertHasRequiredParameters(req);
        const [clan, conquest] = await Promise.all([
          getClan(req, db),
          getConquest(req, db),
        ]);
        await db.save("Conquests", {
          ...req.body,
          timestamp: timestamp(),
        });
        res.send({
          conquest,
          clan,
        });
      })
    );
  },
};

async function getConquest(req, db) {
  const conquest = await db.findOne("Conquests", { id: req.body.conquer_id });
  if (!conquest) {
    const e = new Error("BAD_REQUEST");
    e.context = "CLAN_CONQUERING_POINT";
    e.reason = "Conquest not found.";
    e.payload = {
      body: req.body,
      headers: req.headers,
    };
    throw e;
  }
  return conquest;
}

async function getClan(req, db) {
  const clan = await db.findOne("Clans", {
    name: { $regex: new RegExp(req.body.clan_id, "i") },
  });
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
  return clan;
}

function assertHasRequiredParameters(req) {
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
}
