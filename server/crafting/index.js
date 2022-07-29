const assertBridgeIsEnabled = require("../routes/assertBridgeIsEnabled");
const asyncHandler = require("../routes/asyncHandler");
const pickUpUserMaterials = require("../routes/pickUpUserMaterials");
const { timestamp } = require("../../time");
const { UserMaterials } = require("../../core/UserMaterials");

const DEFAULT_RESPONSE = {};
const URL_PICK_UP = "/api/pickup";
const URL_FIND_USER_MATERIALS = "/api/users/:id/materials";

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

  user_materials: (app, db) => {
    app.get(URL_FIND_USER_MATERIALS, async (req, res) => {
      const user_id = req.params.id;
      const materials = await db.find("UserMaterials", { user_id });
      res.send(UserMaterials.from(materials));
    });
  },
};
