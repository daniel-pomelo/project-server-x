const { timestamp } = require("../../time");
const SystemEvents = require("../SystemEvents");
const assertConquestPointIsFound = require("./common/assertConquestPointIsFound");
const getConquestPoint = require("./common/getConquestPoint");
const updateConquestPoint = require("./common/updateConquestPoint");

//Request:
//<Body>
// - conquer_id: Reference to a Conquest Point to launch
// - bridge_id: Bridge to send spawn conquest point command

function launchConquestPoint(db) {
  return async (req, res) => {
    const { conquer_id, bridge_id } = getLaunchParametersOrFail(req);

    const [conquestPoint, bridge] = await Promise.all([
      getConquestPoint(conquer_id, db),
      getBridge(bridge_id, db),
    ]);

    assertConquestPointIsFound(conquestPoint, req, "LAUNCHING_CONQUEST_POINT");
    assertBridgeIsFound(bridge, req);

    const systemEvents = new SystemEvents();

    const requestResult = await systemEvents.notifyConquestPointLaunched(
      bridge,
      conquestPoint
    );

    //Verify is not already launched

    await updateConquestPoint(db, conquestPoint, {
      status: "launched",
      launched_at: timestamp(),
    });

    await db.save("ConquestPointLaunchings", {
      body: req.body,
      request_result: requestResult.data,
      request_result_status: requestResult.status,
      conquer_point: conquestPoint,
      bridge,
      timestamp: timestamp(),
    });

    res.send({});
  };
}

function assertBridgeIsFound(bridge, req) {
  if (!bridge) {
    const e = new Error("BAD_REQUEST");
    e.context = "LAUNCHING_CONQUERING_POINT";
    e.reason = "Bridge to notify not found.";
    e.payload = {
      body: req.body,
      headers: req.headers,
    };
    throw e;
  }
}

function getBridge(id, db) {
  return db.findOne("Bridges", {
    id,
    enabled: true,
  });
}

function getLaunchParametersOrFail(req) {
  if (!req.body.bridge_id) {
    const e = new Error("BAD_REQUEST");
    e.context = "LAUNCHING_CONQUEST_POINT";
    e.reason = "Missing bridge_id.";
    e.payload = {
      body: req.body,
      headers: req.headers,
    };
    throw e;
  }
  if (!req.body.conquer_id) {
    const e = new Error("BAD_REQUEST");
    e.context = "LAUNCHING_CONQUEST_POINT";
    e.reason = "Missing conquer_id.";
    e.payload = {
      body: req.body,
      headers: req.headers,
    };
    throw e;
  }
  return req.body;
}

module.exports = launchConquestPoint;
