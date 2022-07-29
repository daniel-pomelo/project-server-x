const assertBridgeIsEnabled = require("../routes/assertBridgeIsEnabled");
const asyncHandler = require("../routes/asyncHandler");
const pickUpUserMaterials = require("../routes/pickUpUserMaterials");
const { timestamp } = require("../../time");

const URL_PICK_UP = "/api/pickup";
const DEFAULT_RESPONSE = {};

module.exports = {
  pickup: (app, db) => {
    app.post(
      URL_PICK_UP,
      asyncHandler(assertBridgeIsEnabled(db)),
      asyncHandler(async (req, res) => {
        //read from request's body
        const { material, user_id } = req.body;
        //represent pick up material by user
        const userPickUpMaterial = pickUpUserMaterials(
          material,
          user_id,
          timestamp()
        );
        //save it
        await db.saveUserPickUpMaterial(userPickUpMaterial);
        //respond OK to request
        res.send(DEFAULT_RESPONSE);
      })
    );
  },
};
