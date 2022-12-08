const asyncHandler = require("../routes/asyncHandler");

module.exports = {
  buy: (app, db) => {
    app.post(
      "/api/purchase/respec",
      asyncHandler(async (req, res) => {
        const { user_id, bridge_id } = getParams(req);
        await Promise.all([
          assertUserExists(user_id, db),
          assertBridgeExists(bridge_id, db),
        ]);
        await db.save("UserRespecs", {
          type: "REWARD",
          user_id,
        });
        res.send({
          user_id,
        });
      })
    );
  },
};

const assertUserExists = async (userId, db) => {
  const [user, isDisabled] = await Promise.all([
    db.findOne("Users", { id: userId }),
    db.findOne("DisabledUsers", { user_id: userId }),
  ]);
  if (!user || isDisabled) {
    const e = new Error("BAD_REQUEST");
    e.context = "ACCREDITING_RESPECT";
    e.reason = "USER_NON_FUNCTIONAL";
    e.payload = {
      user_id: userId,
    };
    throw e;
  }
};
const assertBridgeExists = async (bridgeId, db) => {
  const bridge = await db.findOne("Bridges", { id: bridgeId });

  if (!bridge || (bridge && !bridge.enabled)) {
    const e = new Error("BAD_REQUEST");
    e.context = "ACCREDITING_RESPECT";
    e.reason = "BRIDGE_NOT_FOUND";
    e.payload = {
      bridge_id: bridgeId,
    };
    throw e;
  }
};
const getParams = (req) => {
  const { user_id, bridge_id } = req.headers;
  if (!user_id || !bridge_id) {
    const e = new Error("BAD_REQUEST");
    e.context = "ACCREDITING_RESPECT";
    e.reason = "MISSING_PARAMS";
    e.payload = {
      headers: req.headers,
    };
    throw e;
  }
  return { user_id, bridge_id };
};
